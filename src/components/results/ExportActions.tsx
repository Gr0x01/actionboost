'use client'

import { useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { Copy, Download, Share2, Check, MoreHorizontal } from 'lucide-react'
import { ShareModal } from './ShareModal'
import { markdownToHTML } from '@/lib/markdown/parser'

// Escape HTML special characters to prevent XSS
function escapeHTML(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, (char) => escapeMap[char] || char)
}

interface ExportActionsProps {
  markdown: string
  runId: string
  shareSlug: string | null
  productName?: string
}

/**
 * ExportActions - Compact action buttons for results header
 *
 * Desktop: All buttons visible inline
 * Mobile: Collapsed into dropdown menu
 */
export function ExportActions({
  markdown,
  runId,
  shareSlug,
  productName,
}: ExportActionsProps) {
  const posthog = usePostHog()
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const handleCopy = async () => {
    posthog?.capture('export_copy_clicked', { run_id: runId })
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setShowMenu(false)
  }

  const handlePDF = () => {
    posthog?.capture('export_pdf_clicked', { run_id: runId })
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const safeProductName = productName ? escapeHTML(productName) : null
      const title = safeProductName ? `Action Plan - ${safeProductName}` : 'Action Plan'
      const safeContent = markdownToHTML(markdown)
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              line-height: 1.6;
              color: #0A2540;
            }
            h1 { font-size: 28px; margin-bottom: 24px; border-bottom: 2px solid #3B82F6; padding-bottom: 12px; }
            h2 { font-size: 22px; color: #0A2540; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-top: 32px; }
            h3 { font-size: 18px; color: #3B82F6; margin-top: 24px; }
            p { margin: 12px 0; }
            ul, ol { padding-left: 24px; margin: 12px 0; }
            li { margin: 8px 0; }
            li.checked::before { content: "\\2713 "; color: #22C55E; font-weight: bold; }
            li.unchecked::before { content: "\\2610 "; color: #9CA3AF; }
            strong { color: #0A2540; }
            code { background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
            @media print {
              body { padding: 20px; }
              h2 { page-break-before: auto; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${safeContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    setShowMenu(false)
  }

  const handleShare = () => {
    setShowShareModal(true)
    setShowMenu(false)
  }

  return (
    <>
      {/* Desktop: Icon-only buttons */}
      <div className="hidden sm:flex items-center gap-1">
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy to clipboard"}
          className="
            p-2 rounded-lg
            text-foreground/50
            hover:text-foreground
            hover:bg-foreground/5
            transition-colors duration-100
          "
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={handlePDF}
          title="Export as PDF"
          className="
            p-2 rounded-lg
            text-foreground/50
            hover:text-foreground
            hover:bg-foreground/5
            transition-colors duration-100
          "
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          onClick={handleShare}
          title="Share plan"
          className="
            p-2 rounded-lg
            text-foreground/50
            hover:text-foreground
            hover:bg-foreground/5
            transition-colors duration-100
          "
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile: Condensed menu */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          aria-expanded={showMenu}
          aria-haspopup="menu"
          className="
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            border-2 border-foreground/20
            text-sm font-semibold text-foreground/70
            hover:border-foreground/40
            transition-colors
          "
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="
            absolute right-0 top-full mt-2
            w-48
            bg-background
            border-2 border-foreground/20
            rounded-lg
            shadow-[4px_4px_0_rgba(44,62,80,0.1)]
            z-50
          ">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/[0.03] transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-foreground/50" />
              )}
              <span className="text-sm font-medium">
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </span>
            </button>
            <button
              onClick={handlePDF}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/[0.03] transition-colors"
            >
              <Download className="w-4 h-4 text-foreground/50" />
              <span className="text-sm font-medium">Export as PDF</span>
            </button>
            <div className="border-t border-foreground/10" />
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/[0.03] transition-colors"
            >
              <Share2 className="w-4 h-4 text-cta" />
              <span className="text-sm font-medium text-cta">Share plan</span>
            </button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          runId={runId}
          shareSlug={shareSlug}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  )
}
