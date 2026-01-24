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
  LeadDiscovery,
  Discoveries,
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
 * 2. LeadDiscovery (hero - single most impactful discovery)
 * 3. PriorityCards
 * 4. RefinementInterstitial (CTA break)
 * 5. CompetitiveComparison (if available)
 * 6. MarketPulse (if available)
 * 7. KeywordOpportunities (if available)
 * 8. MetricsSnapshot
 * 9. Discoveries (remaining discoveries)
 * 10. DeepDivesAccordion
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
    discoveries,
  } = structuredOutput

  // Split discoveries: first one is hero, rest go to secondary section
  const leadDiscovery = discoveries?.[0]
  const remainingDiscoveries = discoveries?.slice(1) || []

  return (
    <div className="space-y-24">
      {/* 1. Positioning */}
      {positioning && <PositioningSummaryV2 positioning={positioning} />}

      {/* 2. Lead Discovery (hero) */}
      {leadDiscovery && <LeadDiscovery discovery={leadDiscovery} />}

      {/* 3. Top Priorities */}
      {structuredOutput.topPriorities.length > 0 && (
        <PriorityCards priorities={structuredOutput.topPriorities} />
      )}

      {/* 4. Refinement Interstitial */}
      {runId && (
        <RefinementInterstitial
          runId={runId}
          refinementsUsed={refinementsUsed}
          isOwner={isOwner}
        />
      )}

      {/* 5. Competitive Comparison */}
      {competitiveComparison && competitiveComparison.domains.length > 0 && (
        <CompetitiveComparison comparison={competitiveComparison} />
      )}

      {/* 6. Market Pulse */}
      {marketQuotes && marketQuotes.quotes.length > 0 && (
        <MarketPulse quotes={marketQuotes} />
      )}

      {/* 7. Keyword Opportunities */}
      {keywordOpportunities && keywordOpportunities.keywords.length > 0 && (
        <KeywordOpportunities opportunities={keywordOpportunities} />
      )}

      {/* 8. Metrics Snapshot */}
      {structuredOutput.metrics.length > 0 && (
        <MetricsSnapshot metrics={structuredOutput.metrics} />
      )}

      {/* 9. Remaining Discoveries */}
      {remainingDiscoveries.length > 0 && (
        <Discoveries discoveries={remainingDiscoveries} />
      )}

      {/* 10. Deep Dives */}
      <DeepDivesAccordion strategy={strategy} />
    </div>
  )
}
