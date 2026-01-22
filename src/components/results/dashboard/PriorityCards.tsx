'use client'

import type { PriorityItem } from '@/lib/ai/formatter-types'
import { MarkdownContent } from '../MarkdownContent'

interface PriorityCardsProps {
  priorities: PriorityItem[]
}

/**
 * Individual priority card - Brutalist design with clear visual hierarchy
 * Structure: Rank (hero) -> Title -> Description -> Score (footer)
 */
function PriorityCard({ priority, isTop }: { priority: PriorityItem; isTop: boolean }) {
  return (
    <div
      className={`
        flex flex-col h-full transition-all duration-150 rounded-xl overflow-hidden
        ${isTop
          ? 'border-[3px] border-cta bg-gradient-to-br from-cta/8 via-cta/4 to-transparent shadow-[6px_6px_0_0_rgba(232,126,4,0.5)]'
          : 'border-2 border-foreground/20 bg-background shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]'
        }
      `}
    >
      {/* Top section: Rank + Title */}
      <div className="p-5 pb-4">
        {/* Rank as hero element */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`
              flex-shrink-0 w-12 h-12 flex items-center justify-center font-mono text-2xl font-black rounded-lg
              ${isTop
                ? 'bg-cta text-white shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.2)]'
                : 'bg-foreground/10 text-foreground/60'
              }
            `}
          >
            {priority.rank}
          </div>

          {/* Title */}
          <h3 className={`
            flex-1 font-bold leading-tight pt-1
            ${isTop ? 'text-foreground text-lg' : 'text-foreground/90'}
          `}>
            {priority.title}
          </h3>
        </div>

        {/* Description - always visible, this is the WHY */}
        {priority.description && (
          <div className={`
            text-sm leading-relaxed pl-16
            ${isTop ? 'text-foreground/70' : 'text-foreground/60'}
          `}>
            <MarkdownContent
              content={priority.description}
              className="[&>p]:mb-0 [&>p:last-child]:mb-0"
            />
          </div>
        )}
      </div>

      {/* Footer: ICE Score */}
      <div className={`
        mt-auto px-5 py-3 border-t flex items-center justify-between
        ${isTop ? 'border-cta/30 bg-cta/5' : 'border-foreground/10 bg-foreground/[0.02]'}
      `}>
        <span className="text-xs font-mono uppercase tracking-wider text-foreground/40">
          ICE Score
        </span>
        <span className={`
          font-mono text-lg font-bold
          ${isTop ? 'text-cta' : 'text-foreground/50'}
        `}>
          {priority.iceScore}
        </span>
      </div>
    </div>
  )
}

export function PriorityCards({ priorities }: PriorityCardsProps) {
  // Only show top 3
  const topPriorities = priorities.slice(0, 3)

  if (topPriorities.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      <div className="mb-5">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
          Top Priorities
        </h2>
        <p className="text-foreground/60 text-sm mt-1">
          Your highest-impact actions ranked by ICE score
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {topPriorities.map((priority, index) => (
          <PriorityCard
            key={priority.rank}
            priority={priority}
            isTop={index === 0}
          />
        ))}
      </div>
    </section>
  )
}
