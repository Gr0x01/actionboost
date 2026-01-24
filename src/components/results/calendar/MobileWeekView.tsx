'use client'

import { useState, useMemo } from 'react'
import { format, addDays, differenceInDays } from 'date-fns'
import type { CalendarTask } from '@/lib/types/taskSchedule'
import { ChevronDown, CheckCircle, Circle, SkipForward } from 'lucide-react'

interface MobileWeekViewProps {
  tasks: CalendarTask[]
  planStartDate: Date
  onTaskClick: (task: CalendarTask) => void
}

interface WeekData {
  weekNum: number
  theme: string
  tasks: CalendarTask[]
  completed: number
  total: number
  startDate: Date
  endDate: Date
}

/**
 * MobileWeekView - Week-by-week accordion for mobile devices
 * No drag-drop - tap to reschedule via bottom sheet
 */
export function MobileWeekView({ tasks, planStartDate, onTaskClick }: MobileWeekViewProps) {
  // Auto-expand the week containing today
  const [expandedWeek, setExpandedWeek] = useState<number>(() => {
    const today = new Date()
    const daysSinceStart = differenceInDays(today, planStartDate)
    if (daysSinceStart < 0 || daysSinceStart >= 28) return 1
    return Math.floor(daysSinceStart / 7) + 1
  })

  // Group tasks by week
  const weeks = useMemo((): WeekData[] => {
    const weekMap = new Map<number, CalendarTask[]>()

    for (const task of tasks) {
      const weekNum = task.weekNum
      const existing = weekMap.get(weekNum) || []
      existing.push(task)
      weekMap.set(weekNum, existing)
    }

    const result: WeekData[] = []

    for (let weekNum = 1; weekNum <= 4; weekNum++) {
      const weekTasks = weekMap.get(weekNum) || []
      // Sort tasks by scheduled day
      weekTasks.sort((a, b) => a.scheduledDay - b.scheduledDay)

      const completed = weekTasks.filter(t => t.status === 'completed').length
      const theme = weekTasks[0]?.weekTheme || ''
      const startDate = addDays(planStartDate, (weekNum - 1) * 7)
      const endDate = addDays(startDate, 6)

      result.push({
        weekNum,
        theme,
        tasks: weekTasks,
        completed,
        total: weekTasks.length,
        startDate,
        endDate,
      })
    }

    return result
  }, [tasks, planStartDate])

  const toggleWeek = (weekNum: number) => {
    setExpandedWeek(prev => prev === weekNum ? 0 : weekNum)
  }

  return (
    <div className="space-y-3">
      {weeks.map(week => (
        <WeekAccordion
          key={week.weekNum}
          week={week}
          isExpanded={expandedWeek === week.weekNum}
          onToggle={() => toggleWeek(week.weekNum)}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  )
}

interface WeekAccordionProps {
  week: WeekData
  isExpanded: boolean
  onToggle: () => void
  onTaskClick: (task: CalendarTask) => void
}

function WeekAccordion({ week, isExpanded, onToggle, onTaskClick }: WeekAccordionProps) {
  const progressPercent = week.total > 0 ? (week.completed / week.total) * 100 : 0
  const isComplete = week.completed === week.total && week.total > 0

  return (
    <div
      className={`
        rounded-lg border-2 overflow-hidden
        ${isComplete ? 'border-emerald-200 bg-emerald-50/30' : 'border-foreground/15 bg-white'}
      `}
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.08)' }}
    >
      {/* Week header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-foreground/3 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Week {week.weekNum}</span>
            {week.theme && (
              <span className="text-sm text-foreground/50">· {week.theme}</span>
            )}
          </div>
          <div className="text-xs text-foreground/40 mt-0.5">
            {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isComplete ? 'bg-emerald-500' : 'bg-cta'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground/50 tabular-nums">
              {week.completed}/{week.total}
            </span>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-5 h-5 text-foreground/40 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Task list */}
      {isExpanded && week.tasks.length > 0 && (
        <div className="border-t border-foreground/10 divide-y divide-foreground/5">
          {week.tasks.map(task => (
            <MobileTaskRow
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      )}

      {isExpanded && week.tasks.length === 0 && (
        <div className="px-4 py-6 border-t border-foreground/10 text-center">
          <p className="text-sm text-foreground/50">No tasks for this week</p>
        </div>
      )}
    </div>
  )
}

interface MobileTaskRowProps {
  task: CalendarTask
  onClick: () => void
}

function MobileTaskRow({ task, onClick }: MobileTaskRowProps) {
  const StatusIcon = task.status === 'completed'
    ? CheckCircle
    : task.status === 'skipped'
    ? SkipForward
    : Circle

  const statusColor = task.status === 'completed'
    ? 'text-emerald-600'
    : task.status === 'skipped'
    ? 'text-foreground/30'
    : 'text-foreground/40'

  return (
    <button
      onClick={onClick}
      className="
        w-full px-4 py-3
        flex items-start gap-3
        text-left
        hover:bg-foreground/3
        transition-colors
      "
    >
      <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusColor}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight ${task.status === 'skipped' ? 'line-through text-foreground/40' : 'text-foreground'}`}>
          {task.action}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-foreground/40">Day {task.scheduledDay}</span>
          {task.timeEstimate && (
            <>
              <span className="text-foreground/20">·</span>
              <span className="text-xs text-foreground/40">{task.timeEstimate}</span>
            </>
          )}
          {task.notes && (
            <>
              <span className="text-foreground/20">·</span>
              <span className="text-xs text-amber-600">Has notes</span>
            </>
          )}
        </div>
      </div>

      <ChevronDown className="w-4 h-4 text-foreground/30 -rotate-90 flex-shrink-0" />
    </button>
  )
}
