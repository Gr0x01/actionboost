'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'


interface FreeTasksEmptyStateProps {
  freeAuditId: string
  token: string
}

/**
 * FreeTasksEmptyState - A single interactive task card
 *
 * Mirrors the real StartHereBanner pattern but the task IS the upgrade.
 * Clicking the checkbox reveals a $9 off coupon code.
 */
export function FreeTasksEmptyState({ freeAuditId, token }: FreeTasksEmptyStateProps) {
  const posthog = usePostHog()
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheck = () => {
    setIsChecked(true)
    posthog?.capture('free_tasks_checkbox_clicked', { free_audit_id: freeAuditId })
  }

  const handleUnlock = async () => {
    setIsLoading(true)
    posthog?.capture('free_tasks_coupon_cta_clicked', { free_audit_id: freeAuditId })

    try {
      const res = await fetch('/api/checkout/upgrade-from-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeAuditId,
          token,
          posthogDistinctId: posthog?.get_distinct_id(),
          coupon: 'REVEAL9',
        }),
      })

      if (!res.ok) throw new Error('Failed to create checkout')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cta rounded-full transition-all duration-500"
            style={{ width: isChecked ? '100%' : '0%' }}
          />
        </div>
        <p className="text-sm text-foreground/50 mt-3">
          <span className="font-semibold">{isChecked ? '1' : '0'} of 1</span> task
        </p>
      </div>

      {/* The task card — mirrors real StartHereBanner */}
      <div
        className="relative bg-white border-2 border-foreground rounded-md"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
      >
        {/* Badge */}
        <span className="absolute -top-3 left-4 bg-foreground text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide">
          Start here
        </span>

        {/* Time badge */}
        <span className="absolute -top-3 right-4 font-mono text-xs text-foreground/60 bg-white border border-foreground/20 px-2 py-1 rounded-sm">
          About 2 min
        </span>

        {/* Content with checkbox */}
        <div className="flex items-start gap-4 px-5 pt-6 pb-5">
          <button
            onClick={handleCheck}
            disabled={isChecked}
            className={`
              w-7 h-7 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5
              transition-all duration-150
              ${isChecked
                ? 'border-cta bg-cta'
                : 'border-foreground bg-white hover:bg-foreground/5 active:scale-95 cursor-pointer'
              }
            `}
            aria-label="Mark as complete"
          >
            {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold leading-snug transition-colors duration-200 ${isChecked ? 'text-foreground/40 line-through' : 'text-foreground'}`}>
              Get your full Boost
            </h3>
            <p className={`text-base mt-2 transition-colors duration-200 ${isChecked ? 'text-foreground/30' : 'text-foreground/70'}`}>
              Priorities, competitor data, tasks, and metrics. Built from real research on your market.
            </p>
          </div>
        </div>

        {/* Bottom area */}
        {!isChecked && (
          <div className="px-5 py-3 border-t border-foreground/10">
            <span className="text-sm text-foreground/40">
              Click the checkbox to start
            </span>
          </div>
        )}
      </div>

      {/* Coupon reveal — separate card below */}
      {isChecked && (
        <div
          className="mt-6 bg-white border-2 border-cta/40 rounded-md text-center px-6 py-8"
          style={{ boxShadow: '4px 4px 0 rgba(212, 116, 12, 0.15)' }}
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta block mb-2">
            Task complete
          </span>
          <p className="text-xl font-bold text-foreground tracking-tight mb-1">
            Here&apos;s $9 off for checking the box.
          </p>
          <p className="text-sm text-foreground/50 mb-6">
            Use code <span className="font-mono font-semibold text-foreground/70">REVEAL9</span> at checkout.
          </p>
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
            {isLoading ? 'Processing...' : 'Get Your Boost · $20'}
          </button>
        </div>
      )}
    </div>
  )
}
