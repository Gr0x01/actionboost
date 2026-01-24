'use client'

import { useDroppable } from '@dnd-kit/core'
import { format, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import type { CalendarTask as CalendarTaskType } from '@/lib/types/taskSchedule'
import { CalendarTask } from './CalendarTask'

interface CalendarDayProps {
  date: Date
  dayNumber: number // 1-30 for the plan
  tasks: CalendarTaskType[]
  isCurrentMonth: boolean
  onTaskClick: (task: CalendarTaskType) => void
  onTaskStatusToggle?: (task: CalendarTaskType) => void
  maxVisibleTasks?: number
}

/**
 * CalendarDay - Droppable day cell in the calendar grid
 * Soft Brutalist: subtle borders, clean typography
 */
export function CalendarDay({
  date,
  dayNumber,
  tasks,
  isCurrentMonth,
  onTaskClick,
  onTaskStatusToggle,
  maxVisibleTasks = 3,
}: CalendarDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dayNumber,
  })

  const today = isToday(date)
  const isPast = isBefore(startOfDay(date), startOfDay(new Date()))
  const visibleTasks = tasks.slice(0, maxVisibleTasks)
  const hiddenCount = tasks.length - maxVisibleTasks

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[120px] p-2.5
        border-r border-b border-foreground/10
        ${!isCurrentMonth ? 'bg-foreground/[0.02]' : 'bg-white'}
        ${isOver ? 'bg-cta/5' : ''}
        ${today ? 'bg-foreground/5 ring-2 ring-inset ring-foreground/20' : ''}
        transition-colors duration-100
      `}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`
            text-sm font-semibold
            ${today ? 'bg-foreground text-white w-7 h-7 flex items-center justify-center rounded-full' : ''}
            ${!isCurrentMonth ? 'text-foreground/20' : 'text-foreground/50'}
            ${isPast && !today ? 'text-foreground/30' : ''}
          `}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {visibleTasks.map(task => (
          <CalendarTask
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onStatusToggle={() => onTaskStatusToggle?.(task)}
          />
        ))}

        {/* Overflow indicator */}
        {hiddenCount > 0 && (
          <button
            onClick={() => {
              // Open first hidden task or show all
              if (tasks[maxVisibleTasks]) {
                onTaskClick(tasks[maxVisibleTasks])
              }
            }}
            className="
              w-full px-2 py-0.5
              text-[10px] text-foreground/50 font-medium
              hover:text-foreground/70 hover:bg-foreground/5
              rounded transition-colors
            "
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  )
}
