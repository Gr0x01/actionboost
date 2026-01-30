/**
 * AARRR-based focus areas - each triggers a different analytical lens
 * This drives natural multi-run behavior (do Acquisition, then Retention, etc.)
 */
export type FocusArea =
  | 'acquisition'    // "How do I get more users?"
  | 'activation'     // "Users sign up but don't stick"
  | 'retention'      // "Users leave after a few weeks"
  | 'referral'       // "How do I get users to spread the word?"
  | 'monetization'   // "I have users but no revenue"
  | 'custom'         // "Something else: ___________"

export const FOCUS_AREA_LABELS: Record<FocusArea, string> = {
  acquisition: 'Acquisition - "How do I get more users?"',
  activation: 'Activation - "Users sign up but don\'t stick"',
  retention: 'Retention - "Users leave after a few weeks"',
  referral: 'Referral - "How do I get users to spread the word?"',
  monetization: 'Monetization - "I have users but no revenue"',
  custom: 'Custom focus area',
}

/**
 * Input from the user form (stored in runs.input JSONB)
 */
export type RunInput = {
  // Required fields
  productDescription: string // Now includes tactics/what they've tried
  currentTraction: string
  focusArea: FocusArea
  customFocusArea?: string // Only used when focusArea is 'custom'

  // Positioning
  alternatives?: string[] // What do people do instead? (competitive alternatives)

  // Optional fields
  competitorUrls?: string[]
  websiteUrl?: string
  analyticsSummary?: string
  constraints?: string

  // Legacy fields (for backwards compatibility with old runs)
  tacticsAndResults?: string
  whatYouTried?: string
  whatsWorking?: string
}

/**
 * Single Tavily search result
 */
export type TavilyResult = {
  title: string
  url: string
  content: string
  score: number
}

/**
 * Ranked keyword data from DataForSEO Labs
 */
export type RankedKeyword = {
  keyword: string
  position: number
  searchVolume: number
  traffic?: number
}

/**
 * SEO metrics for a competitor domain from DataForSEO
 * Fields populated depend on focus area (acquisition gets more data)
 */
export type CompetitorSEOMetrics = {
  domain: string

  // Basic metrics (all focus areas)
  organicTraffic?: number
  organicKeywords?: number

  // Keyword data (acquisition, custom)
  topRankedKeywords?: RankedKeyword[]

  // Backlink data (acquisition, referral, custom)
  backlinks?: number
  referringDomains?: number
  domainRank?: number
  topReferrers?: string[]

  // Competitor overlap (acquisition, custom)
  competitorDomains?: string[]

  error?: string // If this specific domain lookup failed
}

/**
 * User's own SEO landscape from DataForSEO
 */
export type UserSEOLandscape = {
  domain: string
  organicTraffic?: number
  organicKeywords?: number
  topRankedKeywords?: RankedKeyword[]
  keywordGaps?: KeywordGap[] // Keywords competitors rank for that user doesn't
  domainRank?: number
  error?: string
}

/**
 * Keyword gap - competitor ranks, user doesn't
 */
export type KeywordGap = {
  keyword: string
  searchVolume: number
  difficulty?: number
  competitorPosition: number
  competitorDomain: string
}

/**
 * Reddit discussion from Tavily site-scoped search
 */
export type RedditDiscussion = {
  title: string
  url: string
  subreddit: string
  content: string
  score: number
}

/**
 * G2 review summary from Apify
 */
export type G2ReviewSummary = {
  productName: string
  overallRating: number
  totalReviews: number
  topPraises: string[]
  topComplaints: string[]
  recentReviews: Array<{
    rating: number
    title: string
    snippet: string
    date: string
  }>
}

/**
 * Traffic intel from SimilarWeb
 */
export type TrafficIntel = {
  domain: string
  monthlyVisits?: number
  topTrafficSources?: Array<{
    source: string
    percentage: number
  }>
  topReferrers?: string[]
  audienceInterests?: string[]
  geographyBreakdown?: Array<{
    country: string
    percentage: number
  }>
  error?: string
}

/**
 * ProductHunt launch data
 */
export type ProductHuntLaunch = {
  name: string
  tagline: string
  url: string
  votesCount: number
  commentsCount: number
  launchedAt: string
  topics: string[]
}

/**
 * Research results from all data sources
 */
export type ResearchContext = {
  // User's own SEO (NEW)
  userSEO?: UserSEOLandscape

  // Tavily web search results
  competitorInsights: TavilyResult[]
  marketTrends: TavilyResult[]
  growthTactics: TavilyResult[]

  // Reddit sentiment (NEW)
  redditDiscussions?: RedditDiscussion[]

  // DataForSEO metrics (if competitor URLs provided)
  seoMetrics: CompetitorSEOMetrics[]

  // G2 reviews (NEW)
  g2Reviews?: G2ReviewSummary[]

  // Traffic intel (NEW)
  trafficIntel?: TrafficIntel[]

  // ProductHunt launches (NEW)
  productHuntLaunches?: ProductHuntLaunch[]

  // Metadata
  researchCompletedAt: string
  errors: string[] // Track partial failures
}

/**
 * Pipeline execution result
 */
export type PipelineResult = {
  success: boolean
  output?: string // Markdown strategy
  error?: string // Error message if failed
  researchContext?: ResearchContext
}

/**
 * User history context for RAG - pulled from past runs via vector search
 * Enables Claude to build on previous recommendations and track progress
 */
export type UserHistoryContext = {
  totalRuns: number
  previousTraction: Array<{ date: string; summary: string }>
  tacticsTried: string[]
  pastRecommendations: string[]
  pastInsights: string[]
}
