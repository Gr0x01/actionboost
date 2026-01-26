'use client'

import type { StructuredOutput } from '@/lib/ai/formatter-types'
import { PositioningSummaryV2, LeadDiscovery } from '../dashboard'
import { FreePreviewPaywall } from './FreePreviewPaywall'

interface FreeInsightsViewProps {
  structuredOutput: StructuredOutput
  freeAuditId: string
  token: string
}

/**
 * FreeInsightsView - Positioning preview for free tier
 *
 * Shows only:
 * 1. PositioningSummaryV2 (verdict, summary, unique value, target segment)
 * 2. LeadDiscovery (top discovery)
 * 3. FreePreviewPaywall (conversion CTA)
 *
 * Everything else is locked behind the paywall.
 */
export function FreeInsightsView({ structuredOutput, freeAuditId, token }: FreeInsightsViewProps) {
  const { positioning, discoveries, topPriorities } = structuredOutput

  // Get lead discovery (first one = highest surpriseScore per formatter)
  const leadDiscovery = discoveries?.[0]

  // Preview priorities for blurred cards (if available)
  const previewPriorities = topPriorities?.slice(0, 3).map((p) => ({
    title: p.title,
    rank: p.rank,
  }))

  return (
    <div className="space-y-16">
      {/* 1. Positioning - FREE */}
      {positioning && <PositioningSummaryV2 positioning={positioning} />}

      {/* 2. Lead Discovery - FREE */}
      {leadDiscovery && <LeadDiscovery discovery={leadDiscovery} />}

      {/* 3. PAYWALL */}
      <FreePreviewPaywall
        freeAuditId={freeAuditId}
        token={token}
        previewPriorities={previewPriorities}
      />
    </div>
  )
}
