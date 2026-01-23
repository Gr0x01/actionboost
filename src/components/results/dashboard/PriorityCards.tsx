'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PriorityItem } from '@/lib/ai/formatter-types'
import { MarkdownContent } from '../MarkdownContent'

interface PriorityCardsProps {
  priorities: PriorityItem[]
}

/**
 * Single priority card - Soft Brutalist style
 * All cards equal width, #1 distinguished by styling
 */
function PriorityCard({
  priority,
  isPrimary,
  isMuted = false,
}: {
  priority: PriorityItem
  isPrimary: boolean
  isMuted?: boolean
}) {
  return (
    <div
      className={`relative rounded-md h-full flex flex-col ${
        isPrimary
          ? 'bg-background border-2 border-foreground/25 p-5'
          : isMuted
            ? 'bg-surface border border-foreground/10 p-4'
            : 'bg-background border border-foreground/15 p-4'
      }`}
      style={isPrimary ? { boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' } : undefined}
    >
      {/* Rank badge */}
      <div
        className={`absolute -top-3 -left-1 font-mono font-bold px-3 py-1 rounded-md ${
          isPrimary
            ? 'bg-cta text-white text-sm'
            : 'bg-surface text-foreground/50 text-xs border border-foreground/10'
        }`}
        style={isPrimary ? { boxShadow: '2px 2px 0 rgba(44, 62, 80, 0.15)' } : undefined}
      >
        #{priority.rank}
      </div>

      {/* Title */}
      <h3
        className={`leading-snug mt-1 ${
          isPrimary
            ? 'text-lg font-bold text-foreground'
            : 'text-base font-semibold text-foreground/90'
        }`}
      >
        {priority.title}
      </h3>

      {/* Description */}
      {priority.description && (
        <div
          className={`mt-3 leading-relaxed flex-1 ${
            isPrimary
              ? 'text-foreground/70 text-sm'
              : 'text-foreground/60 text-sm line-clamp-2'
          }`}
        >
          <MarkdownContent
            content={priority.description}
            className="[&>p]:mb-0 [&>p:last-child]:mb-0"
          />
        </div>
      )}

      {/* ICE score footer - pushed to bottom */}
      <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
          ICE
        </span>
        <span
          className={`font-mono text-sm font-semibold ${
            isPrimary ? 'text-cta' : 'text-foreground/50'
          }`}
        >
          {priority.iceScore}
        </span>
      </div>
    </div>
  )
}

/**
 * PriorityCards - Equal-width grid with progressive disclosure
 *
 * Layout:
 * - All cards equal 1/3 width (3-column grid)
 * - #1 distinguished by styling (border, shadow, colors)
 * - Shows first 3, with "Show more" expander for the rest
 */
export function PriorityCards({ priorities }: PriorityCardsProps) {
  const [expanded, setExpanded] = useState(false)

  if (priorities.length === 0) {
    return null
  }

  const INITIAL_COUNT = 3
  const hasMore = priorities.length > INITIAL_COUNT
  const initialPriorities = priorities.slice(0, INITIAL_COUNT)
  const additionalPriorities = priorities.slice(INITIAL_COUNT)
  const hiddenCount = additionalPriorities.length

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
        KEY PRIORITIES
      </span>

      {/* Priority grid - all equal width */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Always visible first 3 */}
        {initialPriorities.map((priority, index) => (
          <div key={priority.rank}>
            <PriorityCard priority={priority} isPrimary={index === 0} />
          </div>
        ))}

        {/* Additional priorities - animated container */}
        {hasMore && (
          <div
            className={`col-span-full overflow-hidden transition-all duration-300 ease-out ${
              expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Inner grid with padding for badge overflow (top + left) - mt-4 matches gap-4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-3 pl-1">
              {additionalPriorities.map((priority) => (
                <div key={priority.rank}>
                  <PriorityCard priority={priority} isPrimary={false} isMuted />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand/collapse trigger */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-6 py-3 flex items-center justify-center gap-3 text-foreground/50 hover:text-foreground/70 text-sm font-medium transition-colors group"
        >
          <span className="flex-1 h-px bg-foreground/10" />
          <span className="group-hover:underline">
            {expanded ? 'Show less' : `Show ${hiddenCount} more priorities`}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span className="flex-1 h-px bg-foreground/10" />
        </button>
      )}
    </section>
  )
}
