/**
 * Agentic Pipeline - Dynamic Tool-Calling Strategy Generation
 *
 * Single Claude call with flexible tools that fetches data as needed.
 * Produces data-backed strategies with real market research.
 */

import Anthropic from '@anthropic-ai/sdk'
import { tavily } from '@tavily/core'
import type { RunInput, ResearchContext, UserHistoryContext } from './types'

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

export type AgenticResult = {
  success: boolean
  output?: string
  toolCalls?: string[]
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

async function executeTool(
  name: string,
  input: ToolInput,
  context: { userDomain?: string }
): Promise<string> {
  try {
    switch (name) {
      case 'search':
        if (!input.query || typeof input.query !== 'string') {
          return 'Error: query is required for search'
        }
        if (input.query.length > 500) {
          return 'Error: query too long (max 500 characters)'
        }
        return await executeSearch(input.query)
      case 'scrape':
        if (!input.url || typeof input.url !== 'string') {
          return 'Error: url is required for scrape'
        }
        if (!isAllowedUrl(input.url)) {
          return 'Error: URL not allowed (must be public http/https URL)'
        }
        return await executeScrape(input.url)
      case 'seo':
        if (!input.domain || typeof input.domain !== 'string') {
          return 'Error: domain is required for seo'
        }
        return await executeSEO(input.domain)
      case 'keyword_gaps':
        if (!input.competitor_domain || typeof input.competitor_domain !== 'string') {
          return 'Error: competitor_domain is required for keyword_gaps'
        }
        return await executeKeywordGaps(input.competitor_domain, context.userDomain)
      default:
        return `Unknown tool: ${name}`
    }
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }
}

async function executeSearch(query: string): Promise<string> {
  const tvly = tavily({ apiKey: process.env.TAVILY_API! })

  const response = await withTimeout(
    tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 8,
      includeRawContent: false,
    }),
    TOOL_TIMEOUT,
    'Search'
  )

  if (!response.results?.length) {
    return 'No results found.'
  }

  return response.results
    .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.content?.slice(0, 300)}...`)
    .join('\n\n')
}

async function executeScrape(url: string): Promise<string> {
  const apiKey = process.env.SCRAPINGDOG_API_KEY

  if (!apiKey) {
    // Fallback to Tavily extract if no ScrapingDog key
    const tvly = tavily({ apiKey: process.env.TAVILY_API! })
    try {
      const response = await withTimeout(
        tvly.extract([url]),
        TOOL_TIMEOUT,
        'Scrape (Tavily)'
      )
      if (response.results?.[0]?.rawContent) {
        return response.results[0].rawContent.slice(0, 5000)
      }
      return 'Could not extract content from URL.'
    } catch {
      return 'Could not scrape URL.'
    }
  }

  const encodedUrl = encodeURIComponent(url)
  const response = await withTimeout(
    fetch(
      `https://api.scrapingdog.com/scrape?api_key=${apiKey}&url=${encodedUrl}&dynamic=false`
    ),
    TOOL_TIMEOUT,
    'Scrape (ScrapingDog)'
  )

  if (!response.ok) {
    return `Scrape failed: HTTP ${response.status}`
  }

  const text = await response.text()

  // Basic HTML to text conversion
  const cleaned = text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000)

  return cleaned || 'No content extracted.'
}

async function executeSEO(domain: string): Promise<string> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    return 'SEO data not available (DataForSEO not configured).'
  }

  const credentials = Buffer.from(`${login}:${password}`).toString('base64')
  const cleanDomain = sanitizeDomain(domain)

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
    return `SEO lookup failed: HTTP ${response.status}`
  }

  const data = await response.json()
  const metrics = data?.tasks?.[0]?.result?.[0]?.metrics?.organic

  if (!metrics) {
    return `No SEO data found for ${cleanDomain}. This could mean the domain is new or has minimal organic presence.`
  }

  return `SEO Metrics for ${cleanDomain}:
- Estimated Organic Traffic: ~${metrics.etv?.toLocaleString() || 'N/A'} monthly visits
- Organic Keywords: ${metrics.count?.toLocaleString() || 'N/A'} ranking keywords
- Keyword Positions: ${metrics.pos_1 || 0} in #1, ${metrics.pos_2_3 || 0} in #2-3, ${metrics.pos_4_10 || 0} in #4-10`
}

