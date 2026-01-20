"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Loader2 } from "lucide-react";

const HERO_PREFILL_KEY = "actionboost-hero-prefill";

export function Hero() {
  const router = useRouter();
  const posthog = usePostHog();

  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trackCTA = (button: string) => {
    posthog?.capture("cta_clicked", { location: "hero", button });
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);
    posthog?.capture("hero_form_submitted", {
      char_count: description.length,
    });

    const prefillData = {
      productDescription: description.trim(),
      timestamp: Date.now(),
    };
    localStorage.setItem(HERO_PREFILL_KEY, JSON.stringify(prefillData));

    router.push("/start?prefill=hero");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && description.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main grid: 4/3 split */}
        <div className="grid lg:grid-cols-7 gap-12 lg:gap-16 items-start">
          {/* Left column - 4/7 width */}
          <div className="lg:col-span-4">
            {/* Tagline - mono, utility feel */}
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-6">
              $9.99 → 30-day growth plan → no fluff
            </p>

            {/* Headline - brutalist contrast */}
            <h1 className="space-y-1">
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-foreground leading-[0.95]">
                Stop guessing.
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-foreground leading-[0.95]">
                Start growing.
              </span>
            </h1>

            {/* Subhead - punchy, direct */}
            <p className="mt-8 text-lg sm:text-xl text-foreground/70 max-w-lg leading-relaxed">
              We pull your competitors&apos; traffic data. We score every tactic by impact. You get a{" "}
              <span className="text-foreground font-semibold">real plan</span>—not another AI word salad.
            </p>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-foreground/40 line-through">$200/hr consultant</span>
                <span className="font-bold text-cta">$9.99</span>
              </div>
              <span className="text-foreground/20">|</span>
              <span className="text-foreground/60">Money-back guarantee</span>
              <span className="text-foreground/20">|</span>
              <a
                href="https://x.com/rbaten"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                <img src="/rbaten.png" alt="" className="w-5 h-5 rounded-full grayscale" />
                Built by @rbaten
              </a>
            </div>
          </div>

          {/* Right column - 3/7 width */}
          <div className="lg:col-span-3 space-y-4">
            {/* Form - brutalist box with harsh shadow */}
            <div className="border-[3px] border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
              <label
                htmlFor="hero-description"
                className="block text-base font-bold text-foreground mb-3"
              >
                What are you building?
              </label>
              <textarea
                id="hero-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Marketplace for tattoo artists. 500 signups, 3% convert to bookings. Tried Instagram ads, didn't work..."
                disabled={isSubmitting}
                rows={4}
                className="w-full bg-surface border-2 border-foreground/20 px-4 py-3 text-foreground placeholder:text-foreground/30 text-base leading-relaxed resize-none focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
              />

              {/* CTA Button - tactile with press state */}
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0 transition-all duration-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Firing up...
                  </>
                ) : (
                  <>
                    Get My Action Plan
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="mt-3 text-sm text-foreground/50 text-center">
                <Link
                  href="/start"
                  onClick={() => trackCTA("skip_description")}
                  className="hover:text-foreground underline underline-offset-2"
                >
                  or answer detailed questions →
                </Link>
              </p>
            </div>

            {/* Proof card - same brutalist style */}
            <Link
              href="/blog/our-growth-plan"
              onClick={() => trackCTA("dogfooding_proof")}
              className="group block"
            >
              <div className="border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.15em] text-cta uppercase font-semibold">
                      We eat our own cooking
                    </span>
                    <p className="text-base font-bold text-foreground mt-1">
                      See the plan we ran on ourselves →
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/40 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-cta" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
