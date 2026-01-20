"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Globe, ArrowRight, Loader2 } from "lucide-react";

const PREFILL_KEY = "actionboost-prefill";

export function Hero() {
  const router = useRouter();
  const posthog = usePostHog();

  // URL input state
  const [url, setUrl] = useState("");
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update favicon as user types
  useEffect(() => {
    if (url && url.includes(".")) {
      try {
        const normalized = url.startsWith("http") ? url : `https://${url}`;
        const domain = new URL(normalized).hostname;
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
      } catch {
        setFavicon(null);
      }
    } else {
      setFavicon(null);
    }
  }, [url]);

  const trackCTA = (button: string) => {
    posthog?.capture("cta_clicked", { location: "hero", button });
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setIsAnalyzing(true);
    posthog?.capture("hero_url_submitted", {
      has_url: true,
      url_domain: url.includes(".") ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : null,
    });

    try {
      const response = await fetch("/api/metadata/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      posthog?.capture("hero_metadata_extracted", {
        success: data.success,
        has_title: !!data.metadata?.title,
        has_description: !!data.metadata?.description,
      });

      // Store prefill data
      const prefillData = {
        websiteUrl: data.metadata?.url || (url.startsWith("http") ? url : `https://${url}`),
        metadata: data.metadata || { title: null, description: null, favicon: null, siteName: null },
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
    <section className="relative bg-mesh py-16 lg:py-24 overflow-x-clip">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float stagger-2" />
      {/* Bottom fade to blend into Frameworks section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid xl:grid-cols-2 gap-12 xl:gap-8 items-center">
          {/* Left - Hero content */}
          <div className="text-center xl:text-left max-w-2xl mx-auto xl:mx-0 xl:max-w-none">
            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl animate-slide-up">
              <span className="text-foreground">Stuck on growth?</span>
              <br />
              <span className="text-gradient">Get your next moves.</span>
            </h1>

            {/* Subhead - sans for UI text */}
            <p className="mt-6 text-lg text-muted sm:text-xl max-w-xl mx-auto xl:mx-0 animate-slide-up stagger-1 leading-relaxed">
              Real competitive research. Prioritized recommendations.
              A 30-day roadmap built for <em className="text-foreground font-medium not-italic">your</em> business.
            </p>

            {/* URL Input */}
            <div className="mt-6 animate-slide-up stagger-2 max-w-lg mx-auto xl:mx-0">
              <div className="flex items-center gap-2 bg-surface/50 border border-border/60 rounded-xl px-4 py-3.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                {favicon ? (
                  <img src={favicon} alt="" className="w-5 h-5 rounded shrink-0" />
                ) : (
                  <Globe className="w-5 h-5 text-muted shrink-0" />
                )}
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="yourproduct.com"
                  disabled={isAnalyzing}
                  className="flex-1 bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted/50 outline-none min-w-0"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!url.trim() || isAnalyzing}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {/* Helper link */}
              <p className="mt-3 text-sm text-muted text-center">
                <Link
                  href="/start"
                  onClick={() => trackCTA("skip_url")}
                  className="text-primary hover:underline"
                >
                  No website yet? Start anyway
                </Link>
              </p>
            </div>

            {/* Trust cluster: founder + positioning */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-slide-up stagger-3">
              <a
                href="https://x.com/rbaten"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <img
                  src="/rbaten.jpg"
                  alt="@rbaten"
                  className="w-8 h-8 rounded-full object-cover"
                />
                Built by @rbaten
              </a>
              <span className="hidden sm:block text-border">|</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Specific tactics. Ranked by impact. Ready this week.
              </span>
            </div>
          </div>

          {/* Right - Example strategy preview */}
          <div className="hidden xl:block relative xl:-mr-24 xl:-mt-48 xl:mb-[-200px] animate-fade-in">
            {/* Preview card - extends beyond container top and bottom */}
            <div className="relative bg-background rounded-xl shadow-2xl border border-border/60">
              {/* Top fade overlay - content fades in from top */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background to-transparent z-10 rounded-t-xl" />

              {/* Content */}
              <div className="px-8 py-6 space-y-6 font-serif text-[15px]">
                {/* Previous item (partially visible at top) */}
                <div className="border-b border-border/30 pb-5">
                  <p className="text-muted leading-relaxed">
                    ...Zero claimed profiles = no marketplace, no revenue. This is your #1 priority metric.
                  </p>
                </div>

                {/* Main example strategy item */}
                <div className="border-b border-border/30 pb-6">
                  {/* ICE Score Box - floated right */}
                  <div className="float-right ml-4 mb-2 flex gap-4 px-4 py-2 rounded-lg border border-border/50 bg-surface/50">
                    <div className="text-center">
                      <div className="text-xl font-bold text-navy">10</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-navy">9</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-navy">7</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Ease</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-navy">
                    1. Launch Aggressive Artist Outreach
                  </h3>

                  <p className="mt-3 text-muted leading-relaxed">
                    Without claimed profiles, you have no marketplace, no social proof, and no revenue path. This should consume <strong className="text-foreground">50% of your time</strong> for the next 30 days.
                  </p>

                  <div className="mt-4 clear-right">
                    <p className="font-semibold text-navy mb-2">Implementation:</p>
                    <ol className="space-y-1.5 text-muted list-decimal list-inside ml-1">
                      <li>Write a compelling DM script for artist outreach</li>
                      <li>Start with your highest-quality profiles in 3-5 focus cities</li>
                      <li>Reach out to 20 artists/day via Instagram DM</li>
                    </ol>
                  </div>
                </div>

                {/* Second item preview (partial - fades out) */}
                <div className="pb-10">
                  {/* ICE Score Box - floated right */}
                  <div className="float-right ml-4 mb-2 flex gap-4 px-4 py-2 rounded-lg border border-border/50 bg-surface/50">
                    <div className="text-center">
                      <div className="text-xl font-bold text-navy">9</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-navy">8</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-navy">8</div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Ease</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-navy">
                    2. Optimize Pages for Long-Tail SEO
                  </h3>

                  <p className="mt-3 text-muted leading-relaxed">
                    You already have 4,000 pages—optimization can unlock massive organic traffic. Your static city/style pages are assets waiting to be activated.
                  </p>

                  <div className="mt-4 clear-right">
                    <p className="font-semibold text-navy mb-2">Implementation:</p>
                    <ol className="space-y-1.5 text-muted list-decimal list-inside ml-1">
                      <li>Use GSC to identify pages in position 10-30 (striking distance)</li>
                      <li>Target: &quot;[style] tattoo artist [city]&quot; keywords</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Bottom fade - blends into next section */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface via-surface to-transparent rounded-b-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
