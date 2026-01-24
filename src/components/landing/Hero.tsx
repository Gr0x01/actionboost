"use client";

import { useReducedMotion } from "framer-motion";
import { HeroForm } from "./HeroForm";
import { HeroChaos } from "./HeroChaos";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

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

        {/* Form */}
        <div className="max-w-xl mx-auto">
          <p className="text-center text-sm text-foreground/50 mb-3">
            Let&apos;s start simple
          </p>
          <HeroForm />
        </div>

        {/* Trust line with price */}
        <p className="mt-6 text-sm text-foreground/50 text-center">
          $29 one-time. A real plan, not a template. Money back if it doesn&apos;t help.
        </p>
      </div>
    </section>
  );
}
