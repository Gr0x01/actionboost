export interface ProgressBarProps {
  completed: number
  total: number
}

/** Show encouragement every N completed tasks */
const MILESTONE_INTERVAL = 3

/**
 * ProgressBar - Compact progress with encouraging copy (Soft Brutalist)
 */
export function ProgressBar({ completed, total }: ProgressBarProps) {
  const progressPercent = total > 0 ? (completed / total) * 100 : 0

  // Encouragement messages at milestones
  const getMessage = () => {
    if (completed === 0) return null
    if (completed === total) return 'All done this week.'
    if (completed % MILESTONE_INTERVAL === 0) return 'Nice momentum.'
    return null
  }

  const message = getMessage()

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      {/* Progress bar - simple track */}
      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-cta rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-foreground/60">
          <span className="font-semibold">{completed} of {total}</span> this week
        </p>
        {message && (
          <span className="text-sm font-semibold text-cta">
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
