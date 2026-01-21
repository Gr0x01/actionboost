import { createServiceClient } from '@/lib/supabase/server'
import { runResearch, runTavilyOnlyResearch } from './research'
import { generateStrategy, generateMiniStrategy, generateRefinedStrategy } from './generate'
import { accumulateUserContext } from '@/lib/context/accumulate'
import { searchUserContext } from './embeddings'
import {
  sendRunReadyEmail,
  sendRunFailedEmail,
  sendFreeAuditUpsellEmail,
} from '@/lib/email/resend'
import type { RunInput, PipelineResult, ResearchContext, UserHistoryContext } from './types'
import type { UserContext } from '@/lib/types/context'
import { MAX_CONTEXT_LENGTH } from '@/lib/types/database'

// Validate critical env vars at module load
const REQUIRED_ENV_VARS = ['ANTHROPIC_API_KEY', 'TAVILY_API'] as const

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Get user email from user_id for sending transactional emails
 */
async function getEmailForUser(userId: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('users').select('email').eq('id', userId).single()
  return data?.email || null
}

/**
 * Retrieve user history context for RAG
 * Combines stored context with vector search for relevant past chunks
 */
async function retrieveUserHistory(
  userId: string,
  input: RunInput
): Promise<UserHistoryContext | null> {
  const supabase = createServiceClient()

  // 1. Fetch existing user context
  const { data: user, error } = await supabase
    .from('users')
    .select('context')
    .eq('id', userId)
    .single()

  if (error || !user?.context) {
    console.log(`[Pipeline] No existing context for user ${userId}`)
    return null
  }

  const context = user.context as UserContext

  // Skip if this is user's first run
  if (!context.totalRuns || context.totalRuns === 0) {
    return null
  }

  // 2. Build search query from current input
  const searchQuery = `${input.focusArea || ''} ${(input.productDescription || '').slice(0, 200)}`

  // 3. Search for relevant past recommendations and insights
  const [recommendations, insights] = await Promise.all([
    searchUserContext(userId, searchQuery, { chunkTypes: ['recommendation'], limit: 5 }),
    searchUserContext(userId, searchQuery, { chunkTypes: ['insight'], limit: 3 }),
  ])

  // 4. Build structured history context
  const history: UserHistoryContext = {
    totalRuns: context.totalRuns,
    previousTraction: context.traction?.history?.slice(-5) || [],
    tacticsTried: context.tactics?.tried?.slice(-10) || [],
    pastRecommendations: recommendations.map(r => r.content),
    pastInsights: insights.map(i => i.content),
  }

  console.log(
    `[Pipeline] Retrieved user history: ${history.totalRuns} runs, ${history.pastRecommendations.length} recommendations, ${history.pastInsights.length} insights`
  )

  return history
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

  // 4. Retrieve user history for RAG (if returning user)
  let userHistory: UserHistoryContext | null = null
  if (run.user_id) {
    try {
      userHistory = await retrieveUserHistory(run.user_id, input)
    } catch (err) {
      console.error('[Pipeline] User history retrieval failed:', err)
      // Continue without history - graceful degradation
    }
  }

  // 5. Generate strategy with Claude
  try {
    console.log(`[Pipeline] Starting strategy generation with Claude Opus 4.5`)
    const output = await generateStrategy(input, research, userHistory)
    console.log(`[Pipeline] Strategy generated: ${output.length} characters`)

    // 6. Save output and mark complete
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

      // Send "run ready" email (fire-and-forget)
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunReadyEmail({ to: email, runId })
        })
        .catch((err) => console.error('[Pipeline] Run ready email failed:', err))
    }

    console.log(`[Pipeline] Run ${runId} completed successfully`)
    return { success: true, output, researchContext: research }
  } catch (err) {
    // Claude failed - mark as failed
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[Pipeline] Strategy generation failed:', errorMsg)

    await supabase.from('runs').update({ status: 'failed' }).eq('id', runId)

    // Send "run failed" email (fire-and-forget)
    if (run.user_id) {
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunFailedEmail({ to: email, runId })
        })
        .catch((emailErr) => console.error('[Pipeline] Run failed email failed:', emailErr))
    }

    return { success: false, error: `Generation failed: ${errorMsg}` }
  }
}

// =============================================================================
// FREE PIPELINE (Mini audit with Sonnet + Tavily only)
// =============================================================================

export type FreePipelineResult = {
  success: boolean
  output?: string
  error?: string
  freeAuditId?: string
}

/**
 * Run the free mini-audit pipeline
 *
 * Differences from full pipeline:
 * - Uses Sonnet instead of Opus
 * - Tavily research only (no DataForSEO)
 * - No RAG/user history
 * - Stores in free_audits table (not runs)
 * - 5 sections instead of 8
 */
