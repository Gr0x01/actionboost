'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { config } from '@/lib/config'

interface FreePreviewPaywallProps {
  /** Free audit ID for upgrade checkout */
  freeAuditId: string
  /** Token for authentication */
  token: string
  /** Optional preview of what's locked (priority titles) */
  previewPriorities?: Array<{ title: string; rank: number }>
}

/**
 * FreePreviewPaywall - Conversion point after positioning + discovery
 *
 * Shows:
 * - Blurred preview of locked priority cards
 * - Clear value proposition
 * - CTA to unlock full strategy (goes straight to Stripe)
 *
 * Copy: "Now you know the problem. Here's the plan."
 */
export function FreePreviewPaywall({
  freeAuditId,
  token,
  previewPriorities,
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
    <section className="scroll-mt-32 py-12">
      {/* Top divider with fade */}
      <div className="relative h-px mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto text-center">
        {/* Section label */}
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block">
          Full Strategy
        </span>

        {/* Headline */}
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mt-2 mb-3">
          Now you know the problem. Here&apos;s the plan.
        </h2>

        {/* Subhead */}
        <p className="text-foreground/60 mb-8 text-base">
          Your full 30-day marketing strategy with prioritized actions, competitor intel, and weekly
          tasks.
        </p>

        {/* Blurred preview strip */}
        <div className="relative overflow-hidden rounded-lg mb-8">
          {/* Blur overlay */}
          <div className="absolute inset-0 backdrop-blur-[8px] bg-surface/50 z-10" />

          {/* Preview cards underneath */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
            {[1, 2, 3].map((rank) => {
              const preview = previewPriorities?.[rank - 1]
              return (
                <div
                  key={rank}
                  className="bg-background border border-foreground/15 rounded-md p-4"
                >
                  {/* Rank badge */}
                  <div className="w-8 h-5 bg-foreground/20 rounded mb-3" />
                  {/* Title (real or placeholder) */}
                  <div
                    className="h-5 bg-foreground/15 rounded mb-2"
                    style={{ width: preview ? '85%' : '80%' }}
                  />
                  {/* Description lines */}
                  <div className="space-y-1.5">
                    <div className="h-3 bg-foreground/10 rounded w-full" />
                    <div className="h-3 bg-foreground/10 rounded w-3/4" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Lock icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-white rounded-full p-3 shadow-md border border-foreground/10">
              <Lock className="w-5 h-5 text-foreground/40" />
            </div>
          </div>
        </div>

        {/* Value bullets */}
        <ul className="text-left text-foreground/70 text-sm space-y-2 mb-8 max-w-md mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-cta mt-0.5">-</span>
            <span>Priority actions ranked by impact (not just ideas, a sequence)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cta mt-0.5">-</span>
            <span>Your competitors&apos; traffic sources and what&apos;s working for them</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cta mt-0.5">-</span>
            <span>Day-by-day tasks for your first week</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cta mt-0.5">-</span>
            <span>Metrics to track so you know it&apos;s working</span>
          </li>
        </ul>

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
          {isLoading ? 'Processing...' : `Get my 30-day plan · ${config.singlePrice}`}
        </button>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}

        {/* Guarantee */}
        <p className="text-sm text-foreground/50 mt-5">
          Money back if it doesn&apos;t help. No questions.
        </p>
      </div>
    </section>
  )
}
