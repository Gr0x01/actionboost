/**
 * Agentic Pipeline - Dynamic Tool-Calling Strategy Generation
 *
 * Single Claude call with flexible tools that fetches data as needed.
 * Produces data-backed strategies with real market research.
 */

import Anthropic from '@anthropic-ai/sdk'
import { tavily } from '@tavily/core'
import type { RunInput, ResearchContext, UserHistoryContext } from './types'
import { trackApiCall, calculateApiCost } from '@/lib/analytics'

// DO NOT CHANGE without explicit approval
const MODEL = 'claude-opus-4-5-20251101'
const MAX_TOKENS = 12000
const MAX_ITERATIONS = 10        // Max loop iterations (API calls to Claude)
const MAX_TOTAL_TOOL_CALLS = 25  // Hard cap on total tool calls per run
const MAX_PARALLEL_TOOLS = 5     // Concurrent tool execution limit
const TOOL_TIMEOUT = 15000

// =============================================================================
// TYPES
// =============================================================================

/**
 * Structured research data captured from tool calls
 * Used by formatter to extract insights for the dashboard
 */
export type ResearchData = {
  searches: Array<{
    query: string
    results: Array<{ title: string; url: string; snippet: string }>
  }>
  seoMetrics: Array<{
    domain: string
    traffic: number | null
    keywords: number | null
    topPositions?: { pos1: number; pos2_3: number; pos4_10: number }
  }>
  keywordGaps: Array<{
    competitor: string
    keywords: Array<{ keyword: string; volume: number; competitorRank: number }>
  }>
  scrapes: Array<{
    url: string
    contentSummary: string
  }>
  screenshots?: Array<{
    url: string
  }>
}

export type AgenticResult = {
  success: boolean
  output?: string
  toolCalls?: string[]
  researchData?: ResearchData
  timing?: {
    total: number
    tools: number
    generation: number
  }
  error?: string
}

type StageCallback = (stage: string) => Promise<void>

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search',
    description: `Web search via Tavily. Search ANYWHERE on the web for market intelligence, discussions, reviews, trends, news.

Use site: prefix to target specific sources:
- Communities: reddit.com, news.ycombinator.com, quora.com, indiehackers.com, twitter.com, linkedin.com
- Reviews: g2.com, capterra.com, trustpilot.com, producthunt.com, alternativeto.net
- Marketplaces: etsy.com, amazon.com, ebay.com, gumroad.com, appsumo.com
- News/Blogs: techcrunch.com, medium.com, substack.com, forbes.com
- Video: youtube.com (for comments/discussions)
- Niche: Any industry-specific forum, community, or publication

Or search without site: for broad results. Be creative - search for:
- "[product] complaints" or "[product] frustrations"
- "[competitor] vs [competitor]" comparisons
- "[industry] trends 2025" or "[topic] best practices"
- "[persona] workflow" or "how [persona] finds [solution]"
- "[competitor] pricing" or "[product] alternatives"`,
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query. Use site: prefix to target specific sources, or search broadly.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'scrape',
    description: `Scrape full content from any URL. Use when search results show a promising page and you need more detail. Good for competitor pages, specific forum threads, product listings.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'Full URL to scrape',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'seo',
    description: `Get SEO metrics for any domain: estimated traffic, keyword count, top ranking keywords. Use for competitor analysis or understanding user's current position.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        domain: {
          type: 'string',
          description: 'Domain to analyze (e.g., "competitor.com")',
        },
      },
      required: ['domain'],
    },
  },
  {
    name: 'keyword_gaps',
    description: `Find keywords a competitor ranks for that the user doesn't. Only works if user provided their website URL.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        competitor_domain: {
          type: 'string',
          description: 'Competitor domain to compare against',
        },
      },
      required: ['competitor_domain'],
    },
  },
  {
    name: 'screenshot',
    description: `Screenshot any homepage to see what visitors actually see—visual layout, above-the-fold content, trust signals, CTAs, design quality. Use on the user's site and competitor sites to compare visual positioning.`,
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'Full URL to screenshot (e.g., "https://example.com")',
        },
      },
      required: ['url'],
    },
  },
]

// =============================================================================
// TOOL EXECUTION
// =============================================================================

type ToolInput = {
  query?: string
  url?: string
  domain?: string
  competitor_domain?: string
}

/**
 * Structured result from tool execution - contains both the string result
 * shown to the LLM and structured data for the dashboard
 */
type ToolResult = {
  text: string
  imageContent?: Anthropic.ToolResultBlockParam['content']
  data?:
    | { type: 'search'; query: string; results: Array<{ title: string; url: string; snippet: string }> }
    | { type: 'seo'; domain: string; traffic: number | null; keywords: number | null; topPositions?: { pos1: number; pos2_3: number; pos4_10: number } }
    | { type: 'keyword_gaps'; competitor: string; keywords: Array<{ keyword: string; volume: number; competitorRank: number }> }
    | { type: 'scrape'; url: string; contentSummary: string }
    | { type: 'screenshot'; url: string }
}

