'use client'

import type { BriefScores } from '@/lib/ai/formatter-types'

interface BriefScoreGaugeProps {
  scores: BriefScores
}

const CATEGORY_LABELS: [string, string, string, string?, string?][] = [
  ['Clarity', 'clarity', 'clarityWhy', 'positioning', 'positioningWhy'],
  ['Visibility', 'visibility', 'visibilityWhy'],
  ['Proof', 'proof', 'proofWhy'],
  ['Advantage', 'advantage', 'advantageWhy', 'competitiveEdge', 'competitiveEdgeWhy'],
]

function scoreColor(s: number): string {
  return s >= 70 ? 'text-green-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'
}

function borderColor(s: number): string {
  return s >= 70 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626'
}

function verdict(s: number): string {
  return s >= 90 ? 'Exceptional' : s >= 70 ? 'Solid' : s >= 50 ? 'Needs Work' : 'Significant Problems'
}

/**
 * BriefScoreGauge - Compact arc gauge + 4 category breakdowns.
 * Designed to sit in a 2/5 column alongside PositioningSummaryV2.
 */
export function BriefScoreGauge({ scores }: BriefScoreGaugeProps) {
  return (
    <section>
      <div
        className="bg-background border-2 border-foreground/20 rounded-md p-5"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.08)' }}
      >
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
        DIAGNOSTIC SCORE
      </span>

      {/* Score gauge + verdict */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-[100px] h-[56px] shrink-0">
          <svg viewBox="0 0 120 68" className="w-full h-full" fill="none">
            <path
              d="M 10 63 A 50 50 0 0 1 110 63"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              className="text-foreground/10"
            />
            <path
              d="M 10 63 A 50 50 0 0 1 110 63"
              stroke={borderColor(scores.overall)}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${scores.overall * 1.57} 157`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
            <span className={`text-[32px] font-bold leading-none tabular-nums ${scoreColor(scores.overall)}`}>
              {scores.overall}
            </span>
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">{verdict(scores.overall)}</span>
          <p className="text-xs text-foreground/50 mt-0.5">out of 100</p>
        </div>
      </div>

      {/* Category breakdown with evidence */}
      <div className="border-t border-foreground/10 pt-4 space-y-3">
        {CATEGORY_LABELS.map(([label, key, whyKey, fallbackKey, fallbackWhyKey]) => {
          const s = scores as Record<string, unknown>
          const score = (s[key] ?? (fallbackKey ? s[fallbackKey] : undefined)) as number | undefined
          const why = (s[whyKey] ?? (fallbackWhyKey ? s[fallbackWhyKey] : undefined)) as string | undefined
          if (score == null) return null
          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40">
                  {label}
                </span>
                <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>
                  {score}
                </span>
              </div>
              {why && (
                <p className="text-xs leading-relaxed text-foreground/70 mt-0.5">
                  {why}
                </p>
              )}
            </div>
          )
        })}
      </div>
      </div>
    </section>
  )
}
