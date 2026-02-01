"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { config } from "@/lib/config";
import { prefillStartForm } from "@/lib/prefill";

const COPY_VARIANTS: Record<
  string,
  { headline: string; subhead: string }
> = {
  snapshot: {
    headline: "You\u2019ve seen the score. Here\u2019s the plan.",
    subhead:
      "Your 3-Second Test flagged the gaps. The full Boost gives you exactly what to fix, in what order.",
  },
  brief: {
    headline: "Your diagnosis is clear. Here\u2019s the fix.",
    subhead:
      "You\u2019ve seen your competitive landscape. The full Boost turns it into a 30-day action plan.",
  },
  headline: {
    headline: "Your headline is one piece. See the full picture.",
    subhead:
      "The analyzer scored your copy. The full Boost covers positioning, competitors, and what to do next.",
  },
  "target-audience": {
    headline: "You know who to reach. Now reach them.",
    subhead:
      "The generator mapped your audience. The full Boost builds a 30-day plan to actually get in front of them.",
  },
  "email-subject": {
    headline: "Your subject line is the first impression. What\u2019s the second?",
    subhead:
      "The scorer optimized your open rate. The full Boost covers positioning, competitors, and what to do next.",
  },
  "competitor-finder": {
    headline: "You\u2019ve found your competitors. Now outmaneuver them.",
    subhead:
      "The finder mapped your competitive landscape. The full Boost turns those gaps into a 30-day action plan.",
  },
};

const DEFAULT_COPY = {
  headline: "See what\u2019s holding you back \u2014 and fix it.",
  subhead:
    "A 30-day marketing plan built from real competitive research. Specific to your business.",
};

const FEATURES_FREE = [
  "Your positioning assessed",
  "What makes you different",
  "1 key discovery from live research",
];

const FEATURES_PAID = [
  "Your competitors\u2019 actual traffic sources",
  "The gaps they\u2019re missing that you can exploit",
  "What to do this week, next week, and why",
  "Tactics ranked by effort-to-impact",
  "Copy templates written for your market",
];

interface UpgradeContentProps {
  from?: string;
  audit?: string;
  token?: string;
  websiteUrl?: string;
}

export function UpgradeContent({
  from,
  audit,
  token,
  websiteUrl,
}: UpgradeContentProps) {
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const validFrom = from && from in COPY_VARIANTS ? from : undefined;
  const copy = (validFrom && COPY_VARIANTS[validFrom]) || DEFAULT_COPY;
  const isBriefUpgrade = !!(audit && token);

  async function handleBriefUpgrade() {
    setIsLoading(true);
    setError(false);
    posthog?.capture("upgrade_cta_clicked", { from: validFrom || "direct", type: "brief_upgrade" });
    try {
      const res = await fetch("/api/checkout/upgrade-from-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeAuditId: audit, token }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setIsLoading(false);
      setError(true);
    }
  }

  function handleStartClick() {
    posthog?.capture("upgrade_cta_clicked", { from: validFrom || "direct", type: "start" });
    if (websiteUrl) {
      prefillStartForm({ websiteUrl });
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
            Full Boost
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4 text-balance">
            {copy.headline}
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto leading-relaxed text-balance">
            {copy.subhead}
          </p>
        </div>
      </section>

      {/* What you get — free vs full */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Free tier */}
          <div
            className="rounded-md border-2 border-foreground/20 bg-white overflow-hidden flex flex-col p-6 lg:p-8"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <p className="font-mono text-xs tracking-[0.12em] text-foreground/50 uppercase mb-3">
              Free preview
            </p>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-black text-foreground">$0</span>
            </div>
            <div className="space-y-3 flex-1">
              {FEATURES_FREE.map((f) => (
                <FeatureItem key={f}>{f}</FeatureItem>
              ))}
              {FEATURES_PAID.slice(0, 3).map((f) => (
                <LockedItem key={f}>{f}</LockedItem>
              ))}
            </div>
          </div>

          {/* Paid tier */}
          <div
            className="rounded-md border-2 border-cta bg-white overflow-hidden flex flex-col p-6 lg:p-8"
            style={{ boxShadow: "4px 4px 0 rgba(230, 126, 34, 0.35)" }}
          >
            <p className="font-mono text-xs tracking-[0.12em] text-cta font-bold uppercase mb-3">
              Full Boost
            </p>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-black text-foreground">
                {config.singlePrice}
              </span>
              <span className="text-lg text-foreground/50 font-medium">
                one-time
              </span>
            </div>
            <p className="text-sm text-foreground/60 mb-4">
              Everything in Free, plus:
            </p>
            <div className="space-y-3 flex-1">
              {FEATURES_PAID.map((f) => (
                <FeatureItem key={f}>{f}</FeatureItem>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg italic text-foreground/60 leading-relaxed">
            &ldquo;The competitor analysis alone is worth it. Finally know what
            to focus on.&rdquo;
          </blockquote>
          <p className="text-sm text-foreground/40 mt-2">
            &mdash; Noah P., founder
          </p>
          <Link
            href="/blog/our-growth-plan"
            className="text-xs text-foreground/40 underline underline-offset-2 hover:text-foreground/60 transition-colors mt-3 inline-block"
          >
            We use our own Boost
          </Link>
        </div>
      </section>

      {/* CTA block */}
      <section className="pb-24 px-6">
        <div className="max-w-xl mx-auto">
          <div
            className="bg-foreground rounded-md p-8 text-center"
            style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.15)" }}
          >
            {isBriefUpgrade ? (
              <>
                <button
                  onClick={handleBriefUpgrade}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-8 py-4 rounded-md text-base border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100 disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : `Get my full Boost \u2014 ${config.singlePrice}`}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
                <p className="text-sm text-background/40 mt-3">
                  One-time payment. No subscription.
                </p>
                {error && (
                  <p className="text-sm text-red-400 mt-2">
                    Something went wrong. Please try again.
                  </p>
                )}
              </>
            ) : (
              <>
                <a
                  href="/start"
                  onClick={handleStartClick}
                  className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-8 py-4 rounded-md text-base border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100"
                >
                  Get my full Boost &mdash; {config.singlePrice}
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-sm text-background/40 mt-3">
                  One-time payment. No subscription.
                </p>
              </>
            )}
            <p className="text-sm text-background/50 mt-4">
              Didn&apos;t help?{" "}
              <span className="font-bold text-background">Full refund.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <svg
        className="w-5 h-5 text-cta flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-[15px] text-foreground">{children}</span>
    </div>
  );
}

function LockedItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <svg
        className="w-5 h-5 text-foreground/25 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <span className="text-[15px] text-foreground/35">{children}</span>
    </div>
  );
}
