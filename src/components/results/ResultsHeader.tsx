'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { PlanSwitcher } from './PlanSwitcher'
import { ResultsTabNavigation } from './ResultsTabNavigation'
import { ExportActions } from './ExportActions'
import { RefinementIndicator } from './RefinementIndicator'
import { config } from '@/lib/config'
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
    disabled?: boolean
  }
  refinementProps?: {
    refinementsUsed: number
    isOwner: boolean
  }
  showCalendar?: boolean
  /** Tabs to show as disabled (grayed out) */
  disabledTabs?: TabType[]
  /** Show upgrade CTA button */
  showUpgradeCta?: boolean
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
  refinementProps,
  showCalendar = false,
  disabledTabs = [],
  showUpgradeCta = false,
}: ResultsHeaderProps) {
  const router = useRouter()
  const posthog = usePostHog()

  const handleUpgrade = () => {
    posthog?.capture('free_results_header_cta_clicked')
    router.push('/start')
  }

  return (
    <div className="sticky top-14 z-40 bg-background border-b border-foreground/10">
      <div className="mx-auto max-w-5xl px-6">
        {/* Grid layout: Plan name | Tabs (centered) | Actions */}
        {/* Mobile: 2-col (left + right), Desktop: 3-col with centered tabs */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Plan Switcher */}
          <div className="py-3">
            <PlanSwitcher currentPlan={plan} otherPlans={otherPlans} />
          </div>

          {/* Center: Tabs - truly centered via grid */}
          <div className="hidden sm:flex justify-center self-stretch">
            <ResultsTabNavigation
              activeTab={activeTab}
              onTabChange={onTabChange}
              showCalendar={showCalendar}
              disabledTabs={disabledTabs}
            />
          </div>

          {/* Right: Actions */}
          <div className="py-3 flex justify-end items-center gap-3">
            {refinementProps && (
              <RefinementIndicator
                refinementsUsed={refinementProps.refinementsUsed}
                isOwner={refinementProps.isOwner}
              />
            )}
            <ExportActions {...exportProps} />
            {showUpgradeCta && (
              <button
                onClick={handleUpgrade}
                className="
                  inline-flex items-center gap-1.5
                  bg-cta text-white font-semibold
                  px-3 py-1.5 rounded-md text-sm
                  border-b-2 border-b-[#B85D10]
                  hover:-translate-y-0.5 hover:shadow-md
                  active:translate-y-0.5 active:border-b-0
                  transition-all duration-100
                "
              >
                Upgrade · {config.singlePrice}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: Tabs row - aligned to bottom */}
        <div className="sm:hidden">
          <ResultsTabNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
            showCalendar={showCalendar}
            disabledTabs={disabledTabs}
          />
        </div>
      </div>
    </div>
  )
}
