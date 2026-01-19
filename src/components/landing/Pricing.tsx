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
  const [loading, setLoading] = useState(false);

  // Hide pricing section when feature flag is off
  if (!config.pricingEnabled) return null;

  async function handleBuyCredits() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
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

          {/* Single pricing option */}
          <div className="max-w-md mx-auto">
            <button
              onClick={handleBuyCredits}
              disabled={loading}
              className="group block relative w-full rounded-xl border-2 border-primary/30 bg-background p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 text-left disabled:opacity-70 disabled:cursor-wait"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Growth Strategy</h3>
                  <p className="text-sm text-muted">Complete competitive analysis</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-foreground">{config.singlePrice}</span>
                </div>
              </div>
              {loading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up stagger-2">
            <Link href="/start">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
