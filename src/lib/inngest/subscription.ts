/**
 * Inngest functions for Boost Weekly subscription lifecycle.
 *
 * Split pipeline architecture:
 * - Opus strategy (signup + monthly) → stored on subscriptions.strategy_context
 * - Sonnet weekly tasks (every Sunday) → stored in runs.structured_output
 *
 * Cost: ~75% reduction vs old all-Opus approach.
 */

import { inngest } from "./client"
import { createServiceClient } from "@/lib/supabase/server"
import { generateStrategyContext } from "@/lib/ai/pipeline-strategy"
import { generateWeeklyTasks } from "@/lib/ai/pipeline-weekly-tasks"
import type { BusinessProfile } from "@/lib/types/business-profile"
import type { StrategyContext, WeeklyTaskOutput } from "@/lib/ai/types"
import type { Json } from "@/lib/types/database"
import { getAllActiveSubscriptions, incrementSubscriptionWeek } from "@/lib/subscription"
import { sendWeekReadyEmail } from "@/lib/email/resend"
import { addDays, format } from "date-fns"

/**
 * Fetch business profile from a business ID.
 */
async function fetchBusinessProfile(businessId: string): Promise<BusinessProfile> {
  const supabase = createServiceClient()
  const { data: business } = await supabase
    .from("businesses")
    .select("context")
    .eq("id", businessId)
    .single()

  if (!business) {
    throw new Error(`Business ${businessId} not found`)
  }

  const context = (business.context as Record<string, unknown>) || {}
  return (context.profile as BusinessProfile) || {}
}

/**
 * Fetch last week's completion summary and checkin for task generation context.
 */
async function fetchLastWeekContext(subscriptionId: string, currentWeek: number): Promise<{
  completionSummary: string
  checkinContext: string
}> {
  const supabase = createServiceClient()

  // Fetch last week's run
  const { data: lastRun } = await supabase
    .from("runs")
    .select("id, structured_output")
    .eq("subscription_id", subscriptionId)
    .order("week_number", { ascending: false })
    .limit(1)
    .single()

  let completionSummary = ""
  if (lastRun) {
    const { data: completions } = await supabase
      .from("task_completions")
      .select("task_index, completed, note, outcome")
      .eq("run_id", lastRun.id)

    if (completions && completions.length > 0) {
      const completed = completions.filter((c) => c.completed)
      const skipped = completions.filter((c) => !c.completed)
      completionSummary = `Last week: ${completed.length}/${completions.length} tasks completed.`
      if (completed.some((c) => c.outcome)) {
        completionSummary += ` Outcomes: ${completed.filter((c) => c.outcome).map((c) => c.outcome).join("; ")}`
      }
      if (skipped.length > 0) {
        completionSummary += ` Skipped: ${skipped.length} tasks.`
      }
    }
  }

  // Fetch weekly checkin
  const { data: checkin } = await supabase
    .from("weekly_checkins")
    .select("sentiment, notes")
    .eq("subscription_id", subscriptionId)
    .eq("week_number", currentWeek)
    .single()

  const checkinContext = checkin
    ? `User sentiment: ${checkin.sentiment}. ${checkin.notes || ""}`
    : ""

  return { completionSummary, checkinContext }
}

/**
 * Store strategy context on the subscription.
 */
async function storeStrategyContext(subscriptionId: string, strategyContext: StrategyContext): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from("subscriptions")
    .update({ strategy_context: strategyContext as unknown as Json })
    .eq("id", subscriptionId)

  if (error) {
    throw new Error(`Failed to store strategy context: ${error.message}`)
  }
}

/**
 * Fetch existing strategy context from subscription.
 */
async function fetchStrategyContext(subscriptionId: string): Promise<StrategyContext | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("strategy_context")
    .eq("id", subscriptionId)
    .single()

  return (data?.strategy_context as StrategyContext) ?? null
}

/**
 * Create a run record and store weekly task output.
 */
