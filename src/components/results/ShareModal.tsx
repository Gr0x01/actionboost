"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/Button";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { X, Copy, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md mx-4 p-6 rounded-lg bg-background border-2 border-foreground/20 shadow-[4px_4px_0_rgba(44,62,80,0.1)] animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted hover:text-foreground transition-colors duration-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-4">
          Share Your Boost
        </h2>

        <p className="text-sm text-muted mb-6">
          Anyone with this link can view your Boost (read-only).
        </p>

        {error && (
          <p className="text-sm text-red-600 font-medium mb-4">{error}</p>
        )}

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-md px-3 py-2 border border-foreground/20 bg-surface text-sm text-foreground font-mono"
              />
              <button
                onClick={handleCopy}
                className="rounded-md p-2 bg-cta text-white border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:border-b-0 transition-all duration-100"
              >
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted">
              This link never expires. You can regenerate it if needed.
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-foreground/10">
              <span className="text-sm font-medium text-foreground">Share on:</span>
              <SocialShareButtons
                url={shareUrl}
                text="Check out this AI-generated Boost"
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