async function executeKeywordGaps(
  competitorDomain: string,
  userDomain?: string
): Promise<string> {
  if (!userDomain) {
    return 'Cannot analyze keyword gaps - user did not provide their website URL.'
  }

  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    return 'Keyword gap analysis not available (DataForSEO not configured).'
  }

  const credentials = Buffer.from(`${login}:${password}`).toString('base64')
  const cleanCompetitor = sanitizeDomain(competitorDomain)
  const cleanUser = sanitizeDomain(userDomain)

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
    return `Keyword gap analysis failed: HTTP ${response.status}`
  }

  const data = await response.json()
  const items = data?.tasks?.[0]?.result?.[0]?.items || []

  if (!items.length) {
    return `No keyword gaps found between ${cleanCompetitor} and ${cleanUser}. This could mean both domains are new or target very different keywords.`
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

  const gaps = items.slice(0, 15).map((item: GapItem) => {
    const kw = item.keyword_data?.keyword || '?'
    const vol = item.keyword_data?.keyword_info?.search_volume || 0
    const pos = item.first_domain_serp_element?.serp_item?.rank_absolute || '?'
    return `- "${kw}" (${vol.toLocaleString()} searches/mo) - ${cleanCompetitor} ranks #${pos}`
  })

  return `Keyword Gaps (${cleanCompetitor} ranks, you don't):\n${gaps.join('\n')}`
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

  return `You are an elite Growth Strategist. You have research tools available: search (web), scrape (pages), seo (domain metrics), keyword_gaps (competitive keywords).

Your job: Deliver a growth strategy that's specific to THIS user's product, stage, and constraints—not generic advice.

Use research when it would change your recommendations. Skip it when you already know enough. A pre-revenue founder asking about acquisition needs different research than an established SaaS optimizing retention.

${historySection}

## Output

After you have what you need, write the full strategy:
- Executive Summary (2-3 paragraphs)
- Your Situation (AARRR analysis)
- Your SEO Landscape (if you gathered SEO data)
- Market Sentiment (if you found relevant discussions)
- Competitive Landscape
- Channel Strategy (table + explanations)
- Stop Doing (3-5 items)
- Start Doing (5-8 with ICE scores: Impact + Confidence + Ease, each 1-10)
- This Week (7-day action table)
- 30-Day Roadmap (weekly themes with checkboxes)
- Metrics Dashboard (AARRR metrics table)
- Content Templates (2-3 ready-to-use)

No emojis. Be direct. Challenge flawed assumptions. Say "unknown" rather than guessing metrics.`
}

// =============================================================================
// USER MESSAGE BUILDER
// =============================================================================

