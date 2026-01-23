'use client'

import type { ParsedStrategy } from '@/lib/markdown/parser'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import {
  // Legacy components (fallbacks)
  PositioningSummary,
  CompetitorSnapshot,
  // Existing components
  PriorityCards,
  MetricsSnapshot,
  DeepDivesAccordion,
  // NEW: Research-backed components
  CompetitiveComparison,
  KeywordOpportunities,
  MarketPulse,
  PositioningSummaryV2,
} from './dashboard'

interface InsightsViewProps {
  strategy: ParsedStrategy
  structuredOutput: StructuredOutput
}

/**
 * InsightsView - "What we found" tab for new users
 *
 * Layout (with graceful fallbacks):
 * 1. PositioningSummaryV2 OR legacy PositioningSummary
 * 2. PriorityCards (existing)
 * 3. CompetitiveComparison OR legacy CompetitorSnapshot
 * 4. KeywordOpportunities (if available)
 * 5. MarketPulse (if available)
 * 6. MetricsSnapshot (existing)
 * 7. DeepDivesAccordion (existing)
 */
export function InsightsView({ strategy, structuredOutput }: InsightsViewProps) {
  // Destructure optional research-backed data for cleaner conditionals
  const {
    positioning,
    competitiveComparison,
    keywordOpportunities,
    marketQuotes,
  } = structuredOutput

  return (
    <div className="space-y-24">
      {/* 1. Positioning - V2 (data-driven) OR legacy (regex-parsed) */}
      {positioning ? (
        <PositioningSummaryV2 positioning={positioning} />
      ) : (
        <PositioningSummary strategy={strategy} />
      )}

      {/* 3. Top Priorities - #1 as hero, #2-3 compact */}
      {structuredOutput.topPriorities.length > 0 && (
        <PriorityCards priorities={structuredOutput.topPriorities} />
      )}

      {/* 4. Competitive Comparison - V2 (traffic bars) OR legacy (list) */}
      {competitiveComparison?.domains?.length ? (
        <CompetitiveComparison comparison={competitiveComparison} />
      ) : (
        structuredOutput.competitors.length > 0 && (
          <CompetitorSnapshot competitors={structuredOutput.competitors} />
        )
      )}

      {/* 5. Keyword Opportunities (NEW) - keyword gap table */}
      {keywordOpportunities?.keywords?.length > 0 && (
        <KeywordOpportunities opportunities={keywordOpportunities} />
      )}

      {/* 6. Market Pulse (NEW) - Reddit/community quotes */}
      {marketQuotes?.quotes?.length > 0 && (
        <MarketPulse quotes={marketQuotes} />
      )}

      {/* 7. Metrics Snapshot (existing) */}
      {structuredOutput.metrics.length > 0 && (
        <MetricsSnapshot metrics={structuredOutput.metrics} />
      )}

      {/* 8. Deep Dives - minimal, constrained width */}
      <div className="max-w-3xl">
        <DeepDivesAccordion strategy={strategy} />
      </div>
    </div>
  )
}
