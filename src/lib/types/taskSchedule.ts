/**
 * Task Schedule Types for Calendar View
 *
 * Used to track user customizations to the 30-day marketing plan:
 * - Rescheduling tasks to different days
 * - Marking tasks as completed or skipped
 * - Adding notes to tasks
 */

import type { DayAction, DetailedWeek, RoadmapWeek } from '@/lib/ai/formatter-types'

// =============================================================================
// TASK STATUS
// =============================================================================

export type TaskStatus = 'pending' | 'completed' | 'skipped'

// =============================================================================
// TASK ID HELPERS
// =============================================================================

/**
 * Generate a unique task ID from week and task index
 * Format: "week-{weekNum}-task-{taskIndex}"
 */
export function makeTaskId(weekNum: number, taskIndex: number): string {
  return `week-${weekNum}-task-${taskIndex}`
}

/**
 * Parse a task ID back into week number and task index
 * Returns null if the ID is invalid
 */
export function parseTaskId(taskId: string): { weekNum: number; taskIndex: number } | null {
  const match = taskId.match(/^week-(\d+)-task-(\d+)$/)
  if (!match) return null
  return {
    weekNum: parseInt(match[1], 10),
    taskIndex: parseInt(match[2], 10),
  }
}

// =============================================================================
// TASK CUSTOMIZATION (Individual task override)
// =============================================================================

export interface TaskCustomization {
  /** Original day number (1-30) from the plan */
  originalDay: number
  /** User's chosen day (may differ from original) */
  scheduledDay: number
  /** Task status */
  status: TaskStatus
  /** ISO timestamp when completed */
  completedAt?: string
  /** User notes (max 1000 chars) */
  notes?: string
}

// =============================================================================
// TASK SCHEDULE (Full JSONB structure)
// =============================================================================

export interface TaskSchedule {
  /** Schema version for future migrations */
  version: 1
  /** ISO timestamp of last update */
  updatedAt: string
  /** Task customizations keyed by task ID */
  tasks: Record<string, TaskCustomization>
}

// =============================================================================
// CALENDAR TASK (Merged view for rendering)
// =============================================================================

export interface CalendarTask {
  /** Unique task ID */
  id: string
  /** Week number (1-4) */
  weekNum: number
  /** Index within the week */
  taskIndex: number
  /** The action/task description */
  action: string
  /** Time estimate string (e.g., "2 hrs") */
  timeEstimate: string
  /** Success metric */
  successMetric: string
  /** Week theme */
  weekTheme: string
  /** Original day number (1-30) */
  originalDay: number
  /** Scheduled day (may be rescheduled by user) */
  scheduledDay: number
  /** Task status */
  status: TaskStatus
  /** Completion timestamp */
  completedAt?: string
  /** User notes */
  notes?: string
}

// =============================================================================
// API TYPES
// =============================================================================

export interface ScheduleResponse {
  planStartDate: string | null
  tasks: CalendarTask[]
  stats: {
    total: number
    completed: number
    skipped: number
    pending: number
  }
}

export interface TaskUpdateRequest {
  taskId: string
  updates: {
    scheduledDay?: number
    status?: TaskStatus
    notes?: string
  }
}

export interface BulkUpdateRequest {
  updates: TaskUpdateRequest[]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create an empty task schedule
 */
export function createEmptySchedule(): TaskSchedule {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    tasks: {},
  }
}

/**
 * Get the original day number for a task based on week and position
 * Week 1: days 1-7, Week 2: days 8-14, etc.
 */
export function getOriginalDay(weekNum: number, dayInWeek: number): number {
  return (weekNum - 1) * 7 + dayInWeek
}

/**
 * Get the week number from a day number (1-30)
 */
export function getWeekFromDay(day: number): number {
  return Math.ceil(day / 7)
}

/**
 * Get the day within the week (1-7) from an absolute day number
 */
export function getDayInWeek(day: number): number {
  const dayInWeek = day % 7
  return dayInWeek === 0 ? 7 : dayInWeek
}

/**
 * Extract all tasks from structured output and merge with customizations
 */
export function mergeTasksWithSchedule(
  weeks: DetailedWeek[] | undefined,
  thisWeekDays: DayAction[],
  roadmapWeeks: RoadmapWeek[],
  schedule: TaskSchedule | null
): CalendarTask[] {
  const tasks: CalendarTask[] = []
  const customizations = schedule?.tasks || {}

  // Use detailed weeks if available (new format)
  if (weeks && weeks.length > 0) {
    for (const week of weeks) {
      for (let i = 0; i < week.days.length; i++) {
        const day = week.days[i]
        const taskId = makeTaskId(week.week, i)
        const customization = customizations[taskId]
        const originalDay = day.day // Already has absolute day number

        tasks.push({
          id: taskId,
          weekNum: week.week,
          taskIndex: i,
          action: day.action,
          timeEstimate: day.timeEstimate,
          successMetric: day.successMetric,
          weekTheme: week.theme,
          originalDay,
          scheduledDay: customization?.scheduledDay ?? originalDay,
          status: customization?.status ?? 'pending',
          completedAt: customization?.completedAt,
          notes: customization?.notes,
        })
      }
    }
  } else {
    // Legacy format: thisWeek + roadmapWeeks
    // Week 1 from thisWeek
    for (let i = 0; i < thisWeekDays.length; i++) {
      const day = thisWeekDays[i]
      const taskId = makeTaskId(1, i)
      const customization = customizations[taskId]
      const originalDay = day.day

      tasks.push({
        id: taskId,
        weekNum: 1,
        taskIndex: i,
        action: day.action,
        timeEstimate: day.timeEstimate,
        successMetric: day.successMetric,
        weekTheme: '',
        originalDay,
        scheduledDay: customization?.scheduledDay ?? originalDay,
        status: customization?.status ?? 'pending',
        completedAt: customization?.completedAt,
        notes: customization?.notes,
      })
    }

    // Weeks 2-4 from roadmapWeeks (tasks are string[], no day numbers)
    for (const roadmapWeek of roadmapWeeks) {
      if (roadmapWeek.week === 1) continue // Already handled

      for (let i = 0; i < roadmapWeek.tasks.length; i++) {
        const taskId = makeTaskId(roadmapWeek.week, i)
        const customization = customizations[taskId]
        // Calculate day: first day of week + task index
        const originalDay = (roadmapWeek.week - 1) * 7 + i + 1

        tasks.push({
          id: taskId,
          weekNum: roadmapWeek.week,
          taskIndex: i,
          action: roadmapWeek.tasks[i],
          timeEstimate: '',
          successMetric: '',
          weekTheme: roadmapWeek.theme,
          originalDay,
          scheduledDay: customization?.scheduledDay ?? originalDay,
          status: customization?.status ?? 'pending',
          completedAt: customization?.completedAt,
          notes: customization?.notes,
        })
      }
    }
  }

  return tasks
}

/**
 * Calculate task statistics
 */
export function calculateTaskStats(tasks: CalendarTask[]): ScheduleResponse['stats'] {
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    skipped: tasks.filter(t => t.status === 'skipped').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  }
}
