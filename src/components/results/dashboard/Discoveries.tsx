'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Discovery } from '@/lib/ai/formatter-types'

interface DiscoveriesProps {
  discoveries: Discovery[]
}

/**
 * Single discovery card - Soft Brutalist style matching PriorityCards
 */
function DiscoveryCard({ discovery }: { discovery: Discovery }) {
  return (
    <div
      className="bg-background border border-foreground/15 rounded-md p-4 h-full flex flex-col"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
    >
      {/* Type badge - subtle, not color-coded */}
      <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">
        {discovery.type.replace(/_/g, ' ')}
      </span>

      {/* Title - bold headline */}
      <h3 className="text-base font-semibold text-foreground/90 mt-1 leading-snug">
        {discovery.title}
      </h3>

      {/* Content - the insight */}
      <p className="text-sm text-foreground/70 mt-2 leading-relaxed flex-1">
        {discovery.content}
      </p>

      {/* Footer - source and significance */}
      <div className="mt-3 pt-3 border-t border-foreground/10 text-sm">
        {discovery.source && (
          <cite className="block text-foreground/50 italic text-xs mb-1">
            {discovery.source}
          </cite>
        )}
        <p className="text-foreground/60 text-xs leading-relaxed">
          {discovery.significance}
        </p>
      </div>
    </div>
  )
}

/**
 * Discoveries - Novel insights that don't fit standard categories
 *
 * Layout:
 * - 2-column grid on desktop, single column on mobile
 * - Shows first 4, with "Show more" expander for the rest
 */
export function Discoveries({ discoveries }: DiscoveriesProps) {
  const [expanded, setExpanded] = useState(false)

  if (discoveries.length === 0) {
    return null
  }

  const INITIAL_COUNT = 4
  const hasMore = discoveries.length > INITIAL_COUNT
  const initialDiscoveries = discoveries.slice(0, INITIAL_COUNT)
  const additionalDiscoveries = discoveries.slice(INITIAL_COUNT)
  const hiddenCount = additionalDiscoveries.length

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
        KEY DISCOVERIES
      </span>

      {/* Discovery grid - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Always visible first 4 */}
        {initialDiscoveries.map((discovery, index) => (
          <DiscoveryCard key={index} discovery={discovery} />
        ))}

        {/* Additional discoveries - animated container */}
        {hasMore && (
          <div
            className={`col-span-full overflow-hidden transition-all duration-300 ease-out ${
              expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Inner grid with spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {additionalDiscoveries.map((discovery, index) => (
                <DiscoveryCard key={index + INITIAL_COUNT} discovery={discovery} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand/collapse trigger */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="w-full mt-6 py-3 flex items-center justify-center gap-3 text-foreground/50 hover:text-foreground/70 text-sm font-medium transition-colors group"
        >
          <span className="flex-1 h-px bg-foreground/10" />
          <span className="group-hover:underline">
            {expanded ? 'Show less' : `Show ${hiddenCount} more discoveries`}
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