/**
 * Execute a promise with timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, operation: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${operation} timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

/**
 * Validate URL is safe to scrape (prevent SSRF)
 */
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    // Block internal IPs and localhost
    const hostname = parsed.hostname.toLowerCase()

    // IPv4 internal ranges
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false
    }

    // IPv6 internal ranges
    if (
      hostname === '[::1]' ||
      hostname.startsWith('[::ffff:127.') ||
      hostname.startsWith('[::ffff:10.') ||
      hostname.startsWith('[::ffff:192.168.') ||
      hostname.startsWith('[fd') ||  // fd00::/8 private
      hostname.startsWith('[fe80:') || // link-local
      hostname.startsWith('[fc') // fc00::/7 unique local
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Sanitize domain for API calls
 */
function sanitizeDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

/**
 * Context for tool execution - includes tracking info
 */
type ToolContext = {
  userDomain?: string
  runId?: string
  userId?: string
}

async function executeTool(
  name: string,
  input: ToolInput,
  context: ToolContext
): Promise<ToolResult> {
  try {
    switch (name) {
      case 'search':
        if (!input.query || typeof input.query !== 'string') {
          return { text: 'Error: query is required for search' }
        }
        if (input.query.length > 500) {
          return { text: 'Error: query too long (max 500 characters)' }
        }
        return await executeSearch(input.query, context)
      case 'scrape':
        if (!input.url || typeof input.url !== 'string') {
          return { text: 'Error: url is required for scrape' }
        }
        if (!isAllowedUrl(input.url)) {
          return { text: 'Error: URL not allowed (must be public http/https URL)' }
        }
        return await executeScrape(input.url, context)
      case 'seo':
        if (!input.domain || typeof input.domain !== 'string') {
          return { text: 'Error: domain is required for seo' }
        }
        return await executeSEO(input.domain, context)
      case 'keyword_gaps':
        if (!input.competitor_domain || typeof input.competitor_domain !== 'string') {
          return { text: 'Error: competitor_domain is required for keyword_gaps' }
        }
        return await executeKeywordGaps(input.competitor_domain, context.userDomain, context)
      case 'screenshot':
        if (!input.url || typeof input.url !== 'string') {
          return { text: 'Error: url is required for screenshot' }
        }
        if (!isAllowedUrl(input.url)) {
          return { text: 'Error: URL not allowed (must be public http/https URL)' }
        }
        return await executeScreenshot(input.url, context)
      default:
        return { text: `Unknown tool: ${name}` }
    }
  } catch (err) {
    return { text: `Error: ${err instanceof Error ? err.message : String(err)}` }
  }
}

async function executeSearch(query: string, context: ToolContext): Promise<ToolResult> {
  const tvly = tavily({ apiKey: process.env.TAVILY_API! })
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined

  try {
    const response = await withTimeout(
      tvly.search(query, {
        searchDepth: 'advanced',
        maxResults: 8,
        includeRawContent: false,
      }),
      TOOL_TIMEOUT,
      'Search'
    )

    success = true

    if (!response.results?.length) {
      return { text: 'No results found.' }
    }

    // Build structured data for dashboard
    const structuredResults = response.results.map(r => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.content?.slice(0, 300) || '',
    }))

    // Build text for LLM
    const text = response.results
      .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.content?.slice(0, 300)}...`)
      .join('\n\n')

    return {
      text,
      data: {
        type: 'search',
        query,
        results: structuredResults,
      },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    // Track API call (fire-and-forget)
    const distinctId = context.userId || context.runId || 'anonymous'
    trackApiCall(distinctId, {
      service: 'tavily',
      endpoint: 'search',
      run_id: context.runId,
      latency_ms: Date.now() - startTime,
      success,
      error: errorMsg,
      estimated_cost_usd: calculateApiCost('tavily', 'search'),
    })
  }
}

async function executeScrape(url: string, context: ToolContext): Promise<ToolResult> {
  const apiKey = process.env.SCRAPINGDOG_API_KEY
  const distinctId = context.userId || context.runId || 'anonymous'

  if (!apiKey) {
    // Fallback to Tavily extract if no ScrapingDog key
    const tvly = tavily({ apiKey: process.env.TAVILY_API! })
    const startTime = Date.now()
    let success = false
    let errorMsg: string | undefined

    try {
      const response = await withTimeout(
        tvly.extract([url]),
        TOOL_TIMEOUT,
        'Scrape (Tavily)'
      )
      success = true
      if (response.results?.[0]?.rawContent) {
        const content = response.results[0].rawContent.slice(0, 5000)
        return {
          text: content,
          data: {
            type: 'scrape',
            url,
            contentSummary: content.slice(0, 500),
          },
        }
      }
      return { text: 'Could not extract content from URL.' }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err)
      return { text: 'Could not scrape URL.' }
    } finally {
      // Track Tavily extract API call
      trackApiCall(distinctId, {
        service: 'tavily',
        endpoint: 'extract',
        run_id: context.runId,
        latency_ms: Date.now() - startTime,
        success,
        error: errorMsg,
        estimated_cost_usd: calculateApiCost('tavily', 'extract'),
      })
    }
  }

  // ScrapingDog path
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined

  try {
    const encodedUrl = encodeURIComponent(url)
    const response = await withTimeout(
      fetch(
        `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodedUrl}&dynamic=false`
      ),
      TOOL_TIMEOUT,
      'Scrape (ScrapingDog)'
    )

    if (!response.ok) {
      errorMsg = `HTTP ${response.status}`
      return { text: `Scrape failed: HTTP ${response.status}` }
    }

    success = true
    const rawText = await response.text()

    // Basic HTML to text conversion
    const cleaned = rawText
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)

    if (!cleaned) {
      return { text: 'No content extracted.' }
    }

    return {
      text: cleaned,
      data: {
        type: 'scrape',
        url,
        contentSummary: cleaned.slice(0, 500),
      },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    // Track ScrapingDog API call
    trackApiCall(distinctId, {
      service: 'scrapingdog',
      endpoint: 'scrape',
      run_id: context.runId,
      latency_ms: Date.now() - startTime,
      success,
      error: errorMsg,
      estimated_cost_usd: calculateApiCost('scrapingdog', 'scrape'),
    })
  }
}

async function executeSEO(domain: string, context: ToolContext): Promise<ToolResult> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    return { text: 'SEO data not available (DataForSEO not configured).' }
  }

  const distinctId = context.userId || context.runId || 'anonymous'
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined

  const credentials = Buffer.from(`${login}:${password}`).toString('base64')
  const cleanDomain = sanitizeDomain(domain)

  try {
    const response = await withTimeout(
      fetch(
        'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              target: cleanDomain,
              location_code: 2840,
              language_code: 'en',
            },
          ]),
        }
      ),
      TOOL_TIMEOUT,
      'SEO lookup'
    )

    if (!response.ok) {
      errorMsg = `HTTP ${response.status}`
      return { text: `SEO lookup failed: HTTP ${response.status}` }
    }

    success = true
    const data = await response.json()
    // API returns: tasks[0].result[0].items[0].metrics.organic
    const metrics = data?.tasks?.[0]?.result?.[0]?.items?.[0]?.metrics?.organic

    if (!metrics) {
      // Still return data structure with nulls so it's captured in research data
      return {
        text: `No SEO data found for ${cleanDomain}. This could mean the domain is new or has minimal organic presence.`,
        data: {
          type: 'seo',
          domain: cleanDomain,
          traffic: null,
          keywords: null,
        },
      }
    }

    const text = `SEO Metrics for ${cleanDomain}:
- Estimated Organic Traffic: ~${metrics.etv?.toLocaleString() || 'N/A'} monthly visits
- Organic Keywords: ${metrics.count?.toLocaleString() || 'N/A'} ranking keywords
- Keyword Positions: ${metrics.pos_1 || 0} in #1, ${metrics.pos_2_3 || 0} in #2-3, ${metrics.pos_4_10 || 0} in #4-10`

    return {
      text,
      data: {
        type: 'seo',
        domain: cleanDomain,
        traffic: metrics.etv || null,
        keywords: metrics.count || null,
        topPositions: {
          pos1: metrics.pos_1 || 0,
          pos2_3: metrics.pos_2_3 || 0,
          pos4_10: metrics.pos_4_10 || 0,
        },
      },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    // Track DataForSEO API call
    trackApiCall(distinctId, {
      service: 'dataforseo',
      endpoint: 'domain_rank_overview',
      run_id: context.runId,
      latency_ms: Date.now() - startTime,
      success,
      error: errorMsg,
      estimated_cost_usd: calculateApiCost('dataforseo', 'domain_rank_overview'),
    })
  }
}

