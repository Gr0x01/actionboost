/**
 * ProductHunt Integration - Launch Intelligence via Tavily scraping
 *
 * Uses Tavily site:producthunt.com search to find recent launches
 * No API key required - works with existing Tavily setup
 */

import { tavily } from '@tavily/core'
import type { ProductHuntLaunch } from '@/lib/ai/types'

const TAVILY_TIMEOUT = 15000

/**
 * Search ProductHunt for recent launches in a category via Tavily
 */
export async function searchProductHunt(
  category: string,
  errors: string[]
): Promise<ProductHuntLaunch[]> {
  try {
    const tvly = tavily({ apiKey: process.env.TAVILY_API! })

    const query = `site:producthunt.com ${category} launched 2025 2024`

    const response = await Promise.race([
      tvly.search(query, {
        searchDepth: 'advanced',
        maxResults: 10,
        includeRawContent: false,
        topic: 'general',
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('ProductHunt search timed out')), TAVILY_TIMEOUT)
      ),
    ])

    return (response.results || [])
      .filter((r) => r.url.includes('producthunt.com/posts/'))
      .map((r) => {
        // Extract product name from URL (e.g., /posts/product-name)
        const urlMatch = r.url.match(/producthunt\.com\/posts\/([^/?]+)/)
        const slug = urlMatch ? urlMatch[1] : ''
        const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

        // Try to extract tagline from content (usually first sentence)
        const tagline = r.content?.split(/[.!?]/)[0]?.trim() || ''

        return {
          name: name || r.title.replace(' | Product Hunt', '').trim(),
          tagline: tagline.slice(0, 150),
          url: r.url,
          votesCount: 0, // Not available from scrape
          commentsCount: 0,
          launchedAt: '', // Not reliably extractable
          topics: [], // Would need to parse page
        }
      })
      .slice(0, 8)
  } catch (err) {
    errors.push(`ProductHunt search failed: ${err instanceof Error ? err.message : String(err)}`)
    return []
  }
}

/**
 * Search by topic - same implementation, just different query
 */
export async function searchProductHuntByTopic(
  topicSlug: string,
  errors: string[]
): Promise<ProductHuntLaunch[]> {
  // Convert slug back to readable form
  const topic = topicSlug.replace(/-/g, ' ')
  return searchProductHunt(topic, errors)
}

/**
 * Map common product categories to search terms
 * Kept for backwards compatibility but less important now
 */
export function categoryToTopicSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-')
}
