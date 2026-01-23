'use client'

import type { StructuredOutput } from '@/lib/ai/formatter-types'
import { CommandCenter } from './dashboard'

interface DashboardViewProps {
  runId: string
  structuredOutput: StructuredOutput
}

/**
 * DashboardView - "Your action plan" tab for return users
 *
 * Layout:
 * 1. Compact priority #1 reminder (context before tasks)
 * 2. CommandCenter (task checklist, week navigation, progress)
 */
export function DashboardView({ runId, structuredOutput }: DashboardViewProps) {
  const topPriority = structuredOutput.topPriorities[0]

  return (
    <div className="space-y-8">
      {/* Compact priority reminder - context before diving into tasks */}
      {topPriority && (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/[0.02] border border-foreground/10">
          <span className="shrink-0 font-mono text-2xl font-black text-cta/20">
            1
          </span>
          <div className="min-w-0">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40 block mb-1">
              YOUR TOP PRIORITY
            </span>
            <p className="font-semibold text-foreground leading-snug">
              {topPriority.title}
            </p>
          </div>
        </div>
      )}

      {/* Command Center - the main workspace */}
      {structuredOutput.thisWeek.days.length > 0 && (
        <CommandCenter
          runId={runId}
          days={structuredOutput.thisWeek.days}
          totalHours={structuredOutput.thisWeek.totalHours}
          currentWeek={structuredOutput.currentWeek}
          roadmapWeeks={structuredOutput.roadmapWeeks}
        />
      )}
    </div>
  )
}
