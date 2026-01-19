import { config } from 'dotenv'
config({ path: '.env.local' })
import { runResearch } from '../src/lib/ai/research'
import { generateStrategy } from '../src/lib/ai/generate'
import type { RunInput, ResearchContext } from '../src/lib/ai/types'

// Test input based on Actionboo.st itself
const TEST_INPUT: RunInput = {
  productDescription: `Actionboo.st is a one-shot AI growth strategist for startups and entrepreneurs who are stuck.
Users pay $15, describe their situation (product, traction, what they've tried), and get a personalized
growth strategy built on live competitive research (Tavily + DataForSEO) and Claude Opus 4.5 reasoning.
The output is a comprehensive markdown document with executive summary, competitive analysis,
stop doing/start doing recommendations with ICE prioritization, quick wins, and a 30-day roadmap.`,

  currentTraction: `Just launched. Landing page is live at actionboo.st. No paying customers yet.
Getting some traffic from indie hacker communities (Reddit, Twitter/X). About 50 unique visitors
in the first week. A few email signups for updates.`,

  whatYouTried: `- Posted on r/SideProject and r/startups - got some engagement but no conversions
- Shared on Twitter/X a few times - limited reach (small following)
- Cold outreach to 20 founders in Discord communities - 2 replied, neither converted
- Tried ProductHunt but haven't launched yet (saving for when product is more polished)`,

  whatsWorking: `People engage most when I share specific growth tips and mini case studies.
Got good feedback on the concept - "I'd pay for specific, actionable advice instead of generic AI slop."
The $15 price point doesn't seem to be a barrier in conversations - people are more skeptical
about whether the output will actually be useful.`,

  focusArea: 'acquisition', // AARRR-based: acquisition | activation | retention | referral | monetization | custom

  competitorUrls: ['growthhackers.com', 'reforge.com'],

  websiteUrl: 'https://actionboo.st',

  constraints: `Solo founder, limited budget (~$500/month for marketing),
need to see traction within 30 days to justify continuing development.
Can dedicate ~20 hours/week to this project alongside consulting work.`,
}

async function main() {
  console.log('=== Actionboo.st AI Pipeline Test ===\n')
  console.log('Testing with Actionboo.st as the example product...\n')

  // Verify environment variables
  const requiredEnvVars = ['ANTHROPIC_API_KEY', 'TAVILY_API']
  const missingVars = requiredEnvVars.filter((v) => !process.env[v])
  if (missingVars.length) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
    console.error('Make sure .env.local is loaded (dotenv/config should handle this)')
    process.exit(1)
  }

  console.log('Environment variables: OK\n')

  // Test research phase
  console.log('1. Running research phase...')
  console.log('   - Tavily: competitor insights, market trends, growth tactics')
  console.log('   - DataForSEO: SEO metrics for competitor domains\n')

  const startResearch = Date.now()
  let research: ResearchContext

  try {
    research = await runResearch(TEST_INPUT)
    const researchTime = Date.now() - startResearch

    console.log(`   Research completed in ${(researchTime / 1000).toFixed(1)}s`)
    console.log(`   - Competitor insights: ${research.competitorInsights.length} results`)
    console.log(`   - Market trends: ${research.marketTrends.length} results`)
    console.log(`   - Growth tactics: ${research.growthTactics.length} results`)
    console.log(`   - SEO metrics: ${research.seoMetrics.length} domains`)

    if (research.errors.length) {
      console.log(`   - Warnings: ${research.errors.length}`)
      research.errors.forEach((e) => console.log(`     * ${e}`))
    }
    console.log()
  } catch (err) {
    console.error('   Research failed:', err)
    console.log('   Proceeding with empty research context...\n')
    research = {
      competitorInsights: [],
      marketTrends: [],
      growthTactics: [],
      seoMetrics: [],
      researchCompletedAt: new Date().toISOString(),
      errors: [String(err)],
    }
  }

  // Test generation phase
  console.log('2. Generating strategy with Claude Opus 4.5...')
  console.log('   Model: claude-opus-4-5-20251101')
  console.log('   Max tokens: 8000\n')

  const startGen = Date.now()

  try {
    const output = await generateStrategy(TEST_INPUT, research)
    const genTime = Date.now() - startGen

    console.log(`   Generation completed in ${(genTime / 1000).toFixed(1)}s`)
    console.log(`   Output length: ${output.length} characters`)
    console.log(`   Output lines: ${output.split('\n').length}\n`)

    // Verify output structure
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

    console.log('3. Verifying output structure...')
    const missingSections = expectedSections.filter(
      (section) => !output.includes(`## ${section}`)
    )

    if (missingSections.length === 0) {
      console.log('   All expected sections present: OK\n')
    } else {
      console.log(`   Missing sections: ${missingSections.join(', ')}\n`)
    }

    // Print the output
    console.log('='.repeat(60))
    console.log('GENERATED STRATEGY OUTPUT')
    console.log('='.repeat(60))
    console.log()
    console.log(output)
    console.log()
    console.log('='.repeat(60))
    console.log('END OF OUTPUT')
    console.log('='.repeat(60))

    // Summary
    const totalTime = Date.now() - startResearch
    console.log('\n=== Test Summary ===')
    console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`)
    console.log(`Research: ${((Date.now() - startResearch - genTime) / 1000).toFixed(1)}s`)
    console.log(`Generation: ${(genTime / 1000).toFixed(1)}s`)
    console.log(`Output: ${output.length} characters, ${output.split('\n').length} lines`)
    console.log(
      `Sections: ${expectedSections.length - missingSections.length}/${expectedSections.length} present`
    )
    console.log()
  } catch (err) {
    console.error('   Generation failed:', err)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
