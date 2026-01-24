'use client'

import { useMemo, useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  differenceInDays,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarTask as CalendarTaskType } from '@/lib/types/taskSchedule'
import { CalendarDay } from './CalendarDay'

interface CalendarGridProps {
  planStartDate: Date
  tasksByDay: Map<number, CalendarTaskType[]>
  onTaskClick: (task: CalendarTaskType) => void
  onTaskStatusToggle?: (task: CalendarTaskType) => void
  stats?: {
    total: number
    completed: number
    pending: number
    skipped: number
  } | null
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * CalendarGrid - Simple month view
 * Shows current month with tasks on their scheduled days
 */
export function CalendarGrid({ planStartDate, tasksByDay, onTaskClick, onTaskStatusToggle, stats }: CalendarGridProps) {
  // Start with today's month
  const [viewDate, setViewDate] = useState(() => new Date())

  // Calculate calendar dates for the viewed month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate)
    const monthEnd = endOfMonth(viewDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [viewDate])

  // Map calendar date to plan day (1-30)
  const getPlanDay = (date: Date): number => {
    const diff = differenceInDays(date, planStartDate) + 1
    if (diff < 1 || diff > 30) return 0
    return diff
  }

  // Check if date is in the viewed month
  const isCurrentMonth = (date: Date): boolean => {
    return isSameMonth(date, viewDate)
  }

  const goToPrevMonth = () => setViewDate(d => subMonths(d, 1))
  const goToNextMonth = () => setViewDate(d => addMonths(d, 1))
  const goToToday = () => setViewDate(new Date())

  return (
    <div className="rounded-lg overflow-hidden border-2 border-foreground/15 bg-white">
      {/* Header with month navigation and stats */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2 py-1 rounded hover:bg-foreground/10 transition-colors"
          >
            <span className="font-semibold text-foreground">
              {format(viewDate, 'MMMM yyyy')}
            </span>
          </button>

          <div className="flex items-center">
            <button
              onClick={goToPrevMonth}
              className="p-1.5 rounded hover:bg-foreground/10 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-foreground/60" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded hover:bg-foreground/10 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-foreground/60" />
            </button>
          </div>
        </div>

        {/* Right: Stats with progress ring */}
        {stats && (
          <div className="flex items-center gap-3">
            {/* Mini progress ring */}
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90">
                <circle
                  cx="18" cy="18" r="14"
                  className="fill-none stroke-foreground/10"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="14"
                  className="fill-none stroke-emerald-500 transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={`${stats.total > 0 ? (stats.completed / stats.total) * 88 : 0} 88`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>

            <div className="text-sm">
              <span className="font-semibold text-foreground">{stats.completed}</span>
              <span className="text-foreground/50"> of {stats.total}</span>
            </div>
          </div>
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-foreground/10">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold text-foreground/40"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map(date => {
          const planDay = getPlanDay(date)
          const tasks = planDay > 0 ? (tasksByDay.get(planDay) || []) : []

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              dayNumber={planDay}
              tasks={tasks}
              isCurrentMonth={isCurrentMonth(date)}
              onTaskClick={onTaskClick}
              onTaskStatusToggle={onTaskStatusToggle}
            />
          )
        })}
      </div>
    </div>
  )
}
