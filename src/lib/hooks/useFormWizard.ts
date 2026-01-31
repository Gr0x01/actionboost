'use client'

import { useState, useCallback } from 'react'
import { ACKNOWLEDGMENT_DURATION_MS } from '@/lib/constants/form'

export interface Question {
  id: string
  question: string
  acknowledgment: string | null
  type: 'url' | 'textarea' | 'traction' | 'alternatives' | 'focus' | 'email' | 'competitors'
  optional?: boolean
}

interface UseFormWizardOptions {
  questions: Question[]
  onComplete?: () => void
  onStepCompleted?: (stepIndex: number, stepId: string, skipped: boolean) => void
}

interface UseFormWizardResult {
  currentQuestion: number
  setCurrentQuestion: (q: number) => void
  showAcknowledgment: boolean
  goToNext: (skipped?: boolean) => void
  goBack: () => void
  question: Question | undefined
  isComplete: boolean
}

/**
 * Hook to manage form wizard navigation and question flow.
 * Analytics are handled externally via onStepCompleted callback.
 */
export function useFormWizard({
  questions,
  onComplete,
  onStepCompleted,
}: UseFormWizardOptions): UseFormWizardResult {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showAcknowledgment, setShowAcknowledgment] = useState(false)

  const question = questions[currentQuestion]
  const isComplete = currentQuestion >= questions.length

  const goToNext = useCallback((skipped = false) => {
    const currentQ = questions[currentQuestion]
    const ack = currentQ?.acknowledgment

    // Notify analytics
    onStepCompleted?.(currentQuestion, currentQ?.id || '', skipped)

    if (ack) {
      setShowAcknowledgment(true)
      setTimeout(() => {
        setShowAcknowledgment(false)
        const nextQuestion = currentQuestion + 1
        setCurrentQuestion(nextQuestion)
        if (nextQuestion >= questions.length) {
          onComplete?.()
        }
      }, ACKNOWLEDGMENT_DURATION_MS)
    } else {
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      if (nextQuestion >= questions.length) {
        onComplete?.()
      }
    }
  }, [currentQuestion, questions, onComplete, onStepCompleted])

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
  }
}
