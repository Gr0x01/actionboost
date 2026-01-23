'use client'

import type { CompetitiveComparison as CompetitiveComparisonType } from '@/lib/ai/formatter-types'

interface CompetitiveComparisonProps {
  comparison: CompetitiveComparisonType
}

/**
 * Format traffic number for display
 */
function formatTraffic(traffic: number | null): string {
  if (traffic === null) return 'N/A'
  if (traffic >= 1000000) {
    return `${(traffic / 1000000).toFixed(1)}M`
  }
  if (traffic >= 1000) {
    return `${Math.round(traffic / 1000)}K`
  }
  return traffic.toLocaleString()
}

/**
 * Get bar width as percentage of max traffic
 */
function getBarWidth(traffic: number | null, maxTraffic: number): number {
  if (traffic === null || maxTraffic === 0) return 5 // Minimum width for visibility
  return Math.max(5, Math.round((traffic / maxTraffic) * 100))
}

/**
 * CompetitiveComparison - Traffic bar chart comparing domains
 *
 * Visual comparison of organic traffic across competitors
 * Soft Brutalist: solid bars, clear hierarchy, tactile feel
 */
export function CompetitiveComparison({ comparison }: CompetitiveComparisonProps) {
  const { domains } = comparison

  if (!domains || domains.length === 0) {
    return null
  }

  // Sort by traffic (highest first), user domain always visible
  const sortedDomains = [...domains].sort((a, b) => {
    // User domain goes last for visual emphasis
    if (a.isUser) return 1
    if (b.isUser) return -1
    return (b.traffic || 0) - (a.traffic || 0)
  })

  // Find max traffic for bar scaling
  // If all traffic is 0/null, use 1 to show equal-width bars
  const trafficValues = domains.map((d) => d.traffic || 0)
  const maxTraffic = Math.max(...trafficValues, 0) || 1

  return (
    <section className="scroll-mt-32">
      <div
        className="rounded-md border-2 border-foreground/20 bg-background p-5"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
      >
        {/* Section label */}
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
          TRAFFIC COMPARISON
        </span>

        {/* Bar chart */}
        <div className="space-y-3">
        {sortedDomains.slice(0, 6).map((domain) => {
          const barWidth = getBarWidth(domain.traffic, maxTraffic)
          const isUser = domain.isUser

          return (
            <div key={domain.domain} className="group">
              {/* Domain name row */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isUser ? 'text-cta font-semibold' : 'text-foreground/80'
                  }`}
                >
                  {domain.domain}
                  {isUser && (
                    <span className="ml-2 text-xs font-normal text-cta/70">(you)</span>
                  )}
                </span>
                <span className="font-mono text-sm text-foreground/60">
                  {formatTraffic(domain.traffic)}/mo
                </span>
              </div>

              {/* Bar */}
              <div className="h-6 bg-foreground/[0.05] border border-foreground/10 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-300 ${
                    isUser
                      ? 'bg-cta'
                      : 'bg-foreground/20 group-hover:bg-foreground/30'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Keywords count if available */}
              {domain.keywords !== null && domain.keywords > 0 && (
                <p className="text-xs text-foreground/40 mt-1">
                  {domain.keywords.toLocaleString()} ranking keywords
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
