'use client'

import type { QuickWin } from '@/lib/ai/formatter-types'

interface QuickWinsProps {
  wins: QuickWin[]
}

const IMPACT_STYLE = {
  high: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-foreground/5 text-foreground/50 border-foreground/10',
} as const

/**
 * QuickWins - Do-it-today fixes, ranked by priority.
 * #1 gets CTA accent treatment. Overlapping rank badges like PriorityCards.
 * Soft Brutalist: bold borders, offset shadows, mono labels.
 */
export function QuickWins({ wins }: QuickWinsProps) {
  if (!wins.length) return null

  return (
    <section>
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
        QUICK WINS
      </span>
      <p className="text-[15px] leading-[1.6] text-foreground mb-8">
        Do these today — no strategy required.
      </p>

      <div className={`grid grid-cols-1 ${wins.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
        {wins.map((win, i) => {
          const isPrimary = i === 0
          return (
            <div
              key={i}
              className={`relative bg-background rounded-md p-5 pt-6 flex flex-col ${
                isPrimary
                  ? 'border-[3px] border-cta/40'
                  : 'border-2 border-foreground/15'
              }`}
              style={{
                boxShadow: isPrimary
                  ? '5px 5px 0 rgba(44, 62, 80, 0.10)'
                  : '4px 4px 0 rgba(44, 62, 80, 0.06)',
              }}
            >
              {/* Rank badge — overlaps card border */}
              <div
                className={`absolute -top-3 -left-1 font-mono font-bold text-xs px-2.5 py-1 rounded ${
                  isPrimary
                    ? 'bg-cta text-white'
                    : 'bg-foreground text-background'
                }`}
              >
                #{i + 1}
              </div>

              <h3 className="text-[17px] font-bold text-foreground tracking-tight mb-3 leading-snug">
                {win.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/50">
                {win.detail}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
