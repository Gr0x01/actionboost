/**
 * Context accumulation logic for multi-run user profiles
 *
 * After each run completes, we:
 * 1. Merge run input into users.context JSONB (product replaces, history appends)
 * 2. Create embeddings for vector search (via embeddings module)
 *
 * Merge rules:
 * - Product description: Replace with latest
 * - Website URL: Replace with latest (if provided)
 * - Competitors: Merge arrays, deduplicate
 * - Traction: Append to history (keep last 10 snapshots)
 * - Tactics tried: Append to array (deduplicate)
 * - What's working: Append to array
 * - Constraints: Replace with latest (if provided)
 */

import { createServiceClient } from '@/lib/supabase/server'
import { extractAndEmbedRunContext } from '@/lib/ai/embeddings'
import type { RunInput } from '@/lib/ai/types'
import type { UserContext, ContextDelta, TractionSnapshot } from '@/lib/types/context'

const MAX_TRACTION_HISTORY = 10
const MAX_TACTICS = 50

/**
 * Accumulate user context after a run completes
 * Called from the pipeline after successful generation
 */
export async function accumulateUserContext(
  userId: string,
  runId: string,
  input: RunInput,
  output: string
): Promise<UserContext> {
  const supabase = createServiceClient()

  // 1. Fetch existing context
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('context')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('[Context] Failed to fetch user context:', fetchError)
    throw new Error(`Failed to fetch user: ${fetchError.message}`)
  }

  const existingContext = (user?.context as UserContext) || {}

  // 2. Merge run input into context
  const updatedContext = mergeRunIntoContext(existingContext, input, runId)

  // 3. Save updated context (cast to Json type for Supabase)
  const { error: updateError } = await supabase
    .from('users')
    .update({
      context: JSON.parse(JSON.stringify(updatedContext)),
      context_updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[Context] Failed to save user context:', updateError)
    throw new Error(`Failed to save context: ${updateError.message}`)
  }

  console.log(`[Context] Updated context for user ${userId} (run ${runId})`)

  // 4. Create embeddings (fire-and-forget, don't block on this)
  extractAndEmbedRunContext(runId, userId, input, output).catch((err) => {
    console.error('[Context] Embedding extraction failed:', err)
  })

  return updatedContext
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

    // Tactics: Accumulate over time
    tactics: {
      tried: mergeStringArray(
        existing.tactics?.tried,
        input.whatYouTried ? [input.whatYouTried] : []
      ),
      working: mergeStringArray(
        existing.tactics?.working,
        input.whatsWorking ? [input.whatsWorking] : []
      ),
      notWorking: existing.tactics?.notWorking || [],
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
      tried: mergeStringArray(
        existing.tactics?.tried,
        delta.newTactics
      ),
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
