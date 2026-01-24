'use client'

import type { ParsedStrategy } from '@/lib/markdown/parser'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import {
  PriorityCards,
  MetricsSnapshot,
  DeepDivesAccordion,
  CompetitiveComparison,
  KeywordOpportunities,
  MarketPulse,
  PositioningSummaryV2,
} from './dashboard'
import { RefinementInterstitial } from './RefinementInterstitial'

interface InsightsViewProps {
  strategy: ParsedStrategy
  structuredOutput: StructuredOutput
  runId?: string
  refinementsUsed?: number
  isOwner?: boolean
}

/**
 * InsightsView - "What we found" tab
 *
 * Layout:
 * 1. PositioningSummaryV2 (from structured output)
 * 2. PriorityCards
 * 3. CompetitiveComparison (if available)
 * 4. KeywordOpportunities (if available)
 * 5. MarketPulse (if available)
 * 6. MetricsSnapshot
 * 7. DeepDivesAccordion
 */
export function InsightsView({
  strategy,
  structuredOutput,
  runId,
  refinementsUsed = 0,
  isOwner = true,
}: InsightsViewProps) {
  const {
    positioning,
    competitiveComparison,
    keywordOpportunities,
    marketQuotes,
  } = structuredOutput

  return (
    <div className="space-y-24">
      {/* 1. Positioning - from structured output only */}
      {positioning && <PositioningSummaryV2 positioning={positioning} />}

      {/* 3. Top Priorities - #1 as hero, #2-3 compact */}
      {structuredOutput.topPriorities.length > 0 && (
        <PriorityCards priorities={structuredOutput.topPriorities} />
      )}

      {/* Refinement Interstitial - after the "big hit" of positioning + priorities */}
      {runId && (
        <RefinementInterstitial
          runId={runId}
          refinementsUsed={refinementsUsed}
          isOwner={isOwner}
        />
      )}

      {/* 4. Competitive Comparison - from structured output only */}
      {competitiveComparison && competitiveComparison.domains.length > 0 && (
        <CompetitiveComparison comparison={competitiveComparison} />
      )}

      {/* 5. Market Pulse - breaks card run with typography */}
      {marketQuotes && marketQuotes.quotes.length > 0 && (
        <MarketPulse quotes={marketQuotes} />
      )}

      {/* 6. Keyword Opportunities - keyword gap table */}
      {keywordOpportunities && keywordOpportunities.keywords.length > 0 && (
        <KeywordOpportunities opportunities={keywordOpportunities} />
      )}

      {/* 7. Metrics Snapshot (existing) */}
      {structuredOutput.metrics.length > 0 && (
        <MetricsSnapshot metrics={structuredOutput.metrics} />
      )}

      {/* 8. Deep Dives - full width, prose constrained inside */}
      <DeepDivesAccordion strategy={strategy} />
    </div>
  )
}
