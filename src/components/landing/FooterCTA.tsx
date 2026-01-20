"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Globe, ArrowRight, Loader2 } from "lucide-react";

const PREFILL_KEY = "actionboost-prefill";

export function FooterCTA() {
  const router = useRouter();
  const posthog = usePostHog();

  const [url, setUrl] = useState("");
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update favicon as user types
  useEffect(() => {
    if (url && url.includes(".")) {
      try {
        const normalized = url.startsWith("http") ? url : `https://${url}`;
        const domain = new URL(normalized).hostname;
        setFavicon(
          `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
        );
      } catch {
        setFavicon(null);
      }
    } else {
      setFavicon(null);
    }
  }, [url]);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    posthog?.capture("footer_cta_submitted", {
      has_url: true,
      url_domain: url.includes(".")
        ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname
        : null,
    });

    try {
      const response = await fetch("/api/metadata/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      // Store prefill data
      const prefillData = {
        websiteUrl:
          data.metadata?.url ||
          (url.startsWith("http") ? url : `https://${url}`),
        metadata: data.metadata || {
          title: null,
          description: null,
          favicon: null,
          siteName: null,
        },
        timestamp: Date.now(),
      };
      localStorage.setItem(PREFILL_KEY, JSON.stringify(prefillData));

      router.push("/start");
    } catch (error) {
      console.error("Metadata extraction failed:", error);
      // Still navigate even if extraction fails
      const prefillData = {
        websiteUrl: url.startsWith("http") ? url : `https://${url}`,
        metadata: { title: null, description: null, favicon, siteName: null },
        timestamp: Date.now(),
      };
      localStorage.setItem(PREFILL_KEY, JSON.stringify(prefillData));
      router.push("/start");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url.trim()) {
      handleAnalyze();
    }
  };

  return (
    <section className="relative py-20 bg-navy overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-primary/20" />

      <div className="relative max-w-2xl mx-auto px-6 text-center">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in">
          Ready to stop guessing?
        </h2>
        <p className="text-lg text-white/70 mb-8 animate-fade-in">
          Tell us about your startup. Get a real growth plan.
        </p>

        {/* URL Input */}
        <div className="max-w-md mx-auto mb-6 animate-slide-up">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/20 transition-all">
            {favicon ? (
              <img
                src={favicon}
                alt=""
                className="w-5 h-5 rounded shrink-0"
              />
            ) : (
              <Globe className="w-5 h-5 text-white/50 shrink-0" />
            )}
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="yourproduct.com"
              disabled={isAnalyzing}
              className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder:text-white/40 outline-none min-w-0"
            />
            <button
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cta text-white text-sm font-medium hover:bg-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Start
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip link */}
        <p className="text-sm text-white/50 animate-slide-up stagger-1">
          <Link
            href="/start"
            onClick={() =>
              posthog?.capture("cta_clicked", {
                location: "footer",
                button: "skip_url",
              })
            }
            className="text-white/70 hover:text-white hover:underline transition-colors"
          >
            No website yet? Start anyway
          </Link>
        </p>
      </div>
    </section>
  );
}
