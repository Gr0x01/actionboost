"use client";

import { useState } from "react";
import Link from "next/link";
import { config } from "@/lib/config";

const features = [
  {
    name: "Competitive analysis",
    description: "See what's working for others in your\u00A0space",
    free: "Basic",
    paid: "Full",
  },
  {
    name: "Recommendations",
    description: "Specific actions ranked by impact and\u00A0effort",
    free: "3 quick tips",
    paid: "Prioritized list",
  },
  {
    name: "Market overview",
    description: "Understand your landscape before making\u00A0moves",
    free: true,
    paid: true,
  },
  {
    name: "30-day action roadmap",
    description: "Week-by-week plan so you know exactly what to do\u00A0next",
    free: false,
    paid: true,
  },
  {
    name: "Quick wins for this week",
    description: "Low-effort tactics you can ship\u00A0today",
    free: false,
    paid: true,
  },
  {
    name: "Live competitor research",
    description: "Real-time data on their traffic, keywords, and\u00A0tactics",
    free: false,
    paid: true,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState(false);

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
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block text-sm font-medium tracking-wide text-accent mb-3">
            Simple pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Choose your path
          </h2>
        </div>

        {/* Comparison table */}
        <div className="animate-slide-up stagger-1 rounded-xl border border-border bg-surface/30 overflow-hidden">
          {/* Table header row */}
          <div className="hidden sm:grid sm:grid-cols-3 border-b border-border">
            {/* Features column header */}
            <div className="p-6 flex items-end">
              <span className="text-sm font-medium text-muted uppercase tracking-wider">
                Features
              </span>
            </div>

            {/* Free tier header */}
            <div className="p-6 text-center border-l border-border bg-background/50">
              <h3 className="text-2xl font-bold text-foreground mb-1">Free</h3>
              <p className="text-sm text-muted mb-4">Mini audit</p>
              <Link
                href="/start?tier=free"
                className="inline-block w-full py-2.5 px-4 rounded-lg text-sm font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Try Free
              </Link>
            </div>

            {/* Paid tier header */}
            <div className="p-6 text-center border-l border-border bg-primary/5">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {config.singlePrice}
              </h3>
              <p className="text-sm text-muted mb-4">Full action plan</p>
              <button
                onClick={handleBuyCredits}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-cta text-white hover:bg-cta-hover transition-colors disabled:opacity-70"
              >
                {loading ? "..." : "Get My Action Plan"}
              </button>
            </div>
          </div>

          {/* Mobile tier cards (shown only on mobile) */}
          <div className="sm:hidden border-b border-border">
            <div className="grid grid-cols-2">
              {/* Free tier */}
              <div className="p-4 text-center border-r border-border">
                <h3 className="text-lg font-bold text-foreground">Free</h3>
                <p className="text-xs text-muted mb-3">Mini audit</p>
                <Link
                  href="/start?tier=free"
                  className="inline-block w-full py-2 px-3 rounded-lg text-xs font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  Try Free
                </Link>
              </div>

              {/* Paid tier */}
              <div className="p-4 text-center bg-primary/5">
                <h3 className="text-lg font-bold text-foreground">
                  {config.singlePrice}
                </h3>
                <p className="text-xs text-muted mb-3">Full action plan</p>
                <button
                  onClick={handleBuyCredits}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-cta text-white hover:bg-cta-hover transition-colors disabled:opacity-70"
                >
                  {loading ? "..." : "Get Action Plan"}
                </button>
              </div>
            </div>
          </div>

          {/* Feature rows */}
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className={`grid grid-cols-2 sm:grid-cols-3 ${
                index !== features.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              {/* Feature name + description */}
              <div className="col-span-2 sm:col-span-1 px-6 py-3 bg-surface/20 sm:bg-transparent border-b sm:border-b-0 border-border/50">
                <span className="text-sm font-medium text-foreground block">
                  {feature.name}
                </span>
                <span className="text-xs text-muted mt-0.5 block">
                  {feature.description}
                </span>
              </div>

              {/* Free column */}
              <div className="px-6 py-3 flex items-center justify-center border-l border-border/50 bg-background/30">
                <FeatureValue value={feature.free} />
              </div>

              {/* Paid column */}
              <div className="px-6 py-3 flex items-center justify-center border-l border-border/50 bg-primary/5">
                <FeatureValue value={feature.paid} isPaid />
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-muted mt-10 animate-slide-up stagger-2">
          No subscription required. One payment, one action plan.
        </p>
      </div>
    </section>
  );
}

function FeatureValue({
  value,
  isPaid,
}: {
  value: boolean | string;
  isPaid?: boolean;
}) {
  if (value === true) {
    return <CheckIcon className={isPaid ? "text-cta" : "text-primary"} />;
  }
  if (value === false) {
    return <span className="text-muted text-lg">—</span>;
  }
  return (
    <span
      className={`text-xs font-medium ${isPaid ? "text-foreground" : "text-muted"}`}
    >
      {value}
    </span>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
