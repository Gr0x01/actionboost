import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/tasks/complete
 * Toggle task completion. Upserts into task_completions.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { runId, taskIndex, completed, note, outcome } = body as {
    runId?: string; taskIndex?: number; completed?: boolean; note?: string; outcome?: string
  }

  if (!runId || !UUID_RE.test(runId)) {
    return NextResponse.json({ error: "Valid runId (UUID) required" }, { status: 400 })
  }

  if (taskIndex === undefined || typeof taskIndex !== "number" || !Number.isInteger(taskIndex) || taskIndex < 0 || taskIndex > 50) {
    return NextResponse.json({ error: "taskIndex must be an integer between 0 and 50" }, { status: 400 })
  }

  if (note !== undefined && (typeof note !== "string" || note.length > 2000)) {
    return NextResponse.json({ error: "note must be a string of 2000 chars or fewer" }, { status: 400 })
  }

  if (outcome !== undefined && (typeof outcome !== "string" || outcome.length > 2000)) {
    return NextResponse.json({ error: "outcome must be a string of 2000 chars or fewer" }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verify run ownership
  const { data: run } = await supabase
    .from("runs")
    .select("user_id")
    .eq("id", runId)
    .single()

  if (!run || run.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Upsert completion
  const { error } = await supabase
    .from("task_completions")
    .upsert(
      {
        run_id: runId,
        task_index: taskIndex,
        track: "sprint", // Default, can be overridden
        completed: completed ?? true,
        completed_at: completed ? new Date().toISOString() : null,
        note: note || null,
        outcome: outcome || null,
      },
      { onConflict: "run_id,task_index" }
    )

  if (error) {
    console.error("[Tasks] Completion upsert failed:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
