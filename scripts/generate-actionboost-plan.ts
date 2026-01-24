/**
 * Generate Boost's own marketing plan
 *
 * This script runs the agentic pipeline on Boost itself,
 * saving both the markdown output and structured_output JSON
 * for use in the blog post at /blog/our-growth-plan
 *
 * Usage: npx tsx scripts/generate-actionboost-plan.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import * as fs from 'fs'
import * as path from 'path'
import { generateStrategyAgentic, type ResearchData } from '../src/lib/ai/pipeline-agentic'
import { extractStructuredOutput } from '../src/lib/ai/formatter'
import type { RunInput, ResearchContext } from '../src/lib/ai/types'

// Updated for SMB positioning (January 2026)
const ACTIONBOOST_INPUT: RunInput = {
  productDescription: `Boost creates 30-day marketing plans for small business owners who are stuck.

Target audience: Salons, local service businesses, niche e-commerce shops. People who know they need to market but don't have time to become marketing experts.

How it works:
1. User fills out a detailed form about their business (takes ~5-10 minutes)
2. User pays $49 (one-time)
3. AI researches their actual competitors using Tavily web search and DataForSEO
4. Claude Opus 4.5 generates a personalized 30-day marketing plan
5. User gets an interactive dashboard with their strategy

The output includes:
- Executive Summary with positioning analysis
- Competitive Landscape (real data on competitors)
- Key Discoveries from research (what's working in their market)
- Priorities with ICE scoring
- Week-by-week 30-day roadmap
- Metrics to track

What makes it different:
- Real research on YOUR competitors, not generic advice
- No marketing degree needed - written in plain English
- Explains frameworks simply (AARRR = "Finding you, Trying you, Coming back, Telling friends, Paying you")
- Includes 2 free refinements if you want to add context

The subscription upsell (future): Dashboard shows grayed-out integration slots for Google Analytics, PostHog, etc. "Connect for weekly insights" → $49/mo subscription.`,

  currentTraction: `Live and taking payments. Several paying customers.
- Full product built: form wizard, Stripe payments, agentic AI pipeline, interactive results dashboard
- Magic link auth (no passwords)
- Soft brutalist design (friendly but distinctive)
- Reddit validation: salon owner and niche e-commerce found real value
- Cost per run: ~$0.50-0.60 (Opus + Tavily + DataForSEO)
- Price: $49 = ~90% margin`,

  tacticsAndResults: `What we've tried:
- Pivoted from indie hackers ($9.99) to SMBs ($49) - founders could build this themselves, SMBs actually need it
- Removed jargon, added plain-English explanations
- Simplified form from 8 to 7 steps
- Added April Dunford positioning framework to output
- Changed design from harsh brutalist to soft brutalist (friendlier)

What's working:
- SMB positioning resonates ("stuck on marketing" messaging)
- Real research differentiator - not templated advice
- Form-before-payment flow increases commitment
- Dashboard makes complex strategy scannable
- "No marketing degree needed" messaging`,

  focusArea: 'acquisition',

  competitorUrls: ['copy.ai', 'jasper.ai', 'growthmentor.com'],

  websiteUrl: 'https://actionboo.st',

  alternatives: ['Wing it (trial and error)', 'Hire an agency', 'Ask ChatGPT'],

  constraints: `Solo founder, limited marketing budget.
Target: 50 paying customers in first month.
Primary channels: Twitter/X (indie hacker adjacent), Reddit (small business subs), direct outreach to SMBs on social.
Content strategy: Show real examples of Boost output to prove value.`,
}

async function main() {
  console.log('=== Generating Boost Marketing Plan ===\n')

  // Verify environment
  const required = ['ANTHROPIC_API_KEY', 'TAVILY_API', 'DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD']
  const missing = required.filter(v => !process.env[v])
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(', ')}`)
    process.exit(1)
  }
  console.log('Environment: OK\n')

  // Stage update callback (just logs)
  const onStageUpdate = async (stage: string) => {
    console.log(`[Stage] ${stage}`)
  }

  console.log('Starting agentic pipeline...\n')
  const startTime = Date.now()

  try {
    // Run the agentic generation
    const { output, researchData } = await generateStrategyAgentic(
      ACTIONBOOST_INPUT,
      {} as ResearchContext, // Ignored by agentic pipeline
      null, // No user history
      onStageUpdate,
      'blog-generation', // Fake run ID for logging
      undefined // No user ID
    )

    const genTime = Date.now() - startTime
    console.log(`\n[Complete] Generation finished in ${(genTime / 1000).toFixed(1)}s`)
    console.log(`[Complete] Output: ${output.length} characters\n`)

    // Extract structured output for dashboard
    console.log('Extracting structured output...')
    let structuredOutput = null
    try {
      structuredOutput = await extractStructuredOutput(output, researchData)
      console.log('[Complete] Structured output extracted')
    } catch (err) {
      console.warn('[Warning] Structured output extraction failed:', err)
    }

    // Ensure docs directory exists
    const docsDir = path.join(process.cwd(), 'docs')
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }

    // Save markdown output
    const mdFile = path.join(docsDir, 'actionboost-strategy-export.md')
    fs.writeFileSync(mdFile, output)
    console.log(`\nSaved markdown to: ${mdFile}`)

    // Save structured output JSON
    if (structuredOutput) {
      const jsonFile = path.join(docsDir, 'actionboost-structured-output.json')
      fs.writeFileSync(jsonFile, JSON.stringify(structuredOutput, null, 2))
      console.log(`Saved structured output to: ${jsonFile}`)
    }

    // Save research data for reference
    if (researchData) {
      const researchFile = path.join(docsDir, 'actionboost-research-data.json')
      fs.writeFileSync(researchFile, JSON.stringify(researchData, null, 2))
      console.log(`Saved research data to: ${researchFile}`)
    }

    // Summary
    console.log('\n=== Summary ===')
    console.log(`Total time: ${(genTime / 1000).toFixed(1)}s`)
    console.log(`Output: ${output.length} chars`)
    console.log(`Research: ${researchData?.searches.length || 0} searches, ${researchData?.seoMetrics.length || 0} SEO metrics`)
    console.log(`Structured output: ${structuredOutput ? 'Yes' : 'No'}`)

    if (structuredOutput) {
      console.log(`  - Priorities: ${structuredOutput.topPriorities?.length || 0}`)
      console.log(`  - Discoveries: ${structuredOutput.discoveries?.length || 0}`)
      console.log(`  - Keywords: ${structuredOutput.keywordOpportunities?.keywords?.length || 0}`)
    }

    console.log('\nDone! Update the blog page to use these files.')

  } catch (err) {
    console.error('\nPipeline failed:', err)
    process.exit(1)
  }
}

main()
