'use client'

import { Search, Globe, Target, Key } from 'lucide-react'
import type { ResearchSnapshot as ResearchSnapshotType } from '@/lib/ai/formatter-types'

interface ResearchSnapshotProps {
  snapshot: ResearchSnapshotType
}

/**
 * ResearchSnapshot - Hero stats grid showing research depth
 *
 * "Wow" factor for skeptical users - shows the actual work done
 * Soft Brutalist: visible borders, tactile cards, bold numbers
 */
export function ResearchSnapshot({ snapshot }: ResearchSnapshotProps) {
  const stats = [
    {
      icon: Search,
      value: snapshot.searchesRun,
      label: 'Searches run',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Globe,
      value: snapshot.pagesAnalyzed,
      label: 'Pages analyzed',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: Target,
      value: snapshot.competitorsResearched,
      label: 'Competitors studied',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: Key,
      value: snapshot.keywordGapsFound,
      label: 'Keyword opportunities',
      color: 'text-orange-600 bg-orange-50',
    },
  ]

  // Only show stats with values > 0
  const visibleStats = stats.filter((s) => s.value > 0)

  if (visibleStats.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Hero card with accent border */}
      <div
        className="rounded-md border-2 border-foreground/20 bg-background p-6"
        style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
      >
        {/* Header */}
        <div className="mb-6">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
            RESEARCH PERFORMED
          </span>
          <h2 className="text-lg font-bold text-foreground">
            What we discovered for you
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-3 rounded-md border border-foreground/10 bg-foreground/[0.03]"
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-foreground/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
