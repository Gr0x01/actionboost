'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Plus } from 'lucide-react'
import type { BusinessSummary } from '@/lib/types/context'

interface ProjectSwitcherProps {
  businesses: BusinessSummary[]
  activeBizId: string | null
}

export function ProjectSwitcher({ businesses, activeBizId }: ProjectSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeBusiness = businesses.find((b) => b.id === activeBizId) || businesses[0]

  // Close on outside click + ESC
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  function navigateToBiz(bizId: string) {
    const params = new URLSearchParams()
    params.set('biz', bizId)
    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  if (!activeBusiness) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="
          flex items-center gap-1.5
          text-sm font-bold text-foreground
          hover:text-foreground/70
          transition-colors
        "
      >
        <span className="truncate max-w-[200px]">{activeBusiness.name}</span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            aria-label="Project list"
            className="
              absolute left-0 top-full mt-2
              w-64
              bg-background
              border-2 border-foreground/20
              rounded-md
              shadow-[4px_4px_0_rgba(44,62,80,0.1)]
              z-50
              overflow-hidden
            "
          >
            <div className="py-1">
              {businesses.map((biz) => (
                <button
                  key={biz.id}
                  role="option"
                  aria-selected={biz.id === activeBizId}
                  onClick={() => navigateToBiz(biz.id)}
                  className="
                    w-full text-left px-4 py-2.5
                    flex items-center justify-between
                    text-sm font-medium text-foreground/70
                    hover:bg-foreground/[0.04]
                    hover:text-foreground
                    transition-colors
                  "
                >
                  <span className="truncate">{biz.name}</span>
                  {biz.id === activeBizId && (
                    <Check className="w-4 h-4 text-cta shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-foreground/10">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/start')
                }}
                className="
                  w-full text-left px-4 py-2.5
                  flex items-center gap-2
                  text-sm font-medium text-foreground/50
                  hover:bg-foreground/[0.04]
                  hover:text-foreground
                  transition-colors
                "
              >
                <Plus className="w-4 h-4" />
                Add project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
