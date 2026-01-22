/**
 * Claude Tool Definitions for Deep-Dive Research
 *
 * These tools allow Claude to do targeted research during strategy generation.
 * Claude decides when to use them based on the user's situation.
 * Max 5 tool calls per run to control costs.
 */

import { tavily } from '@tavily/core'
import type { RedditDiscussion, KeywordGap, G2ReviewSummary } from './types'
import { fetchG2Reviews } from '@/lib/integrations/apify'
import type { AdLibraryResult } from '@/lib/integrations/apify'
import { fetchAdLibrary } from '@/lib/integrations/apify'

// =============================================================================
// TOOL DEFINITIONS (for Claude API)
// =============================================================================

export const RESEARCH_TOOLS = [
  {
    name: 'search_reddit',
    description:
      'Search Reddit for discussions about a specific topic. Use when you want deeper insight into community sentiment, pain points, or discussions about a particular problem or solution.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (will be scoped to Reddit)',
        },
        subreddit: {
          type: 'string',
          description: "Optional: specific subreddit (e.g., 'SaaS', 'startups', 'Entrepreneur')",
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_g2_reviews',
    description:
      "Get detailed G2 reviews for a specific software product. Use when you want to understand what users love/hate about a competitor or find positioning opportunities.",
    input_schema: {
      type: 'object' as const,
      properties: {
        product_name: {
          type: 'string',
          description: 'Name of the product on G2',
        },
        focus: {
          type: 'string',
          enum: ['positive', 'negative', 'all'],
          description: 'Filter reviews by sentiment',
        },
      },
      required: ['product_name'],
    },
  },
  {
    name: 'keyword_deep_dive',
    description:
      "Get related keywords, questions, and search intent data for a seed keyword. Use when you've identified a promising keyword and want the full cluster for content planning.",
    input_schema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: 'Seed keyword to expand',
        },
        intent: {
          type: 'string',
          enum: ['informational', 'commercial', 'transactional', 'all'],
          description: 'Filter by search intent',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'analyze_content_gap',
    description:
      "Find keywords/content that a competitor ranks for but the user doesn't. Use to identify content opportunities and topics to cover.",
    input_schema: {
      type: 'object' as const,
      properties: {
        competitor_domain: {
          type: 'string',
          description: "Competitor's domain to compare against",
        },
      },
      required: ['competitor_domain'],
    },
  },
  {
    name: 'get_ad_intel',
    description:
      'Get Facebook/Meta ads currently running for a competitor. Use to understand their messaging, offers, and ad creative.',
    input_schema: {
      type: 'object' as const,
      properties: {
        company_name: {
          type: 'string',
          description: 'Company/brand name to search in ad library',
        },
      },
      required: ['company_name'],
    },
  },
]

// =============================================================================
// TOOL EXECUTION
// =============================================================================

export type ToolInput = {
  query?: string
  subreddit?: string
  product_name?: string
  focus?: 'positive' | 'negative' | 'all'
  keyword?: string
  intent?: 'informational' | 'commercial' | 'transactional' | 'all'
  competitor_domain?: string
  company_name?: string
}

export type ToolResult = {
  success: boolean
  data?: unknown
  error?: string
}

/**
 * Execute a tool call from Claude
 */
