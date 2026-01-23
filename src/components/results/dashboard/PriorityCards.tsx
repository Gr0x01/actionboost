'use client'

import type { PriorityItem } from '@/lib/ai/formatter-types'
import { MarkdownContent } from '../MarkdownContent'

interface PriorityCardsProps {
  priorities: PriorityItem[]
}

/**
 * Convert ICE score to plain-language priority label
 */
function getPriorityLabel(iceScore: number): { label: string; className: string } {
  if (iceScore >= 80) {
    return { label: 'Quick win', className: 'bg-emerald-50 text-emerald-700' }
  } else if (iceScore >= 60) {
    return { label: 'High impact', className: 'bg-cta/10 text-cta' }
  } else if (iceScore >= 40) {
    return { label: 'Worth the effort', className: 'bg-blue-50 text-blue-700' }
  } else {
    return { label: 'Longer-term play', className: 'bg-foreground/[0.06] text-foreground/60' }
  }
}

/**
 * Priority #1 Hero - The "screenshot-worthy" moment
 * Bold rank number with confident typography
 */
function PriorityHero({ priority }: { priority: PriorityItem }) {
  const priorityLabel = getPriorityLabel(priority.iceScore)

  return (
    <div className="relative py-6 lg:py-8 pl-12 lg:pl-16">
      {/* Bold rank number - confident presence */}
      <span className="absolute left-0 top-6 lg:top-8 text-[56px] lg:text-[72px] font-black text-cta/15 leading-none select-none pointer-events-none">
        1
      </span>

      {/* Content positioned over */}
      <div className="relative">
        <h3 className="text-xl lg:text-2xl font-bold text-foreground max-w-2xl leading-tight font-serif">
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
          <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${priorityLabel.className}`}>
            {priorityLabel.label}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Secondary priority cards - confident but secondary
 * Solid borders, hover lift
 */
function PrioritySecondary({ priority }: { priority: PriorityItem }) {
  const priorityLabel = getPriorityLabel(priority.iceScore)

  return (
    <div
      className="bg-white rounded-xl p-5 border border-foreground/10 hover:border-foreground/20 hover:-translate-y-0.5 transition-all"
      style={{
        boxShadow: '0 2px 8px rgba(44, 62, 80, 0.06)',
      }}
    >
      {/* Rank + Title inline */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-foreground/[0.08] flex items-center justify-center text-sm font-bold text-foreground/50">
          {priority.rank}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground leading-snug">
            {priority.title}
          </h4>
          {priority.description && (
            <p className="mt-1.5 text-sm text-foreground/60 line-clamp-2">
              {priority.description}
            </p>
          )}
        </div>
      </div>

      {/* Priority label - plain language */}
      <div className="mt-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${priorityLabel.className}`}>
          {priorityLabel.label}
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
      {/* Confident section label */}
      <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block mb-6">
        Start here
      </span>

      {/* Priority #1 as hero */}
      <PriorityHero priority={first} />

      {/* Priorities #2-3 in compact row */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {rest.map((priority) => (
            <PrioritySecondary key={priority.rank} priority={priority} />
          ))}
        </div>
      )}
    </section>
  )
}
