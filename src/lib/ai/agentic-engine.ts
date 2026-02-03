/**
 * Agentic Engine — reusable tool-calling loop for any Claude pipeline.
 *
 * Provides:
 * - Tool definitions (search, scrape, seo, keyword_gaps, screenshot)
 * - Tool executors with timeout, SSRF protection, tracking
 * - Generic agentic loop that accepts any system prompt + messages
 *
 * Used by: pipeline-agentic.ts ($29 one-shot), pipeline-strategy.ts (subscription strategy)
 */

import Anthropic from '@anthropic-ai/sdk'
import { tavily } from '@tavily/core'
import { trackApiCall, calculateApiCost } from '@/lib/analytics'
import { searchUserContext, formatSearchResults } from './embeddings'

// =============================================================================
// CONSTANTS
// =============================================================================

const TOOL_TIMEOUT = 15000
const DEFAULT_MAX_PARALLEL_TOOLS = 5

// =============================================================================
// TYPES
// =============================================================================

/**
 * Structured research data captured from tool calls.
 * Used by formatter to extract insights for the dashboard.
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

export type StageCallback = (stage: string) => Promise<void>

/**
 * Options for the agentic loop.
 */
export type AgenticLoopOptions = {
  model: string
  maxTokens: number
  systemPrompt: string
  messages: Anthropic.MessageParam[]
  tools?: Anthropic.Tool[]        // defaults to all tools
  maxIterations?: number           // defaults to 10
  maxToolCalls?: number            // defaults to 25
  maxParallelTools?: number        // defaults to 5
  onStageUpdate?: StageCallback
  // Tracking
  runId?: string
  userId?: string
  userDomain?: string              // for keyword_gaps tool
  customToolExecutors?: Record<string, (input: Record<string, unknown>) => Promise<string>>
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

type ToolInput = {
  query?: string
  url?: string
  domain?: string
  competitor_domain?: string
}

export const TOOLS: Anthropic.Tool[] = [
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

/**
 * search_history tool definition — lets the model search a business's past
 * task outcomes, checkin notes, and strategy summaries via vector search.
 */
export const SEARCH_HISTORY_TOOL: Anthropic.Tool = {
  name: 'search_history',
  description:
    "Search this business's marketing history — past task outcomes, weekly check-in notes, strategy summaries, and insights. Use this when you need to know what was tried before, what worked, what didn't, or how the business responded to specific tactics.",
  input_schema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description:
          'What to search for (e.g., "Reddit content results", "email campaign outcomes", "what channels worked")',
      },
    },
    required: ['query'],
  },
}

/**
 * Create a search_history tool executor bound to a specific user + business.
 * Returns a function that runAgenticLoop can call when it encounters the tool.
 */
export function createSearchHistoryExecutor(userId: string, businessId: string) {
  return async (query: string): Promise<string> => {
    const results = await searchUserContext(userId, query, {
      businessId,
      limit: 5,
    })
    if (results.length === 0) {
      return 'No relevant history found for this query.'
    }
    return formatSearchResults(results)
  }
}

// =============================================================================
// TOOL EXECUTION
// =============================================================================

type ToolContext = {
  userDomain?: string
  runId?: string
  userId?: string
}

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

async function withTimeout<T>(promise: Promise<T>, ms: number, operation: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${operation} timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const hostname = parsed.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) return false
    if (
      hostname === '[::1]' ||
      hostname.startsWith('[::ffff:127.') ||
      hostname.startsWith('[::ffff:10.') ||
      hostname.startsWith('[::ffff:192.168.') ||
      hostname.startsWith('[fd') ||
      hostname.startsWith('[fe80:') ||
      hostname.startsWith('[fc')
    ) return false
    return true
  } catch {
    return false
  }
}

function sanitizeDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