export async function executeTool(
  toolName: string,
  input: ToolInput,
  context: { userDomain?: string; credentials?: string }
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case 'search_reddit':
        return await executeRedditSearch(input)
      case 'get_g2_reviews':
        return await executeG2Reviews(input)
      case 'keyword_deep_dive':
        return await executeKeywordDeepDive(input, context.credentials)
      case 'analyze_content_gap':
        return await executeContentGap(input, context.userDomain, context.credentials)
      case 'get_ad_intel':
        return await executeAdIntel(input)
      default:
        return { success: false, error: `Unknown tool: ${toolName}` }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

async function executeRedditSearch(input: ToolInput): Promise<ToolResult> {
  if (!input.query) {
    return { success: false, error: 'Query is required' }
  }

  const tvly = tavily({ apiKey: process.env.TAVILY_API! })

  let query = `site:reddit.com ${input.query}`
  if (input.subreddit) {
    query = `site:reddit.com/r/${input.subreddit} ${input.query}`
  }

  const response = await tvly.search(query, {
    searchDepth: 'advanced',
    maxResults: 10,
    includeRawContent: false,
  })

  const discussions: RedditDiscussion[] = (response.results || []).map((r) => {
    const subredditMatch = r.url.match(/reddit\.com\/r\/([^/]+)/)
    return {
      title: r.title,
      url: r.url,
      subreddit: subredditMatch ? subredditMatch[1] : 'unknown',
      content: r.content,
      score: r.score,
    }
  })

  return { success: true, data: discussions }
}

async function executeG2Reviews(input: ToolInput): Promise<ToolResult> {
  if (!input.product_name) {
    return { success: false, error: 'Product name is required' }
  }

  const errors: string[] = []
  const reviews = await fetchG2Reviews([input.product_name], errors)

  if (errors.length > 0 && reviews.length === 0) {
    return { success: false, error: errors.join(', ') }
  }

  // Filter by focus if specified
  let result: G2ReviewSummary[] = reviews
  if (input.focus === 'positive' && reviews.length > 0) {
    result = reviews.map((r) => ({
      ...r,
      topComplaints: [], // Hide complaints
    }))
  } else if (input.focus === 'negative' && reviews.length > 0) {
    result = reviews.map((r) => ({
      ...r,
      topPraises: [], // Hide praises
    }))
  }

  return { success: true, data: result }
}

async function executeKeywordDeepDive(
  input: ToolInput,
  credentials?: string
): Promise<ToolResult> {
  if (!input.keyword) {
    return { success: false, error: 'Keyword is required' }
  }

  if (!credentials) {
    return { success: false, error: 'DataForSEO credentials not configured' }
  }

  // Use DataForSEO keyword suggestions + related keywords
  const [suggestionsRes, relatedRes] = await Promise.allSettled([
    dataForSEORequest(
      'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live',
      [{
        keyword: input.keyword,
        location_code: 2840,
        language_code: 'en',
        limit: 30,
        include_seed_keyword: true,
        ...(input.intent && input.intent !== 'all' && {
          filters: [['keyword_info.search_intent', '=', input.intent]],
        }),
      }],
      credentials
    ),
    dataForSEORequest(
      'https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live',
      [{
        keyword: input.keyword,
        location_code: 2840,
        language_code: 'en',
        limit: 20,
      }],
      credentials
    ),
  ])

  const suggestions = suggestionsRes.status === 'fulfilled'
    ? (suggestionsRes.value?.tasks?.[0]?.result?.[0]?.items || [])
    : []

  const related = relatedRes.status === 'fulfilled'
    ? (relatedRes.value?.tasks?.[0]?.result?.[0]?.items || [])
    : []

  type KeywordItem = {
    keyword?: string
    keyword_data?: {
      keyword?: string
      keyword_info?: {
        search_volume?: number
        keyword_difficulty?: number
        search_intent?: string
      }
    }
  }

  const keywords = [...suggestions, ...related]
    .map((item: KeywordItem) => ({
      keyword: item.keyword_data?.keyword || item.keyword || '',
      searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
      difficulty: item.keyword_data?.keyword_info?.keyword_difficulty,
      intent: item.keyword_data?.keyword_info?.search_intent,
    }))
    .filter((k) => k.keyword)
    .slice(0, 40)

  return { success: true, data: { seed: input.keyword, keywords } }
}

async function executeContentGap(
  input: ToolInput,
  userDomain?: string,
  credentials?: string
): Promise<ToolResult> {
  if (!input.competitor_domain) {
    return { success: false, error: 'Competitor domain is required' }
  }

  if (!userDomain) {
    return { success: false, error: 'User domain not available for comparison' }
  }

  if (!credentials) {
    return { success: false, error: 'DataForSEO credentials not configured' }
  }

  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_intersection/live',
    [{
      target1: input.competitor_domain,
      target2: userDomain,
      intersections: false,
      location_code: 2840,
      language_code: 'en',
      limit: 40,
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
    }],
    credentials
  )

  type IntersectionItem = {
    keyword_data?: {
      keyword?: string
      keyword_info?: {
        search_volume?: number
        keyword_difficulty?: number
      }
    }
    first_domain_serp_element?: {
      serp_item?: {
        rank_absolute?: number
      }
    }
  }

  const items = response?.tasks?.[0]?.result?.[0]?.items || []
  const gaps: KeywordGap[] = items.slice(0, 40).map((item: IntersectionItem) => ({
    keyword: item.keyword_data?.keyword || '',
    searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
    difficulty: item.keyword_data?.keyword_info?.keyword_difficulty,
    competitorPosition: item.first_domain_serp_element?.serp_item?.rank_absolute || 0,
    competitorDomain: input.competitor_domain!,
  }))

  return { success: true, data: gaps }
}

async function executeAdIntel(input: ToolInput): Promise<ToolResult> {
  if (!input.company_name) {
    return { success: false, error: 'Company name is required' }
  }

  const errors: string[] = []
  const adData = await fetchAdLibrary(input.company_name, errors)

  if (errors.length > 0 && !adData) {
    return { success: false, error: errors.join(', ') }
  }

  return { success: true, data: adData as AdLibraryResult }
}

// =============================================================================
// HELPERS
// =============================================================================

async function dataForSEORequest(
  url: string,
  body: unknown[],
  credentials: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}
