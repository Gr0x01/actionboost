'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { RoadmapWeek } from '@/lib/ai/formatter-types'
import { SectionLabel } from '@/components/ui/SectionLabel'

export interface CompletedWeekPreviewProps {
  week: RoadmapWeek
  completedCount: number
  totalCount: number
  tasks: Array<{ action: string; completed: boolean }>
  isExpanded: boolean
  onToggle: () => void
  onRevisit: () => void
}

/**
 * CompletedWeekPreview - Muted card for finished weeks (Soft style)
 */
export function CompletedWeekPreview({
  week,
  completedCount,
  totalCount,
  tasks,
  isExpanded,
  onToggle,
  onRevisit,
}: CompletedWeekPreviewProps) {
  return (
    <div className="border border-foreground/15 rounded-md overflow-hidden bg-foreground/[0.02]">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onToggle}
          className="flex items-baseline gap-3 hover:opacity-70 transition-opacity text-left"
        >
          <SectionLabel className="text-foreground/40">Week {week.week}</SectionLabel>
          <span className="font-semibold text-lg text-foreground/50">{week.theme}</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-foreground/40">{completedCount}/{totalCount} done</span>
          <button
            onClick={onRevisit}
            className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            Revisit
          </button>
          <button
            onClick={onToggle}
            className="text-foreground/40 hover:text-foreground/60 transition-colors"
            aria-label={isExpanded ? 'Collapse week details' : 'Expand week details'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-foreground/10">
              <ul className="mt-3 space-y-3">
                {tasks.map((task, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-base"
                  >
                    <span className="text-foreground/30 font-mono text-sm mt-0.5">{i + 1}.</span>
                    <span className={task.completed ? 'text-foreground/40 line-through decoration-foreground/20' : 'text-foreground/50'}>
                      {task.action}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
