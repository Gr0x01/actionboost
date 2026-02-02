import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"

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

  // Extract tasks from structured output
  const structuredOutput = run.structured_output as Record<string, unknown> | null
  const tasks = (structuredOutput?.tasks as Array<{
    title: string
    description: string
    track: "sprint" | "build"
  }>) || []

  // Fetch completions
  const { data: completions } = await supabase
    .from("task_completions")
    .select("task_index, completed, completed_at, note, outcome")
    .eq("run_id", runId)

  // Merge tasks with completions
  const mergedTasks = tasks.map((task, index) => {
    const completion = completions?.find((c) => c.task_index === index)
    return {
      index,
      ...task,
      completed: completion?.completed || false,
      completedAt: completion?.completed_at || null,
      note: completion?.note || null,
      outcome: completion?.outcome || null,
    }
  })

  return NextResponse.json({ tasks: mergedTasks })
}
