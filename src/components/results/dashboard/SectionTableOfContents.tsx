'use client'

import { useEffect, useState, useMemo } from 'react'
import { slugify } from '../MarkdownContent'

interface Heading {
  id: string
  text: string
  level: number
}

interface SectionTableOfContentsProps {
  content: string
  idPrefix: string
}

/**
 * Parse h2/h3 headings from markdown content
 * Uses same slugify logic as MarkdownContent for matching IDs
 */
function parseHeadings(markdown: string, idPrefix: string): Heading[] {
  const headings: Heading[] = []
  const lines = markdown.split('\n')

  for (const line of lines) {
    // Match ## or ### headings
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h2Match) {
      const text = h2Match[1].trim()
      const id = `${idPrefix}-${slugify(text)}`
      headings.push({ id, text, level: 2 })
    } else if (h3Match) {
      const text = h3Match[1].trim()
      const id = `${idPrefix}-${slugify(text)}`
      headings.push({ id, text, level: 3 })
    }
  }

  return headings
}

/**
 * SectionTableOfContents - Sticky sidebar showing headings within a section
 *
 * Features:
 * - Parses h2/h3 from markdown
 * - Scroll-spy highlights active heading
 * - Click to smooth-scroll
 * - Soft Brutalist styling
 */
export function SectionTableOfContents({ content, idPrefix }: SectionTableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(content, idPrefix), [content, idPrefix])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Scroll spy - track which heading is in view
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -70% 0px', // Trigger when heading is near top
        threshold: 0,
      }
    )

    // Observe all heading elements
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) {
    // Don't show TOC for sections with fewer than 2 headings
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <aside className="sticky top-24 w-48 p-4 border-l-2 border-foreground/10">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
        In this section
      </p>

      <nav className="space-y-1.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          const isH3 = heading.level === 3

          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`block text-sm leading-snug transition-all duration-150 ${
                isH3 ? 'pl-3' : ''
              } ${
                isActive
                  ? 'text-foreground font-medium border-l-2 border-cta pl-3 -ml-[2px]'
                  : 'text-foreground/50 hover:text-foreground/80'
              }`}
            >
              {heading.text}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
