import { tavily } from '@tavily/core'
import type {
  RunInput,
  ResearchContext,
  TavilyResult,
  CompetitorSEOMetrics,
  FocusArea,
  RankedKeyword,
} from './types'

const TAVILY_TIMEOUT = 15000 // 15s per search
const DATAFORSEO_TIMEOUT = 10000 // 10s per endpoint (parallel within domain)

/**
 * Run all research: Tavily web searches + DataForSEO competitor metrics
 * DataForSEO endpoints are selected based on focus area
 */
export async function runResearch(input: RunInput): Promise<ResearchContext> {
  const errors: string[] = []

  // Initialize Tavily client
  const tvly = tavily({ apiKey: process.env.TAVILY_API! })

  // Build search queries based on input
  const productCategory = extractCategory(input.productDescription)

  // Run Tavily searches in parallel
  const [competitorResults, marketResults, tacticsResults] = await Promise.allSettled([
    searchWithTimeout(tvly, buildCompetitorQuery(input), TAVILY_TIMEOUT),
    searchWithTimeout(tvly, `${productCategory} market trends 2025`, TAVILY_TIMEOUT),
    searchWithTimeout(tvly, `growth tactics for ${productCategory} startups`, TAVILY_TIMEOUT),
  ])

  // Process Tavily results (extract or use empty array on failure)
  const competitorInsights = extractTavilyResults(competitorResults, errors, 'competitor search')
  const marketTrends = extractTavilyResults(marketResults, errors, 'market trends')
  const growthTactics = extractTavilyResults(tacticsResults, errors, 'growth tactics')

  // DataForSEO: Only if competitor URLs provided
  let seoMetrics: CompetitorSEOMetrics[] = []
  if (input.competitorUrls?.length) {
    seoMetrics = await fetchSEOMetrics(input.competitorUrls, input.focusArea, errors)
  }

  return {
    competitorInsights,
    marketTrends,
    growthTactics,
    seoMetrics,
    researchCompletedAt: new Date().toISOString(),
    errors,
  }
}

// =============================================================================
// TAVILY HELPERS
// =============================================================================

async function searchWithTimeout(
  tvly: ReturnType<typeof tavily>,
  query: string,
  timeout: number
): Promise<TavilyResult[]> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Tavily search timed out after ${timeout}ms`)), timeout)
  )

  const response = await Promise.race([
    tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 5,
      includeRawContent: false,
      topic: 'general',
    }),
    timeoutPromise,
  ])

  return (response.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }))
}

function extractTavilyResults(
  result: PromiseSettledResult<TavilyResult[]>,
  errors: string[],
  label: string
): TavilyResult[] {
  if (result.status === 'fulfilled') {
    return result.value
  }
  errors.push(`Tavily ${label} failed: ${result.reason}`)
  return []
}

function buildCompetitorQuery(input: RunInput): string {
  if (input.competitorUrls?.length) {
    const domains = input.competitorUrls.slice(0, 3).map(extractDomain).join(' OR ')
    return `${domains} growth strategy marketing tactics`
  }
  return `${extractCategory(input.productDescription)} competitors analysis growth strategy`
}

function extractCategory(description: string): string {
  const firstSentence = description.split(/[.!?]/)[0]
  return firstSentence.slice(0, 80).trim()
}

function extractDomain(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    return new URL(normalized).hostname.replace('www.', '')
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
  }
}

// =============================================================================
// DATAFORSEO - FOCUS AREA ROUTING
// =============================================================================

type EndpointType = 'domain_metrics' | 'ranked_keywords' | 'competitors' | 'backlinks' | 'referrers'

/**
 * Map focus area to which DataForSEO endpoints to call
 * Acquisition/custom get full SEO intel, others get minimal
 */
function getEndpointsForFocusArea(focusArea: FocusArea): EndpointType[] {
  switch (focusArea) {
    case 'acquisition':
      return ['domain_metrics', 'ranked_keywords', 'competitors', 'backlinks', 'referrers']
    case 'referral':
      return ['domain_metrics', 'backlinks', 'referrers']
    case 'activation':
    case 'retention':
    case 'monetization':
      return ['domain_metrics'] // Minimal - SEO not as relevant
    case 'custom':
      return ['domain_metrics', 'ranked_keywords', 'competitors', 'backlinks', 'referrers']
    default:
      return ['domain_metrics']
  }
}

/**
 * Fetch SEO metrics from DataForSEO based on focus area
 */
async function fetchSEOMetrics(
  urls: string[],
  focusArea: FocusArea,
  errors: string[]
): Promise<CompetitorSEOMetrics[]> {
  // Validate credentials exist
  const credentials = getDataForSEOCredentials()
  if (!credentials) {
    errors.push('DataForSEO credentials not configured - skipping SEO metrics')
    return []
  }

  const endpoints = getEndpointsForFocusArea(focusArea)
  const results: CompetitorSEOMetrics[] = []

  // Limit to 3 competitors to stay within budget
  for (const url of urls.slice(0, 3)) {
    const domain = extractDomain(url)
    try {
      const metrics = await fetchDomainSEOData(domain, endpoints, credentials, errors)
      results.push(metrics)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      errors.push(`DataForSEO failed for ${domain}: ${errorMsg}`)
      results.push({ domain, error: errorMsg })
    }
  }

  return results
}

function getDataForSEOCredentials(): string | null {
  if (process.env.DATAFORSEO_BASE64) {
    return process.env.DATAFORSEO_BASE64
  }
  if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
    return Buffer.from(
      `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
    ).toString('base64')
  }
  return null
}

