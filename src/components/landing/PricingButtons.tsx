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
      className="block w-full rounded-xl py-3 px-4 text-center font-bold border-2 border-foreground text-foreground shadow-[4px_4px_0_rgba(44,62,80,0.15)] hover:bg-foreground hover:text-background hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(44,62,80,0.2)] active:translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.15)] transition-all duration-150"
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
      className="w-full rounded-xl py-4 px-4 font-bold text-lg bg-cta text-white border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-50 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] disabled:hover:translate-y-0 transition-all duration-150"
    >
      {loading ? "Setting things up..." : "Get my Boost for $29"}
    </button>
  );
}