async function executeKeywordGaps(
  competitorDomain: string,
  userDomain: string | undefined,
  context: ToolContext
): Promise<ToolResult> {
  if (!userDomain) {
    return { text: 'Cannot analyze keyword gaps - user did not provide their website URL.' }
  }

  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    return { text: 'Keyword gap analysis not available (DataForSEO not configured).' }
  }

  const distinctId = context.userId || context.runId || 'anonymous'
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined

  const credentials = Buffer.from(`${login}:${password}`).toString('base64')
  const cleanCompetitor = sanitizeDomain(competitorDomain)
  const cleanUser = sanitizeDomain(userDomain)

  try {
    const response = await withTimeout(
      fetch(
        'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_intersection/live',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              target1: cleanCompetitor,
              target2: cleanUser,
              intersections: false, // Keywords competitor has, user doesn't
              location_code: 2840,
              language_code: 'en',
              limit: 20,
              order_by: ['keyword_data.keyword_info.search_volume,desc'],
            },
          ]),
        }
      ),
      TOOL_TIMEOUT,
      'Keyword gap analysis'
    )

    if (!response.ok) {
      errorMsg = `HTTP ${response.status}`
      return { text: `Keyword gap analysis failed: HTTP ${response.status}` }
    }

    success = true
    const data = await response.json()
    const items = data?.tasks?.[0]?.result?.[0]?.items || []

    if (!items.length) {
      return { text: `No keyword gaps found between ${cleanCompetitor} and ${cleanUser}. This could mean both domains are new or target very different keywords.` }
    }

    type GapItem = {
      keyword_data?: {
        keyword?: string
        keyword_info?: { search_volume?: number }
      }
      first_domain_serp_element?: {
        serp_item?: { rank_absolute?: number }
      }
    }

    // Build structured data for dashboard
    const structuredKeywords = items.slice(0, 15).map((item: GapItem) => ({
      keyword: item.keyword_data?.keyword || '',
      volume: item.keyword_data?.keyword_info?.search_volume || 0,
      competitorRank: item.first_domain_serp_element?.serp_item?.rank_absolute || 0,
    }))

    // Build text for LLM
    const gaps = items.slice(0, 15).map((item: GapItem) => {
      const kw = item.keyword_data?.keyword || '?'
      const vol = item.keyword_data?.keyword_info?.search_volume || 0
      const pos = item.first_domain_serp_element?.serp_item?.rank_absolute || '?'
      return `- "${kw}" (${vol.toLocaleString()} searches/mo) - ${cleanCompetitor} ranks #${pos}`
    })

    return {
      text: `Keyword Gaps (${cleanCompetitor} ranks, you don't):\n${gaps.join('\n')}`,
      data: {
        type: 'keyword_gaps',
        competitor: cleanCompetitor,
        keywords: structuredKeywords,
      },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    // Track DataForSEO API call
    trackApiCall(distinctId, {
      service: 'dataforseo',
      endpoint: 'domain_intersection',
      run_id: context.runId,
      latency_ms: Date.now() - startTime,
      success,
      error: errorMsg,
      estimated_cost_usd: calculateApiCost('dataforseo', 'domain_intersection'),
    })
  }
}

async function executeScreenshot(url: string, context: ToolContext): Promise<ToolResult> {
  const ssUrl = process.env.SCREENSHOT_SERVICE_URL
  const ssKey = process.env.SCREENSHOT_API_KEY

  if (!ssUrl || !ssKey) {
    return { text: 'Screenshot service not configured.' }
  }

  const distinctId = context.userId || context.runId || 'anonymous'
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined

  try {
    const response = await fetch(
      `${ssUrl}/screenshot?url=${encodeURIComponent(url)}&width=1280&height=800`,
      {
        headers: { 'x-api-key': ssKey },
        signal: AbortSignal.timeout(20000),
      }
    )

    if (!response.ok) {
      errorMsg = `HTTP ${response.status}`
      return { text: `Could not capture screenshot: HTTP ${response.status}` }
    }

    const contentType = response.headers.get('content-type') || ''
    const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
    const mediaType = contentType.split(';')[0].trim()
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType as typeof ALLOWED_MEDIA_TYPES[number])) {
      return { text: `Screenshot returned unsupported image type: ${mediaType || contentType}` }
    }

    const contentLength = parseInt(response.headers.get('content-length') || '0', 10)
    if (contentLength > 10 * 1024 * 1024) {
      return { text: `Screenshot too large (${contentLength} bytes)` }
    }

    success = true
    const base64 = Buffer.from(await response.arrayBuffer()).toString('base64')

    return {
      text: `Homepage screenshot of ${url}`,
      imageContent: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as typeof ALLOWED_MEDIA_TYPES[number],
            data: base64,
          },
        },
        {
          type: 'text',
          text: `Homepage screenshot of ${url}`,
        },
      ],
      data: { type: 'screenshot', url },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    return { text: `Could not capture screenshot of ${url}: ${errorMsg}` }
  } finally {
    trackApiCall(distinctId, {
      service: 'screenshot',
      endpoint: 'screenshot',
      run_id: context.runId,
      latency_ms: Date.now() - startTime,
      success,
      error: errorMsg,
      estimated_cost_usd: 0,
    })
  }
}

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

function buildSystemPrompt(userHistory?: UserHistoryContext | null): string {
  const historySection = userHistory && userHistory.totalRuns > 0
    ? `
## Returning User

This is their ${userHistory.totalRuns + 1}th strategy. Build on what you know:
${userHistory.previousTraction.map(t => `- ${t.date}: ${t.summary}`).join('\n') || 'No traction history'}

Previous tactics: ${userHistory.tacticsTried.slice(0, 5).join('; ') || 'None recorded'}

Your past recommendations (evolve, don't repeat): ${userHistory.pastRecommendations.slice(0, 3).join('; ') || 'None'}
`
    : ''

  return `You're a senior marketing analyst. A client just hired you for a week of dedicated research to build them a growth strategy.

You have access to real data:
- Search the entire web for discussions, reviews, trends, news, competitor intel
- Read any page in full when you need deeper context
- Look up traffic and keyword rankings for any domain
- Compare keyword positions between competing domains
- Screenshot any homepage to see what visitors actually see (visual layout, above-the-fold content, trust signals)

The client will see your strategy alongside the data you gathered—competitive traffic comparisons, keyword opportunities, market quotes, and your key discoveries. Empty data sections signal shallow research. Do the work.

## Your Approach

When the client provides competitor URLs, investigate them—you want to know their traffic, what keywords drive it, and where the gaps are. When they mention a market, understand it. When they describe a problem, find how others have solved it.

A good analyst doesn't wait to be told what to research. You see the inputs, you know what data would make the strategy stronger, you go get it.

${historySection}

## Your Deliverable

After your research, write the full strategy:
- Executive Summary (2-3 paragraphs)
- Your Situation (AARRR analysis)
- Your SEO Landscape (if you gathered SEO data)
- Market Sentiment (if you found relevant discussions)
- Competitive Landscape
- Key Discoveries (novel insights that don't fit above—hidden competitors, risks, behavioral patterns, opportunities, surprising finds)
- Channel Strategy (table + explanations)
- Stop Doing (3-5 items)
- Start Doing (5-8 with ICE scores: Impact + Confidence + Ease, each 1-10)
- Week 1 through Week 4 (each with 7-day action table: Day | Action | Time | Success Metric)
- Metrics Dashboard (AARRR metrics table)
- Content Templates (2-3 ready-to-use)
- Diagnostic Scores

## Diagnostic Scoring (REQUIRED)
After the strategy, score the business on 4 categories, 0-100 each:

| Category | What It Measures | Framework |
|----------|-----------------|-----------|
| **Clarity** | Can people immediately understand what you do, who it's for, and why you? | Dunford positioning, Ries/Trout |
| **Visibility** | Can the target audience actually find them? | Sharp's mental/physical availability |
| **Proof** | Do they have evidence that builds trust? | Cialdini social proof, Keller brand equity |
| **Advantage** | What makes them defensibly different from alternatives? | Ritson competitive strategy |

Calibration:
- 90-100: Exceptional
- 70-89: Solid
- 50-69: Needs work
- 0-49: Significant problems

**Hard rule**: Every score must cite specific evidence. Overall = weighted average. Be honest — most early-stage businesses score 30-55.

Output as a "## Scores" section with this JSON block:

\`\`\`json
{
  "overall": [0-100],
  "clarity": [0-100],
  "visibility": [0-100],
  "proof": [0-100],
  "advantage": [0-100]
}
\`\`\`

**Clarity** ([score]/100): [1-sentence evidence]
**Visibility** ([score]/100): [1-sentence evidence]
**Proof** ([score]/100): [1-sentence evidence]
**Advantage** ([score]/100): [1-sentence evidence]

No emojis. Be direct. Challenge flawed assumptions. Say "unknown" rather than guessing metrics.`
}

