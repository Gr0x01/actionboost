import Anthropic from '@anthropic-ai/sdk'
import {
  StructuredOutputSchema,
  PartialStructuredOutputSchema,
  FORMATTER_SYSTEM_PROMPT,
  FORMATTER_USER_PROMPT,
  FORMATTER_USER_PROMPT_WITH_RESEARCH,
  type StructuredOutput,
  type PartialStructuredOutput,
} from './formatter-types'
import type { ResearchData } from './pipeline-agentic'

// Sonnet for reliable extraction (understands intent, not just examples)
const FORMATTER_MODEL = 'claude-sonnet-4-20250514'
const FORMATTER_MAX_TOKENS = 16000 // Set high - extraction includes 28 days + priorities + positioning + metrics
const FORMATTER_TIMEOUT_MS = 150000 // 150s - some extractions timeout at 90s

const MODEL_MAX_TOKENS: Record<string, number> = {
  'claude-sonnet-4-20250514': 16000,
  'claude-opus-4-5-20251101': 16000,
}

/**
 * Build research data section for the prompt
 */
function formatResearchDataForPrompt(researchData: ResearchData): string {
  const sections: string[] = []

  if (researchData.searches.length > 0) {
    sections.push(`## Search Results (${researchData.searches.length} searches performed)`)
    for (const search of researchData.searches.slice(0, 5)) {
      sections.push(`Query: "${search.query}"`)
      for (const result of search.results.slice(0, 3)) {
        sections.push(`  - ${result.title}: ${result.snippet.slice(0, 150)}...`)
      }
    }
  }

  if (researchData.seoMetrics.length > 0) {
    sections.push(`\n## SEO Metrics (${researchData.seoMetrics.length} domains analyzed)`)
    for (const seo of researchData.seoMetrics) {
      sections.push(`- ${seo.domain}: Traffic=${seo.traffic?.toLocaleString() || 'N/A'}, Keywords=${seo.keywords?.toLocaleString() || 'N/A'}`)
    }
  }

  if (researchData.keywordGaps.length > 0) {
    sections.push(`\n## Keyword Gaps`)
    for (const gap of researchData.keywordGaps) {
      sections.push(`Competitor: ${gap.competitor}`)
      for (const kw of gap.keywords.slice(0, 10)) {
        sections.push(`  - "${kw.keyword}" (${kw.volume.toLocaleString()}/mo) - ranks #${kw.competitorRank}`)
      }
    }
  }

  if (researchData.scrapes.length > 0) {
    sections.push(`\n## Pages Analyzed (${researchData.scrapes.length} pages)`)
    for (const scrape of researchData.scrapes.slice(0, 3)) {
      sections.push(`- ${scrape.url}: ${scrape.contentSummary.slice(0, 100)}...`)
    }
  }

  if (researchData.screenshots && researchData.screenshots.length > 0) {
    sections.push(`\n## Screenshots Captured (${researchData.screenshots.length} homepages)`)
    for (const ss of researchData.screenshots) {
      sections.push(`- ${ss.url}`)
    }
  }

  return sections.join('\n')
}

/**
 * Extract structured output from markdown using Sonnet
 *
 * Cost: ~$0.04 per run (based on typical ~8000 input tokens, ~2000 output tokens)
 * Latency: ~3-5 seconds
 *
 * @param markdown - The strategy markdown to extract from
 * @param researchData - Optional structured research data from tool calls
 * @param options - Optional config (model override for testing)
 */
