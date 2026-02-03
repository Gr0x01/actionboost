'use client'

import type { StrategyContext } from '@/lib/ai/types'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import { PositioningSummaryV2 } from '@/components/results/dashboard/PositioningSummaryV2'
import { CompetitiveComparison } from '@/components/results/dashboard/CompetitiveComparison'
import { KeywordOpportunities } from '@/components/results/dashboard/KeywordOpportunities'
import { PriorityCards } from '@/components/results/dashboard/PriorityCards'
import { MarketPulse } from '@/components/results/dashboard/MarketPulse'
import { LeadDiscovery } from '@/components/results/dashboard/LeadDiscovery'

interface SubscriberInsightsProps {
  strategyContext: (StrategyContext & { insights?: StructuredOutput; researchData?: unknown }) | null
  insights: StructuredOutput | null
  currentWeek: number
  learnings: Array<{
    weekNumber: number
    worked: string[]
    didntWork: string[]
  }>
  checkins: Array<{
    weekNumber: number
    sentiment: string
    notes: string
  }>
}

/**
 * Section group — label + vertical spacing. No wrapper card.
 * Child components handle their own borders/shadows.
 */
function InsightGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block">
        {label}
      </span>
      {children}
    </section>
  )
}

export function SubscriberInsights({
  strategyContext,
  insights,
  currentWeek,
  learnings,
  checkins,
}: SubscriberInsightsProps) {
  // Empty state — strategy still generating
  if (!strategyContext) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="bg-white border-2 border-foreground/20 rounded-md p-8 text-center"
          style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
        >
          <p className="text-lg font-semibold text-foreground mb-2">
            Your marketing intelligence is being assembled.
          </p>
          <p className="text-sm text-foreground/50">
            Our research engine is analyzing your market, competitors, and opportunities.
            This usually takes a few minutes after signup.
          </p>
        </div>
      </div>
    )
  }

  const hasInsights = !!insights
  const hasLearnings = learnings.length > 0
  const monthNumber = strategyContext.monthNumber || 1
  const hasStrategyEvolution = monthNumber >= 2

  // Discoveries sorted by surprise score — lead gets hero treatment, rest listed
  const sortedDiscoveries = insights?.discoveries?.slice().sort(
    (a, b) => (b.surpriseScore || 5) - (a.surpriseScore || 5)
  ) || []
  const leadDiscovery = sortedDiscoveries[0]
  const remainingDiscoveries = sortedDiscoveries.slice(1)

  const hasMarketSection =
    hasInsights &&
    (insights.competitiveComparison || insights.marketQuotes || sortedDiscoveries.length > 0)

  const hasOpportunitySection =
    hasInsights &&
    (insights.keywordOpportunities ||
      (insights.topPriorities && insights.topPriorities.length > 0))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-foreground/50 mt-1">
          Strategic context behind your weekly tasks
        </p>
      </div>

      {/* ─── GROUP 1: THE SITUATION ─── */}
      <InsightGroup label="THE SITUATION">
        <div
          className="bg-white border-2 border-foreground/20 rounded-md p-6 space-y-6"
          style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
        >
          <p className="text-lg font-semibold text-foreground leading-relaxed">
            {strategyContext.quarterFocus.strategicRationale}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-foreground/[0.05] border border-foreground/10 text-sm font-medium text-foreground/70">
              {strategyContext.quarterFocus.growthLever}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-foreground/[0.05] border border-foreground/10 text-sm font-medium text-foreground/70">
              {strategyContext.monthlyTheme.theme}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-md bg-foreground/[0.05] border border-foreground/10 text-sm font-medium text-foreground/70">
              {strategyContext.quarterFocus.channelStrategy.primary}
            </span>
          </div>
        </div>

        {/* Positioning — own card */}
        {hasInsights && insights.positioning && (
          <PositioningSummaryV2 positioning={insights.positioning} />
        )}
      </InsightGroup>

      {/* ─── YOUR MARKET — child components self-label ─── */}
      {(hasMarketSection || leadDiscovery) && (
        <section className="space-y-6">
          {leadDiscovery && (
            <LeadDiscovery discovery={leadDiscovery} />
          )}

          {remainingDiscoveries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {remainingDiscoveries.map((d, i) => (
                <div key={i} className="border border-foreground/10 rounded-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
                        {d.type.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-1">{d.title}</h4>
                      <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{d.content}</p>
                    </div>
                    {d.surpriseScore && d.surpriseScore >= 7 && (
                      <span className="font-mono text-[10px] text-foreground/40 bg-foreground/5 px-2 py-1 rounded shrink-0">
                        {d.surpriseScore}/10
                      </span>
                    )}
                  </div>
                  {d.significance && (
                    <p className="text-xs text-foreground/50 mt-2">
                      <span className="font-medium text-foreground/60">Why it matters:</span> {d.significance}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasInsights && insights.competitiveComparison && (
            <CompetitiveComparison comparison={insights.competitiveComparison} />
          )}

          {hasInsights && insights.marketQuotes && (
            <MarketPulse quotes={insights.marketQuotes} />
          )}
        </section>
      )}

      {/* ─── OPPORTUNITIES — child components self-label ─── */}
      {hasOpportunitySection && (
        <section className="space-y-6">
          {insights!.keywordOpportunities && (
            <KeywordOpportunities opportunities={insights!.keywordOpportunities} />
          )}

          {insights!.topPriorities && insights!.topPriorities.length > 0 && (
            <PriorityCards priorities={insights!.topPriorities} />
          )}
        </section>
      )}

      {/* ─── GROUP 4: WHAT YOU'VE LEARNED (week 2+) ─── */}
      {hasLearnings && currentWeek >= 2 && (
        <InsightGroup label="WHAT YOU'VE LEARNED">
          <div className="space-y-4">
            {learnings
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .map((week) => (
                <div
                  key={week.weekNumber}
                  className="border border-foreground/10 rounded-md p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50 block mb-2">
                    Week {week.weekNumber}
                  </span>
                  {week.worked.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-emerald-600">Worked:</span>
                      <ul className="mt-1 space-y-1">
                        {week.worked.map((item, i) => (
                          <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {week.didntWork.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-foreground/40">Skipped:</span>
                      <ul className="mt-1 space-y-1">
                        {week.didntWork.map((item, i) => (
                          <li key={i} className="text-sm text-foreground/40 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/20 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

            {checkins.length > 0 && (
              <div className="border-t border-foreground/8 pt-4">
                <span className="text-xs font-medium text-foreground/40 block mb-2">Your notes:</span>
                {checkins.map((c, i) => (
                  <p key={i} className="text-sm text-foreground/60 mb-1">
                    <span className="text-foreground/40">Week {c.weekNumber}:</span> {c.notes}
                  </p>
                ))}
              </div>
            )}
          </div>
        </InsightGroup>
      )}

      {/* ─── GROUP 5: STRATEGY EVOLUTION (month 2+) ─── */}
      {hasStrategyEvolution && (
        <InsightGroup label="STRATEGY EVOLUTION">
          <div
            className="bg-white border-2 border-foreground/20 rounded-md p-6"
            style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
          >
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <span className="font-semibold text-foreground">Month {monthNumber}</span>
              <span className="text-foreground/30">&mdash;</span>
              <span>{strategyContext.monthlyTheme.theme}: {strategyContext.monthlyTheme.focusArea}</span>
            </div>
            {strategyContext.monthlyTheme.carryForward &&
              strategyContext.monthlyTheme.carryForward.learnings.length > 0 && (
                <p className="text-xs text-foreground/50 mt-3">
                  Key learnings: {strategyContext.monthlyTheme.carryForward.learnings.join(' / ')}
                </p>
              )}
          </div>
        </InsightGroup>
      )}

      {/* No insights yet — strategy exists but no extracted data */}
      {!hasInsights && (
        <div className="bg-white border-2 border-foreground/10 rounded-md p-6 text-center">
          <p className="text-sm text-foreground/50">
            Detailed market intelligence will appear here after your next strategy refresh.
          </p>
        </div>
      )}
    </div>
  )
}
