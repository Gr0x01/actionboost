'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ProjectSwitcher } from './ProjectSwitcher'
import { DashboardBottomNav } from './DashboardBottomNav'
import { NAV_ITEMS } from './nav-config'
import type { BusinessSummary } from '@/lib/types/context'

interface DashboardShellProps {
  businesses: BusinessSummary[]
  userEmail: string
  children: React.ReactNode
}

function getInitials(email: string): string {
  const username = email.split('@')[0]
  return username.slice(0, 2).toUpperCase()
}

function DashboardShellInner({ businesses, userEmail, children }: DashboardShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const bizParam = searchParams.get('biz')

  const activeBizId = useMemo(() => {
    if (businesses.length === 0) return null
    if (bizParam && businesses.some((b) => b.id === bizParam)) return bizParam
    return businesses[0].id
  }, [bizParam, businesses])

  const qs = activeBizId ? `?biz=${activeBizId}` : ''
  const initials = getInitials(userEmail)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop top bar */}
      <header className="border-b-2 border-foreground/20 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: logo + project switcher */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-sm font-bold text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Boost
            </Link>
            <span className="text-foreground/20 hidden md:inline">/</span>
            <div className="hidden md:block">
              <ProjectSwitcher businesses={businesses} activeBizId={activeBizId} />
            </div>
            {/* Mobile: just show project switcher inline */}
            <div className="md:hidden">
              <ProjectSwitcher businesses={businesses} activeBizId={activeBizId} />
            </div>
          </div>

          {/* Center: desktop nav links */}
          <nav className="hidden md:flex items-end h-full gap-1">
            {NAV_ITEMS.map(({ label, path }) => {
              const isActive = pathname === path
              return (
                <Link
                  key={path}
                  href={`${path}${qs}`}
                  className={`
                    relative px-3 pb-3 text-sm font-medium transition-colors
                    ${isActive
                      ? 'text-foreground'
                      : 'text-foreground/50 hover:text-foreground'
                    }
                  `}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: user initials */}
          <div
            className="
              w-8 h-8 flex items-center justify-center
              rounded-full bg-background
              border-2 border-foreground/20
              text-xs font-bold text-foreground/70
            "
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <DashboardBottomNav />
    </div>
  )
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardShellInner {...props} />
    </Suspense>
  )
}
