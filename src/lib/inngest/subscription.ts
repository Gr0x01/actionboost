/**
 * Inngest functions for Boost Weekly subscription lifecycle.
 *
 * - subscription/created → generate initial strategy from business profile
 * - weekly cron → Sunday: generate new weekly plan for all active subscriptions
 */

import { inngest } from "./client"
import { createServiceClient } from "@/lib/supabase/server"
import { runPipeline } from "@/lib/ai/pipeline"
import type { BusinessProfile } from "@/lib/types/business-profile"
import type { Json } from "@/lib/types/database"
import { getAllActiveSubscriptions, incrementSubscriptionWeek } from "@/lib/subscription"
import { sendWeekReadyEmail } from "@/lib/email/resend"

/**
 * Build RunInput from a business profile for the AI pipeline.
 */
function buildRunInputFromProfile(profile: BusinessProfile) {
  return {
    productDescription: profile.description || "",
    currentTraction: "",
    tacticsAndResults: profile.triedBefore || "",
    focusArea: "custom" as const,
    competitorUrls: profile.competitors || [],
    websiteUrl: profile.websiteUrl || "",
    analyticsSummary: "",
    constraints: profile.goals?.budget
      ? `Budget: ${profile.goals.budget}`
      : "",
  }
}

/**
 * Initial strategy generation when a subscription is created.
 * Creates a run linked to the subscription and triggers the full Opus pipeline.
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

    const result = await step.run("initial-strategy", async () => {
      const supabase = createServiceClient()

      // Fetch business profile
      const { data: business } = await supabase
        .from("businesses")
        .select("context")
        .eq("id", businessId)
        .single()

      if (!business) {
        throw new Error(`Business ${businessId} not found for subscription ${subscriptionId}`)
      }

      const context = (business.context as Record<string, unknown>) || {}
      const profile = (context.profile as BusinessProfile) || {}

      // Build pipeline input from profile
      const input = buildRunInputFromProfile(profile)

      // Create the initial run linked to subscription
      const { data: run, error: runError } = await supabase
        .from("runs")
        .insert({
          user_id: userId,
          business_id: businessId,
          subscription_id: subscriptionId,
          week_number: 1,
          input: input as unknown as Json,
          status: "pending",
          source: "subscription",
        })
        .select("id")
        .single()

      if (runError || !run) {
        throw new Error(`Failed to create initial run: ${runError?.message}`)
      }

      // Link run to subscription as original_run_id
      await supabase
        .from("subscriptions")
        .update({ original_run_id: run.id })
        .eq("id", subscriptionId)

      // Run the full pipeline
      try {
        return await runPipeline(run.id)
      } catch (err) {
        await supabase
          .from("runs")
          .update({ status: "failed", stage: "Pipeline error" })
          .eq("id", run.id)
        throw err
      }
    })

    if (!result.success) {
      console.error(`[Inngest] Initial strategy failed for subscription ${subscriptionId}:`, result.error)
      return { success: false, error: result.error }
    }

    console.log(`[Inngest] Initial strategy complete for subscription ${subscriptionId}`)
    return { success: true, subscriptionId }
  }
)

/**
 * Weekly re-vectoring cron — runs every Sunday at 6am UTC.
 * Fetches all active subscriptions and generates new weekly plans.
 *
 * Order of operations: create run first, then increment week after pipeline
 * succeeds. This prevents orphaned week increments if the pipeline fails.
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

    // Process each subscription
    for (const sub of subscriptions) {
      await step.run(`revector-${sub.id}`, async () => {
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
          // Run already exists — skip to pipeline (idempotent retry)
          console.log(`[Inngest] Run already exists for sub ${sub.id} week ${nextWeek}, re-running pipeline`)
          try {
            await runPipeline(existingRun.id)

            // Increment week after successful pipeline
            await incrementSubscriptionWeek(sub.id, sub.current_week)

            const { data: user } = await supabase
              .from("users")
              .select("email")
              .eq("id", sub.user_id)
              .single()

            if (user?.email) {
              sendWeekReadyEmail({ to: user.email, runId: existingRun.id }).catch((err) => {
                console.error("[Inngest] Week ready email failed:", err)
              })
            }
          } catch (err) {
            await supabase
              .from("runs")
              .update({ status: "failed", stage: "Weekly pipeline error" })
              .eq("id", existingRun.id)
            console.error(`[Inngest] Weekly pipeline failed for ${sub.id}:`, err)
            throw err
          }
          return
        }

        // Fetch business profile
        const { data: business } = await supabase
          .from("businesses")
          .select("context, name")
          .eq("id", sub.business_id)
          .single()

        const context = (business?.context as Record<string, unknown>) || {}
        const profile = (context.profile as BusinessProfile) || {}

        // Fetch last week's run
        const { data: lastRun } = await supabase
          .from("runs")
          .select("id, output, structured_output")
          .eq("subscription_id", sub.id)
          .order("week_number", { ascending: false })
          .limit(1)
          .single()

        // Fetch task completions from last week
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
          .eq("subscription_id", sub.id)
          .eq("week_number", sub.current_week)
          .single()

        const checkinContext = checkin
          ? `User sentiment: ${checkin.sentiment}. ${checkin.notes || ""}`
          : ""

        // Build input with context from prior weeks
        const input = buildRunInputFromProfile(profile)

        // Additional context for the pipeline
        const weeklyContext = [
          `## Week ${nextWeek} Re-vectoring`,
          completionSummary,
          checkinContext,
          lastRun?.output ? `## Previous Strategy Summary\n${(lastRun.output as string).slice(0, 2000)}` : "",
        ]
          .filter(Boolean)
          .join("\n\n")

        // Create new run BEFORE incrementing week
        const { data: run, error: runError } = await supabase
          .from("runs")
          .insert({
            user_id: sub.user_id,
            business_id: sub.business_id,
            subscription_id: sub.id,
            week_number: nextWeek,
            parent_plan_id: lastRun?.id || sub.original_run_id,
            input: input as unknown as Json,
            additional_context: weeklyContext,
            status: "pending",
            source: "subscription",
          })
          .select("id")
          .single()

        if (runError || !run) {
          console.error(`[Inngest] Failed to create weekly run for ${sub.id}:`, runError)
          return
        }

        // Run pipeline, then increment week only on success
        try {
          await runPipeline(run.id)

          // Increment week AFTER successful pipeline completion
          await incrementSubscriptionWeek(sub.id, sub.current_week)

          // Send Monday email
          const { data: user } = await supabase
            .from("users")
            .select("email")
            .eq("id", sub.user_id)
            .single()

          if (user?.email) {
            sendWeekReadyEmail({ to: user.email, runId: run.id }).catch((err) => {
              console.error("[Inngest] Week ready email failed:", err)
            })
          }
        } catch (err) {
          await supabase
            .from("runs")
            .update({ status: "failed", stage: "Weekly pipeline error" })
            .eq("id", run.id)
          console.error(`[Inngest] Weekly pipeline failed for ${sub.id}:`, err)
          throw err
        }
      })
    }

    console.log("[Inngest] Weekly re-vectoring complete")
    return { success: true, count: subscriptions.length }
  }
)

export const subscriptionFunctions = [handleSubscriptionCreated, weeklyRevector]