async function executeTool(name: string, input: ToolInput, context: ToolContext): Promise<ToolResult> {
  try {
    switch (name) {
      case 'search':
        if (!input.query || typeof input.query !== 'string') return { text: 'Error: query is required for search' }
        if (input.query.length > 500) return { text: 'Error: query too long (max 500 characters)' }
        return await executeSearch(input.query, context)
      case 'scrape':
        if (!input.url || typeof input.url !== 'string') return { text: 'Error: url is required for scrape' }
        if (!isAllowedUrl(input.url)) return { text: 'Error: URL not allowed (must be public http/https URL)' }
        return await executeScrape(input.url, context)
      case 'seo':
        if (!input.domain || typeof input.domain !== 'string') return { text: 'Error: domain is required for seo' }
        return await executeSEO(input.domain, context)
      case 'keyword_gaps':
        if (!input.competitor_domain || typeof input.competitor_domain !== 'string') return { text: 'Error: competitor_domain is required for keyword_gaps' }
        return await executeKeywordGaps(input.competitor_domain, context.userDomain, context)
      case 'screenshot':
        if (!input.url || typeof input.url !== 'string') return { text: 'Error: url is required for screenshot' }
        if (!isAllowedUrl(input.url)) return { text: 'Error: URL not allowed (must be public http/https URL)' }
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
      tvly.search(query, { searchDepth: 'advanced', maxResults: 8, includeRawContent: false }),
      TOOL_TIMEOUT, 'Search'
    )
    success = true
    if (!response.results?.length) return { text: 'No results found.' }
    const structuredResults = response.results.map(r => ({
      title: r.title || '', url: r.url || '', snippet: r.content?.slice(0, 300) || '',
    }))
    const text = response.results
      .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.content?.slice(0, 300)}...`)
      .join('\n\n')
    return { text, data: { type: 'search', query, results: structuredResults } }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    const distinctId = context.userId || context.runId || 'anonymous'
    trackApiCall(distinctId, {
      service: 'tavily', endpoint: 'search', run_id: context.runId,
      latency_ms: Date.now() - startTime, success, error: errorMsg,
      estimated_cost_usd: calculateApiCost('tavily', 'search'),
    })
  }
}

async function executeScrape(url: string, context: ToolContext): Promise<ToolResult> {
  const apiKey = process.env.SCRAPINGDOG_API_KEY
  const distinctId = context.userId || context.runId || 'anonymous'

  if (!apiKey) {
    const tvly = tavily({ apiKey: process.env.TAVILY_API! })
    const startTime = Date.now()
    let success = false
    let errorMsg: string | undefined
    try {
      const response = await withTimeout(tvly.extract([url]), TOOL_TIMEOUT, 'Scrape (Tavily)')
      success = true
      if (response.results?.[0]?.rawContent) {
        const content = response.results[0].rawContent.slice(0, 5000)
        return { text: content, data: { type: 'scrape', url, contentSummary: content.slice(0, 500) } }
      }
      return { text: 'Could not extract content from URL.' }
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err)
      return { text: 'Could not scrape URL.' }
    } finally {
      trackApiCall(distinctId, {
        service: 'tavily', endpoint: 'extract', run_id: context.runId,
        latency_ms: Date.now() - startTime, success, error: errorMsg,
        estimated_cost_usd: calculateApiCost('tavily', 'extract'),
      })
    }
  }

  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined
  try {
    const encodedUrl = encodeURIComponent(url)
    const response = await withTimeout(
      fetch(`https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodedUrl}&dynamic=false`),
      TOOL_TIMEOUT, 'Scrape (ScrapingDog)'
    )
    if (!response.ok) { errorMsg = `HTTP ${response.status}`; return { text: `Scrape failed: HTTP ${response.status}` } }
    success = true
    const rawText = await response.text()
    const cleaned = rawText
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)
    if (!cleaned) return { text: 'No content extracted.' }
    return { text: cleaned, data: { type: 'scrape', url, contentSummary: cleaned.slice(0, 500) } }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    trackApiCall(distinctId, {
      service: 'scrapingdog', endpoint: 'scrape', run_id: context.runId,
      latency_ms: Date.now() - startTime, success, error: errorMsg,
      estimated_cost_usd: calculateApiCost('scrapingdog', 'scrape'),
    })
  }
}

async function executeSEO(domain: string, context: ToolContext): Promise<ToolResult> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) return { text: 'SEO data not available (DataForSEO not configured).' }

  const distinctId = context.userId || context.runId || 'anonymous'
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined
  const credentials = Buffer.from(`${login}:${password}`).toString('base64')
  const cleanDomain = sanitizeDomain(domain)

  try {
    const response = await withTimeout(
      fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live', {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ target: cleanDomain, location_code: 2840, language_code: 'en' }]),
      }),
      TOOL_TIMEOUT, 'SEO lookup'
    )
    if (!response.ok) { errorMsg = `HTTP ${response.status}`; return { text: `SEO lookup failed: HTTP ${response.status}` } }
    success = true
    const data = await response.json()
    const metrics = data?.tasks?.[0]?.result?.[0]?.items?.[0]?.metrics?.organic
    if (!metrics) {
      return {
        text: `No SEO data found for ${cleanDomain}. This could mean the domain is new or has minimal organic presence.`,
        data: { type: 'seo', domain: cleanDomain, traffic: null, keywords: null },
      }
    }
    const text = `SEO Metrics for ${cleanDomain}:\n- Estimated Organic Traffic: ~${metrics.etv?.toLocaleString() || 'N/A'} monthly visits\n- Organic Keywords: ${metrics.count?.toLocaleString() || 'N/A'} ranking keywords\n- Keyword Positions: ${metrics.pos_1 || 0} in #1, ${metrics.pos_2_3 || 0} in #2-3, ${metrics.pos_4_10 || 0} in #4-10`
    return {
      text,
      data: {
        type: 'seo', domain: cleanDomain, traffic: metrics.etv || null, keywords: metrics.count || null,
        topPositions: { pos1: metrics.pos_1 || 0, pos2_3: metrics.pos_2_3 || 0, pos4_10: metrics.pos_4_10 || 0 },
      },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    trackApiCall(distinctId, {
      service: 'dataforseo', endpoint: 'domain_rank_overview', run_id: context.runId,
      latency_ms: Date.now() - startTime, success, error: errorMsg,
      estimated_cost_usd: calculateApiCost('dataforseo', 'domain_rank_overview'),
    })
  }
}

