import type { MetricItem } from '@/lib/ai/formatter-types'

interface MetricsSnapshotProps {
  metrics: MetricItem[]
}

/**
 * Get plain English category label
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    acquisition: 'GROWTH',
    activation: 'ENGAGE',
    retention: 'RETAIN',
    referral: 'REFER',
    revenue: 'REVENUE',
  }
  return labels[category] || 'GOAL'
}

/**
 * MetricsSnapshot - Key Metrics in brutalist card grid
 *
 * Design: Brutalist Raw - matches Day cards and Priority cards
 * - Bold borders, offset shadows on hover
 * - Category badge with solid background (like DAY X badges)
 * - Grid layout for scannability
 */
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
          Track these to measure your progress
        </p>
      </div>

      {/* Grid of brutalist cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayMetrics.map((metric, index) => (
          <div
            key={`${metric.name}-${index}`}
            className="rounded-xl border-2 border-foreground bg-background p-4
                       hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5
                       transition-all duration-150"
          >
            {/* Category badge - solid background like DAY badges */}
            <span className="inline-block font-mono text-[10px] px-2 py-1 font-bold
                           bg-foreground text-background mb-3">
              {getCategoryLabel(metric.category)}
            </span>

            {/* Metric name */}
            <p className="font-semibold text-sm text-foreground leading-snug mb-2">
              {metric.name}
            </p>

            {/* Target - prominent mono */}
            <p className="font-mono text-lg font-bold text-foreground/80">
              {metric.target}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
