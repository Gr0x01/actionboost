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
 * CompetitorSnapshot - Indexed list with brutalist left border
 * No cards, no boxes - just clean indexed content
 */
export function CompetitorSnapshot({ competitors }: CompetitorSnapshotProps) {
  if (competitors.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Whisper-quiet section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
        COMPETITIVE LANDSCAPE
      </span>

      {/* Indexed list with brutalist left border */}
      <div className="border-l-2 border-foreground/20 pl-5 space-y-5">
        {competitors.slice(0, 5).map((competitor, index) => (
          <div key={competitor.name} className="flex items-start gap-4">
            {/* Index number - muted */}
            <span className="font-mono text-xl font-bold text-foreground/15 w-6 shrink-0 text-right">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="flex-1 min-w-0">
              {/* Name */}
              <h4 className="font-semibold text-foreground">
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
                <span className="font-mono text-xs text-foreground/40 mt-1.5 inline-block">
                  {formatTraffic(competitor.trafficNumber)}/mo
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
