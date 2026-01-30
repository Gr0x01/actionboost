'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { DayAction, RoadmapWeek, StructuredOutput } from '@/lib/ai/formatter-types'
import {
  getTaskStates,
  completeTask,
  skipTask,
  resetTask,
  type TaskCompletionState,
} from '@/lib/storage/taskCompletion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import {
  StartHereBanner,
  AllDoneBanner,
  ProgressBar,
  TaskGrid,
  TaskSection,
  WeekPreview,
  CompletedWeekPreview,
} from './tasks'

interface TasksViewProps {
  runId: string
  structuredOutput: StructuredOutput
}

/**
 * TasksView - Main component for Tasks tab
 * Orchestrates task management, state persistence, and week navigation
 */
export function TasksView({ runId, structuredOutput }: TasksViewProps) {
  const [taskStates, setTaskStates] = useState<TaskCompletionState>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set())
  const [expandedCompletedWeeks, setExpandedCompletedWeeks] = useState<Set<number>>(new Set())

  // Persist active week in localStorage (SSR-safe)
  const activeWeekKey = `${runId}-active-week`
  const [activeWeek, setActiveWeek] = useState(1)

  // Load active week from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(activeWeekKey)
    if (stored) {
      setActiveWeek(parseInt(stored, 10))
    }
  }, [activeWeekKey])

  // Save active week when it changes
  useEffect(() => {
    try {
      localStorage.setItem(activeWeekKey, String(activeWeek))
    } catch (err) {
      console.warn('[TasksView] Failed to save active week:', err)
    }
  }, [activeWeek, activeWeekKey])

  // Use new detailed weeks array if available, fallback to legacy structure
  const detailedWeeks = useMemo(() => structuredOutput.weeks || [], [structuredOutput.weeks])
  const hasDetailedWeeks = detailedWeeks.length > 0

  // Legacy fallback data
  const week1Days = structuredOutput.thisWeek.days
  const legacyRoadmapWeeks = structuredOutput.roadmapWeeks

  // Get current week's tasks
  const getCurrentWeekTasks = (): DayAction[] => {
    if (hasDetailedWeeks) {
      const week = detailedWeeks.find(w => w.week === activeWeek)
      if (week) return week.days
    }

    if (activeWeek === 1) {
      return week1Days
    }

    const legacyWeek = legacyRoadmapWeeks.find(w => w.week === activeWeek)
    if (legacyWeek) {
      return legacyWeek.tasks.map((task, i) => ({
        day: (activeWeek - 1) * 7 + i + 1,
        action: task,
        timeEstimate: '',
        successMetric: '',
      }))
    }

    return []
  }

  const currentWeekTasks = getCurrentWeekTasks()

  // Get current week theme
  const getCurrentWeekTheme = (): string => {
    if (hasDetailedWeeks) {
      const week = detailedWeeks.find(w => w.week === activeWeek)
      if (week) return week.theme
    }
    const legacyWeek = legacyRoadmapWeeks.find(w => w.week === activeWeek)
    return legacyWeek?.theme || ''
  }

  const currentWeekTheme = getCurrentWeekTheme()

  // Future weeks for "Coming up" section
  const futureWeeks = hasDetailedWeeks
    ? detailedWeeks.filter(w => w.week > activeWeek).map(w => ({
        week: w.week,
        theme: w.theme,
        tasks: w.days.map(d => d.action),
      }))
    : legacyRoadmapWeeks.filter(w => w.week > activeWeek)

  // Completed weeks for "Done" section (weeks before active week)
  const completedWeeksData = useMemo(() => {
    const weeks: Array<{
      week: RoadmapWeek
      tasks: Array<{ action: string; completed: boolean }>
      completedCount: number
      totalCount: number
    }> = []

    for (let weekNum = 1; weekNum < activeWeek; weekNum++) {
      const weekStorageKey = `${runId}-week-${weekNum}`
      const weekTaskStates = getTaskStates(weekStorageKey)

      let weekData: RoadmapWeek
      let taskActions: string[]

      if (hasDetailedWeeks) {
        const detailed = detailedWeeks?.find(w => w.week === weekNum)
        if (detailed) {
          weekData = { week: weekNum, theme: detailed.theme, tasks: detailed.days.map(d => d.action) }
          taskActions = detailed.days.map(d => d.action)
        } else continue
      } else {
        if (weekNum === 1) {
          weekData = { week: 1, theme: '', tasks: week1Days.map(d => d.action) }
          taskActions = week1Days.map(d => d.action)
        } else {
          const legacy = legacyRoadmapWeeks?.find(w => w.week === weekNum)
          if (legacy) {
            weekData = legacy
            taskActions = legacy.tasks
          } else continue
        }
      }

      const tasks = taskActions.map((action, i) => ({
        action,
        completed: weekTaskStates[i] === 'completed',
      }))
      const completedCount = tasks.filter(t => t.completed).length

      weeks.push({
        week: weekData,
        tasks,
        completedCount,
        totalCount: tasks.length,
      })
    }

    return weeks
  }, [activeWeek, runId, hasDetailedWeeks, detailedWeeks, legacyRoadmapWeeks, week1Days])

  // Storage key based on active week
  const storageKey = `${runId}-week-${activeWeek}`

  // Load task states on mount and when week changes
  useEffect(() => {
    setTaskStates(getTaskStates(storageKey))
  }, [storageKey])

  // Calculate counts and indices
  const completedIndices = Object.entries(taskStates)
    .filter(([, status]) => status === 'completed')
    .map(([index]) => parseInt(index))
  const completedCount = completedIndices.length
  const skippedIndices = Object.entries(taskStates)
    .filter(([, status]) => status === 'skipped')
    .map(([index]) => parseInt(index))

  // Find the next pending task for the hero banner
  const nextPendingIndex = currentWeekTasks.findIndex((_, i) => {
    const status = taskStates[i] ?? 'pending'
    return status === 'pending'
  })

  const nextTask = nextPendingIndex >= 0 ? currentWeekTasks[nextPendingIndex] : null
  const allDone = nextPendingIndex === -1

  // Calculate next week number (if any)
  const maxWeek = hasDetailedWeeks
    ? Math.max(...detailedWeeks.map(w => w.week), 1)
    : Math.max(...legacyRoadmapWeeks.map(w => w.week), 1)
  const nextWeekNumber = activeWeek < maxWeek ? activeWeek + 1 : undefined

  const handleStartNextWeek = () => {
    if (nextWeekNumber) {
      setActiveWeek(nextWeekNumber)
    }
  }

  const handleComplete = (index: number) => {
    setTaskStates(completeTask(storageKey, index))
  }

  const handleSkip = (index: number) => {
    setTaskStates(skipTask(storageKey, index))

    toast('Task skipped', {
      action: {
        label: 'Undo',
        onClick: () => {
          setTaskStates(resetTask(storageKey, index))
        },
      },
      duration: 5000,
    })
  }

  const handleReset = (index: number) => {
    setTaskStates(resetTask(storageKey, index))
  }

  const toggleWeekExpanded = (weekNum: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekNum)) {
        next.delete(weekNum)
      } else {
        next.add(weekNum)
      }
      return next
    })
  }

  const toggleCompletedWeekExpanded = (weekNum: number) => {
    setExpandedCompletedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekNum)) {
        next.delete(weekNum)
      } else {
        next.add(weekNum)
      }
      return next
    })
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <ProgressBar
        completed={completedCount}
        total={currentWeekTasks.length}
      />

      {/* Hero banner - Start here or All done */}
      {allDone ? (
        <AllDoneBanner
          weekNumber={activeWeek}
          nextWeekNumber={nextWeekNumber}
          onStartNextWeek={handleStartNextWeek}
        />
      ) : (
        <AnimatePresence mode="wait">
          {nextTask && (
            <StartHereBanner
              key={nextPendingIndex}
              task={nextTask}
              onComplete={() => handleComplete(nextPendingIndex)}
              onSkip={() => handleSkip(nextPendingIndex)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Current week's tasks (excluding the hero task and skipped tasks) */}
      {!allDone && (
        <div>
          <h3 className="mb-4">
            <SectionLabel>
              Week {activeWeek}{currentWeekTheme && `: ${currentWeekTheme}`}
            </SectionLabel>
          </h3>
          <TaskGrid
            tasks={currentWeekTasks}
            taskStates={taskStates}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onReset={handleReset}
            excludeIndex={nextPendingIndex}
          />

          {/* Skip to next week option */}
          {nextWeekNumber && (
            <div className="mt-6 text-center">
              <button
                onClick={handleStartNextWeek}
                className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                Move to Week {nextWeekNumber}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completed tasks section */}
      <TaskSection
        title="Completed"
        tasks={currentWeekTasks}
        taskIndices={completedIndices}
        onReset={handleReset}
        variant="completed"
      />

      {/* Skipped tasks section */}
      <TaskSection
        title="Revisit when ready"
        tasks={currentWeekTasks}
        taskIndices={skippedIndices}
        onReset={handleReset}
        variant="skipped"
      />

      {/* Future weeks (collapsed) */}
      {futureWeeks.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4">
            <SectionLabel>Coming up</SectionLabel>
          </h3>
          <div className="space-y-3">
            {futureWeeks.map((week) => (
              <WeekPreview
                key={week.week}
                week={week}
                isExpanded={expandedWeeks.has(week.week)}
                onToggle={() => toggleWeekExpanded(week.week)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed weeks (collapsed) */}
      {completedWeeksData.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4">
            <SectionLabel>Done</SectionLabel>
          </h3>
          <div className="space-y-3">
            {completedWeeksData.map((data) => (
              <CompletedWeekPreview
                key={data.week.week}
                week={data.week}
                tasks={data.tasks}
                completedCount={data.completedCount}
                totalCount={data.totalCount}
                isExpanded={expandedCompletedWeeks.has(data.week.week)}
                onToggle={() => toggleCompletedWeekExpanded(data.week.week)}
                onRevisit={() => setActiveWeek(data.week.week)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
