'use client'

import type { StructuredOutput } from '@/lib/ai/formatter-types'
import { PositioningSummaryV2 } from '../dashboard/PositioningSummaryV2'
import { BriefScoreGauge } from './BriefScoreGauge'
import { ThreeSecondTest } from './ThreeSecondTest'
import { QuickWins } from './QuickWins'
import { PositioningGap } from './PositioningGap'
import { CompetitiveLandscapeFree } from './CompetitiveLandscapeFree'
import { FreePreviewPaywall } from './FreePreviewPaywall'
import { LockedSections } from './LockedSections'

interface FreeInsightsViewProps {
  structuredOutput: StructuredOutput
  freeAuditId: string
  token: string
}

/**
 * FreeInsightsView - Free Brief results page (5-zone layout)
 *
 * Zone 1: Hero Diagnosis — Positioning (3/5) + Score Gauge (2/5)
 * Zone 2: Evidence Row — ThreeSecondTest + PositioningGap side-by-side
 * Zone 3: Action Strip — QuickWins as horizontal cards
 * Zone 4: Competitive Context — Traffic chart + UrgencyHook
 * Zone 5: Locked Paywall — Skeleton sections + CTA
 */
export function FreeInsightsView({ structuredOutput, freeAuditId, token }: FreeInsightsViewProps) {
  const {
    positioning,
    briefScores,
    competitiveComparison,
    threeSecondTest,
    quickWins,
    positioningGap,
  } = structuredOutput

  return (
    <div className="space-y-16">
      {/* Zone 1: Hero Diagnosis — Positioning + Score side-by-side */}
      {(positioning || briefScores) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {positioning && (
            <div className="lg:col-span-3">
              <PositioningSummaryV2 positioning={positioning} />
            </div>
          )}
          {briefScores && (
            <div className={positioning ? 'lg:col-span-2' : 'lg:col-span-5'}>
              <BriefScoreGauge scores={briefScores} />
            </div>
          )}
        </div>
      )}

      {/* Zone 2: Evidence Row — 3-Second Test + Positioning Gap */}
      {(threeSecondTest || positioningGap) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {positioningGap && <div className="lg:col-span-3"><PositioningGap gap={positioningGap} /></div>}
          {threeSecondTest && <div className="lg:col-span-2"><ThreeSecondTest test={threeSecondTest} /></div>}
        </div>
      )}

      {/* Zone 3: Action Strip — Quick Wins as horizontal cards */}
      {quickWins && quickWins.length > 0 && <QuickWins wins={quickWins} />}

      {/* Zone 4: Competitive Context */}
      <CompetitiveLandscapeFree
        competitors={structuredOutput.competitors}
        comparison={competitiveComparison}
      />

      {/* Zone 5: Locked + Paywall */}
      <LockedSections structuredOutput={structuredOutput} freeAuditId={freeAuditId} token={token} />
      <FreePreviewPaywall freeAuditId={freeAuditId} token={token} />
    </div>
  )
}
