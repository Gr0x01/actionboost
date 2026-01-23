export interface AllDoneBannerProps {
  weekNumber: number
  nextWeekNumber?: number
  onStartNextWeek?: () => void
}

/**
 * AllDoneBanner - Celebration state when week is complete (Soft Brutalist)
 */
export function AllDoneBanner({ weekNumber, nextWeekNumber, onStartNextWeek }: AllDoneBannerProps) {
  return (
    <div
      className="bg-white border-2 border-cta rounded-md p-6 mb-8 text-center max-w-2xl mx-auto"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
    >
      <h3 className="text-xl font-bold text-foreground mb-2">
        Week {weekNumber} complete.
      </h3>
      <p className="text-foreground/60">
        Take a breath. You&apos;ve done the work.
      </p>

      {nextWeekNumber && onStartNextWeek && (
        <button
          onClick={onStartNextWeek}
          className="mt-4 bg-cta text-white font-semibold px-6 py-3 rounded-md
                     border-b-3 border-b-[#B85D10]
                     hover:-translate-y-0.5 hover:shadow-lg
                     active:translate-y-0.5 active:border-b-0
                     transition-all duration-100"
        >
          Start Week {nextWeekNumber}
        </button>
      )}
    </div>
  )
}
