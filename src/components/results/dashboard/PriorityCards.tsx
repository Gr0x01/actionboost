'use client'

import type { PriorityItem } from '@/lib/ai/formatter-types'
import { MarkdownContent } from '../MarkdownContent'

interface PriorityCardsProps {
  priorities: PriorityItem[]
}

/**
 * Priority #1 Hero - The "screenshot-worthy" moment
 * Giant offset rank number with editorial typography
 */
function PriorityHero({ priority }: { priority: PriorityItem }) {
  return (
    <div className="relative py-6 lg:py-8">
      {/* Giant rank number - offset background element */}
      <span className="absolute -left-2 lg:-left-6 -top-2 font-mono text-[100px] lg:text-[160px] font-black text-cta/10 leading-none select-none pointer-events-none">
        1
      </span>

      {/* Content positioned over */}
      <div className="relative">
        <h3 className="text-xl lg:text-2xl font-bold text-foreground max-w-2xl leading-tight">
          {priority.title}
        </h3>

        {priority.description && (
          <div className="mt-3 text-foreground/70 max-w-xl text-base leading-relaxed">
            <MarkdownContent
              content={priority.description}
              className="[&>p]:mb-0 [&>p:last-child]:mb-0"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-sm bg-cta/10 text-cta px-3 py-1.5 rounded-full font-semibold">
            ICE: {priority.iceScore}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Secondary priority cards - demoted visual treatment
 * 1px border, no shadow, muted
 */
function PrioritySecondary({ priority }: { priority: PriorityItem }) {
  return (
    <div className="border border-foreground/15 bg-background p-4 lg:p-5 rounded-lg hover:border-foreground/25 transition-colors">
      {/* Rank + Title inline */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 font-mono text-lg font-bold text-foreground/30">
          {priority.rank}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground leading-snug">
            {priority.title}
          </h4>
          {priority.description && (
            <p className="mt-1.5 text-sm text-foreground/60 line-clamp-2">
              {priority.description}
            </p>
          )}
        </div>
      </div>

      {/* ICE score - subtle footer */}
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