/**
 * Fetch all selected endpoints for a single domain in parallel
 */
async function fetchDomainSEOData(
  domain: string,
  endpoints: EndpointType[],
  credentials: string,
  errors: string[]
): Promise<CompetitorSEOMetrics> {
  const metrics: CompetitorSEOMetrics = { domain }

  // Build fetch promises for each endpoint
  const fetches: Promise<void>[] = []

  if (endpoints.includes('domain_metrics')) {
    fetches.push(
      fetchDomainMetrics(domain, credentials)
        .then((data) => {
          metrics.organicTraffic = data.organicTraffic
          metrics.organicKeywords = data.organicKeywords
        })
        .catch((err) => errors.push(`domain_metrics for ${domain}: ${err.message}`))
    )
  }

  if (endpoints.includes('ranked_keywords')) {
    fetches.push(
      fetchRankedKeywords(domain, credentials)
        .then((data) => {
          metrics.topRankedKeywords = data
        })
        .catch((err) => errors.push(`ranked_keywords for ${domain}: ${err.message}`))
    )
  }

  if (endpoints.includes('competitors')) {
    fetches.push(
      fetchCompetitorDomains(domain, credentials)
        .then((data) => {
          metrics.competitorDomains = data
        })
        .catch((err) => errors.push(`competitors for ${domain}: ${err.message}`))
    )
  }

  if (endpoints.includes('backlinks')) {
    fetches.push(
      fetchBacklinksSummary(domain, credentials)
        .then((data) => {
          metrics.backlinks = data.backlinks
          metrics.referringDomains = data.referringDomains
          metrics.domainRank = data.domainRank
        })
        .catch((err) => errors.push(`backlinks for ${domain}: ${err.message}`))
    )
  }

  if (endpoints.includes('referrers')) {
    fetches.push(
      fetchTopReferrers(domain, credentials)
        .then((data) => {
          metrics.topReferrers = data
        })
        .catch((err) => errors.push(`referrers for ${domain}: ${err.message}`))
    )
  }

  // Run all fetches in parallel
  await Promise.allSettled(fetches)

  return metrics
}

// =============================================================================
// DATAFORSEO ENDPOINT IMPLEMENTATIONS
// =============================================================================

async function fetchDomainMetrics(
  domain: string,
  credentials: string
): Promise<{ organicTraffic?: number; organicKeywords?: number }> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_metrics_by_categories/live',
    [{ target: domain, location_code: 2840, language_code: 'en' }],
    credentials
  )

  const metrics = response?.tasks?.[0]?.result?.[0]?.metrics?.organic
  return {
    organicTraffic: metrics?.etv,
    organicKeywords: metrics?.count,
  }
}

async function fetchRankedKeywords(
  domain: string,
  credentials: string
): Promise<RankedKeyword[]> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live',
    [{
      target: domain,
      location_code: 2840,
      language_code: 'en',
      limit: 10, // Top 10 keywords
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
    }],
    credentials
  )

  const items = response?.tasks?.[0]?.result?.[0]?.items || []
  return items.slice(0, 10).map((item: RankedKeywordItem) => ({
    keyword: item.keyword_data?.keyword || '',
    position: item.ranked_serp_element?.serp_item?.rank_absolute || 0,
    searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
    traffic: item.keyword_data?.keyword_info?.estimated_paid_traffic_cost,
  }))
}

async function fetchCompetitorDomains(
  domain: string,
  credentials: string
): Promise<string[]> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live',
    [{
      target: domain,
      location_code: 2840,
      language_code: 'en',
      limit: 5,
    }],
    credentials
  )

  const items = response?.tasks?.[0]?.result?.[0]?.items || []
  return items.slice(0, 5).map((item: CompetitorDomainItem) => item.domain || '')
}

async function fetchBacklinksSummary(
  domain: string,
  credentials: string
): Promise<{ backlinks?: number; referringDomains?: number; domainRank?: number }> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/backlinks/summary/live',
    [{ target: domain }],
    credentials
  )

  const result = response?.tasks?.[0]?.result?.[0]
  return {
    backlinks: result?.backlinks,
    referringDomains: result?.referring_domains,
    domainRank: result?.rank,
  }
}

async function fetchTopReferrers(
  domain: string,
  credentials: string
): Promise<string[]> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/backlinks/referring_domains/live',
    [{
      target: domain,
      limit: 10,
      order_by: ['rank,desc'],
    }],
    credentials
  )

  const items = response?.tasks?.[0]?.result?.[0]?.items || []
  return items.slice(0, 10).map((item: ReferringDomainItem) => item.domain || '')
}

// =============================================================================
// DATAFORSEO HELPERS
// =============================================================================

type RankedKeywordItem = {
  keyword_data?: {
    keyword?: string
    keyword_info?: {
      search_volume?: number
      estimated_paid_traffic_cost?: number
    }
  }
  ranked_serp_element?: {
    serp_item?: {
      rank_absolute?: number
    }
  }
}

type CompetitorDomainItem = {
  domain?: string
}

type ReferringDomainItem = {
  domain?: string
}

async function dataForSEORequest(
  url: string,
  body: unknown[],
  credentials: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`DataForSEO request timed out`)), DATAFORSEO_TIMEOUT)
  )

  const fetchPromise = fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
  })

  return Promise.race([fetchPromise, timeoutPromise])
}
