"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/Button";
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
      const title = safeProductName ? `Action Plan - ${safeProductName}` : "Action Plan";
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
      <div className="sticky top-16 z-40 -mx-6 px-6 py-3 bg-background/80 backdrop-blur-sm border-b border-border mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-sm text-muted font-medium">Your Action Plan</span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>

            <Button variant="ghost" size="sm" onClick={handlePDF} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
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
