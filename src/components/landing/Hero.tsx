"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui";
import { config } from "@/lib/config";

export function Hero() {
  const posthog = usePostHog();

  const trackCTA = (button: string) => {
    posthog?.capture("cta_clicked", { location: "hero", button });
  };

  return (
    <section className="relative bg-mesh py-16 lg:py-24 overflow-x-clip">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float stagger-2" />

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

            {/* Subhead */}
            <p className="mt-6 text-lg text-muted sm:text-xl max-w-xl mx-auto xl:mx-0 animate-slide-up stagger-1">
              Real competitive research. Prioritized recommendations.
              A 30-day roadmap built for <em>your</em> business.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center xl:items-start justify-center xl:justify-start gap-6 animate-slide-up stagger-2">
              <Link href="/start" onClick={() => trackCTA("get_started")}>
                <Button size="xl">
                  {config.pricingEnabled ? "Get Started — $7.99" : "Get Started"}
                </Button>
              </Link>
              {config.pricingEnabled && (
                <Link href="#pricing" onClick={() => trackCTA("see_pricing")}>
                  <Button variant="outline" size="xl">
                    See pricing
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right - Example strategy preview */}
          <div className="hidden xl:block relative xl:-mr-24 xl:-mt-48 xl:mb-[-200px] animate-fade-in">
            {/* Preview card - extends beyond container top and bottom */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-border/50">
              {/* Top fade overlay - content fades in from top */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white to-transparent z-10 rounded-t-xl" />

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
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-navy">
                      1. Launch Aggressive Artist Outreach
                    </h3>
                    {/* ICE Score Box */}
                    <div className="shrink-0 flex gap-4 px-4 py-2 rounded-lg border border-border/50 bg-surface/50">
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
                  </div>

                  <p className="mt-3 text-muted leading-relaxed">
                    Without claimed profiles, you have no marketplace, no social proof, and no revenue path. This should consume <strong className="text-foreground">50% of your time</strong> for the next 30 days.
                  </p>

                  <div className="mt-4">
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
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-navy">
                      2. Optimize Pages for Long-Tail SEO
                    </h3>
                    {/* ICE Score Box */}
                    <div className="shrink-0 flex gap-4 px-4 py-2 rounded-lg border border-border/50 bg-surface/50">
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
                  </div>

                  <p className="mt-3 text-muted leading-relaxed">
                    You already have 4,000 pages—optimization can unlock massive organic traffic. Your static city/style pages are assets waiting to be activated.
                  </p>

                  <div className="mt-4">
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
