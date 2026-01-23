'use client'

import { Target, Users, Sparkles, Shield } from 'lucide-react'
import type { PositioningData } from '@/lib/ai/formatter-types'

interface PositioningSummaryV2Props {
  positioning: PositioningData
}

/**
 * Get verdict display info
 */
function getVerdictInfo(verdict?: 'clear' | 'needs-work' | 'unclear') {
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
 * PositioningSummaryV2 - Data-driven positioning card
 *
 * Replaces regex-based extraction with structured data from formatter
 * Soft Brutalist: hero card with accent border, visible structure
 */
export function PositioningSummaryV2({ positioning }: PositioningSummaryV2Props) {
  const verdictInfo = getVerdictInfo(positioning.verdict)

  // Don't render if no meaningful data
  if (
    !positioning.summary &&
    !positioning.uniqueValue &&
    !positioning.targetSegment &&
    !positioning.competitiveAdvantage
  ) {
    return null
  }

  const insights = [
    {
      icon: Sparkles,
      label: 'What makes you different',
      value: positioning.uniqueValue,
    },
    {
      icon: Users,
      label: 'Your target segment',
      value: positioning.targetSegment,
    },
    {
      icon: Shield,
      label: 'Competitive advantage',
      value: positioning.competitiveAdvantage,
    },
  ].filter((i) => i.value)

  return (
    <section className="scroll-mt-32">
      <div
        className="rounded-md border-2 border-foreground/20 bg-background p-6 lg:p-8"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
      >
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
            <span
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${verdictInfo.color}`}
            >
              <span className="mr-1.5">{verdictInfo.icon}</span>
              {verdictInfo.label}
            </span>
          )}
        </div>

        {/* Summary quote */}
        {positioning.summary && (
          <blockquote className="text-lg lg:text-xl text-foreground/80 leading-relaxed mb-6 pl-4 border-l-4 border-cta">
            {positioning.summary}
          </blockquote>
        )}

        {/* Key insights grid */}
        {insights.length > 0 && (
          <div
            className={`grid gap-4 ${
              insights.length === 1
                ? 'grid-cols-1'
                : insights.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {insights.map((insight) => (
              <div
                key={insight.label}
                className="flex items-start gap-3 p-4 rounded-md border border-foreground/10 bg-foreground/[0.03]"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
                  <insight.icon className="w-4 h-4 text-cta" />
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase block mb-1">
                    {insight.label}
                  </span>
                  <p className="text-sm text-foreground font-medium">
                    {insight.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback CTA if no specific insights */}
        {insights.length === 0 && !positioning.summary && (
          <div className="flex items-center gap-3 p-4 rounded-md border border-foreground/10 bg-foreground/[0.03]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-cta" />
            </div>
            <p className="text-sm text-foreground/70">
              Check the &quot;Your Situation&quot; section in Deep Dives below
              for the full positioning analysis.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
