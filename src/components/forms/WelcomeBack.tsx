'use client'

import { useState, useRef, useEffect } from 'react'
import { RefreshCw, ArrowRight, Sparkles, ChevronLeft, ChevronDown, Building2, Plus } from 'lucide-react'
import type { UserContext, BusinessSummary } from '@/lib/types/context'
import { getContextSummaryText } from '@/lib/hooks/useUserContext'

interface WelcomeBackProps {
  context: UserContext
  onContinueWithUpdates: (delta: string) => void
  onStartFresh: () => void
  // Multi-business support
  businesses?: BusinessSummary[]
  selectedBusinessId?: string | null
  onSelectBusiness?: (businessId: string) => void
}

/**
 * "Welcome back" panel for returning users with existing context
 * Shows last run summary and provides conversational update flow
 * Supports multi-business selection when user has multiple businesses
 */
export function WelcomeBack({
  context,
  onContinueWithUpdates,
  onStartFresh,
  businesses,
  selectedBusinessId,
  onSelectBusiness,
}: WelcomeBackProps) {
  const { productSummary, lastTraction, totalRuns, lastRunDate } = getContextSummaryText(context)
  const [showBusinessSelector, setShowBusinessSelector] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hasMultipleBusinesses = businesses && businesses.length > 1
  const selectedBusiness = businesses?.find(b => b.id === selectedBusinessId)

  // Click-outside handler to close dropdown
  useEffect(() => {
    if (!showBusinessSelector) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBusinessSelector(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showBusinessSelector])

  return (
    <div className="rounded-2xl border-[3px] border-foreground bg-background p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg border-2 border-cta bg-cta/10 flex items-center justify-center flex-shrink-0">
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

      {/* Business Selector (when user has multiple businesses) */}
      {hasMultipleBusinesses && onSelectBusiness && (
        <div className="mb-6">
          <p className="text-xs text-foreground/50 uppercase tracking-wide font-bold mb-2">
            Select business
          </p>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowBusinessSelector(!showBusinessSelector)}
              className="w-full flex items-center justify-between gap-2 rounded-xl px-4 py-3 border-2 border-foreground/30 bg-background text-left hover:border-foreground transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 className="h-4 w-4 text-foreground/50 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {selectedBusiness?.name || 'Select a business'}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-foreground/50 transition-transform ${showBusinessSelector ? 'rotate-180' : ''}`} />
            </button>

            {showBusinessSelector && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgba(44,62,80,1)] max-h-60 overflow-y-auto">
                {businesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => {
                      try {
                        onSelectBusiness(business.id)
                      } finally {
                        setShowBusinessSelector(false)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5 transition-colors ${
                      business.id === selectedBusinessId ? 'bg-cta/10' : ''
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-foreground/50 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{business.name}</p>
                      <p className="text-xs text-foreground/50">
                        {business.totalRuns} {business.totalRuns === 1 ? 'run' : 'runs'}
                        {business.lastRunDate && ` · Last: ${formatDate(business.lastRunDate)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last run summary */}
      <div className="rounded-xl border-2 border-foreground/20 bg-background p-4 mb-6 space-y-3">
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
          className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
        >
          <RefreshCw className="h-4 w-4" />
          Continue with updates
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={onStartFresh}
          className="w-full flex items-center justify-center gap-2 text-sm text-foreground/50 font-bold hover:text-foreground transition-colors py-2 border-2 border-transparent hover:border-foreground/30"
        >
          <Plus className="h-4 w-4" />
          Start fresh with a new business
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
  const [error, setError] = useState<string | null>(null)

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
        <div className="rounded-xl border-2 border-foreground/20 bg-background p-4">
          <p className="text-xs text-foreground/50 uppercase tracking-wide font-bold mb-1">
            Last time you said
          </p>
          <p className="text-sm text-foreground/80 line-clamp-3">{lastTraction}</p>
        </div>
      )}

      {/* Suggested prompts - visual hints, not interactive */}
      {suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <span
              key={i}
              className="text-xs rounded-lg px-3 py-1.5 bg-cta/10 text-cta/70 font-medium"
            >
              {q}
            </span>
          ))}
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const delta = (formData.get('delta') as string || '').trim()
          const focusArea = formData.get('focusArea') as string

          if (!delta) {
            setError('Please tell us what\'s new since your last action plan.')
            return
          }

          setError(null)
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
            onChange={() => error && setError(null)}
            className={`w-full min-h-[120px] rounded-xl p-4 border-2 bg-background text-foreground placeholder:text-foreground/30 focus:border-foreground outline-none transition-colors resize-none ${
              error ? 'border-red-500' : 'border-foreground/30'
            }`}
          />
          {error && (
            <p className="mt-2 text-sm font-bold text-red-600">{error}</p>
          )}
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
                className="inline-flex items-center rounded-xl px-4 py-2 border-2 border-foreground/30 cursor-pointer transition-all duration-100 hover:border-foreground hover:shadow-[2px_2px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
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
            className="flex items-center gap-2 rounded-xl px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
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
