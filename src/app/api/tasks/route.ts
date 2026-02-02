import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { extractTasksFromStructuredOutput } from "@/lib/dashboard/extract-tasks"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/tasks?runId=xxx
 * Returns tasks from a run's structured_output + their completion status.
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const runId = request.nextUrl.searchParams.get("runId")
  if (!runId || !UUID_RE.test(runId)) {
    return NextResponse.json({ error: "Valid runId (UUID) required" }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Verify ownership
  const { data: run } = await supabase
    .from("runs")
    .select("id, structured_output, user_id")
    .eq("id", runId)
    .single()

  if (!run || run.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Extract tasks from structured output weeks or legacy thisWeek
  const rawTasks = extractTasksFromStructuredOutput(
    run.structured_output as Record<string, unknown> | null
  )

  // Fetch completions
  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_index, completed, completed_at, note, outcome, track")
    .eq("run_id", runId)

  // Merge tasks with completions
  const mergedTasks = rawTasks.map((task, index) => {
    const completion = completions?.find((c) => c.task_index === index)
    return {
      index,
      title: task.title,
      description: task.description,
      track: (completion?.track as "sprint" | "build") || task.track || "sprint",
      completed: completion?.completed || false,
      completedAt: completion?.completed_at || null,
      note: completion?.note || null,
      outcome: completion?.outcome || null,
      why: task.why || null,
      how: task.how || null,
    }
  })

  return NextResponse.json({ tasks: mergedTasks })
}
