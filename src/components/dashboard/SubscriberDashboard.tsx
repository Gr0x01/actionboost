"use client"

import { useState, useCallback } from "react"
import { WeekTheme } from "./WeekTheme"
import { WeeklyFocus } from "./WeeklyFocus"
import { WhatsWorking } from "./WhatsWorking"
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
  const thesis = latestRun?.structuredOutput?.thesis as string | undefined
  const [panelOpen, setPanelOpen] = useState(false)
  const handlePanelChange = useCallback((open: boolean) => setPanelOpen(open), [])

  return (
    <div
      className={`max-w-3xl mx-auto px-4 py-8 transition-[margin] duration-300 ease-out ${
        panelOpen ? "lg:mr-[28rem]" : ""
      }`}
    >
      {/* Week header */}
      <div className="mb-8">
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
          <div className="space-y-6">
            <WeekTheme
              weekNumber={latestRun.weekNumber}
              thesis={thesis}
            />

            <WeeklyFocus runId={latestRun.id} onPanelChange={handlePanelChange} />

            <WhatsWorking output={latestRun.output} />

            <WeeklyCheckin existingCheckin={checkin} />
          </div>
        )}
    </div>
  )
}
