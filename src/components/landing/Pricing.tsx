"use client";

import { useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { config } from "@/lib/config";

const features = [
  {
    name: "Competitors' traffic sources",
    free: "Basic",
    paid: "Full breakdown",
  },
  {
    name: "Tactics scored by ICE",
    free: "3 quick tips",
    paid: "Full ranked list",
  },
  {
    name: "Market reality check",
    free: true,
    paid: true,
  },
  {
    name: "30-day execution plan",
    free: false,
    paid: true,
  },
  {
    name: "This week's quick wins",
    free: false,
    paid: true,
  },
  {
    name: "Live competitor intel",
    free: false,
    paid: true,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState(false);
  const posthog = usePostHog();

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
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            A consultant charges $200/hr.{" "}
            <span className="font-black">This is $9.99.</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/60">
            Real competitive research. Actual tactics ranked by impact. A plan you can execute.
          </p>
        </div>

        {/* Pricing cards - side by side, centered */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="border-[3px] border-foreground/30 bg-background p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-foreground">Free</h3>
              <p className="text-sm text-foreground/60 mt-1">Mini audit to test the waters</p>
            </div>

            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-start gap-3">
                  <FeatureIndicator value={feature.free} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">{feature.name}</span>
                    {typeof feature.free === "string" && (
                      <span className="text-xs text-foreground/50 ml-2">({feature.free})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/start?tier=free"
              onClick={handleFreeTierClick}
              className="block w-full py-3 px-4 text-center font-bold border-[3px] border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-100"
            >
              Try Free
            </Link>

            <p className="mt-4 text-xs text-foreground/60 text-center flex items-center justify-center gap-1.5">
              <span className="text-green-600">✓</span>
              30-day money-back guarantee
            </p>
          </div>

          {/* Paid tier */}
          <div className="border-[3px] border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-foreground">{config.singlePrice}</h3>
              <p className="text-sm text-foreground/60 mt-1">Full action plan with competitor intel</p>
            </div>

            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-start gap-3">
                  <FeatureIndicator value={feature.paid} isPaid />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">{feature.name}</span>
                    {typeof feature.paid === "string" && (
                      <span className="text-xs text-cta font-semibold ml-2">({feature.paid})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleBuyCredits}
              disabled={loading}
              className="w-full py-3 px-4 font-bold bg-cta text-white border-[3px] border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0 transition-all duration-100"
            >
              {loading ? "Loading..." : "Get My Action Plan"}
            </button>

            <p className="mt-4 text-xs text-foreground/60 text-center flex items-center justify-center gap-1.5">
              <span className="text-green-600">✓</span>
              7-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-sm text-foreground/50 mt-8 font-mono text-center">
          No subscription. Pay once, get your plan. Not happy? Full refund within 7 days.
        </p>
      </div>
    </section>
  );
}

function FeatureIndicator({
  value,
  isPaid,
}: {
  value: boolean | string;
  isPaid?: boolean;
}) {
  if (value === false) {
    return (
      <span className="w-5 h-5 flex items-center justify-center text-foreground/30 font-mono text-sm">
        —
      </span>
    );
  }

  return (
    <span className={`w-5 h-5 flex items-center justify-center font-bold ${isPaid ? "text-cta" : "text-foreground"}`}>
      ✓
    </span>
  );
}
