"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { config } from "@/lib/config";

const features = [
  "Full competitive analysis",
  "Prioritized recommendations",
  "30-day action roadmap",
  "Quick wins for this week",
];

export function Pricing() {
  const [loading, setLoading] = useState<number | null>(null);

  // Hide pricing section when feature flag is off
  if (!config.pricingEnabled) return null;

  async function handleBuyCredits(pack: number) {
    setLoading(pack);
    try {
      const res = await fetch("/api/checkout/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-cta/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block text-sm font-medium tracking-wide text-accent mb-3">
            One payment. No subscription.
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Get your growth strategy
          </h2>
        </div>

        {/* Single product showcase */}
        <div className="animate-slide-up stagger-1">
          {/* Features in a horizontal flow */}
          <div className="flex flex-wrap justify-center items-center gap-y-3 mb-12 text-sm text-muted">
            {features.map((feature, i) => (
              <span key={feature} className="flex items-center">
                {feature}
                {i < features.length - 1 && <span className="mx-3 text-border">•</span>}
              </span>
            ))}
          </div>

          {/* Pricing options - stacked, not compared */}
          <div className="max-w-xl mx-auto space-y-4">
            {/* Single Strategy */}
            <button
              onClick={() => handleBuyCredits(1)}
              disabled={loading !== null}
              className="group block relative w-full rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md text-left disabled:opacity-70 disabled:cursor-wait"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface font-mono text-lg font-bold text-foreground">
                    1x
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Single Strategy</h3>
                    <p className="text-sm text-muted">One complete analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-foreground">$7.99</span>
                </div>
              </div>
              {loading === 1 && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>

            {/* 3-Pack - Recommended */}
            <button
              onClick={() => handleBuyCredits(3)}
              disabled={loading !== null}
              className="group block relative w-full rounded-xl border-2 border-cta/50 bg-gradient-to-r from-cta/5 to-accent/5 p-6 transition-all duration-300 hover:border-cta hover:shadow-lg hover:shadow-cta/10 text-left disabled:opacity-70 disabled:cursor-wait"
            >
              {/* Best value indicator */}
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cta to-cta-hover px-3 py-1 text-xs font-bold text-white uppercase tracking-wide shadow-md">
                  Save 33%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cta/10 font-mono text-lg font-bold text-cta">
                    3x
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Strategy 3-Pack</h3>
                    <p className="text-sm text-muted">
                      Three credits to use anytime
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">$19.99</span>
                    <span className="text-lg text-muted line-through">$24</span>
                  </div>
                  <p className="text-xs text-cta font-semibold">$6.66 each</p>
                </div>
              </div>

              {loading === 3 && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 border-2 border-cta border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up stagger-2">
            <Button
              size="lg"
              onClick={() => handleBuyCredits(3)}
              disabled={loading !== null}
            >
              {loading === 3 ? "Loading..." : "Buy 3-Pack — $19.99"}
            </Button>
            <Link href="/start">
              <Button variant="outline" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
