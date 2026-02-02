import { createServiceClient } from '@/lib/supabase/server'
import { generateStrategyAgentic, generateAgenticRefinement, generateFreeAgenticStrategy } from './pipeline-agentic'
import { extractStructuredOutput, extractFreeBriefOutput } from './formatter'
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
import { MAX_CONTEXT_LENGTH, type RunSource } from '@/lib/types/database'
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
  structuredOutput?: import('./formatter-types').FreeBriefOutput | null
  error?: string
  freeAuditId?: string
}

/**
 * Run the free agentic Brief pipeline
 *
 * V3 approach - landing page as lens into strategy:
 * - Screenshot captured upfront, passed as vision input
 * - Sonnet with tools (search + seo) finds real competitors
 * - 3-Second Test, positioning gap, quick wins, competitive landscape, scores
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

  // Capture screenshot + extract page content in parallel
  let screenshotBase64: string | null = null
  let pageContent: string | null = null
  if (input.websiteUrl) {
    const url = input.websiteUrl.startsWith('http') ? input.websiteUrl : `https://${input.websiteUrl}`

    const [ssResult, extractResult] = await Promise.allSettled([
      // Screenshot
      (async () => {
        const ssUrl = process.env.SCREENSHOT_SERVICE_URL
        const ssKey = process.env.SCREENSHOT_API_KEY
        if (!ssUrl || !ssKey) return null
        console.log(`[FreePipeline] Capturing screenshot of ${url}`)
        const ssRes = await fetch(
          `${ssUrl}/screenshot?url=${encodeURIComponent(url)}&width=1280&height=800`,
          { headers: { 'x-api-key': ssKey }, signal: AbortSignal.timeout(20000) }
        )
        if (!ssRes.ok) return null
        const base64 = Buffer.from(await ssRes.arrayBuffer()).toString('base64')
        console.log(`[FreePipeline] Screenshot captured`)
        return base64
      })(),
      // Tavily extract for DOM text (fallback if screenshot blocked)
      (async () => {
        const tavilyKey = process.env.TAVILY_API
        if (!tavilyKey) return null
        console.log(`[FreePipeline] Extracting page content from ${url}`)
        const { tavily } = await import('@tavily/core')
        const tvly = tavily({ apiKey: tavilyKey })
        const result = await tvly.extract([url])
        const raw = result.results?.[0]?.rawContent || ''
        if (!raw) return null
        // Truncate to keep token costs down
        const truncated = raw.length > 4000 ? raw.slice(0, 4000) + '\n[Content truncated]' : raw
        console.log(`[FreePipeline] Page content extracted: ${truncated.length} chars`)
        return truncated
      })(),
    ])

    screenshotBase64 = ssResult.status === 'fulfilled' ? ssResult.value : null
    pageContent = extractResult.status === 'fulfilled' ? extractResult.value : null

    if (ssResult.status === 'rejected') {
      console.warn('[FreePipeline] Screenshot capture failed (non-fatal):', ssResult.reason)
    }
    if (extractResult.status === 'rejected') {
      console.warn('[FreePipeline] Page extract failed (non-fatal):', extractResult.reason)
    }
  }

  // Run agentic generation with Sonnet + tools (search, seo)
  try {
    console.log(`[FreePipeline] Starting agentic generation for ${freeAuditId}`)
    const agenticResult = await generateFreeAgenticStrategy(input, screenshotBase64, freeAuditId, pageContent)

    if (!agenticResult.success || !agenticResult.output) {
      throw new Error(agenticResult.error || 'Agentic generation returned no output')
    }

    const output = agenticResult.output
    console.log(`[FreePipeline] Agentic generation complete: ${output.length} chars, ${agenticResult.toolCalls?.length || 0} tool calls`)

    // Extract structured output using dedicated free brief schema
    let structuredOutput: import('./formatter-types').FreeBriefOutput | null = null
    try {
      console.log(`[FreePipeline] Extracting free brief structured output`)
      structuredOutput = await extractFreeBriefOutput(output, agenticResult.researchData)
      console.log(
        `[FreePipeline] Free brief output extracted: briefScores=${!!structuredOutput?.briefScores}, positioning=${!!structuredOutput?.positioning}, discoveries=${structuredOutput?.discoveries?.length || 0}`
      )
    } catch (extractErr) {
      console.warn('[FreePipeline] Free brief extraction failed (non-fatal):', extractErr)
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
