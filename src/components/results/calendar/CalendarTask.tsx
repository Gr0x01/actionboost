'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CalendarTask as CalendarTaskType, TaskStatus } from '@/lib/types/taskSchedule'
import { Check, RotateCcw } from 'lucide-react'

interface CalendarTaskProps {
  task: CalendarTaskType
  onClick: () => void
  onStatusToggle?: () => void
  isCompact?: boolean
  isDragging?: boolean
}

const statusColors: Record<TaskStatus, { bg: string; text: string; border: string; shadow: string }> = {
  pending: { bg: 'bg-white', text: 'text-foreground', border: 'border-foreground/20', shadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' },
  completed: { bg: 'bg-white', text: 'text-foreground/40 italic', border: 'border-foreground/10', shadow: 'none' },
  skipped: { bg: 'bg-foreground/5', text: 'text-foreground/40', border: 'border-foreground/10', shadow: 'none' },
}

const StatusCheckbox = ({ status }: { status: TaskStatus }) => {
  if (status === 'completed') {
    return (
      <div className="w-5 h-5 rounded border-2 border-cta bg-cta flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    )
  }
  if (status === 'skipped') {
    return (
      <div className="w-5 h-5 rounded border-2 border-foreground/20 flex items-center justify-center flex-shrink-0">
        <RotateCcw className="w-3 h-3 text-foreground/40" />
      </div>
    )
  }
  // pending
  return (
    <div className="w-5 h-5 rounded border-2 border-foreground/30 flex-shrink-0 hover:border-foreground/50 transition-colors" />
  )
}

/**
 * CalendarTask - Draggable task chip for calendar grid
 * Soft Brutalist style: visible borders, subtle offset shadow
 */
export function CalendarTask({ task, onClick, onStatusToggle, isCompact = false, isDragging = false }: CalendarTaskProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: task,
  })

  const colors = statusColors[task.status]

  const style = {
    transform: CSS.Translate.toString(transform),
    boxShadow: isDragging
      ? '0 8px 20px rgba(0,0,0,0.15)'
      : colors.shadow,
  }

  if (isCompact) {
    // Compact view for "more" overflow
    return (
      <button
        onClick={onClick}
        className={`
          w-full px-2 py-1 text-left text-xs rounded
          ${colors.bg} ${colors.text} border ${colors.border}
          hover:border-foreground/30 transition-colors
          truncate
        `}
      >
        <span className="line-clamp-1">{task.action}</span>
      </button>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        px-2 py-2 rounded-md
        ${colors.bg} ${colors.text} border-2 ${colors.border}
        hover:border-foreground/30
        cursor-grab active:cursor-grabbing
        transition-all duration-100
        ${isDragging ? 'opacity-90 scale-105 z-50' : ''}
        ${task.status === 'skipped' ? 'opacity-60' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-1.5">
        {/* Status icon - click to toggle */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onStatusToggle?.()
          }}
          className="flex-shrink-0"
        >
          <StatusCheckbox status={task.status} />
        </button>

        {/* Task text - click to open sidebar */}
        <span
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="flex-1 text-left text-xs font-medium leading-tight line-clamp-2 cursor-pointer"
        >
          {task.action}
        </span>
      </div>

      {/* Notes indicator */}
      {task.notes && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" title="Has notes" />
      )}
    </div>
  )
}

/**
 * CalendarTaskOverlay - Shown while dragging
 */
export function CalendarTaskOverlay({ task }: { task: CalendarTaskType }) {
  const colors = statusColors[task.status]

  return (
    <div
      className={`
        px-3 py-2 rounded-md
        ${colors.bg} ${colors.text} border-2 ${colors.border}
        shadow-lg opacity-90
        cursor-grabbing
      `}
      style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
    >
      <div className="flex items-start gap-2">
        <StatusCheckbox status={task.status} />
        <span className="text-xs leading-tight line-clamp-2">{task.action}</span>
      </div>
    </div>
  )
}
