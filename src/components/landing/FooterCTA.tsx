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
    <section className="relative py-24 bg-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Headline */}
        <p className="font-mono text-xs tracking-[0.15em] text-background/50 uppercase mb-4">
          Let's go
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-background tracking-tight mb-4">
          Ready to <span className="font-black">stop guessing?</span>
        </h2>
        <p className="text-lg text-background/60 mb-10">
          Drop your URL. Get a real growth plan.
        </p>

        {/* URL Input - brutalist style */}
        <div className="max-w-lg mx-auto mb-6">
          <div className="flex border-[3px] border-background bg-foreground">
            <div className="flex items-center gap-3 flex-1 px-4 py-3">
              {favicon ? (
                <img
                  src={favicon}
                  alt=""
                  className="w-5 h-5 shrink-0"
                />
              ) : (
                <Globe className="w-5 h-5 text-background/40 shrink-0" />
              )}
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="yourproduct.com"
                disabled={isAnalyzing}
                className="flex-1 bg-transparent text-base text-background placeholder:text-background/30 outline-none min-w-0"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-cta text-white font-bold border-l-[3px] border-background hover:bg-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-100"
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
        <p className="text-sm text-background/40 font-mono">
          <Link
            href="/start"
            onClick={() =>
              posthog?.capture("cta_clicked", {
                location: "footer",
                button: "skip_url",
              })
            }
            className="text-background/60 hover:text-background underline underline-offset-2 transition-colors"
          >
            No website yet? Start anyway →
          </Link>
        </p>
      </div>
    </section>
  );
}
