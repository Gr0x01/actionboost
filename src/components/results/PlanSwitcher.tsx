'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FileText, ChevronDown, Check, Plus } from 'lucide-react'

interface Plan {
  id: string
  name: string
  updatedAt: string
}

interface PlanSwitcherProps {
  currentPlan: Plan
  otherPlans?: Plan[]
}

/**
 * Extract a display name from the plan/product description
 * Truncates long descriptions and cleans up formatting
 */
function formatPlanName(name: string): string {
  // Take first sentence or first 50 chars, whichever is shorter
  const firstSentence = name.split(/[.!?]/)[0]
  const cleaned = firstSentence.trim()
  if (cleaned.length > 50) {
    return cleaned.slice(0, 47) + '...'
  }
  return cleaned
}

/**
 * Format relative date for display
 */
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Updated today'
  if (diffDays === 1) return 'Updated yesterday'
  if (diffDays < 7) return `Updated ${diffDays} days ago`
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`
  return `Updated ${date.toLocaleDateString()}`
}

/**
 * PlanSwitcher - Shows current plan name with dropdown to switch between plans
 *
 * Soft Brutalist styling:
 * - Clean display when single plan
 * - Dropdown with offset shadow when multiple plans
 */
export function PlanSwitcher({ currentPlan, otherPlans = [] }: PlanSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hasMultiplePlans = otherPlans.length > 0
  const allPlans = [currentPlan, ...otherPlans]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const displayName = formatPlanName(currentPlan.name)
  const relativeDate = formatRelativeDate(currentPlan.updatedAt)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main button/display - compact, just name + caret */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="
          flex items-center gap-2 py-1
          text-left
          hover:opacity-80
          transition-opacity duration-100
        "
      >
        {/* Plan name */}
        <h1 className="font-bold text-foreground text-base truncate max-w-[200px] sm:max-w-[320px]">
          {displayName}
        </h1>

        {/* Dropdown caret - always visible */}
        <ChevronDown
          className={`
            w-4 h-4 text-foreground/50
            transition-transform duration-150
            flex-shrink-0
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown panel - always available */}
      {isOpen && (
        <div className="
          absolute left-0 top-full mt-2
          w-[320px] max-h-[300px] overflow-y-auto
          bg-background
          border-2 border-foreground/20
          rounded-lg
          shadow-[4px_4px_0_rgba(44,62,80,0.1)]
          z-50
        ">
          {/* Current plan - shown as selected */}
          <div className="px-4 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cta flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate text-sm">
                  {formatPlanName(currentPlan.name)}
                </p>
                <p className="text-xs text-foreground/40">
                  {relativeDate}
                </p>
              </div>
            </div>
          </div>

          {/* Other plans list - only if there are others */}
          {otherPlans.length > 0 && (
            <div className="py-1 border-b border-foreground/10">
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
                  Other plans
                </span>
              </div>
              {otherPlans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/results/${plan.id}`}
                  onClick={() => setIsOpen(false)}
                  className="
                    flex items-center gap-3 px-4 py-2.5
                    hover:bg-foreground/[0.03]
                    transition-colors duration-100
                  "
                >
                  <FileText className="w-4 h-4 text-foreground/30 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground/80 truncate text-sm">
                      {formatPlanName(plan.name)}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {formatRelativeDate(plan.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer action */}
          <div className="px-4 py-3">
            <Link
              href="/start"
              onClick={() => setIsOpen(false)}
              className="
                flex items-center gap-2
                text-sm font-semibold text-cta
                hover:text-cta/80
              "
            >
              <Plus className="w-4 h-4" />
              Create new plan
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
