'use client'

import { RefreshCw, ArrowRight, Sparkles } from 'lucide-react'
import { Button, Textarea } from '@/components/ui'
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
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Welcome back!
          </h2>
          <p className="text-muted text-sm mt-1">
            You&apos;ve run {totalRuns} {totalRuns === 1 ? 'action plan' : 'action plans'} so far
          </p>
        </div>
      </div>

      {/* Last run summary */}
      <div className="bg-background/50 rounded-lg p-4 mb-6 space-y-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Last time</p>
          <p className="text-sm text-foreground">{productSummary}</p>
        </div>

        {lastTraction && (
          <div>
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Traction</p>
            <p className="text-sm text-foreground line-clamp-2">{lastTraction}</p>
          </div>
        )}

        {lastRunDate && (
          <p className="text-xs text-muted">
            Last action plan: {formatDate(lastRunDate)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={() => onContinueWithUpdates('')}
          size="lg"
          className="w-full justify-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Continue with updates
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <button
          onClick={onStartFresh}
          className="w-full text-center text-sm text-muted hover:text-foreground transition-colors py-2"
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
        <h2 className="text-xl font-semibold text-foreground mb-2">
          What&apos;s changed?
        </h2>
        <p className="text-muted text-sm">
          Tell us what&apos;s new since your last action plan. We&apos;ll build on what we know.
        </p>
      </div>

      {/* Show last traction for reference */}
      {lastTraction && (
        <div className="bg-surface/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">
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
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
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
        <Textarea
          name="delta"
          label="What's new?"
          hint="New traction, tactics tried, what's working, challenges..."
          placeholder="e.g., We hit 1000 users! Twitter is driving signups but retention is dropping. Tried a referral program but it flopped..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
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
                className="inline-flex items-center px-4 py-2 rounded-full border border-border/60 hover:border-primary/50 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="focusArea"
                  value={opt.value}
                  defaultChecked={opt.value === 'acquisition'}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" size="lg" className="flex-1">
            Generate Updated Action Plan
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
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
