/**
 * Context accumulation logic for multi-run business profiles
 *
 * After each run completes, we:
 * 1. Merge run input into businesses.context JSONB (product replaces, history appends)
 * 2. Create embeddings for vector search (via embeddings module)
 *
 * Merge rules:
 * - Product description: Replace with latest
 * - Website URL: Replace with latest (if provided)
 * - Competitors: Merge arrays, deduplicate
 * - Traction: Append to history (keep last 10 snapshots)
 * - Tactics & results: Append to history array (combined field)
 * - Constraints: Replace with latest (if provided)
 *
 * Context is now scoped to BUSINESSES, not users.
 * Each user can have multiple businesses, each with their own context.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { extractAndEmbedRunContext } from '@/lib/ai/embeddings'
import { getOrCreateDefaultBusiness, updateBusinessName } from '@/lib/business'
import type { RunInput } from '@/lib/ai/types'
import type { UserContext, ContextDelta, TractionSnapshot } from '@/lib/types/context'

const MAX_TRACTION_HISTORY = 10
const MAX_TACTICS = 50

/**
 * Extract tactics from RunInput, supporting both new and legacy fields
 */
function getTacticsFromInput(input: RunInput): string[] {
  // New field takes priority
  if (input.tacticsAndResults) {
    return [input.tacticsAndResults]
  }
  // Legacy: combine whatYouTried and whatsWorking
  const parts = [input.whatYouTried, input.whatsWorking].filter(Boolean)
  return parts.length > 0 ? [parts.join(' | ')] : []
}

/**
 * Accumulate business context after a run completes
 * Called from the pipeline after successful generation
 *
 * @param businessId - The business to accumulate context for
 * @param userId - The user who owns the business (for embeddings)
 * @param runId - The run that just completed
 * @param input - The run input
 * @param output - The generated strategy output
 */
export async function accumulateBusinessContext(
  businessId: string,
  userId: string,
  runId: string,
  input: RunInput,
  output: string
): Promise<UserContext> {
  const supabase = createServiceClient()

  // 1. Fetch existing business context
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('context')
    .eq('id', businessId)
    .single()

  if (fetchError) {
    console.error('[Context] Failed to fetch business context:', fetchError)
    throw new Error(`Failed to fetch business: ${fetchError.message}`)
  }

  const existingContext = (business?.context as UserContext) || {}

  // 2. Merge run input into context
  const updatedContext = mergeRunIntoContext(existingContext, input, runId)

  // 3. Save updated context to business (cast to Json type for Supabase)
  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      context: JSON.parse(JSON.stringify(updatedContext)),
      context_updated_at: new Date().toISOString(),
    })
    .eq('id', businessId)

  if (updateError) {
    console.error('[Context] Failed to save business context:', updateError)
    throw new Error(`Failed to save context: ${updateError.message}`)
  }

  console.log(`[Context] Updated context for business ${businessId} (run ${runId})`)

  // 4. Update business name if still default
  updateBusinessName(businessId, input.productDescription).catch((err) => {
    console.error('[Context] Business name update failed:', err)
  })

  // 5. Create embeddings with business scope (fire-and-forget, don't block on this)
  extractAndEmbedRunContext(runId, userId, businessId, input, output).catch((err) => {
    console.error('[Context] Embedding extraction failed:', err)
  })

  return updatedContext
}

/**
 * Accumulate user context after a run completes (backwards-compatible wrapper)
 * Delegates to business-scoped accumulation
 *
 * @deprecated Use accumulateBusinessContext directly when business_id is available
 */
export async function accumulateUserContext(
  userId: string,
  runId: string,
  input: RunInput,
  output: string,
  businessId?: string
): Promise<UserContext> {
  const supabase = createServiceClient()

  // Get or create a business for this user
  const resolvedBusinessId = businessId || await getOrCreateDefaultBusiness(userId, input)

  // Link run to business if not already linked
  if (!businessId) {
    await supabase.from('runs').update({ business_id: resolvedBusinessId }).eq('id', runId)
  }

  // Delegate to business-scoped accumulation
  return accumulateBusinessContext(resolvedBusinessId, userId, runId, input, output)
}

/**
 * Merge run input into existing context
 */
function mergeRunIntoContext(
  existing: UserContext,
  input: RunInput,
  runId: string
): UserContext {
  const today = new Date().toISOString().split('T')[0]

  return {
    // Product: Always use latest
    product: {
      description: input.productDescription,
      websiteUrl: input.websiteUrl || existing.product?.websiteUrl,
      competitors: mergeCompetitors(
        existing.product?.competitors,
        input.competitorUrls
      ),
    },

    // Traction: Append to history
    traction: {
      latest: input.currentTraction,
      history: appendTractionSnapshot(
        existing.traction?.history,
        {
          date: today,
          summary: input.currentTraction,
        }
      ),
    },

    // Tactics: Accumulate over time (new: tacticsAndResults, legacy: whatYouTried + whatsWorking)
    tactics: {
      history: mergeStringArray(
        existing.tactics?.history || existing.tactics?.tried, // Migrate from legacy tried array
        getTacticsFromInput(input)
      ),
      // Keep legacy fields for backwards compatibility with old context data
      tried: existing.tactics?.tried,
      working: existing.tactics?.working,
      notWorking: existing.tactics?.notWorking,
    },

    // Constraints: Replace if provided
    constraints: input.constraints || existing.constraints,

    // Metadata
    lastRunId: runId,
    totalRuns: (existing.totalRuns || 0) + 1,
  }
}

/**
 * Apply a delta update to existing context (for conversational updates)
 */
