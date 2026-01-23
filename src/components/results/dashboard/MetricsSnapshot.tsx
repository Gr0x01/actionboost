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
 * MetricsSnapshot - Soft Brutalist cards
 *
 * Cards with visible borders and offset shadows.
 * Provides visual variety after typography-led sections.
 */
export function MetricsSnapshot({ metrics }: MetricsSnapshotProps) {
  const displayMetrics = metrics.slice(0, 6)

  if (displayMetrics.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
        KEY METRICS
      </span>

      {/* 2-column card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayMetrics.map((metric, index) => (
          <div
            key={`${metric.name}-${index}`}
            className="bg-white border border-foreground/15 rounded-md p-5"
            style={{ boxShadow: '3px 3px 0 rgba(44, 62, 80, 0.06)' }}
          >
            {/* Category label */}
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
              {getCategoryLabel(metric.category)}
            </span>

            {/* Metric name */}
            <p className="font-semibold text-base text-foreground mb-2">
              {metric.name}
            </p>

            {/* Target value */}
            <p className="font-mono text-sm text-foreground/70">
              {metric.target}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
