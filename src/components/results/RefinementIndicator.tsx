'use client'

import { SlidersHorizontal, Check } from 'lucide-react'
import { MAX_FREE_REFINEMENTS } from '@/lib/types/database'

interface RefinementIndicatorProps {
  refinementsUsed: number
  isOwner: boolean
  onClick?: () => void
}

/**
 * RefinementIndicator - Compact nav element showing refinement status
 *
 * Displays slider icon + count badge:
 * - "2" or "1" when refinements available (amber)
 * - Checkmark when exhausted (muted)
 *
 * Clicking scrolls to the interstitial section
 */
export function RefinementIndicator({
  refinementsUsed,
  isOwner,
  onClick,
}: RefinementIndicatorProps) {
  const remaining = MAX_FREE_REFINEMENTS - refinementsUsed
  const isExhausted = remaining <= 0

  // Don't show for non-owners (share link viewers)
  if (!isOwner) return null

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default: scroll to interstitial
      const interstitial = document.getElementById('refinement-interstitial')
      if (interstitial) {
        interstitial.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isExhausted ? 'Refinements used' : `${remaining} refinement${remaining === 1 ? '' : 's'} remaining. Click to refine your plan.`}
      title={isExhausted ? 'Refinements used' : `${remaining} refinement${remaining === 1 ? '' : 's'} left`}
      className={`
        relative flex items-center gap-1.5
        px-2.5 py-1.5 rounded-md
        border-2 transition-all duration-100
        ${isExhausted
          ? 'border-foreground/10 text-foreground/40 hover:border-foreground/20'
          : 'border-amber-300/50 text-amber-700 hover:border-amber-400 hover:bg-amber-50/50'
        }
      `}
      style={{
        boxShadow: isExhausted
          ? 'none'
          : '2px 2px 0 rgba(217, 119, 6, 0.1)',
      }}
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />

      {isExhausted ? (
        <Check className="h-3 w-3" />
      ) : (
        <span className="text-xs font-semibold tabular-nums">
          {remaining}
        </span>
      )}
    </button>
  )
}
