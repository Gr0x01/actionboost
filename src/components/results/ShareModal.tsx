"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/Button";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { X, Copy, Check, Link as LinkIcon } from "lucide-react";

interface ShareModalProps {
  runId: string;
  shareSlug: string | null;
  onClose: () => void;
}

export function ShareModal({ runId, shareSlug, onClose }: ShareModalProps) {
  const posthog = usePostHog();
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState(shareSlug);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${slug}`
    : null;

  const handleGenerateLink = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/runs/${runId}/share`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSlug(data.share_slug);
        posthog?.capture("share_link_generated", { run_id: runId });
      } else {
        setError("Failed to generate link. Please try again.");
      }
    } catch {
      setError("Failed to generate link. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      posthog?.capture("share_link_copied", { run_id: runId });
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 p-6 rounded-xl bg-background border border-border shadow-lg animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LinkIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Share Your Strategy
          </h2>
        </div>

        <p className="text-sm text-muted mb-6">
          Anyone with this link can view your growth strategy (read-only).
        </p>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground"
              />
              <Button size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted">
              This link never expires. You can regenerate it if needed.
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <span className="text-sm text-muted">Share on:</span>
              <SocialShareButtons
                url={shareUrl}
                text="Check out this AI-generated growth strategy from ActionBoost"
                source="share_modal"
              />
            </div>
          </div>
        ) : (
          <Button
            onClick={handleGenerateLink}
            disabled={generating}
            className="w-full"
          >
            {generating ? "Generating..." : "Generate Shareable Link"}
          </Button>
        )}
      </div>
    </div>
  );
}
