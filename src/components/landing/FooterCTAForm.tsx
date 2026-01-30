"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Globe, ArrowRight, Loader2 } from "lucide-react";

const PREFILL_KEY = "actionboost-prefill";

export function FooterCTAForm() {
  const router = useRouter();
  const posthog = usePostHog();

  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derive favicon from URL
  const favicon = useMemo(() => {
    if (url && url.includes(".")) {
      try {
        const normalized = url.startsWith("http") ? url : `https://${url}`;
        const domain = new URL(normalized).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      } catch {
        return null;
      }
    }
    return null;
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

      router.push("/start?source=footer");
    } catch (error) {
      console.error("Metadata extraction failed:", error);
      // Still navigate even if extraction fails
      const prefillData = {
        websiteUrl: url.startsWith("http") ? url : `https://${url}`,
        metadata: { title: null, description: null, favicon, siteName: null },
        timestamp: Date.now(),
      };
      localStorage.setItem(PREFILL_KEY, JSON.stringify(prefillData));
      router.push("/start?source=footer");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url.trim()) {
      handleAnalyze();
    }
  };

  return (
    <>
      {/* URL Input - Confident on dark */}
      <div className="max-w-lg mx-auto mb-6">
        <div
          className="flex flex-col sm:flex-row rounded-xl border-2 border-background/30 bg-background/15 overflow-hidden backdrop-blur-sm"
          style={{ boxShadow: "4px 4px 0 rgba(255, 255, 255, 0.12)" }}
        >
          <div className="flex items-center gap-3 flex-1 px-4 py-3">
            {/* eslint-disable @next/next/no-img-element */}
            {favicon ? (
              <img
                src={favicon}
                alt=""
                className="w-5 h-5 shrink-0"
              />
            ) : (
              <Globe className="w-5 h-5 text-background/40 shrink-0" />
            )}
            {/* eslint-enable @next/next/no-img-element */}
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="yourbusiness.com"
              disabled={isAnalyzing}
              className="flex-1 bg-transparent text-base text-background placeholder:text-background/40 outline-none min-w-0"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-cta text-white font-bold hover:bg-cta-hover hover:shadow-[0_0_20px_rgba(230,126,34,0.5)] sm:hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Let&apos;s go
              </>
            ) : (
              <>
                Let&apos;s do this
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skip link */}
      <p className="text-sm">
        <Link
          href="/start?source=footer"
          onClick={() =>
            posthog?.capture("cta_clicked", {
              location: "footer",
              button: "skip_url",
            })
          }
          className="text-background/50 hover:text-background transition-colors"
        >
          No website yet? Start anyway →
        </Link>
      </p>
    </>
  );
}
