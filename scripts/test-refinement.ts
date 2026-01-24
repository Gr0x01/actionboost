import { config } from 'dotenv'
config({ path: '.env.local' })

import { generateAgenticRefinement } from '../src/lib/ai/pipeline-agentic'
import { extractStructuredOutput } from '../src/lib/ai/formatter'
import type { RunInput } from '../src/lib/ai/types'

// Sample input (doesn't need to match original exactly - just for context)
const SAMPLE_INPUT: RunInput = {
  productDescription: 'Marketing strategy tool for small businesses',
  currentTraction: 'Early stage, testing product-market fit',
  focusArea: 'acquisition',
}

// Sample previous output (abbreviated - in real use this would be the full strategy)
const SAMPLE_PREVIOUS_OUTPUT = `
# Growth Strategy for Actionboo.st

## Executive Summary
You're building a marketing strategy tool for overwhelmed small business owners. The market gap is clear: enterprise tools (SEMrush, Ahrefs) target marketers, while small business owners just want to be told what to do.

## Your Situation
Your product delivers 30-day action plans. Users love the output but discovery is the challenge.

## Competitive Landscape
| Competitor | Traffic | Notes |
|------------|---------|-------|
| SEMrush | 10M/mo | Enterprise, complex |
| Ubersuggest | 2M/mo | Freemium, still technical |

## Key Discoveries
1. Small businesses search for "plans" not "tools"
2. Reddit communities reveal exact language users use

## Channel Strategy
Focus on content marketing targeting "30 day marketing plan for [niche]" keywords.

## Stop Doing
1. Don't target "SEO tool" keywords - enterprise owned
2. Don't compete on features

## Start Doing
| Priority | Title | ICE | Impact | Confidence | Ease |
|----------|-------|-----|--------|------------|------|
| 1 | Create niche-specific landing pages | 24 | 9 | 8 | 7 |
| 2 | Write "30 day plan" pillar content | 22 | 8 | 7 | 7 |
| 3 | Answer Reddit questions | 20 | 7 | 7 | 6 |

## Week 1: Foundation
| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 1 | Research top 10 salon marketing questions | 2 hrs | List compiled |
| 2 | Draft salon landing page | 3 hrs | Page drafted |
| 3 | Publish landing page | 1 hr | Page live |

## Week 2-4
[Similar tables for weeks 2-4]

## Metrics Dashboard
| Metric | Target | Category |
|--------|--------|----------|
| Weekly visitors | 500 | Acquisition |
| Signups | 50 | Activation |

## Content Templates
Template 1: "The 30-Day Marketing Plan for [Niche]"
Template 2: "Where to Start Marketing Your [Business Type]"
`

// Test different refinement scenarios
const REFINEMENT_SCENARIOS = {
  question: "What specific keywords should I target first?",
  correction: "Actually my main audience is salon owners specifically, not general small business",
  expansion: "Can you go deeper on the Reddit strategy? What subreddits and how should I engage?",
  context: "I forgot to mention - I only have 5 hours per week to spend on marketing",
}

async function main() {
  const scenario = process.argv[2] as keyof typeof REFINEMENT_SCENARIOS || 'question'
  const additionalContext = REFINEMENT_SCENARIOS[scenario] || REFINEMENT_SCENARIOS.question

  console.log('=== Refinement Test ===\n')
  console.log(`Scenario: ${scenario}`)
  console.log(`User feedback: "${additionalContext}"\n`)

  const startTime = Date.now()

  try {
    const result = await generateAgenticRefinement(
      SAMPLE_INPUT,
      SAMPLE_PREVIOUS_OUTPUT,
      additionalContext,
      async (stage) => console.log(`  Stage: ${stage}`)
    )

    const elapsed = Date.now() - startTime

    if (!result.success) {
      console.error('Refinement failed:', result.error)
      process.exit(1)
    }

    console.log(`\nCompleted in ${(elapsed / 1000).toFixed(1)}s`)
    console.log(`Output: ${result.output?.length || 0} chars`)
    console.log(`Tool calls: ${result.toolCalls?.length || 0}`)

    // Check if output looks like a complete strategy
    const output = result.output || ''
    const hasExecutiveSummary = output.includes('Executive Summary') || output.includes('## Executive')
    const hasStartDoing = output.includes('Start Doing') || output.includes('ICE')
    const hasWeekTables = output.includes('Week 1') || output.includes('Day |')
    const hasMetrics = output.includes('Metrics') || output.includes('Target')

    console.log('\n--- Completeness Check ---')
    console.log(`Executive Summary: ${hasExecutiveSummary ? 'YES' : 'NO'}`)
    console.log(`Start Doing (ICE): ${hasStartDoing ? 'YES' : 'NO'}`)
    console.log(`Week tables: ${hasWeekTables ? 'YES' : 'NO'}`)
    console.log(`Metrics: ${hasMetrics ? 'YES' : 'NO'}`)

    if (!hasExecutiveSummary || !hasStartDoing) {
      console.log('\n⚠️  WARNING: Output may be incomplete (missing key sections)')
    }

    // Extract structured output
    console.log('\n--- Extracting Structured Output ---')
    const structured = await extractStructuredOutput(output, result.researchData)

    if (structured) {
      console.log('Extraction successful!')
      console.log(`Priorities: ${structured.topPriorities?.length || 0}`)
      console.log(`ICE scores: ${structured.topPriorities?.map(p => p.iceScore).join(', ') || 'none'}`)
      console.log(`Discoveries: ${structured.discoveries?.length || 0}`)
      console.log(`Positioning: ${structured.positioning ? 'yes' : 'no'}`)
    } else {
      console.log('Extraction failed')
    }

    // Print first 2000 chars of output
    console.log('\n--- Output Preview (first 2000 chars) ---')
    console.log(output.slice(0, 2000))
    if (output.length > 2000) {
      console.log(`\n... [${output.length - 2000} more chars]`)
    }

  } catch (err) {
    console.error('Failed:', err)
    process.exit(1)
  }
}

main().catch(console.error)
