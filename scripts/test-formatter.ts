/**
 * Test script to verify formatter extracts positioning from existing run output
 *
 * Usage: npx tsx scripts/test-formatter.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { extractStructuredOutput } from '../src/lib/ai/formatter'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function main() {
  const runId = process.argv[2] || '15382b24-2636-49fd-812d-b4650501fb49'

  console.log(`[Test] Fetching run ${runId}...`)

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: run, error } = await supabase
    .from('runs')
    .select('output')
    .eq('id', runId)
    .single()

  if (error || !run?.output) {
    console.error('[Test] Failed to fetch run:', error?.message || 'No output')
    process.exit(1)
  }

  console.log(`[Test] Got markdown output: ${run.output.length} chars`)
  console.log(`[Test] First 500 chars:\n${run.output.slice(0, 500)}\n...`)

  console.log('[Test] Running formatter (Sonnet)...')
  const result = await extractStructuredOutput(run.output)

  if (!result) {
    console.error('[Test] FAILED: Formatter returned null')
    process.exit(1)
  }

  console.log('[Test] Formatter succeeded!')
  console.log('[Test] Extracted fields:')
  console.log('  - positioning:', result.positioning ? 'YES' : 'NO')
  console.log('  - topPriorities:', result.topPriorities.length)
  console.log('  - metrics:', result.metrics.length)
  console.log('  - thisWeek.days:', result.thisWeek.days.length)
  console.log('  - weeks:', result.weeks?.length || 0)

  if (result.positioning) {
    console.log('\n[Test] Positioning data:')
    console.log(JSON.stringify(result.positioning, null, 2))
  } else {
    console.error('\n[Test] FAILED: No positioning extracted!')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('[Test] Error:', err)
  process.exit(1)
})