export async function extractStructuredOutput(
  markdown: string,
  researchData?: ResearchData,
  options?: { model?: string }
): Promise<StructuredOutput | null> {
  // Early validation - don't fail hard if key is missing during lazy backfill
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Formatter] Missing ANTHROPIC_API_KEY, skipping extraction')
    return null
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // Build user message with optional research data
  const hasResearchData = researchData && (
    researchData.searches.length > 0 ||
    researchData.seoMetrics.length > 0 ||
    researchData.keywordGaps.length > 0 ||
    researchData.scrapes.length > 0
  )

  // Debug logging for research data
  console.log(`[Formatter] Research data received:`, {
    hasResearchData,
    searches: researchData?.searches.length ?? 0,
    seoMetrics: researchData?.seoMetrics.length ?? 0,
    keywordGaps: researchData?.keywordGaps.length ?? 0,
    scrapes: researchData?.scrapes.length ?? 0,
  })

  let userContent: string
  if (hasResearchData) {
    const researchSection = formatResearchDataForPrompt(researchData!)
    userContent = FORMATTER_USER_PROMPT_WITH_RESEARCH + markdown + '\n\n---\nRESEARCH DATA:\n\n' + researchSection
  } else {
    userContent = FORMATTER_USER_PROMPT + markdown
  }

  try {
    const model = options?.model || FORMATTER_MODEL
    const maxTokens = MODEL_MAX_TOKENS[model]
    if (!maxTokens) {
      console.warn(`[Formatter] Unknown model "${model}", using default max_tokens ${FORMATTER_MAX_TOKENS}`)
    }
    const effectiveMaxTokens = maxTokens || FORMATTER_MAX_TOKENS
    console.log(`[Formatter] Starting extraction with ${model} (max_tokens: ${effectiveMaxTokens}, research: ${hasResearchData})...`)
    const startTime = Date.now()

    // Use Promise.race for timeout since Anthropic SDK doesn't support AbortSignal
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Formatter timeout')), FORMATTER_TIMEOUT_MS)
    })

    const response = await Promise.race([
      client.messages.create({
        model,
        max_tokens: effectiveMaxTokens,
        system: FORMATTER_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userContent,
          },
        ],
      }),
      timeoutPromise,
    ])

    const elapsed = Date.now() - startTime
    console.log(`[Formatter] ${model} responded in ${elapsed}ms, tokens: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`)

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      console.error('[Formatter] No text content in Sonnet response')
      return null
    }

    // Parse JSON - handle potential markdown code blocks
    let jsonText = textContent.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7)
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3)
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3)
    }
    jsonText = jsonText.trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseErr) {
      console.error('[Formatter] JSON parse error:', parseErr, 'Raw text:', jsonText.slice(0, 500))
      return null
    }

    // Debug: Log if new research fields are present in parsed JSON
    const parsedObj = parsed as Record<string, unknown>
    console.log(`[Formatter] Parsed JSON has research fields:`, {
      researchSnapshot: !!parsedObj.researchSnapshot,
      competitiveComparison: !!parsedObj.competitiveComparison,
      keywordOpportunities: !!parsedObj.keywordOpportunities,
      marketQuotes: !!parsedObj.marketQuotes,
      positioning: !!parsedObj.positioning,
    })

    // Validate with Zod
    const result = StructuredOutputSchema.safeParse(parsed)
    if (!result.success) {
      console.error('[Formatter] Zod validation failed:', result.error.issues)

      // Try partial validation - still useful for when optional fields are missing
      const partialResult = PartialStructuredOutputSchema.safeParse(parsed)
      if (partialResult.success) {
        console.log('[Formatter] Partial extraction successful')
        return normalizePartialOutput(partialResult.data)
      }

      return null
    }

    console.log(`[Formatter] Successfully extracted structured output`)
    return result.data

  } catch (err) {
    if (err instanceof Error && err.message === 'Formatter timeout') {
      console.error('[Formatter] Sonnet extraction timed out after', FORMATTER_TIMEOUT_MS, 'ms')
    } else {
      console.error('[Formatter] Sonnet extraction failed:', err)
    }
    return null
  }
}


/**
 * Convert partial output to full output with defaults
 */
function normalizePartialOutput(partial: PartialStructuredOutput): StructuredOutput {
  return {
    // Business identifier
    businessName: partial.businessName,
    thisWeek: partial.thisWeek || { days: [] },
    topPriorities: partial.topPriorities || [],
    metrics: partial.metrics || [],
    competitors: partial.competitors || [],
    currentWeek: partial.currentWeek || 1,
    roadmapWeeks: partial.roadmapWeeks || [],
    extractedAt: partial.extractedAt,
    formatterVersion: '1.0',
    // Detailed weeks array
    weeks: partial.weeks,
    // Research-backed fields (pass through if present)
    researchSnapshot: partial.researchSnapshot,
    competitiveComparison: partial.competitiveComparison,
    keywordOpportunities: partial.keywordOpportunities,
    marketQuotes: partial.marketQuotes,
    positioning: partial.positioning,
    // Novel insights
    discoveries: partial.discoveries,
  }
}
