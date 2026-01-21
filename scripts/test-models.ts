/**
 * Model Comparison Test Script
 *
 * Compares Haiku vs Sonnet vs Opus output quality for the "mini-audit" feature.
 * Runs the same input through all three models and saves outputs for comparison.
 *
 * Usage: npx tsx scripts/test-models.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import Anthropic from '@anthropic-ai/sdk'
import { tavily } from '@tavily/core'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import type { RunInput, TavilyResult, ResearchContext } from '../src/lib/ai/types'

// =============================================================================
// MODEL CONFIGURATIONS
// =============================================================================

const MODELS = {
  haiku: 'claude-3-5-haiku-20241022',
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-5-20251101',
} as const

type ModelName = keyof typeof MODELS

// =============================================================================
// TEST INPUT - Actionboo.st itself
// =============================================================================

const TEST_INPUT: RunInput = {
  websiteUrl: 'https://actionboo.st',
  productDescription: `AI growth strategist for startups and entrepreneurs. Users fill out a detailed form about their product
(description, traction, what they've tried, what's working), pay $9.99, and get a personalized growth strategy
powered by Claude Opus + live competitive research (Tavily web search + DataForSEO metrics).

The output is a comprehensive markdown document with: executive summary, current situation analysis,
competitive landscape, stop doing recommendations, start doing (ICE prioritized), quick wins for this week,
30-day roadmap, and metrics to track.`,

  currentTraction: `Pre-launch. Waitlist of ~50 people. No paying customers yet.
Landing page live at actionboo.st. Product is complete and functional.`,

  tacticsAndResults: `Built the product. Have promo codes ready for Reddit (REDDIT20),
Indie Hackers (INDIEHACKERS), and Product Hunt (PRODUCTHUNT).
Haven't done any marketing yet - waiting for the right launch moment.

What's working: Product is complete and works well. Unit economics are strong (~94% margin at $9.99).
The concept resonates when I explain it - "AI that does real research on YOUR competitors, not generic advice."
RAG system remembers returning users for personalized follow-up strategies.`,

  focusArea: 'acquisition',

  competitorUrls: ['https://chatgpt.com', 'https://makerbox.club'],
}

// =============================================================================
// MINI PROMPT - 5 sections (2 full + 3 condensed)
// =============================================================================

const MINI_SYSTEM_PROMPT = `You are an elite Growth Strategist generating a MINI growth audit.
This is a free teaser - give real value but leave room for the full paid version.

## Your Approach
- **Specific** to their product, market, and constraints
- **Prioritized** using the ICE framework (Impact, Confidence, Ease)
- **Actionable** with clear insights they can act on
- **Research-backed** using the competitive intelligence provided

## Core Framework: ICE Prioritization
For every recommendation, you score:
- **Impact** (1-10): How much will this move the needle?
- **Confidence** (1-10): How sure are you this will work?
- **Ease** (1-10): How quickly can they implement this?

ICE Score = Impact + Confidence + Ease (max 30)

## Focus: ACQUISITION
The founder's primary challenge is getting more users. Analyze:
- Where does their target audience hang out online?
- What channels have the best fit for their product type?
- What's the lowest-CAC path to their first customers?

## Output Format

Structure your response as a markdown document with EXACTLY these sections:

## Executive Summary
2-3 paragraphs covering:
- The core insight about their situation
- The biggest opportunity you see
- The strategic direction you recommend

## Your Current Situation
Full analysis:
- What they're doing right (celebrate wins first)
- Where the gaps are
- How their situation compares to successful companies at this stage

## Competitive Landscape
CONDENSED - 1 paragraph overview:
- How competitors approach similar challenges
- Key opportunities competitors are missing

## Stop Doing
CONDENSED - 2-3 items maximum:
- Each with brief reasoning
- Focus on low-ROI activities

## Start Doing (Prioritized by ICE)
CONDENSED - 3 recommendations maximum, each formatted as:

### [Recommendation Title]
- **Impact**: X/10 - [brief reason]
- **Confidence**: X/10 - [brief reason]
- **Ease**: X/10 - [brief reason]
- **ICE Score**: XX

[1 paragraph explanation]

Sort by ICE score (highest first).

---

**STOP HERE.** Do NOT include these sections (they are part of the full paid version):
- Quick Wins
- 30-Day Roadmap
- Metrics to Track

End with exactly this text:
"Want the complete playbook? The full analysis includes your Quick Wins, 30-Day Roadmap, and specific metrics to track."`

// =============================================================================
// RESEARCH (Tavily only, no DataForSEO)
// =============================================================================

async function runTavilyResearch(input: RunInput): Promise<ResearchContext> {
  const errors: string[] = []
  const tvly = tavily({ apiKey: process.env.TAVILY_API! })

  // Extract a category from the product description
  const category = input.productDescription.split(/[.!?]/)[0].slice(0, 80).trim()

  console.log('   Running Tavily searches...')

  const searchWithTimeout = async (query: string): Promise<TavilyResult[]> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 15000)
    )
    const search = tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 5,
      includeRawContent: false,
    })
    const response = await Promise.race([search, timeout])
    return (response.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    }))
  }

  // Run searches in parallel
  const [competitorResults, marketResults, tacticsResults] = await Promise.allSettled([
    searchWithTimeout(`AI growth tools for startups marketing strategies`),
    searchWithTimeout(`${category} market trends 2025`),
    searchWithTimeout(`growth tactics for SaaS founders indie hackers`),
  ])

  const extract = (result: PromiseSettledResult<TavilyResult[]>, label: string): TavilyResult[] => {
    if (result.status === 'fulfilled') return result.value
    errors.push(`${label} failed: ${result.reason}`)
    return []
  }

  return {
    competitorInsights: extract(competitorResults, 'competitor search'),
    marketTrends: extract(marketResults, 'market trends'),
    growthTactics: extract(tacticsResults, 'growth tactics'),
    seoMetrics: [], // Skip DataForSEO for mini audit
    researchCompletedAt: new Date().toISOString(),
    errors,
  }
}

// =============================================================================
// BUILD USER MESSAGE
// =============================================================================

function buildUserMessage(input: RunInput, research: ResearchContext): string {
  // Support both new (tacticsAndResults) and legacy (whatYouTried + whatsWorking) fields
  const tacticsContent = input.tacticsAndResults ||
    [input.whatYouTried, input.whatsWorking].filter(Boolean).join('\n\n') ||
    ''

  let message = `# Growth Strategy Request

## Focus Area
**Acquisition** - How do I get more users?

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}

## What I've Tried & How It's Going
${tacticsContent}
`

  if (input.websiteUrl) {
    message += `\n## My Website\n${input.websiteUrl}\n`
  }

  if (input.competitorUrls?.length) {
    message += `\n## Competitors\n${input.competitorUrls.join('\n')}\n`
  }

  // Add research
  message += `\n---\n\n# Research Data\n`

  if (research.competitorInsights.length) {
    message += `\n## Competitor Insights\n`
    for (const r of research.competitorInsights) {
      message += `- **${r.title}** (${r.url})\n  ${r.content.slice(0, 300)}...\n\n`
    }
  }

  if (research.marketTrends.length) {
    message += `\n## Market Trends\n`
    for (const r of research.marketTrends) {
      message += `- **${r.title}**: ${r.content.slice(0, 200)}...\n`
    }
  }

  if (research.growthTactics.length) {
    message += `\n## Growth Tactics Research\n`
    for (const r of research.growthTactics) {
      message += `- **${r.title}**: ${r.content.slice(0, 200)}...\n`
    }
  }

  return message
}

// =============================================================================
// GENERATE WITH MODEL
// =============================================================================

async function generateWithModel(
  modelName: ModelName,
  userMessage: string,
  client: Anthropic
): Promise<{ output: string; timeMs: number; inputTokens: number; outputTokens: number }> {
  const model = MODELS[modelName]
  const maxTokens = modelName === 'opus' ? 4000 : 2000 // Opus gets more tokens for comparison

  const start = Date.now()
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: MINI_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })
  const timeMs = Date.now() - start

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response')
  }

  return {
    output: textContent.text,
    timeMs,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('='.repeat(60))
  console.log('MODEL COMPARISON TEST - Mini Audit Output')
  console.log('='.repeat(60))
  console.log()

  // Verify environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY')
    process.exit(1)
  }
  if (!process.env.TAVILY_API) {
    console.error('Missing TAVILY_API')
    process.exit(1)
  }

  // Create output directory
  const outputDir = 'scripts/output'
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
    console.log(`Created ${outputDir}/`)
  }

  // Run research once (shared across all models)
  console.log('\n1. Running research (Tavily only)...')
  const researchStart = Date.now()
  const research = await runTavilyResearch(TEST_INPUT)
  console.log(`   Completed in ${((Date.now() - researchStart) / 1000).toFixed(1)}s`)
  console.log(`   - Competitor insights: ${research.competitorInsights.length}`)
  console.log(`   - Market trends: ${research.marketTrends.length}`)
  console.log(`   - Growth tactics: ${research.growthTactics.length}`)
  if (research.errors.length) {
    console.log(`   - Errors: ${research.errors.join('; ')}`)
  }

  // Build user message once
  const userMessage = buildUserMessage(TEST_INPUT, research)

  // Initialize Anthropic client
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Run each model
  console.log('\n2. Generating with each model...\n')

  const results: Record<ModelName, {
    output: string
    timeMs: number
    inputTokens: number
    outputTokens: number
    estimatedCost: number
  }> = {} as typeof results

  // Cost per 1M tokens (input/output)
  const costs: Record<ModelName, { input: number; output: number }> = {
    haiku: { input: 0.25, output: 1.25 },
    sonnet: { input: 3, output: 15 },
    opus: { input: 15, output: 75 },
  }

  for (const modelName of ['haiku', 'sonnet', 'opus'] as ModelName[]) {
    console.log(`   ${modelName.toUpperCase()} (${MODELS[modelName]})...`)

    try {
      const result = await generateWithModel(modelName, userMessage, client)
      const cost = costs[modelName]
      const estimatedCost =
        (result.inputTokens / 1_000_000) * cost.input +
        (result.outputTokens / 1_000_000) * cost.output

      results[modelName] = { ...result, estimatedCost }

      console.log(`      Time: ${(result.timeMs / 1000).toFixed(1)}s`)
      console.log(`      Tokens: ${result.inputTokens} in / ${result.outputTokens} out`)
      console.log(`      Cost: $${estimatedCost.toFixed(4)}`)
      console.log(`      Output: ${result.output.length} chars, ${result.output.split('\n').length} lines`)

      // Save to file
      const filename = `${outputDir}/${modelName}-output.md`
      writeFileSync(filename, result.output)
      console.log(`      Saved: ${filename}`)
      console.log()
    } catch (err) {
      console.error(`      FAILED: ${err}`)
      console.log()
    }
  }

  // Save comparison summary
  console.log('\n3. Summary\n')
  console.log('   | Model  | Time   | Tokens (in/out) | Cost     | Output  |')
  console.log('   |--------|--------|-----------------|----------|---------|')
  for (const modelName of ['haiku', 'sonnet', 'opus'] as ModelName[]) {
    if (results[modelName]) {
      const r = results[modelName]
      console.log(
        `   | ${modelName.padEnd(6)} | ${(r.timeMs / 1000).toFixed(1).padStart(4)}s | ${String(r.inputTokens).padStart(5)}/${String(r.outputTokens).padEnd(5)} | $${r.estimatedCost.toFixed(4).padStart(6)} | ${String(r.output.length).padStart(5)} ch |`
      )
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('Review outputs in scripts/output/')
  console.log('- haiku-output.md')
  console.log('- sonnet-output.md')
  console.log('- opus-output.md')
  console.log('='.repeat(60))

  // Quick quality check
  console.log('\n4. Quick Quality Check\n')
  const expectedSections = [
    'Executive Summary',
    'Your Current Situation',
    'Competitive Landscape',
    'Stop Doing',
    'Start Doing',
  ]

  for (const modelName of ['haiku', 'sonnet', 'opus'] as ModelName[]) {
    if (results[modelName]) {
      const output = results[modelName].output
      const missing = expectedSections.filter((s) => !output.includes(`## ${s}`))
      if (missing.length === 0) {
        console.log(`   ${modelName.toUpperCase()}: All 5 sections present`)
      } else {
        console.log(`   ${modelName.toUpperCase()}: Missing: ${missing.join(', ')}`)
      }
    }
  }

  console.log()
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
