'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CalendarTask, ScheduleResponse, TaskStatus } from '@/lib/types/taskSchedule'

interface UseCalendarTasksOptions {
  runId: string
}

interface UseCalendarTasksReturn {
  tasks: CalendarTask[]
  tasksByDay: Map<number, CalendarTask[]>
  stats: ScheduleResponse['stats'] | null
  planStartDate: string | null
  isLoading: boolean
  error: string | null
  // Mutations
  updateTask: (taskId: string, updates: { scheduledDay?: number; status?: TaskStatus; notes?: string }) => Promise<void>
  bulkUpdateTasks: (updates: Array<{ taskId: string; updates: { scheduledDay?: number; status?: TaskStatus; notes?: string } }>) => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook for managing calendar tasks with optimistic updates
 */
export function useCalendarTasks({ runId }: UseCalendarTasksOptions): UseCalendarTasksReturn {
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [stats, setStats] = useState<ScheduleResponse['stats'] | null>(null)
  const [planStartDate, setPlanStartDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/runs/${runId}/schedule`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch tasks')
      }

      const data: ScheduleResponse = await response.json()
      setTasks(data.tasks)
      setStats(data.stats)
      setPlanStartDate(data.planStartDate)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks'
      setError(message)
      console.error('[useCalendarTasks] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [runId])

  // Initial fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Group tasks by scheduled day
  const tasksByDay = useMemo(() => {
    const map = new Map<number, CalendarTask[]>()
    for (const task of tasks) {
      const day = task.scheduledDay
      const existing = map.get(day) || []
      existing.push(task)
      map.set(day, existing)
    }
    return map
  }, [tasks])

  // Update single task with optimistic update
  const updateTask = useCallback(async (
    taskId: string,
    updates: { scheduledDay?: number; status?: TaskStatus; notes?: string }
  ) => {
    // Optimistic update
    const previousTasks = [...tasks]
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task
      return {
        ...task,
        scheduledDay: updates.scheduledDay ?? task.scheduledDay,
        status: updates.status ?? task.status,
        notes: updates.notes ?? task.notes,
        completedAt: updates.status === 'completed' ? new Date().toISOString() : task.completedAt,
      }
    }))

    // Update stats optimistically
    if (updates.status) {
      setStats(prev => {
        if (!prev) return prev
        const oldTask = previousTasks.find(t => t.id === taskId)
        if (!oldTask) return prev

        const newStats = { ...prev }
        // Decrement old status
        if (oldTask.status === 'pending') newStats.pending--
        else if (oldTask.status === 'completed') newStats.completed--
        else if (oldTask.status === 'skipped') newStats.skipped--
        // Increment new status
        if (updates.status === 'pending') newStats.pending++
        else if (updates.status === 'completed') newStats.completed++
        else if (updates.status === 'skipped') newStats.skipped++

        return newStats
      })
    }

    try {
      const response = await fetch(`/api/runs/${runId}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, updates }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update task')
      }
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      console.error('[useCalendarTasks] Update error:', err)
      throw err
    }
  }, [runId, tasks])

  // Bulk update tasks (for drag operations)
  const bulkUpdateTasks = useCallback(async (
    updates: Array<{ taskId: string; updates: { scheduledDay?: number; status?: TaskStatus; notes?: string } }>
  ) => {
    // Optimistic update
    const previousTasks = [...tasks]
    setTasks(prev => {
      const updateMap = new Map(updates.map(u => [u.taskId, u.updates]))
      return prev.map(task => {
        const taskUpdates = updateMap.get(task.id)
        if (!taskUpdates) return task
        return {
          ...task,
          scheduledDay: taskUpdates.scheduledDay ?? task.scheduledDay,
          status: taskUpdates.status ?? task.status,
          notes: taskUpdates.notes ?? task.notes,
          completedAt: taskUpdates.status === 'completed' ? new Date().toISOString() : task.completedAt,
        }
      })
    })

    try {
      const response = await fetch(`/api/runs/${runId}/schedule/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update tasks')
      }
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      console.error('[useCalendarTasks] Bulk update error:', err)
      throw err
    }
  }, [runId, tasks])

  return {
    tasks,
    tasksByDay,
    stats,
    planStartDate,
    isLoading,
    error,
    updateTask,
    bulkUpdateTasks,
    refetch: fetchTasks,
  }
}
