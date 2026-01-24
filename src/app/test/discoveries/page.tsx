'use client'

import { LeadDiscovery } from '@/components/results/dashboard/LeadDiscovery'
import { Discoveries } from '@/components/results/dashboard/Discoveries'
import type { Discovery } from '@/lib/ai/formatter-types'

// Test data from the Inkdex run
const testDiscoveries: Discovery[] = [
  {
    type: 'competitive_intel',
    title: 'Tattoodo Cancelled Booking Platform',
    content: "Tattoodo killed their booking platform in 2023, with artists reporting they lost '60% of my clients from there' and actively seeking alternatives.",
    source: 'Reddit r/TattooArtists research',
    significance: 'Creates market void - artists lost major client acquisition channel and are actively seeking replacements',
  },
  {
    type: 'pattern',
    title: 'City Subreddits Drive Tattoo Referrals',
    content: "Every major city subreddit gets multiple 'tattoo artist recommendations' posts weekly, with users desperately seeking style-specific local artists.",
    source: 'Reddit research across city subs',
    significance: 'Distribution channel opportunity - hundreds of high-intent posts monthly that nobody is systematically answering with a tool',
  },
  {
    type: 'opportunity',
    title: 'Instagram Search Problem Validated',
    content: "Users consistently complain that Instagram isn't helpful for finding artists because it's 'not location-based' and has poor search functionality.",
    source: 'Reddit r/tattoo posts',
    significance: 'Direct validation of core value proposition - users articulating the exact problem Inkdex solves',
  },
  {
    type: 'finding',
    title: 'Multiple Users Proposed Building Inkdex',
    content: "Several Reddit posts from 2024 show users saying 'I'm thinking of creating a platform where people can search for tattoos based on style, price point, and location.'",
    source: 'Reddit research',
    significance: 'Strong market demand signal - people independently proposing the exact solution, market hasn\'t found answer yet',
  },
  {
    type: 'competitive_intel',
    title: 'TattoosWizard Success With Basic Directory',
    content: 'TattoosWizard gets 318K monthly visitors with 70K ranking keywords using just basic filtering - no AI or visual search.',
    source: 'SEO analysis',
    significance: 'Proves programmatic SEO works in this space - and Inkdex has better technology (visual search) to differentiate',
  },
  {
    type: 'risk',
    title: 'Google May Penalize Programmatic SEO',
    content: 'Sites with thin programmatic content have been hit by recent Google updates. Quality custom text on each page is essential.',
    source: 'SEO industry analysis',
    significance: 'Current approach of custom generated text per page is correct - but must maintain quality as pages scale',
  },
]

export default function TestDiscoveriesPage() {
  // Split: first is hero, rest go to secondary section
  const leadDiscovery = testDiscoveries[0]
  const remainingDiscoveries = testDiscoveries.slice(1)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Discoveries Layout Test
        </h1>
        <p className="text-foreground/60 mb-12">
          New layout: Hero discovery at #2, remaining discoveries at #9
        </p>

        {/* Simulating InsightsView layout */}
        <div className="space-y-24">
          {/* 1. Positioning (simulated) */}
          <section className="p-6 bg-surface border border-foreground/10 rounded-md">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
              POSITIONING
            </span>
            <p className="text-foreground/60 italic">
              [Positioning summary would go here]
            </p>
          </section>

          {/* 2. Lead Discovery - THE HERO */}
          <LeadDiscovery discovery={leadDiscovery} />

          {/* 3. Priorities (simulated) */}
          <section className="p-6 bg-surface border border-foreground/10 rounded-md">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
              KEY PRIORITIES
            </span>
            <p className="text-foreground/60 italic">
              [Priority cards would go here]
            </p>
          </section>

          {/* 4-8. Other sections (simulated) */}
          <section className="p-6 bg-surface border border-foreground/10 rounded-md">
            <p className="text-foreground/40 text-sm">
              [Refinement CTA, Competitive Comparison, Market Pulse, Keywords, Metrics...]
            </p>
          </section>

          {/* 9. Remaining Discoveries */}
          <Discoveries discoveries={remainingDiscoveries} />

          {/* 10. Deep Dives (simulated) */}
          <section className="p-6 bg-surface border border-foreground/10 rounded-md">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
              DEEP DIVES
            </span>
            <p className="text-foreground/60 italic">
              [Accordion content would go here]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
