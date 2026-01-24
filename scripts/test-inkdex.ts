import { config } from 'dotenv'
config({ path: '.env.local' })

import { generateAgenticStrategy } from '../src/lib/ai/pipeline-agentic'
import { extractStructuredOutput } from '../src/lib/ai/formatter'
import type { RunInput } from '../src/lib/ai/types'

// Real test: Inkdex - Visual search engine for tattoo artists
const INKDEX_INPUT: RunInput = {
  productDescription: `Inkdex is a visual search engine for finding tattoo artists by style. It's like "Shazam for tattoos" - upload an image or describe what you want, and find artists whose work matches your vision.

How it works:
- We scrape Instagram to auto-create portfolios for tattoo artists
- We create CLIP embeddings of their work for semantic search
- Sub-2s search across styles via text or image upload
- Tagged by location so clients can find amazing artists in their city

Key stats:
- 25,000 artists in database
- 200,000 images with embeddings
- 8,000 pages indexed by Google (waiting for trust to index the rest)
- Programmatic SEO: city/state/country pages + style pages with custom text
- Live for 3 weeks

The problem we solve: Tattoo artists live on Instagram, but Instagram is built for engagement, not search. You can't search "fine line floral tattoo artist in Austin." We make that possible.`,

  currentTraction: `Platform live for 3 weeks. Metrics:
- 25,000 artists
- 200,000 images
- 8,000 pages indexed by Google
- Waiting for Google to trust us to index the rest
- Everybody who USES it as a client loves it
- We need TRAFFIC`,

  tacticsAndResults: `What hasn't worked:
- Paid ads: Tried Google Ads and Reddit Ads. Terrible ROI, paused.
- DMing artists: Low response rate, doesn't scale

What we've built:
- Programmatic SEO pages: city/state/country + style combinations
- All pages have custom generated text, not just templates
- 8k pages indexed, many more waiting

What's next:
- Waiting for Google to build trust and index more pages
- Need organic traffic strategies that work for a 3-week-old site`,

  focusArea: 'acquisition',

  competitorUrls: [
    'tattoodo.com',
  ],

  websiteUrl: 'https://inkdex.io',

  constraints: `Solo founder. Limited budget.
The product works great - users who find us love it.
The problem is discovery. How do people find us?
Site is only 3 weeks old so Google trust is still building.`,
}

async function main() {
  console.log('=== Inkdex Agentic Pipeline Test ===\n')
  console.log('Testing: New "senior analyst" system prompt')
  console.log('Focus: SEO - should call seo tool on tattoodo.com\n')

  // Verify environment
  const requiredEnvVars = ['ANTHROPIC_API_KEY', 'TAVILY_API']
  const missingVars = requiredEnvVars.filter((v) => !process.env[v])
  if (missingVars.length) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }

  const hasDataForSEO = process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD
  console.log(`Environment: OK (DataForSEO: ${hasDataForSEO ? 'configured' : 'NOT configured'})\n`)

  // Agentic generation
  console.log('Running agentic strategy generation...')
  console.log('(Watch for tool calls - should see SEO for tattoodo.com)\n')

  const startTime = Date.now()

  try {
    const result = await generateAgenticStrategy(
      INKDEX_INPUT,
      null, // no user history
      async (stage) => console.log(`  Stage: ${stage}`)
    )

    const genTime = Date.now() - startTime

    if (!result.success) {
      console.error('Generation failed:', result.error)
      process.exit(1)
    }

    console.log(`\nCompleted in ${(genTime / 1000).toFixed(1)}s`)
    console.log(`Tool calls: ${result.toolCalls?.length || 0}`)

    // Show tool calls
    if (result.toolCalls?.length) {
      console.log('\n--- Tool Calls ---')
      result.toolCalls.forEach((call, i) => {
        console.log(`${i + 1}. ${call}`)
      })
    }

    // Show research data captured
    if (result.researchData) {
      console.log('\n--- Research Data Captured ---')
      console.log(`Searches: ${result.researchData.searches.length}`)
      console.log(`SEO Metrics: ${result.researchData.seoMetrics.length}`)
      if (result.researchData.seoMetrics.length > 0) {
        console.log('  Domains:')
        result.researchData.seoMetrics.forEach(m => {
          console.log(`    - ${m.domain}: ${m.traffic?.toLocaleString() || 'N/A'} traffic, ${m.keywords?.toLocaleString() || 'N/A'} keywords`)
        })
      }
      console.log(`Keyword Gaps: ${result.researchData.keywordGaps.length}`)
      console.log(`Scrapes: ${result.researchData.scrapes.length}`)
    }

    // Extract structured output
    console.log('\n--- Extracting Structured Output ---')
    const structured = await extractStructuredOutput(result.output!, result.researchData)

    if (structured) {
      console.log('Extraction successful!')
      console.log(`Priorities: ${structured.topPriorities?.length || 0}`)
      console.log(`Competitors: ${structured.competitors?.length || 0}`)
      console.log(`Positioning: ${structured.positioning ? 'yes' : 'no'}`)
      console.log(`Competitive Comparison: ${structured.competitiveComparison?.domains?.length || 0} domains`)
      if (structured.competitiveComparison?.domains) {
        structured.competitiveComparison.domains.forEach(d => {
          console.log(`  - ${d.domain}: ${d.traffic?.toLocaleString() || 'N/A'}/mo`)
        })
      }
      console.log(`Keyword Opportunities: ${structured.keywordOpportunities?.keywords?.length || 0}`)
      console.log(`Discoveries: ${structured.discoveries?.length || 0}`)
      if (structured.discoveries?.length) {
        structured.discoveries.forEach((d, i) => {
          console.log(`  ${i + 1}. [${d.type}] ${d.title}`)
          console.log(`     ${d.content}`)
          if (d.source) console.log(`     Source: ${d.source}`)
        })
      }
    } else {
      console.log('Extraction failed or returned null')
    }

    // Print strategy
    console.log('\n' + '='.repeat(70))
    console.log('INKDEX GROWTH STRATEGY')
    console.log('='.repeat(70) + '\n')
    console.log(result.output)
    console.log('\n' + '='.repeat(70))

    // Summary
    console.log('\n=== Summary ===')
    console.log(`Total time: ${(genTime / 1000).toFixed(1)}s`)
    console.log(`Tool time: ${((result.timing?.tools || 0) / 1000).toFixed(1)}s`)
    console.log(`Generation time: ${((result.timing?.generation || 0) / 1000).toFixed(1)}s`)
    console.log(`Output: ${result.output?.length || 0} chars`)

  } catch (err) {
    console.error('Failed:', err)
    process.exit(1)
  }
}

main().catch(console.error)
