import Anthropic from '@anthropic-ai/sdk'
import {
  StructuredOutputSchema,
  PartialStructuredOutputSchema,
  FORMATTER_SYSTEM_PROMPT,
  FORMATTER_USER_PROMPT,
  FORMATTER_USER_PROMPT_WITH_RESEARCH,
  type StructuredOutput,
  type PartialStructuredOutput,
  type DayAction,
  type DetailedWeek,
  type PriorityItem,
  type MetricItem,
  type CompetitorItem,
  type RoadmapWeek,
} from './formatter-types'
import { parseStartDoing, parseRoadmap } from '@/lib/markdown/parser'
import type { ResearchData } from './pipeline-agentic'

// Sonnet for reliable extraction (understands intent, not just examples)
const FORMATTER_MODEL = 'claude-sonnet-4-20250514'
const FORMATTER_MAX_TOKENS = 4000
const FORMATTER_TIMEOUT_MS = 60000 // 60s - tested: ~23s for 17k doc

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
 */
export async function extractStructuredOutput(
  markdown: string,
  researchData?: ResearchData
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
    console.log(`[Formatter] Starting Sonnet extraction (with research: ${hasResearchData})...`)
    const startTime = Date.now()

    // Use Promise.race for timeout since Anthropic SDK doesn't support AbortSignal
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Formatter timeout')), FORMATTER_TIMEOUT_MS)
    })

    const response = await Promise.race([
      client.messages.create({
        model: FORMATTER_MODEL,
        max_tokens: FORMATTER_MAX_TOKENS,
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
    console.log(`[Formatter] Sonnet responded in ${elapsed}ms`)

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      console.warn('[Formatter] No text content in Sonnet response')
      return extractStructuredOutputFallback(markdown)
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
      console.warn('[Formatter] JSON parse error:', parseErr)
      return extractStructuredOutputFallback(markdown)
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
      console.warn('[Formatter] Zod validation failed:', result.error.issues)

      // Try partial validation for graceful degradation
      const partialResult = PartialStructuredOutputSchema.safeParse(parsed)
      if (partialResult.success) {
        console.log('[Formatter] Partial extraction successful')
        return normalizePartialOutput(partialResult.data)
      }

      return extractStructuredOutputFallback(markdown)
    }

    console.log(`[Formatter] Successfully extracted structured output`)
    return result.data

  } catch (err) {
    if (err instanceof Error && err.message === 'Formatter timeout') {
      console.warn('[Formatter] Sonnet extraction timed out')
    } else {
      console.error('[Formatter] Sonnet extraction failed:', err)
    }
    return extractStructuredOutputFallback(markdown)
  }
}

/**
 * Fallback extraction using existing regex parsers
 * Used when Sonnet fails or times out
 */
export function extractStructuredOutputFallback(markdown: string): StructuredOutput | null {
  console.log('[Formatter] Using fallback regex extraction...')

  try {
    const now = new Date().toISOString()

    // Try new "## Week X:" format first, then fallback to "## This Week"
    const weekPattern = /## Week (\d+):\s*([^\n]*)\s*([\s\S]*?)(?=## Week \d+:|## [A-Z]|$)/gi
    const weekMatches = [...markdown.matchAll(weekPattern)]

    const weeks: DetailedWeek[] = []

    if (weekMatches.length > 0) {
      // New format: extract all weeks
      for (const match of weekMatches) {
        const weekNum = parseInt(match[1], 10)
        const theme = match[2].trim()
        const content = match[3]
        const days = parseThisWeekTable(content)
        if (days.length > 0) {
          weeks.push({ week: weekNum, theme, days })
        }
      }
    }

    // Get Week 1 data for thisWeek (backward compatibility)
    const week1 = weeks.find(w => w.week === 1)
    let thisWeekDays: DayAction[] = week1?.days || []

    // Fallback to legacy "## This Week" if no Week 1 found
    if (thisWeekDays.length === 0) {
      const thisWeekMatch = markdown.match(/## This Week\s*([\s\S]*?)(?=##|$)/i)
      thisWeekDays = thisWeekMatch ? parseThisWeekTable(thisWeekMatch[1]) : []
    }

    const totalHours = thisWeekDays.reduce((sum, day) => {
      const hourMatch = day.timeEstimate.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/i)
      return sum + (hourMatch ? parseFloat(hourMatch[1]) : 0)
    }, 0)

    // Extract "Start Doing" section for priorities
    const startDoingMatch = markdown.match(/## Start Doing[^\n]*\s*([\s\S]*?)(?=##|$)/i)
    const priorities = startDoingMatch ? parseStartDoing(startDoingMatch[1]) : []
    const topPriorities: PriorityItem[] = priorities.slice(0, 8).map((item, index) => ({
      rank: index + 1,
      title: item.title,
      iceScore: item.iceScore,
      impact: item.impact,
      confidence: item.confidence,
      ease: item.ease,
      description: item.description,
    }))

    // Extract metrics from "Metrics Dashboard" section
    const metricsMatch = markdown.match(/## Metrics Dashboard\s*([\s\S]*?)(?=##|$)/i)
    const metrics = metricsMatch ? parseMetricsTable(metricsMatch[1]) : []

    // Extract competitors from "Competitive Landscape" section
    const competitorsMatch = markdown.match(/## Competitive Landscape\s*([\s\S]*?)(?=##|$)/i)
    const competitors = competitorsMatch ? parseCompetitorsTable(competitorsMatch[1]) : []

    // Extract roadmap
    const roadmapMatch = markdown.match(/## 30-Day Roadmap\s*([\s\S]*?)(?=##|$)/i)
    const roadmapWeeks: RoadmapWeek[] = roadmapMatch
      ? parseRoadmap(roadmapMatch[1]).map((w) => ({
          week: w.week,
          theme: w.theme,
          tasks: w.tasks.map((t) => t.text),
        }))
      : []

    const output: StructuredOutput = {
      thisWeek: {
        days: thisWeekDays,
        totalHours: totalHours || undefined,
      },
      topPriorities,
      metrics,
      competitors,
      currentWeek: 1,
      roadmapWeeks,
      extractedAt: now,
      formatterVersion: '1.0',
      // Include detailed weeks if we extracted them
      weeks: weeks.length > 0 ? weeks : undefined,
    }

    // Validate even the fallback output
    const result = StructuredOutputSchema.safeParse(output)
    if (!result.success) {
      console.warn('[Formatter] Fallback validation failed:', result.error.issues)
      return null
    }

    console.log('[Formatter] Fallback extraction successful')
    return result.data

  } catch (err) {
    console.error('[Formatter] Fallback extraction failed:', err)
    return null
  }
}

// =============================================================================
// HELPER PARSERS
// =============================================================================

/**
 * Parse "This Week" markdown table
 */
function parseThisWeekTable(content: string): DayAction[] {
  const days: DayAction[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // Skip header rows and dividers
    if (line.startsWith('|--') || (line.includes('Day') && line.includes('Action'))) {
      continue
    }

    // Parse table row: | Day | Action | Time | Success Metric |
    const match = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/)
    if (match) {
      days.push({
        day: parseInt(match[1], 10),
        action: match[2].trim(),
        timeEstimate: match[3].trim(),
        successMetric: match[4].trim(),
      })
    }
  }

  return days
}

/**
 * Parse metrics table from Metrics Dashboard section
 */
function parseMetricsTable(content: string): MetricItem[] {
  const metrics: MetricItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // Skip header and divider rows
    if (line.startsWith('|--') || (line.includes('Stage') && line.includes('Metric'))) {
      continue
    }

    // Parse table row: | Stage | Metric | Target | How to Measure |
    const match = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/)
    if (match) {
      const category = match[1].trim().toLowerCase()
      // Skip if this looks like a header
      if (category === 'stage' || category === 'metric') continue

      metrics.push({
        name: match[2].trim(),
        target: match[3].trim(),
        category: normalizeCategory(category),
      })
    }
  }

  return metrics
}

/**
 * Parse competitors table from Competitive Landscape section
 */
function parseCompetitorsTable(content: string): CompetitorItem[] {
  const competitors: CompetitorItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // Skip header and divider rows
    if (line.startsWith('|--') || (line.includes('Competitor') && line.includes('Approach'))) {
      continue
    }

    // Parse table row: | Competitor | Their Approach | Your Advantage |
    const match = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/)
    if (match) {
      const name = match[1].trim()
      // Skip if this looks like a header
      if (name.toLowerCase() === 'competitor') continue

      // Try to extract traffic from the positioning text
      const positioningText = match[2].trim()
      const trafficMatch = positioningText.match(/(\d+(?:\.\d+)?)\s*([KMB])?(?:\/mo)?/i)

      let trafficNumber: number | undefined
      let traffic = ''

      if (trafficMatch) {
        const num = parseFloat(trafficMatch[1])
        const multiplier = trafficMatch[2]?.toUpperCase()
        trafficNumber = num * (multiplier === 'K' ? 1000 : multiplier === 'M' ? 1000000 : multiplier === 'B' ? 1000000000 : 1)
        traffic = `${trafficMatch[1]}${trafficMatch[2] || ''}/mo`
      }

      competitors.push({
        name,
        traffic: traffic || 'Unknown',
        trafficNumber,
        positioning: positioningText,
      })
    }
  }

  return competitors
}

/**
 * Normalize AARRR category names
 */
function normalizeCategory(category: string): string {
  const normalized = category.toLowerCase().trim()
  if (normalized.includes('acqui')) return 'acquisition'
  if (normalized.includes('activ')) return 'activation'
  if (normalized.includes('reten')) return 'retention'
  if (normalized.includes('refer')) return 'referral'
  if (normalized.includes('rev') || normalized.includes('monet')) return 'revenue'
  return 'custom'
}

/**
 * Convert partial output to full output with defaults
 */
function normalizePartialOutput(partial: PartialStructuredOutput): StructuredOutput {
  return {
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
  }
}
