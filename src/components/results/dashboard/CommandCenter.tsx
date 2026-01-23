'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
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
  const isWeekComplete = completedCount === totalTasks && totalTasks > 0

  // Only show weeks that have data (week 1 always has data from thisWeek.days)
  const availableWeeks = [1, ...roadmapWeeks.filter(w => w.week > 1 && w.tasks.length > 0).map(w => w.week)]
  const totalWeeks = Math.max(...availableWeeks, 1)

  return (
    <section className="scroll-mt-32">
      <div
        className="rounded-xl bg-white p-6 lg:p-8 border border-border"
        style={{
          boxShadow: '0 2px 8px rgba(44, 62, 80, 0.06), 0 8px 24px rgba(44, 62, 80, 0.08)',
        }}
      >
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
                  className="p-2 rounded-lg border border-foreground/20 bg-white hover:border-foreground/40 hover:bg-foreground/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight font-serif">
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
                  className="p-2 rounded-lg border border-foreground/20 bg-white hover:border-foreground/40 hover:bg-foreground/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-foreground/60 text-sm mt-1.5">
              {isWeekComplete
                ? "You crushed it this week!"
                : isWeek1
                  ? "Here's what to focus on this week"
                  : 'What to tackle this week'}
            </p>
          </div>

          {/* Progress summary - confident styling */}
          <div className="flex items-center gap-4">
            <div className={`text-right px-4 py-2 rounded-lg ${isWeekComplete ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
              {isWeekComplete ? (
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-700">Complete!</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">
                    {completedCount}<span className="text-foreground/40 font-normal">/</span>{totalTasks}
                  </p>
                  <p className="text-foreground/50 text-xs font-medium">
                    tasks done
                  </p>
                </>
              )}
            </div>
            {isWeek1 && totalHours && !isWeekComplete && (
              <div className="text-right border-l border-foreground/15 pl-4">
                <p className="text-2xl font-bold text-foreground">
                  {totalHours}h
                </p>
                <p className="text-foreground/50 text-xs font-medium">
                  total time
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar - solid CTA color */}
        <div className="h-2.5 bg-foreground/10 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out rounded-full ${
              isWeekComplete ? 'bg-emerald-500' : 'bg-cta'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Week 1: Detailed day cards */}
        {isWeek1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
            {days.map((day, index) => {
              const isCompleted = completedTasks[index] ?? false

              return (
                <button
                  key={index}
                  onClick={() => handleToggle(index)}
                  className={`
                    group flex-shrink-0 w-[280px] sm:w-[300px] snap-start
                    min-h-[150px] flex flex-col rounded-xl
                    border-2 p-5 text-left
                    transition-all duration-150
                    ${isCompleted
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-foreground/15 bg-white hover:border-cta/50 hover:-translate-y-0.5'
                    }
                    active:scale-[0.98]
                  `}
                  style={{
                    boxShadow: isCompleted
                      ? '0 2px 8px rgba(16, 185, 129, 0.1)'
                      : '0 2px 8px rgba(44, 62, 80, 0.06)',
                  }}
                >
                  {/* Day badge + checkbox */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`
                      text-xs px-3 py-1.5 font-bold rounded-full
                      ${isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-foreground/10 text-foreground/70'
                      }
                    `}>
                      Day {day.day}
                    </span>

                    <div className={`
                      w-7 h-7 rounded-full border-2 flex items-center justify-center
                      transition-all duration-150
                      ${isCompleted
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-foreground/25 bg-white group-hover:border-cta/50'
                      }
                    `}>
                      {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Action */}
                  <p className={`
                    font-semibold text-sm leading-snug mb-2 line-clamp-3 flex-1
                    ${isCompleted ? 'text-foreground/50 line-through' : 'text-foreground'}
                  `}>
                    {day.action}
                  </p>

                  {/* Time estimate - always visible, success metric on hover */}
                  <div className="mt-auto text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full font-medium ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-foreground/[0.06] text-foreground/60'
                      }`}>
                        {isCompleted ? 'Done!' : `~${day.timeEstimate}`}
                      </span>
                    </div>
                    {!isCompleted && (
                      <p className="mt-2 text-foreground/50 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-200 overflow-hidden leading-snug">
                        {day.successMetric}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Weeks 2-4: Milestone cards (horizontal scroll like Week 1) */}
        {!isWeek1 && roadmapWeek && (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
            {roadmapWeek.tasks.map((task, index) => {
              const isCompleted = completedTasks[index] ?? false

              return (
                <button
                  key={index}
                  onClick={() => handleToggle(index)}
                  className={`
                    group flex-shrink-0 w-[280px] sm:w-[300px] snap-start
                    min-h-[130px] flex flex-col rounded-xl
                    border-2 p-5 text-left
                    transition-all duration-150
                    ${isCompleted
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-foreground/15 bg-white hover:border-cta/50 hover:-translate-y-0.5'
                    }
                    active:scale-[0.98]
                  `}
                  style={{
                    boxShadow: isCompleted
                      ? '0 2px 8px rgba(16, 185, 129, 0.1)'
                      : '0 2px 8px rgba(44, 62, 80, 0.06)',
                  }}
                >
                  {/* Milestone badge + checkbox */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`
                      text-xs px-3 py-1.5 font-bold rounded-full
                      ${isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-foreground/10 text-foreground/70'
                      }
                    `}>
                      Milestone {index + 1}
                    </span>

                    <div className={`
                      w-7 h-7 rounded-full border-2 flex items-center justify-center
                      transition-all duration-150
                      ${isCompleted
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-foreground/25 bg-white group-hover:border-cta/50'
                      }
                    `}>
                      {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Task text */}
                  <p className={`
                    font-semibold text-sm leading-snug flex-1
                    ${isCompleted ? 'text-foreground/50 line-through' : 'text-foreground'}
                  `}>
                    {task}
                  </p>

                  {/* Completion indicator */}
                  {isCompleted && (
                    <span className="mt-2 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 self-start">
                      Done!
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state for weeks without data */}
        {!isWeek1 && !roadmapWeek && (
          <div className="text-center py-10 px-6 rounded-xl border-2 border-dashed border-foreground/15 bg-foreground/[0.02]">
            <p className="text-foreground/50 font-medium">
              This week's tasks will appear as you progress.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
