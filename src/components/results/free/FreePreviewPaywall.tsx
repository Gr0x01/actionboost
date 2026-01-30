'use client'

import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { config } from '@/lib/config'

interface FreePreviewPaywallProps {
  /** Free audit ID for upgrade checkout */
  freeAuditId: string
  /** Token for authentication */
  token: string
}

/**
 * FreePreviewPaywall - Conversion point after positioning + discovery
 *
 * Shows:
 * - Clear value proposition (what's in the full plan)
 * - CTA to unlock full strategy (goes straight to Stripe)
 *
 * Copy: "This is what you're here for."
 */
export function FreePreviewPaywall({
  freeAuditId,
  token,
}: FreePreviewPaywallProps) {
  const posthog = usePostHog()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUnlock = async () => {
    setIsLoading(true)
    setError(null)
    posthog?.capture('free_preview_paywall_clicked', { free_audit_id: freeAuditId })

    try {
      const res = await fetch('/api/checkout/upgrade-from-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeAuditId,
          token,
          posthogDistinctId: posthog?.get_distinct_id(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create checkout')
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      console.error('Upgrade checkout error:', err)
      setIsLoading(false)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="scroll-mt-32 pt-16 pb-20">
      {/* Top divider with fade */}
      <div className="relative h-px mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      </div>

      <div className="text-center max-w-xl mx-auto">
        {/* Section label */}
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block">
          Your Boost
        </span>

        {/* Headline */}
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mt-2 mb-3">
          This is what you&apos;re here for.
        </h2>

        {/* Subhead */}
        <p className="text-foreground/60 mb-10 text-base">
          Real research on your market. Clear priorities. Exactly what to do next.
        </p>

        {/* CTA Zone */}
        <div className="flex flex-col items-center">
          {/* CTA Button */}
          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="
              bg-cta text-white font-semibold
              px-8 py-4 rounded-md text-lg
              border-b-4 border-b-[#B85D10]
              hover:-translate-y-0.5 hover:shadow-lg
              active:translate-y-0.5 active:border-b-0
              transition-all duration-100
              disabled:opacity-60 disabled:cursor-not-allowed
              disabled:hover:translate-y-0 disabled:hover:shadow-none
            "
            style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
          >
            {isLoading ? 'Processing...' : `Get Your Boost · ${config.singlePrice}`}
          </button>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          )}

          {/* Guarantee */}
          <p className="text-sm text-foreground/50 mt-6">
            Didn&apos;t help? Full refund.
          </p>
        </div>
      </div>
    </section>
  )
}
