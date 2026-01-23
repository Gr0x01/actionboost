'use client'

import React from 'react'
import type { DayAction } from '@/lib/ai/formatter-types'
import type { TaskCompletionState } from '@/lib/storage/taskCompletion'
import { TaskCard } from './TaskCard'
import { SectionLabel } from '@/components/ui/SectionLabel'

/**
 * Get human-readable day label relative to start of current week.
 * Normalizes absolute day numbers (1-28) to within-week context (1-7).
 *
 * Note: Labels are relative to current date (day 1 = "Today").
 * This is intentional - tasks are meant to be worked on starting now.
 */
function getDayLabel(dayNumber: number): string {
  const dayWithinWeek = ((dayNumber - 1) % 7) + 1

  if (dayWithinWeek === 1) return 'Today'
  if (dayWithinWeek === 2) return 'Tomorrow'

  const date = new Date()
  date.setDate(date.getDate() + (dayWithinWeek - 1))
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export interface TaskGridProps {
  tasks: DayAction[]
  taskStates: TaskCompletionState
  onComplete: (index: number) => void
  onSkip: (index: number) => void
  onReset: (index: number) => void
  excludeIndex?: number
}

/**
 * TaskGrid - Main task list grouped by day
 */
export function TaskGrid({
  tasks,
  taskStates,
  onComplete,
  onSkip,
  onReset,
  excludeIndex,
}: TaskGridProps) {
  // Group tasks by day and track which days we've seen
  let lastDay = 0

  // Filter out skipped tasks and the excluded index (hero task)
  const visibleTasks = tasks
    .map((task, i) => ({ task, index: i }))
    .filter(({ index }) => {
      if (index === excludeIndex) return false
      const status = taskStates[index] ?? 'pending'
      if (status === 'skipped') return false
      return true
    })

  if (visibleTasks.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
      {visibleTasks.map(({ task, index: taskIndex }) => {
        const status = taskStates[taskIndex] ?? 'pending'
        const showDayLabel = task.day !== lastDay
        lastDay = task.day

        return (
          <React.Fragment key={taskIndex}>
            {showDayLabel && (
              <div className="col-span-1 md:col-span-2 mt-6 first:mt-0">
                <SectionLabel>{getDayLabel(task.day)}</SectionLabel>
              </div>
            )}
            <TaskCard
              task={task}
              status={status}
              onComplete={() => onComplete(taskIndex)}
              onSkip={() => onSkip(taskIndex)}
              onReset={() => onReset(taskIndex)}
            />
          </React.Fragment>
        )
      })}
    </div>
  )
}
