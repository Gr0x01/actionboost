'use client'

import type { MarketQuote as MarketQuoteType } from '@/lib/ai/formatter-types'

interface MarketPulseProps {
  quotes: MarketQuoteType
}

/**
 * Validate that a URL is safe to render as a link (http/https only)
 */
function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * MarketPulse - Clean typography grid for community quotes
 *
 * All quotes get equal treatment in a 2-column grid.
 * Quality comes from typography and spacing, not hierarchy.
 */
export function MarketPulse({ quotes: quotesData }: MarketPulseProps) {
  const { quotes } = quotesData

  if (!quotes || quotes.length === 0) {
    return null
  }

  const displayQuotes = quotes.slice(0, 6)

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-8">
        MARKET PULSE
      </span>

      {/* Quote grid - 2 columns, each with continuous left border */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
        {/* Left column */}
        <div className="border-l border-foreground/15 pl-6 space-y-10">
          {displayQuotes.filter((_, i) => i % 2 === 0).map((quote, i) => (
            <blockquote key={`quote-left-${i}`}>
              <p className="text-xl font-semibold leading-snug text-foreground tracking-tight">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-2">
                <cite className="text-sm text-foreground/40 italic">
                  — {quote.source}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Right column */}
        <div className="border-l border-foreground/15 pl-6 space-y-10 mt-10 md:mt-0">
          {displayQuotes.filter((_, i) => i % 2 === 1).map((quote, i) => (
            <blockquote key={`quote-right-${i}`}>
              <p className="text-xl font-semibold leading-snug text-foreground tracking-tight">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-2">
                <cite className="text-sm text-foreground/40 italic">
                  — {quote.source}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