async function executeKeywordGaps(
  competitorDomain: string, userDomain: string | undefined, context: ToolContext
): Promise<ToolResult> {
  if (!userDomain) return { text: 'Cannot analyze keyword gaps - user did not provide their website URL.' }
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) return { text: 'Keyword gap analysis not available (DataForSEO not configured).' }

  const distinctId = context.userId || context.runId || 'anonymous'
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined
  const credentials = Buffer.from(`${login}:${password}`).toString('base64')
  const cleanCompetitor = sanitizeDomain(competitorDomain)
  const cleanUser = sanitizeDomain(userDomain)

  try {
    const response = await withTimeout(
      fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/domain_intersection/live', {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          target1: cleanCompetitor, target2: cleanUser, intersections: false,
          location_code: 2840, language_code: 'en', limit: 20,
          order_by: ['keyword_data.keyword_info.search_volume,desc'],
        }]),
      }),
      TOOL_TIMEOUT, 'Keyword gap analysis'
    )
    if (!response.ok) { errorMsg = `HTTP ${response.status}`; return { text: `Keyword gap analysis failed: HTTP ${response.status}` } }
    success = true
    const data = await response.json()
    const items = data?.tasks?.[0]?.result?.[0]?.items || []
    if (!items.length) return { text: `No keyword gaps found between ${cleanCompetitor} and ${cleanUser}.` }

    type GapItem = {
      keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number } }
      first_domain_serp_element?: { serp_item?: { rank_absolute?: number } }
    }

    const structuredKeywords = items.slice(0, 15).map((item: GapItem) => ({
      keyword: item.keyword_data?.keyword || '',
      volume: item.keyword_data?.keyword_info?.search_volume || 0,
      competitorRank: item.first_domain_serp_element?.serp_item?.rank_absolute || 0,
    }))
    const gaps = items.slice(0, 15).map((item: GapItem) => {
      const kw = item.keyword_data?.keyword || '?'
      const vol = item.keyword_data?.keyword_info?.search_volume || 0
      const pos = item.first_domain_serp_element?.serp_item?.rank_absolute || '?'
      return `- "${kw}" (${vol.toLocaleString()} searches/mo) - ${cleanCompetitor} ranks #${pos}`
    })
    return {
      text: `Keyword Gaps (${cleanCompetitor} ranks, you don't):\n${gaps.join('\n')}`,
      data: { type: 'keyword_gaps', competitor: cleanCompetitor, keywords: structuredKeywords },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    throw err
  } finally {
    trackApiCall(distinctId, {
      service: 'dataforseo', endpoint: 'domain_intersection', run_id: context.runId,
      latency_ms: Date.now() - startTime, success, error: errorMsg,
      estimated_cost_usd: calculateApiCost('dataforseo', 'domain_intersection'),
    })
  }
}