// =============================================================================
// USER MESSAGE BUILDER
// =============================================================================

function buildUserMessage(input: RunInput, priorContext?: string | null): string {
  const focusLabel =
    input.focusArea === 'custom' && input.customFocusArea
      ? `Custom: ${input.customFocusArea}`
      : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  let message = `# Growth Strategy Request

## Focus Area
**${focusLabel}**

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}

## What I've Tried & How It's Going
${input.tacticsAndResults || 'Not specified'}
`

  if (input.websiteUrl) {
    message += `\n## My Website\n${input.websiteUrl}\n`
  }

  if (input.competitorUrls?.length) {
    message += `\n## Competitors\n${input.competitorUrls.join('\n')}\n`
  }

  if (input.analyticsSummary) {
    message += `\n## Analytics Summary\n${input.analyticsSummary}\n`
  }

  if (input.constraints) {
    message += `\n## Constraints\n${input.constraints}\n`
  }

  // Add prior context if user upgraded from free audit
  if (priorContext) {
    message += `\n---\n\n${priorContext}\n`
  }

  return message
}

// =============================================================================
// HUMAN-READABLE TOOL DESCRIPTIONS
// =============================================================================

function describeToolCall(name: string, input: ToolInput): string {
  switch (name) {
    case 'search':
      if (input.query?.includes('site:reddit.com')) return 'Searching Reddit discussions...'
      if (input.query?.includes('site:etsy.com')) return 'Searching Etsy listings...'
      if (input.query?.includes('site:g2.com')) return 'Searching G2 reviews...'
      if (input.query?.includes('site:producthunt.com')) return 'Searching ProductHunt...'
      return 'Researching market data...'
    case 'scrape':
      if (input.url?.includes('reddit.com')) return 'Reading Reddit thread...'
      if (input.url?.includes('etsy.com')) return 'Analyzing Etsy listing...'
      return 'Reading page content...'
    case 'seo':
      return `Checking SEO for ${input.domain}...`
    case 'keyword_gaps':
      return `Analyzing keyword gaps vs ${input.competitor_domain}...`
    case 'screenshot':
      return `Capturing screenshot of ${input.url}...`
    default:
      return 'Processing...'
  }
}

// =============================================================================
// AGENTIC GENERATION
// =============================================================================

/**
 * Run agentic strategy generation with dynamic tool calling
 *
 * @param input - User's run input
 * @param userHistory - Optional user history for returning users
 * @param onStageUpdate - Callback for progress updates
 * @param runId - Run ID for tracking
 * @param userId - User ID for tracking
 */
