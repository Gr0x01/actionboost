import Anthropic from '@anthropic-ai/sdk'
import {
  StructuredOutputSchema,
  PartialStructuredOutputSchema,
  FORMATTER_SYSTEM_PROMPT,
  FORMATTER_USER_PROMPT,
  type StructuredOutput,
  type PartialStructuredOutput,
  type DayAction,
  type PriorityItem,
  type MetricItem,
  type CompetitorItem,
  type RoadmapWeek,
} from './formatter-types'
import { parseStartDoing, parseRoadmap } from '@/lib/markdown/parser'

// Sonnet for reliable extraction (understands intent, not just examples)
const FORMATTER_MODEL = 'claude-sonnet-4-20250514'
const FORMATTER_MAX_TOKENS = 4000
const FORMATTER_TIMEOUT_MS = 30000

/**
 * Extract structured output from markdown using Sonnet
 *
 * Cost: ~$0.04 per run (based on typical ~8000 input tokens, ~2000 output tokens)
 * Latency: ~3-5 seconds
 */
export async function extractStructuredOutput(markdown: string): Promise<StructuredOutput | null> {
  // Early validation - don't fail hard if key is missing during lazy backfill
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[Formatter] Missing ANTHROPIC_API_KEY, skipping extraction')
    return null
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  try {
    console.log('[Formatter] Starting Sonnet extraction...')
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
            content: FORMATTER_USER_PROMPT + markdown,
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

    // Extract "This Week" section
    const thisWeekMatch = markdown.match(/## This Week\s*([\s\S]*?)(?=##|$)/i)
    const thisWeekDays = thisWeekMatch ? parseThisWeekTable(thisWeekMatch[1]) : []
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
  }
}
