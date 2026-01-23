'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

/**
 * CreditBadge - Shows remaining credits in header
 *
 * Fetches from /api/user/credits on mount
 * Links to /dashboard (user's latest plan)
 * Only shows if user has credits > 0
 */
export function CreditBadge() {
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/user/credits')
        if (!res.ok) return

        const data = await res.json()
        setCredits(data.credits ?? 0)
      } catch {
        // Silently fail - badge just won't show
      }
    }

    fetchCredits()
  }, [])

  // Don't show if no credits or still loading
  if (credits === null || credits === 0) return null

  return (
    <Link
      href="/dashboard"
      className="
        flex items-center justify-center gap-1.5
        h-8 px-3
        rounded-full
        bg-foreground/[0.04]
        border border-foreground/10
        text-xs font-bold text-foreground/60
        hover:bg-foreground/[0.08]
        hover:border-foreground/20
        hover:-translate-y-0.5
        transition-all duration-100
      "
      title={`${credits} credit${credits === 1 ? '' : 's'} remaining`}
    >
      <Zap className="w-3 h-3" />
      {credits}
    </Link>
  )
}
