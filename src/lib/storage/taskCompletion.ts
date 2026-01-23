/**
 * localStorage helpers for task completion tracking
 *
 * Storage key format: actionboost-tasks-{runId}
 * Value format: { [taskIndex]: TaskStatus }
 *
 * Note: We use task array index as the key (not day number) because
 * multiple tasks can exist on the same day.
 */

const STORAGE_PREFIX = 'actionboost-tasks-'

export type TaskStatus = 'pending' | 'completed' | 'skipped'

// Legacy format (boolean) for backward compatibility
type LegacyTaskState = Record<number, boolean>

// New format with explicit status
export type TaskCompletionState = Record<number, TaskStatus>

/**
 * Migrate legacy boolean format to new status format
 */
function migrateLegacyState(legacy: LegacyTaskState): TaskCompletionState {
  const migrated: TaskCompletionState = {}
  for (const [key, value] of Object.entries(legacy)) {
    const numKey = Number(key)
    if (!isNaN(numKey)) {
      migrated[numKey] = value ? 'completed' : 'pending'
    }
  }
  return migrated
}

/**
 * Get task states for a run (handles legacy boolean format migration)
 */
export function getTaskStates(runId: string): TaskCompletionState {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${runId}`)
    if (!stored) return {}

    const parsed = JSON.parse(stored)

    // Validate the parsed data is an object
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {}
    }

    // Check if this is legacy format (boolean values) or new format (string values)
    const firstValue = Object.values(parsed)[0]
    if (typeof firstValue === 'boolean') {
      // Migrate legacy format
      const migrated = migrateLegacyState(parsed as LegacyTaskState)
      // Save migrated format back to storage
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${runId}`, JSON.stringify(migrated))
      } catch {
        // Ignore save errors during migration
      }
      return migrated
    }

    // New format - validate and filter
    const validated: TaskCompletionState = {}
    for (const [key, value] of Object.entries(parsed)) {
      const numKey = Number(key)
      if (!isNaN(numKey) && (value === 'pending' || value === 'completed' || value === 'skipped')) {
        validated[numKey] = value as TaskStatus
      }
    }

    return validated
  } catch {
    return {}
  }
}

/**
 * @deprecated Use getTaskStates instead
 */
export function getCompletedTasks(runId: string): TaskCompletionState {
  return getTaskStates(runId)
}

/**
 * Set task status for a specific task index
 */
export function setTaskStatus(runId: string, taskIndex: number, status: TaskStatus): TaskCompletionState {
  if (typeof window === 'undefined') return {}

  const current = getTaskStates(runId)
  const updated = {
    ...current,
    [taskIndex]: status,
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${runId}`, JSON.stringify(updated))
  } catch (err) {
    console.warn('[TaskCompletion] Failed to save:', err)
  }

  return updated
}

/**
 * Complete a task
 */
export function completeTask(runId: string, taskIndex: number): TaskCompletionState {
  return setTaskStatus(runId, taskIndex, 'completed')
}

/**
 * Skip a task (mark as "not right now")
 */
export function skipTask(runId: string, taskIndex: number): TaskCompletionState {
  return setTaskStatus(runId, taskIndex, 'skipped')
}

/**
 * Reset a task back to pending
 */
export function resetTask(runId: string, taskIndex: number): TaskCompletionState {
  return setTaskStatus(runId, taskIndex, 'pending')
}

/**
 * Toggle task completion (pending <-> completed)
 */
export function toggleTaskCompletion(runId: string, taskIndex: number): TaskCompletionState {
  if (typeof window === 'undefined') return {}

  const current = getTaskStates(runId)
  const currentStatus = current[taskIndex] ?? 'pending'
  const newStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed'

  return setTaskStatus(runId, taskIndex, newStatus)
}

/**
 * @deprecated Use setTaskStatus instead
 */
export function setTaskCompletion(runId: string, taskIndex: number, completed: boolean): TaskCompletionState {
  return setTaskStatus(runId, taskIndex, completed ? 'completed' : 'pending')
}

/**
 * Get task counts for a run
 */
export function getTaskCounts(runId: string, totalTasks: number): {
  completed: number
  skipped: number
  pending: number
  total: number
} {
  const tasks = getTaskStates(runId)
  const completed = Object.values(tasks).filter(s => s === 'completed').length
  const skipped = Object.values(tasks).filter(s => s === 'skipped').length
  const pending = totalTasks - completed - skipped
  return { completed, skipped, pending, total: totalTasks }
}

/**
 * @deprecated Use getTaskCounts instead
 */
export function getCompletionCount(runId: string, totalDays: number): { completed: number; total: number } {
  const { completed, total } = getTaskCounts(runId, totalDays)
  return { completed, total }
}

/**
 * Clear all task states for a run
 */
export function clearTaskStates(runId: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${runId}`)
  } catch (err) {
    console.warn('[TaskCompletion] Failed to clear:', err)
  }
}

/**
 * @deprecated Use clearTaskStates instead
 */
export function clearTaskCompletions(runId: string): void {
  clearTaskStates(runId)
}

/**
 * Get the index of the next actionable task (first pending task that's not skipped)
 */
export function getNextTaskIndex(runId: string, totalTasks: number): number | null {
  const states = getTaskStates(runId)

  for (let i = 0; i < totalTasks; i++) {
    const status = states[i] ?? 'pending'
    if (status === 'pending') {
      return i
    }
  }

  return null // All tasks completed or skipped
}
