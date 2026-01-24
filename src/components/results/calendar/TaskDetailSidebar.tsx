'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { CalendarTask, TaskStatus } from '@/lib/types/taskSchedule'
import { X, Check, Circle, SkipForward, Clock, Target, Calendar, StickyNote } from 'lucide-react'

interface TaskDetailSidebarProps {
  task: CalendarTask | null
  planStartDate: Date
  onClose: () => void
  onUpdate: (updates: { scheduledDay?: number; status?: TaskStatus; notes?: string }) => Promise<void>
}

/**
 * TaskDetailSidebar - Slide-out panel for task details
 * Soft Brutalist: bold borders, offset shadows, tactile buttons
 */
export function TaskDetailSidebar({
  task,
  planStartDate,
  onClose,
  onUpdate,
}: TaskDetailSidebarProps) {
  const [notes, setNotes] = useState(task?.notes || '')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(task?.scheduledDay || 1)
  const [notesSaveStatus, setNotesSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Reset state when task changes
  useEffect(() => {
    setNotes(task?.notes || '')
    setSelectedDay(task?.scheduledDay || 1)
    setNotesSaveStatus('idle')
  }, [task])

  if (!task) return null

  const taskDate = new Date(planStartDate)
  taskDate.setDate(taskDate.getDate() + task.scheduledDay - 1)

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return
    setIsSaving(true)
    try {
      await onUpdate({ status: newStatus })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotesBlur = async () => {
    if (notes === (task.notes || '')) return
    setIsSaving(true)
    setNotesSaveStatus('saving')
    try {
      await onUpdate({ notes })
      setNotesSaveStatus('saved')
      setTimeout(() => setNotesSaveStatus('idle'), 2000)
    } catch {
      setNotesSaveStatus('idle')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReschedule = async () => {
    if (selectedDay === task.scheduledDay) return
    setIsSaving(true)
    try {
      await onUpdate({ scheduledDay: selectedDay })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="
          fixed top-0 right-0 bottom-0
          w-full max-w-md
          bg-white border-l-2 border-foreground/20
          z-50
          transform transition-transform duration-200 ease-out
          overflow-y-auto
        "
        style={{ boxShadow: '-8px 0 24px rgba(44, 62, 80, 0.1)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-foreground/15 px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-foreground">
              Day {task.scheduledDay}
            </span>
            <span className="mx-2 text-foreground/30">·</span>
            <span className="text-sm text-foreground/60">
              {format(taskDate, 'EEEE, MMM d')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md border-2 border-foreground/20 hover:bg-foreground/5 transition-colors"
          >
            <X className="w-4 h-4 text-foreground/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-8">
          {/* Task title */}
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {task.action}
            </h2>
            {task.weekTheme && (
              <p className="mt-2 text-sm font-medium text-foreground/60">
                Week {task.weekNum}: {task.weekTheme}
              </p>
            )}
          </div>

          {/* Status buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-3">
              Status
            </label>
            <div className="flex gap-2">
              <StatusButton
                status="pending"
                currentStatus={task.status}
                onClick={() => handleStatusChange('pending')}
                disabled={isSaving}
                label="Not yet"
              />
              <StatusButton
                status="completed"
                currentStatus={task.status}
                onClick={() => handleStatusChange('completed')}
                disabled={isSaving}
                label="Done!"
              />
              <StatusButton
                status="skipped"
                currentStatus={task.status}
                onClick={() => handleStatusChange('skipped')}
                disabled={isSaving}
                label="Skip it"
              />
            </div>
          </div>

          {/* Time estimate & Success metric */}
          <div className="grid grid-cols-2 gap-3">
            {task.timeEstimate && (
              <div
                className="p-4 bg-amber-50/70 border-2 border-foreground/20 rounded-md"
                style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.08)' }}
              >
                <div className="flex items-center gap-2 text-foreground/70 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Time</span>
                </div>
                <p className="text-base font-semibold text-foreground">{task.timeEstimate}</p>
              </div>
            )}
            {task.successMetric && (
              <div
                className="p-4 bg-sky-50/70 border-2 border-foreground/20 rounded-md"
                style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.08)' }}
              >
                <div className="flex items-center gap-2 text-foreground/70 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Success</span>
                </div>
                <p className="text-base font-semibold text-foreground">{task.successMetric}</p>
              </div>
            )}
          </div>

          {/* Reschedule */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-3">
              <Calendar className="w-4 h-4" />
              Reschedule
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
                className="
                  flex-1 px-3 py-2.5
                  text-sm font-medium
                  border-2 border-foreground/20 rounded-md
                  bg-white
                  focus:outline-none focus:border-cta
                  cursor-pointer
                  transition-colors
                "
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    Day {day} {day === task.originalDay ? '(original)' : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={handleReschedule}
                disabled={selectedDay === task.scheduledDay || isSaving}
                className="
                  px-5 py-2.5
                  text-sm font-semibold
                  bg-cta text-white rounded-md
                  border-b-[3px] border-b-[#B85D10]
                  hover:-translate-y-0.5 hover:shadow-lg
                  active:translate-y-0.5 active:border-b-0
                  disabled:opacity-40 disabled:cursor-not-allowed
                  disabled:hover:translate-y-0 disabled:hover:shadow-none
                  transition-all duration-100
                "
              >
                Move it
              </button>
            </div>
            {task.originalDay !== task.scheduledDay && (
              <p className="mt-2 text-xs text-amber-600 font-medium">
                Originally scheduled for Day {task.originalDay}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-3">
              <StickyNote className="w-4 h-4" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Jot down anything helpful..."
              maxLength={1000}
              rows={4}
              className="
                w-full px-3 py-3
                text-sm
                border-2 border-foreground/20 rounded-md
                bg-white
                placeholder:text-foreground/40
                focus:outline-none focus:border-cta
                resize-none
                transition-colors
              "
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs font-medium">
                {notesSaveStatus === 'saving' && (
                  <span className="text-foreground/50">Saving...</span>
                )}
                {notesSaveStatus === 'saved' && (
                  <span className="text-cta font-semibold">Got it!</span>
                )}
              </div>
              <span className="text-xs text-foreground/40">
                {notes.length}/1000
              </span>
            </div>
          </div>

          {/* Completion info */}
          {task.completedAt && (
            <div className="pt-6 border-t-2 border-foreground/20">
              <p className="text-sm text-foreground/60">
                Completed {format(new Date(task.completedAt), "MMM d 'at' h:mm a")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface StatusButtonProps {
  status: TaskStatus
  currentStatus: TaskStatus
  onClick: () => void
  disabled: boolean
  label: string
}

function StatusButton({
  status,
  currentStatus,
  onClick,
  disabled,
  label,
}: StatusButtonProps) {
  const isActive = status === currentStatus

  // Soft Brutalist: visible but soft borders, subtle offset shadows, brand orange for completed
  const baseClasses = `
    flex-1 flex items-center justify-center gap-2
    px-3 py-2.5
    text-sm font-semibold
    border-2 rounded-md
    transition-all duration-100
    disabled:opacity-50
  `

  const stateClasses: Record<TaskStatus, string> = {
    pending: isActive
      ? 'bg-foreground/10 text-foreground border-foreground/30 shadow-[3px_3px_0_0_rgba(44,62,80,0.1)]'
      : 'bg-white text-foreground/60 border-foreground/20 hover:bg-foreground/5 hover:border-foreground/30',
    completed: isActive
      ? 'bg-cta text-white border-cta shadow-[3px_3px_0_0_rgba(44,62,80,0.15)]'
      : 'bg-white text-foreground/60 border-foreground/20 hover:bg-cta/10 hover:border-cta/40 hover:text-cta',
    skipped: isActive
      ? 'bg-foreground/5 text-foreground/50 border-foreground/30'
      : 'bg-white text-foreground/40 border-foreground/15 hover:bg-foreground/5 hover:border-foreground/25',
  }

  // Status-specific icons
  const icons: Record<TaskStatus, React.ReactNode> = {
    pending: <Circle className="w-4 h-4" />,
    completed: <Check className="w-4 h-4" strokeWidth={3} />,
    skipped: <SkipForward className="w-4 h-4" />,
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses[status]}`}
    >
      {icons[status]}
      {label}
    </button>
  )
}