async function executeScreenshot(url: string, context: ToolContext): Promise<ToolResult> {
  const ssUrl = process.env.SCREENSHOT_SERVICE_URL
  const ssKey = process.env.SCREENSHOT_API_KEY
  if (!ssUrl || !ssKey) return { text: 'Screenshot service not configured.' }

  const distinctId = context.userId || context.runId || 'anonymous'
  const startTime = Date.now()
  let success = false
  let errorMsg: string | undefined

  try {
    const response = await fetch(
      `${ssUrl}/screenshot?url=${encodeURIComponent(url)}&width=1280&height=800`,
      { headers: { 'x-api-key': ssKey }, signal: AbortSignal.timeout(20000) }
    )
    if (!response.ok) { errorMsg = `HTTP ${response.status}`; return { text: `Could not capture screenshot: HTTP ${response.status}` } }

    const contentType = response.headers.get('content-type') || ''
    const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const
    const mediaType = contentType.split(';')[0].trim()
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType as typeof ALLOWED_MEDIA_TYPES[number])) {
      return { text: `Screenshot returned unsupported image type: ${mediaType || contentType}` }
    }
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10)
    if (contentLength > 10 * 1024 * 1024) return { text: `Screenshot too large (${contentLength} bytes)` }

    success = true
    const base64 = Buffer.from(await response.arrayBuffer()).toString('base64')
    return {
      text: `Homepage screenshot of ${url}`,
      imageContent: [
        { type: 'image', source: { type: 'base64', media_type: mediaType as typeof ALLOWED_MEDIA_TYPES[number], data: base64 } },
        { type: 'text', text: `Homepage screenshot of ${url}` },
      ],
      data: { type: 'screenshot', url },
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err)
    return { text: `Could not capture screenshot of ${url}: ${errorMsg}` }
  } finally {
    trackApiCall(distinctId, {
      service: 'screenshot', endpoint: 'screenshot', run_id: context.runId,
      latency_ms: Date.now() - startTime, success, error: errorMsg, estimated_cost_usd: 0,
    })
  }
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
    case 'search_history':
      return 'Searching past results...'
    default:
      return 'Processing...'
  }
}

// =============================================================================
// AGENTIC LOOP — generic, prompt-agnostic
// =============================================================================

/**
 * Run a generic agentic loop with tool calling.
 *
 * Accepts any system prompt and initial messages. Handles:
 * - Tool execution with parallel batching
 * - Budget enforcement (max iterations, max tool calls)
 * - Research data accumulation
 * - Stage updates for UI progress
 * - API call tracking
 */
