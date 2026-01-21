/**
 * One-time backfill script for PostHog events
 * Run with: npx tsx scripts/backfill-posthog.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { PostHog } from 'posthog-node'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

if (!POSTHOG_KEY) {
  console.error('Missing NEXT_PUBLIC_POSTHOG_KEY')
  process.exit(1)
}

const posthog = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST })

// Historical data from Supabase (queried 2026-01-21)
const completedRuns = [
  { id: '1e0ad958-c6ed-4619-ad0e-cb2257c5a746', user_id: null, source: null, completed_at: '2026-01-19T09:48:51.86Z', parent_run_id: null, focus_area: 'monetization', competitor_count: 0 },
  { id: 'c179d16f-1125-4a15-9fe0-4712933a96e2', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-20T00:43:34.732Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: 'ccdd719e-cb1d-4d66-93e6-4c1eb15e37de', user_id: 'db280646-fae0-4c53-b04e-7bed172d858e', source: null, completed_at: '2026-01-20T20:49:14.419Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: '62635e7a-c97c-45e6-a1f1-46bd1873f2ff', user_id: 'd56dc2bf-f31f-47f2-881c-2a56bf67fdff', source: null, completed_at: '2026-01-20T20:51:02.737Z', parent_run_id: null, focus_area: 'monetization', competitor_count: 0 },
  { id: 'b774d744-200d-4028-9d67-27cbb65cb6e7', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-20T23:08:40.312Z', parent_run_id: null, focus_area: 'monetization', competitor_count: 0 },
  { id: '1606cb24-15f2-4f17-8661-a33fb769490f', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-20T23:37:56.954Z', parent_run_id: null, focus_area: 'monetization', competitor_count: 0 },
  { id: '102f8ed9-71cc-4243-a214-fecfe670c5a1', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-21T00:49:14.21Z', parent_run_id: '1606cb24-15f2-4f17-8661-a33fb769490f', focus_area: 'monetization', competitor_count: 0 },
  { id: '22361e7d-df7f-4f0f-86f7-f0f610cc7897', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-21T01:24:26.595Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: '32426e07-4681-4ad7-b254-3503c293300c', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-21T01:28:25.952Z', parent_run_id: '22361e7d-df7f-4f0f-86f7-f0f610cc7897', focus_area: 'acquisition', competitor_count: 0 },
  { id: '711d8f4d-bbdb-448a-864f-a6541edc5e00', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: null, completed_at: '2026-01-21T03:38:47.182Z', parent_run_id: null, focus_area: 'retention', competitor_count: 0 },
  { id: 'b4cfb8e1-c8db-4620-b507-85ea610f4265', user_id: 'b8d3c532-1370-40ed-9842-0fef1baa36fc', source: null, completed_at: '2026-01-21T12:23:05.048Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: 'b22749de-d3b7-4b81-b57f-d7508bbfe4b6', user_id: 'b8d3c532-1370-40ed-9842-0fef1baa36fc', source: null, completed_at: '2026-01-21T12:23:15.229Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: '2905eedb-1c37-4c00-a1c5-35874dac60a7', user_id: 'b8d3c532-1370-40ed-9842-0fef1baa36fc', source: null, completed_at: '2026-01-21T12:25:58.827Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: '8049f3f9-029a-4d32-91c6-f0c2f224dfc6', user_id: 'b8d3c532-1370-40ed-9842-0fef1baa36fc', source: null, completed_at: '2026-01-21T12:42:35.25Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
  { id: 'd73ed8a5-2b69-4fa4-877f-d6f4f7a787c3', user_id: 'b8d3c532-1370-40ed-9842-0fef1baa36fc', source: null, completed_at: '2026-01-21T13:09:26.396Z', parent_run_id: null, focus_area: 'acquisition', competitor_count: 0 },
]

const completedFreeAudits = [
  { id: 'b06f8d8f-c0b0-4b61-9c42-7f3dee05bb93', user_id: null, source: 'organic', completed_at: '2026-01-19T14:16:20.114Z', focus_area: 'activation', competitor_count: 0 },
  { id: '2fc55c6f-4cc4-48ee-91b9-19d2934d212b', user_id: '5d959875-72b5-4bda-af72-1fe1a479c008', source: 'organic', completed_at: '2026-01-20T12:17:01.752Z', focus_area: 'acquisition', competitor_count: 0 },
  { id: '48a5474b-a5d8-4e7a-baf7-5a24c6afced2', user_id: '1bfc09ba-8f54-4ebc-836b-49800aeb5079', source: 'organic', completed_at: '2026-01-20T21:39:49.196Z', focus_area: 'acquisition', competitor_count: 0 },
]

async function backfill() {
  console.log('Starting PostHog backfill...\n')

  // Backfill plan_completed events
  console.log(`Backfilling ${completedRuns.length} plan_completed events...`)
  for (const run of completedRuns) {
    const isRefinement = !!run.parent_run_id
    // Infer source: refinement if has parent, otherwise assume stripe (paid)
    const source = isRefinement ? 'refinement' : (run.source || 'stripe')
    const distinctId = run.user_id || run.id

    posthog.capture({
      distinctId,
      event: 'plan_completed',
      properties: {
        run_id: run.id,
        source,
        focus_area: run.focus_area,
        has_competitors: run.competitor_count > 0,
        is_refinement: isRefinement,
        $set: run.user_id ? {
          last_plan_source: source,
          last_plan_at: run.completed_at,
        } : undefined,
      },
      timestamp: new Date(run.completed_at),
    })
    console.log(`  ✓ ${run.id} (${source}, ${run.focus_area})`)
  }

  // Backfill free_audit_completed events
  console.log(`\nBackfilling ${completedFreeAudits.length} free_audit_completed events...`)
  for (const audit of completedFreeAudits) {
    const distinctId = audit.user_id || audit.id

    posthog.capture({
      distinctId,
      event: 'free_audit_completed',
      properties: {
        free_audit_id: audit.id,
        source: audit.source,
        focus_area: audit.focus_area,
        has_competitors: audit.competitor_count > 0,
      },
      timestamp: new Date(audit.completed_at),
    })
    console.log(`  ✓ ${audit.id} (${audit.source}, ${audit.focus_area})`)
  }

  // Flush and shutdown
  console.log('\nFlushing events to PostHog...')
  await posthog.shutdown()

  console.log('\n✅ Backfill complete!')
  console.log(`   - ${completedRuns.length} plan_completed events`)
  console.log(`   - ${completedFreeAudits.length} free_audit_completed events`)
}

backfill().catch(console.error)
