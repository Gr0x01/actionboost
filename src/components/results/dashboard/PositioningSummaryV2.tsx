'use client'

import type { PositioningData } from '@/lib/ai/formatter-types'

interface PositioningSummaryV2Props {
  positioning: PositioningData
}

/**
 * Get verdict display info with editorial styling
 */
function getVerdictStyle(verdict?: 'clear' | 'needs-work' | 'unclear') {
  switch (verdict) {
    case 'clear':
      return {
        word: 'Sharp.',
        subtitle: 'Your positioning is clear',
        stripeClass: 'from-emerald-500 via-emerald-500 to-green-400',
      }
    case 'needs-work':
      return {
        word: 'Close.',
        subtitle: 'Room to sharpen',
        stripeClass: 'from-cta via-cta to-accent',
      }
    case 'unclear':
      return {
        word: 'Fuzzy.',
        subtitle: 'Needs more clarity',
        stripeClass: 'from-amber-500 via-amber-500 to-orange-400',
      }
    default:
      return {
        word: 'Found.',
        subtitle: 'Your market position',
        stripeClass: 'from-cta via-cta to-accent',
      }
  }
}

/**
 * PositioningSummaryV2 - The "holy shit, they get me" moment
 *
 * Editorial design: Big verdict, hero insight, supporting evidence
 * Soft Brutalist: offset shadow, accent stripe, bold typography
 */
export function PositioningSummaryV2({ positioning }: PositioningSummaryV2Props) {
  const style = getVerdictStyle(positioning.verdict)

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
      label: 'What makes you different',
      value: positioning.uniqueValue,
    },
    {
      label: 'Who you serve best',
      value: positioning.targetSegment,
    },
    {
      label: 'Your edge',
      value: positioning.competitiveAdvantage,
    },
  ].filter((i) => i.value)

  // Only show first two insights (different + serve)
  const displayInsights = insights.slice(0, 2)

  return (
    <section className="scroll-mt-32">
      <div>
        {/* Section label */}
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
          YOUR POSITIONING
        </span>

        {/* Verdict header */}
        <div className="flex items-baseline gap-2 flex-wrap mb-4">
          <span className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            {style.word}
          </span>
          <span className="text-sm text-foreground/50">
            {style.subtitle}
          </span>
        </div>

        {/* Hero pull quote */}
        {positioning.summary && (
          <p className="text-lg lg:text-xl font-serif text-foreground leading-relaxed mb-6">
            {positioning.summary}
          </p>
        )}

        {/* Supporting insights */}
        {displayInsights.length > 0 && (
          <div className="border-t border-foreground/8 pt-5 space-y-4">
            {displayInsights.map((insight) => (
              <div key={insight.label}>
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-1">
                  {insight.label}
                </span>
                <p className="text-[15px] leading-[1.6] text-foreground font-medium">
                  {insight.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
