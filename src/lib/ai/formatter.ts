import Anthropic from '@anthropic-ai/sdk'
import {
  StructuredOutputSchema,
  PartialStructuredOutputSchema,
  FreeBriefOutputSchema,
  FORMATTER_SYSTEM_PROMPT,
  FORMATTER_USER_PROMPT,
  FORMATTER_USER_PROMPT_WITH_RESEARCH,
  FREE_BRIEF_FORMATTER_SYSTEM_PROMPT,
  FREE_BRIEF_FORMATTER_USER_PROMPT,
  type StructuredOutput,
  type PartialStructuredOutput,
  type FreeBriefOutput,
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

    // Pre-process: fix common LLM mistakes before validation
    // Brief outputs don't have thisWeek — LLM sometimes returns array instead of object
    if (parsedObj.thisWeek && Array.isArray(parsedObj.thisWeek)) {
      parsedObj.thisWeek = { days: parsedObj.thisWeek }
    }

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
 * Recursively strip null values from an object (LLMs return null instead of omitting optional fields)
 */
function stripNulls(obj: unknown): void {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    for (const item of obj) stripNulls(item)
    return
  }
  const record = obj as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (record[key] === null) {
      delete record[key]
    } else if (typeof record[key] === 'object') {
      stripNulls(record[key])
    }
  }
}

/**
 * Extract structured output from a free Brief markdown using the dedicated FreeBriefSchema.
 * Simpler than extractStructuredOutput — no partial fallback needed since all
 * critical fields are directly in the schema (briefScores is the only required field).
 *
 * @param markdown - The free Brief markdown to extract from
 * @param researchData - Optional structured research data from tool calls
 */
export async function extractFreeBriefOutput(
  markdown: string,
  researchData?: ResearchData,
): Promise<FreeBriefOutput | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[FreeBriefFormatter] Missing ANTHROPIC_API_KEY, skipping extraction')
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

  let userContent: string
  if (hasResearchData) {
    const researchSection = formatResearchDataForPrompt(researchData!)
    userContent = FREE_BRIEF_FORMATTER_USER_PROMPT + markdown + '\n\n---\nRESEARCH DATA:\n\n' + researchSection
  } else {
    userContent = FREE_BRIEF_FORMATTER_USER_PROMPT + markdown
  }

  try {
    console.log(`[FreeBriefFormatter] Starting extraction with ${FORMATTER_MODEL}...`)
    const startTime = Date.now()

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Formatter timeout')), FORMATTER_TIMEOUT_MS)
    })

    const response = await Promise.race([
      client.messages.create({
        model: FORMATTER_MODEL,
        max_tokens: 8000, // Free briefs are smaller — half of paid
        system: FREE_BRIEF_FORMATTER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
      timeoutPromise,
    ])

    const elapsed = Date.now() - startTime
    console.log(`[FreeBriefFormatter] Responded in ${elapsed}ms, tokens: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`)

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      console.error('[FreeBriefFormatter] No text content in response')
      return null
    }

    // Parse JSON
    let jsonText = textContent.text.trim()
    if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7)
    if (jsonText.startsWith('```')) jsonText = jsonText.slice(3)
    if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3)
    jsonText = jsonText.trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseErr) {
      console.error('[FreeBriefFormatter] JSON parse error:', parseErr, 'Raw text:', jsonText.slice(0, 500))
      return null
    }

    // Pre-process: strip null values recursively (LLM returns null instead of omitting optional fields)
    stripNulls(parsed)

    // Validate with FreeBriefOutputSchema
    const result = FreeBriefOutputSchema.safeParse(parsed)
    if (!result.success) {
      console.error('[FreeBriefFormatter] Zod validation failed:', result.error.issues)
      return null
    }

    console.log(`[FreeBriefFormatter] Successfully extracted free brief output`)
    return result.data
  } catch (err) {
    if (err instanceof Error && err.message === 'Formatter timeout') {
      console.error('[FreeBriefFormatter] Extraction timed out')
    } else {
      console.error('[FreeBriefFormatter] Extraction failed:', err)
    }
    return null
  }
}

