'use client'

import type { ParsedStrategy } from '@/lib/markdown/parser'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import {
  PositioningSummary,
  PriorityCards,
  MetricsSnapshot,
  CompetitorSnapshot,
  DeepDivesAccordion,
} from './dashboard'

interface InsightsViewProps {
  strategy: ParsedStrategy
  structuredOutput: StructuredOutput
}

/**
 * InsightsView - "What we found" tab for new users
 *
 * Layout:
 * 1. PositioningSummary (hero - positioning analysis)
 * 2. PriorityCards (top 3 priorities)
 * 3. MetricsSnapshot + CompetitorSnapshot (side by side)
 * 4. DeepDivesAccordion (for skeptics who want details)
 */
export function InsightsView({ strategy, structuredOutput }: InsightsViewProps) {
  return (
    <div className="space-y-12">
      {/* Hero: Positioning Summary - "what we found" */}
      <PositioningSummary strategy={strategy} />

      {/* Top Priorities - #1 as hero, #2-3 compact */}
      {structuredOutput.topPriorities.length > 0 && (
        <PriorityCards priorities={structuredOutput.topPriorities} />
      )}

      {/* Metrics + Competitors - asymmetric split, no outer boxes */}
      {(structuredOutput.metrics.length > 0 || structuredOutput.competitors.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {structuredOutput.metrics.length > 0 && (
            <div className="lg:col-span-3">
              <MetricsSnapshot metrics={structuredOutput.metrics} />
            </div>
          )}
          {structuredOutput.competitors.length > 0 && (
            <div className="lg:col-span-2">
              <CompetitorSnapshot competitors={structuredOutput.competitors} />
            </div>
          )}
        </div>
      )}

      {/* Deep Dives - minimal, constrained width */}
      <div className="max-w-3xl">
        <DeepDivesAccordion strategy={strategy} />
      </div>
    </div>
  )
}