function buildUserMessage(input: RunInput): string {
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
 */
export async function generateAgenticStrategy(
  input: RunInput,
  userHistory?: UserHistoryContext | null,
  onStageUpdate?: StageCallback
): Promise<AgenticResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const toolCalls: string[] = []
  let totalToolTime = 0

  const updateStage = async (stage: string) => {
    if (onStageUpdate) {
      await onStageUpdate(stage)
    }
  }

  // Context for tool execution
  const context = {
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  }

  // Build messages
  const systemPrompt = buildSystemPrompt(userHistory)
  const userMessage = buildUserMessage(input)
  let messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }]

  const startTime = Date.now()
  let iterations = 0

  await updateStage('Analyzing your situation...')

  // +2 allows for: initial analysis turn + final output turn (beyond tool iterations)
  while (iterations < MAX_ITERATIONS + 2) {
    iterations++

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    })

    // Check if we're done (no more tool calls)
    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
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

      // Add current response to messages, then ask Claude to complete WITHOUT tools
      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        {
          role: 'user',
          content: `You've gathered enough research data. Now write the complete strategy document using the OUTPUT FORMAT specified in your system prompt. Do not request any more tools - use the data you have. Start with "# Growth Strategy" and include all 10 sections.`,
        },
      ]

      // One final call WITHOUT tools to force strategy generation
      const finalResponse = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages,
        // No tools - force text completion
      })

      const textBlock = finalResponse.content.find((b) => b.type === 'text')
      const total = Date.now() - startTime

      console.log(`[Agentic] Completed with ${toolCalls.length} tool calls (forced final output)`)

      return {
        success: true,
        output: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        toolCalls,
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
    const allResults: { id: string; result: string }[] = []

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

          const result = await executeTool(block.name, toolInput, context)
          return { id: block.id, result }
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
          content: r.result,
        })),
      },
    ]
  }

  // Max iterations reached
  return {
    success: false,
    error: 'Max tool call iterations reached.',
    toolCalls,
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
 * Generate strategy using agentic pipeline
 * Drop-in replacement for generateStrategy from generate.ts
 */
export async function generateStrategyAgentic(
  input: RunInput,
  _research: ResearchContext, // Ignored - agentic fetches its own data
  userHistory?: UserHistoryContext | null,
  onStageUpdate?: StageCallback
): Promise<string> {
  const result = await generateAgenticStrategy(input, userHistory, onStageUpdate)

  if (!result.success || !result.output) {
    throw new Error(result.error || 'Agentic generation failed')
  }

  console.log(`[Agentic] Completed with ${result.toolCalls?.length || 0} tool calls`)
  console.log(`[Agentic] Timing: ${result.timing?.total}ms total, ${result.timing?.tools}ms tools`)

  return result.output
}

// =============================================================================
// AGENTIC REFINEMENT
// =============================================================================

/**
 * Build system prompt for agentic refinement
 * Key difference: tells Claude to preserve content and only use tools if needed
 */
function buildRefinementSystemPrompt(): string {
  return `You are an elite Growth Strategist REFINING a strategy you previously created. You have access to research tools but should ONLY use them when the user's feedback specifically requires new data.

## Your Task

The user has provided additional context or feedback on their strategy. Your job is to:
1. **PRESERVE** everything from the previous strategy that still applies (most of it should!)
2. **ADJUST** specific sections based on the user's feedback
3. **USE TOOLS ONLY IF NEEDED** - if the feedback is about budget, timing, or clarifications, you don't need new research

## When to Use Tools

USE tools when the user's feedback:
- Mentions NEW competitors you haven't researched
- Asks about a specific market/niche you haven't explored
- Requests data on a channel or platform not covered
- Wants updated information on something specific

DO NOT use tools when the user's feedback:
- Clarifies budget, team size, or constraints
- Corrects assumptions about their product
- Asks to emphasize/de-emphasize certain recommendations
- Provides context about what they've already tried

## Tool Usage Guidelines

- Be strategic: only call tools when you need specific information the feedback requires
- Use site: prefixes in search: "site:reddit.com [topic]", "site:etsy.com [product]"
- You can call multiple tools in one turn - they run in parallel
- If a tool fails, work with what you have

## Output Format

For EACH section below:
1. If the user's feedback DOES NOT relate to this section → **COPY IT EXACTLY from the previous strategy** (word for word)
2. If the user's feedback DOES relate to this section → **Update it** while preserving any parts that still apply

### Sections to include (same structure as before):
- ## Executive Summary (update ONLY if feedback changes the core direction)
- ## Your Situation (update ONLY if feedback reveals new constraints/context)
- ## Your SEO Landscape (copy unless feedback is about SEO)
- ## Market Sentiment (copy unless feedback is about market/competitors)
- ## Competitive Landscape (copy unless feedback is about competitors)
- ## Channel Strategy (copy unless feedback is about channels)
- ## Stop Doing (copy unless feedback says "actually I should keep doing X")
- ## Start Doing (copy unless feedback changes priorities or adds constraints)
- ## This Week (update to reflect any changed recommendations)
- ## 30-Day Roadmap (update to reflect any changed recommendations)
- ## Metrics Dashboard (copy unless feedback changes goals)
- ## Content Templates (copy unless feedback is about content)

## Rules

- **PRESERVE CONTINUITY** - the user spent time reading the previous strategy
- Be specific to their product, not generic
- NEVER use emojis
- Frame adjustments as "Now that I know more about your situation..." not "I got it wrong before"
- COPY SECTIONS VERBATIM when they don't need changes`
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

  message += `\n---\n\n**Instructions:** Review the user's feedback above. If their feedback requires new research (e.g., new competitors, specific market data), use the available tools. Otherwise, update the strategy directly by preserving unchanged sections and refining only what their feedback addresses.`

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
 */
export async function generateAgenticRefinement(
  input: RunInput,
  previousOutput: string,
  additionalContext: string,
  onStageUpdate?: StageCallback
): Promise<AgenticResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const toolCalls: string[] = []
  let totalToolTime = 0

  const updateStage = async (stage: string) => {
    if (onStageUpdate) {
      await onStageUpdate(stage)
    }
  }

  // Context for tool execution
  const context = {
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  }

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

    let response: Anthropic.Message
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      })
    } catch (apiError) {
      console.error('[AgenticRefinement] Anthropic API error:', apiError)
      throw apiError
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
    const allResults: { id: string; result: string }[] = []

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

          const result = await executeTool(block.name, toolInput, context)
          return { id: block.id, result }
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
          content: r.result,
        })),
      },
    ]
  }

  // Max iterations reached
  return {
    success: false,
    error: 'Max tool call iterations reached.',
    toolCalls,
    timing: {
      total: Date.now() - startTime,
      tools: totalToolTime,
      generation: Date.now() - startTime - totalToolTime,
    },
  }
}
