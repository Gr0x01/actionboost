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

// Sample businesses matching new target audience
const EXAMPLE_INPUTS: Array<{
  slug: string
  industry: string
  stage: string
  input: RunInput
}> = [
  {
    slug: 'saas-analytics-growth',
    industry: 'SaaS',
    stage: 'Early traction',
    input: {
      productDescription: `PixelMetrics - a privacy-first web analytics tool for indie hackers and small SaaS teams. We're an alternative to Google Analytics that's simpler, privacy-compliant, and doesn't require cookie banners.

Currently at $800 MRR with 45 paying customers. Most come from word of mouth and a few Product Hunt upvotes from our launch 3 months ago. We've tried cold outreach on Twitter but it feels spammy. Posted on r/SaaS once but got removed for self-promotion.

Main differentiator is we're much simpler than Plausible or Fathom - one-click setup, no config needed. But we're struggling to communicate that.`,
      currentTraction: '100-1K users',
      focusArea: 'acquisition',
      alternatives: ['Google Analytics (free)', 'Plausible', 'Fathom', 'Just check Stripe dashboard'],
      websiteUrl: 'https://pixelmetrics.io',
      competitorUrls: ['https://plausible.io', 'https://usefathom.com'],
    },
  },
  {
    slug: 'ecommerce-retention-fix',
    industry: 'E-commerce',
    stage: 'Plateau',
    input: {
      productDescription: `Brew & Bean Co - specialty coffee subscription for home brewers. We source single-origin beans and ship fresh-roasted every 2 weeks.

$12K MRR but churning hard. Getting new subscribers from Instagram ads (~$35 CAC) but 60% cancel within 3 months. "Too much coffee" or "didn't like the roast" are top reasons.

We've tried:
- Exit surveys (low response)
- Skip-a-month option (helps a bit)
- Roast preference quiz (half don't complete it)

Not sure if it's product-market fit issue or we're just bad at retention.`,
      currentTraction: '1K-10K users',
      focusArea: 'retention',
      alternatives: ['Buy from local roaster', 'Trade Joe\'s', 'Other subscriptions like Atlas Coffee', 'Just buy whatever at grocery store'],
      websiteUrl: 'https://brewandbean.co',
      competitorUrls: ['https://www.atlascoffeeclub.com', 'https://tradecoffeeco.com'],
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
