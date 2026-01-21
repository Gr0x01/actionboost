import { createServiceClient } from '@/lib/supabase/server'
import { runResearch, runTavilyOnlyResearch } from './research'
import { generateStrategy, generateMiniStrategy, generateRefinedStrategy, generateFirstImpressions } from './generate'
import { tavily } from '@tavily/core'
import { accumulateUserContext } from '@/lib/context/accumulate'
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
    searchUserContext(userId, searchQuery, { chunkTypes: ['insight'], limit: 5 }),
  ])

  // 4. Build structured history context
  const history: UserHistoryContext = {
    totalRuns: context.totalRuns,
    previousTraction: context.traction?.history?.slice(-5) || [],
    tacticsTried: context.tactics?.tried?.slice(-15) || [],
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

  // 4. Retrieve user history for RAG (if returning user)
  await updateStage(runId, 'loading_history')
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

  // 3. Update status to processing with initial stage
  const { error: statusError } = await supabase.from('runs').update({ status: 'processing', stage: 'researching' }).eq('id', runId)
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
  await updateStage(runId, 'loading_history')
  let userHistory: UserHistoryContext | null = null
  if (run.user_id) {
    try {
      userHistory = await retrieveUserHistory(run.user_id, input)
    } catch (err) {
      console.error('[RefinementPipeline] User history retrieval failed:', err)
    }
  }

  // 6. Generate refined strategy with Claude
  await updateStage(runId, 'generating')
  try {
    console.log(`[RefinementPipeline] Starting refined strategy generation with Claude Opus 4.5`)
    const output = await generateRefinedStrategy(input, research, additionalContext, parentRun.output, userHistory)
    console.log(`[RefinementPipeline] Refined strategy generated: ${output.length} characters`)

    // 7. Save output and mark complete
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

// =============================================================================
// FIRST IMPRESSIONS PIPELINE (URL-only, lightweight for social posting)
// =============================================================================

export type FirstImpressionsPipelineResult = {
  success: boolean
  output?: string
  error?: string
}

/**
 * Run the first impressions pipeline for URL-only social content
 *
 * Deep research pipeline:
 * - Tavily extract for actual website content
 * - Multiple Tavily searches in parallel for rich context:
 *   - Competitors/market
 *   - Reviews/user feedback
 *   - Social mentions (Twitter/Reddit)
 *   - Recent news/press
 * - Sonnet generates sharp, insightful output
 */
export async function runFirstImpressionsPipeline(
  impressionId: string,
  url: string
): Promise<FirstImpressionsPipelineResult> {
  validateEnv()

  const supabase = createServiceClient()

  // Update status to processing
  await supabase.from('first_impressions').update({ status: 'processing' }).eq('id', impressionId)

  // Extract domain and company name for searches
  let domain: string
  let companyName: string
  try {
    const urlObj = new URL(url)
    domain = urlObj.hostname.replace('www.', '')
    // Get company name from domain (e.g., "inkdex" from "inkdex.io")
    companyName = domain.split('.')[0]
  } catch {
    domain = url
    companyName = url
  }

  const tvly = tavily({ apiKey: process.env.TAVILY_API! })

  // 1. Extract actual website content using Tavily
  let websiteContent = ''
  try {
    console.log(`[FirstImpressions] Extracting content from ${url}`)
    const extractResult = await tvly.extract([url])

    if (extractResult.results?.length && extractResult.results[0].rawContent) {
      websiteContent = extractResult.results[0].rawContent.slice(0, 5000)
      console.log(`[FirstImpressions] Extracted ${websiteContent.length} chars of content`)
    } else {
      console.log(`[FirstImpressions] No content extracted, will use research context`)
    }
  } catch (err) {
    console.error('[FirstImpressions] Tavily extract failed:', err)
  }

  // 2. Run MULTIPLE Tavily searches in parallel for deep context
  console.log(`[FirstImpressions] Running deep research for ${domain}`)

  const searchPromises = [
    // Competitors and market positioning
    tvly.search(`${domain} competitors alternatives market`, {
      searchDepth: 'basic',
      maxResults: 5,
      includeRawContent: false,
    }).catch(() => ({ results: [] })),

    // Reviews and user feedback
    tvly.search(`${companyName} review feedback users`, {
      searchDepth: 'basic',
      maxResults: 5,
      includeRawContent: false,
    }).catch(() => ({ results: [] })),

    // Social mentions - Twitter, Reddit, HN
    tvly.search(`${domain} site:twitter.com OR site:reddit.com OR site:news.ycombinator.com`, {
      searchDepth: 'basic',
      maxResults: 5,
      includeRawContent: false,
    }).catch(() => ({ results: [] })),

    // Recent news and press
    tvly.search(`"${companyName}" startup launch announcement`, {
      searchDepth: 'basic',
      maxResults: 5,
      includeRawContent: false,
    }).catch(() => ({ results: [] })),
  ]

  const [competitorResults, reviewResults, socialResults, newsResults] = await Promise.all(searchPromises)

  // Build rich research context
  const formatResults = (results: { title?: string; content?: string }[], label: string) => {
    if (!results?.length) return ''
    const formatted = results
      .slice(0, 4)
      .map((r) => `- ${r.title}: ${r.content?.slice(0, 250) || ''}`)
      .join('\n')
    return `### ${label}\n${formatted}\n`
  }

  let researchContext = ''
  researchContext += formatResults(competitorResults.results || [], 'Competitors & Market')
  researchContext += formatResults(reviewResults.results || [], 'Reviews & User Feedback')
  researchContext += formatResults(socialResults.results || [], 'Social Mentions')
  researchContext += formatResults(newsResults.results || [], 'News & Press')

  const totalResults = (competitorResults.results?.length || 0) +
    (reviewResults.results?.length || 0) +
    (socialResults.results?.length || 0) +
    (newsResults.results?.length || 0)
  console.log(`[FirstImpressions] Deep research complete: ${totalResults} total results`)

  // Generate first impressions
  try {
    console.log(`[FirstImpressions] Generating output with Sonnet`)
    const output = await generateFirstImpressions(url, websiteContent, researchContext)
    console.log(`[FirstImpressions] Generated: ${output.length} characters`)

    // Save output and mark complete
    const { error: updateError } = await supabase
      .from('first_impressions')
      .update({
        status: 'complete',
        output,
        completed_at: new Date().toISOString(),
      })
      .eq('id', impressionId)

    if (updateError) {
      console.error('[FirstImpressions] Failed to save output:', updateError)
      return { success: false, error: `Failed to save output: ${updateError.message}` }
    }

    console.log(`[FirstImpressions] ${impressionId} completed successfully`)
    return { success: true, output }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[FirstImpressions] Generation failed:', errorMsg)

    await supabase.from('first_impressions').update({ status: 'failed' }).eq('id', impressionId)

    return { success: false, error: `Generation failed: ${errorMsg}` }
  }
}
