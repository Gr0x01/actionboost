'use client'

import { RefreshCw, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react'
import type { UserContext } from '@/lib/types/context'
import { getContextSummaryText } from '@/lib/hooks/useUserContext'

interface WelcomeBackProps {
  context: UserContext
  onContinueWithUpdates: (delta: string) => void
  onStartFresh: () => void
}

/**
 * "Welcome back" panel for returning users with existing context
 * Shows last run summary and provides conversational update flow
 */
export function WelcomeBack({
  context,
  onContinueWithUpdates,
  onStartFresh,
}: WelcomeBackProps) {
  const { productSummary, lastTraction, totalRuns, lastRunDate } = getContextSummaryText(context)

  return (
    <div className="border-[3px] border-foreground bg-background p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 border-2 border-cta bg-cta/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-cta" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">
            Welcome back!
          </h2>
          <p className="text-foreground/60 text-sm mt-1 font-medium">
            You&apos;ve run {totalRuns} {totalRuns === 1 ? 'action plan' : 'action plans'} so far
          </p>
        </div>
      </div>

      {/* Last run summary */}
      <div className="border-2 border-foreground/20 bg-background p-4 mb-6 space-y-3">
        <div>
          <p className="text-xs text-foreground/50 uppercase tracking-wide font-bold mb-1">Last time</p>
          <p className="text-sm text-foreground font-medium">{productSummary}</p>
        </div>

        {lastTraction && (
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-wide font-bold mb-1">Traction</p>
            <p className="text-sm text-foreground/80 line-clamp-2">{lastTraction}</p>
          </div>
        )}

        {lastRunDate && (
          <p className="text-xs text-foreground/50 font-mono">
            Last action plan: {formatDate(lastRunDate)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => onContinueWithUpdates('')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
        >
          <RefreshCw className="h-4 w-4" />
          Continue with updates
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={onStartFresh}
          className="w-full text-center text-sm text-foreground/50 font-bold hover:text-foreground transition-colors py-2 border-2 border-transparent hover:border-foreground/30"
        >
          Or start fresh with a new product
        </button>
      </div>
    </div>
  )
}

/**
 * Conversational update form shown after clicking "Continue with updates"
 */
interface UpdateFormProps {
  context: UserContext
  suggestedQuestions: string[]
  onSubmit: (delta: string, focusArea: string) => void
  onBack: () => void
}

export function ContextUpdateForm({
  context,
  suggestedQuestions,
  onSubmit,
  onBack,
}: UpdateFormProps) {
  const { lastTraction } = getContextSummaryText(context)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-foreground mb-2">
          What&apos;s changed?
        </h2>
        <p className="text-foreground/60 text-sm font-medium">
          Tell us what&apos;s new since your last action plan. We&apos;ll build on what we know.
        </p>
      </div>

      {/* Show last traction for reference */}
      {lastTraction && (
        <div className="border-2 border-foreground/20 bg-background p-4">
          <p className="text-xs text-foreground/50 uppercase tracking-wide font-bold mb-1">
            Last time you said
          </p>
          <p className="text-sm text-foreground/80 line-clamp-3">{lastTraction}</p>
        </div>
      )}

      {/* Suggested questions as prompts */}
      {suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              className="text-xs px-3 py-1.5 border-2 border-cta/30 text-cta font-bold hover:border-cta hover:bg-cta/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const delta = formData.get('delta') as string
          const focusArea = formData.get('focusArea') as string
          onSubmit(delta, focusArea)
        }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">
            What&apos;s new?
          </label>
          <p className="text-xs text-foreground/50 mb-2">
            New traction, tactics tried, what&apos;s working, challenges...
          </p>
          <textarea
            name="delta"
            placeholder="e.g., We hit 1000 users! Twitter is driving signups but retention is dropping. Tried a referral program but it flopped..."
            required
            className="w-full min-h-[120px] p-4 border-2 border-foreground/30 bg-background text-foreground placeholder:text-foreground/30 focus:border-foreground outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-3">
            What should we focus on this time?
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'acquisition', label: 'Acquisition' },
              { value: 'activation', label: 'Activation' },
              { value: 'retention', label: 'Retention' },
              { value: 'referral', label: 'Referral' },
              { value: 'monetization', label: 'Monetization' },
            ].map((opt) => (
              <label
                key={opt.value}
                className="inline-flex items-center px-4 py-2 border-2 border-foreground/30 cursor-pointer transition-all duration-100 hover:border-foreground hover:shadow-[2px_2px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
              >
                <input
                  type="radio"
                  name="focusArea"
                  value={opt.value}
                  defaultChecked={opt.value === 'acquisition'}
                  className="sr-only"
                />
                <span className="text-sm font-bold">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
          >
            Generate Updated Action Plan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return dateStr
  }
}
