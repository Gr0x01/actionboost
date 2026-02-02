'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { NAV_ITEMS } from './nav-config'

function DashboardBottomNavInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const bizParam = searchParams.get('biz')
  const qs = bizParam ? `?biz=${bizParam}` : ''

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background border-t-2 border-foreground/20 z-40 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <Link
              key={path}
              href={`${path}${qs}`}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5
                text-[10px] font-medium
                transition-colors
                ${isActive ? 'text-cta' : 'text-foreground/40'}
              `}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function DashboardBottomNav() {
  return (
    <Suspense fallback={
      <nav className="fixed bottom-0 inset-x-0 bg-background border-t-2 border-foreground/20 z-40 md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14" />
      </nav>
    }>
      <DashboardBottomNavInner />
    </Suspense>
  )
}
