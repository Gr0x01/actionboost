/**
 * Free Audit Model Cost Optimization Test
 *
 * Tests cheaper model alternatives for the free audit pipeline.
 * Compares output quality across different model combinations.
 *
 * Usage:
 *   npx tsx scripts/test-free-models.ts --run-id=<run-id>
 *   npx tsx scripts/test-free-models.ts --run-id=6ed8290a-4364-4223-a5e3-73a648aa6047
 *
 * Test Cases:
 *   1. Opus gen + Sonnet fmt (current baseline)
 *   2. Sonnet gen + Sonnet fmt
 *   3. Sonnet gen + Haiku fmt
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { generatePositioningPreview } from '../src/lib/ai/generate'
import { extractStructuredOutput } from '../src/lib/ai/formatter'
import type { RunInput, ResearchContext } from '../src/lib/ai/types'
import type { Database } from '../src/lib/types/database'

// =============================================================================
// MODEL CONFIGURATIONS
// =============================================================================

const MODELS = {
  opus: 'claude-opus-4-5-20251101',
  sonnet: 'claude-sonnet-4-20250514',
  haiku: 'claude-3-5-haiku-20241022',
} as const

// Cost per 1M tokens (input/output)
const COSTS = {
  [MODELS.opus]: { input: 15, output: 75 },
  [MODELS.sonnet]: { input: 3, output: 15 },
  [MODELS.haiku]: { input: 0.80, output: 4 },
}

type ModelCombo = {
  name: string
  genModel: string
  fmtModel: string
}

const TEST_COMBOS: ModelCombo[] = [
  { name: 'opus-sonnet', genModel: MODELS.opus, fmtModel: MODELS.sonnet },
  { name: 'sonnet-sonnet', genModel: MODELS.sonnet, fmtModel: MODELS.sonnet },
  { name: 'sonnet-haiku', genModel: MODELS.sonnet, fmtModel: MODELS.haiku },
]

// =============================================================================
// DATABASE HELPERS
// =============================================================================

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchRunData(runId: string) {
  const { data: run, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error || !run) {
    throw new Error(`Run not found: ${runId} - ${error?.message}`)
  }

  return run
}

// =============================================================================
// MOCK RESEARCH FOR TESTING
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildMinimalResearch(_input: RunInput): ResearchContext {
  // Build a minimal research context similar to free audit flow
  // (input could be used in future to customize research queries)
  return {
    competitorInsights: [],
    marketTrends: [],
    growthTactics: [],
    seoMetrics: [],
    researchCompletedAt: new Date().toISOString(),
    errors: [],
  }
}

// =============================================================================
// TEST EXECUTION
// =============================================================================

interface TestResult {
  combo: string
  genModel: string
  fmtModel: string
  genTimeMs: number
  fmtTimeMs: number
  genInputTokens: number
  genOutputTokens: number
  genCost: number
  fmtCost: number
  totalCost: number
  output: string
  positioning: {
    verdict?: string
    summary?: string
    uniqueValue?: string
    targetSegment?: string
  } | null
  discovery: {
    type?: string
    title?: string
    content?: string
    source?: string
    significance?: string
  } | null
}

async function runTestCombo(
  combo: ModelCombo,
  input: RunInput,
  research: ResearchContext
): Promise<TestResult> {
  console.log(`\n   Testing ${combo.name}...`)
  console.log(`      Gen: ${combo.genModel}`)
  console.log(`      Fmt: ${combo.fmtModel}`)

  // Run generation
  const genStart = Date.now()
  const output = await generatePositioningPreview(input, research, {
    model: combo.genModel,
  })
  const genTimeMs = Date.now() - genStart

  // Estimate tokens (rough approximation from output length)
  const genInputTokens = Math.round(JSON.stringify(input).length / 4) + 2000 // prompt overhead
  const genOutputTokens = Math.round(output.length / 4)

  // Calculate generation cost
  const genCostConfig = COSTS[combo.genModel as keyof typeof COSTS]
  const genCost =
    (genInputTokens / 1_000_000) * genCostConfig.input +
    (genOutputTokens / 1_000_000) * genCostConfig.output

  console.log(`      Gen time: ${(genTimeMs / 1000).toFixed(1)}s`)
  console.log(`      Gen tokens: ~${genInputTokens} in / ~${genOutputTokens} out`)
  console.log(`      Gen cost: $${genCost.toFixed(4)}`)

  // Run formatter
  const fmtStart = Date.now()
  const structured = await extractStructuredOutput(output, undefined, {
    model: combo.fmtModel,
  })
  const fmtTimeMs = Date.now() - fmtStart

  // Estimate formatter cost (input is output from gen, output is structured JSON)
  const fmtInputTokens = Math.round(output.length / 4) + 3000 // system prompt overhead
  const fmtOutputTokens = structured ? Math.round(JSON.stringify(structured).length / 4) : 500
  const fmtCostConfig = COSTS[combo.fmtModel as keyof typeof COSTS]
  const fmtCost =
    (fmtInputTokens / 1_000_000) * fmtCostConfig.input +
    (fmtOutputTokens / 1_000_000) * fmtCostConfig.output

  console.log(`      Fmt time: ${(fmtTimeMs / 1000).toFixed(1)}s`)
  console.log(`      Fmt cost: $${fmtCost.toFixed(4)}`)
  console.log(`      Total cost: $${(genCost + fmtCost).toFixed(4)}`)

  // Extract key fields for free audit
  const positioning = structured?.positioning ?? null
  const discovery = structured?.discoveries?.[0] ?? null

  return {
    combo: combo.name,
    genModel: combo.genModel,
    fmtModel: combo.fmtModel,
    genTimeMs,
    fmtTimeMs,
    genInputTokens,
    genOutputTokens,
    genCost,
    fmtCost,
    totalCost: genCost + fmtCost,
    output,
    positioning,
    discovery,
  }
}

// =============================================================================
// OUTPUT GENERATION
// =============================================================================

function generateComparisonMarkdown(results: TestResult[], runId: string): string {
  const lines: string[] = []

  lines.push('# Free Audit Model Comparison Results')
  lines.push(`\nRun ID: \`${runId}\``)
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')

  // Cost comparison table
  lines.push('## Cost Comparison')
  lines.push('')
  lines.push('| Combo | Gen Model | Fmt Model | Gen Cost | Fmt Cost | Total | vs Baseline |')
  lines.push('|-------|-----------|-----------|----------|----------|-------|-------------|')

  const baseline = results[0]
  for (const r of results) {
    const savings = baseline.totalCost - r.totalCost
    const pct = ((savings / baseline.totalCost) * 100).toFixed(0)
    const vsBaseline = r === baseline ? '-' : `${savings >= 0 ? '-' : '+'}$${Math.abs(savings).toFixed(4)} (${pct}%)`
    lines.push(
      `| ${r.combo} | ${r.genModel.split('-').slice(-1)[0]} | ${r.fmtModel.split('-').slice(-1)[0]} | $${r.genCost.toFixed(4)} | $${r.fmtCost.toFixed(4)} | $${r.totalCost.toFixed(4)} | ${vsBaseline} |`
    )
  }

  // Time comparison
  lines.push('')
  lines.push('## Latency Comparison')
  lines.push('')
  lines.push('| Combo | Gen Time | Fmt Time | Total |')
  lines.push('|-------|----------|----------|-------|')
  for (const r of results) {
    lines.push(
      `| ${r.combo} | ${(r.genTimeMs / 1000).toFixed(1)}s | ${(r.fmtTimeMs / 1000).toFixed(1)}s | ${((r.genTimeMs + r.fmtTimeMs) / 1000).toFixed(1)}s |`
    )
  }

  // Quality comparison - Positioning
  lines.push('')
  lines.push('## Quality Comparison: Positioning')
  lines.push('')
  for (const r of results) {
    lines.push(`### ${r.combo}`)
    if (r.positioning) {
      lines.push(`- **Verdict**: ${r.positioning.verdict || 'N/A'}`)
      lines.push(`- **Summary**: ${r.positioning.summary || 'N/A'}`)
      lines.push(`- **Unique Value**: ${r.positioning.uniqueValue || 'N/A'}`)
      lines.push(`- **Target Segment**: ${r.positioning.targetSegment || 'N/A'}`)
    } else {
      lines.push('*No positioning extracted*')
    }
    lines.push('')
  }

  // Quality comparison - Discovery
  lines.push('## Quality Comparison: First Discovery')
  lines.push('')
  for (const r of results) {
    lines.push(`### ${r.combo}`)
    if (r.discovery) {
      lines.push(`- **Type**: ${r.discovery.type || 'N/A'}`)
      lines.push(`- **Title**: ${r.discovery.title || 'N/A'}`)
      lines.push(`- **Content**: ${r.discovery.content || 'N/A'}`)
      lines.push(`- **Source**: ${r.discovery.source || 'N/A'}`)
      lines.push(`- **Significance**: ${r.discovery.significance || 'N/A'}`)
    } else {
      lines.push('*No discovery extracted*')
    }
    lines.push('')
  }

  // Evaluation rubric
  lines.push('## Evaluation Rubric (Manual Review)')
  lines.push('')
  lines.push('Score each 1-5:')
  lines.push('')
  lines.push('| Combo | Positioning Accuracy | Discovery Quality | Business Specificity | Polish | Total |')
  lines.push('|-------|---------------------|-------------------|---------------------|--------|-------|')
  for (const r of results) {
    lines.push(`| ${r.combo} | /5 | /5 | /5 | /5 | /20 |`)
  }
  lines.push('')
  lines.push('**Criteria:**')
  lines.push('- **Positioning Accuracy**: Does the verdict match their actual situation?')
  lines.push('- **Discovery Quality**: Is it surprising, specific, and sourced?')
  lines.push('- **Business Specificity**: References their actual product/competitors?')
  lines.push('- **Polish**: Professional, no hallucinations?')

  return lines.join('\n')
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('='.repeat(60))
  console.log('FREE AUDIT MODEL COST OPTIMIZATION TEST')
  console.log('='.repeat(60))

  // Parse arguments
  const args = process.argv.slice(2)
  const runIdArg = args.find((a) => a.startsWith('--run-id='))
  const runId = runIdArg?.split('=')[1]

  if (!runId) {
    console.error('\nUsage: npx tsx scripts/test-free-models.ts --run-id=<run-id>')
    console.error('\nExample run IDs from paid audits:')
    console.error('  - 6ed8290a-4364-4223-a5e3-73a648aa6047')
    console.error('  - 664f1bbc-161b-466c-abc6-07840a7604e7')
    console.error('  - bbf8e6ca-6bc5-4c62-8c76-5a64500e1e58')
    process.exit(1)
  }

  // Verify environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY')
    process.exit(1)
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials')
    process.exit(1)
  }

  // Create output directory
  const outputDir = 'memory-bank/test-outputs'
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
    console.log(`\nCreated ${outputDir}/`)
  }

  // Fetch run data
  console.log(`\n1. Fetching run ${runId}...`)
  const run = await fetchRunData(runId)
  const input = run.input as RunInput
  console.log(`   Website: ${input.websiteUrl || 'N/A'}`)
  console.log(`   Focus: ${input.focusArea}`)

  // Build minimal research (like free audit flow)
  const research = buildMinimalResearch(input)
  console.log(`   Research: minimal (free audit mode)`)

  // Run tests
  console.log('\n2. Running model comparisons...')
  const results: TestResult[] = []

  for (const combo of TEST_COMBOS) {
    try {
      const result = await runTestCombo(combo, input, research)
      results.push(result)

      // Save individual output
      const filename = `${outputDir}/${combo.name}-output.md`
      writeFileSync(filename, result.output)
      console.log(`      Saved: ${filename}`)
    } catch (err) {
      console.error(`      FAILED: ${err}`)
    }
  }

  // Generate comparison summary
  console.log('\n3. Generating comparison summary...')
  const summary = generateComparisonMarkdown(results, runId)
  const summaryFile = `${outputDir}/comparison-summary.md`
  writeFileSync(summaryFile, summary)
  console.log(`   Saved: ${summaryFile}`)

  // Print summary table
  console.log('\n' + '='.repeat(60))
  console.log('RESULTS SUMMARY')
  console.log('='.repeat(60))
  console.log('')
  console.log('| Combo | Total Cost | vs Baseline |')
  console.log('|-------|------------|-------------|')

  const baseline = results[0]
  for (const r of results) {
    const savings = baseline.totalCost - r.totalCost
    const pct = ((savings / baseline.totalCost) * 100).toFixed(0)
    const vsBaseline = r === baseline ? '-' : `-${pct}%`
    console.log(`| ${r.combo.padEnd(13)} | $${r.totalCost.toFixed(4).padStart(7)} | ${vsBaseline.padStart(11)} |`)
  }

  console.log('')
  console.log(`Review outputs in ${outputDir}/`)
  console.log('- opus-sonnet-output.md (baseline)')
  console.log('- sonnet-sonnet-output.md')
  console.log('- sonnet-haiku-output.md')
  console.log('- comparison-summary.md')
  console.log('='.repeat(60))
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
