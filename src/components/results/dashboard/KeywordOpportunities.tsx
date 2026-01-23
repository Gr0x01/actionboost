'use client'

import { TrendingUp } from 'lucide-react'
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

  return (
    <section className="scroll-mt-32">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-cta" />
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block">
            KEYWORD OPPORTUNITIES
          </span>
          <p className="text-sm text-foreground/60">
            Keywords your competitors rank for that you don&apos;t
          </p>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-md border-2 border-foreground/20 overflow-hidden"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
      >
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-foreground/[0.03] border-b border-foreground/10">
          <div className="col-span-6 lg:col-span-5">
            <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase">
              Keyword
            </span>
          </div>
          <div className="col-span-3 lg:col-span-3 text-right">
            <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase">
              Volume
            </span>
          </div>
          <div className="col-span-3 lg:col-span-2 text-right">
            <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase">
              Their Rank
            </span>
          </div>
          <div className="hidden lg:block lg:col-span-2">
            <span className="font-mono text-[10px] tracking-wider text-foreground/50 uppercase">
              Competitor
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-foreground/10">
          {topKeywords.map((kw, index) => {
            const colors = getDifficultyColor(kw.difficulty)

            return (
              <div
                key={`${kw.keyword}-${index}`}
                className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-foreground/[0.02] transition-colors"
              >
                {/* Keyword */}
                <div className="col-span-6 lg:col-span-5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {kw.keyword}
                  </p>
                </div>

                {/* Volume */}
                <div className="col-span-3 lg:col-span-3 text-right">
                  <span className="font-mono text-sm font-semibold text-foreground/80">
                    {formatVolume(kw.volume)}
                  </span>
                  <span className="text-xs text-foreground/40">/mo</span>
                </div>

                {/* Competitor rank */}
                <div className="col-span-3 lg:col-span-2 text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors.bg} ${colors.text}`}
                  >
                    #{kw.competitorRank}
                  </span>
                </div>

                {/* Competitor name (desktop only) */}
                <div className="hidden lg:block lg:col-span-2">
                  <span className="text-xs text-foreground/50 truncate">
                    {kw.competitor}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
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
