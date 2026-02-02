"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Globe,
  Loader2,
  SkipForward,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ToolFormCard } from "@/components/free-tools";

// --- Feed Types ---

type RoastFeedItem = {
  slug: string;
  domain: string;
  verdict: string;
  overallScore: number | null;
  completedAt: string;
};

// --- Roast Feed ---

function RoastFeed() {
  const [feed, setFeed] = useState<RoastFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/landing-page-roaster/feed")
      .then((r) => r.json())
      .then((data) => {
        setFeed(data.feed ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-foreground/20" />
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <p className="text-center text-foreground/40 py-12 font-mono text-sm">
        No roasts yet. Be the first.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {feed.map((item) => (
        <Link
          key={item.slug}
          href={`/tools/landing-page-roaster/${item.slug}`}
          className="border-2 border-foreground/20 rounded-md shadow-[4px_4px_0_rgba(44,62,80,0.1)] p-4 bg-background hover:shadow-[5px_5px_0_rgba(44,62,80,0.15)] hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-bold text-foreground truncate mr-3">
              {item.domain}
            </span>
            {item.overallScore !== null && (
              <span
                className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
                  item.overallScore >= 75
                    ? "bg-green-100 text-green-700"
                    : item.overallScore >= 50
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {item.overallScore}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/60 leading-snug line-clamp-2">
            {item.verdict || "Roast complete."}
          </p>
          <p className="text-xs text-foreground/30 mt-2 font-mono">
            {timeAgo(item.completedAt)}
          </p>
        </Link>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// --- Form Steps ---

function WizardUrlStep({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const favicon = (() => {
    if (value && value.includes(".")) {
      try {
        const url = value.startsWith("http") ? value : `https://${value}`;
        return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
      } catch {
        return null;
      }
    }
    return null;
  })();

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        What landing page should we roast?
      </label>
      <div className="flex items-center gap-3 rounded-lg border-2 border-foreground/20 bg-background px-4 py-4 focus-within:border-foreground focus-within:ring-2 focus-within:ring-cta/20 transition-all">
        {/* eslint-disable @next/next/no-img-element */}
        {favicon ? (
          <img src={favicon} alt="" className="w-6 h-6" />
        ) : (
          <Globe className="w-6 h-6 text-foreground/30" />
        )}
        {/* eslint-enable @next/next/no-img-element */}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onSubmit();
          }}
          placeholder="yoursite.com/landing-page"
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
        />
      </div>
      <button
        onClick={value.trim() ? onSubmit : undefined}
        disabled={!value.trim()}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Roast my page
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        60 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardContextStep({
  value,
  onChange,
  onSubmit,
  onSkip,
  onBack,
  submitting,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
  submitting?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-sm font-bold text-foreground mb-1">What does your business do?</p>
      <p className="text-xs text-foreground/50 mb-3">
        Optional — helps us give more relevant feedback
      </p>
      <div className="rounded-md border-2 border-foreground/20 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              value.trim() ? onSubmit() : onSkip();
            }
          }}
          placeholder="We sell project management software for remote teams"
          rows={2}
          className="w-full bg-transparent text-foreground placeholder:text-foreground/30 outline-none resize-none min-h-[60px]"
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            disabled={submitting}
            className="flex items-center gap-1 text-sm font-medium text-foreground/40 hover:text-foreground/60 transition-colors disabled:opacity-40"
          >
            Skip
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={value.trim() ? onSubmit : onSkip}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-100 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Roasting...
              </>
            ) : (
              <>
                Roast my page
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

function LandingPageRoasterContent() {
  const router = useRouter();
  const posthog = usePostHog();
  const hasTrackedStart = useRef(false);

  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRoasts, setTotalRoasts] = useState<number | null>(null);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      posthog?.capture("landing_page_roaster_started");
      hasTrackedStart.current = true;
    }
  }, [posthog]);

  // Fetch total count for activity counter
  useEffect(() => {
    fetch("/api/landing-page-roaster/feed")
      .then((r) => r.json())
      .then((data) => setTotalRoasts(data.total ?? null))
      .catch(() => {});
  }, []);

  const handleStepChange = useCallback(
    (newStep: number, stepName: string) => {
      posthog?.capture("landing_page_roaster_step", {
        step: newStep,
        step_name: stepName,
      });
      setStep(newStep);
    },
    [posthog]
  );

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    posthog?.capture("landing_page_roaster_submitted", {
      has_context: businessDescription.trim().length > 0,
    });

    try {
      const res = await fetch("/api/landing-page-roaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          businessDescription: businessDescription.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          posthog?.capture("landing_page_roaster_duplicate");
          router.push(`/tools/landing-page-roaster/${data.existingSlug}`);
          return;
        }
        posthog?.capture("landing_page_roaster_error", { error: data.error });
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      posthog?.capture("landing_page_roaster_success", { slug: data.slug });
      router.push(`/tools/landing-page-roaster/${data.slug}`);
    } catch {
      posthog?.capture("landing_page_roaster_error", {
        error: "network_error",
      });
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, url, businessDescription, router, posthog]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50 mb-4">
              Landing Page Roaster
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-[1.1] mb-5">
              We roast landing pages.
              <br />
              <span className="font-black">Yours is next.</span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-lg mx-auto mb-8">
              Sharp feedback on copy, design, conversion, and trust. Every
              observation comes with a fix.
            </p>

            {totalRoasts !== null && totalRoasts > 0 && (
              <p className="inline-flex items-center gap-2 font-mono text-sm text-foreground/50 mb-6">
                <Flame className="w-4 h-4 text-cta" />
                {totalRoasts.toLocaleString()} pages roasted
              </p>
            )}

            <div className="max-w-lg mx-auto">
              <ToolFormCard id="roaster-form" step={step} totalSteps={2} error={error}>
                {step === 0 && (
                  <motion.div
                    key="url"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WizardUrlStep
                      value={url}
                      onChange={setUrl}
                      onSubmit={() => handleStepChange(1, "context")}
                    />
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="context"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WizardContextStep
                      value={businessDescription}
                      onChange={setBusinessDescription}
                      onSubmit={handleSubmit}
                      onSkip={handleSubmit}
                      onBack={() => setStep(0)}
                      submitting={submitting}
                    />
                  </motion.div>
                )}
              </ToolFormCard>
            </div>
          </div>
        </section>

        {/* Recent Roasts Feed */}
        <section className="pb-16 md:pb-20">
          <div className="max-w-2xl mx-auto px-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50 mb-6 text-center">
              Recent Roasts
            </p>
            <RoastFeed />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-16 md:pb-20">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-foreground text-background rounded-xl p-8 md:p-10 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                The roast shows what&apos;s broken.
                <br />
                Boost shows how to fix everything.
              </h2>
              <p className="text-background/60 mb-6 max-w-md mx-auto">
                A 30-day action plan for your entire marketing — positioning,
                competitors, channels, and execution.
              </p>
              <Link
                href="/upgrade?from=landing-page-roaster"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cta text-white font-bold rounded-lg hover:-translate-y-0.5 transition-transform"
              >
                See what Boost does
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Cross-links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-8 text-sm text-foreground/40">
              <Link href="/tools/marketing-audit" className="hover:text-foreground/60 transition-colors">
                Marketing Audit
              </Link>
              <span className="text-foreground/20">·</span>
              <Link href="/tools/headline-analyzer" className="hover:text-foreground/60 transition-colors">
                Headline Analyzer
              </Link>
              <span className="text-foreground/20">·</span>
              <Link href="/tools/competitor-finder" className="hover:text-foreground/60 transition-colors">
                Competitor Finder
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function LandingPageRoasterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-mesh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
          </main>
          <Footer />
        </div>
      }
    >
      <LandingPageRoasterContent />
    </Suspense>
  );
}
