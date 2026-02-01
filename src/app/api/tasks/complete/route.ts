import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * POST /api/tasks/complete
 * Toggle task completion. Upserts into task_completions.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { runId, taskIndex, completed, note, outcome } = await request.json()

  if (!runId || taskIndex === undefined) {
    return NextResponse.json({ error: "runId and taskIndex required" }, { status: 400 })
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
