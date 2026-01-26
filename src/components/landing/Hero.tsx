"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";
import { HeroChaos } from "./HeroChaos";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const posthog = usePostHog();

  return (
    <section className="relative min-h-screen py-16 lg:py-24 overflow-hidden">
      {/* Warm glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(230, 126, 34, 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Chaos layer - perpetual ambient motion */}
      {!prefersReducedMotion && <HeroChaos />}

      {/* Center content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-8">
        {/* Headline */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-foreground leading-[1.05]">
            You didn&apos;t start a business
            <br />
            <span className="font-black text-foreground">to become a marketer.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-foreground/70 max-w-2xl mx-auto font-medium">
            Yet here you are, drowning in advice about algorithms, engagement rates, and &quot;just be consistent.&quot;
          </p>

          {/* Micro social proof */}
          <p className="mt-4 text-sm text-foreground/50 italic">
            &quot;The competitor analysis alone is worth it.&quot; — Noah P.
          </p>
        </div>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary: Paid */}
          <Link
            href="/start"
            onClick={() => posthog?.capture("hero_cta_clicked", { type: "paid" })}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 bg-cta text-white text-lg font-bold border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.4)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.45)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.4)] active:translate-y-0.5 transition-all duration-100"
          >
            Get Your Plan
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Secondary: Free sample */}
          <Link
            href="/start?free=true"
            onClick={() => posthog?.capture("hero_cta_clicked", { type: "free" })}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-4 bg-white/80 text-foreground text-lg font-semibold border-2 border-foreground/20 shadow-[3px_3px_0_rgba(44,62,80,0.06)] hover:border-cta/60 hover:text-cta hover:shadow-[4px_4px_0_rgba(230,126,34,0.12)] hover:-translate-y-0.5 transition-all duration-100"
          >
            See a Sample First
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-sm text-foreground/50 text-center">
          $29 for the full plan · Try a sample if you&apos;re not sure · <span className="text-foreground/70 font-medium">Full refund guarantee</span>
        </p>
      </div>
    </section>
  );
}