export async function runFreePipeline(
  freeAuditId: string,
  input: RunInput
): Promise<FreePipelineResult> {
  validateEnv()

  const supabase = createServiceClient()

  // Update status to processing
  await supabase.from('free_audits').update({ status: 'processing' }).eq('id', freeAuditId)

  let research: ResearchContext

  // Run Tavily-only research (no DataForSEO)
  try {
    console.log(`[FreePipeline] Starting Tavily research for ${freeAuditId}`)
    research = await runTavilyOnlyResearch(input)
    console.log(
      `[FreePipeline] Research completed: ${research.competitorInsights.length} competitor insights, ${research.marketTrends.length} trends`
    )
  } catch (err) {
    console.error('[FreePipeline] Research failed:', err)
    research = {
      competitorInsights: [],
      marketTrends: [],
      growthTactics: [],
      seoMetrics: [],
      researchCompletedAt: new Date().toISOString(),
      errors: [`Research failed: ${err instanceof Error ? err.message : String(err)}`],
    }
  }

  // Generate mini strategy with Sonnet
  try {
    console.log(`[FreePipeline] Generating mini strategy with Sonnet`)
    const output = await generateMiniStrategy(input, research)
    console.log(`[FreePipeline] Strategy generated: ${output.length} characters`)

    // Save output and mark complete
    const { error: updateError } = await supabase
      .from('free_audits')
      .update({
        status: 'complete',
        output,
        completed_at: new Date().toISOString(),
      })
      .eq('id', freeAuditId)

    if (updateError) {
      console.error('[FreePipeline] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    // Send upsell email (fire-and-forget)
    // Email is stored directly on free_audits table
    ;(async () => {
      try {
        const { data: audit } = await supabase
          .from('free_audits')
          .select('email')
          .eq('id', freeAuditId)
          .single()
        if (audit?.email) {
          await sendFreeAuditUpsellEmail({ to: audit.email, freeAuditId })
        }
      } catch (err) {
        console.error('[FreePipeline] Upsell email failed:', err)
      }
    })()

    console.log(`[FreePipeline] Free audit ${freeAuditId} completed successfully`)
    return { success: true, output, freeAuditId }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[FreePipeline] Generation failed:', errorMsg)

    await supabase.from('free_audits').update({ status: 'failed' }).eq('id', freeAuditId)

    return { success: false, error: `Generation failed: ${errorMsg}` }
  }
}

// =============================================================================
// REFINEMENT PIPELINE (User provides additional context after seeing results)
// =============================================================================

export type RefinementPipelineResult = {
  success: boolean
  output?: string
  error?: string
}

/**
 * Run the refinement pipeline for a run with additional context
 *
 * This is similar to the main pipeline but:
 * - Fetches the parent run to get the original output
 * - Passes additional context to Claude
 * - Uses the refinement-specific prompt
 */
export async function runRefinementPipeline(runId: string): Promise<RefinementPipelineResult> {
  validateEnv()

  const supabase = createServiceClient()

  // 1. Fetch the refinement run
  const { data: run, error: fetchError } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (fetchError || !run) {
    return { success: false, error: `Run not found: ${fetchError?.message || 'No data'}` }
  }

  // 2. Fetch the parent run to get original output
  if (!run.parent_run_id) {
    return { success: false, error: 'Refinement run has no parent_run_id' }
  }

  const { data: parentRun, error: parentError } = await supabase
    .from('runs')
    .select('output, user_id')
    .eq('id', run.parent_run_id)
    .single()

  if (parentError || !parentRun?.output) {
    return { success: false, error: `Parent run not found or has no output: ${parentError?.message || 'No data'}` }
  }

  // Defense-in-depth: Verify parent run belongs to same user
  if (parentRun.user_id !== run.user_id) {
    console.error(`[RefinementPipeline] Ownership mismatch: run ${runId} user ${run.user_id} vs parent user ${parentRun.user_id}`)
    return { success: false, error: 'Parent run ownership mismatch' }
  }

  // 3. Update status to processing
  const { error: statusError } = await supabase.from('runs').update({ status: 'processing' }).eq('id', runId)
  if (statusError) {
    console.error('[RefinementPipeline] Failed to update status to processing:', statusError)
    // Continue anyway - the run will still process
  }

  const input = run.input as RunInput
  // Defensive validation - limit context even if DB was modified directly
  const additionalContext = (run.additional_context || '').slice(0, MAX_CONTEXT_LENGTH)
  let research: ResearchContext

  // 4. Run research (with graceful degradation)
  try {
    console.log(`[RefinementPipeline] Starting research for run ${runId}`)
    research = await runResearch(input)
    console.log(
      `[RefinementPipeline] Research completed: ${research.competitorInsights.length} competitor insights, ${research.marketTrends.length} trends`
    )
  } catch (err) {
    console.error('[RefinementPipeline] Research failed entirely:', err)
    research = {
      competitorInsights: [],
      marketTrends: [],
      growthTactics: [],
      seoMetrics: [],
      researchCompletedAt: new Date().toISOString(),
      errors: [`Research failed: ${err instanceof Error ? err.message : String(err)}`],
    }
  }

  // 5. Retrieve user history for RAG (if returning user)
  let userHistory: UserHistoryContext | null = null
  if (run.user_id) {
    try {
      userHistory = await retrieveUserHistory(run.user_id, input)
    } catch (err) {
      console.error('[RefinementPipeline] User history retrieval failed:', err)
    }
  }

  // 6. Generate refined strategy with Claude
  try {
    console.log(`[RefinementPipeline] Starting refined strategy generation with Claude Opus 4.5`)
    const output = await generateRefinedStrategy(input, research, additionalContext, parentRun.output, userHistory)
    console.log(`[RefinementPipeline] Refined strategy generated: ${output.length} characters`)

    // 7. Save output and mark complete
    const { error: updateError } = await supabase
      .from('runs')
      .update({
        status: 'complete',
        output,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)

    if (updateError) {
      console.error('[RefinementPipeline] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    // Send "run ready" email (fire-and-forget)
    if (run.user_id) {
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunReadyEmail({ to: email, runId })
        })
        .catch((err) => console.error('[RefinementPipeline] Run ready email failed:', err))
    }

    console.log(`[RefinementPipeline] Refinement ${runId} completed successfully`)
    return { success: true, output }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[RefinementPipeline] Strategy generation failed:', errorMsg)

    await supabase.from('runs').update({ status: 'failed' }).eq('id', runId)

    // Send "run failed" email (fire-and-forget)
    if (run.user_id) {
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunFailedEmail({ to: email, runId })
        })
        .catch((emailErr) => console.error('[RefinementPipeline] Run failed email failed:', emailErr))
    }

    return { success: false, error: `Generation failed: ${errorMsg}` }
  }
}
