import { redirect } from "next/navigation"
import { getSessionContext } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { SubscriberInsights } from "@/components/dashboard/SubscriberInsights"
import type { StrategyContext } from "@/lib/ai/types"
import type { StructuredOutput } from "@/lib/ai/formatter-types"
import type { Subscription } from "@/lib/subscription"

/**
 * Insights page — strategic briefing room for subscribers.
 * Scoped to the active business via ?biz= query param.
 */
export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>
}) {
  const { publicUserId } = await getSessionContext()
  const supabase = createServiceClient()

  // Resolve active business from ?biz= param (same pattern as brand/business pages)
  const { biz } = await searchParams

  // Find subscription scoped to the selected business
  let query = supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", publicUserId)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)

  if (biz) {
    query = query.eq("business_id", biz)
  }

  const { data } = await query.maybeSingle()
  const subscription = data as Subscription | null

  if (!subscription) redirect("/dashboard")

  // Strategy context includes insights + researchData (enriched in Part 1)
  const strategyContext = subscription.strategy_context as (StrategyContext & {
    insights?: StructuredOutput
    researchData?: unknown
  }) | null

  // Gather carry-forward data from recent weeks for "What You've Learned"
  const { data: recentRuns } = await supabase
    .from("runs")
    .select("id, week_number, structured_output")
    .eq("subscription_id", subscription.id)
    .order("week_number", { ascending: false })
    .limit(8)

  // Fetch all completions in one query instead of N+1
  const runIds = (recentRuns || []).map(r => r.id)
  const { data: allCompletions } = runIds.length > 0
    ? await supabase
        .from("task_completions")
        .select("run_id, task_index, completed, outcome")
        .in("run_id", runIds)
    : { data: [] }

  // Group completions by run_id
  const completionsByRun = new Map<string, typeof allCompletions>()
  for (const c of allCompletions || []) {
    const list = completionsByRun.get(c.run_id) || []
    list.push(c)
    completionsByRun.set(c.run_id, list)
  }

  // Build learnings from runs + completions
  const learnings: Array<{
    weekNumber: number
    worked: string[]
    didntWork: string[]
  }> = []

  if (recentRuns && recentRuns.length > 0) {
    for (const run of recentRuns) {
      const completions = completionsByRun.get(run.id)
      if (!completions || completions.length === 0) continue

      const output = run.structured_output as { tasks?: Array<{ title: string }> } | null
      const tasks = output?.tasks || []

      const worked: string[] = []
      const didntWork: string[] = []

      for (const c of completions) {
        const task = tasks[c.task_index]
        if (!task) continue
        if (c.completed && c.outcome) {
          worked.push(`${task.title}: ${c.outcome}`)
        } else if (!c.completed) {
          didntWork.push(task.title)
        }
      }

      if (worked.length > 0 || didntWork.length > 0) {
        learnings.push({
          weekNumber: run.week_number ?? 0,
          worked,
          didntWork,
        })
      }
    }
  }

  // Fetch checkin notes for learnings
  const { data: checkins } = await supabase
    .from("weekly_checkins")
    .select("week_number, sentiment, notes")
    .eq("subscription_id", subscription.id)
    .order("week_number", { ascending: false })
    .limit(8)

  return (
    <SubscriberInsights
      strategyContext={strategyContext}
      insights={strategyContext?.insights ?? null}
      currentWeek={subscription.current_week}
      learnings={learnings}
      checkins={(checkins || []).filter(c => c.notes).map(c => ({
        weekNumber: c.week_number,
        sentiment: c.sentiment || '',
        notes: c.notes as string,
      }))}
    />
  )
}
