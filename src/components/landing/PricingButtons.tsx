"use client";

import { useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export function FreeTierButton() {
  const posthog = usePostHog();

  function handleClick() {
    posthog?.capture("pricing_cta_clicked", { tier: "free", location: "pricing" });
  }

  return (
    <Link
      href="/start?tier=free"
      onClick={handleClick}
      className="block w-full py-3 px-4 text-center font-bold border-[3px] border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-100"
    >
      Try Free
    </Link>
  );
}

export function PaidTierButton() {
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

  return (
    <button
      onClick={handleBuyCredits}
      disabled={loading}
      className="w-full py-3 px-4 font-bold bg-cta text-white border-[3px] border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0 transition-all duration-100"
    >
      {loading ? "Loading..." : "Get My Action Plan"}
    </button>
  );
}
