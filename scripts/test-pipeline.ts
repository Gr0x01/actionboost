import { config } from 'dotenv'
config({ path: '.env.local' })
import { runResearch } from '../src/lib/ai/research'
import { generateStrategy } from '../src/lib/ai/generate'
import type { RunInput, ResearchContext } from '../src/lib/ai/types'
import * as fs from 'fs'
import * as path from 'path'

// Test input based on Actionboo.st itself (updated from memory-bank)
const TEST_INPUT: RunInput = {
  productDescription: `Actionboo.st is an AI growth strategist for startups and entrepreneurs who are stuck.

Not another ChatGPT wrapper. Not generic "have you tried content marketing?" advice.

Users pay $9.99, paste their situation (product, traction, what they've tried, what's working), and get a real strategy built on live competitive research (Tavily + DataForSEO) and Claude Opus 4.5 reasoning.

The output is a comprehensive 10-section strategy document:
1. Executive Summary with Growth Flywheel diagram
2. Your Situation (AARRR stage analysis)
3. Competitive Landscape (tables with competitor data)
4. Channel Strategy (prioritized by effort/impact)
5. Stop Doing (3-5 items with reasoning)
6. Start Doing (5-8 items with ICE scores)
7. This Week (day-by-day quick wins)
8. 30-Day Roadmap (week-by-week with themes)
9. Metrics Dashboard (AARRR targets)
10. Content Templates (ready-to-use)

The flywheel: User does $9.99 one-shot, loves it → "Want this every week, automatically?" → $29/mo subscription (v2).

Key insight: User fills out detailed form BEFORE seeing checkout. After 10 minutes of input, they're committed.`,

  currentTraction: `Pre-launch / early stage. Landing page live at actionboo.st.
Building for launch. Feature-complete with:
- Brutalist + tactile UI design
- Magic link auth
- Stripe payments
- Resend transactional emails
- RAG system for returning users
- Free mini-audit lead magnet`,

  whatYouTried: `- Building the product (feature-complete)
- Establishing brand voice (blunt optimist, impatient for results, research nerd, allergic to guru culture)
- Designing landing page with brutalist aesthetic (harsh offset shadows, tactile buttons)
- Creating free mini-audit as lead magnet (3 sections vs 10, uses Sonnet instead of Opus)`,

  whatsWorking: `- Brand positioning resonates: "The founder friend who's three steps ahead"
- Clear enemy: The Growth Advice Industrial Complex (47-page decks, $5K consultants, "build in public" gurus)
- Strong unit economics: ~$0.50 cost per run, $9.99 price = ~90% margin
- Form-before-payment flow increases commitment (psychological investment)
- Product actually delivers value (real research, not templated advice)`,

  focusArea: 'acquisition',

  competitorUrls: ['growthhackers.com', 'reforge.com', 'demandcurve.com'],

  websiteUrl: 'https://actionboo.st',

  constraints: `Solo founder building MVP+. Limited marketing budget.
Need to validate product-market fit before investing heavily in growth.
Can dedicate focused time to launch and initial traction.
Primary channels: indie hacker communities (Reddit, Twitter/X, Indie Hackers, Product Hunt).`,
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

    // Verify output structure (10 sections from generate.ts OUTPUT_FORMAT_PROMPT)
    const expectedSections = [
      'Executive Summary',
      'Your Situation',
      'Competitive Landscape',
      'Channel Strategy',
      'Stop Doing',
      'Start Doing',
      'This Week',
      '30-Day Roadmap',
      'Metrics Dashboard',
      'Content Templates',
    ]

    console.log('3. Verifying output structure...')
    const missingSections = expectedSections.filter(
      (section) => !output.includes(`## ${section}`)
    )

    if (missingSections.length === 0) {
      console.log('   All 10 expected sections present: OK\n')
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

    // Save output to file for blog post
    const outputDir = path.join(process.cwd(), 'docs')
    const outputFile = path.join(outputDir, 'actionboost-strategy-export.md')

    // Ensure docs directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputFile, output)
    console.log(`\nOutput saved to: ${outputFile}`)
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
