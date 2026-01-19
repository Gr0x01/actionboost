import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth/session'
import { mergeContextDelta } from '@/lib/context/accumulate'
import {
  hasUserContext,
  getSuggestedQuestions,
  type UserContext,
  type ContextDelta,
  type UserContextResponse,
} from '@/lib/types/context'

// Max field lengths to prevent payload bloat
const MAX_STRING = 5000
const MAX_SHORT_STRING = 1000
const MAX_ARRAY_ITEMS = 20
const MAX_URL_LENGTH = 500

/**
 * Validate and sanitize ContextDelta input
 * Returns null if invalid, sanitized delta if valid
 */
function validateContextDelta(data: unknown): ContextDelta | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null
  }

  const input = data as Record<string, unknown>
  const delta: ContextDelta = {}

  // Validate product (optional object)
  if (input.product !== undefined) {
    if (typeof input.product !== 'object' || input.product === null || Array.isArray(input.product)) {
      return null
    }
    const prod = input.product as Record<string, unknown>
    delta.product = {}

    if (prod.description !== undefined) {
      if (typeof prod.description !== 'string') return null
      delta.product.description = prod.description.slice(0, MAX_STRING)
    }
    if (prod.websiteUrl !== undefined) {
      if (typeof prod.websiteUrl !== 'string') return null
      delta.product.websiteUrl = prod.websiteUrl.slice(0, MAX_URL_LENGTH)
    }
    if (prod.competitors !== undefined) {
      if (!Array.isArray(prod.competitors)) return null
      if (!prod.competitors.every((c): c is string => typeof c === 'string')) return null
      delta.product.competitors = prod.competitors.slice(0, MAX_ARRAY_ITEMS).map(c => c.slice(0, MAX_URL_LENGTH))
    }
  }

  // Validate string fields
  if (input.tractionDelta !== undefined) {
    if (typeof input.tractionDelta !== 'string') return null
    delta.tractionDelta = input.tractionDelta.slice(0, MAX_STRING)
  }
  if (input.workingUpdate !== undefined) {
    if (typeof input.workingUpdate !== 'string') return null
    delta.workingUpdate = input.workingUpdate.slice(0, MAX_SHORT_STRING)
  }
  if (input.notWorkingUpdate !== undefined) {
    if (typeof input.notWorkingUpdate !== 'string') return null
    delta.notWorkingUpdate = input.notWorkingUpdate.slice(0, MAX_SHORT_STRING)
  }
  if (input.constraints !== undefined) {
    if (typeof input.constraints !== 'string') return null
    delta.constraints = input.constraints.slice(0, MAX_STRING)
  }

  // Validate newTactics (optional string array)
  if (input.newTactics !== undefined) {
    if (!Array.isArray(input.newTactics)) return null
    if (!input.newTactics.every((t): t is string => typeof t === 'string')) return null
    delta.newTactics = input.newTactics.slice(0, MAX_ARRAY_ITEMS).map(t => t.slice(0, MAX_SHORT_STRING))
  }

  // Validate incrementRuns (optional boolean)
  if (input.incrementRuns !== undefined) {
    if (typeof input.incrementRuns !== 'boolean') return null
    delta.incrementRuns = input.incrementRuns
  }

  return delta
}

/**
 * GET /api/user/context
 * Returns the authenticated user's accumulated context for pre-filling forms
 */
export async function GET(): Promise<NextResponse<UserContextResponse | { error: string }>> {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!sessionUser.publicUserId) {
    // User is authenticated but hasn't purchased yet - no context
    return NextResponse.json({
      context: {},
      lastUpdated: null,
      suggestedQuestions: [],
    })
  }

  const supabase = createServiceClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('context, context_updated_at')
    .eq('id', sessionUser.publicUserId)
    .single()

  if (error) {
    console.error('[API] Failed to fetch user context:', error)
    return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 })
  }

  const context = (user?.context as UserContext) || {}

  return NextResponse.json({
    context,
    lastUpdated: user?.context_updated_at || null,
    suggestedQuestions: hasUserContext(context) ? getSuggestedQuestions(context) : [],
  })
}

/**
 * PATCH /api/user/context
 * Apply a delta update to the user's context (conversational updates)
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!sessionUser.publicUserId) {
    return NextResponse.json({ error: 'No user profile yet' }, { status: 400 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const delta = validateContextDelta(rawBody)
  if (!delta) {
    return NextResponse.json({ error: 'Invalid request body structure' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch existing context
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('context')
    .eq('id', sessionUser.publicUserId)
    .single()

  if (fetchError) {
    console.error('[API] Failed to fetch user context:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 })
  }

  const existingContext = (user?.context as UserContext) || {}

  // Merge delta into existing context
  const updatedContext = mergeContextDelta(existingContext, delta)

  // Save updated context (cast to Json type for Supabase)
  const { error: updateError } = await supabase
    .from('users')
    .update({
      context: JSON.parse(JSON.stringify(updatedContext)),
      context_updated_at: new Date().toISOString(),
    })
    .eq('id', sessionUser.publicUserId)

  if (updateError) {
    console.error('[API] Failed to update user context:', updateError)
    return NextResponse.json({ error: 'Failed to update context' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    context: updatedContext,
  })
}
