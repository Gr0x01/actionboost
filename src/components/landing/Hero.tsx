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

    // Store prefill data
    const prefillData = {
      productDescription: description.trim(),
      timestamp: Date.now(),
    };
    localStorage.setItem(HERO_PREFILL_KEY, JSON.stringify(prefillData));

    router.push("/start?prefill=hero");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Cmd/Ctrl + Enter
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && description.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="relative bg-mesh py-16 lg:py-24 overflow-x-clip">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float stagger-2" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Hero content */}
          <div className="text-center lg:text-left animate-slide-up">
            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
              <span className="text-foreground">Growth hacking for people</span>
              <br />
              <span className="text-gradient">who hate growth hacks.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-lg text-muted sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              We pull your competitors&apos; traffic data, score every tactic by
              impact, and hand you a 30-day plan. Not vibes. Actual moves,
              ranked.
            </p>

            {/* Trust cluster */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center lg:justify-start">
              <a
                href="https://x.com/rbaten"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <img
                  src="/rbaten.jpg"
                  alt="@rbaten"
                  className="w-8 h-8 rounded-full object-cover"
                />
                Built by @rbaten
              </a>
              <span className="hidden sm:block text-border">|</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                One payment. No subscription. $9.99.
              </span>
            </div>
          </div>

          {/* Right - Form input */}
          <div className="animate-slide-up stagger-1">
            <div className="bg-background rounded-2xl border border-border/60 p-6 shadow-lg">
              <label
                htmlFor="hero-description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Tell me about your product
              </label>
              <textarea
                id="hero-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="We're building a marketplace for tattoo artists. Launched 2 months ago, ~500 signups but only 3% convert to booking. Tried Instagram ads, didn't work..."
                disabled={isSubmitting}
                rows={5}
                className="w-full bg-surface/50 border border-border/60 rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 font-serif text-base leading-relaxed resize-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
              />

              {/* Character hint */}
              <p className="mt-2 text-xs text-muted">
                The more context you give, the better your plan will be.
              </p>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cta text-white font-semibold hover:bg-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

              {/* Skip link */}
              <p className="mt-3 text-sm text-muted text-center">
                <Link
                  href="/start"
                  onClick={() => trackCTA("skip_description")}
                  className="text-primary hover:underline"
                >
                  Skip to full questionnaire
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Dogfooding callout - below hero */}
        <div className="mt-12 lg:mt-16 animate-slide-up stagger-2">
          <Link
            href="/blog/our-growth-plan"
            className="group flex items-center justify-between gap-4 py-2.5 px-5 rounded-lg bg-surface border border-border hover:border-primary/30 transition-all duration-200 max-w-xl mx-auto"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-primary tracking-wide">
                DOGFOODING
              </span>
              <span className="hidden sm:block w-px h-4 bg-border" />
              <span className="text-sm text-muted">
                We ran Actionboo.st on itself
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-primary text-sm font-medium shrink-0">
              <span className="hidden sm:inline">Read our plan</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