export async function generateAgenticStrategy(
  input: RunInput,
  userHistory?: UserHistoryContext | null,
  onStageUpdate?: StageCallback,
  runId?: string,
  userId?: string,
  priorContext?: string | null
): Promise<AgenticResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const toolCalls: string[] = []
  let totalToolTime = 0

  // Accumulate structured research data from tool calls
  const researchData: ResearchData = {
    searches: [],
    seoMetrics: [],
    keywordGaps: [],
    scrapes: [],
    screenshots: [] as Array<{ url: string }>,
  }

  const updateStage = async (stage: string) => {
    if (onStageUpdate) {
      await onStageUpdate(stage)
    }
  }

  // Context for tool execution (includes tracking info)
  const context: ToolContext = {
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    runId,
    userId,
  }

  // Tracking distinctId
  const distinctId = userId || runId || 'anonymous'

  // Build messages (include prior context if upgrading from free audit)
  const systemPrompt = buildSystemPrompt(userHistory)
  const userMessage = buildUserMessage(input, priorContext)
  let messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }]

  const startTime = Date.now()
  let iterations = 0

  await updateStage('Analyzing your situation...')

  // Track phases for more descriptive stage messages
  let hasStartedResearch = false
  let researchBatchCount = 0

  // +2 allows for: initial analysis turn + final output turn (beyond tool iterations)
  while (iterations < MAX_ITERATIONS + 2) {
    iterations++

    // Track Anthropic API call
    const apiStartTime = Date.now()

    let response: Anthropic.Message
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      })

      // Track successful Anthropic call
      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: runId,
        latency_ms: Date.now() - apiStartTime,
        success: true,
        input_tokens: response.usage?.input_tokens,
        output_tokens: response.usage?.output_tokens,
        model: MODEL,
        estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
        }),
      })
    } catch (err) {
      // Track failed Anthropic call
      const apiError = err instanceof Error ? err.message : String(err)
      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: runId,
        latency_ms: Date.now() - apiStartTime,
        success: false,
        error: apiError,
        model: MODEL,
        estimated_cost_usd: 0,
      })
      throw err
    }

    // Check if we're done (no more tool calls)
    if (response.stop_reason === 'end_turn') {
      // Show final stage message before returning
      if (hasStartedResearch) {
        await updateStage('Building your 30-day roadmap...')
      }

      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: {
          total,
          tools: totalToolTime,
          generation: total - totalToolTime,
        },
      }
    }

    // Process tool calls
    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use')

    // Check if we've hit the hard cap on total tool calls
    if (toolCalls.length >= MAX_TOTAL_TOOL_CALLS) {
      console.log(`[Agentic] Hit MAX_TOTAL_TOOL_CALLS (${MAX_TOTAL_TOOL_CALLS}), forcing final output`)

      // Must provide tool_result for every tool_use in the response before continuing
      const pendingToolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks
        .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
        .map((block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: 'Research budget exceeded. Please complete the strategy with the data you have.',
        }))

      // Add current response with tool results, then ask Claude to complete
      // Combine tool_results with text instruction in single user message
      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        {
          role: 'user',
          content: [
            ...pendingToolResults,
            {
              type: 'text' as const,
              text: `You've gathered enough research data. Now write the complete strategy document. Do not request any more tools - use the data you have.`,
            },
          ],
        },
      ]

      // One final call WITHOUT tools to force strategy generation
      const finalApiStartTime = Date.now()
      let finalResponse: Anthropic.Message
      try {
        finalResponse = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages,
          // No tools - force text completion
        })

        // Track successful final Anthropic API call
        trackApiCall(distinctId, {
          service: 'anthropic',
          endpoint: 'messages.create',
          run_id: runId,
          latency_ms: Date.now() - finalApiStartTime,
          success: true,
          input_tokens: finalResponse.usage?.input_tokens,
          output_tokens: finalResponse.usage?.output_tokens,
          model: MODEL,
          estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
            inputTokens: finalResponse.usage?.input_tokens,
            outputTokens: finalResponse.usage?.output_tokens,
          }),
        })
      } catch (err) {
        // Track failed final Anthropic API call
        const finalApiError = err instanceof Error ? err.message : String(err)
        trackApiCall(distinctId, {
          service: 'anthropic',
          endpoint: 'messages.create',
          run_id: runId,
          latency_ms: Date.now() - finalApiStartTime,
          success: false,
          error: finalApiError,
          model: MODEL,
          estimated_cost_usd: 0,
        })
        throw err
      }

      const textBlock = finalResponse.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      console.log(`[Agentic] Completed with ${toolCalls.length} tool calls (forced final output)`)

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: {
          total,
          tools: totalToolTime,
          generation: total - totalToolTime,
        },
      }
    }

    if (toolUseBlocks.length === 0) {
      // No tool calls and not end_turn - extract any text we have
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: {
          total,
          tools: totalToolTime,
          generation: total - totalToolTime,
        },
      }
    }

    // Update stage with first tool description
    const firstTool = toolUseBlocks[0]
    if (firstTool && firstTool.type === 'tool_use') {
      // First tool call - indicate we're starting research
      if (!hasStartedResearch) {
        hasStartedResearch = true
        await updateStage('Planning research approach...')
        // Small delay so the planning message is visible
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      const description = describeToolCall(firstTool.name, firstTool.input as ToolInput)
      await updateStage(description)
    }

    // Execute ALL tools (API requires tool_result for every tool_use)
    // But respect the budget by skipping execution for excess tools
    const toolStartTime = Date.now()
    const allResults: { id: string; result: string; imageContent?: Anthropic.ToolResultBlockParam['content'] }[] = []

    // Process in batches of MAX_PARALLEL_TOOLS
    for (let i = 0; i < toolUseBlocks.length; i += MAX_PARALLEL_TOOLS) {
      const batch = toolUseBlocks.slice(i, i + MAX_PARALLEL_TOOLS)
      const batchResults = await Promise.all(
        batch.map(async (block) => {
          if (block.type !== 'tool_use') return { id: '', result: '' }

          // Check if we're over budget
          if (toolCalls.length >= MAX_TOTAL_TOOL_CALLS) {
            console.log(`[Agentic] Skipping tool (over budget): ${block.name}`)
            return { id: block.id, result: 'Tool call skipped - budget exceeded. Please complete the strategy with the data you have.' }
          }

          const toolInput = block.input as ToolInput
          const callDesc = `${block.name}: ${JSON.stringify(toolInput)}`
          console.log(`[Agentic] Tool call: ${callDesc}`)
          toolCalls.push(callDesc)

          const toolResult = await executeTool(block.name, toolInput, context)

          // Accumulate structured research data
          if (toolResult.data) {
            switch (toolResult.data.type) {
              case 'search':
                researchData.searches.push({
                  query: toolResult.data.query,
                  results: toolResult.data.results,
                })
                break
              case 'seo':
                console.log(`[Agentic] Accumulating SEO: ${toolResult.data.domain} (traffic=${toolResult.data.traffic}, keywords=${toolResult.data.keywords})`)
                researchData.seoMetrics.push({
                  domain: toolResult.data.domain,
                  traffic: toolResult.data.traffic,
                  keywords: toolResult.data.keywords,
                  topPositions: toolResult.data.topPositions,
                })
                break
              case 'keyword_gaps':
                researchData.keywordGaps.push({
                  competitor: toolResult.data.competitor,
                  keywords: toolResult.data.keywords,
                })
                break
              case 'scrape':
                researchData.scrapes.push({
                  url: toolResult.data.url,
                  contentSummary: toolResult.data.contentSummary,
                })
                break
              case 'screenshot':
                (researchData.screenshots ??= []).push({
                  url: toolResult.data.url,
                })
                break
              default:
                // Defensive: log if we ever add new tool types without updating accumulation
                console.warn(`[Agentic] Unknown tool data type: ${(toolResult.data as { type: string }).type}`)
            }
          } else if (block.name === 'seo' || block.name === 'search') {
            // Log when SEO/search tools don't return structured data (indicates error path)
            console.warn(`[Agentic] Tool ${block.name} returned no structured data (error path?)`)
          }

          return { id: block.id, result: toolResult.text, imageContent: toolResult.imageContent }
        })
      )
      allResults.push(...batchResults.filter(r => r.id !== ''))
    }

    totalToolTime += Date.now() - toolStartTime

    // Show intermediate processing message between research batches
    researchBatchCount++
    const processingMessages = [
      'Processing findings...',
      'Analyzing results...',
      'Synthesizing research...',
      'Connecting the dots...',
    ]
    await updateStage(processingMessages[researchBatchCount % processingMessages.length])

    // Add assistant response and tool results to messages
    // IMPORTANT: Must have tool_result for EVERY tool_use in the response
    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: allResults.map((r) => ({
          type: 'tool_result' as const,
          tool_use_id: r.id,
          content: r.imageContent || r.result,
        })),
      },
    ]
  }

  // Max iterations reached
  return {
    success: false,
    error: 'Max tool call iterations reached.',
    toolCalls,
    researchData,
    timing: {
      total: Date.now() - startTime,
      tools: totalToolTime,
      generation: Date.now() - startTime - totalToolTime,
    },
  }
}

// =============================================================================
// LEGACY WRAPPER (for compatibility with existing pipeline)
// =============================================================================

/**
 * Result from agentic strategy generation
 */
export type AgenticStrategyResult = {
  output: string
  researchData: ResearchData
}

/**
 * Generate strategy using agentic pipeline
 * Returns both the markdown output and structured research data for the dashboard
 */
export async function generateStrategyAgentic(
  input: RunInput,
  _research?: ResearchContext | null, // Ignored - agentic fetches its own data
  userHistory?: UserHistoryContext | null,
  onStageUpdate?: StageCallback,
  runId?: string,
  userId?: string,
  priorContext?: string | null
): Promise<AgenticStrategyResult> {
  const result = await generateAgenticStrategy(input, userHistory, onStageUpdate, runId, userId, priorContext)

  if (!result.success || !result.output) {
    throw new Error(result.error || 'Agentic generation failed')
  }

  console.log(`[Agentic] Completed with ${result.toolCalls?.length || 0} tool calls`)
  console.log(`[Agentic] Timing: ${result.timing?.total}ms total, ${result.timing?.tools}ms tools`)
  console.log(`[Agentic] Research data: ${result.researchData?.searches.length || 0} searches, ${result.researchData?.seoMetrics.length || 0} SEO, ${result.researchData?.keywordGaps.length || 0} keyword gaps`)

  return {
    output: result.output,
    researchData: result.researchData || { searches: [], seoMetrics: [], keywordGaps: [], scrapes: [], screenshots: [] },
  }
}

// =============================================================================
// AGENTIC REFINEMENT
// =============================================================================

/**
 * Build system prompt for agentic refinement
 * Key difference: tells Claude to preserve content and only use tools if needed
 */
