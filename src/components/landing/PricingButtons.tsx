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
      className="block w-full rounded-xl py-3 px-4 text-center font-bold border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
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
      className="w-full rounded-xl py-4 px-4 font-bold text-lg bg-cta text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0.5 disabled:opacity-50 disabled:hover:shadow-md disabled:hover:translate-y-0 transition-all duration-150"
    >
      {loading ? "Setting things up..." : "Tell me about your business"}
    </button>
  );
}
