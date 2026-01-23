'use client'

import { PlanSwitcher } from './PlanSwitcher'
import { ResultsTabNavigation } from './ResultsTabNavigation'
import { ExportActions } from './ExportActions'
import type { TabType } from '@/lib/storage/visitTracking'

interface Plan {
  id: string
  name: string
  updatedAt: string
}

interface ResultsHeaderProps {
  plan: Plan
  otherPlans?: Plan[]
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  exportProps: {
    markdown: string
    runId: string
    shareSlug: string | null
    productName?: string
  }
}

/**
 * ResultsHeader - Unified header for the results page
 *
 * Combines:
 * - Plan switcher (top-left)
 * - Tab navigation (inline on desktop, below on mobile)
 * - Export actions (top-right)
 *
 * This makes the results page feel like the user's "home base"
 */
export function ResultsHeader({
  plan,
  otherPlans,
  activeTab,
  onTabChange,
  exportProps,
}: ResultsHeaderProps) {
  return (
    <div className="sticky top-14 z-40 bg-background border-b border-foreground/10">
      <div className="mx-auto max-w-5xl px-6">
        {/* Grid layout: Plan name | Tabs (centered) | Actions */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Plan Switcher */}
          <div className="py-3">
            <PlanSwitcher currentPlan={plan} otherPlans={otherPlans} />
          </div>

          {/* Center: Tabs - truly centered via grid */}
          <div className="hidden sm:flex justify-center self-stretch">
            <ResultsTabNavigation
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </div>

          {/* Right: Actions */}
          <div className="py-3 flex justify-end">
            <ExportActions {...exportProps} />
          </div>
        </div>

        {/* Mobile: Tabs row - aligned to bottom */}
        <div className="sm:hidden">
          <ResultsTabNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      </div>
    </div>
  )
}
