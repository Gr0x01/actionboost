'use client'

import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ParsedStrategy } from '@/lib/markdown/parser'
import { MarkdownContent, slugify } from '../MarkdownContent'
import { SectionTableOfContents } from './SectionTableOfContents'

/**
 * Count h2/h3 headings in markdown to determine if TOC should show
 */
function countHeadings(markdown: string): number {
  const lines = markdown.split('\n')
  let count = 0
  for (const line of lines) {
    if (/^##\s+.+$/.test(line) || /^###\s+.+$/.test(line)) {
      count++
    }
  }
  return count
}

interface DeepDivesAccordionProps {
  strategy: ParsedStrategy
}

type AccordionSection = {
  id: string
  title: string
  content: string
}

/**
 * Get all available sections from parsed strategy for the accordion
 */
function getSections(strategy: ParsedStrategy): AccordionSection[] {
  const sections: AccordionSection[] = []

  // Order matters - this is the deep dive sequence
  if (strategy.executiveSummary) {
    sections.push({
      id: 'executive-summary',
      title: 'Executive Summary',
      content: strategy.executiveSummary.content,
    })
  }

  if (strategy.currentSituation) {
    sections.push({
      id: 'your-situation',
      title: 'Your Situation',
      content: strategy.currentSituation.content,
    })
  }

  if (strategy.competitiveLandscape) {
    sections.push({
      id: 'competitive-landscape',
      title: 'Competitive Landscape',
      content: strategy.competitiveLandscape.content,
    })
  }

  if (strategy.channelStrategy) {
    sections.push({
      id: 'channel-strategy',
      title: 'Channel Strategy',
      content: strategy.channelStrategy.content,
    })
  }

  if (strategy.stopDoing) {
    sections.push({
      id: 'stop-doing',
      title: 'Stop Doing',
      content: strategy.stopDoing.content,
    })
  }

  if (strategy.startDoing) {
    sections.push({
      id: 'start-doing',
      title: 'Start Doing (Full)',
      content: strategy.startDoing.content,
    })
  }

  if (strategy.thisWeek) {
    sections.push({
      id: 'this-week',
      title: 'This Week (Full)',
      content: strategy.thisWeek.content,
    })
  }

  if (strategy.roadmap) {
    sections.push({
      id: '30-day-roadmap',
      title: '30-Day Roadmap',
      content: strategy.roadmap.content,
    })
  }

  if (strategy.metricsDashboard) {
    sections.push({
      id: 'metrics-dashboard',
      title: 'Metrics Dashboard',
      content: strategy.metricsDashboard.content,
    })
  }

  if (strategy.contentTemplates) {
    sections.push({
      id: 'content-templates',
      title: 'Content Templates',
      content: strategy.contentTemplates.content,
    })
  }

  return sections
}

/**
 * ExpandedContent - Renders section content with optional TOC
 * Two-column layout only when 2+ headings exist (TOC will show)
 */
function ExpandedContent({ section }: { section: AccordionSection }) {
  const headingCount = useMemo(() => countHeadings(section.content), [section.content])
  const hasToc = headingCount >= 2

  // Two-column layout when TOC is available on lg+ screens
  if (hasToc) {
    return (
      <div className="flex gap-12 pl-8 pr-6 pb-8 pt-2">
        {/* Main content - constrained width for readability */}
        <article className="flex-1 min-w-0 max-w-[65ch]">
          <div className="font-serif text-[17px] leading-[1.8] text-foreground/85">
            <MarkdownContent
              content={section.content}
              extended
              idPrefix={section.id}
            />
          </div>
        </article>

        {/* Right rail - sticky TOC, only on lg+ screens */}
        <div className="hidden lg:block flex-shrink-0">
          <SectionTableOfContents
            content={section.content}
            idPrefix={section.id}
          />
        </div>
      </div>
    )
  }

  // Single column when no TOC - generous padding, readable width
  return (
    <div className="pl-8 pr-6 pb-8 pt-2">
      <article className="max-w-[65ch]">
        <div className="font-serif text-[17px] leading-[1.8] text-foreground/85">
          <MarkdownContent
            content={section.content}
            extended
            idPrefix={section.id}
          />
        </div>
      </article>
    </div>
  )
}

/**
 * DeepDivesAccordion - Full strategy content in expandable sections
 *
 * Design:
 * - Full-width accordion to match other sections
 * - Two-column layout when expanded: constrained prose + sticky TOC
 * - Sticky headers when expanded for navigation
 * - "Collapse all" when 2+ sections open
 * - Gap between sections for breathing room
 */
export function DeepDivesAccordion({ strategy }: DeepDivesAccordionProps) {
  const sections = getSections(strategy)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const openCount = openSections.size

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const collapseAll = () => {
    setOpenSections(new Set())
  }

  if (sections.length === 0) {
    return null
  }

  return (
    <section className="scroll-mt-32">
      {/* Header row with label and collapse all */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40">
          DEEP DIVES
        </span>
        {openCount >= 2 && (
          <button
            onClick={collapseAll}
            className="font-mono text-xs text-foreground/50 hover:text-foreground/80 underline underline-offset-2 transition-colors"
          >
            Collapse all
          </button>
        )}
      </div>

      {/* Accordion sections with gap instead of dividers */}
      <div className="flex flex-col gap-2">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id)

          return (
            <div
              key={section.id}
              id={section.id}
              className="border-l-[3px] border-foreground/30 bg-white"
            >
              {/* Accordion header - sticky when open */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between py-4 px-5 text-left hover:bg-foreground/[0.02] transition-colors ${
                  isOpen
                    ? 'sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-foreground/10'
                    : ''
                }`}
              >
                <span className="font-semibold text-foreground">
                  {section.title}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-foreground/40 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Accordion content - two-column on lg+ when TOC available */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <ExpandedContent section={section} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
