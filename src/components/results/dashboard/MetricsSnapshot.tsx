import type { MetricItem } from '@/lib/ai/formatter-types'

interface MetricsSnapshotProps {
  metrics: MetricItem[]
}

/**
 * Get plain English category label (friendly, no jargon)
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    acquisition: 'Finding you',
    activation: 'Trying you',
    retention: 'Coming back',
    referral: 'Telling friends',
    revenue: 'Paying you',
  }
  return labels[category] || 'Goal'
}

/**
 * Get accent color for category
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    acquisition: 'border-l-blue-400/50',
    activation: 'border-l-emerald-400/50',
    retention: 'border-l-violet-400/50',
    referral: 'border-l-amber-400/50',
    revenue: 'border-l-cta/50',
  }
  return colors[category] || 'border-l-foreground/20'
}

/**
 * MetricsSnapshot - Compact tile strip
 * Confident styling with solid accents, horizontal scroll on mobile
 */
export function MetricsSnapshot({ metrics }: MetricsSnapshotProps) {
  const displayMetrics = metrics.slice(0, 6)

  if (displayMetrics.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Confident section label */}
      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block mb-4">
        Your key metrics
      </span>

      {/* Horizontal scroll on mobile, 2-col grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible scrollbar-hide">
        {displayMetrics.map((metric, index) => (
          <div
            key={`${metric.name}-${index}`}
            className={`shrink-0 w-[170px] lg:w-auto bg-white p-4 rounded-xl border border-foreground/10 border-l-[3px] ${getCategoryColor(metric.category)} hover:shadow-[0_2px_8px_rgba(44,62,80,0.06)] transition-shadow`}
          >
            {/* Category label - confident */}
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
              {getCategoryLabel(metric.category)}
            </span>

            {/* Metric name */}
            <p className="font-semibold text-sm text-foreground mt-2 line-clamp-2 leading-snug">
              {metric.name}
            </p>

            {/* Target - prominent */}
            <p className="text-lg font-bold text-foreground mt-1">
              {metric.target}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
