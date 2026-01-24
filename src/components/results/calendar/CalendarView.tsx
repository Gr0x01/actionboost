'use client'

import { useState, useCallback } from 'react'
import { parseISO, addDays } from 'date-fns'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { StructuredOutput } from '@/lib/ai/formatter-types'
import type { CalendarTask as CalendarTaskType } from '@/lib/types/taskSchedule'
import { useCalendarTasks } from './hooks/useCalendarTasks'
import { useDragDrop } from './hooks/useDragDrop'
import { CalendarGrid } from './CalendarGrid'
import { CalendarTaskOverlay } from './CalendarTask'
import { TaskDetailSidebar } from './TaskDetailSidebar'
import { MobileWeekView } from './MobileWeekView'
import { MobileTaskSheet } from './MobileTaskSheet'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { Loader2, AlertCircle, Circle } from 'lucide-react'

interface CalendarViewProps {
  runId: string
  structuredOutput: StructuredOutput
  planStartDate: string | null
}

/**
 * CalendarView - Main container for calendar task view
 * Responsive: Desktop shows month grid, mobile shows week list
 */
export function CalendarView({ runId, structuredOutput, planStartDate }: CalendarViewProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [selectedTask, setSelectedTask] = useState<CalendarTaskType | null>(null)

  const {
    tasks,
    tasksByDay,
    stats,
    planStartDate: fetchedStartDate,
    isLoading,
    error,
    updateTask,
  } = useCalendarTasks({ runId })

  // Use fetched start date or fallback to prop or today
  const startDateString = fetchedStartDate || planStartDate || new Date().toISOString().split('T')[0]
  const startDate = parseISO(startDateString)

  // Drag-drop handlers
  const handleTaskMove = useCallback(async (taskId: string, newDay: number) => {
    await updateTask(taskId, { scheduledDay: newDay })
  }, [updateTask])

  const {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragDrop({ onTaskMove: handleTaskMove })

  // Task click handler
  const handleTaskClick = useCallback((task: CalendarTaskType) => {
    setSelectedTask(task)
  }, [])

  // Status toggle handler (checkbox click)
  const handleTaskStatusToggle = useCallback(async (task: CalendarTaskType) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await updateTask(task.id, { status: newStatus })
  }, [updateTask])

  // Task update handler (from sidebar/sheet)
  const handleTaskUpdate = useCallback(async (updates: Parameters<typeof updateTask>[1]) => {
    if (!selectedTask) return
    await updateTask(selectedTask.id, updates)
    // Update local selected task state
    setSelectedTask(prev => prev ? { ...prev, ...updates } : null)
  }, [selectedTask, updateTask])

  // Close sidebar/sheet
  const handleClose = useCallback(() => {
    setSelectedTask(null)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-foreground/40 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-foreground/70 mb-2">Failed to load calendar</p>
        <p className="text-sm text-foreground/50">{error}</p>
      </div>
    )
  }

  // No tasks
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Circle className="w-8 h-8 text-foreground/30 mb-3" />
        <p className="text-foreground/70">No tasks in your plan</p>
        <p className="text-sm text-foreground/50 mt-1">
          Check the Tasks tab for your weekly breakdown
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar - Desktop or Mobile */}
      {isMobile ? (
        // Mobile: Week-by-week accordion
        <>
          <MobileWeekView
            tasks={tasks}
            planStartDate={startDate}
            onTaskClick={handleTaskClick}
          />
          <MobileTaskSheet
            task={selectedTask}
            planStartDate={startDate}
            onClose={handleClose}
            onUpdate={handleTaskUpdate}
          />
        </>
      ) : (
        // Desktop: Month grid with drag-drop
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <CalendarGrid
            planStartDate={startDate}
            tasksByDay={tasksByDay}
            onTaskClick={handleTaskClick}
            onTaskStatusToggle={handleTaskStatusToggle}
            stats={stats}
          />

          {/* Drag overlay */}
          <DragOverlay>
            {activeTask && <CalendarTaskOverlay task={activeTask} />}
          </DragOverlay>

          {/* Task detail sidebar */}
          {selectedTask && (
            <TaskDetailSidebar
              task={selectedTask}
              planStartDate={startDate}
              onClose={handleClose}
              onUpdate={handleTaskUpdate}
            />
          )}
        </DndContext>
      )}

      {/* Help text */}
      <p className="text-xs text-foreground/40 text-center">
        {isMobile
          ? 'Tap any task to see details and reschedule'
          : 'Drag tasks to reschedule. Click to see details and add notes.'}
      </p>
    </div>
  )
}
