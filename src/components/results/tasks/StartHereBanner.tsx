'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { DayAction } from '@/lib/ai/formatter-types'

/**
 * Format time estimate in friendly way
 */
function formatTime(timeEstimate: string): string {
  const lower = timeEstimate.toLowerCase()
  if (lower.includes('hr') || lower.includes('hour') || lower.includes('min')) {
    return `About ${timeEstimate}`
  }
  const hourMatch = lower.match(/^(\d+)h$/)
  if (hourMatch) {
    const hours = parseInt(hourMatch[1])
    return `About ${hours} hour${hours === 1 ? '' : 's'}`
  }
  return `About ${timeEstimate}`
}

export interface StartHereBannerProps {
  task: DayAction
  onComplete: () => void
  onSkip: () => void
}

/**
 * StartHereBanner - The hero "focus now" component (Soft Brutalist style)
 */
export function StartHereBanner({ task, onComplete, onSkip }: StartHereBannerProps) {
  const [isChecked, setIsChecked] = useState(false)

  const handleComplete = () => {
    setIsChecked(true)
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative bg-white border-2 border-foreground rounded-md"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
      >
        {/* Badge on border */}
        <span className="absolute -top-3 left-4 bg-foreground text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide">
          Start here
        </span>

        {/* Time in top right */}
        <span className="absolute -top-3 right-4 font-mono text-xs text-foreground/60 bg-white border border-foreground/20 px-2 py-1 rounded-sm">
          {formatTime(task.timeEstimate)}
        </span>

        {/* Content with checkbox */}
        <div className="flex items-start gap-4 px-5 pt-6 pb-5">
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            disabled={isChecked}
            className={`
              w-7 h-7 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5
              transition-all duration-150
              ${isChecked
                ? 'border-cta bg-cta'
                : 'border-foreground bg-white hover:bg-foreground/5 active:scale-95'
              }
            `}
            aria-label="Mark as complete"
          >
            {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground leading-snug">
              {task.action}
            </h3>
            <p className="text-base text-foreground/70 mt-2">
              {task.successMetric}
            </p>
          </div>
        </div>

        {/* Skip link */}
        <div className="px-5 py-3 border-t border-foreground/10">
          <button
            onClick={onSkip}
            className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            Not right now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
