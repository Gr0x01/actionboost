'use client'

import { useRef, useState, useEffect } from 'react'
import type { TabType } from '@/lib/storage/visitTracking'

interface ResultsTabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  showCalendar?: boolean
  /** Tabs to show as disabled (grayed out, not clickable) */
  disabledTabs?: TabType[]
}

/**
 * Tab navigation for Results page - Insights vs Tasks
 * Animated underline that slides between tabs
 */
export function ResultsTabNavigation({
  activeTab,
  onTabChange,
  showCalendar = false,
  disabledTabs = [],
}: ResultsTabNavigationProps) {
  const navRef = useRef<HTMLDivElement>(null)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  const tabs: { id: TabType; label: string }[] = [
    { id: 'insights', label: 'Insights' },
    { id: 'dashboard', label: 'Tasks' },
    ...(showCalendar ? [{ id: 'calendar' as TabType, label: 'Calendar' }] : []),
  ]

  // Update underline position when active tab changes
  useEffect(() => {
    if (!navRef.current) return

    const activeButton = navRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement
    if (activeButton) {
      const navRect = navRef.current.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      setUnderlineStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      })
    }
  }, [activeTab])

  return (
    <nav
      ref={navRef}
      className="relative flex gap-8 h-full items-end"
      role="tablist"
      aria-label="Results view"
    >
      {tabs.map(({ id, label }) => {
        const isActive = activeTab === id
        const isDisabled = disabledTabs.includes(id)

        return (
          <button
            key={id}
            data-tab={id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${id}-panel`}
            aria-disabled={isDisabled}
            onClick={() => !isDisabled && onTabChange(id)}
            className={`
              pb-3
              font-semibold text-base
              transition-colors duration-150
              ${isDisabled
                ? 'text-foreground/30 cursor-not-allowed'
                : isActive
                  ? 'text-foreground'
                  : 'text-foreground/50 hover:text-foreground/70'
              }
            `}
          >
            {label}
          </button>
        )
      })}

      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-[2px] bg-foreground transition-all duration-200 ease-out"
        style={{
          left: underlineStyle.left,
          width: underlineStyle.width,
        }}
      />
    </nav>
  )
}
