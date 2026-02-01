'use client'

import type { StructuredOutput } from '@/lib/ai/formatter-types'

interface UrgencyHookProps {
  structuredOutput: StructuredOutput
}

/**
 * UrgencyHook - Surfaces one specific finding from locked strategy as urgency driver
 *
 * Priority order:
 * 1. Competitor weakness/opportunity from competitors array
 * 2. Second-highest-surprise discovery (index 1)
 * 3. Positioning gap based on competitor count
 */
export function UrgencyHook({ structuredOutput }: UrgencyHookProps) {
  const { competitors, discoveries, positioning } = structuredOutput

  // Try competitor weakness first
  const competitorWithWeakness = competitors?.find(c => c.weakness && c.opportunity)
  if (competitorWithWeakness) {
    return (
      <HookCard
        label="OPPORTUNITY SPOTTED"
        text={`${competitorWithWeakness.name} has a weakness: ${competitorWithWeakness.weakness}`}
        cta="The full Boost strategy includes the counter-play."
      />
    )
  }

  // Try second discovery
  const secondDiscovery = discoveries?.[1]
  if (secondDiscovery) {
    return (
      <HookCard
        label="FROM YOUR RESEARCH"
        text={secondDiscovery.content}
        cta="The full strategy turns this into an action plan."
      />
    )
  }

  // Positioning gap fallback
  const competitorCount = competitors?.length || 0
  if (competitorCount > 0 && positioning?.verdict !== 'clear') {
    return (
      <HookCard
        label="POSITIONING GAP"
        text={`Your positioning overlaps with ${competitorCount} competitor${competitorCount > 1 ? 's' : ''} we found. Without differentiation, you're competing on price.`}
        cta="The full strategy includes the differentiation playbook."
      />
    )
  }

  return null
}

function HookCard({ label, text, cta }: { label: string; text: string; cta: string }) {
  return (
    <section>
      <div
        className="border-l-[3px] border-cta/40 bg-cta/[0.04] pl-5 py-4 pr-5 rounded-r-md"
      >
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta/70 block mb-1.5">
          {label}
        </span>
        <p className="text-[15px] leading-[1.6] text-foreground mb-2">
          {text}
        </p>
        <p className="text-sm leading-relaxed text-foreground/50 italic">
          {cta}
        </p>
      </div>
    </section>
  )
}
