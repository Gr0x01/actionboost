import { redirect } from "next/navigation"
import { getSessionContext } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { getActiveSubscription } from "@/lib/subscription"
import { SubscriberDashboard } from "@/components/dashboard/SubscriberDashboard"

/**
 * Dashboard page
 * - Subscribers → 3-panel dashboard (this week / what's working / draft it)
 * - Legacy one-shot users → redirect to latest results
 */
export default async function DashboardPage() {
  const { publicUserId } = await getSessionContext()

  const supabase = createServiceClient()

  // Check for active subscription
  const subscription = await getActiveSubscription(publicUserId)

  if (subscription) {
    // Subscriber: render 3-panel dashboard
    // Get the latest run for this subscription
    let { data: latestRun } = await supabase
      .from("runs")
      .select("id, output, structured_output, week_number, status, created_at")
      .eq("subscription_id", subscription.id)
      .order("week_number", { ascending: false })
      .limit(1)
      .single()

    // Fallback: if no subscription run yet, use the user's latest completed run
    if (!latestRun) {
      const { data: legacyRun } = await supabase
        .from("runs")
        .select("id, output, structured_output, week_number, status, created_at")
        .eq("user_id", publicUserId)
        .eq("status", "complete")
        .not("structured_output", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (legacyRun) latestRun = legacyRun
    }

    // Get checkin for current week
    const { data: checkin } = await supabase
      .from("weekly_checkins")
      .select("sentiment, notes")
      .eq("subscription_id", subscription.id)
      .eq("week_number", subscription.current_week)
      .single()

    return (
      <SubscriberDashboard
        subscription={{
          id: subscription.id,
          currentWeek: subscription.current_week,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        }}
        latestRun={latestRun ? {
          id: latestRun.id,
          weekNumber: latestRun.week_number ?? 1,
          status: latestRun.status ?? "pending",
          output: typeof latestRun.output === "string" ? latestRun.output : null,
          structuredOutput: latestRun.structured_output as Record<string, unknown> | null,
        } : null}
        checkin={checkin ? { sentiment: checkin.sentiment, notes: checkin.notes } : null}
      />
    )
  }

  // Legacy one-shot user: redirect to latest results
  const { data: runs } = await supabase
    .from("runs")
    .select("id, status, parent_run_id, completed_at, created_at")
    .eq("user_id", publicUserId)
    .eq("status", "complete")
    .order("completed_at", { ascending: false })

  if (!runs || runs.length === 0) {
    const { data: pendingRuns } = await supabase
      .from("runs")
      .select("id")
      .eq("user_id", publicUserId)
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)

    if (pendingRuns && pendingRuns.length > 0) {
      redirect(`/results/${pendingRuns[0].id}`)
    }
    redirect("/start")
  }

  // Find latest leaf run
  const childrenMap = new Map<string, typeof runs>()
  const rootRuns: typeof runs = []

  runs.forEach((run) => {
    if (run.parent_run_id) {
      const siblings = childrenMap.get(run.parent_run_id) || []
      siblings.push(run)
      childrenMap.set(run.parent_run_id, siblings)
    } else {
      rootRuns.push(run)
    }
  })

  let latestRun = runs[0]
  for (const root of rootRuns) {
    let current = root
    let children = childrenMap.get(current.id)
    while (children && children.length > 0) {
      children.sort((a, b) =>
        new Date(b.completed_at || b.created_at || 0).getTime() -
        new Date(a.completed_at || a.created_at || 0).getTime()
      )
      current = children[0]
      children = childrenMap.get(current.id)
    }
    const currentDate = new Date(current.completed_at || current.created_at || 0).getTime()
    const latestDate = new Date(latestRun.completed_at || latestRun.created_at || 0).getTime()
    if (currentDate > latestDate) {
      latestRun = current
    }
  }

  redirect(`/results/${latestRun.id}`)
}
