"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Copy, Download, Share2, Check } from "lucide-react";
import { ShareModal } from "./ShareModal";
import { markdownToHTML } from "@/lib/markdown/parser";

// Escape HTML special characters to prevent XSS
function escapeHTML(str: string): string {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

interface ExportBarProps {
  markdown: string;
  runId: string;
  shareSlug: string | null;
  productName?: string;
}

export function ExportBar({
  markdown,
  runId,
  shareSlug,
  productName,
}: ExportBarProps) {
  const posthog = usePostHog();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCopy = async () => {
    posthog?.capture("export_copy_clicked", { run_id: runId });
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = () => {
    posthog?.capture("export_pdf_clicked", { run_id: runId });
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const safeProductName = productName ? escapeHTML(productName) : null;
      const title = safeProductName ? `Boost - ${safeProductName}` : "Your Boost";
      // markdownToHTML already outputs safe HTML since it only transforms markdown syntax
      // The AI-generated content is plain text that gets wrapped in HTML tags
      const safeContent = markdownToHTML(markdown);
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
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <div className="lg:sticky lg:top-14 z-40 py-4 bg-white border-b-[3px] border-foreground">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.1em] text-foreground/60 uppercase">
            Your Boost
          </span>

          <div className="flex items-center gap-2">
            {/* Tactile ghost buttons */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border-2 border-transparent hover:border-foreground/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handlePDF}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border-2 border-transparent hover:border-foreground/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-100"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Primary action - brutalist button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-foreground bg-surface border-2 border-foreground shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          runId={runId}
          shareSlug={shareSlug}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