export async function runAgenticLoop(options: AgenticLoopOptions): Promise<AgenticResult> {
  const {
    model,
    maxTokens,
    systemPrompt,
    tools = TOOLS,
    maxIterations = 10,
    maxToolCalls = 25,
    maxParallelTools = DEFAULT_MAX_PARALLEL_TOOLS,
    onStageUpdate,
    runId,
    userId,
    userDomain,
    customToolExecutors,
  } = options

  let messages = [...options.messages]

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const toolCalls: string[] = []
  let totalToolTime = 0

  const researchData: ResearchData = {
    searches: [],
    seoMetrics: [],
    keywordGaps: [],
    scrapes: [],
    screenshots: [] as Array<{ url: string }>,
  }

  const updateStage = async (stage: string) => {
    if (onStageUpdate) await onStageUpdate(stage)
  }

  const context: ToolContext = { userDomain, runId, userId }
  const distinctId = userId || runId || 'anonymous'

  const startTime = Date.now()
  let iterations = 0
  let hasStartedResearch = false
  let researchBatchCount = 0

  // +2 allows for: initial analysis turn + final output turn (beyond tool iterations)
  while (iterations < maxIterations + 2) {
    iterations++

    const apiStartTime = Date.now()
    let response: Anthropic.Message
    try {
      response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        tools,
        messages,
      })
      trackApiCall(distinctId, {
        service: 'anthropic', endpoint: 'messages.create', run_id: runId,
        latency_ms: Date.now() - apiStartTime, success: true,
        input_tokens: response.usage?.input_tokens, output_tokens: response.usage?.output_tokens,
        model,
        estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
          inputTokens: response.usage?.input_tokens, outputTokens: response.usage?.output_tokens,
        }),
      })
    } catch (err) {
      const apiError = err instanceof Error ? err.message : String(err)
      trackApiCall(distinctId, {
        service: 'anthropic', endpoint: 'messages.create', run_id: runId,
        latency_ms: Date.now() - apiStartTime, success: false, error: apiError,
        model, estimated_cost_usd: 0,
      })
      throw err
    }

    // Done — no more tool calls
    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls, researchData,
        timing: { total, tools: totalToolTime, generation: total - totalToolTime },
      }
    }

    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use')

    // Hard cap on tool calls — force final output
    if (toolCalls.length >= maxToolCalls) {
      console.log(`[AgenticEngine] Hit maxToolCalls (${maxToolCalls}), forcing final output`)
      const pendingToolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks
        .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
        .map((block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: 'Research budget exceeded. Please complete with the data you have.',
        }))

      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        {
          role: 'user',
          content: [
            ...pendingToolResults,
            { type: 'text' as const, text: 'You\'ve gathered enough research data. Write the complete output now. No more tool calls.' },
          ],
        },
      ]

      const finalApiStartTime = Date.now()
      let finalResponse: Anthropic.Message
      try {
        finalResponse = await client.messages.create({
          model, max_tokens: maxTokens, system: systemPrompt, messages,
        })
        trackApiCall(distinctId, {
          service: 'anthropic', endpoint: 'messages.create', run_id: runId,
          latency_ms: Date.now() - finalApiStartTime, success: true,
          input_tokens: finalResponse.usage?.input_tokens, output_tokens: finalResponse.usage?.output_tokens,
          model,
          estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
            inputTokens: finalResponse.usage?.input_tokens, outputTokens: finalResponse.usage?.output_tokens,
          }),
        })
      } catch (err) {
        const finalApiError = err instanceof Error ? err.message : String(err)
        trackApiCall(distinctId, {
          service: 'anthropic', endpoint: 'messages.create', run_id: runId,
          latency_ms: Date.now() - finalApiStartTime, success: false, error: finalApiError,
          model, estimated_cost_usd: 0,
        })
        throw err
      }

      const textBlock = finalResponse.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls, researchData,
        timing: { total, tools: totalToolTime, generation: total - totalToolTime },
      }
    }

    if (toolUseBlocks.length === 0) {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime
      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls, researchData,
        timing: { total, tools: totalToolTime, generation: total - totalToolTime },
      }
    }

    // Stage updates
    const firstTool = toolUseBlocks[0]
    if (firstTool && firstTool.type === 'tool_use') {
      if (!hasStartedResearch) {
        hasStartedResearch = true
        await updateStage('Planning research approach...')
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      await updateStage(describeToolCall(firstTool.name, firstTool.input as ToolInput))
    }

    // Execute tools in parallel batches
    const toolStartTime = Date.now()
    const allResults: { id: string; result: string; imageContent?: Anthropic.ToolResultBlockParam['content'] }[] = []

    for (let i = 0; i < toolUseBlocks.length; i += maxParallelTools) {
      const batch = toolUseBlocks.slice(i, i + maxParallelTools)
      const batchResults = await Promise.all(
        batch.map(async (block) => {
          if (block.type !== 'tool_use') return { id: '', result: '' }
          if (toolCalls.length >= maxToolCalls) {
            console.log(`[AgenticEngine] Skipping tool (over budget): ${block.name}`)
            return { id: block.id, result: 'Tool call skipped - budget exceeded.' }
          }

          const toolInput = block.input as ToolInput
          const callDesc = `${block.name}: ${JSON.stringify(toolInput)}`
          console.log(`[AgenticEngine] Tool call: ${callDesc}`)
          toolCalls.push(callDesc)

          // Check custom executors first (e.g., search_history)
          let toolResult: ToolResult
          if (customToolExecutors?.[block.name]) {
            try {
              const text = await customToolExecutors[block.name](toolInput as Record<string, unknown>)
              toolResult = { text }
            } catch (err) {
              toolResult = { text: `Error: ${err instanceof Error ? err.message : String(err)}` }
            }
          } else {
            toolResult = await executeTool(block.name, toolInput, context)
          }

          // Accumulate structured research data
          if (toolResult.data) {
            switch (toolResult.data.type) {
              case 'search':
                researchData.searches.push({ query: toolResult.data.query, results: toolResult.data.results })
                break
              case 'seo':
                researchData.seoMetrics.push({
                  domain: toolResult.data.domain, traffic: toolResult.data.traffic,
                  keywords: toolResult.data.keywords, topPositions: toolResult.data.topPositions,
                })
                break
              case 'keyword_gaps':
                researchData.keywordGaps.push({ competitor: toolResult.data.competitor, keywords: toolResult.data.keywords })
                break
              case 'scrape':
                researchData.scrapes.push({ url: toolResult.data.url, contentSummary: toolResult.data.contentSummary })
                break
              case 'screenshot':
                (researchData.screenshots ??= []).push({ url: toolResult.data.url })
                break
              default:
                console.warn(`[AgenticEngine] Unknown tool data type: ${(toolResult.data as { type: string }).type}`)
            }
          }

          return { id: block.id, result: toolResult.text, imageContent: toolResult.imageContent }
        })
      )
      allResults.push(...batchResults.filter(r => r.id !== ''))
    }

    totalToolTime += Date.now() - toolStartTime

    researchBatchCount++
    const processingMessages = ['Processing findings...', 'Analyzing results...', 'Synthesizing research...', 'Connecting the dots...']
    await updateStage(processingMessages[researchBatchCount % processingMessages.length])

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

  return {
    success: false,
    error: 'Max tool call iterations reached.',
    toolCalls, researchData,
    timing: { total: Date.now() - startTime, tools: totalToolTime, generation: Date.now() - startTime - totalToolTime },
  }
}
