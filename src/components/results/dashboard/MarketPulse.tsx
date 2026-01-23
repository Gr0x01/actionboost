'use client'

import { MessageCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
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
 * Get sentiment icon and color
 */
function getSentimentDisplay(sentiment?: 'positive' | 'negative' | 'neutral') {
  switch (sentiment) {
    case 'positive':
      return {
        icon: ThumbsUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      }
    case 'negative':
      return {
        icon: ThumbsDown,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      }
    default:
      return {
        icon: Minus,
        color: 'text-foreground/50',
        bg: 'bg-foreground/5',
        border: 'border-foreground/10',
      }
  }
}

/**
 * MarketPulse - Reddit/community quotes with sentiment
 *
 * Shows real voices from the market - complaints, praise, opinions
 * Soft Brutalist: quote cards with visible borders, tactile feel
 */
export function MarketPulse({ quotes: quotesData }: MarketPulseProps) {
  const { quotes } = quotesData

  if (!quotes || quotes.length === 0) {
    return null
  }

  // Take top 5 quotes
  const displayQuotes = quotes.slice(0, 5)

  return (
    <section className="scroll-mt-32">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="shrink-0 w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-cta" />
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block">
            MARKET PULSE
          </span>
          <p className="text-sm text-foreground/60">
            What people are saying online
          </p>
        </div>
      </div>

      {/* Quotes */}
      <div className="space-y-4">
        {displayQuotes.map((quote, index) => {
          const sentiment = getSentimentDisplay(quote.sentiment)

          return (
            <div
              key={`quote-${index}`}
              className="relative rounded-md border-2 border-foreground/20 bg-background p-4"
              style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
            >
              {/* Sentiment accent bar on left */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${
                  quote.sentiment === 'positive' ? 'bg-green-500' :
                  quote.sentiment === 'negative' ? 'bg-red-500' : 'bg-foreground/20'
                }`}
              />

              {/* Quote text */}
              <blockquote className="text-sm text-foreground/80 leading-relaxed pr-4">
                &ldquo;{quote.text}&rdquo;
              </blockquote>

              {/* Source */}
              <div className="mt-3 flex items-center justify-between">
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
                    View source
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
