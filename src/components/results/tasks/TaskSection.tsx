'use client'

import { useState } from 'react'
import { Check, RotateCcw, ChevronDown } from 'lucide-react'
import type { DayAction } from '@/lib/ai/formatter-types'

export interface TaskSectionProps {
  title: string
  tasks: DayAction[]
  taskIndices: number[]
  onReset: (index: number) => void
  variant: 'skipped' | 'completed'
}

/**
 * TaskSection - Consolidated skipped/completed section
 * Handles both "Revisit when ready" (skipped) and "Completed" variants
 */
export function TaskSection({ title, tasks, taskIndices, onReset, variant }: TaskSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (taskIndices.length === 0) return null

  const isCompleted = variant === 'completed'

  return (
    <div className="mt-10 pt-6 border-t-2 border-foreground/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
      >
        <span>{title} ({taskIndices.length})</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {taskIndices.map((taskIndex) => {
            const task = tasks[taskIndex]
            if (!task) return null

            return (
              <div
                key={taskIndex}
                className={`flex items-center gap-3 p-3 rounded-md border border-foreground/15 bg-foreground/[0.02] ${!isCompleted ? 'text-foreground/40' : ''}`}
              >
                <button
                  onClick={() => onReset(taskIndex)}
                  className={
                    isCompleted
                      ? 'w-5 h-5 rounded-sm border-2 border-cta bg-cta flex items-center justify-center hover:opacity-80 transition-opacity'
                      : 'w-5 h-5 rounded-sm border-2 border-foreground/30 flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/5 transition-colors'
                  }
                  aria-label={isCompleted ? 'Undo completion' : 'Restore task'}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                </button>
                <span className={`text-sm ${isCompleted ? 'text-foreground/40 line-through' : ''}`}>
                  {task.action}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
