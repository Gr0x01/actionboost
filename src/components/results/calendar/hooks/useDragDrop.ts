'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { CalendarTask } from '@/lib/types/taskSchedule'

export interface UseDragDropOptions {
  onTaskMove: (taskId: string, newDay: number) => Promise<void>
}

export interface UseDragDropReturn {
  activeTask: CalendarTask | null
  overDay: number | null
  sensors: ReturnType<typeof useSensors>
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
  // Components
  DndContext: typeof DndContext
  DragOverlay: typeof DragOverlay
}

/**
 * Hook wrapping @dnd-kit for calendar task drag-drop
 */
export function useDragDrop({ onTaskMove }: UseDragDropOptions): UseDragDropReturn {
  const [activeTask, setActiveTask] = useState<CalendarTask | null>(null)
  const [overDay, setOverDay] = useState<number | null>(null)

  // Configure sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Must drag 8px before activating
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Long press to start drag on touch
        tolerance: 5,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current as CalendarTask
    setActiveTask(task)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (over) {
      // The droppable ID is the day number
      const day = typeof over.id === 'number' ? over.id : parseInt(String(over.id), 10)
      if (!isNaN(day)) {
        setOverDay(day)
      }
    } else {
      setOverDay(null)
    }
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && activeTask) {
      const newDay = typeof over.id === 'number' ? over.id : parseInt(String(over.id), 10)
      if (!isNaN(newDay) && newDay !== activeTask.scheduledDay) {
        try {
          await onTaskMove(activeTask.id, newDay)
        } catch (err) {
          console.error('[useDragDrop] Move failed:', err)
        }
      }
    }

    setActiveTask(null)
    setOverDay(null)
  }, [activeTask, onTaskMove])

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setOverDay(null)
  }, [])

  return {
    activeTask,
    overDay,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    DndContext,
    DragOverlay,
  }
}
