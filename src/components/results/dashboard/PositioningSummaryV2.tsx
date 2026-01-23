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
      {/* Two-column layout: header + quote left, insights right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left 2/3 - Header + Hero pull quote */}
        <div className="lg:col-span-2">
          {/* Section label */}
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
            YOUR POSITIONING
          </span>

          {/* Verdict header */}
          <div className="flex items-baseline gap-2 flex-wrap mb-6">
            <span className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              {style.word}
            </span>
            <span className="text-base text-foreground/60 font-medium">
              {style.subtitle}
            </span>
          </div>

          {/* Hero pull quote */}
          {positioning.summary && (
            <p className="text-xl lg:text-2xl font-serif text-foreground leading-relaxed">
              {positioning.summary}
            </p>
          )}
        </div>

        {/* Right 1/3 - Supporting insights stacked */}
        {displayInsights.length > 0 && (
          <div className="space-y-6 lg:border-l lg:border-foreground/10 lg:pl-8">
            {displayInsights.map((insight) => (
              <div key={insight.label}>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/50 block mb-1">
                  {insight.label}
                </span>
                <p className="text-sm lg:text-base text-foreground font-medium leading-relaxed">
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
