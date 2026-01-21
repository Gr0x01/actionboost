'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserContext, UserContextResponse } from '@/lib/types/context'
import type { FormInput } from '@/lib/types/form'

interface UseUserContextResult {
  context: UserContext | null
  isLoading: boolean
  hasContext: boolean
  lastUpdated: string | null
  suggestedQuestions: string[]
  prefillForm: () => FormInput | null
  refetch: (businessId?: string | null) => Promise<void>
}

/**
 * Hook to fetch user context for returning users
 * Used on /start page to show "Welcome back" panel and pre-fill form
 * Accepts optional businessId to fetch context for a specific business
 */
export function useUserContext(businessId?: string | null): UseUserContextResult {
  const [context, setContext] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])

  const fetchContext = useCallback(async (bizId?: string | null) => {
    setIsLoading(true)
    try {
      const url = bizId ? `/api/user/context?businessId=${bizId}` : '/api/user/context'
      const res = await fetch(url)

      if (!res.ok) {
        // User not authenticated or no context - that's fine
        setContext(null)
        setIsLoading(false)
        return
      }

      const data: UserContextResponse = await res.json()
      setContext(data.context)
      setLastUpdated(data.lastUpdated)
      setSuggestedQuestions(data.suggestedQuestions)
    } catch {
      // Silently fail - context is optional
      setContext(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContext(businessId)
  }, [businessId, fetchContext])

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

    // Build tacticsAndResults from new field or legacy fields
    let tacticsAndResults = ''
    if (context.tactics?.history && context.tactics.history.length > 0) {
      // New format: use the most recent history entry
      tacticsAndResults = context.tactics.history.slice(-1)[0] || ''
    } else if (context.tactics?.tried || context.tactics?.working) {
      // Legacy format: combine tried + working
      tacticsAndResults = [
        ...(context.tactics?.tried || []),
        ...(context.tactics?.working || []),
      ].join('. ') || ''
    }

    return {
      productDescription: context.product?.description || '',
      currentTraction: context.traction?.latest || '',
      tacticsAndResults,
      focusArea: 'acquisition', // User picks fresh each time
      competitors: [
        ...(context.product?.competitors || []),
        '', '', '',
      ].slice(0, 3),
      websiteUrl: context.product?.websiteUrl || '',
      analyticsSummary: '',
      constraints: context.constraints || '',
      attachments: [],
      email: '', // Will be collected in form flow
    }
  }

  return {
    context,
    isLoading,
    hasContext,
    lastUpdated,
    suggestedQuestions,
    prefillForm,
    refetch: fetchContext,
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
