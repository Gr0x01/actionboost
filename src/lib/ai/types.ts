import type { Attachment } from '@/lib/types/database'

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
  productDescription: string
  currentTraction: string
  tacticsAndResults: string // Merged: what tactics tried + how they're going
  focusArea: FocusArea
  customFocusArea?: string // Only used when focusArea is 'custom'

  // Optional fields
  competitorUrls?: string[]
  websiteUrl?: string
  analyticsSummary?: string
  constraints?: string
  attachments?: Attachment[]

  // Legacy fields (for backwards compatibility with old runs)
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
 * Research results from Tavily + DataForSEO
 */
export type ResearchContext = {
  // Tavily web search results
  competitorInsights: TavilyResult[]
  marketTrends: TavilyResult[]
  growthTactics: TavilyResult[]

  // DataForSEO metrics (if competitor URLs provided)
  seoMetrics: CompetitorSEOMetrics[]

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
