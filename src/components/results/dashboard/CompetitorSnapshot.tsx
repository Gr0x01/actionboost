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

export function CompetitorSnapshot({ competitors }: CompetitorSnapshotProps) {
  if (competitors.length === 0) {
    return null
  }

  // Check if we have meaningful traffic data (need at least 2 for comparison)
  const competitorsWithTraffic = competitors.filter((c) => c.trafficNumber && c.trafficNumber > 0)
  const hasTrafficData = competitorsWithTraffic.length >= 2
  const maxTraffic = hasTrafficData
    ? Math.max(...competitorsWithTraffic.map((c) => c.trafficNumber!))
    : 0

  return (
    <section className="scroll-mt-32">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
          Competitive Landscape
        </h2>
        <p className="text-foreground/60 text-sm mt-1">
          {hasTrafficData ? 'Monthly traffic comparison' : 'Key players in your space'}
        </p>
      </div>

      {hasTrafficData ? (
        // Traffic comparison view - brutalist container
        <div className="rounded-xl border-2 border-foreground bg-background p-5">
          <div className="space-y-4">
            {competitors.map((competitor, index) => {
              const barWidth = competitor.trafficNumber
                ? (competitor.trafficNumber / maxTraffic) * 100
                : 0

              const barColor = index === 0
                ? 'bg-cta'
                : index === 1
                  ? 'bg-foreground/60'
                  : 'bg-foreground/40'

              return (
                <div key={competitor.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {competitor.name}
                    </span>
                    {competitor.trafficNumber ? (
                      <span className="font-mono text-sm text-foreground/70 shrink-0">
                        {formatTraffic(competitor.trafficNumber)}
                        <span className="text-foreground/40 text-xs">/mo</span>
                      </span>
                    ) : (
                      <span className="text-xs text-foreground/40 shrink-0">—</span>
                    )}
                  </div>

                  <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.max(barWidth, 3)}%` }}
                    />
                  </div>

                  {competitor.positioning && (
                    <p className="text-xs text-foreground/50 line-clamp-1">
                      {competitor.positioning}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // Positioning cards - brutalist style matching MetricsSnapshot
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {competitors.slice(0, 6).map((competitor) => (
            <div
              key={competitor.name}
              className="rounded-xl border-2 border-foreground bg-background p-4
                         hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5
                         transition-all duration-150"
            >
              {/* Name - prominent */}
              <h3 className="font-bold text-foreground mb-2">
                {competitor.name}
              </h3>

              {/* Positioning - readable size */}
              <p className="text-sm text-foreground/70 leading-relaxed">
                {competitor.positioning || 'No positioning data available'}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