async function createWeeklyRun(params: {
  userId: string
  businessId: string
  subscriptionId: string
  weekNumber: number
  weeklyOutput: WeeklyTaskOutput
  parentRunId?: string
}): Promise<string> {
  const supabase = createServiceClient()

  const { data: run, error } = await supabase
    .from("runs")
    .insert({
      user_id: params.userId,
      business_id: params.businessId,
      subscription_id: params.subscriptionId,
      week_number: params.weekNumber,
      parent_plan_id: params.parentRunId,
      input: {} as unknown as Json,
      structured_output: params.weeklyOutput as unknown as Json,
      status: "complete",
      source: "subscription",
      completed_at: new Date().toISOString(),
      plan_start_date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    })
    .select("id")
    .single()

  if (error || !run) {
    throw new Error(`Failed to create weekly run: ${error?.message}`)
  }

  return run.id
}

/**
 * Initial strategy generation when a subscription is created.
 * 1. Opus generates strategy context (with research tools)
 * 2. Strategy stored on subscription
 * 3. Sonnet generates first week's tasks
 * 4. Tasks stored in a run
 */
export const handleSubscriptionCreated = inngest.createFunction(
  {
    id: "handle-subscription-created",
    retries: 2,
  },
  { event: "subscription/created" },
  async ({ event, step }) => {
    const { subscriptionId, businessId, userId } = event.data

    console.log(`[Inngest] Subscription created: ${subscriptionId}`)

    // Step 1: Generate Opus strategy
    const strategyContext = await step.run("generate-strategy", async () => {
      const profile = await fetchBusinessProfile(businessId)

      const strategy = await generateStrategyContext({
        profile,
        monthNumber: 1,
      })

      await storeStrategyContext(subscriptionId, strategy)

      return strategy
    })

    // Step 2: Generate Sonnet weekly tasks
    const runId = await step.run("generate-weekly-tasks", async () => {
      const profile = await fetchBusinessProfile(businessId)

      const weeklyOutput = await generateWeeklyTasks({
        profile,
        strategyContext,
        userId,
      })

      const newRunId = await createWeeklyRun({
        userId,
        businessId,
        subscriptionId,
        weekNumber: 1,
        weeklyOutput,
      })

      // Link run to subscription as original_run_id
      const supabase = createServiceClient()
      await supabase
        .from("subscriptions")
        .update({ original_run_id: newRunId })
        .eq("id", subscriptionId)

      return newRunId
    })

    console.log(`[Inngest] Subscription ${subscriptionId} initialized: strategy + week 1 tasks (run ${runId})`)
    return { success: true, subscriptionId, runId }
  }
)

/**
 * Weekly re-vectoring cron — runs every Sunday at 6am UTC.
 *
 * For each active subscription:
 * - If month boundary (every 4th week): re-run Opus strategy
 * - Always: generate Sonnet weekly tasks
 */
