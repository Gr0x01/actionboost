'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react'
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
 * - 1 remaining: Slightly more prominent
 * - 0 remaining: Closure, "all set"
 *
 * Soft Brutalist styling matching project design system
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
  const isLastOne = remaining === 1
  const contextLength = context.trim().length
  const isValidLength = contextLength >= MIN_CONTEXT_LENGTH && contextLength <= MAX_CONTEXT_LENGTH

  // Don't show for non-owners or when exhausted
  if (!isOwner || remaining <= 0) return null

  const handleExpand = () => {
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

  // Collapsed state - clickable card
  if (formState === 'collapsed') {
    return (
      <button
        id="refinement-interstitial"
        onClick={handleExpand}
        aria-label={isLastOne ? 'One refinement left - click to expand' : 'Refine your plan - click to expand'}
        className={`
          group w-full text-left rounded-xl p-5
          border-2 transition-all duration-150
          hover:-translate-y-0.5
          ${isLastOne
            ? 'bg-background border-foreground/25'
            : 'bg-background border-foreground/15'
          }
        `}
        style={{
          boxShadow: isLastOne
            ? '4px 4px 0 rgba(44, 62, 80, 0.12)'
            : '4px 4px 0 rgba(44, 62, 80, 0.08)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                {isLastOne
                  ? 'One refinement left'
                  : 'Have context that could make this even better?'
                }
              </p>
              <p className="text-xs text-foreground/50">
                {isLastOne
                  ? 'Make it count — tell us exactly what to adjust'
                  : `${remaining} free refinements included with your Boost`
                }
              </p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-foreground/30 group-hover:text-foreground/50 transition-colors flex-shrink-0" />
        </div>
      </button>
    )
  }

  // Expanded state - form
  return (
    <div
      id="refinement-interstitial"
      className="bg-background border-2 border-foreground/20 rounded-xl overflow-hidden"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-foreground/50" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/50">
            Sharpen Your Boost
          </span>
        </div>
        <span className="font-mono text-xs text-foreground/40">
          {remaining} left
        </span>
      </div>

      {/* Form content */}
      <div className="p-5">
        <p className="text-sm text-foreground/60 mb-4" id="refinement-description">
          Add details only you know — your secret sauce, local quirks, what has worked before — and we&apos;ll sharpen your Boost.
        </p>

        <label htmlFor="refinement-context" className="sr-only">
          Additional context for your Boost
        </label>
        <textarea
          id="refinement-context"
          aria-describedby="refinement-description"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={formState === 'submitting'}
          placeholder="What would make this Boost fit your business better? Maybe your bestseller, a slow season coming up, or something that worked in the past..."
          className="
            w-full h-28 p-4 text-sm rounded-xl
            border-2 border-foreground/15
            bg-white
            placeholder:text-foreground/30
            focus:border-foreground/40 focus:outline-none
            resize-none
            disabled:opacity-50 disabled:bg-surface
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
            className="text-sm font-medium text-foreground/50 hover:text-foreground/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isValidLength || formState === 'submitting'}
            className="
              flex items-center gap-2
              bg-cta text-white font-bold
              px-5 py-2.5 rounded-xl text-sm
              border-2 border-cta
              shadow-[4px_4px_0_rgba(44,62,80,0.3)]
              hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)]
              hover:-translate-y-0.5
              active:shadow-[2px_2px_0_rgba(44,62,80,0.3)]
              active:translate-y-0.5
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)]
              disabled:hover:translate-y-0
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
