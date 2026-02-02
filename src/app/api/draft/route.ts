import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { isSubscriber } from "@/lib/subscription"
import { generateDraft } from "@/lib/ai/draft"
import { createServiceClient } from "@/lib/supabase/server"
import type { BusinessProfile } from "@/lib/types/business-profile"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/draft
 * Generate a content draft for a specific task.
 * Synchronous — returns in ~5-10s.
 * Requires active subscription.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const subscriber = await isSubscriber(userId)
  if (!subscriber) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { runId, taskIndex, contentType } = body as {
    runId?: string; taskIndex?: number; contentType?: string
  }

  if (!runId || !UUID_RE.test(runId)) {
    return NextResponse.json({ error: "Valid runId (UUID) required" }, { status: 400 })
  }

  if (taskIndex === undefined || typeof taskIndex !== "number" || !Number.isInteger(taskIndex) || taskIndex < 0 || taskIndex > 50) {
    return NextResponse.json({ error: "taskIndex must be an integer between 0 and 50" }, { status: 400 })
  }

  if (!contentType) {
    return NextResponse.json({ error: "contentType required" }, { status: 400 })
  }

  const validTypes = ["reddit_post", "email", "dm", "tweet", "linkedin_post", "blog_outline"]
  if (!validTypes.includes(contentType)) {
    return NextResponse.json({ error: `Invalid contentType. Must be one of: ${validTypes.join(", ")}` }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Fetch run + business profile
  const { data: run } = await supabase
    .from("runs")
    .select("id, output, structured_output, business_id, user_id")
    .eq("id", runId)
    .single()

  if (!run || run.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Get business profile for voice/ICP context
  let profile: BusinessProfile = {}
  if (run.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("context")
      .eq("id", run.business_id)
      .single()

    const context = (business?.context as Record<string, unknown>) || {}
    profile = (context.profile as BusinessProfile) || {}
  }

  // Extract the specific task
  const structuredOutput = run.structured_output as Record<string, unknown> | null
  const tasks = (structuredOutput?.tasks as Array<{ title: string; description: string }>) || []
  const task = tasks[taskIndex]

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  try {
    const draft = await generateDraft({
      profile,
      task,
      contentType,
      strategyContext: typeof run.output === "string" ? run.output.slice(0, 3000) : "",
    })

    return NextResponse.json({ draft })
  } catch (err) {
    console.error("[Draft] Generation failed:", err)
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 })
  }
}
