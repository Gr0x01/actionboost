import type { CompetitorItem } from '@/lib/ai/formatter-types'

interface CompetitorSnapshotProps {
  competitors: CompetitorItem[]
}

/**
 * Format traffic number for display
 */
function formatTrafficDisplay(traffic: string, trafficNumber?: number): string {
  if (trafficNumber) {
    if (trafficNumber >= 1000000) {
      return `${(trafficNumber / 1000000).toFixed(1)}M`
    }
    if (trafficNumber >= 1000) {
      return `${(trafficNumber / 1000).toFixed(0)}K`
    }
    return trafficNumber.toString()
  }
  return traffic.replace('/mo', '').trim()
}

export function CompetitorSnapshot({ competitors }: CompetitorSnapshotProps) {
  if (competitors.length === 0) {
    return null
  }

  // Find the max traffic for scaling bars
  const competitorsWithTraffic = competitors.filter((c) => c.trafficNumber)
  const maxTraffic = competitorsWithTraffic.length > 0
    ? Math.max(...competitorsWithTraffic.map((c) => c.trafficNumber!))
    : 0

  return (
    <section className="scroll-mt-32">
      <div className="mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
          Competitive Landscape
        </h2>
        <p className="text-foreground/60 text-sm mt-1">
          How you stack up against the competition
        </p>
      </div>

      <div className="rounded-lg border border-foreground/10 bg-surface p-5">
        <div className="space-y-4">
          {competitors.map((competitor, index) => {
            // Calculate bar width as percentage of max
            const barWidth = maxTraffic && competitor.trafficNumber
              ? (competitor.trafficNumber / maxTraffic) * 100
              : 30 // Default 30% if no data

            // Color intensity based on rank
            const barColor = index === 0
              ? 'bg-foreground/80'
              : index === 1
                ? 'bg-foreground/60'
                : 'bg-foreground/40'

            return (
              <div key={competitor.name} className="space-y-1.5">
                {/* Name and traffic */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground truncate pr-4">
                    {competitor.name}
                  </span>
                  <span className="font-mono text-sm text-foreground/70 shrink-0">
                    {formatTrafficDisplay(competitor.traffic, competitor.trafficNumber)}
                    <span className="text-foreground/40 text-xs">/mo</span>
                  </span>
                </div>

                {/* Traffic bar */}
                <div className="h-2.5 bg-foreground/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Positioning note (truncated) */}
                {competitor.positioning && (
                  <p className="text-xs text-foreground/50 truncate">
                    {competitor.positioning}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
