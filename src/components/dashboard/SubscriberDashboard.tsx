"use client"

import { WeeklyFocus } from "./WeeklyFocus"
import { WhatsWorking } from "./WhatsWorking"
import { DraftIt } from "./DraftIt"
import { WeeklyCheckin } from "./WeeklyCheckin"

interface SubscriberDashboardProps {
  subscription: {
    id: string
    currentWeek: number
    status: string
    cancelAtPeriodEnd: boolean
  }
  latestRun: {
    id: string
    weekNumber: number
    status: string
    output: string | null
    structuredOutput: Record<string, unknown> | null
  } | null
  checkin: {
    sentiment: string | null
    notes: string | null
  } | null
}

export function SubscriberDashboard({ subscription, latestRun, checkin }: SubscriberDashboardProps) {
  const isProcessing = latestRun?.status === "pending" || latestRun?.status === "processing"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Week {subscription.currentWeek}
            </h1>
            <p className="text-sm text-foreground/50 mt-1">
              {subscription.cancelAtPeriodEnd
                ? "Cancels at period end"
                : subscription.status === "past_due"
                  ? "Payment issue — please update your card"
                  : "Boost Weekly"}
            </p>
          </div>
          <a
            href="/"
            className="font-mono text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            Boost
          </a>
        </div>

        {isProcessing ? (
          <div
            className="bg-white border-2 border-foreground/20 rounded-md p-12 text-center"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="animate-pulse">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Building your strategy...
              </h2>
              <p className="text-foreground/50">
                We&apos;re analyzing your market and crafting this week&apos;s plan.
              </p>
            </div>
          </div>
        ) : !latestRun ? (
          <div
            className="bg-white border-2 border-foreground/20 rounded-md p-12 text-center"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <h2 className="text-xl font-bold text-foreground mb-2">
              Your first week is on the way
            </h2>
            <p className="text-foreground/50">
              Check back shortly — your strategy is being generated.
            </p>
          </div>
        ) : (
          <>
            {/* 3-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Panel 1: This week's focus (takes 2 cols on large) */}
              <div className="lg:col-span-2">
                <WeeklyFocus
                  runId={latestRun.id}
                />
              </div>

              {/* Panel 2: What's working */}
              <div>
                <WhatsWorking output={latestRun.output} />
              </div>
            </div>

            {/* Panel 3: Draft it */}
            <div className="mb-8">
              <DraftIt
                runId={latestRun.id}
                structuredOutput={latestRun.structuredOutput}
              />
            </div>

            {/* Weekly check-in */}
            <WeeklyCheckin
              existingCheckin={checkin}
            />
          </>
        )}
      </div>
    </div>
  )
}
