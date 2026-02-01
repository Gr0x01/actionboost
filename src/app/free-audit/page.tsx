"use client";

import { useRef, useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// --- Mock results page preview (fades out right + bottom) ---

function ResultsPreview() {
  return (
    <div className="relative md:ml-4">
      {/* Mock page card with CSS mask fade on right + bottom */}
      <div
        className="bg-white border-2 border-foreground/10 rounded-l-lg p-6 md:p-8 min-h-[420px]"
        style={{
          boxShadow: "-4px 4px 20px rgba(44, 62, 80, 0.08)",
          maskImage:
            "linear-gradient(to right, black 60%, transparent 100%), linear-gradient(to bottom, black 65%, transparent 95%)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to right, black 60%, transparent 100%), linear-gradient(to bottom, black 65%, transparent 95%)",
          WebkitMaskComposite: "source-in",
        }}
      >

        {/* Header bar */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/10">
          <div className="w-5 h-5 rounded bg-cta/20" />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-foreground/30">
            Your Boost Brief
          </span>
        </div>

        {/* Score section */}
        <div className="flex items-start gap-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative w-[100px] h-[56px]">
              <svg viewBox="0 0 120 68" className="w-full h-full" fill="none">
                <path
                  d="M 10 63 A 50 50 0 0 1 110 63"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-foreground/10"
                />
                <path
                  d="M 10 63 A 50 50 0 0 1 110 63"
                  stroke="#d97706"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="94 157"
                />
              </svg>
              <div className="absolute inset-0 flex items-end justify-center">
                <span className="text-2xl font-bold text-amber-600 tabular-nums">
                  62
                </span>
              </div>
            </div>
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-foreground/25 mt-1">
              Needs work
            </span>
          </div>

          {/* Category bars */}
          <div className="flex-1 space-y-2.5 pt-1">
            {(
              [
                ["Clarity", 71, "bg-green-500"],
                ["Customer Focus", 58, "bg-amber-500"],
                ["Proof", 44, "bg-red-400"],
                ["Ease", 68, "bg-amber-500"],
              ] as const
            ).map(([label, score, color]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-mono text-[8px] tracking-wider uppercase text-foreground/30 w-24 shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-foreground/40 tabular-nums w-5 text-right">
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock content blocks */}
        <div className="space-y-5">
          {/* Quick wins block */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-cta/60 mb-2">
              Quick Wins
            </p>
            <div className="space-y-2">
              <div className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-cta/40 mt-1.5 shrink-0" />
                <div className="h-3 bg-foreground/8 rounded w-[85%]" />
              </div>
              <div className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-cta/40 mt-1.5 shrink-0" />
                <div className="h-3 bg-foreground/8 rounded w-[70%]" />
              </div>
              <div className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-cta/40 mt-1.5 shrink-0" />
                <div className="h-3 bg-foreground/8 rounded w-[78%]" />
              </div>
            </div>
          </div>

          {/* Positioning gap block */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-foreground/30 mb-2">
              Positioning Gap
            </p>
            <div className="space-y-1.5">
              <div className="h-3 bg-foreground/6 rounded w-full" />
              <div className="h-3 bg-foreground/6 rounded w-[90%]" />
              <div className="h-3 bg-foreground/6 rounded w-[60%]" />
            </div>
          </div>

          {/* Competitive comparison block */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-foreground/30 mb-2">
              Competitive Landscape
            </p>
            <div className="flex gap-3">
              <div className="flex-1 h-16 bg-foreground/4 rounded" />
              <div className="flex-1 h-16 bg-foreground/4 rounded" />
              <div className="flex-1 h-16 bg-foreground/4 rounded" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Main Page ---

export default function FreeAuditPage() {
  const posthog = usePostHog();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!hasTrackedView.current) {
      posthog?.capture("free_audit_landing_viewed");
      hasTrackedView.current = true;
    }
  }, [posthog]);

  const steps = [
    ["Tell us about your business", "A few quick questions so we compare you to the right competitors."],
    ["We research your market", "Real data on your site, your competitors, and your positioning."],
    ["Get your clarity score", "0\u2013100 across four categories, with specific findings you can act on."],
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Trust bar */}
      <div className="text-center py-2.5 bg-surface border-b border-border">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40">
          Free growth plan &middot; Takes 2 minutes &middot; No account needed
        </p>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 mt-10 md:mt-20">
        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
          {/* Left: copy + CTA */}
          <div className="md:pt-4">
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Is your website actually convincing anyone?
            </h1>

            <p className="text-base md:text-lg text-foreground/60 leading-relaxed mt-4 mb-8">
              Your site makes perfect sense to you. You built it. But a
              first-time visitor decides in 3 seconds whether to stay or leave.
              Find out where you stand — and what to fix first.
            </p>

            <Link
              href="/start?free=true&source=fb-ad"
              className="inline-flex items-center justify-center gap-2 bg-cta text-white font-semibold text-base px-8 py-3.5 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100"
            >
              Score my site — free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[12px] text-foreground/30 mt-3">
              No signup. No payment. Results in about 2 minutes.
            </p>
          </div>

          {/* Right: mock results page fading out */}
          <div className="hidden md:block">
            <ResultsPreview />
          </div>
        </div>
      </div>

      {/* Mobile: simplified score preview */}
      <div className="md:hidden mx-5 mt-10">
        <div
          className="bg-white border-2 border-foreground/20 rounded-md p-5"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40 text-center mb-3">
            Here&apos;s what you&apos;ll get
          </p>
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-[100px] h-[56px]">
              <svg viewBox="0 0 120 68" className="w-full h-full" fill="none">
                <path d="M 10 63 A 50 50 0 0 1 110 63" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-foreground/10" />
                <path d="M 10 63 A 50 50 0 0 1 110 63" stroke="#d97706" strokeWidth="8" strokeLinecap="round" strokeDasharray="94 157" />
              </svg>
              <div className="absolute inset-0 flex items-end justify-center">
                <span className="text-2xl font-bold text-amber-600 tabular-nums">62</span>
              </div>
            </div>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/30 mt-1">Needs work</span>
          </div>
          <div className="space-y-2 border-t border-foreground/10 pt-3">
            {([["Clarity", 71, "bg-green-500"], ["Customer Focus", 58, "bg-amber-500"], ["Proof", 44, "bg-red-400"], ["Ease", 68, "bg-amber-500"]] as const).map(([label, score, color]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="font-mono text-[9px] tracking-wider uppercase text-foreground/35 w-24 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground/50 tabular-nums w-6 text-right">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 mt-14 md:mt-24">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-6 md:text-center">
          How it works
        </p>
        <div className="md:grid md:grid-cols-3 md:gap-8 space-y-4 md:space-y-0">
          {steps.map(([title, desc], i) => (
            <div key={i} className="flex md:flex-col md:text-center gap-3.5">
              <div className="flex-none w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center md:mx-auto">
                <span className="text-xs font-bold text-foreground/40">
                  {i + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-sm text-foreground/50 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second CTA — lighter treatment */}
      <div className="text-center mt-14 md:mt-16 pb-10">
        <Link
          href="/start?free=true&source=fb-ad"
          className="inline-flex items-center gap-1.5 text-cta font-semibold text-base hover:underline underline-offset-4 transition-colors"
        >
          Score my site — free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm text-foreground/40 mt-2">
          Real research on your market. Not a template.
        </p>
      </div>
    </main>
  );
}
