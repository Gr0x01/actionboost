/**
 * Regenerate examples through the full agentic pipeline
 * Run with: npx tsx scripts/regenerate-examples.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { generateStrategyAgentic } from '../src/lib/ai/pipeline-agentic'
import { extractStructuredOutput } from '../src/lib/ai/formatter'
import type { RunInput } from '../src/lib/ai/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Sample businesses matching new target audience (SEO targets)
const EXAMPLE_INPUTS: Array<{
  slug: string
  industry: string
  stage: string
  input: RunInput
}> = [
  // Already generated:
  // - saas-email-productivity (SaaS)
  // - shopify-candles-growth (E-commerce)

  // Digital agency example
  {
    slug: 'digital-agency-growth',
    industry: 'Agency',
    stage: 'Established',
    input: {
      productDescription: `Digital marketing agency specializing in paid social and SEO for DTC e-commerce brands. 5 person team, $600K ARR, 8 retainer clients.

We're good at what we do but terrible at marketing ourselves. All clients came from referrals or my personal network. Now those are drying up and we need a real pipeline.

Our website hasn't been updated in 2 years. We have case studies but they're buried. No content strategy, sporadic LinkedIn posts. Competing against thousands of agencies who all say the same things.

Main challenges:
- Everyone claims to be a "growth agency" - hard to stand out
- Potential clients ghost after first call
- We're always too busy with client work to market ourselves
- Not sure if we should niche down further or stay broad`,
      currentTraction: '$100K-500K ARR',
      focusArea: 'acquisition',
      alternatives: ['Hire in-house', 'Other agencies', 'Freelancers', 'DIY with tools', 'Do nothing'],
      websiteUrl: '',
      competitorUrls: ['https://singlegrain.com', 'https://growthassistant.com'],
    },
  },
]

async function main() {
  console.log('🚀 Regenerating examples through agentic pipeline...\n')

  for (const example of EXAMPLE_INPUTS) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📦 ${example.industry} - ${example.slug}`)
    console.log(`${'='.repeat(60)}\n`)

    try {
      // Run the agentic pipeline
      console.log('🔬 Running agentic pipeline...')
      const startTime = Date.now()

      const result = await generateStrategyAgentic(
        example.input,
        null, // Research context ignored - agentic fetches its own
        null, // No user history for examples
        async (stage) => {
          console.log(`   Stage: ${stage}`)
        }
      )

      const pipelineTime = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✓ Pipeline complete in ${pipelineTime}s`)
      console.log(`  Output length: ${result.output.length} chars`)

      // Extract structured output
      console.log('\n🎨 Extracting structured output...')
      const structuredOutput = await extractStructuredOutput(result.output, result.researchData)

      if (!structuredOutput) {
        console.log('⚠️ Structured output extraction failed, saving content only')
      } else {
        console.log('✓ Structured output extracted')
      }

      // Generate insight from the output (first meaningful sentence)
      const insight = extractInsight(result.output)
      console.log(`📝 Insight: "${insight}"`)

      // Check if example exists
      const { data: existing } = await supabase
        .from('examples')
        .select('id')
        .eq('slug', example.slug)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('examples')
          .update({
            industry: example.industry,
            stage: example.stage,
            insight,
            content: result.output,
            structured_output: structuredOutput,
            published_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) {
          console.log(`❌ Failed to update: ${error.message}`)
        } else {
          console.log('✓ Updated existing example')
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('examples')
          .insert({
            slug: example.slug,
            industry: example.industry,
            stage: example.stage,
            insight,
            content: result.output,
            structured_output: structuredOutput,
            is_live: true,
            published_at: new Date().toISOString(),
          })

        if (error) {
          console.log(`❌ Failed to insert: ${error.message}`)
        } else {
          console.log('✓ Inserted new example')
        }
      }

    } catch (err) {
      console.log(`❌ Error: ${err}`)
    }
  }

  console.log('\n\n✅ All done!')
}

/**
 * Extract a compelling insight from the strategy output
 * Looks for the executive summary or first strong statement
 */
function extractInsight(markdown: string): string {
  // Try to find the executive summary
  const execMatch = markdown.match(/## Executive Summary\n\n([^\n]+)/i)
  if (execMatch) {
    const insight = execMatch[1].replace(/\*\*/g, '').trim()
    if (insight.length > 20 && insight.length < 150) {
      return insight
    }
  }

  // Try to find a strong opening statement
  const lines = markdown.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  for (const line of lines.slice(0, 10)) {
    const clean = line.replace(/\*\*/g, '').trim()
    if (clean.length > 30 && clean.length < 150 && !clean.startsWith('|')) {
      return clean
    }
  }

  return 'A strategic marketing plan based on real competitive research.'
}

main()
