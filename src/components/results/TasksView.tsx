'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import type { DayAction, RoadmapWeek, StructuredOutput } from '@/lib/ai/formatter-types'
import {
  getTaskStates,
  completeTask,
  skipTask,
  resetTask,
  type TaskCompletionState,
  type TaskStatus,
} from '@/lib/storage/taskCompletion'

interface TasksViewProps {
  runId: string
  structuredOutput: StructuredOutput
}

/**
 * Get human-readable day label relative to start of current week
 * Normalizes absolute day numbers (1-28) to within-week context (1-7)
 */
function getDayLabel(dayNumber: number): string {
  // Normalize to day within week (1-7)
  const dayWithinWeek = ((dayNumber - 1) % 7) + 1

  if (dayWithinWeek === 1) return 'Today'
  if (dayWithinWeek === 2) return 'Tomorrow'

  // Calculate the actual date for day 3+
  const date = new Date()
  date.setDate(date.getDate() + (dayWithinWeek - 1))
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Format time estimate in friendly way
 */
function formatTime(timeEstimate: string): string {
  // Already friendly formats like "2 hrs" or "30 min" - add "About" prefix
  const lower = timeEstimate.toLowerCase()
  if (lower.includes('hr') || lower.includes('hour') || lower.includes('min')) {
    return `About ${timeEstimate}`
  }
  // Handle "2h" -> "About 2 hours"
  const hourMatch = lower.match(/^(\d+)h$/)
  if (hourMatch) {
    const hours = parseInt(hourMatch[1])
    return `About ${hours} hour${hours === 1 ? '' : 's'}`
  }
  return `About ${timeEstimate}`
}

/**
 * StartHereBanner - The hero "focus now" component (Soft Brutalist style)
 */
function StartHereBanner({
  task,
  onComplete,
  onSkip,
}: {
  task: DayAction
  onComplete: () => void
  onSkip: () => void
}) {
  const [isChecked, setIsChecked] = useState(false)

  const handleComplete = () => {
    setIsChecked(true)
    // Brief delay to show the check, then complete
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative bg-white border-2 border-foreground rounded-md"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
      >
          {/* Badge on border */}
          <span className="absolute -top-3 left-4 bg-foreground text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide">
            Start here
          </span>

          {/* Time in top right */}
          <span className="absolute -top-3 right-4 font-mono text-xs text-foreground/60 bg-white border border-foreground/20 px-2 py-1 rounded-sm">
            {formatTime(task.timeEstimate)}
          </span>

          {/* Content with checkbox */}
          <div className="flex items-start gap-4 px-5 pt-6 pb-5">
            {/* Checkbox */}
            <button
              onClick={handleComplete}
              disabled={isChecked}
              className={`
                w-7 h-7 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5
                transition-all duration-150
                ${isChecked
                  ? 'border-cta bg-cta'
                  : 'border-foreground bg-white hover:bg-foreground/5 active:scale-95'
                }
              `}
              aria-label="Mark as complete"
            >
              {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground leading-snug">
                {task.action}
              </h3>
              <p className="text-base text-foreground/70 mt-2">
                {task.successMetric}
              </p>
            </div>
          </div>

          {/* Skip link */}
          <div className="px-5 py-3 border-t border-foreground/10">
            <button
              onClick={onSkip}
              className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Not right now
            </button>
          </div>
      </motion.div>
    </div>
  )
}

/**
 * AllDoneBanner - Celebration state when week is complete (Soft Brutalist)
 */
function AllDoneBanner({
  weekNumber,
  nextWeekNumber,
  onStartNextWeek
}: {
  weekNumber: number
  nextWeekNumber?: number
  onStartNextWeek?: () => void
}) {
  return (
    <div
      className="bg-white border-2 border-cta rounded-md p-6 mb-8 text-center max-w-2xl mx-auto"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
    >
      <h3 className="text-xl font-bold text-foreground mb-2">
        Week {weekNumber} complete.
      </h3>
      <p className="text-foreground/60">
        Take a breath. You&apos;ve done the work.
      </p>

      {nextWeekNumber && onStartNextWeek && (
        <button
          onClick={onStartNextWeek}
          className="mt-4 bg-cta text-white font-semibold px-6 py-3 rounded-md
                     border-b-3 border-b-[#B85D10]
                     hover:-translate-y-0.5 hover:shadow-lg
                     active:translate-y-0.5 active:border-b-0
                     transition-all duration-100"
        >
          Start Week {nextWeekNumber}
        </button>
      )}
    </div>
  )
}

/**
 * ProgressBar - Compact progress with encouraging copy (Soft Brutalist)
 */
function ProgressBar({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  // Encouragement messages at milestones
  const getMessage = () => {
    if (completed === 0) return null
    if (completed === total) return 'All done this week.'
    if (completed % 3 === 0) return 'Nice momentum.'
    return null
  }

  const message = getMessage()

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      {/* Progress bar - simple track */}
      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-cta rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-foreground/60">
          <span className="font-semibold">{completed} of {total}</span> this week
        </p>
        {message && (
          <span className="text-sm font-semibold text-cta">
            {message}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * TaskItem - Individual task in the list (Soft Brutalist style)
 */
function TaskItem({
  task,
  status,
  onComplete,
  onSkip,
  onReset,
}: {
  task: DayAction
  status: TaskStatus
  onComplete: () => void
  onSkip: () => void
  onReset: () => void
}) {
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'

  return (
    <div
      className={`
        group flex items-start gap-3 p-4 rounded-lg transition-all duration-100
        ${isCompleted
          ? 'border border-foreground/10 bg-foreground/[0.02]'
          : isSkipped
            ? 'border border-foreground/10 bg-foreground/[0.02]'
            : 'border border-foreground/15 bg-white hover:border-foreground/25'
        }
      `}
    >
      {/* Checkbox or status indicator */}
      {!isSkipped ? (
        <button
          onClick={isCompleted ? onReset : onComplete}
          className={`
            w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5
            transition-all duration-100
            ${isCompleted
              ? 'border-cta bg-cta'
              : 'border-foreground/30 hover:border-foreground/50 hover:bg-foreground/5'
            }
          `}
          aria-label={isCompleted ? 'Undo completion' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>
      ) : (
        <button
          onClick={onReset}
          className="w-6 h-6 rounded-md border border-foreground/20 flex items-center justify-center shrink-0 mt-0.5 hover:border-foreground/40 transition-colors"
          aria-label="Restore task"
        >
          <RotateCcw className="w-3 h-3 text-foreground/40" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        {/* Task text */}
        <p className={`
          font-semibold leading-snug
          ${isCompleted ? 'text-foreground/40 line-through' : ''}
          ${isSkipped ? 'text-foreground/40' : 'text-foreground'}
        `}>
          {task.action}
        </p>

        {/* Deliverable - always visible */}
        <p className={`
          text-sm mt-1
          ${isCompleted || isSkipped ? 'text-foreground/30' : 'text-foreground/50'}
        `}>
          Done when: {task.successMetric}
        </p>
      </div>

      {/* Time estimate + skip option */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`
          font-mono text-xs
          ${isCompleted || isSkipped ? 'text-foreground/30' : 'text-foreground/50'}
        `}>
          {task.timeEstimate}
        </span>

        {!isCompleted && !isSkipped && (
          <button
            onClick={onSkip}
            className="text-xs text-foreground/40 hover:text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * TaskList - Main task list grouped by day
 */
function TaskList({
  tasks,
  taskStates,
  onComplete,
  onSkip,
  onReset,
  startIndex = 0,
  excludeIndex,
}: {
  tasks: DayAction[]
  taskStates: TaskCompletionState
  onComplete: (index: number) => void
  onSkip: (index: number) => void
  onReset: (index: number) => void
  startIndex?: number
  excludeIndex?: number
}) {
  // Group tasks by day and track which days we've seen
  let lastDay = 0

  // Filter out skipped tasks and the excluded index (hero task)
  const visibleTasks = tasks
    .map((task, i) => ({ task, index: startIndex + i }))
    .filter(({ index }) => {
      // Exclude the hero task
      if (index === excludeIndex) return false
      // Exclude skipped tasks (they go to the skipped section)
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
                <p className="font-mono text-xs font-bold uppercase tracking-wide text-foreground/50">
                  {getDayLabel(task.day)}
                </p>
              </div>
            )}
            <TaskItem
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

/**
 * SkippedSection - "Revisit when ready" collapsed section (Soft Brutalist)
 */
function SkippedSection({
  tasks,
  taskIndices,
  onReset,
}: {
  tasks: DayAction[]
  taskIndices: number[]
  onReset: (index: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (taskIndices.length === 0) return null

  return (
    <div className="mt-10 pt-6 border-t-2 border-foreground/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
      >
        <span>Revisit when ready ({taskIndices.length})</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          &#9662;
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {taskIndices.map((taskIndex) => {
            const task = tasks[taskIndex]
            if (!task) return null

            return (
              <div
                key={taskIndex}
                className="flex items-center gap-3 p-3 rounded-md border border-foreground/15 bg-foreground/[0.02] text-foreground/40"
              >
                <button
                  onClick={() => onReset(taskIndex)}
                  className="w-5 h-5 rounded-sm border-2 border-foreground/30 flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/5 transition-colors"
                  aria-label="Restore task"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <span className="text-sm">{task.action}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * CompletedSection - Shows completed tasks with undo option
 */
function CompletedSection({
  tasks,
  taskIndices,
  onReset,
}: {
  tasks: DayAction[]
  taskIndices: number[]
  onReset: (index: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (taskIndices.length === 0) return null

  return (
    <div className="mt-10 pt-6 border-t-2 border-foreground/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
      >
        <span>Completed ({taskIndices.length})</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          &#9662;
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {taskIndices.map((taskIndex) => {
            const task = tasks[taskIndex]
            if (!task) return null

            return (
              <div
                key={taskIndex}
                className="flex items-center gap-3 p-3 rounded-md border border-foreground/15 bg-foreground/[0.02]"
              >
                <button
                  onClick={() => onReset(taskIndex)}
                  className="w-5 h-5 rounded-sm border-2 border-cta bg-cta flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Undo completion"
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </button>
                <span className="text-sm text-foreground/40 line-through">{task.action}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * WeekPreview - Collapsed preview for future weeks (Strong Brutalist)
 */
function WeekPreview({
  week,
  isExpanded,
  onToggle,
}: {
  week: RoadmapWeek
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="border-2 border-foreground rounded-md overflow-hidden bg-white"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors text-left"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm font-bold uppercase tracking-wide text-foreground/50">
            Week {week.week}
          </span>
          <span className="font-semibold text-lg text-foreground">{week.theme}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/40">
          <span className="font-mono text-sm">{week.tasks.length} tasks</span>
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            &#9662;
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t-2 border-foreground/10">
              <ul className="mt-3 space-y-3">
                {week.tasks.map((task, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                    className="flex items-start gap-3 text-base text-foreground/70"
                  >
                    <span className="text-foreground/40 font-mono text-sm mt-0.5">{i + 1}.</span>
                    <span>{task}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * CompletedWeekPreview - Muted card for finished weeks (Soft style)
 */
function CompletedWeekPreview({
  week,
  completedCount,
  totalCount,
  tasks,
  isExpanded,
  onToggle,
  onRevisit,
}: {
  week: RoadmapWeek
  completedCount: number
  totalCount: number
  tasks: Array<{ action: string; completed: boolean }>
  isExpanded: boolean
  onToggle: () => void
  onRevisit: () => void
}) {
  return (
    <div className="border border-foreground/15 rounded-md overflow-hidden bg-foreground/[0.02]">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onToggle}
          className="flex items-baseline gap-3 hover:opacity-70 transition-opacity text-left"
        >
          <span className="font-mono text-sm font-bold uppercase tracking-wide text-foreground/40">
            Week {week.week}
          </span>
          <span className="font-semibold text-lg text-foreground/50">{week.theme}</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-foreground/40">{completedCount}/{totalCount} done</span>
          <button
            onClick={onRevisit}
            className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            Revisit
          </button>
          <button
            onClick={onToggle}
            className="text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            <span className={`transition-transform inline-block ${isExpanded ? 'rotate-180' : ''}`}>
              &#9662;
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-foreground/10">
              <ul className="mt-3 space-y-3">
                {tasks.map((task, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-base"
                  >
                    <span className="text-foreground/30 font-mono text-sm mt-0.5">{i + 1}.</span>
                    <span className={task.completed ? 'text-foreground/40 line-through decoration-foreground/20' : 'text-foreground/50'}>
                      {task.action}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * TasksView - Main component for Tasks tab
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
  const hasDetailedWeeks = structuredOutput.weeks && structuredOutput.weeks.length > 0
  const detailedWeeks = structuredOutput.weeks || []

  // Legacy fallback data
  const week1Days = structuredOutput.thisWeek.days
  const legacyRoadmapWeeks = structuredOutput.roadmapWeeks

  // Get current week's tasks
  const getCurrentWeekTasks = (): DayAction[] => {
    // Try new detailed weeks first
    if (hasDetailedWeeks) {
      const week = detailedWeeks.find(w => w.week === activeWeek)
      if (week) return week.days
    }

    // Fallback to legacy: Week 1 from thisWeek, others from roadmapWeeks
    if (activeWeek === 1) {
      return week1Days
    }

    // Legacy weeks 2-4: simple strings converted to DayAction
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
  // Memoized to avoid reading localStorage on every render
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
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">
            Week {activeWeek}{currentWeekTheme && `: ${currentWeekTheme}`}
          </h3>
          <TaskList
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
      <CompletedSection
        tasks={currentWeekTasks}
        taskIndices={completedIndices}
        onReset={handleReset}
      />

      {/* Skipped tasks section */}
      <SkippedSection
        tasks={currentWeekTasks}
        taskIndices={skippedIndices}
        onReset={handleReset}
      />

      {/* Future weeks (collapsed) */}
      {futureWeeks.length > 0 && (
        <div className="mt-12">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">
            Coming up
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
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">
            Done
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
