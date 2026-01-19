'use client'

import { useState, useEffect } from 'react'
import type { UserContext, UserContextResponse } from '@/lib/types/context'
import type { FormInput } from '@/lib/types/form'

interface UseUserContextResult {
  context: UserContext | null
  isLoading: boolean
  hasContext: boolean
  lastUpdated: string | null
  suggestedQuestions: string[]
  prefillForm: () => FormInput | null
}

/**
 * Hook to fetch user context for returning users
 * Used on /start page to show "Welcome back" panel and pre-fill form
 */
export function useUserContext(): UseUserContextResult {
  const [context, setContext] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])

  useEffect(() => {
    fetchContext()
  }, [])

  async function fetchContext() {
    try {
      const res = await fetch('/api/user/context')

      if (!res.ok) {
        // User not authenticated or no context - that's fine
        setIsLoading(false)
        return
      }

      const data: UserContextResponse = await res.json()
      setContext(data.context)
      setLastUpdated(data.lastUpdated)
      setSuggestedQuestions(data.suggestedQuestions)
    } catch {
      // Silently fail - context is optional
    } finally {
      setIsLoading(false)
    }
  }

  const hasContext = !!(
    context?.product?.description ||
    context?.traction?.latest ||
    (context?.totalRuns && context.totalRuns > 0)
  )

  /**
   * Convert user context to form pre-fill values
   */
  function prefillForm(): FormInput | null {
    if (!context || !hasContext) return null

    return {
      productDescription: context.product?.description || '',
      currentTraction: context.traction?.latest || '',
      triedTactics: context.tactics?.tried?.join('. ') || '',
      workingOrNot: [
        ...(context.tactics?.working || []),
        ...(context.tactics?.notWorking?.map((t) => `Not working: ${t}`) || []),
      ].join('. ') || '',
      focusArea: 'acquisition', // User picks fresh each time
      competitors: [
        ...(context.product?.competitors || []),
        '', '', '',
      ].slice(0, 3),
      websiteUrl: context.product?.websiteUrl || '',
      analyticsSummary: '',
      constraints: context.constraints || '',
      attachments: [],
    }
  }

  return {
    context,
    isLoading,
    hasContext,
    lastUpdated,
    suggestedQuestions,
    prefillForm,
  }
}

/**
 * Get a summary of context for display
 */
export function getContextSummaryText(context: UserContext): {
  productSummary: string
  lastTraction: string | null
  totalRuns: number
  lastRunDate: string | null
} {
  const lastSnapshot = context.traction?.history?.slice(-1)[0]

  // Truncate product description for display
  let productSummary = context.product?.description || 'Your product'
  if (productSummary.length > 80) {
    productSummary = productSummary.slice(0, 77) + '...'
  }

  return {
    productSummary,
    lastTraction: context.traction?.latest || null,
    totalRuns: context.totalRuns || 0,
    lastRunDate: lastSnapshot?.date || null,
  }
}
