import type { CompetitorItem } from '@/lib/ai/formatter-types'

interface CompetitorSnapshotProps {
  competitors: CompetitorItem[]
}

/**
 * CompetitorSnapshot - Actionable competitive insights
 * Shows weakness, opportunity, and what to steal from each competitor
 */
export function CompetitorSnapshot({ competitors }: CompetitorSnapshotProps) {
  if (competitors.length === 0) {
    return null
  }

  // Only show this component if at least one competitor has actionable insights.
  // Legacy data without weakness/opportunity/stealThis fields intentionally shows nothing
  // rather than displaying a useless list of competitor names the user already knows.
  const hasRichData = competitors.some(
    (c) => c.weakness || c.opportunity || c.stealThis
  )

  if (!hasRichData) {
    return null
  }

  const displayCompetitors = competitors.slice(0, 5)

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
        WHERE YOU CAN WIN
      </span>

      {/* Competitor insights grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCompetitors.map((competitor) => (
          <div
            key={competitor.name}
            className="border border-foreground/15 rounded-md p-4 bg-background"
          >
            {/* Competitor name */}
            <h4 className="text-base font-bold text-foreground mb-3">
              vs. {competitor.name}
            </h4>

            {/* Insights list */}
            <div className="space-y-3">
              {/* Their weakness */}
              {competitor.weakness && (
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-red-600/70 block mb-1">
                    Their weakness
                  </span>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {competitor.weakness}
                  </p>
                </div>
              )}

              {/* Your opportunity */}
              {competitor.opportunity && (
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cta block mb-1">
                    Your opportunity
                  </span>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {competitor.opportunity}
                  </p>
                </div>
              )}

              {/* Steal this */}
              {competitor.stealThis && (
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600/70 block mb-1">
                    Steal this
                  </span>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {competitor.stealThis}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