export function mergeContextDelta(
  existing: UserContext,
  delta: ContextDelta
): UserContext {
  const today = new Date().toISOString().split('T')[0]

  return {
    // Product: Merge if provided
    product: delta.product
      ? {
          description: delta.product.description || existing.product?.description || '',
          websiteUrl: delta.product.websiteUrl || existing.product?.websiteUrl,
          competitors: mergeCompetitors(
            existing.product?.competitors,
            delta.product.competitors
          ),
        }
      : existing.product,

    // Traction: Append delta if provided
    traction: delta.tractionDelta
      ? {
          latest: delta.tractionDelta,
          history: appendTractionSnapshot(
            existing.traction?.history,
            {
              date: today,
              summary: delta.tractionDelta,
            }
          ),
        }
      : existing.traction,

    // Tactics: Merge new tactics (with limits to prevent unbounded growth)
    tactics: {
      history: delta.tacticsUpdate
        ? mergeStringArray(existing.tactics?.history, [delta.tacticsUpdate])
        : delta.newTactics // Legacy support
          ? mergeStringArray(existing.tactics?.history || existing.tactics?.tried, delta.newTactics)
          : existing.tactics?.history || [],
      // Keep legacy fields for backwards compatibility
      tried: existing.tactics?.tried,
      working: delta.workingUpdate
        ? [...(existing.tactics?.working || []), delta.workingUpdate].slice(-MAX_TACTICS)
        : existing.tactics?.working,
      notWorking: delta.notWorkingUpdate
        ? [...(existing.tactics?.notWorking || []), delta.notWorkingUpdate].slice(-MAX_TACTICS)
        : existing.tactics?.notWorking,
    },

    // Constraints: Replace if provided
    constraints: delta.constraints || existing.constraints,

    // Metadata
    lastRunId: existing.lastRunId,
    totalRuns: delta.incrementRuns
      ? (existing.totalRuns || 0) + 1
      : existing.totalRuns,
  }
}

/**
 * Apply a context delta update to a business's stored context
 * Used by run creation routes to merge "what's new" from returning users
 *
 * @returns { success: true } or { success: false, error: string }
 */
export async function applyContextDeltaToBusiness(
  businessId: string,
  contextDelta: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { data: businessData, error: fetchError } = await supabase
    .from('businesses')
    .select('context')
    .eq('id', businessId)
    .single()

  if (fetchError) {
    return { success: false, error: `Failed to fetch business context: ${fetchError.message}` }
  }

  const existingContext = (businessData?.context as UserContext) || {}

  // Merge contextDelta as a traction update (what's new since last time)
  const delta: ContextDelta = { tractionDelta: contextDelta }
  const updatedContext = mergeContextDelta(existingContext, delta)

  // JSON.parse(JSON.stringify(...)) ensures the object is plain JSON for Supabase JSONB
  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      context: JSON.parse(JSON.stringify(updatedContext)),
      context_updated_at: new Date().toISOString(),
    })
    .eq('id', businessId)

  if (updateError) {
    return { success: false, error: `Failed to update business context: ${updateError.message}` }
  }

  return { success: true }
}

/**
 * Apply a context delta update to a user's stored context
 * @deprecated Use applyContextDeltaToBusiness when business_id is available
 */
export async function applyContextDeltaToUser(
  userId: string,
  contextDelta: string,
  businessId?: string
): Promise<{ success: boolean; error?: string }> {
  // If business ID provided, apply to business
  if (businessId) {
    return applyContextDeltaToBusiness(businessId, contextDelta)
  }

  // Fallback: get default business and apply there
  try {
    const resolvedBusinessId = await getOrCreateDefaultBusiness(userId)
    return applyContextDeltaToBusiness(resolvedBusinessId, contextDelta)
  } catch (err) {
    return { success: false, error: `Failed to resolve business: ${err instanceof Error ? err.message : String(err)}` }
  }
}

/**
 * Merge and deduplicate competitor arrays
 */
function mergeCompetitors(
  existing: string[] | undefined,
  newCompetitors: string[] | undefined
): string[] {
  const all = [
    ...(existing || []),
    ...(newCompetitors || []).filter(Boolean),
  ]

  // Deduplicate by domain, keep latest version
  const seen = new Map<string, string>()
  for (const url of all) {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '')
      seen.set(domain, url)
    } catch {
      // Invalid URL, skip
    }
  }

  return Array.from(seen.values()).slice(0, 10) // Max 10 competitors
}

/**
 * Append traction snapshot to history, avoiding duplicates on same day
 */
function appendTractionSnapshot(
  history: TractionSnapshot[] | undefined,
  snapshot: TractionSnapshot
): TractionSnapshot[] {
  const existing = history || []

  // If we already have a snapshot for today, replace it
  const filtered = existing.filter((s) => s.date !== snapshot.date)

  return [...filtered, snapshot].slice(-MAX_TRACTION_HISTORY)
}

/**
 * Merge string arrays with deduplication
 */
function mergeStringArray(
  existing: string[] | undefined,
  newItems: string[] | undefined
): string[] {
  if (!newItems || newItems.length === 0) {
    return existing || []
  }

  const all = [...(existing || []), ...newItems]

  // Simple deduplication - exact match
  const unique = [...new Set(all)]

  return unique.slice(-MAX_TACTICS)
}

/**
 * Get summary of context for display (e.g., "Welcome back" panel)
 */
export function getContextSummary(context: UserContext): {
  productName: string
  lastTraction: string | null
  totalRuns: number
  lastRunDate: string | null
} {
  const lastSnapshot = context.traction?.history?.slice(-1)[0]

  return {
    productName: context.product?.description?.slice(0, 100) || 'Your product',
    lastTraction: context.traction?.latest || null,
    totalRuns: context.totalRuns || 0,
    lastRunDate: lastSnapshot?.date || null,
  }
}
