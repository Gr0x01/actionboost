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
        {/* Main grid: 4/3 split - vertically centered for balance */}
        <div className="grid lg:grid-cols-7 gap-12 lg:gap-12 items-center">
          {/* Left column - 4/7 width */}
          <div className="lg:col-span-4">
            {/* Tagline */}
            <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase mb-6">
              Growth strategy / $9.99 / No BS
            </p>

            {/* Headline */}
            <h1>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight tracking-tight text-foreground leading-[0.95]">
                Growth hacking
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight tracking-tight text-foreground leading-[0.95]">
                for people who
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-foreground leading-[0.95] mt-1">
                hate growth hacks.
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-base sm:text-lg text-muted max-w-lg leading-relaxed">
              We pull your competitors&apos; traffic data, score every tactic by impact, and hand you a 30-day plan.{" "}
              <span className="text-foreground font-medium">Not vibes. Actual moves.</span>
            </p>

            {/* Trust row - horizontal */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted line-through">$200/hr</span>
                <span className="font-bold text-foreground">$9.99</span>
              </div>
              <span className="text-border">|</span>
              <a
                href="https://x.com/rbaten"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
              >
                <img src="/rbaten.jpg" alt="" className="w-5 h-5 rounded-full grayscale" />
                @rbaten
              </a>
              <span className="text-border">|</span>
              <span className="text-muted">Money-back guarantee</span>
            </div>
          </div>

          {/* Right column - 3/7 width - Form + Proof stacked */}
          <div className="lg:col-span-3 space-y-4">
            {/* Form */}
            <div className="border-2 border-foreground bg-background p-6 lg:p-8">
              <label
                htmlFor="hero-description"
                className="block text-base font-bold text-foreground mb-3"
              >
                Tell me about your product
              </label>
              <textarea
                id="hero-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="We're a marketplace for tattoo artists. 500 signups, 3% convert. Instagram ads didn't work..."
                disabled={isSubmitting}
                rows={3}
                className="w-full bg-surface border-2 border-foreground/20 px-4 py-3 text-foreground placeholder:text-muted/50 text-base leading-relaxed resize-none focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
              />

              <button
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg hover:bg-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Get My Growth Plan
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="mt-3 text-sm text-muted text-center">
                <Link
                  href="/start"
                  onClick={() => trackCTA("skip_description")}
                  className="hover:text-foreground underline"
                >
                  or answer detailed questions
                </Link>
              </p>
            </div>

            {/* Proof - stacked under form */}
            <Link
              href="/blog/our-growth-plan"
              onClick={() => trackCTA("dogfooding_proof")}
              className="group block"
            >
              <div className="flex items-center justify-between gap-4 border-2 border-foreground bg-background p-5 transition-all group-hover:bg-surface">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.15em] text-cta uppercase">
                    Proof it works
                  </span>
                  <h2 className="text-lg font-bold text-foreground mt-1">
                    We ran Actionboo.st on itself.
                  </h2>
                </div>
                <ArrowRight className="w-5 h-5 text-cta shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
