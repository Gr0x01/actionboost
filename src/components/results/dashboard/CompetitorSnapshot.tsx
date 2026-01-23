import type { CompetitorItem } from '@/lib/ai/formatter-types'

interface CompetitorSnapshotProps {
  competitors: CompetitorItem[]
}

/**
 * Format traffic number for display
 */
function formatTraffic(trafficNumber: number): string {
  if (trafficNumber >= 1000000) {
    return `${(trafficNumber / 1000000).toFixed(1)}M`
  }
  if (trafficNumber >= 1000) {
    return `${Math.round(trafficNumber / 1000)}K`
  }
  return trafficNumber.toLocaleString()
}

/**
 * CompetitorSnapshot - Clean indexed list
 * Confident styling with solid borders, hover states
 */
export function CompetitorSnapshot({ competitors }: CompetitorSnapshotProps) {
  if (competitors.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Confident section label */}
      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block mb-4">
        Who you're up against
      </span>

      {/* Indexed list with solid left border */}
      <div className="border-l-2 border-cta/40 pl-5 space-y-3">
        {competitors.slice(0, 5).map((competitor, index) => (
          <div
            key={competitor.name}
            className="flex items-start gap-3 p-3 -ml-3 rounded-lg bg-white border border-transparent hover:border-foreground/10 hover:shadow-[0_2px_8px_rgba(44,62,80,0.06)] transition-all"
          >
            {/* Index number - prominent */}
            <span className="text-sm font-bold text-cta/60 w-5 shrink-0 text-right">
              {index + 1}
            </span>

            <div className="flex-1 min-w-0">
              {/* Name */}
              <h4 className="font-bold text-foreground">
                {competitor.name}
              </h4>

              {/* Positioning */}
              {competitor.positioning && (
                <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                  {competitor.positioning}
                </p>
              )}

              {/* Traffic if available */}
              {competitor.trafficNumber && competitor.trafficNumber > 0 && (
                <span className="text-xs text-foreground/50 mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/[0.04]">
                  {formatTraffic(competitor.trafficNumber)} visitors/mo
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
