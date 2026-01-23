'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DayAction, RoadmapWeek } from '@/lib/ai/formatter-types'
import {
  getCompletedTasks,
  toggleTaskCompletion,
  type TaskCompletionState,
} from '@/lib/storage/taskCompletion'

interface CommandCenterProps {
  runId: string
  days: DayAction[]
  totalHours?: number
  currentWeek?: number
  roadmapWeeks?: RoadmapWeek[]
}

export function CommandCenter({
  runId,
  days,
  totalHours,
  currentWeek = 1,
  roadmapWeeks = [],
}: CommandCenterProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const [completedTasks, setCompletedTasks] = useState<TaskCompletionState>({})

  // Storage key includes week for separate tracking per week
  const storageKey = `${runId}-week-${selectedWeek}`

  // Load completed tasks from localStorage on mount and when week changes
  useEffect(() => {
    setCompletedTasks(getCompletedTasks(storageKey))
  }, [storageKey])

  const handleToggle = (taskIndex: number) => {
    const updated = toggleTaskCompletion(storageKey, taskIndex)
    setCompletedTasks(updated)
  }

  // Get tasks for the selected week
  const isWeek1 = selectedWeek === 1
  const roadmapWeek = roadmapWeeks.find((w) => w.week === selectedWeek)

  // Calculate progress
  const totalTasks = isWeek1 ? days.length : (roadmapWeek?.tasks.length ?? 0)
  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0

  // Only show weeks that have data (week 1 always has data from thisWeek.days)
  const availableWeeks = [1, ...roadmapWeeks.filter(w => w.week > 1 && w.tasks.length > 0).map(w => w.week)]
  const totalWeeks = Math.max(...availableWeeks, 1)

  return (
    <section className="scroll-mt-32">
      <div
        className="rounded-xl bg-white p-6 lg:p-8"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Header with week navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              {/* Week navigation - only show if more than 1 week */}
              {totalWeeks > 1 && (
                <button
                  onClick={() => {
                    const prevWeeks = availableWeeks.filter(w => w < selectedWeek)
                    if (prevWeeks.length > 0) setSelectedWeek(Math.max(...prevWeeks))
                  }}
                  disabled={selectedWeek === Math.min(...availableWeeks)}
                  className="p-2.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                Week {selectedWeek}
                {totalWeeks > 1 && (
                  <span className="text-foreground/30 font-normal text-lg ml-2">of {totalWeeks}</span>
                )}
              </h2>

              {totalWeeks > 1 && (
                <button
                  onClick={() => {
                    const nextWeeks = availableWeeks.filter(w => w > selectedWeek)
                    if (nextWeeks.length > 0) setSelectedWeek(Math.min(...nextWeeks))
                  }}
                  disabled={selectedWeek === Math.max(...availableWeeks)}
                  className="p-2.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-foreground/60 text-sm mt-1">
              {isWeek1 ? "Here's what to focus on" : 'What to tackle this week'}
            </p>
          </div>

          {/* Progress summary - stat blocks */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">
                {completedCount}<span className="text-foreground/30 font-normal">/</span>{totalTasks}
              </p>
              <p className="text-foreground/50 text-xs">done</p>
            </div>
            {isWeek1 && totalHours && (
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  {totalHours}<span className="text-foreground/30 font-normal text-lg">h</span>
                </p>
                <p className="text-foreground/50 text-xs">this week</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-foreground/[0.06] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-cta transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Week 1: Detailed day cards */}
        {isWeek1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
            {days.map((day, index) => {
              const isCompleted = completedTasks[index] ?? false

              return (
                <button
                  key={index}
                  onClick={() => handleToggle(index)}
                  className="group flex-shrink-0 w-[260px] sm:w-[280px] snap-start flex flex-col rounded-2xl bg-white p-5 text-left transition-all active:scale-[0.98]"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Day label + checkbox */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-foreground/40 uppercase tracking-wide">
                      Day {day.day}
                    </span>

                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center transition-colors
                      ${isCompleted
                        ? 'bg-cta'
                        : 'bg-foreground/[0.06] group-hover:bg-foreground/10'
                      }
                    `}>
                      {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Action */}
                  <p className={`
                    font-semibold text-[15px] leading-snug mb-3 line-clamp-3 flex-1
                    ${isCompleted ? 'text-foreground/40 line-through' : 'text-foreground'}
                  `}>
                    {day.action}
                  </p>

                  {/* Time estimate */}
                  <div className="mt-auto">
                    <span className="text-xs text-foreground/40">
                      {isCompleted ? 'Done' : `~${day.timeEstimate}`}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Weeks 2-4: Milestone cards (horizontal scroll like Week 1) */}
        {!isWeek1 && roadmapWeek && (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
            {roadmapWeek.tasks.map((task, index) => {
              const isCompleted = completedTasks[index] ?? false

              return (
                <button
                  key={index}
                  onClick={() => handleToggle(index)}
                  className="group flex-shrink-0 w-[260px] sm:w-[280px] snap-start flex flex-col rounded-2xl bg-white p-5 text-left transition-all active:scale-[0.98]"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Milestone label + checkbox */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-foreground/40 uppercase tracking-wide">
                      Milestone {index + 1}
                    </span>

                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center transition-colors
                      ${isCompleted
                        ? 'bg-cta'
                        : 'bg-foreground/[0.06] group-hover:bg-foreground/10'
                      }
                    `}>
                      {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Task text */}
                  <p className={`
                    font-semibold text-[15px] leading-snug flex-1
                    ${isCompleted ? 'text-foreground/40 line-through' : 'text-foreground'}
                  `}>
                    {task}
                  </p>

                  {/* Completion indicator */}
                  {isCompleted && (
                    <span className="mt-3 text-xs text-foreground/40">Done</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state for weeks without data */}
        {!isWeek1 && !roadmapWeek && (
          <div className="text-center py-12">
            <p className="text-foreground/40">
              This week's tasks will appear as you progress.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
