import { createServiceClient } from '@/lib/supabase/server'
import { runResearch, runTavilyOnlyResearch } from './research'
import { generateStrategy, generatePositioningPreview } from './generate'
import { generateStrategyAgentic, generateAgenticRefinement, type ResearchData } from './pipeline-agentic'
import { extractStructuredOutput } from './formatter'
import { tavily } from '@tavily/core'
import { accumulateBusinessContext, accumulateUserContext } from '@/lib/context/accumulate'
import { getOrCreateDefaultBusiness } from '@/lib/business'
import { searchUserContext } from './embeddings'
import {
  sendRunReadyEmail,
  sendRunFailedEmail,
  sendFreeAuditUpsellEmail,
  sendAbandonedCheckoutEmail,
} from '@/lib/email/resend'
import { trackServerEvent, identifyUser } from '@/lib/analytics'
import type { RunInput, PipelineResult, ResearchContext, UserHistoryContext } from './types'
import type { UserContext } from '@/lib/types/context'
import { MAX_CONTEXT_LENGTH, type PipelineStage, type RunSource } from '@/lib/types/database'
import { addDays, format } from 'date-fns'

// Validate critical env vars at module load
const REQUIRED_ENV_VARS = ['ANTHROPIC_API_KEY', 'TAVILY_API'] as const

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Feature flag for agentic pipeline

/**
 * Get user email from user_id for sending transactional emails
 */
async function getEmailForUser(userId: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('users').select('email').eq('id', userId).single()
  return data?.email || null
}

/**
 * Update PostHog user properties with plan counts
 * Tracks: total_plans, paid_plans, free_plans, promo_plans
 */
async function updateUserPlanCounts(userId: string, latestSource: RunSource): Promise<void> {
  const supabase = createServiceClient()

  // Get user email for identification
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  if (!user?.email) return

  // Count runs by source
  const { data: runs } = await supabase
    .from('runs')
    .select('source')
    .eq('user_id', userId)
    .eq('status', 'complete')

  if (!runs) return

  const counts = {
    total_plans: runs.length,
    paid_plans: runs.filter(r => r.source === 'stripe').length,
    credit_plans: runs.filter(r => r.source === 'credits').length,
    promo_plans: runs.filter(r => r.source === 'promo').length,
    refinement_plans: runs.filter(r => r.source === 'refinement').length,
  }

  // Update user properties in PostHog
  identifyUser(userId, user.email, {
    ...counts,
    last_plan_source: latestSource,
    last_plan_at: new Date().toISOString(),
  })
}

/**
 * Update the pipeline stage for progress display
 */
async function updateStage(runId: string, stage: PipelineStage): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('runs').update({ stage }).eq('id', runId)
  if (error) {
    console.warn(`[Pipeline] Failed to update stage to ${stage} for run ${runId}:`, error.message)
  }
}

/**
 * Retrieve business history context for RAG
 * Combines stored context with vector search for relevant past chunks
 * Scoped to a specific business, not the entire user
 */
async function retrieveBusinessHistory(
  userId: string,
  businessId: string,
  input: RunInput
): Promise<UserHistoryContext | null> {
  const supabase = createServiceClient()

  // 1. Fetch existing business context
  const { data: business, error } = await supabase
    .from('businesses')
    .select('context')
    .eq('id', businessId)
    .single()

  if (error || !business?.context) {
    console.log(`[Pipeline] No existing context for business ${businessId}`)
    return null
  }

  const context = business.context as UserContext

  // Skip if this is business's first run
  if (!context.totalRuns || context.totalRuns === 0) {
    return null
  }

  // 2. Build search query from current input
  const searchQuery = `${input.focusArea || ''} ${(input.productDescription || '').slice(0, 200)}`

  // 3. Search for relevant past recommendations and insights - SCOPED TO BUSINESS
  const [recommendations, insights] = await Promise.all([
    searchUserContext(userId, searchQuery, { chunkTypes: ['recommendation'], limit: 5, businessId }),
    searchUserContext(userId, searchQuery, { chunkTypes: ['insight'], limit: 5, businessId }),
  ])

  // 4. Build structured history context
  const history: UserHistoryContext = {
    totalRuns: context.totalRuns,
    previousTraction: context.traction?.history?.slice(-5) || [],
    tacticsTried: context.tactics?.history?.slice(-15) || context.tactics?.tried?.slice(-15) || [],
    pastRecommendations: recommendations.map(r => r.content),
    pastInsights: insights.map(i => i.content),
  }

  console.log(
    `[Pipeline] Retrieved business history: ${history.totalRuns} runs, ${history.pastRecommendations.length} recommendations, ${history.pastInsights.length} insights`
  )

  return history
}

