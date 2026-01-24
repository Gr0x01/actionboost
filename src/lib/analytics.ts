import { PostHog } from "posthog-node";

const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1, // Send immediately (important for serverless)
      flushInterval: 0, // Disable interval batching
    })
  : null;

// =============================================================================
// API CALL TRACKING
// =============================================================================

export type ApiService = 'anthropic' | 'tavily' | 'dataforseo' | 'scrapingdog'
export type ApiEndpoint =
  | 'messages.create'
  | 'search'
  | 'extract'
  | 'domain_rank_overview'
  | 'domain_intersection'
  | 'scrape'

export type ApiCallProperties = {
  service: ApiService
  endpoint: ApiEndpoint
  run_id?: string
  latency_ms: number
  success: boolean
  error?: string
  // Anthropic-specific
  input_tokens?: number
  output_tokens?: number
  model?: string
  // Cost
  estimated_cost_usd: number
}

// Cost constants (USD)
const API_COSTS = {
  anthropic: {
    // Claude Opus 4.5 pricing per 1M tokens
    input_per_million: 15,
    output_per_million: 75,
  },
  tavily: {
    search: 0.01,
    extract: 0.05,
  },
  dataforseo: {
    domain_rank_overview: 0.02,
    domain_intersection: 0.05,
  },
  scrapingdog: {
    scrape: 0.001,
  },
} as const

/**
 * Calculate estimated cost for an API call
 */
export function calculateApiCost(
  service: ApiService,
  endpoint: ApiEndpoint,
  options?: { inputTokens?: number; outputTokens?: number }
): number {
  switch (service) {
    case 'anthropic': {
      const inputCost = ((options?.inputTokens || 0) / 1_000_000) * API_COSTS.anthropic.input_per_million
      const outputCost = ((options?.outputTokens || 0) / 1_000_000) * API_COSTS.anthropic.output_per_million
      return inputCost + outputCost
    }
    case 'tavily':
      return endpoint === 'search' ? API_COSTS.tavily.search : API_COSTS.tavily.extract
    case 'dataforseo':
      return endpoint === 'domain_rank_overview'
        ? API_COSTS.dataforseo.domain_rank_overview
        : API_COSTS.dataforseo.domain_intersection
    case 'scrapingdog':
      return API_COSTS.scrapingdog.scrape
    default:
      return 0
  }
}

/**
 * Track an API call to PostHog
 * Must await flush in serverless environments or events won't be sent
 */
export async function trackApiCall(
  distinctId: string,
  properties: ApiCallProperties
): Promise<void> {
  try {
    posthog?.capture({
      distinctId,
      event: 'api_call',
      properties,
    })
    await posthog?.flush()
  } catch {
    // Silently ignore - API tracking should never break business logic
  }
}

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  try {
    posthog?.capture({ distinctId, event, properties });
    await posthog?.flush();
  } catch (err) {
    console.error("PostHog tracking failed:", err);
    // Don't throw - analytics should never break business logic
  }
}

export async function identifyUser(
  distinctId: string,
  email: string,
  properties?: Record<string, unknown>
) {
  try {
    posthog?.identify({ distinctId, properties: { email, ...properties } });
    await posthog?.flush();
  } catch (err) {
    console.error("PostHog identify failed:", err);
  }
}
