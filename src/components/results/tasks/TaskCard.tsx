'use client'

import { Check, RotateCcw } from 'lucide-react'
import type { DayAction } from '@/lib/ai/formatter-types'
import type { TaskStatus } from '@/lib/storage/taskCompletion'

export interface TaskCardProps {
  task: DayAction
  status: TaskStatus
  onComplete: () => void
  onSkip: () => void
  onReset: () => void
}

/**
 * TaskCard - Individual task row (Soft Brutalist style)
 */
export function TaskCard({ task, status, onComplete, onSkip, onReset }: TaskCardProps) {
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'

  return (
    <div
      className={`
        group flex items-start gap-3 p-4 rounded-lg transition-all duration-100
        ${isCompleted
          ? 'border border-foreground/10 bg-foreground/[0.02]'
          : isSkipped
            ? 'border border-foreground/10 bg-foreground/[0.02]'
            : 'border border-foreground/15 bg-white hover:border-foreground/25'
        }
      `}
    >
      {/* Checkbox or status indicator */}
      {!isSkipped ? (
        <button
          onClick={isCompleted ? onReset : onComplete}
          className={`
            w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5
            transition-all duration-100
            ${isCompleted
              ? 'border-cta bg-cta'
              : 'border-foreground/30 hover:border-foreground/50 hover:bg-foreground/5'
            }
          `}
          aria-label={isCompleted ? 'Undo completion' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>
      ) : (
        <button
          onClick={onReset}
          className="w-6 h-6 rounded-md border border-foreground/20 flex items-center justify-center shrink-0 mt-0.5 hover:border-foreground/40 transition-colors"
          aria-label="Restore task"
        >
          <RotateCcw className="w-3 h-3 text-foreground/40" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        {/* Task text */}
        <p className={`
          font-semibold leading-snug
          ${isCompleted ? 'text-foreground/40 line-through' : ''}
          ${isSkipped ? 'text-foreground/40' : 'text-foreground'}
        `}>
          {task.action}
        </p>

        {/* Deliverable - always visible */}
        <p className={`
          text-sm mt-1
          ${isCompleted || isSkipped ? 'text-foreground/30' : 'text-foreground/50'}
        `}>
          Done when: {task.successMetric}
        </p>
      </div>

      {/* Time estimate + skip option */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`
          font-mono text-xs
          ${isCompleted || isSkipped ? 'text-foreground/30' : 'text-foreground/50'}
        `}>
          {task.timeEstimate}
        </span>

        {!isCompleted && !isSkipped && (
          <button
            onClick={onSkip}
            className="text-xs text-foreground/40 hover:text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
