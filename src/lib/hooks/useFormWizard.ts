'use client'

import { useState, useCallback, useRef } from 'react'
import type { PostHog } from 'posthog-js'
import { STEP_NAMES, ACKNOWLEDGMENT_DURATION_MS } from '@/lib/constants/form'

export interface Question {
  id: string
  question: string
  acknowledgment: string | null
  type: 'url' | 'textarea' | 'traction' | 'focus' | 'email' | 'upload' | 'competitors'
  optional?: boolean
}

interface UseFormWizardOptions {
  questions: Question[]
  posthog?: PostHog | null
  onComplete?: () => void
  stepStartTimeRef?: React.MutableRefObject<number>
}

interface UseFormWizardResult {
  currentQuestion: number
  setCurrentQuestion: (q: number) => void
  showAcknowledgment: boolean
  goToNext: (skipped?: boolean) => void
  goBack: () => void
  question: Question | undefined
  isComplete: boolean
  stepNames: Record<string, string>
}

/**
 * Hook to manage form wizard navigation and question flow
 */
export function useFormWizard({
  questions,
  posthog,
  onComplete,
  stepStartTimeRef,
}: UseFormWizardOptions): UseFormWizardResult {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showAcknowledgment, setShowAcknowledgment] = useState(false)

  // Internal step timer if not provided externally
  // eslint-disable-next-line react-hooks/purity -- Date.now() for timing is intentional
  const internalStepStartTime = useRef<number>(Date.now())
  const stepStartTime = stepStartTimeRef || internalStepStartTime

  const question = questions[currentQuestion]
  const isComplete = currentQuestion >= questions.length

  const goToNext = useCallback((skipped = false) => {
    const currentQ = questions[currentQuestion]
    const stepName = STEP_NAMES[currentQ?.id || ''] || 'unknown'
    const stepSeconds = Math.round((Date.now() - stepStartTime.current) / 1000)
    const ack = currentQ?.acknowledgment

    // Track step completion with distinct event name
    posthog?.capture(`form_step_${stepName}`, {
      step: currentQuestion + 1,
      step_name: stepName,
      skipped,
    })

    // Track time spent on step
    posthog?.capture('form_step_time', {
      step: currentQuestion + 1,
      step_name: stepName,
      seconds: stepSeconds,
    })

    // Track skip separately if applicable
    if (skipped) {
      posthog?.capture('form_step_skipped', {
        step: currentQuestion + 1,
        step_name: stepName,
      })
    }

    // Reset step timer for next question
    // eslint-disable-next-line react-hooks/immutability -- intentional ref update
    stepStartTime.current = Date.now()

    if (ack) {
      setShowAcknowledgment(true)
      setTimeout(() => {
        setShowAcknowledgment(false)
        const nextQuestion = currentQuestion + 1
        setCurrentQuestion(nextQuestion)
        // If we've finished all questions, trigger completion
        if (nextQuestion >= questions.length) {
          posthog?.capture('form_step_checkout', { step: 9, step_name: 'checkout' })
          onComplete?.()
        }
      }, ACKNOWLEDGMENT_DURATION_MS)
    } else {
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      // If we've finished all questions, trigger completion
      if (nextQuestion >= questions.length) {
        posthog?.capture('form_step_checkout', { step: 9, step_name: 'checkout' })
        onComplete?.()
      }
    }
  }, [currentQuestion, questions, posthog, onComplete, stepStartTime])

  const goBack = useCallback(() => {
    setCurrentQuestion((c) => (c > 0 ? c - 1 : c))
  }, [])

  return {
    currentQuestion,
    setCurrentQuestion,
    showAcknowledgment,
    goToNext,
    goBack,
    question,
    isComplete,
    stepNames: STEP_NAMES,
  }
}
