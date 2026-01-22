'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { PostHog } from 'posthog-js'
import type { FormInput } from '@/lib/types/form'

const PREFILL_KEY = 'actionboost-prefill'
const HERO_PREFILL_KEY = 'actionboost-hero-prefill'
const PREFILL_TTL = 5 * 60 * 1000 // 5 minutes
const HERO_PREFILL_TTL = 10 * 60 * 1000 // 10 minutes

export interface PrefillMetadata {
  title: string | null
  description: string | null
  favicon: string | null
  siteName: string | null
}

export interface PrefillResult {
  formUpdates: Partial<FormInput>
  startQuestion: number
  type: 'hero' | 'url'
}

interface UseFormPrefillOptions {
  posthog?: PostHog | null
  isActive: boolean // Only run prefill when this is true (e.g., viewState === 'questions')
  onPrefillApplied?: (result: PrefillResult) => void
}

interface UseFormPrefillResult {
  prefillMetadata: PrefillMetadata | null
  clearPrefillMetadata: () => void
}

/**
 * Hook to handle form prefill from homepage (hero textarea or URL input)
 */
export function useFormPrefill({
  posthog,
  isActive,
  onPrefillApplied,
}: UseFormPrefillOptions): UseFormPrefillResult {
  const [prefillMetadata, setPrefillMetadata] = useState<PrefillMetadata | null>(null)
  const prefillApplied = useRef(false)

  useEffect(() => {
    if (prefillApplied.current) return
    if (!isActive) return

    // Check for hero description prefill first (new landing page)
    const heroPrefillRaw = localStorage.getItem(HERO_PREFILL_KEY)
    if (heroPrefillRaw) {
      try {
        const heroPrefill = JSON.parse(heroPrefillRaw)

        // Check TTL
        if (Date.now() - heroPrefill.timestamp > HERO_PREFILL_TTL) {
          localStorage.removeItem(HERO_PREFILL_KEY)
        } else {
          // Clear prefill to prevent re-application
          localStorage.removeItem(HERO_PREFILL_KEY)
          prefillApplied.current = true

          posthog?.capture('form_prefilled_from_hero', {
            type: 'product_description',
            char_count: heroPrefill.productDescription?.length || 0,
          })

          onPrefillApplied?.({
            formUpdates: {
              productDescription: heroPrefill.productDescription || '',
            },
            startQuestion: 0, // Start at URL question so we can collect website
            type: 'hero',
          })
          return
        }
      } catch {
        localStorage.removeItem(HERO_PREFILL_KEY)
      }
    }

    // Check for URL prefill (footer CTA or legacy)
    const prefillRaw = localStorage.getItem(PREFILL_KEY)
    if (!prefillRaw) return

    try {
      const prefill = JSON.parse(prefillRaw)

      // Check TTL
      if (Date.now() - prefill.timestamp > PREFILL_TTL) {
        localStorage.removeItem(PREFILL_KEY)
        return
      }

      // Clear prefill to prevent re-application
      localStorage.removeItem(PREFILL_KEY)
      prefillApplied.current = true

      // Store metadata for context banner
      if (prefill.metadata) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initialization from localStorage
        setPrefillMetadata(prefill.metadata)
      }

      // Build description from metadata
      let description = ''
      if (prefill.metadata?.title) {
        description = prefill.metadata.title
      }
      if (prefill.metadata?.description) {
        description += description ? ' - ' : ''
        description += prefill.metadata.description
      }

      posthog?.capture('form_prefilled_from_hero', {
        type: 'url_metadata',
        has_title: !!prefill.metadata?.title,
        has_description: !!prefill.metadata?.description,
        url_domain: prefill.websiteUrl ? new URL(prefill.websiteUrl).hostname : null,
      })

      onPrefillApplied?.({
        formUpdates: {
          websiteUrl: prefill.websiteUrl || '',
          productDescription: description || '',
        },
        startQuestion: 1, // Skip URL step, go to product description
        type: 'url',
      })
    } catch {
      localStorage.removeItem(PREFILL_KEY)
    }
  }, [isActive, posthog, onPrefillApplied])

  const clearPrefillMetadata = useCallback(() => {
    setPrefillMetadata(null)
  }, [])

  return {
    prefillMetadata,
    clearPrefillMetadata,
  }
}
