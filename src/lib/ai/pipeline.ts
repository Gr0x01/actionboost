import { createServiceClient } from '@/lib/supabase/server'
import { runResearch } from './research'
import { generateStrategy } from './generate'
import { accumulateUserContext } from '@/lib/context/accumulate'
import type { RunInput, PipelineResult, ResearchContext } from './types'

// Validate critical env vars at module load
const REQUIRED_ENV_VARS = ['ANTHROPIC_API_KEY', 'TAVILY_API'] as const

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Run the full AI pipeline for a given run ID
 *
 * Flow:
 * 1. Fetch run from DB
 * 2. Update status → "processing"
 * 3. Run research (graceful degradation on failure)
 * 4. Generate strategy with Claude
 * 5. Save output, status → "complete"
 * 6. On Claude error: status → "failed"
 */
export async function runPipeline(runId: string): Promise<PipelineResult> {
  // Fail fast if env vars are missing
  validateEnv()

  const supabase = createServiceClient()

  // 1. Fetch run from DB
  const { data: run, error: fetchError } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (fetchError || !run) {
    return { success: false, error: `Run not found: ${fetchError?.message || 'No data'}` }
  }

  // 2. Update status to processing
  await supabase.from('runs').update({ status: 'processing' }).eq('id', runId)

  const input = run.input as RunInput
  let research: ResearchContext

  // 3. Run research (with graceful degradation)
  try {
    console.log(`[Pipeline] Starting research for run ${runId}`)
    research = await runResearch(input)
    console.log(
      `[Pipeline] Research completed: ${research.competitorInsights.length} competitor insights, ${research.marketTrends.length} trends, ${research.seoMetrics.length} SEO metrics`
    )

    if (research.errors.length) {
      console.log(`[Pipeline] Research warnings: ${research.errors.join('; ')}`)
    }
  } catch (err) {
    // Research completely failed - proceed with empty context
    console.error('[Pipeline] Research failed entirely:', err)
    research = {
      competitorInsights: [],
      marketTrends: [],
      growthTactics: [],
      seoMetrics: [],
      researchCompletedAt: new Date().toISOString(),
      errors: [`Research failed: ${err instanceof Error ? err.message : String(err)}`],
    }
  }

  // 4. Generate strategy with Claude
  try {
    console.log(`[Pipeline] Starting strategy generation with Claude Opus 4.5`)
    const output = await generateStrategy(input, research)
    console.log(`[Pipeline] Strategy generated: ${output.length} characters`)

    // 5. Save output and mark complete
    const { error: updateError } = await supabase
      .from('runs')
      .update({
        status: 'complete',
        output,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)

    if (updateError) {
      console.error('[Pipeline] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    // Accumulate user context for multi-run support (fire-and-forget)
    if (run.user_id) {
      accumulateUserContext(run.user_id, runId, input, output).catch((err) => {
        console.error('[Pipeline] Context accumulation failed:', err)
      })
    }

    console.log(`[Pipeline] Run ${runId} completed successfully`)
    return { success: true, output, researchContext: research }
  } catch (err) {
    // Claude failed - mark as failed
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[Pipeline] Strategy generation failed:', errorMsg)

    await supabase.from('runs').update({ status: 'failed' }).eq('id', runId)

    return { success: false, error: `Generation failed: ${errorMsg}` }
  }
}
