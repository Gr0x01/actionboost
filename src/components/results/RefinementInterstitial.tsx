'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { SlidersHorizontal, ChevronDown, Loader2, Check } from 'lucide-react'
import { MAX_FREE_REFINEMENTS, MIN_CONTEXT_LENGTH, MAX_CONTEXT_LENGTH } from '@/lib/types/database'

interface RefinementInterstitialProps {
  runId: string
  refinementsUsed: number
  isOwner: boolean
}

type FormState = 'collapsed' | 'expanded' | 'submitting'

/**
 * RefinementInterstitial - Contextual refinement form after key insights
 *
 * Three states based on remaining refinements:
 * - 2 remaining: Subtle, encouraging
 * - 1 remaining: Warmer, "make it count"
 * - 0 remaining: Closure, "all set"
 *
 * Soft brutalist styling with warm amber accents
 */
export function RefinementInterstitial({
  runId,
  refinementsUsed,
  isOwner,
}: RefinementInterstitialProps) {
  const router = useRouter()
  const posthog = usePostHog()
  const [formState, setFormState] = useState<FormState>('collapsed')
  const [context, setContext] = useState('')
  const [error, setError] = useState<string | null>(null)

  const remaining = MAX_FREE_REFINEMENTS - refinementsUsed
  const isExhausted = remaining <= 0
  const isLastOne = remaining === 1
  const contextLength = context.trim().length
  const isValidLength = contextLength >= MIN_CONTEXT_LENGTH && contextLength <= MAX_CONTEXT_LENGTH

  // Don't show for non-owners
  if (!isOwner) return null

  const handleExpand = () => {
    if (isExhausted) return
    setFormState('expanded')
    posthog?.capture('refinement_interstitial_expanded', { run_id: runId, remaining })
  }

  const handleCollapse = () => {
    setFormState('collapsed')
    setError(null)
  }

  const handleSubmit = async () => {
    if (!isValidLength || formState === 'submitting') return

    setFormState('submitting')
    setError(null)

    try {
      const response = await fetch(`/api/runs/${runId}/add-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalContext: context.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        setFormState('expanded')
        return
      }

      posthog?.capture('refinement_completed', {
        run_id: data.runId,
        parent_run_id: runId,
        via: 'interstitial',
      })

      router.push(`/results/${data.runId}`)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      setFormState('expanded')
      console.error('Refinement submit error:', err)
    }
  }

  // Exhausted state - soft closure
  if (isExhausted) {
    return (
      <div
        id="refinement-interstitial"
        className="
          bg-slate-50 border-2 border-foreground/10 rounded-md p-5
          flex items-center justify-between
        "
        style={{ boxShadow: '3px 3px 0 rgba(44, 62, 80, 0.05)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/60">
              All set
            </p>
            <p className="text-xs text-foreground/40">
              You have used both refinements. Time to put this plan into action.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Collapsed state
  if (formState === 'collapsed') {
    return (
      <button
        id="refinement-interstitial"
        onClick={handleExpand}
        aria-label={isLastOne ? 'One refinement left - click to expand' : 'Refine your plan - click to expand'}
        className="
          group w-full text-left
          bg-white border-2 rounded-md p-5
          transition-all duration-100
          hover:-translate-y-0.5
        "
        style={{
          borderColor: isLastOne ? 'rgba(217, 119, 6, 0.3)' : 'rgba(44, 62, 80, 0.15)',
          backgroundColor: isLastOne ? 'rgba(255, 251, 235, 0.5)' : 'white',
          boxShadow: isLastOne
            ? '3px 3px 0 rgba(217, 119, 6, 0.1)'
            : '3px 3px 0 rgba(44, 62, 80, 0.08)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: isLastOne ? 'rgba(254, 243, 199, 1)' : 'rgba(254, 249, 195, 0.8)',
              }}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {isLastOne
                  ? 'One refinement left'
                  : 'Have context that could make this even better?'
                }
              </p>
              <p className="text-xs text-foreground/50">
                {isLastOne
                  ? 'Make it count — tell us exactly what to adjust'
                  : `${remaining} free refinements included with your plan`
                }
              </p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
        </div>
      </button>
    )
  }

  // Expanded state - form
  return (
    <div
      id="refinement-interstitial"
      className="bg-white border-2 border-foreground/20 rounded-md overflow-hidden"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-foreground/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-foreground/70">
            Sharpen Your Plan
          </span>
        </div>
        <span className="text-xs text-foreground/40">
          {remaining} refinement{remaining === 1 ? '' : 's'} left
        </span>
      </div>

      {/* Form content */}
      <div className="p-5">
        <p className="text-sm text-foreground/60 mb-4" id="refinement-description">
          Add details only you know — your secret sauce, local quirks, what has worked before — and we will sharpen the plan.
        </p>

        <label htmlFor="refinement-context" className="sr-only">
          Additional context for your plan
        </label>
        <textarea
          id="refinement-context"
          aria-describedby="refinement-description"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={formState === 'submitting'}
          placeholder="What would make this plan fit your business better? Maybe your bestseller, a slow season coming up, or something that worked in the past..."
          className="
            w-full h-28 p-4 text-sm rounded-md
            border-2 border-foreground/15
            bg-white
            placeholder:text-foreground/30
            focus:border-amber-400 focus:outline-none
            resize-none
            disabled:opacity-50 disabled:bg-slate-50
            transition-colors
          "
        />

        {/* Character count */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={contextLength < MIN_CONTEXT_LENGTH ? 'text-foreground/40' : 'text-foreground/60'}>
            {contextLength < MIN_CONTEXT_LENGTH && (
              <span>At least {MIN_CONTEXT_LENGTH} characters needed</span>
            )}
            {contextLength >= MIN_CONTEXT_LENGTH && contextLength <= MAX_CONTEXT_LENGTH && (
              <span className="text-green-600">{contextLength} characters</span>
            )}
            {contextLength > MAX_CONTEXT_LENGTH && (
              <span className="text-red-600">{contextLength} / {MAX_CONTEXT_LENGTH} (too long)</span>
            )}
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-5">
          <button
            onClick={handleCollapse}
            disabled={formState === 'submitting'}
            className="text-sm text-foreground/50 hover:text-foreground/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isValidLength || formState === 'submitting'}
            className="
              flex items-center gap-2
              bg-cta text-white font-semibold
              px-5 py-2.5 rounded-md text-sm
              border-b-[3px] border-b-[#B85D10]
              hover:-translate-y-0.5
              active:translate-y-0.5 active:border-b-0
              transition-all duration-100
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:translate-y-0 disabled:active:translate-y-0
            "
          >
            {formState === 'submitting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update My Plan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
