"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Loader2 } from "lucide-react";

const HERO_PREFILL_KEY = "actionboost-hero-prefill";

export function HeroForm() {
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

    router.push("/start?source=hero");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && description.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Form - brutalist box with harsh shadow */}
      <div className="rounded-2xl border-[3px] border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
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
          className="w-full rounded-xl bg-surface border-2 border-foreground/20 px-4 py-3 text-foreground placeholder:text-foreground/30 text-base leading-relaxed resize-none focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
        />

        {/* CTA Button - tactile with press state */}
        <button
          onClick={handleSubmit}
          disabled={!description.trim() || isSubmitting}
          className="mt-4 w-full rounded-2xl flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0 transition-all duration-100"
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
        <div className="rounded-2xl border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
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
  );
}
