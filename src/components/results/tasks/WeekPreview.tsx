'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { RoadmapWeek } from '@/lib/ai/formatter-types'
import { SectionLabel } from '@/components/ui/SectionLabel'

export interface WeekPreviewProps {
  week: RoadmapWeek
  isExpanded: boolean
  onToggle: () => void
}

/**
 * WeekPreview - Collapsed preview for future weeks (Strong Brutalist)
 */
export function WeekPreview({ week, isExpanded, onToggle }: WeekPreviewProps) {
  return (
    <div
      className="border-2 border-foreground rounded-md overflow-hidden bg-white"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors text-left"
      >
        <div className="flex items-baseline gap-3">
          <SectionLabel>Week {week.week}</SectionLabel>
          <span className="font-semibold text-lg text-foreground">{week.theme}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/40">
          <span className="font-mono text-sm">{week.tasks.length} tasks</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t-2 border-foreground/10">
              <ul className="mt-3 space-y-3">
                {week.tasks.map((task, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                    className="flex items-start gap-3 text-base text-foreground/70"
                  >
                    <span className="text-foreground/40 font-mono text-sm mt-0.5">{i + 1}.</span>
                    <span>{task}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
