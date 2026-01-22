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
      <div className="rounded-2xl border-[3px] border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
        {/* Header with week navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              {/* Week navigation - only show if more than 1 week */}
              {totalWeeks > 1 && (
                <button
                  onClick={() => {
                    const prevWeeks = availableWeeks.filter(w => w < selectedWeek)
                    if (prevWeeks.length > 0) setSelectedWeek(Math.max(...prevWeeks))
                  }}
                  disabled={selectedWeek === Math.min(...availableWeeks)}
                  className="p-1.5 rounded-lg border border-foreground/20 hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  Week {selectedWeek}
                </h2>
                {totalWeeks > 1 && (
                  <span className="text-foreground/50 text-sm font-medium">of {totalWeeks}</span>
                )}
              </div>

              {totalWeeks > 1 && (
                <button
                  onClick={() => {
                    const nextWeeks = availableWeeks.filter(w => w > selectedWeek)
                    if (nextWeeks.length > 0) setSelectedWeek(Math.min(...nextWeeks))
                  }}
                  disabled={selectedWeek === Math.max(...availableWeeks)}
                  className="p-1.5 rounded-lg border border-foreground/20 hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-foreground/60 text-sm mt-1">
              {isWeek1
                ? 'Your action plan for the next 7 days'
                : roadmapWeek?.theme || `Week ${selectedWeek} tasks`}
            </p>
          </div>

          {/* Progress summary */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-foreground">
                {completedCount}/{totalTasks}
              </p>
              <p className="text-foreground/50 text-xs uppercase tracking-wider">
                Tasks done
              </p>
            </div>
            {isWeek1 && totalHours && (
              <div className="text-right border-l border-foreground/20 pl-4">
                <p className="font-mono text-2xl font-bold text-foreground">
                  {totalHours}h
                </p>
                <p className="text-foreground/50 text-xs uppercase tracking-wider">
                  Est. time
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-foreground/10 rounded-full mb-6 overflow-hidden">
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
                  className={`
                    flex-shrink-0 w-[280px] sm:w-[300px] snap-start
                    rounded-xl border-2 p-4 text-left
                    transition-all duration-150
                    ${isCompleted
                      ? 'border-cta/50 bg-cta/5'
                      : 'border-foreground/20 bg-background hover:border-foreground/40'
                    }
                    hover:shadow-[4px_4px_0_0_rgba(44,62,80,0.5)]
                    active:shadow-none active:translate-y-0.5
                  `}
                >
                  {/* Day badge + checkbox */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`
                      font-mono text-xs px-2 py-1 font-bold
                      ${isCompleted
                        ? 'bg-cta text-white'
                        : 'bg-foreground text-background'
                      }
                    `}>
                      DAY {day.day}
                    </span>

                    <div className={`
                      w-6 h-6 rounded-md border-2 flex items-center justify-center
                      transition-colors duration-150
                      ${isCompleted
                        ? 'border-cta bg-cta'
                        : 'border-foreground/30 bg-transparent'
                      }
                    `}>
                      {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Action */}
                  <p className={`
                    font-semibold text-sm leading-snug mb-2 line-clamp-2
                    ${isCompleted ? 'text-foreground/60 line-through' : 'text-foreground'}
                  `}>
                    {day.action}
                  </p>

                  {/* Time + metric */}
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <span className="font-mono bg-foreground/5 px-1.5 py-0.5 rounded">
                      {day.timeEstimate}
                    </span>
                    <span className="truncate">{day.successMetric}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Weeks 2-4: Roadmap tasks */}
        {!isWeek1 && roadmapWeek && (
          <div className="space-y-2">
            {roadmapWeek.tasks.map((task, index) => {
              const isCompleted = completedTasks[index] ?? false

              return (
                <button
                  key={index}
                  onClick={() => handleToggle(index)}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left
                    transition-all duration-150
                    ${isCompleted
                      ? 'border-cta/50 bg-cta/5'
                      : 'border-foreground/20 bg-background hover:border-foreground/40'
                    }
                  `}
                >
                  {/* Checkbox */}
                  <div className={`
                    w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0
                    transition-colors duration-150
                    ${isCompleted
                      ? 'border-cta bg-cta'
                      : 'border-foreground/30 bg-transparent'
                    }
                  `}>
                    {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>

                  {/* Task text */}
                  <p className={`
                    font-semibold text-sm leading-snug
                    ${isCompleted ? 'text-foreground/60 line-through' : 'text-foreground'}
                  `}>
                    {task}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state for weeks without data */}
        {!isWeek1 && !roadmapWeek && (
          <div className="text-center py-8 text-foreground/50">
            <p>No tasks defined for Week {selectedWeek} yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
