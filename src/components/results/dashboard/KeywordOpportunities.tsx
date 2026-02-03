'use client'

import type { KeywordOpportunity as KeywordOpportunityType } from '@/lib/ai/formatter-types'

interface KeywordOpportunitiesProps {
  opportunities: KeywordOpportunityType
}

/**
 * Format volume for display
 */
function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toLocaleString()
}

/**
 * Get difficulty color
 */
function getDifficultyColor(
  difficulty?: 'easy' | 'medium' | 'hard'
): { bg: string; text: string } {
  switch (difficulty) {
    case 'easy':
      return { bg: 'bg-green-50', text: 'text-green-600' }
    case 'medium':
      return { bg: 'bg-amber-50', text: 'text-amber-600' }
    case 'hard':
      return { bg: 'bg-red-50', text: 'text-red-600' }
    default:
      return { bg: 'bg-foreground/5', text: 'text-foreground/60' }
  }
}

/**
 * KeywordOpportunities - Keyword gap table
 *
 * Shows keywords competitors rank for that the user doesn't
 * Soft Brutalist: clean table, visible borders, bold volume numbers
 */
export function KeywordOpportunities({ opportunities }: KeywordOpportunitiesProps) {
  const { keywords } = opportunities

  if (!keywords || keywords.length === 0) {
    return null
  }

  // Sort by volume (highest first) and take top 10
  const topKeywords = [...keywords]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)

  // Only show rank column if any keyword actually has rank data
  const hasRankData = topKeywords.some((kw) => kw.competitorRank > 0)

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-1">
        KEYWORD OPPORTUNITIES
      </span>
      <p className="text-sm text-foreground/60 mb-4">
        Keywords your competitors rank for that you don&apos;t
      </p>

      {/* Table */}
      <div
        className="rounded-md border-2 border-foreground/20 overflow-hidden"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
      >
        <table className="w-full">
          <thead>
            <tr className="bg-foreground/[0.03] border-b border-foreground/10">
              <th className="text-left px-4 py-2">
                <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase font-normal">
                  Keyword
                </span>
              </th>
              <th className="text-right px-4 py-2 w-28">
                <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase font-normal">
                  Volume
                </span>
              </th>
              {hasRankData && (
                <th className="text-right px-4 py-2 w-24">
                  <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase font-normal">
                    Their Rank
                  </span>
                </th>
              )}
              <th className="text-left px-4 py-2 w-40">
                <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase font-normal">
                  Competitor
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {topKeywords.map((kw, index) => {
              const colors = getDifficultyColor(kw.difficulty)

              return (
                <tr
                  key={`${kw.keyword}-${index}`}
                  className="hover:bg-foreground/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      {kw.keyword}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="font-mono text-sm font-semibold text-foreground/80">
                      {formatVolume(kw.volume)}
                    </span>
                    <span className="text-xs text-foreground/40">/mo</span>
                  </td>
                  {hasRankData && (
                    <td className="px-4 py-3 text-right">
                      {kw.competitorRank > 0 ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors.bg} ${colors.text}`}
                        >
                          #{kw.competitorRank}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/30">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className="text-xs text-foreground/50">
                      {kw.competitor}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      {keywords.length > 10 && (
        <p className="text-xs text-foreground/40 mt-2 text-center">
          Showing top 10 of {keywords.length} opportunities
        </p>
      )}
    </section>
  )
}
