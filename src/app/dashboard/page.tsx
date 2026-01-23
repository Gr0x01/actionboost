import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * Dashboard redirects to the user's most recent plan
 * The results page serves as the "home base" with plan switching via dropdown
 */
export default async function DashboardPage() {
  const authUser = await requireAuth()

  const supabase = createServiceClient()

  // Find public user
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (!publicUser) {
    // No runs yet, go to start
    redirect("/start")
  }

  // Get the latest completed run (follow refinement chains to get the most recent)
  const { data: runs } = await supabase
    .from("runs")
    .select("id, status, parent_run_id, completed_at, created_at")
    .eq("user_id", publicUser.id)
    .eq("status", "complete")
    .order("completed_at", { ascending: false })

  if (!runs || runs.length === 0) {
    // No completed runs, check for pending/processing
    const { data: pendingRuns } = await supabase
      .from("runs")
      .select("id")
      .eq("user_id", publicUser.id)
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)

    if (pendingRuns && pendingRuns.length > 0) {
      redirect(`/results/${pendingRuns[0].id}`)
    }

    // No runs at all, go to start
    redirect("/start")
  }

  // Find the latest leaf in each chain and pick the most recent overall
  // Build parent->children map
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

  // For each root, find the latest in its chain
  let latestRun = runs[0] // Fallback to most recent by date

  for (const root of rootRuns) {
    let current = root
    let children = childrenMap.get(current.id)

    while (children && children.length > 0) {
      // Sort by date, take most recent
      children.sort((a, b) =>
        new Date(b.completed_at || b.created_at || 0).getTime() -
        new Date(a.completed_at || a.created_at || 0).getTime()
      )
      current = children[0]
      children = childrenMap.get(current.id)
    }

    // Check if this is more recent than our current latest
    const currentDate = new Date(current.completed_at || current.created_at || 0).getTime()
    const latestDate = new Date(latestRun.completed_at || latestRun.created_at || 0).getTime()
    if (currentDate > latestDate) {
      latestRun = current
    }
  }

  redirect(`/results/${latestRun.id}`)
}
