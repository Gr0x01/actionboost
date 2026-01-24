/**
 * Extract structured output for all examples
 * Run with: npx tsx scripts/extract-examples.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
// Use longer timeout for extraction
process.env.FORMATTER_TIMEOUT_MS = '180000' // 3 minutes

import { extractStructuredOutput } from '../src/lib/ai/formatter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Fetching examples...')

  const { data: examples, error } = await supabase
    .from('examples')
    .select('id, slug, content, structured_output')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch examples:', error)
    process.exit(1)
  }

  console.log(`Found ${examples.length} examples\n`)

  for (const example of examples) {
    const hasOutput = !!example.structured_output
    console.log(`[${example.slug}] ${hasOutput ? '✓ Has structured output, re-extracting...' : '⚡ Extracting...'}`)

    try {
      const structuredOutput = await extractStructuredOutput(example.content)

      if (!structuredOutput) {
        console.log(`  ✗ Failed to extract\n`)
        continue
      }

      const { error: updateError } = await supabase
        .from('examples')
        .update({ structured_output: structuredOutput })
        .eq('id', example.id)

      if (updateError) {
        console.log(`  ✗ Failed to save: ${updateError.message}\n`)
        continue
      }

      console.log(`  ✓ Done\n`)
    } catch (err) {
      console.log(`  ✗ Error: ${err}\n`)
    }
  }

  console.log('All done!')
}

main()
