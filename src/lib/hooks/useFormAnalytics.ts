'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { PostHog } from 'posthog-js'
import { STEP_NAMES } from '@/lib/constants/form'

type ViewState = 'loading' | 'welcome_back' | 'context_update' | 'questions' | 'checkout'

interface UseFormAnalyticsOptions {
  posthog?: PostHog | null
  entrySource: string
  viewState: ViewState
  currentQuestion: number
  questionId?: string
}

interface UseFormAnalyticsResult {
  stepStartTime: React.MutableRefObject<number>
  formStartTime: React.MutableRefObject<number>
  trackFormStart: () => void
  resetStepTimer: () => void
}

/**
 * Hook to manage form analytics tracking (start, abandonment, step timing)
 */
export function useFormAnalytics({
  posthog,
  entrySource,
  viewState,
  currentQuestion,
  questionId,
}: UseFormAnalyticsOptions): UseFormAnalyticsResult {
  const stepStartTime = useRef<number>(Date.now())
  const formStartTime = useRef<number>(Date.now())
  const hasTrackedStart = useRef(false)

  // Track form start (called once when form loads)
  const trackFormStart = useCallback(() => {
    if (!hasTrackedStart.current) {
      posthog?.capture('form_started', {
        version: 'rapid-fire',
        entry_source: entrySource,
      })
      formStartTime.current = Date.now()
      stepStartTime.current = Date.now()
      hasTrackedStart.current = true
    }
  }, [posthog, entrySource])

  // Form abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (viewState === 'questions' || viewState === 'checkout') {
        const stepName = viewState === 'checkout' ? 'checkout' : STEP_NAMES[questionId || ''] || 'unknown'
        const timeSpent = Math.round((Date.now() - formStartTime.current) / 1000)
        posthog?.capture('form_abandoned', {
          last_step: currentQuestion + 1,
          step_name: stepName,
          view_state: viewState,
          time_spent_seconds: timeSpent,
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [viewState, currentQuestion, questionId, posthog])

  const resetStepTimer = useCallback(() => {
    stepStartTime.current = Date.now()
  }, [])

  return {
    stepStartTime,
    formStartTime,
    trackFormStart,
    resetStepTimer,
  }
}
