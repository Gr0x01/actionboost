'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'boost_cookie_notice_dismissed'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      // localStorage unavailable (private browsing, etc.) - show banner anyway
    }

    // Show after 1s delay
    const timer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Ignore - banner will show again next visit
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="
            fixed bottom-5 right-5 z-40 w-80 max-w-[calc(100vw-2rem)]
            bg-white border-2 border-foreground/20 rounded-md p-4
            shadow-[4px_4px_0_rgba(44,62,80,0.1)]
          "
          role="region"
          aria-label="Cookie notice"
        >
          <p className="text-sm text-foreground mb-3">
            We use cookies to improve your experience.{' '}
            <Link
              href="/privacy"
              className="text-cta underline underline-offset-2 hover:text-cta/80"
            >
              Privacy Policy
            </Link>
          </p>
          <button
            onClick={dismiss}
            className="
              w-full bg-cta text-white font-semibold text-sm
              px-4 py-2.5 rounded-md
              border-b-[3px] border-b-[#B85D10]
              hover:-translate-y-0.5 hover:shadow-md
              active:translate-y-0.5 active:border-b-0
              transition-all duration-100
            "
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
