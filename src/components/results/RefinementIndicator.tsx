'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { MAX_FREE_REFINEMENTS } from '@/lib/types/database'

interface RefinementIndicatorProps {
  refinementsUsed: number
  isOwner: boolean
  onClick?: () => void
}

/**
 * RefinementIndicator - Compact nav element showing refinement status
 *
 * Matches the export button styling (icon-only, subtle hover).
 * Shows count badge when refinements available.
 * Shows muted icon (no hover) when exhausted, with popup on click.
 */
export function RefinementIndicator({
  refinementsUsed,
  isOwner,
  onClick,
}: RefinementIndicatorProps) {
  const [showPopup, setShowPopup] = useState(false)
  const remaining = MAX_FREE_REFINEMENTS - refinementsUsed
  const isExhausted = remaining <= 0

  // Don't show for non-owners
  if (!isOwner) return null

  const handleClick = () => {
    if (isExhausted) {
      setShowPopup(true)
      return
    }

    if (onClick) {
      onClick()
    } else {
      // Scroll to interstitial and click it to expand
      const interstitial = document.getElementById('refinement-interstitial')
      if (interstitial) {
        interstitial.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Click after scroll animation
        setTimeout(() => {
          if (interstitial instanceof HTMLButtonElement) {
            interstitial.click()
          }
        }, 300)
      }
    }
  }

  // Exhausted state - muted icon, no hover, popup on click
  if (isExhausted) {
    return (
      <div className="relative">
        <button
          onClick={handleClick}
          aria-label="Refinements used"
          title="Refinements used"
          className="p-2 rounded-lg text-foreground/30 cursor-default"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        {/* Popup */}
        {showPopup && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50"
              onClick={() => setShowPopup(false)}
            />
            {/* Popup card */}
            <div
              className="absolute right-0 top-full mt-2 w-64 z-50 bg-background border-2 border-foreground/15 rounded-xl p-4"
              style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-foreground/60"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="font-semibold text-sm text-foreground mb-1">
                You&apos;re ready to go.
              </p>
              <p className="text-xs text-foreground/60">
                Both refinements used. Your strategy is solid — time to focus on doing instead of planning.
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`${remaining} refinement${remaining === 1 ? '' : 's'} remaining. Click to refine your plan.`}
      title={`Refine plan (${remaining} left)`}
      className="
        relative p-2 rounded-lg
        text-foreground/50
        hover:text-foreground
        hover:bg-foreground/5
        transition-colors duration-100
      "
    >
      <SlidersHorizontal className="h-4 w-4" />

      {/* Count badge */}
      <span className="
        absolute -top-1 -right-1
        min-w-[18px] h-[18px]
        flex items-center justify-center
        text-[10px] font-bold
        bg-foreground text-background
        rounded-full
      ">
        {remaining}
      </span>
    </button>
  )
}
