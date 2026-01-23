'use client'

import type { PriorityItem } from '@/lib/ai/formatter-types'
import { MarkdownContent } from '../MarkdownContent'

interface PriorityCardsProps {
  priorities: PriorityItem[]
}

/**
 * Priority #1 Hero - Elevated card with overlapping rank badge
 * Soft Brutalist: offset shadow, visible border, bold badge
 */
function PriorityHero({ priority }: { priority: PriorityItem }) {
  return (
    <div
      className="relative border-2 border-foreground/20 bg-background p-5 lg:p-6 rounded-md max-w-xl mx-auto"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
    >
      {/* Rank badge - overlapping top-left */}
      <div
        className="absolute -top-3 -left-1 bg-cta text-white font-mono text-sm font-bold px-3 py-1 rounded-md"
        style={{ boxShadow: '2px 2px 0 rgba(44, 62, 80, 0.15)' }}
      >
        #1
      </div>

      {/* Title */}
      <h3 className="text-lg lg:text-xl font-bold text-foreground leading-snug mt-1">
        {priority.title}
      </h3>

      {/* Description */}
      {priority.description && (
        <div className="mt-3 text-foreground/70 text-sm lg:text-base leading-relaxed">
          <MarkdownContent
            content={priority.description}
            className="[&>p]:mb-0 [&>p:last-child]:mb-0"
          />
        </div>
      )}

      {/* ICE score - footer pattern matching secondary */}
      <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
          ICE
        </span>
        <span className="font-mono text-sm font-semibold text-cta">
          {priority.iceScore}
        </span>
      </div>
    </div>
  )
}

/**
 * Secondary priority cards - muted version of hero card
 * Same structure, lighter visual weight
 */
function PrioritySecondary({ priority }: { priority: PriorityItem }) {
  return (
    <div className="relative border border-foreground/15 bg-background p-4 lg:p-5 rounded-md hover:border-foreground/25 transition-colors">
      {/* Rank badge - muted version, solid bg */}
      <div className="absolute -top-2.5 -left-1 bg-surface text-foreground/50 font-mono text-xs font-semibold px-2 py-0.5 rounded border border-foreground/10">
        #{priority.rank}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-foreground leading-snug mt-1">
        {priority.title}
      </h4>

      {/* Description */}
      {priority.description && (
        <p className="mt-2 text-sm text-foreground/60 line-clamp-2">
          {priority.description}
        </p>
      )}

      {/* ICE score - footer */}
      <div className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
          ICE
        </span>
        <span className="font-mono text-sm font-semibold text-foreground/50">
          {priority.iceScore}
        </span>
      </div>
    </div>
  )
}

export function PriorityCards({ priorities }: PriorityCardsProps) {
  const topPriorities = priorities.slice(0, 3)

  if (topPriorities.length === 0) {
    return null
  }

  const [first, ...rest] = topPriorities

  return (
    <section className="scroll-mt-32">
      {/* Whisper-quiet section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
        TOP PRIORITIES
      </span>

      {/* Priority #1 as hero */}
      <PriorityHero priority={first} />

      {/* Priorities #2-3 in compact row */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {rest.map((priority) => (
            <PrioritySecondary key={priority.rank} priority={priority} />
          ))}
        </div>
      )}
    </section>
  )
}
