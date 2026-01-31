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
  totalQuestions: number
}

interface UseFormAnalyticsResult {
  stepStartTime: React.MutableRefObject<number>
  formStartTime: React.MutableRefObject<number>
  trackFormStart: () => void
  trackStepViewed: (stepIndex: number, stepId: string) => void
  trackStepCompleted: (stepIndex: number, stepId: string, skipped: boolean) => void
  resetStepTimer: () => void
}

/**
 * Hook to manage form analytics tracking (start, step views, step completions, abandonment)
 *
 * Events emitted:
 * - form_started: once on mount
 * - step_viewed: when a question is displayed
 * - step_completed: when user advances past a question
 * - checkout_viewed: when checkout screen is displayed
 * - form_abandoned: on page leave (sendBeacon + visibilitychange for mobile)
 */
export function useFormAnalytics({
  posthog,
  entrySource,
  viewState,
  currentQuestion,
  questionId,
  totalQuestions,
}: UseFormAnalyticsOptions): UseFormAnalyticsResult {
  // eslint-disable-next-line react-hooks/purity -- Date.now() for timing is intentional
  const stepStartTime = useRef<number>(Date.now())
  // eslint-disable-next-line react-hooks/purity -- Date.now() for timing is intentional
  const formStartTime = useRef<number>(Date.now())
  const hasTrackedStart = useRef(false)
  const lastViewedStep = useRef<string | null>(null)
  const hasTrackedCheckout = useRef(false)

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

  // Track when a step is viewed
  const trackStepViewed = useCallback((stepIndex: number, stepId: string) => {
    const stepKey = `${stepIndex}-${stepId}`
    if (lastViewedStep.current === stepKey) return // don't double-fire
    lastViewedStep.current = stepKey

    const stepName = STEP_NAMES[stepId] || stepId
    posthog?.capture('step_viewed', {
      step: stepIndex + 1,
      step_name: stepName,
      step_id: stepId,
      total_steps: totalQuestions,
      time_since_start_seconds: Math.round((Date.now() - formStartTime.current) / 1000),
    })
    stepStartTime.current = Date.now()
  }, [posthog, totalQuestions])

  // Track when a step is completed (user advances)
  const trackStepCompleted = useCallback((stepIndex: number, stepId: string, skipped: boolean) => {
    const stepName = STEP_NAMES[stepId] || stepId
    const stepSeconds = Math.round((Date.now() - stepStartTime.current) / 1000)
    posthog?.capture('step_completed', {
      step: stepIndex + 1,
      step_name: stepName,
      step_id: stepId,
      skipped,
      time_on_step_seconds: stepSeconds,
      total_steps: totalQuestions,
    })
  }, [posthog, totalQuestions])

  // Track checkout_viewed when entering checkout
  useEffect(() => {
    if (viewState === 'checkout' && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true
      posthog?.capture('checkout_viewed', {
        time_since_start_seconds: Math.round((Date.now() - formStartTime.current) / 1000),
        steps_completed: totalQuestions,
      })
    }
    if (viewState !== 'checkout') {
      hasTrackedCheckout.current = false
    }
  }, [viewState, posthog, totalQuestions])

  // Abandonment tracking with sendBeacon for mobile reliability
  useEffect(() => {
    const captureAbandonment = () => {
      if (viewState !== 'questions' && viewState !== 'checkout') return

      const stepName = viewState === 'checkout' ? 'checkout' : STEP_NAMES[questionId || ''] || 'unknown'
      const timeSpent = Math.round((Date.now() - formStartTime.current) / 1000)
      const props = {
        last_step: currentQuestion + 1,
        step_name: stepName,
        view_state: viewState,
        time_spent_seconds: timeSpent,
        total_steps: totalQuestions,
      }

      // Use sendBeacon transport for reliability on mobile/tab close
      posthog?.capture('form_abandoned', { ...props, $set_once: {} }, { transport: 'sendBeacon' })
    }

    const handleBeforeUnload = () => captureAbandonment()

    // visibilitychange fires more reliably on mobile than beforeunload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        captureAbandonment()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [viewState, currentQuestion, questionId, posthog, totalQuestions])

  const resetStepTimer = useCallback(() => {
    stepStartTime.current = Date.now()
  }, [])

  return {
    stepStartTime,
    formStartTime,
    trackFormStart,
    trackStepViewed,
    trackStepCompleted,
    resetStepTimer,
  }
}
