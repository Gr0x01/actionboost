import type { MetricItem } from '@/lib/ai/formatter-types'

interface MetricsSnapshotProps {
  metrics: MetricItem[]
}

/**
 * Get AARRR stage label
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    acquisition: 'Acquisition',
    activation: 'Activation',
    retention: 'Retention',
    referral: 'Referral',
    revenue: 'Revenue',
    custom: 'Custom',
  }
  return labels[category] || 'Custom'
}

export function MetricsSnapshot({ metrics }: MetricsSnapshotProps) {
  const displayMetrics = metrics.slice(0, 6)

  if (displayMetrics.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
          Key Metrics
        </h2>
        <p className="text-foreground/60 text-sm mt-1">
          Track these AARRR metrics to measure your progress
        </p>
      </div>

      {/* Cards float directly - no outer container */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayMetrics.map((metric, index) => (
          <div
            key={`${metric.name}-${index}`}
            className="group rounded-lg border border-foreground/10 bg-surface p-4
                       hover:border-foreground/20 hover:shadow-md transition-all duration-200"
          >
            {/* Category - typographic, monochromatic */}
            <span className="block text-[10px] uppercase tracking-widest font-semibold
                           text-foreground/50 mb-2">
              {getCategoryLabel(metric.category)}
            </span>

            {/* Metric name */}
            <p className="font-semibold text-foreground text-sm leading-tight mb-1">
              {metric.name}
            </p>

            {/* Target value - prominent */}
            <p className="font-mono text-lg font-bold text-foreground/80">
              {metric.target}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