export const weeklyRevector = inngest.createFunction(
  {
    id: "weekly-revector-cron",
    retries: 1,
  },
  { cron: "0 6 * * 0" }, // Sunday 6am UTC
  async ({ step }) => {
    console.log("[Inngest] Weekly re-vectoring started")

    const subscriptions = await step.run("fetch-active-subscriptions", async () => {
      return getAllActiveSubscriptions()
    })

    console.log(`[Inngest] Found ${subscriptions.length} active subscriptions`)

    for (const sub of subscriptions) {
      // Step A: Generate and store (idempotent via existing run check)
      const runId = await step.run(`generate-${sub.id}`, async () => {
        const supabase = createServiceClient()
        const nextWeek = sub.current_week + 1

        // Check if a run for this week already exists (retry scenario)
        const { data: existingRun } = await supabase
          .from("runs")
          .select("id")
          .eq("subscription_id", sub.id)
          .eq("week_number", nextWeek)
          .single()

        if (existingRun) {
          console.log(`[Inngest] Run already exists for sub ${sub.id} week ${nextWeek}`)
          return existingRun.id
        }

        const profile = await fetchBusinessProfile(sub.business_id)

        // Month boundary check: every 4th week triggers Opus re-strategy
        const isMonthBoundary = sub.current_week > 0 && sub.current_week % 4 === 0

        let strategyContext = await fetchStrategyContext(sub.id)

        if (isMonthBoundary || !strategyContext) {
          console.log(`[Inngest] Month boundary (week ${sub.current_week}) — regenerating strategy for ${sub.id}`)

          const carryForward = await buildCarryForward(sub.id, sub.current_week)
          const newMonthNumber = strategyContext ? strategyContext.monthNumber + 1 : 1

          strategyContext = await generateStrategyContext({
            profile,
            monthNumber: newMonthNumber,
            carryForward,
          })

          await storeStrategyContext(sub.id, strategyContext)
        }

        // Fetch last week's context for task generation
        const { completionSummary, checkinContext } = await fetchLastWeekContext(sub.id, sub.current_week)

        // Generate weekly tasks
        const weeklyOutput = await generateWeeklyTasks({
          profile,
          strategyContext,
          lastWeekSummary: completionSummary,
          checkinContext,
          userId: sub.user_id,
        })

        // Get last run for parent linking
        const { data: lastRun } = await supabase
          .from("runs")
          .select("id")
          .eq("subscription_id", sub.id)
          .order("week_number", { ascending: false })
          .limit(1)
          .single()

        return await createWeeklyRun({
          userId: sub.user_id,
          businessId: sub.business_id,
          subscriptionId: sub.id,
          weekNumber: nextWeek,
          weeklyOutput,
          parentRunId: lastRun?.id || sub.original_run_id || undefined,
        })
      })

      // Step B: Finalize — increment week + send email (separate step for retry safety)
      await step.run(`finalize-${sub.id}`, async () => {
        // Idempotent: incrementSubscriptionWeek uses optimistic lock
        await incrementSubscriptionWeek(sub.id, sub.current_week).catch(() => {
          // Already incremented on prior attempt — expected
        })

        const supabase = createServiceClient()
        const { data: user } = await supabase
          .from("users")
          .select("email")
          .eq("id", sub.user_id)
          .single()

        if (user?.email) {
          sendWeekReadyEmail({ to: user.email, runId }).catch((err) => {
            console.error("[Inngest] Week ready email failed:", err)
          })
        }

        console.log(`[Inngest] Weekly tasks finalized for ${sub.id} (run ${runId})`)
      })
    }

    console.log("[Inngest] Weekly re-vectoring complete")
    return { success: true, count: subscriptions.length }
  }
)

/**
 * Build carryForward from the last 4 weeks of task completions.
 */
async function buildCarryForward(
  subscriptionId: string,
  currentWeek: number
): Promise<StrategyContext['monthlyTheme']['carryForward']> {
  const supabase = createServiceClient()

  // Get runs from last 4 weeks
  const startWeek = Math.max(1, currentWeek - 3)
  const { data: runs } = await supabase
    .from("runs")
    .select("id, structured_output")
    .eq("subscription_id", subscriptionId)
    .gte("week_number", startWeek)
    .lte("week_number", currentWeek)
    .order("week_number", { ascending: true })

  if (!runs || runs.length === 0) {
    return { worked: [], didntWork: [], learnings: [] }
  }

  const worked: string[] = []
  const didntWork: string[] = []

  for (const run of runs) {
    const { data: completions } = await supabase
      .from("task_completions")
      .select("task_index, completed, outcome")
      .eq("run_id", run.id)

    if (!completions) continue

    const output = run.structured_output as WeeklyTaskOutput | null
    const tasks = output?.tasks || []

    for (const c of completions) {
      const task = tasks[c.task_index]
      if (!task) continue

      if (c.completed && c.outcome) {
        worked.push(`${task.title}: ${c.outcome}`)
      } else if (!c.completed) {
        didntWork.push(task.title)
      }
    }
  }

  // Fetch checkins for learnings
  const { data: checkins } = await supabase
    .from("weekly_checkins")
    .select("notes")
    .eq("subscription_id", subscriptionId)
    .gte("week_number", startWeek)
    .lte("week_number", currentWeek)

  const learnings = (checkins || [])
    .filter((c) => c.notes)
    .map((c) => c.notes as string)

  return {
    worked: worked.slice(0, 10),
    didntWork: didntWork.slice(0, 10),
    learnings: learnings.slice(0, 5),
  }
}

export const subscriptionFunctions = [handleSubscriptionCreated, weeklyRevector]