/**
 * Enrich extracted tasks with WHY (strategic rationale) and HOW (concrete steps).
 * Runs a Sonnet call after structured output extraction to add context to each task.
 *
 * Cost: ~$0.02 per run
 * Latency: ~3-5 seconds
 */
export async function enrichTasksWithContext(
  markdown: string,
  structuredOutput: StructuredOutput
): Promise<StructuredOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Enrichment] Missing ANTHROPIC_API_KEY, skipping')
    return structuredOutput
  }

  const weeks = structuredOutput.weeks
  if (!weeks || weeks.length === 0) {
    console.log('[Enrichment] No weeks data, skipping')
    return structuredOutput
  }

  // Build a compact task list for the prompt
  const taskList = weeks.flatMap((week) =>
    week.days.map((day) => ({
      week: week.week,
      theme: week.theme,
      day: day.day,
      action: day.action,
      successMetric: day.successMetric,
    }))
  )

  if (taskList.length === 0) return structuredOutput

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  try {
    console.log(`[Enrichment] Generating WHY/HOW for ${taskList.length} tasks...`)
    const startTime = Date.now()

    const response = await Promise.race([
      client.messages.create({
        model: FORMATTER_MODEL,
        max_tokens: 8000,
        system: `You generate strategic context for marketing tasks. For each task, write:
- "why": 1 sentence explaining the strategic rationale (why this task matters for the business)
- "how": 2-3 sentences with concrete execution steps (what to actually do)

Return ONLY a JSON array. Each element: { "week": number, "day": number, "why": "...", "how": "..." }
No markdown, no explanation.`,
        messages: [{
          role: 'user',
          content: `Here is the full strategy document:\n\n${markdown.slice(0, 8000)}\n\n---\n\nGenerate WHY and HOW for these tasks:\n${JSON.stringify(taskList, null, 2)}`,
        }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Enrichment timeout')), 60000)
      ),
    ])

    const elapsed = Date.now() - startTime
    console.log(`[Enrichment] Responded in ${elapsed}ms, tokens: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`)

    const textContent = response.content.find((b) => b.type === 'text')
    if (!textContent || textContent.type !== 'text') return structuredOutput

    let jsonText = textContent.text.trim()
    if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7)
    if (jsonText.startsWith('```')) jsonText = jsonText.slice(3)
    if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3)
    jsonText = jsonText.trim()

    const enrichments = JSON.parse(jsonText) as Array<{ week: number; day: number; why: string; how: string }>

    // Merge enrichments back into structured output
    const enriched = { ...structuredOutput, weeks: structuredOutput.weeks!.map((week) => ({
      ...week,
      days: week.days.map((day) => {
        const match = enrichments.find((e) => e.week === week.week && e.day === day.day)
        return match ? { ...day, why: match.why, how: match.how } : day
      }),
    }))}

    // Also update thisWeek if it mirrors week 1
    if (enriched.thisWeek?.days) {
      enriched.thisWeek = {
        ...enriched.thisWeek,
        days: enriched.thisWeek.days.map((day) => {
          const match = enrichments.find((e) => e.week === 1 && e.day === day.day)
          return match ? { ...day, why: match.why, how: match.how } : day
        }),
      }
    }

    console.log(`[Enrichment] Successfully enriched ${enrichments.length} tasks`)
    return enriched
  } catch (err) {
    console.warn('[Enrichment] Failed (non-fatal):', err instanceof Error ? err.message : err)
    return structuredOutput
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
    // Brief diagnostic scores
    briefScores: partial.briefScores,
    // Free Brief sections
    quickWins: partial.quickWins,
    positioningGap: partial.positioningGap,
    threeSecondTest: partial.threeSecondTest,
  }
}
