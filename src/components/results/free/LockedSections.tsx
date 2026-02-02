'use client'

import { useState } from 'react'
import type { StructuredOutput, FreeBriefOutput } from '@/lib/ai/formatter-types'

function UpgradeButton({ checkoutUrl, freeAuditId, token }: { checkoutUrl: string; freeAuditId: string; token: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    try {
      const res = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeAuditId, token }),
      })
      if (!res.ok) throw new Error('Failed to create checkout')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-cta text-white font-semibold px-8 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Get my 30-day plan'}
      </button>
      <p className="text-sm text-background/40 mt-2">
        $29 one-time. No subscription. Yours to keep.
      </p>
    </div>
  )
}

/**
 * LockedSections - Data-personalized skeleton previews of paid dashboard sections.
 *
 * Uses structuredOutput to make descriptions specific to the user's results
 * (scores, competitor names, gaps) so locked sections feel like real content
 * they're missing — not generic marketing.
 *
 * Order: Priorities → Discoveries → Market Pulse → Metrics
 */

interface LockedSectionsProps {
  structuredOutput?: FreeBriefOutput | StructuredOutput
  freeAuditId: string
  token: string
}

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
      <p className="text-[15px] leading-[1.6] text-foreground max-w-2xl">
        {description}
      </p>
    </div>
  )
}

/** Gradient fade overlay for skeleton content */
function SkeletonFade({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pointer-events-none">
      <div className="opacity-40">
        {children}
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 30%, var(--background) 95%)',
        }}
      />
    </div>
  )
}

function LockedPriorities({ score }: { score?: number }) {
  const desc = score != null && score < 70
    ? `Your score is ${score}. We identified 3 ranked moves to close the gap — starting with the highest-impact fix.`
    : 'Your top 3 moves, ranked by impact. Start with #1.'

  const cards = [
    { rank: 1, primary: true },
    { rank: 2, primary: false },
    { rank: 3, primary: false },
  ]

  return (
    <section>
      <SectionHeader label="KEY PRIORITIES" description={desc} />
      <SkeletonFade>
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
              <div
                className={`absolute -top-3 -left-1 font-mono font-bold px-3 py-1 rounded-md ${
                  primary
                    ? 'bg-[#d5d8db] text-[#a0a5ab] text-sm'
                    : 'bg-surface text-foreground/25 text-xs border border-foreground/10'
                }`}
              >
                #{rank}
              </div>
              <div className="mt-3 space-y-3">
                <SkeletonBar width="80%" />
                <SkeletonBar width="100%" />
                <SkeletonBar width="60%" />
              </div>
              <div className="mt-5 pt-3 border-t border-foreground/8 flex justify-between">
                <div className="h-2.5 w-8 rounded-sm bg-foreground/6" />
                <div className="h-2.5 w-6 rounded-sm bg-foreground/6" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonFade>
    </section>
  )
}

function LockedDiscoveries({ competitorName }: { competitorName?: string }) {
  const desc = competitorName
    ? `Patterns and blind spots from analyzing ${competitorName} and your competitive landscape.`
    : 'Patterns, risks, and opportunities we found in your competitive landscape.'

  const cards = [
    { typeWidth: '50px' },
    { typeWidth: '60px' },
    { typeWidth: '35px' },
  ]

  return (
    <section>
      <SectionHeader label="KEY DISCOVERIES" description={desc} />
      <SkeletonFade>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-background border border-foreground/10 rounded-md p-4"
              style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.04)' }}
            >
              <div className="h-2.5 rounded-sm bg-foreground/6 mb-2" style={{ width: card.typeWidth }} />
              <SkeletonBar width="85%" />
              <div className="mt-3 space-y-2">
                <SkeletonBar width="100%" />
                <SkeletonBar width="90%" />
                <SkeletonBar width="65%" />
              </div>
              <div className="mt-3 pt-3 border-t border-foreground/8">
                <div className="h-2.5 w-20 rounded-sm bg-foreground/5 mb-1.5" />
                <SkeletonBar width="80%" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonFade>
    </section>
  )
}

function LockedMarketPulse() {
  return (
    <section>
      <SectionHeader
        label="MARKET PULSE"
        description="Real quotes from your market. What customers are actually saying online."
      />
      <SkeletonFade>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
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
      </SkeletonFade>
    </section>
  )
}

function LockedMetrics({ lowestCategory }: { lowestCategory?: string }) {
  const desc = lowestCategory
    ? `Weekly targets calibrated to your stage — starting with ${lowestCategory} where you need the most lift.`
    : 'The numbers to track weekly. Targets set for your specific stage.'

  const metrics = [
    { catWidth: '70px' },
    { catWidth: '60px' },
    { catWidth: '70px' },
    { catWidth: '55px' },
  ]

  return (
    <section>
      <SectionHeader label="KEY METRICS" description={desc} />
      <SkeletonFade>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="bg-background border border-foreground/10 rounded-md p-5"
              style={{ boxShadow: '3px 3px 0 rgba(44, 62, 80, 0.04)' }}
            >
              <div className="h-2.5 rounded-sm bg-foreground/6 mb-3" style={{ width: m.catWidth }} />
              <SkeletonBar width="70%" />
              <div className="h-5 w-24 rounded-sm bg-foreground/8 mt-2" />
            </div>
          ))}
        </div>
      </SkeletonFade>
    </section>
  )
}

export function LockedSections({ structuredOutput, freeAuditId, token }: LockedSectionsProps) {
  const scores = structuredOutput?.briefScores
  const overall = scores?.overall

  // Find lowest category for metrics description
  const categories = scores
    ? [
        { name: 'clarity', score: scores.clarity ?? scores.positioning },
        { name: 'visibility', score: scores.visibility },
        { name: 'proof', score: scores.proof },
        { name: 'advantage', score: scores.advantage ?? scores.competitiveEdge },
      ]
    : []
  const lowest = categories.length
    ? categories.reduce((a, b) => (a.score < b.score ? a : b))
    : null

  // Extract a competitor name from competitive comparison
  const domains = structuredOutput?.competitiveComparison?.domains
  const topCompetitor = domains?.length
    ? domains.find(d => !d.isUser)?.domain
    : undefined

  const checkoutUrl = `/api/checkout/upgrade-from-free`

  return (
    <div className="space-y-16">
      {/* Transition block — the pitch */}
      <div
        className="bg-foreground rounded-md p-8 lg:p-10"
        style={{ boxShadow: '6px 6px 0 rgba(44, 62, 80, 0.15)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left — hero text + CTA */}
          <div>
            <h2 className="text-2xl font-bold text-background mb-2">
              Your diagnosis is clear. Here&rsquo;s the fix.
            </h2>
            <p className="text-[15px] leading-[1.6] text-background/60 mb-6">
              We built a 30-day plan based on your specific score, gaps, and competitive landscape. It&rsquo;s ready now.
            </p>
            <UpgradeButton checkoutUrl={checkoutUrl} freeAuditId={freeAuditId} token={token} />
          </div>

          {/* Right — what's included */}
          <ul className="space-y-4">
            {[
              'Week-by-week tasks ranked by what moves your score fastest',
              'Competitor gaps you can exploit this month, with exact steps',
              'Channel-specific playbooks matched to your budget and audience',
              'Copy templates and hooks written for your market, not generic fills',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cta shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[15px] leading-[1.6] text-background/80">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LockedPriorities score={overall} />
      <LockedDiscoveries competitorName={topCompetitor} />
      <LockedMarketPulse />
      <LockedMetrics lowestCategory={lowest?.name} />
    </div>
  )
}
