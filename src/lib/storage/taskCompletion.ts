/**
 * localStorage helpers for task completion tracking
 *
 * Storage key format: actionboost-tasks-{runId}
 * Value format: { [taskIndex]: boolean }
 *
 * Note: We use task array index as the key (not day number) because
 * multiple tasks can exist on the same day.
 */

const STORAGE_PREFIX = 'actionboost-tasks-'

export type TaskCompletionState = Record<number, boolean>

/**
 * Get completed tasks for a run
 */
export function getCompletedTasks(runId: string): TaskCompletionState {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${runId}`)
    if (!stored) return {}

    const parsed = JSON.parse(stored)

    // Validate the parsed data is an object with boolean values
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {}
    }

    // Filter to only valid number keys with boolean values
    const validated: TaskCompletionState = {}
    for (const [key, value] of Object.entries(parsed)) {
      const numKey = Number(key)
      if (!isNaN(numKey) && typeof value === 'boolean') {
        validated[numKey] = value
      }
    }

    return validated
  } catch {
    return {}
  }
}

/**
 * Toggle task completion for a specific task index
 */
export function toggleTaskCompletion(runId: string, taskIndex: number): TaskCompletionState {
  if (typeof window === 'undefined') return {}

  const current = getCompletedTasks(runId)
  const updated = {
    ...current,
    [taskIndex]: !current[taskIndex],
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${runId}`, JSON.stringify(updated))
  } catch (err) {
    console.warn('[TaskCompletion] Failed to save:', err)
  }

  return updated
}

/**
 * Set task completion for a specific task index
 */
export function setTaskCompletion(runId: string, taskIndex: number, completed: boolean): TaskCompletionState {
  if (typeof window === 'undefined') return {}

  const current = getCompletedTasks(runId)
  const updated = {
    ...current,
    [taskIndex]: completed,
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${runId}`, JSON.stringify(updated))
  } catch (err) {
    console.warn('[TaskCompletion] Failed to save:', err)
  }

  return updated
}

/**
 * Get completion count for a run
 */
export function getCompletionCount(runId: string, totalDays: number): { completed: number; total: number } {
  const tasks = getCompletedTasks(runId)
  const completed = Object.values(tasks).filter(Boolean).length
  return { completed, total: totalDays }
}

/**
 * Clear all task completions for a run
 */
export function clearTaskCompletions(runId: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${runId}`)
  } catch (err) {
    console.warn('[TaskCompletion] Failed to clear:', err)
  }
}
