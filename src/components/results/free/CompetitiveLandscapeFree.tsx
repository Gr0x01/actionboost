'use client'

import type { CompetitorItem } from '@/lib/ai/formatter-types'
import type { CompetitiveComparison } from '@/lib/ai/formatter-types'

interface CompetitiveLandscapeFreeProps {
  competitors?: CompetitorItem[]
  comparison?: CompetitiveComparison
}

/**
 * CompetitiveLandscapeFree - Strategic intelligence, not traffic bars.
 * Thick left border per competitor. Labels stacked above content.
 * Soft Brutalist: type hierarchy does all the work.
 */
export function CompetitiveLandscapeFree({ competitors, comparison }: CompetitiveLandscapeFreeProps) {
  if (!competitors?.length) return null

  const enriched = competitors.map(c => {
    const seoMatch = comparison?.domains?.find(
      d => !d.isUser && d.domain.replace(/^www\./, '').includes(c.name.toLowerCase().replace(/\s+/g, ''))
    )
    const trafficLabel = seoMatch?.traffic
      ? formatTraffic(seoMatch.traffic)
      : c.traffic || null
    return { ...c, trafficLabel }
  })

  return (
    <section>
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
        COMPETITIVE LANDSCAPE
      </span>
      <p className="text-[15px] leading-[1.6] text-foreground mb-8">
        Who you&rsquo;re up against — and where they&rsquo;re vulnerable.
      </p>

      <div className={`grid grid-cols-1 ${enriched.length === 1 ? '' : 'md:grid-cols-2'} gap-12`}>
        {enriched.map((comp, i) => (
          <div key={i} className="border-l-[4px] border-foreground/20 pl-6">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[17px] font-bold text-foreground">
                {comp.name}
              </span>
              {comp.trafficLabel && (
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40">
                  {comp.trafficLabel}
                </span>
              )}
            </div>

            {comp.positioning && (
              <p className="text-[15px] leading-[1.6] text-foreground/60 italic mb-6">
                &ldquo;{comp.positioning}&rdquo;
              </p>
            )}

            {comp.weakness && (
              <div className="mb-5">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-1.5">
                  Weakness
                </span>
                <p className="text-[15px] leading-[1.6] text-foreground">
                  {comp.weakness}
                </p>
              </div>
            )}

            {comp.opportunity && (
              <div>
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-1.5">
                  Opportunity
                </span>
                <p className="text-[15px] leading-[1.6] text-foreground">
                  {comp.opportunity}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function formatTraffic(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M/mo`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K/mo`
  return `${n.toLocaleString()}/mo`
}
