"use client";

import { useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { config } from "@/lib/config";

const features = [
  {
    name: "Competitors' traffic sources",
    description: "Where they get users. Now you\u00A0know.",
    free: "Basic",
    paid: "Full breakdown",
  },
  {
    name: "Tactics scored by ICE",
    description: "Impact, Confidence, Ease. No\u00A0guesswork.",
    free: "3 quick tips",
    paid: "Full ranked list",
  },
  {
    name: "Market reality check",
    description: "What's actually working in your\u00A0space",
    free: true,
    paid: true,
  },
  {
    name: "30-day execution plan",
    description: "Week-by-week. What to do, when to do\u00A0it.",
    free: false,
    paid: true,
  },
  {
    name: "This week's quick wins",
    description: "3-5 moves you can ship\u00A0tomorrow",
    free: false,
    paid: true,
  },
  {
    name: "Live competitor intel",
    description: "Their traffic, keywords, and tactics.\u00A0Exposed.",
    free: false,
    paid: true,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState(false);
  const posthog = usePostHog();

  if (!config.pricingEnabled) return null;

  async function handleBuyCredits() {
    posthog?.capture("pricing_cta_clicked", { tier: "paid", location: "pricing" });
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

  function handleFreeTierClick() {
    posthog?.capture("pricing_cta_clicked", { tier: "free", location: "pricing" });
  }

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block text-sm font-medium tracking-wide text-accent mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            A consultant charges $200/hr.{" "}
            <span className="text-gradient whitespace-nowrap">This is $9.99.</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
            Real competitive research. Actual tactics ranked by impact. A plan you can execute.
          </p>
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
                onClick={handleFreeTierClick}
                className="inline-block w-full py-2.5 px-4 rounded-lg text-sm font-semibold border-2 border-border text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Try Free
              </Link>
            </div>

            {/* Paid tier header */}
            <div className="relative p-6 text-center border-l border-border bg-primary/5">
              {/* Most Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-semibold bg-cta text-white rounded-full shadow-sm">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1 mt-2">
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
                  onClick={handleFreeTierClick}
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
          No subscription. No account. Pay once, get your plan.
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