function buildRefinementSystemPrompt(): string {
  return `You are refining a growth strategy based on user feedback.

CRITICAL: Your output MUST be the COMPLETE strategy document with ALL sections. Do not answer the user's feedback as a question—incorporate it into an updated full strategy.

The user's feedback might be:
- A correction ("My product is actually X, not Y")
- Additional context ("I forgot to mention we have a $500 budget")
- A request to expand something ("Can you go deeper on keywords?")
- A question ("What specific keywords should I target?")

Regardless of format, your response is ALWAYS a complete updated strategy document with these sections:
- Executive Summary
- Your Situation
- Your SEO Landscape (if applicable)
- Market Sentiment (if applicable)
- Competitive Landscape
- Key Discoveries
- Channel Strategy
- Stop Doing
- Start Doing (with ICE scores)
- Week 1-4 action tables
- Metrics Dashboard
- Content Templates

If the user asks a question, answer it BY incorporating the answer into the relevant section(s) of the full strategy. For example, if they ask "what keywords should I target?", expand the SEO Landscape or add a Keyword Strategy section—but still output the COMPLETE document.

You have research tools available (search, scrape, seo, keyword_gaps). Use them if the feedback warrants new research.

Preserve what still applies from the previous strategy—most of it should. Only change/expand what the feedback addresses. No emojis. Be direct.`
}

/**
 * Build user message for agentic refinement
 */
function buildRefinementUserMessage(
  input: RunInput,
  previousOutput: string,
  additionalContext: string
): string {
  const focusLabel =
    input.focusArea === 'custom' && input.customFocusArea
      ? `Custom: ${input.customFocusArea}`
      : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  let message = `# Strategy Refinement Request

## User's Feedback & Additional Context
**The user has reviewed their strategy and wants these specific adjustments:**

${additionalContext}

---

## Previous Strategy (YOUR FOUNDATION - BUILD UPON THIS)
**This is your previous strategy. PRESERVE what still applies, only ADJUST what the user's feedback addresses:**

${previousOutput}

---

## Original Request Context

### Focus Area
**${focusLabel}**

### About My Product
${input.productDescription}

### Current Traction
${input.currentTraction}

### What I've Tried & How It's Going
${input.tacticsAndResults || 'Not specified'}
`

  if (input.websiteUrl) {
    message += `\n### My Website\n${input.websiteUrl}\n`
  }

  if (input.competitorUrls?.length) {
    message += `\n### Competitors\n${input.competitorUrls.join('\n')}\n`
  }

  if (input.constraints) {
    message += `\n### Constraints\n${input.constraints}\n`
  }

  return message
}

/**
 * Run agentic refinement with dynamic tool calling
 *
 * Key difference from main agentic generation:
 * - Starts with previous output
 * - System prompt emphasizes preservation and selective tool use
 * - Only uses tools when feedback specifically requires new data
 *
 * @param input - User's run input
 * @param previousOutput - The previous strategy to refine
 * @param additionalContext - User's feedback/additional context
 * @param onStageUpdate - Callback for progress updates
 * @param runId - Run ID for tracking
 * @param userId - User ID for tracking
 */
export async function generateAgenticRefinement(
  input: RunInput,
  previousOutput: string,
  additionalContext: string,
  onStageUpdate?: StageCallback,
  runId?: string,
  userId?: string
): Promise<AgenticResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const toolCalls: string[] = []
  let totalToolTime = 0

  // Accumulate structured research data from tool calls (same as main agentic)
  const researchData: ResearchData = {
    searches: [],
    seoMetrics: [],
    keywordGaps: [],
    scrapes: [],
    screenshots: [] as Array<{ url: string }>,
  }

  const updateStage = async (stage: string) => {
    if (onStageUpdate) {
      await onStageUpdate(stage)
    }
  }

  // Context for tool execution (includes tracking info)
  const context: ToolContext = {
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    runId,
    userId,
  }

  // Tracking distinctId
  const distinctId = userId || runId || 'anonymous'

  // Build messages with refinement-specific prompts
  const systemPrompt = buildRefinementSystemPrompt()
  const userMessage = buildRefinementUserMessage(input, previousOutput, additionalContext)
  let messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }]

  const startTime = Date.now()
  let iterations = 0

  await updateStage('Analyzing your feedback...')

  // Refinement typically needs fewer iterations since most data is already available
  const MAX_REFINEMENT_ITERATIONS = 6

  while (iterations < MAX_REFINEMENT_ITERATIONS + 2) {
    iterations++

    // Track Anthropic API call
    const apiStartTime = Date.now()

    let response: Anthropic.Message
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      })

      // Track successful Anthropic call
      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: runId,
        latency_ms: Date.now() - apiStartTime,
        success: true,
        input_tokens: response.usage?.input_tokens,
        output_tokens: response.usage?.output_tokens,
        model: MODEL,
        estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
        }),
      })
    } catch (err) {
      // Track failed Anthropic call
      const apiError = err instanceof Error ? err.message : String(err)
      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: runId,
        latency_ms: Date.now() - apiStartTime,
        success: false,
        error: apiError,
        model: MODEL,
        estimated_cost_usd: 0,
      })
      console.error('[AgenticRefinement] Anthropic API error:', err)
      throw err
    }

    // Check if we're done (no more tool calls)
    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      const output = textBlock && textBlock.type === 'text' ? textBlock.text : ''

      if (!output) {
        console.error('[AgenticRefinement] Empty output from Claude. Response:', JSON.stringify(response.content.map(b => b.type)))
      } else {
        console.log(`[AgenticRefinement] Success: ${output.length} chars, ${toolCalls.length} tool calls`)
      }

      return {
        success: true,
        output,
        toolCalls,
        researchData,
        timing: {
          total,
          tools: totalToolTime,
          generation: total - totalToolTime,
        },
      }
    }

    // Process tool calls
    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use')

    // Check if we've hit the hard cap on total tool calls (lower for refinements)
    const MAX_REFINEMENT_TOOL_CALLS = 10
    if (toolCalls.length >= MAX_REFINEMENT_TOOL_CALLS) {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      console.log(`[AgenticRefinement] Hit MAX_REFINEMENT_TOOL_CALLS (${MAX_REFINEMENT_TOOL_CALLS}), forcing completion`)

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: {
          total,
          tools: totalToolTime,
          generation: total - totalToolTime,
        },
      }
    }

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: {
          total,
          tools: totalToolTime,
          generation: total - totalToolTime,
        },
      }
    }

    // Update stage with first tool description
    const firstTool = toolUseBlocks[0]
    if (firstTool && firstTool.type === 'tool_use') {
      const description = describeToolCall(firstTool.name, firstTool.input as ToolInput)
      await updateStage(description)
    }

    // Execute ALL tools (API requires tool_result for every tool_use)
    // But respect the budget by skipping execution for excess tools
    const toolStartTime = Date.now()
    const allResults: { id: string; result: string; imageContent?: Anthropic.ToolResultBlockParam['content'] }[] = []

    for (let i = 0; i < toolUseBlocks.length; i += MAX_PARALLEL_TOOLS) {
      const batch = toolUseBlocks.slice(i, i + MAX_PARALLEL_TOOLS)
      const batchResults = await Promise.all(
        batch.map(async (block) => {
          if (block.type !== 'tool_use') return { id: '', result: '' }

          // Check if we're over budget
          if (toolCalls.length >= MAX_REFINEMENT_TOOL_CALLS) {
            console.log(`[AgenticRefinement] Skipping tool (over budget): ${block.name}`)
            return { id: block.id, result: 'Tool call skipped - budget exceeded. Please complete the strategy with the data you have.' }
          }

          const toolInput = block.input as ToolInput
          const callDesc = `${block.name}: ${JSON.stringify(toolInput)}`
          console.log(`[AgenticRefinement] Tool call: ${callDesc}`)
          toolCalls.push(callDesc)

          const toolResult = await executeTool(block.name, toolInput, context)

          // Accumulate structured research data (same as main agentic)
          if (toolResult.data) {
            switch (toolResult.data.type) {
              case 'search':
                researchData.searches.push({
                  query: toolResult.data.query,
                  results: toolResult.data.results,
                })
                break
              case 'seo':
                console.log(`[Agentic] Accumulating SEO: ${toolResult.data.domain} (traffic=${toolResult.data.traffic}, keywords=${toolResult.data.keywords})`)
                researchData.seoMetrics.push({
                  domain: toolResult.data.domain,
                  traffic: toolResult.data.traffic,
                  keywords: toolResult.data.keywords,
                  topPositions: toolResult.data.topPositions,
                })
                break
              case 'keyword_gaps':
                researchData.keywordGaps.push({
                  competitor: toolResult.data.competitor,
                  keywords: toolResult.data.keywords,
                })
                break
              case 'scrape':
                researchData.scrapes.push({
                  url: toolResult.data.url,
                  contentSummary: toolResult.data.contentSummary,
                })
                break
              case 'screenshot':
                (researchData.screenshots ??= []).push({
                  url: toolResult.data.url,
                })
                break
            }
          }

          return { id: block.id, result: toolResult.text, imageContent: toolResult.imageContent }
        })
      )
      allResults.push(...batchResults.filter(r => r.id !== ''))
    }

    totalToolTime += Date.now() - toolStartTime

    // Add assistant response and tool results to messages
    // IMPORTANT: Must have tool_result for EVERY tool_use in the response
    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: allResults.map((r) => ({
          type: 'tool_result' as const,
          tool_use_id: r.id,
          content: r.imageContent || r.result,
        })),
      },
    ]
  }

  // Max iterations reached
  return {
    success: false,
    error: 'Max tool call iterations reached.',
    toolCalls,
    researchData,
    timing: {
      total: Date.now() - startTime,
      tools: totalToolTime,
      generation: Date.now() - startTime - totalToolTime,
    },
  }
}

