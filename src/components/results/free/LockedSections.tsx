'use client'

/**
 * LockedSections - Skeleton previews of paid dashboard sections.
 *
 * Shown below the paywall on free results to make the paid tier
 * feel tangibly different. Each section has:
 * - Label (mono uppercase, /40)
 * - Description (text-sm, /60) — the main thing the user reads
 * - Skeleton preview (50% opacity) — structural context
 *
 * Order: Priorities → Traffic → Market Pulse → Discoveries → Metrics
 */

function SkeletonBar({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-3 rounded-sm bg-foreground/8"
      style={{ width }}
    />
  )
}

function SectionHeader({ label, description }: { label: string; description: string }) {
  return (
    <div className="mb-6">
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
        {label}
      </span>
      <p className="text-lg font-semibold text-foreground/70 tracking-tight max-w-2xl">
        {description}
      </p>
    </div>
  )
}

/** Skeleton of PriorityCards - 3 cards with rank badges */
function LockedPriorities() {
  const cards = [
    { rank: 1, primary: true },
    { rank: 2, primary: false },
    { rank: 3, primary: false },
  ]

  return (
    <section>
      <SectionHeader
        label="KEY PRIORITIES"
        description="Your top 3 moves, ranked by impact. Start with #1."
      />
      <div className="opacity-50 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map(({ rank, primary }) => (
            <div
              key={rank}
              className={`relative rounded-md ${
                primary
                  ? 'bg-background border-2 border-foreground/15 p-5'
                  : 'bg-background border border-foreground/10 p-4'
              }`}
              style={primary ? { boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.06)' } : undefined}
            >
              {/* Rank badge */}
              <div
                className={`absolute -top-3 -left-1 font-mono font-bold px-3 py-1 rounded-md ${
                  primary
                    ? 'bg-[#d5d8db] text-[#a0a5ab] text-sm'
                    : 'bg-surface text-foreground/25 text-xs border border-foreground/10'
                }`}
              >
                #{rank}
              </div>
              {/* Skeleton content */}
              <div className="mt-3 space-y-3">
                <SkeletonBar width="80%" />
                <SkeletonBar width="100%" />
                <SkeletonBar width="60%" />
              </div>
              {/* ICE footer */}
              <div className="mt-5 pt-3 border-t border-foreground/8 flex justify-between">
                <div className="h-2.5 w-8 rounded-sm bg-foreground/6" />
                <div className="h-2.5 w-6 rounded-sm bg-foreground/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Skeleton of CompetitiveComparison - bar chart with domain names */
function LockedTrafficComparison() {
  const bars = [
    { width: '100%' },
    { width: '82%' },
    { width: '45%' },
    { width: '38%' },
    { width: '20%' },
  ]

  return (
    <section>
      <SectionHeader
        label="TRAFFIC COMPARISON"
        description="See where your competitors get their traffic — and how much."
      />
      <div className="opacity-50 pointer-events-none">
        <div
          className="bg-background border border-foreground/15 rounded-md p-6"
          style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.06)' }}
        >
          <div className="space-y-5">
            {bars.map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <div className="h-3.5 rounded-sm bg-foreground/8" style={{ width: `${80 + i * 5}px` }} />
                  <div className="h-3.5 w-16 rounded-sm bg-foreground/6" />
                </div>
                <div className="h-4 rounded-sm bg-foreground/8" style={{ width: bar.width }} />
                <div className="h-2.5 w-32 rounded-sm bg-foreground/5 mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Skeleton of MarketPulse - 2-column quote grid */
function LockedMarketPulse() {
  return (
    <section>
      <SectionHeader
        label="MARKET PULSE"
        description="Real quotes from your market. What customers are actually saying online."
      />
      <div className="opacity-50 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {/* Left column */}
          <div className="border-l border-foreground/10 pl-6 space-y-10">
            {[0, 1].map((i) => (
              <div key={`left-${i}`} className="space-y-2">
                <SkeletonBar width="95%" />
                <SkeletonBar width="100%" />
                <SkeletonBar width="70%" />
                <div className="h-2.5 w-24 rounded-sm bg-foreground/5 mt-3" />
              </div>
            ))}
          </div>
          {/* Right column */}
          <div className="border-l border-foreground/10 pl-6 space-y-10 mt-10 md:mt-0">
            {[0, 1].map((i) => (
              <div key={`right-${i}`} className="space-y-2">
                <SkeletonBar width="90%" />
                <SkeletonBar width="100%" />
                <SkeletonBar width="55%" />
                <div className="h-2.5 w-20 rounded-sm bg-foreground/5 mt-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Skeleton of Discoveries - 2-column card grid */
function LockedDiscoveries() {
  const cards = [
    { typeWidth: '50px' },
    { typeWidth: '60px' },
    { typeWidth: '35px' },
  ]

  return (
    <section>
      <SectionHeader
        label="KEY DISCOVERIES"
        description="Patterns, risks, and opportunities we found in your competitive landscape."
      />
      <div className="opacity-50 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-background border border-foreground/10 rounded-md p-4"
              style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.04)' }}
            >
              {/* Type badge */}
              <div className="h-2.5 rounded-sm bg-foreground/6 mb-2" style={{ width: card.typeWidth }} />
              {/* Title */}
              <SkeletonBar width="85%" />
              {/* Content */}
              <div className="mt-3 space-y-2">
                <SkeletonBar width="100%" />
                <SkeletonBar width="90%" />
                <SkeletonBar width="65%" />
              </div>
              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-foreground/8">
                <div className="h-2.5 w-20 rounded-sm bg-foreground/5 mb-1.5" />
                <SkeletonBar width="80%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Skeleton of MetricsSnapshot - 2-column metric cards */
function LockedMetrics() {
  const metrics = [
    { catWidth: '70px' },
    { catWidth: '60px' },
    { catWidth: '70px' },
    { catWidth: '55px' },
  ]

  return (
    <section>
      <SectionHeader
        label="KEY METRICS"
        description="The numbers to track weekly. Targets set for your specific stage."
      />
      <div className="opacity-50 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="bg-background border border-foreground/10 rounded-md p-5"
              style={{ boxShadow: '3px 3px 0 rgba(44, 62, 80, 0.04)' }}
            >
              {/* Category label */}
              <div className="h-2.5 rounded-sm bg-foreground/6 mb-3" style={{ width: m.catWidth }} />
              {/* Metric name */}
              <SkeletonBar width="70%" />
              {/* Value */}
              <div className="h-5 w-24 rounded-sm bg-foreground/8 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LockedSections() {
  return (
    <div className="space-y-16">
      <LockedPriorities />
      <LockedTrafficComparison />
      <LockedMarketPulse />
      <LockedDiscoveries />
      <LockedMetrics />
    </div>
  )
}
