'use client'

import type { PositioningGap as PositioningGapType } from '@/lib/ai/formatter-types'

interface PositioningGapProps {
  gap: PositioningGapType
}

/**
 * PositioningGap - Three quotes showing the disconnect between message and market.
 * No card. Bold typography does the heavy lifting.
 * Soft Brutalist: visible structure through type weight, not decoration.
 */
export function PositioningGap({ gap }: PositioningGapProps) {
  return (
    <section>
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-5">
        THE POSITIONING GAP
      </span>

      <div className="space-y-8">
        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
            YOUR PAGE SAYS
          </span>
          <p className="text-lg leading-[1.5] text-foreground/70 italic">
            &ldquo;{gap.yourMessage}&rdquo;
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
            THE MARKET EXPECTS
          </span>
          <p className="text-lg leading-[1.5] text-foreground/70 italic">
            &ldquo;{gap.marketExpects}&rdquo;
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
            THE DISCONNECT
          </span>
          <p className="text-xl leading-[1.4] text-foreground font-bold">
            {gap.gap}
          </p>
        </div>
      </div>
    </section>
  )
}
