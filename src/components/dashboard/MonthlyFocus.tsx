"use client"

import { useState, useEffect } from "react"
import type { StrategyContext } from "@/lib/ai/types"

/**
 * Monthly Focus card — shows quarter objective + this month's theme.
 * Collapsible, dismissible to localStorage.
 */
export function MonthlyFocus() {
  const [strategy, setStrategy] = useState<StrategyContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if dismissed this session
    const key = "boost_monthly_focus_dismissed"
    if (localStorage.getItem(key) === "true") {
      setDismissed(true)
      setLoading(false)
      return
    }

    fetch("/api/strategy")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.strategyContext) {
          setStrategy(data.strategyContext)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || dismissed || !strategy) return null

  const { quarterFocus, monthlyTheme, monthNumber } = strategy

  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md overflow-hidden"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-foreground/40">
            Month {monthNumber}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {monthlyTheme.theme}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              localStorage.setItem("boost_monthly_focus_dismissed", "true")
              setDismissed(true)
            }}
            className="text-xs text-foreground/30 hover:text-foreground/50 transition-colors"
            title="Dismiss for this session"
          >
            Dismiss
          </button>
          <svg
            className={`w-4 h-4 text-foreground/30 transition-transform ${collapsed ? "" : "rotate-180"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {!collapsed && (
        <div className="px-4 pb-4 pt-1 border-t border-foreground/10 space-y-3">
          {/* Quarter objective */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-foreground/40 mb-1">
              Quarter Objective
            </p>
            <p className="text-sm text-foreground/80">
              {quarterFocus.primaryObjective}
            </p>
          </div>

          {/* Month milestone */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-foreground/40 mb-1">
              This Month&apos;s Milestone
            </p>
            <p className="text-sm text-foreground/80">
              {monthlyTheme.milestone}
            </p>
          </div>

          {/* Channel + metric row */}
          <div className="flex gap-4 text-xs text-foreground/50">
            <span>
              Channel: <span className="text-foreground/70">{quarterFocus.channelStrategy.primary}</span>
            </span>
            <span>
              Target: <span className="text-foreground/70">{quarterFocus.successMetric.metric} → {quarterFocus.successMetric.target}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
