import { tavily } from '@tavily/core'
import type {
  RunInput,
  ResearchContext,
  TavilyResult,
  CompetitorSEOMetrics,
  FocusArea,
  RankedKeyword,
  UserSEOLandscape,
  KeywordGap,
  RedditDiscussion,
  G2ReviewSummary,
  ProductHuntLaunch,
} from './types'
import { fetchG2Reviews } from '@/lib/integrations/apify'
import { searchProductHunt, categoryToTopicSlug, searchProductHuntByTopic } from '@/lib/integrations/producthunt'

const TAVILY_TIMEOUT = 15000 // 15s per search
const DATAFORSEO_TIMEOUT = 10000 // 10s per endpoint (parallel within domain)

/**
 * Run all research: Tavily web searches + DataForSEO for user + competitors
 * DataForSEO endpoints are selected based on focus area
 */
export async function runResearch(input: RunInput): Promise<ResearchContext> {
  const errors: string[] = []

  // Initialize Tavily client
  const tvly = tavily({ apiKey: process.env.TAVILY_API! })

  // Build search queries based on input
  const productCategory = extractCategory(input.productDescription)

  // Phase 1: Run all Tavily searches in parallel (including Reddit)
  const [competitorResults, marketResults, tacticsResults, redditResults] = await Promise.allSettled([
    searchWithTimeout(tvly, buildCompetitorQuery(input), TAVILY_TIMEOUT),
    searchWithTimeout(tvly, `${productCategory} market trends 2025`, TAVILY_TIMEOUT),
    searchWithTimeout(tvly, `growth tactics for ${productCategory} startups`, TAVILY_TIMEOUT),
    searchReddit(tvly, productCategory, errors),
  ])

  // Process Tavily results
  const competitorInsights = extractTavilyResults(competitorResults, errors, 'competitor search')
  const marketTrends = extractTavilyResults(marketResults, errors, 'market trends')
  const growthTactics = extractTavilyResults(tacticsResults, errors, 'growth tactics')
  const redditDiscussions = redditResults.status === 'fulfilled' ? redditResults.value : []

  // Phase 2: All API calls in parallel
  const credentials = getDataForSEOCredentials()
  const userDomain = input.websiteUrl ? extractDomain(input.websiteUrl) : null
  const competitorDomains = (input.competitorUrls || []).slice(0, 3).map(extractDomain)

  // Extract competitor names for G2 search (best effort from domains)
  const competitorNames = competitorDomains.map((d) =>
    d.replace(/\.(com|io|co|ai|app|dev|so|xyz)$/, '').replace(/-/g, ' ')
  )

  // Run all API calls in parallel
  const [
    userSEOResult,
    competitorSEOResult,
    keywordGapsResult,
    g2ReviewsResult,
    productHuntResult,
  ] = await Promise.allSettled([
    // DataForSEO - user's domain
    credentials && userDomain
      ? fetchUserSEO(userDomain, credentials, errors)
      : Promise.resolve(undefined),
    // DataForSEO - competitor domains
    credentials && competitorDomains.length > 0
      ? fetchSEOMetrics(input.competitorUrls!, input.focusArea, errors)
      : Promise.resolve([]),
    // DataForSEO - keyword gaps
    credentials && userDomain && competitorDomains.length > 0
      ? fetchKeywordGaps(userDomain, competitorDomains, credentials, errors)
      : Promise.resolve([]),
    // Apify - G2 reviews
    competitorNames.length > 0
      ? fetchG2Reviews(competitorNames, errors)
      : Promise.resolve([]),
    // ProductHunt - recent launches (via Tavily scraping)
    fetchProductHuntLaunches(productCategory, errors),
  ])

  // Extract results
  const userSEO: UserSEOLandscape | undefined =
    userSEOResult.status === 'fulfilled' ? userSEOResult.value : undefined
  const seoMetrics: CompetitorSEOMetrics[] =
    competitorSEOResult.status === 'fulfilled' ? competitorSEOResult.value : []
  const keywordGaps: KeywordGap[] =
    keywordGapsResult.status === 'fulfilled' ? keywordGapsResult.value : []
  const g2Reviews: G2ReviewSummary[] =
    g2ReviewsResult.status === 'fulfilled' ? g2ReviewsResult.value : []
  const productHuntLaunches: ProductHuntLaunch[] =
    productHuntResult.status === 'fulfilled' ? productHuntResult.value : []

  // Attach keyword gaps to user SEO if we have them
  if (userSEO && keywordGaps.length > 0) {
    userSEO.keywordGaps = keywordGaps
  }

  // Log errors for missing credentials (but don't fail)
  if (!credentials && input.competitorUrls?.length) {
    errors.push('DataForSEO credentials not configured - skipping SEO metrics')
  }

  return {
    userSEO,
    competitorInsights,
    marketTrends,
    growthTactics,
    redditDiscussions,
    seoMetrics,
    g2Reviews,
    // trafficIntel - SimilarWeb disabled (too expensive)
    productHuntLaunches,
    researchCompletedAt: new Date().toISOString(),
    errors,
  }
}

