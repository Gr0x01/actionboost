/**
 * Apify Integration - G2 Reviews and Ad Library scraping
 *
 * Uses Apify actors to fetch competitive intelligence:
 * - G2 reviews for competitor products
 * - Facebook Ad Library for competitor ad messaging
 */

import type { G2ReviewSummary } from '@/lib/ai/types'

const APIFY_TIMEOUT = 60000 // 60s for actor runs

/**
 * Fetch G2 reviews for a list of competitor products
 * Uses the G2 scraper actor on Apify
 */
export async function fetchG2Reviews(
  productNames: string[],
  errors: string[]
): Promise<G2ReviewSummary[]> {
  const apiKey = process.env.APIFY_API_KEY
  if (!apiKey) {
    errors.push('Apify API key not configured - skipping G2 reviews')
    return []
  }

  const results: G2ReviewSummary[] = []

  // Fetch reviews for each product (in parallel, max 2)
  const fetchPromises = productNames.slice(0, 2).map((name) =>
    fetchSingleG2Product(name, apiKey, errors)
  )

  const settledResults = await Promise.allSettled(fetchPromises)

  for (const result of settledResults) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value)
    }
  }

  return results
}

/**
 * Fetch G2 reviews for a single product
 */
async function fetchSingleG2Product(
  productName: string,
  apiKey: string,
  errors: string[]
): Promise<G2ReviewSummary | null> {
  try {
    // Start the G2 scraper actor
    // Using apify/g2-scraper or similar - adjust actor ID as needed
    const actorId = process.env.APIFY_G2_ACTOR_ID || 'apify~g2-scraper'

    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search: productName,
          maxReviews: 20,
          includeRatings: true,
        }),
      }
    )

    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data?.id

    if (!runId) {
      throw new Error('No run ID returned from Apify')
    }

    // Wait for actor to complete (with timeout)
    const result = await waitForActorResult(runId, apiKey)

    if (!result || result.length === 0) {
      return null
    }

    // Parse the first product result
    const product = result[0]

    // Extract reviews and categorize
    const reviews = product.reviews || []
    const positiveReviews = reviews.filter((r: G2RawReview) => r.rating >= 4)
    const negativeReviews = reviews.filter((r: G2RawReview) => r.rating <= 2)

    return {
      productName: product.name || productName,
      overallRating: product.averageRating || 0,
      totalReviews: product.totalReviews || reviews.length,
      topPraises: extractThemes(positiveReviews, 'likes'),
      topComplaints: extractThemes(negativeReviews, 'dislikes'),
      recentReviews: reviews.slice(0, 5).map((r: G2RawReview) => ({
        rating: r.rating,
        title: r.title || '',
        snippet: (r.text || '').slice(0, 200),
        date: r.date || '',
      })),
    }
  } catch (err) {
    errors.push(`G2 fetch for ${productName} failed: ${err instanceof Error ? err.message : String(err)}`)
    return null
  }
}

/**
 * Wait for Apify actor run to complete and return results
 */
async function waitForActorResult(
  runId: string,
  apiKey: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const startTime = Date.now()

  while (Date.now() - startTime < APIFY_TIMEOUT) {
    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    )

    if (!statusResponse.ok) {
      throw new Error(`Failed to check run status: ${statusResponse.status}`)
    }

    const statusData = await statusResponse.json()
    const status = statusData.data?.status

    if (status === 'SUCCEEDED') {
      // Fetch the dataset
      const datasetId = statusData.data?.defaultDatasetId
      if (!datasetId) {
        throw new Error('No dataset ID in completed run')
      }

      const dataResponse = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}`
      )

      if (!dataResponse.ok) {
        throw new Error(`Failed to fetch dataset: ${dataResponse.status}`)
      }

      return dataResponse.json()
    }

    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Actor run ${status}`)
    }

    // Wait 2 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error('Actor run timed out')
}

type G2RawReview = {
  rating: number
  title?: string
  text?: string
  date?: string
  likes?: string
  dislikes?: string
}

/**
 * Extract common themes from reviews
 */
function extractThemes(reviews: G2RawReview[], field: 'likes' | 'dislikes'): string[] {
  const themes: string[] = []

  for (const review of reviews.slice(0, 10)) {
    const text = review[field]
    if (text && text.length > 10) {
      // Take first sentence or first 100 chars
      const theme = text.split(/[.!?]/)[0].slice(0, 100).trim()
      if (theme && !themes.includes(theme)) {
        themes.push(theme)
      }
    }
  }

  return themes.slice(0, 5) // Top 5 themes
}

/**
 * Fetch Facebook Ad Library data for a competitor
 * Shows what messaging and offers they're using in ads
 */
export async function fetchAdLibrary(
  companyName: string,
  errors: string[]
): Promise<AdLibraryResult | null> {
  const apiKey = process.env.APIFY_API_KEY
  if (!apiKey) {
    errors.push('Apify API key not configured - skipping Ad Library')
    return null
  }

  try {
    const actorId = process.env.APIFY_ADLIBRARY_ACTOR_ID || 'apify~facebook-ads-library-scraper'

    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: companyName,
          countryCode: 'US',
          maxAds: 10,
        }),
      }
    )

    if (!runResponse.ok) {
      throw new Error(`Apify run failed: ${runResponse.status}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data?.id

    if (!runId) {
      throw new Error('No run ID returned from Apify')
    }

    const result = await waitForActorResult(runId, apiKey)

    if (!result || result.length === 0) {
      return null
    }

    return {
      companyName,
      activeAds: result.length,
      ads: result.slice(0, 5).map((ad: FacebookAdRaw) => ({
        headline: ad.ad_creative_bodies?.[0] || '',
        linkText: ad.ad_creative_link_titles?.[0] || '',
        callToAction: ad.ad_creative_link_captions?.[0] || '',
        startDate: ad.ad_delivery_start_time || '',
        platforms: ad.publisher_platforms || [],
      })),
    }
  } catch (err) {
    errors.push(`Ad Library fetch for ${companyName} failed: ${err instanceof Error ? err.message : String(err)}`)
    return null
  }
}

type FacebookAdRaw = {
  ad_creative_bodies?: string[]
  ad_creative_link_titles?: string[]
  ad_creative_link_captions?: string[]
  ad_delivery_start_time?: string
  publisher_platforms?: string[]
}

export type AdLibraryResult = {
  companyName: string
  activeAds: number
  ads: Array<{
    headline: string
    linkText: string
    callToAction: string
    startDate: string
    platforms: string[]
  }>
}
