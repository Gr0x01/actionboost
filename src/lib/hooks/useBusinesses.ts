'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BusinessSummary } from '@/lib/types/context'

interface UseBusinessesResult {
  businesses: BusinessSummary[]
  isLoading: boolean
  hasBusinesses: boolean
  selectedBusinessId: string | null
  setSelectedBusinessId: (id: string | null) => void
  refreshBusinesses: () => Promise<void>
}

/**
 * Hook to fetch user's businesses for the business selector
 * Used on /start page to show business selection for returning users
 */
export function useBusinesses(): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)

  // Fetch businesses - pure fetch with no dependencies to avoid loops
  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/businesses')

      if (!res.ok) {
        // User not authenticated or no businesses - that's fine
        setBusinesses([])
        return
      }

      const data = await res.json()
      setBusinesses(data.businesses || [])
    } catch {
      // Silently fail - businesses are optional
      setBusinesses([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  // Auto-select most recent business when businesses load and none selected
  useEffect(() => {
    if (businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id)
    }
  }, [businesses, selectedBusinessId])

  const hasBusinesses = businesses.length > 0

  return {
    businesses,
    isLoading,
    hasBusinesses,
    selectedBusinessId,
    setSelectedBusinessId,
    refreshBusinesses: fetchBusinesses,
  }
}
