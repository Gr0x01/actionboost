import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUserId } from '@/lib/auth/session'
import { getSessionUserId } from '@/lib/auth/session-cookie'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import type { Json } from '@/lib/types/database'
import {
  type TaskSchedule,
  type BulkUpdateRequest,
  mergeTasksWithSchedule,
  createEmptySchedule,
  parseTaskId,
} from '@/lib/types/taskSchedule'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_NOTES_LENGTH = 1000
const MAX_BULK_UPDATES = 50

/**
 * POST /api/runs/[runId]/schedule/bulk
 * Bulk update multiple tasks (for drag-drop operations)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params

  if (!runId || !UUID_REGEX.test(runId)) {
    return NextResponse.json({ error: 'Invalid run ID' }, { status: 400 })
  }

  // Parse request body
  let body: BulkUpdateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate request
  if (!body.updates || !Array.isArray(body.updates)) {
    return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
  }

  if (body.updates.length === 0) {
    return NextResponse.json({ error: 'updates array cannot be empty' }, { status: 400 })
  }

  if (body.updates.length > MAX_BULK_UPDATES) {
    return NextResponse.json({ error: `Maximum ${MAX_BULK_UPDATES} updates per request` }, { status: 400 })
  }

  // Validate each update
  for (const update of body.updates) {
    if (!update.taskId || typeof update.taskId !== 'string') {
      return NextResponse.json({ error: 'Each update must have a taskId' }, { status: 400 })
    }

    const parsedId = parseTaskId(update.taskId)
    if (!parsedId) {
      return NextResponse.json({ error: `Invalid taskId format: ${update.taskId}` }, { status: 400 })
    }

    if (!update.updates || typeof update.updates !== 'object') {
      return NextResponse.json({ error: `updates object is required for ${update.taskId}` }, { status: 400 })
    }

    const { scheduledDay, status, notes } = update.updates

    if (scheduledDay !== undefined && (typeof scheduledDay !== 'number' || scheduledDay < 1 || scheduledDay > 30)) {
      return NextResponse.json({ error: `scheduledDay must be between 1 and 30 for ${update.taskId}` }, { status: 400 })
    }

    if (status !== undefined && !['pending', 'completed', 'skipped'].includes(status)) {
      return NextResponse.json({ error: `Invalid status for ${update.taskId}` }, { status: 400 })
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json({ error: `notes must be a string for ${update.taskId}` }, { status: 400 })
    }

    if (notes && notes.length > MAX_NOTES_LENGTH) {
      return NextResponse.json({ error: `notes must be at most ${MAX_NOTES_LENGTH} characters for ${update.taskId}` }, { status: 400 })
    }
  }

  const supabase = createServiceClient()

  // Fetch run
  const { data: run, error: fetchError } = await supabase
    .from('runs')
    .select('id, user_id, structured_output, task_schedule')
    .eq('id', runId)
    .single()

  if (fetchError || !run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  // Check ownership (no share access for writes)
  const userId = (await getAuthenticatedUserId()) ?? (await getSessionUserId())

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (userId !== run.user_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Need structured output to validate tasks exist
  const structuredOutput = run.structured_output as StructuredOutput | null
  if (!structuredOutput) {
    return NextResponse.json({ error: 'Run has no structured output' }, { status: 404 })
  }

  // Get original tasks for validation
  const existingTasks = mergeTasksWithSchedule(
    structuredOutput.weeks,
    structuredOutput.thisWeek.days,
    structuredOutput.roadmapWeeks,
    null // Don't include existing customizations to get original days
  )
  const taskMap = new Map(existingTasks.map(t => [t.id, t]))

  // Validate all tasks exist
  for (const update of body.updates) {
    if (!taskMap.has(update.taskId)) {
      return NextResponse.json({ error: `Task not found: ${update.taskId}` }, { status: 404 })
    }
  }

  // Get or create schedule
  let schedule = (run.task_schedule as TaskSchedule | null) || createEmptySchedule()

  // Apply all updates
  for (const update of body.updates) {
    const originalTask = taskMap.get(update.taskId)!
    const existingCustomization = schedule.tasks[update.taskId]
    const { scheduledDay, status, notes } = update.updates

    schedule.tasks[update.taskId] = {
      originalDay: originalTask.originalDay,
      scheduledDay: scheduledDay ?? existingCustomization?.scheduledDay ?? originalTask.originalDay,
      status: status ?? existingCustomization?.status ?? 'pending',
      completedAt: status === 'completed' ? new Date().toISOString() : existingCustomization?.completedAt,
      notes: notes ?? existingCustomization?.notes,
    }
  }

  schedule.updatedAt = new Date().toISOString()

  // Save to database
  const { error: updateError } = await supabase
    .from('runs')
    .update({ task_schedule: schedule as unknown as Json })
    .eq('id', runId)

  if (updateError) {
    console.error('[ScheduleAPI] Failed to update schedule:', updateError)
    return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    updatedCount: body.updates.length,
  })
}
