'use client'

import { Target, Users, Sparkles } from 'lucide-react'
import type { ParsedStrategy } from '@/lib/markdown/parser'

interface PositioningSummaryProps {
  strategy: ParsedStrategy
}

interface PositioningInfo {
  verdict: 'clear' | 'needs-work' | 'unclear' | null
  uniqueValue: string | null
  targetSegment: string | null
  summary: string | null
}

/**
 * Extract positioning information from currentSituation content
 *
 * Looks for patterns like:
 * - "### Positioning Check" section
 * - Verdict indicators: "clear", "needs work", "unclear"
 * - "What makes you different:" or similar
 * - "Target segment:" or similar
 */
function extractPositioningInfo(content: string): PositioningInfo {
  const result: PositioningInfo = {
    verdict: null,
    uniqueValue: null,
    targetSegment: null,
    summary: null,
  }

  if (!content) return result

  // Try to find a summary/positioning-related paragraph
  // Look for first substantial paragraph that describes positioning
  const lines = content.split('\n')
  let inPositioningSection = false
  const summaryLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Check for positioning section headers
    if (
      trimmed.toLowerCase().includes('positioning') ||
      trimmed.toLowerCase().includes('what makes you different') ||
      trimmed.toLowerCase().includes('unique value')
    ) {
      inPositioningSection = true
      continue
    }

    // Extract verdict from common patterns
    if (trimmed.toLowerCase().includes('positioning is clear') ||
        trimmed.toLowerCase().includes('strong positioning')) {
      result.verdict = 'clear'
    } else if (trimmed.toLowerCase().includes('needs work') ||
               trimmed.toLowerCase().includes('positioning could be')) {
      result.verdict = 'needs-work'
    } else if (trimmed.toLowerCase().includes('unclear positioning') ||
               trimmed.toLowerCase().includes('positioning is unclear')) {
      result.verdict = 'unclear'
    }

    // Extract target segment
    if (trimmed.toLowerCase().startsWith('target:') ||
        trimmed.toLowerCase().startsWith('target segment:') ||
        trimmed.toLowerCase().startsWith('target audience:')) {
      result.targetSegment = trimmed.split(':').slice(1).join(':').trim()
    }

    // Extract unique value
    if (trimmed.toLowerCase().startsWith('unique value:') ||
        trimmed.toLowerCase().startsWith('differentiator:') ||
        trimmed.toLowerCase().startsWith('what makes you different:')) {
      result.uniqueValue = trimmed.split(':').slice(1).join(':').trim()
    }

    // Collect summary text (first non-header, non-list paragraph after positioning section)
    if (inPositioningSection && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      if (summaryLines.length < 3) {
        summaryLines.push(trimmed)
      }
    }
  }

  // Use collected summary lines
  if (summaryLines.length > 0) {
    result.summary = summaryLines.join(' ').slice(0, 300)
  }

  // Fallback: extract first meaningful paragraph as summary
  if (!result.summary) {
    const paragraphs = content.split('\n\n')
    for (const para of paragraphs) {
      const clean = para.trim()
      if (clean && !clean.startsWith('#') && clean.length > 50) {
        result.summary = clean.slice(0, 300)
        break
      }
    }
  }

  return result
}

/**
 * Get verdict display info
 */
function getVerdictInfo(verdict: PositioningInfo['verdict']) {
  switch (verdict) {
    case 'clear':
      return {
        label: 'Strong positioning',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: '✓',
      }
    case 'needs-work':
      return {
        label: 'Room to sharpen',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: '→',
      }
    case 'unclear':
      return {
        label: 'Needs clarity',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: '!',
      }
    default:
      return null
  }
}

/**
 * PositioningSummary - Hero card for Insights tab
 *
 * Extracts positioning insights from strategy.currentSituation
 * Visual: Large quote-style card with cta accent border
 */
export function PositioningSummary({ strategy }: PositioningSummaryProps) {
  const content = strategy.currentSituation?.content || ''
  const positioning = extractPositioningInfo(content)
  const verdictInfo = getVerdictInfo(positioning.verdict)

  // If we couldn't extract anything meaningful, show a simplified version
  if (!positioning.summary && !positioning.uniqueValue && !positioning.targetSegment) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Hero card with accent border */}
      <div
        className="relative rounded-xl border-2 border-foreground/20 bg-background p-6 lg:p-8"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
      >
        {/* Accent top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-cta rounded-t-lg" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
              YOUR POSITIONING
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              What we found about your market position
            </h2>
          </div>

          {/* Verdict badge */}
          {verdictInfo && (
            <span className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${verdictInfo.color}`}>
              <span className="mr-1.5">{verdictInfo.icon}</span>
              {verdictInfo.label}
            </span>
          )}
        </div>

        {/* Summary quote */}
        {positioning.summary && (
          <blockquote className="text-lg lg:text-xl text-foreground/80 leading-relaxed mb-6 pl-4 border-l-4 border-cta/30">
            {positioning.summary}
            {positioning.summary.length >= 297 && '...'}
          </blockquote>
        )}

        {/* Key insights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {positioning.uniqueValue && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-foreground/[0.03]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cta" />
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase block mb-1">
                  What makes you different
                </span>
                <p className="text-sm text-foreground font-medium">
                  {positioning.uniqueValue}
                </p>
              </div>
            </div>
          )}

          {positioning.targetSegment && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-foreground/[0.03]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-cta" />
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase block mb-1">
                  Your target segment
                </span>
                <p className="text-sm text-foreground font-medium">
                  {positioning.targetSegment}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* If no specific insights extracted, show a general CTA */}
        {!positioning.uniqueValue && !positioning.targetSegment && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-foreground/[0.03]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-cta" />
            </div>
            <p className="text-sm text-foreground/70">
              Check the &quot;Your Situation&quot; section in Deep Dives below for the full positioning analysis.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
