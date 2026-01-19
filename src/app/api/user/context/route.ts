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

  let delta: ContextDelta
  try {
    delta = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
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

  // Save updated context
  const { error: updateError } = await supabase
    .from('users')
    .update({
      context: updatedContext,
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
