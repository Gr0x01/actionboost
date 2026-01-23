'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { User as AuthUser } from '@supabase/supabase-js'

interface UserMenuProps {
  user: AuthUser
}

/**
 * Get initials from email (first two letters of username)
 */
function getInitials(email: string): string {
  const username = email.split('@')[0]
  return username.slice(0, 2).toUpperCase()
}

/**
 * UserMenu - Initials circle with dropdown for account actions
 *
 * Soft Brutalist styling:
 * - Circle with 2px border
 * - Dropdown with offset shadow
 */
export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = getInitials(user.email || 'U')

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger - initials circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="
          w-8 h-8
          flex items-center justify-center
          rounded-full
          bg-background
          border-2 border-foreground/20
          text-xs font-bold text-foreground/70
          hover:border-foreground/40
          hover:shadow-[3px_3px_0_rgba(44,62,80,0.1)]
          hover:-translate-y-0.5
          transition-all duration-100
        "
      >
        {initials}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2
          w-56
          bg-background
          border-2 border-foreground/20
          rounded-md
          shadow-[4px_4px_0_rgba(44,62,80,0.1)]
          z-50
          overflow-hidden
        ">
          {/* Email header */}
          <div className="px-4 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="
                block px-4 py-2.5
                text-sm font-medium text-foreground/70
                hover:bg-foreground/[0.04]
                hover:text-foreground
                transition-colors
              "
            >
              My Plans
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="
                block px-4 py-2.5
                text-sm font-medium text-foreground/70
                hover:bg-foreground/[0.04]
                hover:text-foreground
                transition-colors
              "
            >
              Settings
            </Link>

            <div className="border-t border-foreground/10 my-1" />

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="
                w-full text-left px-4 py-2.5
                text-sm font-medium text-foreground/70
                hover:bg-foreground/[0.04]
                hover:text-foreground
                transition-colors
                disabled:opacity-50
              "
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
