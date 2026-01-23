'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import {
  getDefaultTab,
  recordRunVisit,
  saveTabPreference,
  type TabType,
} from '@/lib/storage/visitTracking'

interface UseResultsTabOptions {
  runId: string
  isNewCheckout?: boolean
}

/**
 * Custom hook for managing tab state on the results page
 *
 * Handles:
 * - URL sync (?view=insights or ?view=dashboard)
 * - localStorage persistence
 * - First visit detection
 * - PostHog tracking
 */
export function useResultsTab({ runId, isNewCheckout = false }: UseResultsTabOptions) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const posthog = usePostHog()
  const urlViewParam = searchParams.get('view')

  // Compute default tab on each render (derives from URL params)
  const defaultTab = getDefaultTab(runId, urlViewParam, isNewCheckout)

  // Track if user has manually switched tabs
  const [userSelectedTab, setUserSelectedTab] = useState<TabType | null>(null)

  // Active tab is user selection if set, otherwise computed default
  const activeTab = userSelectedTab ?? defaultTab

  // Record visit on mount (only once, using ref to avoid effect setState)
  const visitRecordedRef = useRef(false)
  useEffect(() => {
    if (!visitRecordedRef.current) {
      recordRunVisit(runId)
      visitRecordedRef.current = true
    }
  }, [runId])

  // Handle tab change with URL sync
  const handleTabChange = useCallback((tab: TabType) => {
    const prevTab = userSelectedTab ?? defaultTab
    setUserSelectedTab(tab)
    saveTabPreference(runId, tab)

    // Update URL (shallow navigation)
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', tab)
    router.replace(`?${params.toString()}`, { scroll: false })

    // Track tab switch
    posthog?.capture('results_tab_switch', {
      run_id: runId,
      from_tab: prevTab,
      to_tab: tab,
    })
  }, [runId, searchParams, router, posthog, userSelectedTab, defaultTab])

  return {
    activeTab,
    onTabChange: handleTabChange,
  }
}
