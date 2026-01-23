import type { CompetitorItem } from '@/lib/ai/formatter-types'

interface CompetitorSnapshotProps {
  competitors: CompetitorItem[]
}

/**
 * CompetitorSnapshot - Narrative Typography
 * Editorial-style competitor rundown with bold names and full positioning
 * Reads like a friendly expert explaining the landscape
 */
export function CompetitorSnapshot({ competitors }: CompetitorSnapshotProps) {
  if (competitors.length === 0) {
    return null
  }

  const displayCompetitors = competitors.slice(0, 5)

  return (
    <section className="scroll-mt-32 max-w-3xl">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
        COMPETITIVE LANDSCAPE
      </span>

      {/* Narrative intro */}
      <p className="text-lg text-foreground/70 mb-6">
        Here's who you're up against:
      </p>

      {/* Competitor narratives */}
      <div className="space-y-4">
        {displayCompetitors.map((competitor) => (
          <p key={competitor.name} className="text-base leading-relaxed">
            <span className="font-bold text-foreground text-lg">
              {competitor.name}
            </span>
            {competitor.positioning && (
              <span className="text-foreground/70">
                {' — '}
                {competitor.positioning}
              </span>
            )}
          </p>
        ))}
      </div>
    </section>
  )
}
