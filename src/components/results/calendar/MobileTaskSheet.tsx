'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import type { CalendarTask, TaskStatus } from '@/lib/types/taskSchedule'
import { X, CheckCircle, Circle, SkipForward, Clock, Target, Calendar, StickyNote } from 'lucide-react'

interface MobileTaskSheetProps {
  task: CalendarTask | null
  planStartDate: Date
  onClose: () => void
  onUpdate: (updates: { scheduledDay?: number; status?: TaskStatus; notes?: string }) => Promise<void>
}

/**
 * MobileTaskSheet - Bottom sheet for task details on mobile
 * Full-width, slides up from bottom
 */
export function MobileTaskSheet({
  task,
  planStartDate,
  onClose,
  onUpdate,
}: MobileTaskSheetProps) {
  const [notes, setNotes] = useState(task?.notes || '')
  const [isSaving, setIsSaving] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDay, setSelectedDay] = useState(task?.scheduledDay || 1)
  const [showDayPicker, setShowDayPicker] = useState(false)

  // Reset state when task changes
  useEffect(() => {
    setNotes(task?.notes || '')
    setSelectedDay(task?.scheduledDay || 1)
    setShowDayPicker(false)
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
    try {
      await onUpdate({ notes })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReschedule = async (newDay: number) => {
    if (newDay === task.scheduledDay) {
      setShowDayPicker(false)
      return
    }
    setIsSaving(true)
    try {
      await onUpdate({ scheduledDay: newDay })
      setShowDayPicker(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="
          fixed bottom-0 left-0 right-0
          bg-white
          rounded-t-2xl
          z-50
          max-h-[85vh]
          overflow-y-auto
          animate-in slide-in-from-bottom duration-200
        "
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-white pt-2 pb-1">
          <div className="w-12 h-1 bg-foreground/20 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-foreground/10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Day {task.scheduledDay}
            </span>
            <span className="mx-2 text-foreground/20">·</span>
            <span className="text-xs text-foreground/50">
              {format(taskDate, 'EEEE, MMM d')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-md hover:bg-foreground/5 transition-colors"
          >
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Task title */}
          <div>
            <h2 className="text-base font-semibold text-foreground leading-tight">
              {task.action}
            </h2>
            {task.weekTheme && (
              <p className="mt-1 text-sm text-foreground/50">
                Week {task.weekNum}: {task.weekTheme}
              </p>
            )}
          </div>

          {/* Quick status buttons */}
          <div className="flex gap-2">
            <MobileStatusButton
              status="pending"
              currentStatus={task.status}
              onClick={() => handleStatusChange('pending')}
              disabled={isSaving}
              icon={Circle}
              label="To do"
            />
            <MobileStatusButton
              status="completed"
              currentStatus={task.status}
              onClick={() => handleStatusChange('completed')}
              disabled={isSaving}
              icon={CheckCircle}
              label="Done"
            />
            <MobileStatusButton
              status="skipped"
              currentStatus={task.status}
              onClick={() => handleStatusChange('skipped')}
              disabled={isSaving}
              icon={SkipForward}
              label="Skip"
            />
          </div>

          {/* Time & Success metric */}
          {(task.timeEstimate || task.successMetric) && (
            <div className="flex flex-wrap gap-3">
              {task.timeEstimate && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-foreground/5">
                  <Clock className="w-3.5 h-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/70">{task.timeEstimate}</span>
                </div>
              )}
              {task.successMetric && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-foreground/5">
                  <Target className="w-3.5 h-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/70">{task.successMetric}</span>
                </div>
              )}
            </div>
          )}

          {/* Reschedule */}
          <div>
            <button
              onClick={() => setShowDayPicker(prev => !prev)}
              className="
                flex items-center gap-2
                px-3 py-2
                text-sm text-foreground/70
                border border-foreground/15 rounded-md
                hover:bg-foreground/3
                transition-colors
              "
            >
              <Calendar className="w-4 h-4" />
              Move to different day
            </button>

            {showDayPicker && (
              <div className="mt-3 p-3 rounded-lg bg-foreground/3 border border-foreground/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-2">
                  Select day
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      onClick={() => handleReschedule(day)}
                      disabled={isSaving}
                      className={`
                        w-9 h-9
                        text-sm font-medium
                        rounded-md
                        transition-colors
                        ${day === task.scheduledDay
                          ? 'bg-cta text-white'
                          : day === task.originalDay
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-white border border-foreground/15 text-foreground hover:bg-foreground/5'
                        }
                        disabled:opacity-50
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {task.originalDay !== task.scheduledDay && (
                  <p className="mt-2 text-xs text-amber-600">
                    Originally Day {task.originalDay}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-2">
              <StickyNote className="w-3.5 h-3.5" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes about this task..."
              maxLength={1000}
              rows={3}
              className="
                w-full px-3 py-2
                text-sm
                border border-foreground/15 rounded-md
                bg-white
                placeholder:text-foreground/30
                focus:outline-none focus:border-cta
                resize-none
                transition-colors
              "
            />
            <p className="mt-1 text-xs text-foreground/40 text-right">
              {notes.length}/1000
            </p>
          </div>

          {/* Safe area padding for bottom nav */}
          <div className="h-4" />
        </div>
      </div>
    </>
  )
}

interface MobileStatusButtonProps {
  status: TaskStatus
  currentStatus: TaskStatus
  onClick: () => void
  disabled: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
}

function MobileStatusButton({
  status,
  currentStatus,
  onClick,
  disabled,
  icon: Icon,
  label,
}: MobileStatusButtonProps) {
  const isActive = status === currentStatus

  const colors: Record<TaskStatus, string> = {
    pending: isActive ? 'bg-foreground/10 border-foreground/30 text-foreground' : 'border-foreground/15 text-foreground/50',
    completed: isActive ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'border-foreground/15 text-foreground/50',
    skipped: isActive ? 'bg-foreground/5 border-foreground/20 text-foreground/60' : 'border-foreground/15 text-foreground/50',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 flex items-center justify-center gap-1.5
        px-2 py-2.5
        text-sm font-medium
        border rounded-md
        ${colors[status]}
        disabled:opacity-60
        transition-colors
        active:scale-95
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