// =============================================================================
// FREE AGENTIC PIPELINE (Sonnet + limited tools)
// =============================================================================

const FREE_MODEL = 'claude-sonnet-4-20250514'
const FREE_MAX_TOKENS = 4000
const FREE_MAX_ITERATIONS = 3
const FREE_MAX_TOOL_CALLS = 5

const FREE_TOOLS: Anthropic.Tool[] = TOOLS.filter((t) =>
  ['search', 'seo'].includes(t.name)
)

function buildFreeSystemPrompt(): string {
  return `You're a marketing analyst doing a quick competitive assessment for a client.

You have access to:
- Web search (find competitors, market discussions, reviews)
- SEO metrics lookup (traffic and keyword data for any domain)

The client's homepage screenshot is attached. You will also receive their product description.

IMPORTANT: If the screenshot shows a Cloudflare verification page, CAPTCHA, cookie wall, or any kind of bot-protection interstitial instead of the actual website, IGNORE the screenshot entirely. Base the 3-Second Test on the product description and what you find via search instead. Do NOT mention the bot-check page in your output — just assess based on available information and note "Based on product description and search results" in the 3-Second Test section.

## Your Job

1. **3-Second Test** — Look at the screenshot. Can a stranger tell in 3 seconds: What do they sell? Who is it for? Why should I pick them? Be specific about what's clear and what's not. If the screenshot was blocked (see above), infer from the product description and search results instead.

2. **Find Real Competitors** — Search for alternatives in their space. Find 2-3 direct competitors with actual websites, not just "DIY" or "do nothing."

3. **SEO Comparison** — Look up traffic/keyword metrics for the user's site AND the top 1-2 competitors you found.

4. **Positioning Gap** — Based on the screenshot + competitor research: What does their page communicate? What does the market/audience expect? Where's the disconnect?

5. **Quick Wins** — 2-3 specific, do-it-today fixes based on what you found. Each should reference something concrete (their actual headline, a specific competitor advantage, a real metric).

6. **Score** — Rate them 0-100 on Clarity, Visibility, Proof, and Advantage.

## Budget
You have 5 tool calls total. Be strategic:
- 1-2 searches to find competitors and market context
- 1-2 SEO lookups on the most relevant domains (always include the user's domain)

## Output Format

Structure your response as markdown with EXACTLY these sections:

## 3-Second Test

**What You Sell**: [What the page communicates / Clear or Unclear]
**Who It's For**: [Target audience visible or not / Clear or Unclear]
**Why You**: [Differentiation visible or not / Clear or Unclear]
**Verdict**: [Clear / Needs Work / Unclear]

[1-2 sentences explaining the overall impression a stranger gets]

## Positioning Gap

**Your page says**: [What their site actually communicates]
**The market expects**: [What competitors/audience are looking for]
**The gap**: [The specific disconnect — be direct]

## Competitive Landscape

| Competitor | Domain | What They Do | Their Advantage | Your Angle |
|-----------|--------|-------------|-----------------|------------|
| [Name] | [domain.com] | [Brief] | [Where they're stronger] | [Where you can win] |

## Quick Wins

1. **[Specific action]** — [Why this matters, referencing real evidence] — Impact: [High/Medium/Low] — Time: [5 min/15 min/30 min]
2. **[Specific action]** — [Evidence] — Impact: [High/Medium/Low] — Time: [5 min/15 min/30 min]
3. **[Specific action]** — [Evidence] — Impact: [High/Medium/Low] — Time: [5 min/15 min/30 min]

## Key Discovery

### [Title — something surprising from your research]
[1-3 sentences. Must be specific, sourced, and not obvious.]

*Source: [Where this came from]*

## Scores

\`\`\`json
{
  "overall": [0-100],
  "clarity": [0-100],
  "visibility": [0-100],
  "proof": [0-100],
  "advantage": [0-100]
}
\`\`\`

**Clarity** ([score]/100): [1-sentence evidence]
**Visibility** ([score]/100): [1-sentence evidence]
**Proof** ([score]/100): [1-sentence evidence]
**Advantage** ([score]/100): [1-sentence evidence]

---

**STOP HERE.** This is a free preview. The full strategy with 30-day roadmap, execution drafts, and weekly action plans is available with Boost Weekly.

## Rules
- No emojis. Ever.
- Every claim needs evidence — don't guess traffic numbers, look them up.
- Be direct. If their clarity or advantage is weak, say so.
- Quick wins must be specific enough to act on TODAY, not vague advice like "improve your SEO."
- Say "unknown" rather than estimating metrics you haven't looked up.`
}

