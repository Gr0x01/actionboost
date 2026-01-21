import { config } from 'dotenv'
config({ path: '.env.local' })

import { runResearch } from '../src/lib/ai/research'
import { generateStrategy } from '../src/lib/ai/generate'
import type { RunInput, ResearchContext } from '../src/lib/ai/types'

// Real test: Inkdex - Visual search engine for tattoo artists
const INKDEX_INPUT: RunInput = {
  productDescription: `Inkdex is a visual search engine for finding tattoo artists by style. Users can search by uploading an image, entering text, or pasting an Instagram post/profile URL. The platform uses CLIP embeddings (768-dim) + pgvector for semantic image search.

Key features:
- Multi-modal search (image upload, text query, Instagram URL detection)
- 20,643 artists across 154 cities in 56 countries (US, Canada, Australia, NZ, India, Pakistan, EU)
- 99,258 portfolio images with ML-generated style tags (11 display styles)
- Artist claiming via Instagram OAuth
- Pro tier ($15/mo) with auto-sync, pinning, unlimited portfolio
- Color-weighted search (boosts B&G or color results based on query)

The core value prop: Instead of browsing generic "tattoo artists near me" results, users can find artists whose actual work matches their vision.`,

  currentTraction: `Platform metrics:
- 20,643 artists in database
- 99,258 images with embeddings
- 154 cities across 56 countries
- ~50-100 daily visitors (organic)
- 0 paying Pro subscribers yet
- 0 claimed artist profiles yet

Recent traffic analysis (Jan 9-16, 2026):
| Channel | Spent | Users | Profile Views | Cost/Profile |
|---------|-------|-------|---------------|--------------|
| Google Ads | $58.82 | 12 | 3 | $19.61 |
| Reddit Ads | $39.63 | 24 | 0 | ∞ |
| BetaList | FREE | 29 | 5 | $0 |
| Google Organic | FREE | 54 | 30 | $0 |

Key insight: Google Ads had 93% click loss (181 clicks → 12 users) - likely bot clicks or ad blockers. Reddit users arrived but didn't convert to profile views at all. Free traffic (organic, BetaList) significantly outperformed paid.`,

  tacticsAndResults: `Paid advertising (not working):
- Google Ads targeting "tattoo artists near me" keywords - terrible ROI ($19.61/profile view)
- Reddit Ads in r/tattoos and r/tattoo - users arrived but 0% converted to profile views
- Paused all paid ads to collect organic baseline data

Growth features built:
- Share buttons with Web Share API + clipboard fallback
- Dynamic OG images for social sharing (search results, artist profiles)
- Referral tracking with UTM/ref params via PostHog
- "Ambassador" program page (mention us on IG → 3 months Pro free)

SEO work:
- 4,000+ static pages (city, state, country, style browse pages)
- City guides with editorial content (~1,500-2,000 words each)
- IndexNow integration for Bing/Yandex

What's working:
- Google organic: 54 users → 30 profile views (55% conversion)
- Free traffic converts 10-20x better than paid
- BetaList listing drove 29 users, 5 profile views (17% conversion)

Technical infrastructure is solid:
- Search performs well (200ms response time)
- ML style classifier working (11 styles)
- International expansion running smoothly (EU, India, Pakistan, Canada, Australia)`,

  focusArea: 'acquisition',

  competitorUrls: [
    'tattoodo.com',
    'inkstinct.co',
  ],

  websiteUrl: 'https://inkdex.io',

  constraints: `Solo founder, limited budget (~$200/month for growth experiments).
Have been burning ~$100/week on paid ads with terrible results - need to find sustainable acquisition.
80% of traffic is mobile but the core search experience was desktop-first (recently added sticky mobile search bar).
Main technical focus has been international expansion + GDPR compliance, not growth marketing.
Need to prove organic acquisition works before investing more in paid channels.`,
}

async function main() {
  console.log('=== Inkdex Growth Strategy Test ===\n')
  console.log('Product: Visual search engine for finding tattoo artists by style')
  console.log('Focus: Acquisition - "How do I get more users?"\n')

  // Verify environment
  const requiredEnvVars = ['ANTHROPIC_API_KEY', 'TAVILY_API']
  const missingVars = requiredEnvVars.filter((v) => !process.env[v])
  if (missingVars.length) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }
  console.log('Environment: OK\n')

  // Research phase
  console.log('1. Running research phase...')
  const startResearch = Date.now()
  let research: ResearchContext

  try {
    research = await runResearch(INKDEX_INPUT)
    const researchTime = Date.now() - startResearch

    console.log(`   Completed in ${(researchTime / 1000).toFixed(1)}s`)
    console.log(`   - Competitor insights: ${research.competitorInsights.length}`)
    console.log(`   - Market trends: ${research.marketTrends.length}`)
    console.log(`   - Growth tactics: ${research.growthTactics.length}`)
    console.log(`   - SEO metrics: ${research.seoMetrics.length}`)
    if (research.errors.length) {
      console.log(`   - Warnings: ${research.errors.join(', ')}`)
    }
    console.log()
  } catch (err) {
    console.error('   Research failed:', err)
    research = {
      competitorInsights: [],
      marketTrends: [],
      growthTactics: [],
      seoMetrics: [],
      researchCompletedAt: new Date().toISOString(),
      errors: [String(err)],
    }
  }

  // Generation phase
  console.log('2. Generating strategy with Claude Opus 4.5...')
  const startGen = Date.now()

  try {
    const output = await generateStrategy(INKDEX_INPUT, research)
    const genTime = Date.now() - startGen

    console.log(`   Completed in ${(genTime / 1000).toFixed(1)}s`)
    console.log(`   Output: ${output.length} characters, ${output.split('\n').length} lines\n`)

    // Verify sections
    const expectedSections = [
      'Executive Summary',
      'Your Current Situation',
      'Competitive Landscape',
      'Stop Doing',
      'Start Doing',
      'Quick Wins',
      '30-Day Roadmap',
      'Metrics to Track',
    ]
    const missingSections = expectedSections.filter((s) => !output.includes(`## ${s}`))

    console.log('3. Verifying output structure...')
    if (missingSections.length === 0) {
      console.log('   All 8 sections present: OK\n')
    } else {
      console.log(`   Missing: ${missingSections.join(', ')}\n`)
    }

    // Print output
    console.log('='.repeat(70))
    console.log('INKDEX GROWTH STRATEGY')
    console.log('='.repeat(70))
    console.log()
    console.log(output)
    console.log()
    console.log('='.repeat(70))

    // Summary
    const totalTime = Date.now() - startResearch
    console.log('\n=== Summary ===')
    console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`)
    console.log(`Research: ${((totalTime - genTime) / 1000).toFixed(1)}s`)
    console.log(`Generation: ${(genTime / 1000).toFixed(1)}s`)
    console.log(`Output: ${output.length} chars, ${output.split('\n').length} lines`)
  } catch (err) {
    console.error('   Generation failed:', err)
    process.exit(1)
  }
}

main().catch(console.error)
