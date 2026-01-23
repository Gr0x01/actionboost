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
 * MetricsSnapshot - Compact tile strip
 * No borders, background tint only, horizontal scroll on mobile
 */
export function MetricsSnapshot({ metrics }: MetricsSnapshotProps) {
  const displayMetrics = metrics.slice(0, 6)

  if (displayMetrics.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Whisper-quiet section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
        KEY METRICS
      </span>

      {/* Horizontal scroll on mobile, 2-col grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible scrollbar-hide">
        {displayMetrics.map((metric, index) => (
          <div
            key={`${metric.name}-${index}`}
            className="shrink-0 w-[160px] lg:w-auto bg-foreground/[0.03] p-4 rounded-lg"
          >
            {/* Category label - whisper quiet */}
            <span className="font-mono text-[9px] tracking-wider text-foreground/40 uppercase">
              {getCategoryLabel(metric.category)}
            </span>

            {/* Metric name */}
            <p className="font-semibold text-sm text-foreground mt-2 line-clamp-2 leading-snug">
              {metric.name}
            </p>

            {/* Target - prominent mono */}
            <p className="font-mono text-lg font-bold text-foreground/70 mt-1">
              {metric.target}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