/**
 * Retrieve user history context for RAG (backwards-compatible wrapper)
 * @deprecated Use retrieveBusinessHistory when business_id is available
 */
async function retrieveUserHistory(
  userId: string,
  input: RunInput,
  businessId?: string
): Promise<UserHistoryContext | null> {
  // If businessId provided, use business-scoped retrieval
  if (businessId) {
    return retrieveBusinessHistory(userId, businessId, input)
  }

  // Fallback: get default business
  try {
    const resolvedBusinessId = await getOrCreateDefaultBusiness(userId, input)
    return retrieveBusinessHistory(userId, resolvedBusinessId, input)
  } catch (err) {
    console.error('[Pipeline] Failed to resolve business for history retrieval:', err)
    return null
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
  // Always use agentic pipeline (V2)
  console.log(`[Pipeline] Running agentic pipeline for run ${runId}`)
  return runAgenticPipeline(runId)
}

/**
 * LEGACY: Original pipeline (kept for reference, not used)
 */
async function _legacyPipeline(runId: string): Promise<PipelineResult> {
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

  // 2. Update status to processing with initial stage
  await supabase.from('runs').update({ status: 'processing', stage: 'researching' }).eq('id', runId)

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

  // 4. Retrieve business history for RAG (if returning user with business)
  await updateStage(runId, 'loading_history')
  let userHistory: UserHistoryContext | null = null
  const businessId = run.business_id as string | null
  if (run.user_id) {
    try {
      // Use business-scoped history if available, otherwise fallback
      userHistory = await retrieveUserHistory(run.user_id, input, businessId || undefined)
    } catch (err) {
      console.error('[Pipeline] Business history retrieval failed:', err)
      // Continue without history - graceful degradation
    }
  }

  // 5. Generate strategy with Claude
  await updateStage(runId, 'generating')
  try {
    console.log(`[Pipeline] Starting strategy generation with Claude Opus 4.5`)
    const output = await generateStrategy(input, research, userHistory)
    console.log(`[Pipeline] Strategy generated: ${output.length} characters`)

    // 6. Save output and mark complete
    await updateStage(runId, 'finalizing')
    const { error: updateError } = await supabase
      .from('runs')
      .update({
        status: 'complete',
        stage: null,
        output,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)

    if (updateError) {
      console.error('[Pipeline] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    // Accumulate business context for multi-run support (fire-and-forget)
    if (run.user_id) {
      // Use business-scoped accumulation if business_id exists
      if (businessId) {
        accumulateBusinessContext(businessId, run.user_id, runId, input, output).catch((err) => {
          console.error('[Pipeline] Business context accumulation failed:', err)
        })
      } else {
        // Fallback for runs without business_id (will create/assign one)
        accumulateUserContext(run.user_id, runId, input, output).catch((err) => {
          console.error('[Pipeline] Context accumulation failed:', err)
        })
      }

      // Send "run ready" email (fire-and-forget)
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunReadyEmail({ to: email, runId })
        })
        .catch((err) => console.error('[Pipeline] Run ready email failed:', err))
    }

    // Track plan completion with source breakdown (fire-and-forget)
    const source = (run.source as RunSource) || 'stripe'
    const distinctId = run.user_id || runId
    trackServerEvent(distinctId, 'plan_completed', {
      run_id: runId,
      source, // stripe, credits, promo, refinement
      focus_area: input.focusArea,
      has_competitors: (input.competitorUrls?.length || 0) > 0,
      is_refinement: source === 'refinement',
    })

    // Update user properties with plan counts (fire-and-forget)
    if (run.user_id) {
      updateUserPlanCounts(run.user_id, source).catch((err) => {
        console.error('[Pipeline] User plan count update failed:', err)
      })
    }

    console.log(`[Pipeline] Run ${runId} completed successfully`)
    return { success: true, output, researchContext: research }
  } catch (err) {
    // Claude failed - mark as failed
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[Pipeline] Strategy generation failed:', errorMsg)

    await supabase.from('runs').update({ status: 'failed', stage: null }).eq('id', runId)

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
// AGENTIC PIPELINE (Dynamic tool-calling - V2)
// =============================================================================

/**
 * Run the agentic AI pipeline for a given run ID
 *
 * This is the V2 pipeline that uses dynamic tool calling instead of
 * pre-gathered research. The AI decides what data to fetch as it reasons.
 *
 * Flow:
 * 1. Fetch run from DB
 * 2. Update status → "processing"
 * 3. Retrieve user history (for returning users)
 * 4. Generate strategy with Claude + tools (AI fetches data as needed)
 * 5. Save output, status → "complete"
 */
export async function runAgenticPipeline(runId: string): Promise<PipelineResult> {
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
  await supabase.from('runs').update({ status: 'processing', stage: 'Analyzing your situation...' }).eq('id', runId)

  const input = run.input as RunInput

  // Stage update callback - writes to DB for real-time UI updates
  const onStageUpdate = async (stage: string) => {
    await supabase.from('runs').update({ stage }).eq('id', runId)
  }

  // 3. Retrieve business history for RAG (if returning user)
  await onStageUpdate('Loading your history...')
  let userHistory: UserHistoryContext | null = null
  const businessId = run.business_id as string | null
  if (run.user_id) {
    try {
      userHistory = await retrieveUserHistory(run.user_id, input, businessId || undefined)
    } catch (err) {
      console.error('[AgenticPipeline] Business history retrieval failed:', err)
    }
  }

  // 4. Generate strategy with agentic Claude (AI fetches data as needed)
  // If user upgraded from free audit, pass the prior context so Claude builds on it
  const priorContext = run.additional_context as string | null
  if (priorContext) {
    console.log(`[AgenticPipeline] Found prior context (${priorContext.length} chars) - will build on free audit`)
  }

  try {
    console.log(`[AgenticPipeline] Starting agentic generation for run ${runId}`)
    const { output, researchData } = await generateStrategyAgentic(
      input,
      {} as ResearchContext,
      userHistory,
      onStageUpdate,
      runId,
      run.user_id || undefined,
      priorContext
    )
    console.log(`[AgenticPipeline] Strategy generated: ${output.length} characters`)

    // 5. Extract structured output for dashboard UI (fire-and-forget, graceful degradation)
    await onStageUpdate('Preparing your dashboard...')

    // Debug: Log research data before passing to formatter
    console.log(`[AgenticPipeline] Research data for formatter:`, {
      searches: researchData.searches.length,
      seoMetrics: researchData.seoMetrics.length,
      keywordGaps: researchData.keywordGaps.length,
      scrapes: researchData.scrapes.length,
      seoDomainsFound: researchData.seoMetrics.map(s => s.domain),
    })

    let structuredOutput = null
    try {
      structuredOutput = await extractStructuredOutput(output, researchData)
      if (structuredOutput) {
        console.log(`[AgenticPipeline] Structured output extracted successfully`)
      }
    } catch (err) {
      // Don't fail the pipeline if formatter fails
      console.warn('[AgenticPipeline] Structured output extraction failed:', err)
    }

    // 6. Save output and mark complete
    // Set plan_start_date to day after completion for calendar view
    const planStartDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')

    await onStageUpdate('Finalizing your strategy...')
    const { error: updateError } = await supabase
      .from('runs')
      .update({
        status: 'complete',
        stage: null,
        output,
        structured_output: structuredOutput,
        research_data: researchData, // Store raw tool call results for debugging/re-extraction
        completed_at: new Date().toISOString(),
        plan_start_date: planStartDate,
      })
      .eq('id', runId)

    if (updateError) {
      console.error('[AgenticPipeline] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    // Accumulate business context for multi-run support (fire-and-forget)
    if (run.user_id) {
      if (businessId) {
        accumulateBusinessContext(businessId, run.user_id, runId, input, output).catch((err) => {
          console.error('[AgenticPipeline] Business context accumulation failed:', err)
        })
      } else {
        accumulateUserContext(run.user_id, runId, input, output).catch((err) => {
          console.error('[AgenticPipeline] Context accumulation failed:', err)
        })
      }

      // Send "run ready" email (fire-and-forget)
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunReadyEmail({ to: email, runId })
        })
        .catch((err) => console.error('[AgenticPipeline] Run ready email failed:', err))
    }

    // Track plan completion (fire-and-forget)
    const source = (run.source as RunSource) || 'stripe'
    const distinctId = run.user_id || runId
    trackServerEvent(distinctId, 'plan_completed', {
      run_id: runId,
      source,
      focus_area: input.focusArea,
      has_competitors: (input.competitorUrls?.length || 0) > 0,
      pipeline_version: 'agentic',
    })

    // Update user properties with plan counts (fire-and-forget)
    if (run.user_id) {
      updateUserPlanCounts(run.user_id, source).catch((err) => {
        console.error('[AgenticPipeline] User plan count update failed:', err)
      })
    }

    console.log(`[AgenticPipeline] Run ${runId} completed successfully`)
    return { success: true, output }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[AgenticPipeline] Strategy generation failed:', errorMsg)

    await supabase.from('runs').update({ status: 'failed', stage: null }).eq('id', runId)

    // Send "run failed" email (fire-and-forget)
    if (run.user_id) {
      getEmailForUser(run.user_id)
        .then((email) => {
          if (email) sendRunFailedEmail({ to: email, runId })
        })
        .catch((emailErr) => console.error('[AgenticPipeline] Run failed email failed:', emailErr))
    }

    return { success: false, error: `Generation failed: ${errorMsg}` }
  }
}

// =============================================================================
// FREE PIPELINE (Positioning Preview - focused on positioning + discoveries)
// =============================================================================

export type FreePipelineResult = {
  success: boolean
  output?: string
  structuredOutput?: import('./formatter-types').StructuredOutput | null
  error?: string
  freeAuditId?: string
}

/**
 * Run the free positioning preview pipeline
 *
 * V2 approach - focused on proving "we understand YOUR business":
 * - Positioning analysis (verdict, unique value, target segment)
 * - 1-2 key discoveries from research
 * - Tavily research only (no DataForSEO) for cost efficiency
 * - Extracts structured output for dashboard-style rendering
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

  // Generate positioning preview (focused prompt for positioning + discoveries)
  // Default model is Sonnet for cost efficiency - see generate.ts FREE_AUDIT_MODEL
  try {
    console.log(`[FreePipeline] Generating positioning preview`)
    const output = await generatePositioningPreview(input, research)
    console.log(`[FreePipeline] Preview generated: ${output.length} characters`)

    // Extract structured output for dashboard rendering
    let structuredOutput: import('./formatter-types').StructuredOutput | null = null
    try {
      console.log(`[FreePipeline] Extracting structured output`)
      structuredOutput = await extractStructuredOutput(output)
      console.log(
        `[FreePipeline] Structured output extracted: positioning=${!!structuredOutput?.positioning}, discoveries=${structuredOutput?.discoveries?.length || 0}`
      )
    } catch (extractErr) {
      console.warn('[FreePipeline] Structured output extraction failed (non-fatal):', extractErr)
      // Continue without structured output - will fall back to markdown
    }

    // Save output and mark complete (including structured_output like main pipeline)
    const { error: updateError } = await supabase
      .from('free_audits')
      .update({
        status: 'complete',
        output,
        structured_output: structuredOutput,
        completed_at: new Date().toISOString(),
      })
      .eq('id', freeAuditId)

    if (updateError) {
      console.error('[FreePipeline] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    // Send appropriate email based on source (fire-and-forget)
    // Email is stored directly on free_audits table
    // Also track completion event
    ;(async () => {
      try {
        const { data: audit } = await supabase
          .from('free_audits')
          .select('email, source, user_id')
          .eq('id', freeAuditId)
          .single()
        if (audit?.email) {
          if (audit.source === 'abandoned_checkout') {
            // Cart abandonment recovery - different messaging
            await sendAbandonedCheckoutEmail({ to: audit.email, freeAuditId })
          } else {
            // Organic free audit - standard upsell
            await sendFreeAuditUpsellEmail({ to: audit.email, freeAuditId })
          }
        }

        // Track free audit completion
        const distinctId = audit?.user_id || freeAuditId
        const source = audit?.source || 'organic'
        trackServerEvent(distinctId, 'free_audit_completed', {
          free_audit_id: freeAuditId,
          source, // organic or abandoned_checkout
          focus_area: input.focusArea,
          has_competitors: (input.competitorUrls?.length || 0) > 0,
        })
      } catch (err) {
        console.error('[FreePipeline] Email/tracking failed:', err)
      }
    })()

    console.log(`[FreePipeline] Free audit ${freeAuditId} completed successfully`)
    return { success: true, output, structuredOutput, freeAuditId }
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
 * Run the agentic refinement pipeline for a run with additional context
 *
 * This is FASTER than the old approach because:
 * - NO upfront research - tools are available but only used if needed
 * - Previous strategy contains all the context Claude needs
 * - Claude decides if/when to fetch new data based on user's feedback
 *
 * Flow:
 * 1. Fetch refinement run + parent run
 * 2. Run agentic refinement (Claude has tools, uses them selectively)
 * 3. Save output
 */
export async function runRefinementPipeline(runId: string): Promise<RefinementPipelineResult> {
  validateEnv()

  const supabase = createServiceClient()

  // Helper to update stage with dynamic messages (for UI display)
  const onStageUpdate = async (stage: string) => {
    const { error } = await supabase.from('runs').update({ stage }).eq('id', runId)
    if (error) {
      console.warn(`[RefinementPipeline] Failed to update stage for run ${runId}:`, error.message)
    }
  }

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
    .select('output, user_id, plan_start_date')
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

  // 3. Update status to processing with initial stage
  await supabase.from('runs').update({ status: 'processing', stage: 'Analyzing your feedback...' }).eq('id', runId)

  const input = run.input as RunInput
  // Defensive validation - limit context even if DB was modified directly
  const additionalContext = (run.additional_context || '').slice(0, MAX_CONTEXT_LENGTH)

  // 4. Run agentic refinement (Claude has tools, uses them only if needed)
  try {
    console.log(`[RefinementPipeline] Starting agentic refinement for run ${runId}`)

    const result = await generateAgenticRefinement(
      input,
      parentRun.output,
      additionalContext,
      onStageUpdate,
      runId,
      run.user_id || undefined
    )

    if (!result.success || !result.output) {
      throw new Error(result.error || 'Agentic refinement failed')
    }

    const toolCallCount = result.toolCalls?.length || 0
    console.log(`[RefinementPipeline] Refinement completed: ${result.output.length} chars, ${toolCallCount} tool calls`)
    console.log(`[RefinementPipeline] Timing: ${result.timing?.total}ms total, ${result.timing?.tools}ms tools`)

    // 5. Extract structured output for dashboard UI (pass research data if tools were called)
    await onStageUpdate('Preparing your dashboard...')
    let structuredOutput = null
    try {
      structuredOutput = await extractStructuredOutput(result.output, result.researchData)
      if (structuredOutput) {
        console.log(`[RefinementPipeline] Structured output extracted successfully`)
      }
    } catch (err) {
      console.warn('[RefinementPipeline] Structured output extraction failed:', err)
    }

    // 6. Save output and mark complete
    // For refinements, inherit plan_start_date from parent or create new one
    const planStartDate = parentRun.plan_start_date || format(addDays(new Date(), 1), 'yyyy-MM-dd')

    await onStageUpdate('Finalizing your refined strategy...')
    const { error: updateError } = await supabase
      .from('runs')
      .update({
        status: 'complete',
        stage: null,
        output: result.output,
        structured_output: structuredOutput,
        research_data: result.researchData,
        completed_at: new Date().toISOString(),
        plan_start_date: planStartDate,
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
    return { success: true, output: result.output }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[RefinementPipeline] Strategy generation failed:', errorMsg)

    await supabase.from('runs').update({ status: 'failed', stage: null }).eq('id', runId)

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
