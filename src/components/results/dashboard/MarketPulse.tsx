'use client'

import type { MarketQuote as MarketQuoteType } from '@/lib/ai/formatter-types'

interface MarketPulseProps {
  quotes: MarketQuoteType
}

/**
 * Validate that a URL is safe to render as a link (http/https only)
 * Prevents javascript: and other protocol-based XSS
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
 * MarketPulse - Reddit/community quotes with big quote styling
 *
 * Editorial feel: large decorative quote mark, clean cards
 */
export function MarketPulse({ quotes: quotesData }: MarketPulseProps) {
  const { quotes } = quotesData

  if (!quotes || quotes.length === 0) {
    return null
  }

  // Take top 6 quotes (fits 2 rows of 3)
  const displayQuotes = quotes.slice(0, 6)

  return (
    <section className="scroll-mt-32">
      {/* Section label */}
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
        MARKET PULSE
      </span>

      {/* Quotes grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayQuotes.map((quote, index) => (
          <div
            key={`quote-${index}`}
            className="bg-background border border-foreground/15 rounded-md p-4"
          >
            {/* Big decorative quote mark */}
            <span className="text-4xl font-serif text-cta/30 leading-none select-none">
              &ldquo;
            </span>

            {/* Quote text */}
            <p className="text-sm text-foreground/80 leading-relaxed -mt-2 mb-3">
              {quote.text}
            </p>

            {/* Source + link */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-foreground/50">
                {quote.source}
              </span>
              {quote.url && isValidHttpUrl(quote.url) && (
                <a
                  href={quote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cta hover:underline"
                >
                  View
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