function buildFreeUserMessage(
  input: RunInput,
  screenshotBase64?: string | null,
  pageContent?: string | null
): Anthropic.MessageParam {
  let textContent = `# Quick Assessment Request

## About My Product
${input.productDescription}
`

  if (input.websiteUrl) {
    textContent += `\n## My Website\n${input.websiteUrl}\n`
  }

  if (input.competitorUrls?.length) {
    textContent += `\n## Known Competitors\n${input.competitorUrls.join('\n')}\n`
  }

  if (input.currentTraction) {
    textContent += `\n## Current Traction\n${input.currentTraction}\n`
  }

  if (pageContent) {
    textContent += `\n## Extracted Page Content\nThis is the text content from their landing page:\n\n${pageContent}\n`
  }

  if (!screenshotBase64 && !pageContent) {
    textContent += `\nNote: Could not capture screenshot or extract page content. Base the 3-Second Test on the product description and search results.\n`
  } else if (!screenshotBase64 && pageContent) {
    textContent += `\nNote: Screenshot was blocked by the site's bot protection. Use the extracted page content above for the 3-Second Test instead.\n`
  }

  const content: Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam> = []

  if (screenshotBase64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: screenshotBase64,
      },
    })
  }

  content.push({ type: 'text', text: textContent })

  return { role: 'user', content }
}

/**
 * Run agentic strategy generation for FREE tier
 * Sonnet with limited tools (search + seo), screenshot passed as vision input
 */
export async function generateFreeAgenticStrategy(
  input: RunInput,
  screenshotBase64?: string | null,
  freeAuditId?: string,
  pageContent?: string | null
): Promise<AgenticResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const toolCalls: string[] = []
  let totalToolTime = 0

  const researchData: ResearchData = {
    searches: [],
    seoMetrics: [],
    keywordGaps: [],
    scrapes: [],
    screenshots: screenshotBase64 ? [{ url: input.websiteUrl || 'homepage' }] : [],
  }

  const context: ToolContext = {
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    runId: freeAuditId,
  }

  const distinctId = freeAuditId || 'anonymous'
  const systemPrompt = buildFreeSystemPrompt()
  const userMessage = buildFreeUserMessage(input, screenshotBase64, pageContent)
  let messages: Anthropic.MessageParam[] = [userMessage]

  const startTime = Date.now()
  let iterations = 0

  while (iterations < FREE_MAX_ITERATIONS + 2) {
    iterations++

    const apiStartTime = Date.now()
    let response: Anthropic.Message

    try {
      response = await client.messages.create({
        model: FREE_MODEL,
        max_tokens: FREE_MAX_TOKENS,
        system: systemPrompt,
        tools: FREE_TOOLS,
        messages,
      })

      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: freeAuditId,
        latency_ms: Date.now() - apiStartTime,
        success: true,
        input_tokens: response.usage?.input_tokens,
        output_tokens: response.usage?.output_tokens,
        model: FREE_MODEL,
        estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
        }),
      })
    } catch (err) {
      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: freeAuditId,
        latency_ms: Date.now() - apiStartTime,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        model: FREE_MODEL,
        estimated_cost_usd: 0,
      })
      throw err
    }

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: { total, tools: totalToolTime, generation: total - totalToolTime },
      }
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )

    if (toolCalls.length >= FREE_MAX_TOOL_CALLS) {
      console.log(`[FreeAgentic] Hit tool budget (${FREE_MAX_TOOL_CALLS}), forcing output`)
      const pendingResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => ({
        type: 'tool_result' as const,
        tool_use_id: block.id,
        content: 'Tool budget reached. Write the assessment with the data you have.',
      }))
      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [...pendingResults, { type: 'text' as const, text: 'Write the complete assessment now. No more tool calls.' }] },
      ]
      const finalStartTime = Date.now()
      const finalResponse = await client.messages.create({
        model: FREE_MODEL,
        max_tokens: FREE_MAX_TOKENS,
        system: systemPrompt,
        tools: [],
        messages,
      })
      trackApiCall(distinctId, {
        service: 'anthropic',
        endpoint: 'messages.create',
        run_id: freeAuditId,
        latency_ms: Date.now() - finalStartTime,
        success: true,
        input_tokens: finalResponse.usage?.input_tokens,
        output_tokens: finalResponse.usage?.output_tokens,
        model: FREE_MODEL,
        estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
          inputTokens: finalResponse.usage?.input_tokens,
          outputTokens: finalResponse.usage?.output_tokens,
        }),
      })
      const textBlock = finalResponse.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: { total, tools: totalToolTime, generation: total - totalToolTime },
      }
    }

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
        researchData,
        timing: { total, tools: totalToolTime, generation: total - totalToolTime },
      }
    }

    const toolStartTime = Date.now()
    // Enforce budget before dispatching — cap to remaining slots
    const remaining = FREE_MAX_TOOL_CALLS - toolCalls.length
    const toExecute = toolUseBlocks.slice(0, remaining)
    const toSkip = toolUseBlocks.slice(remaining)

    const batchResults = await Promise.all(
      toExecute.map(async (block) => {
        const toolInput = block.input as ToolInput
        const callDesc = `${block.name}: ${JSON.stringify(toolInput)}`
        console.log(`[FreeAgentic] Tool call: ${callDesc}`)
        toolCalls.push(callDesc)
        const toolResult = await executeTool(block.name, toolInput, context)
        if (toolResult.data) {
          switch (toolResult.data.type) {
            case 'search':
              researchData.searches.push({ query: toolResult.data.query, results: toolResult.data.results })
              break
            case 'seo':
              researchData.seoMetrics.push({
                domain: toolResult.data.domain,
                traffic: toolResult.data.traffic,
                keywords: toolResult.data.keywords,
                topPositions: toolResult.data.topPositions,
              })
              break
          }
        }
        return { id: block.id, result: toolResult.text }
      })
    )

    // Return budget-exceeded for skipped blocks
    for (const block of toSkip) {
      batchResults.push({ id: block.id, result: 'Tool budget exceeded.' })
    }
    totalToolTime += Date.now() - toolStartTime

    const toolResults: Anthropic.ToolResultBlockParam[] = batchResults.map((r) => ({
      type: 'tool_result' as const,
      tool_use_id: r.id,
      content: r.result,
    }))
    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ]
  }

  // Max iterations reached — force a final output with what we have
  console.log(`[FreeAgentic] Max iterations (${FREE_MAX_ITERATIONS + 2}) reached, forcing final output`)
  messages.push({
    role: 'user',
    content: 'You have used all available iterations. Write the complete assessment NOW with the data you have. No more tool calls.',
  })
  const finalStartTime2 = Date.now()
  const finalResponse2 = await client.messages.create({
    model: FREE_MODEL,
    max_tokens: FREE_MAX_TOKENS,
    system: systemPrompt,
    tools: [],
    messages,
  })
  trackApiCall(distinctId, {
    service: 'anthropic',
    endpoint: 'messages.create',
    run_id: freeAuditId,
    latency_ms: Date.now() - finalStartTime2,
    success: true,
    input_tokens: finalResponse2.usage?.input_tokens,
    output_tokens: finalResponse2.usage?.output_tokens,
    model: FREE_MODEL,
    estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
      inputTokens: finalResponse2.usage?.input_tokens,
      outputTokens: finalResponse2.usage?.output_tokens,
    }),
  })
  const textBlock2 = finalResponse2.content.find((b) => b.type === 'text')
  const total2 = Date.now() - startTime
  return {
    success: true,
    output: textBlock2 && textBlock2.type === 'text' ? textBlock2.text : '',
    toolCalls,
    researchData,
    timing: { total: total2, tools: totalToolTime, generation: total2 - totalToolTime },
  }
}
