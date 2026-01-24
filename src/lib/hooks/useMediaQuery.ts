'use client'

import { useSyncExternalStore, useCallback } from 'react'

/**
 * Hook to track media query matches
 * SSR-safe: uses useSyncExternalStore for proper hydration
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', callback)
      return () => mediaQuery.removeEventListener('change', callback)
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = useCallback(() => {
    return false // Default to false on server
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
