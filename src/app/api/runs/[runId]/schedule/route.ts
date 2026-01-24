import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUserId } from '@/lib/auth/session'
import { getSessionUserId } from '@/lib/auth/session-cookie'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import type { Json } from '@/lib/types/database'
import {
  type TaskSchedule,
  type ScheduleResponse,
  type TaskUpdateRequest,
  mergeTasksWithSchedule,
  calculateTaskStats,
  createEmptySchedule,
  parseTaskId,
} from '@/lib/types/taskSchedule'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_NOTES_LENGTH = 1000

/**
 * GET /api/runs/[runId]/schedule
 * Returns merged task list with customizations applied
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params
  const { searchParams } = new URL(request.url)
  const shareSlug = searchParams.get('share')

  if (!runId || !UUID_REGEX.test(runId)) {
    return NextResponse.json({ error: 'Invalid run ID' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch run with schedule data
  const { data: run, error } = await supabase
    .from('runs')
    .select('id, user_id, share_slug, status, structured_output, task_schedule, plan_start_date')
    .eq('id', runId)
    .single()

  if (error || !run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  // Check access: share link OR authenticated owner
  const isShareAccess = shareSlug && run.share_slug === shareSlug

  if (!isShareAccess) {
    const userId = (await getAuthenticatedUserId()) ?? (await getSessionUserId())

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userId !== run.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Need structured output for task data
  const structuredOutput = run.structured_output as StructuredOutput | null
  if (!structuredOutput) {
    return NextResponse.json({ error: 'Run has no structured output' }, { status: 404 })
  }

  // Merge tasks with schedule customizations
  const schedule = run.task_schedule as TaskSchedule | null
  const tasks = mergeTasksWithSchedule(
    structuredOutput.weeks,
    structuredOutput.thisWeek.days,
    structuredOutput.roadmapWeeks,
    schedule
  )

  const response: ScheduleResponse = {
    planStartDate: run.plan_start_date,
    tasks,
    stats: calculateTaskStats(tasks),
  }

  return NextResponse.json(response)
}

/**
 * PATCH /api/runs/[runId]/schedule
 * Update a single task (reschedule, complete, add notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params

  if (!runId || !UUID_REGEX.test(runId)) {
    return NextResponse.json({ error: 'Invalid run ID' }, { status: 400 })
  }

  // Parse request body
  let body: TaskUpdateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate request
  if (!body.taskId || typeof body.taskId !== 'string') {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
  }

  const parsedId = parseTaskId(body.taskId)
  if (!parsedId) {
    return NextResponse.json({ error: 'Invalid taskId format' }, { status: 400 })
  }

  if (!body.updates || typeof body.updates !== 'object') {
    return NextResponse.json({ error: 'updates object is required' }, { status: 400 })
  }

  // Validate updates
  const { scheduledDay, status, notes } = body.updates

  if (scheduledDay !== undefined && (typeof scheduledDay !== 'number' || scheduledDay < 1 || scheduledDay > 30)) {
    return NextResponse.json({ error: 'scheduledDay must be between 1 and 30' }, { status: 400 })
  }

  if (status !== undefined && !['pending', 'completed', 'skipped'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  if (notes !== undefined && typeof notes !== 'string') {
    return NextResponse.json({ error: 'notes must be a string' }, { status: 400 })
  }

  if (notes && notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json({ error: `notes must be at most ${MAX_NOTES_LENGTH} characters` }, { status: 400 })
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

  // Need structured output to validate task exists
  const structuredOutput = run.structured_output as StructuredOutput | null
  if (!structuredOutput) {
    return NextResponse.json({ error: 'Run has no structured output' }, { status: 404 })
  }

  // Get or create schedule
  let schedule = (run.task_schedule as TaskSchedule | null) || createEmptySchedule()

  // Find original day for this task (to initialize if needed)
  const existingTasks = mergeTasksWithSchedule(
    structuredOutput.weeks,
    structuredOutput.thisWeek.days,
    structuredOutput.roadmapWeeks,
    null // Don't include existing customizations to get original day
  )
  const originalTask = existingTasks.find(t => t.id === body.taskId)
  if (!originalTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Initialize or update task customization
  const existingCustomization = schedule.tasks[body.taskId]
  schedule.tasks[body.taskId] = {
    originalDay: originalTask.originalDay,
    scheduledDay: scheduledDay ?? existingCustomization?.scheduledDay ?? originalTask.originalDay,
    status: status ?? existingCustomization?.status ?? 'pending',
    completedAt: status === 'completed' ? new Date().toISOString() : existingCustomization?.completedAt,
    notes: notes ?? existingCustomization?.notes,
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

  // Return updated task
  const updatedTask = {
    ...originalTask,
    scheduledDay: schedule.tasks[body.taskId].scheduledDay,
    status: schedule.tasks[body.taskId].status,
    completedAt: schedule.tasks[body.taskId].completedAt,
    notes: schedule.tasks[body.taskId].notes,
  }

  return NextResponse.json({ task: updatedTask })
}