/**
 * Fetch ProductHunt launches - tries category search, falls back to topic
 */
async function fetchProductHuntLaunches(
  category: string,
  errors: string[]
): Promise<ProductHuntLaunch[]> {
  // Try direct search first
  let launches = await searchProductHunt(category, errors)

  // If no results, try topic slug
  if (launches.length === 0) {
    const topicSlug = categoryToTopicSlug(category)
    launches = await searchProductHuntByTopic(topicSlug, errors)
  }

  return launches
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
      maxResults: 7,
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
// REDDIT SEARCH (via Tavily site-scoped)
// =============================================================================

/**
 * Search Reddit for discussions about the product category
 * Uses Tavily with site:reddit.com to find pain points and discussions
 */
async function searchReddit(
  tvly: ReturnType<typeof tavily>,
  productCategory: string,
  errors: string[]
): Promise<RedditDiscussion[]> {
  try {
    const query = `site:reddit.com ${productCategory} problems OR complaints OR help OR recommendations`

    const response = await Promise.race([
      tvly.search(query, {
        searchDepth: 'advanced',
        maxResults: 10,
        includeRawContent: false,
        topic: 'general',
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Reddit search timed out')), TAVILY_TIMEOUT)
      ),
    ])

    return (response.results || []).map((r) => {
      // Extract subreddit from URL (e.g., /r/SaaS/)
      const subredditMatch = r.url.match(/reddit\.com\/r\/([^/]+)/)
      const subreddit = subredditMatch ? subredditMatch[1] : 'unknown'

      return {
        title: r.title,
        url: r.url,
        subreddit,
        content: r.content,
        score: r.score,
      }
    })
  } catch (err) {
    errors.push(`Reddit search failed: ${err instanceof Error ? err.message : String(err)}`)
    return []
  }
}

// =============================================================================
// USER SEO ANALYSIS (DataForSEO)
// =============================================================================

/**
 * Fetch SEO data for user's own domain
 * Helps them understand their current position before growth recommendations
 */
async function fetchUserSEO(
  domain: string,
  credentials: string,
  errors: string[]
): Promise<UserSEOLandscape | undefined> {
  const landscape: UserSEOLandscape = { domain }

  // Fetch domain metrics + ranked keywords in parallel
  const [metricsResult, keywordsResult] = await Promise.allSettled([
    fetchDomainMetrics(domain, credentials),
    fetchRankedKeywords(domain, credentials),
  ])

  if (metricsResult.status === 'fulfilled') {
    landscape.organicTraffic = metricsResult.value.organicTraffic
    landscape.organicKeywords = metricsResult.value.organicKeywords
  } else {
    errors.push(`User domain metrics failed: ${metricsResult.reason}`)
  }

  if (keywordsResult.status === 'fulfilled') {
    landscape.topRankedKeywords = keywordsResult.value
  } else {
    errors.push(`User ranked keywords failed: ${keywordsResult.reason}`)
  }

  // Get backlinks for domain rank
  try {
    const backlinksData = await fetchBacklinksSummary(domain, credentials)
    landscape.domainRank = backlinksData.domainRank
  } catch (err) {
    errors.push(`User backlinks failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  return landscape
}

/**
 * Fetch keyword gaps: keywords competitors rank for that user doesn't
 * Uses DataForSEO domain_intersection with intersections=false
 */
async function fetchKeywordGaps(
  userDomain: string,
  competitorDomains: string[],
  credentials: string,
  errors: string[]
): Promise<KeywordGap[]> {
  const gaps: KeywordGap[] = []

  // Run intersection queries for each competitor (in parallel)
  const results = await Promise.allSettled(
    competitorDomains.map((competitor) =>
      fetchDomainIntersection(userDomain, competitor, credentials)
    )
  )

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const competitor = competitorDomains[i]

    if (result.status === 'fulfilled') {
      gaps.push(...result.value)
    } else {
      errors.push(`Keyword gap analysis for ${competitor} failed: ${result.reason}`)
    }
  }

  // Sort by search volume and dedupe (same keyword from multiple competitors)
  const uniqueGaps = new Map<string, KeywordGap>()
  for (const gap of gaps) {
    const existing = uniqueGaps.get(gap.keyword)
    // Keep the one with higher search volume or better competitor position
    if (!existing || gap.searchVolume > existing.searchVolume) {
      uniqueGaps.set(gap.keyword, gap)
    }
  }

  return Array.from(uniqueGaps.values())
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 20) // Top 20 keyword gaps
}

/**
 * Fetch keywords competitor ranks for but user doesn't (domain_intersection)
 */
async function fetchDomainIntersection(
  userDomain: string,
  competitorDomain: string,
  credentials: string
): Promise<KeywordGap[]> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_intersection/live',
    [{
      target1: competitorDomain, // Competitor (has keywords)
      target2: userDomain,       // User (lacks keywords)
      intersections: false,      // Keywords competitor has that user doesn't
      location_code: 2840,
      language_code: 'en',
      limit: 30,
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
    }],
    credentials
  )

  const items = response?.tasks?.[0]?.result?.[0]?.items || []
  return items.slice(0, 30).map((item: DomainIntersectionItem) => ({
    keyword: item.keyword_data?.keyword || '',
    searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
    difficulty: item.keyword_data?.keyword_info?.keyword_difficulty,
    competitorPosition: item.first_domain_serp_element?.serp_item?.rank_absolute || 0,
    competitorDomain,
  }))
}

type DomainIntersectionItem = {
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

export function getDataForSEOCredentials(): string | null {
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
        .catch((err) => { errors.push(`domain_metrics for ${domain}: ${err.message}`) })
    )
  }

  if (endpoints.includes('ranked_keywords')) {
    fetches.push(
      fetchRankedKeywords(domain, credentials)
        .then((data) => {
          metrics.topRankedKeywords = data
        })
        .catch((err) => { errors.push(`ranked_keywords for ${domain}: ${err.message}`) })
    )
  }

  if (endpoints.includes('competitors')) {
    fetches.push(
      fetchCompetitorDomains(domain, credentials)
        .then((data) => {
          metrics.competitorDomains = data
        })
        .catch((err) => { errors.push(`competitors for ${domain}: ${err.message}`) })
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
        .catch((err) => { errors.push(`backlinks for ${domain}: ${err.message}`) })
    )
  }

  if (endpoints.includes('referrers')) {
    fetches.push(
      fetchTopReferrers(domain, credentials)
        .then((data) => {
          metrics.topReferrers = data
        })
        .catch((err) => { errors.push(`referrers for ${domain}: ${err.message}`) })
    )
  }

  // Run all fetches in parallel
  await Promise.allSettled(fetches)

  return metrics
}

// =============================================================================
// DATAFORSEO ENDPOINT IMPLEMENTATIONS
// =============================================================================

export async function fetchDomainMetrics(
  domain: string,
  credentials: string
): Promise<{ organicTraffic?: number; organicKeywords?: number }> {
  const response = await dataForSEORequest(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live',
    [{ target: domain, location_code: 2840, language_code: 'en' }],
    credentials
  )

  const metrics = response?.tasks?.[0]?.result?.[0]?.items?.[0]?.metrics?.organic
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
      limit: 15, // Top 15 keywords
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
    }],
    credentials
  )

  const items = response?.tasks?.[0]?.result?.[0]?.items || []
  return items.slice(0, 15).map((item: RankedKeywordItem) => ({
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

// =============================================================================
// TAVILY-ONLY RESEARCH (for free tier)
// =============================================================================

