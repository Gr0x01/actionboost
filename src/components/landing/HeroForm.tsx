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
      {/* Form - softer card style */}
      <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-lg">
        <label
          htmlFor="hero-description"
          className="block text-base font-bold text-foreground mb-3"
        >
          Tell me about your business
        </label>
        <textarea
          id="hero-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="I run a salon in Austin. We're good at what we do but struggle to get new clients. Tried Facebook ads once, didn't really work..."
          disabled={isSubmitting}
          rows={4}
          className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-foreground placeholder:text-foreground/40 text-base leading-relaxed resize-none focus:outline-none focus:border-foreground/40 focus:ring-2 focus:ring-cta/20 transition-all disabled:opacity-50"
        />

        {/* CTA Button - tactile with press state */}
        <button
          onClick={handleSubmit}
          disabled={!description.trim() || isSubmitting}
          className="mt-4 w-full rounded-xl flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:shadow-sm active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:translate-y-0 transition-all duration-150"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Let&apos;s do this...
            </>
          ) : (
            <>
              Tell me about your business
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
            or answer a few quick questions →
          </Link>
        </p>
      </div>
    </div>
  );
}
