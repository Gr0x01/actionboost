'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Discovery } from '@/lib/ai/formatter-types'

interface LeadDiscoveryProps {
  discovery: Discovery
}

/**
 * LeadDiscovery - Hero treatment for the #1 discovery
 *
 * Full-width card with larger typography and visual prominence.
 * Positioned at #2 in the insights flow, right after Positioning.
 * Soft Brutalist styling with stronger presence than regular cards.
 */
export function LeadDiscovery({ discovery }: LeadDiscoveryProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = `${discovery.title}\n\n${discovery.content}\n\n— ${discovery.source || 'Research finding'}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-4">
        Key Discovery
      </span>

      {/* Hero card - full width, stronger presence */}
      <div
        className="bg-background border-2 border-foreground/20 rounded-md p-6 md:p-8 md:relative"
        style={{ boxShadow: '6px 6px 0 rgba(44, 62, 80, 0.12)' }}
      >
        {/* Type badge - above title on mobile, top-right on desktop */}
        <span className="inline-block md:absolute md:top-4 md:right-4 font-mono text-[10px] uppercase tracking-wider text-foreground/50 bg-foreground/5 px-2 py-1 rounded mb-3 md:mb-0">
          {discovery.type.replace(/_/g, ' ')}
        </span>

        {/* Title - larger, bolder */}
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight md:pr-24">
          {discovery.title}
        </h3>

        {/* Content - the insight itself */}
        <p className="text-base md:text-lg text-foreground/80 mt-4 leading-relaxed max-w-3xl">
          {discovery.content}
        </p>

        {/* Footer - source, significance, and copy button */}
        <div className="mt-6 pt-4 border-t border-foreground/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            {discovery.source && (
              <cite className="block text-sm text-foreground/50 italic mb-2">
                {discovery.source}
              </cite>
            )}
            <p className="text-sm text-foreground/60 leading-relaxed">
              <span className="font-medium text-foreground/70">Why it matters:</span>{' '}
              {discovery.significance}
            </p>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-2 text-foreground/40 hover:text-foreground/60 bg-surface border border-foreground/10 rounded-md transition-colors shrink-0 self-end"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
