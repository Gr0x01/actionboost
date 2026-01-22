'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PriorityItem } from '@/lib/ai/formatter-types'
import { MarkdownContent } from '../MarkdownContent'

interface PriorityCardsProps {
  priorities: PriorityItem[]
}

/**
 * ICE score visual bar
 */
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-foreground/50 w-4">{label}</span>
      <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-foreground/50 w-4 text-right">{score}</span>
    </div>
  )
}

/**
 * Individual priority card
 */
function PriorityCard({ priority, isTop }: { priority: PriorityItem; isTop: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`
        rounded-xl p-6 transition-all duration-150
        ${isTop
          ? 'border-[3px] border-cta bg-cta/5 shadow-[4px_4px_0_0_rgba(232,126,4,0.4)]'
          : 'border border-foreground/15 bg-background shadow-sm'
        }
      `}
    >
      {/* Header with ICE badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Rank badge */}
          <span className={`
            inline-block font-mono text-[10px] px-1.5 py-0.5 font-bold mb-2
            ${isTop ? 'bg-cta text-white' : 'bg-foreground/10 text-foreground/70'}
          `}>
            #{priority.rank}
          </span>
          <h3 className="font-bold text-foreground leading-tight">
            {priority.title}
          </h3>
        </div>

        {/* Large ICE score */}
        <div className={`
          font-mono text-2xl font-bold shrink-0
          ${isTop ? 'text-cta' : 'text-foreground/70'}
        `}>
          {priority.iceScore}
        </div>
      </div>

      {/* ICE breakdown bars */}
      <div className="space-y-1.5 mb-4">
        <ScoreBar label="I" score={priority.impact.score} color="bg-emerald-500" />
        <ScoreBar label="C" score={priority.confidence.score} color="bg-blue-500" />
        <ScoreBar label="E" score={priority.ease.score} color="bg-amber-500" />
      </div>

      {/* Expandable description */}
      {priority.description && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground/70 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Read more</span>
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-foreground/10">
              <div className="text-sm text-foreground/70 leading-relaxed">
                <MarkdownContent
                  content={priority.description}
                  extended
                  className="[&>p]:mb-2 [&>p:last-child]:mb-0"
                />
              </div>
            </div>
          )}
        </div>
      )}
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
      <div className="mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
          Top Priorities
        </h2>
        <p className="text-foreground/60 text-sm mt-1">
          Your highest-impact actions ranked by ICE score
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
