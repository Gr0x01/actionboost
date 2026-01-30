'use client'

import type { StructuredOutput } from '@/lib/ai/formatter-types'
import { PositioningSummaryV2, LeadDiscovery } from '../dashboard'
import { FreePreviewPaywall } from './FreePreviewPaywall'
import { LockedSections } from './LockedSections'

interface FreeInsightsViewProps {
  structuredOutput: StructuredOutput
  freeAuditId: string
  token: string
}

/**
 * FreeInsightsView - Positioning preview for free tier
 *
 * Shows:
 * 1. PositioningSummaryV2 (verdict, summary, unique value, target segment)
 * 2. LeadDiscovery (top discovery)
 * 3. FreePreviewPaywall (conversion CTA)
 * 4. Locked preview sections (faded skeletons of paid content)
 */
export function FreeInsightsView({ structuredOutput, freeAuditId, token }: FreeInsightsViewProps) {
  const { positioning, discoveries } = structuredOutput

  // Get lead discovery (first one = highest surpriseScore per formatter)
  const leadDiscovery = discoveries?.[0]

  return (
    <div className="space-y-16">
      {/* 1. Positioning - FREE */}
      {positioning && <PositioningSummaryV2 positioning={positioning} />}

      {/* 2. Lead Discovery - FREE */}
      {leadDiscovery && <LeadDiscovery discovery={leadDiscovery} />}

      {/* 3. Locked preview sections */}
      <LockedSections />

      {/* 4. PAYWALL */}
      <FreePreviewPaywall freeAuditId={freeAuditId} token={token} />
    </div>
  )
}
