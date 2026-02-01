"use client";

import Image from "next/image";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";

/**
 * Data fragments — the "chaos" layer.
 * Small cards showing raw data snippets, rotated and scattered.
 */
const DATA_FRAGMENTS = [
  // Row 1 — top
  {
    logo: "/logos/google-analytics.svg",
    text: "2,400 mo/searches",
    rotate: "-rotate-3",
    position: "top-0 left-2",
  },
  {
    logo: "/logos/semrush.png",
    text: "Domain rating: 34",
    rotate: "rotate-2",
    position: "top-1 right-0",
  },
  // Row 2
  {
    logo: "/logos/reddit.svg",
    text: "r/smallbusiness · 3 mentions",
    rotate: "rotate-1",
    position: "top-20 -left-4",
  },
  {
    logo: "/logos/instagram.svg",
    text: "12.4K followers",
    rotate: "-rotate-2",
    position: "top-16 right-8",
  },
  // Row 3
  {
    text: "\"best crm for startups\"",
    pills: true,
    rotate: "rotate-2",
    position: "top-36 left-0",
  },
  {
    logo: "/logos/ahrefs.png",
    text: "Backlinks: 847",
    rotate: "-rotate-1",
    position: "top-32 right-2",
  },
  // Row 4 — new
  {
    logo: "/logos/google.svg",
    text: "Position #14 → #6",
    rotate: "rotate-1",
    position: "top-52 left-6",
  },
  {
    logo: "/logos/youtube.svg",
    text: "8.2K views/mo",
    rotate: "-rotate-2",
    position: "top-48 right-12",
  },
  // Row 5 — new
  {
    logo: "/logos/linkedin.svg",
    text: "Company page: 340 followers",
    rotate: "-rotate-1",
    position: "top-64 -left-2",
  },
  {
    logo: "/logos/shopify.svg",
    text: "Conv. rate: 1.8%",
    rotate: "rotate-3",
    position: "top-60 right-0",
  },
  // Row 6 — new, bottom edges
  {
    logo: "/logos/facebook.svg",
    text: "CPC: $1.24",
    rotate: "rotate-1",
    position: "top-80 left-10",
  },
  {
    logo: "/logos/mailchimp.svg",
    text: "Open rate: 34%",
    rotate: "-rotate-2",
    position: "top-76 right-6",
  },
];

/**
 * HeroWithExplainer — Option B: "Everyone has marketing advice."
 *
 * Two-column layout. Copy left, static chaos→clarity visual right.
 * No scroll takeover, no animation hijacking. Static visual composition.
 */
export function HeroWithExplainer() {
  const posthog = usePostHog();

  return (
    <section className="relative pt-10 sm:pt-14 lg:pt-20 pb-16 sm:pb-20 lg:pb-28 overflow-hidden">
      {/* Background gradient blobs — subtle warmth */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(230, 126, 34, 0.15) 0%, transparent 60%)" }}
        />
        <div
          className="absolute top-[60%] -left-40 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(52, 152, 219, 0.08) 0%, transparent 60%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* === LEFT COLUMN: Copy === */}
          <div className="max-w-xl">
            {/* Category label */}
            <p className="font-mono text-[10px] tracking-[0.15em] text-foreground/50 uppercase mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cta" />
              Marketing intelligence
            </p>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] tracking-tight text-foreground leading-[1.1]">
              <span className="font-light">Everyone has marketing&nbsp;advice.</span>
              <br />
              <span className="font-black"><span className="decoration-cta decoration-[4px] underline underline-offset-[6px]">None of it</span> is about your&nbsp;business.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-foreground/70 leading-relaxed max-w-lg">
              Boost researches your actual market&nbsp;—{" "}
              <span className="font-semibold text-foreground">real traffic&nbsp;data</span>,{" "}
              <span className="font-semibold text-foreground">real competitor&nbsp;strategies</span>,{" "}
              <span className="font-semibold text-foreground">real&nbsp;gaps</span>{" "}
              — and tells you exactly where to&nbsp;focus.
            </p>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/start?free=true"
                onClick={() => posthog?.capture("hero_cta_clicked", { type: "free", variant: "option-b" })}
                className="inline-flex items-center gap-2 rounded-md px-8 py-4 bg-cta text-white text-lg font-bold border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.15)] hover:shadow-[2px_2px_0_rgba(44,62,80,0.15)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-100"
              >
                Show me my market
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust line */}
            <p className="mt-4 font-mono text-xs text-foreground/50 tracking-wide">
              Free · No signup · Takes 2 minutes
            </p>
          </div>

          {/* === RIGHT COLUMN: Chaos → Clarity visual === */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <ChaosToClarity />
          </div>
        </div>

        {/* Mobile: simplified visual below copy */}
        <div className="mt-12 lg:hidden" aria-hidden="true">
          <ChaosToClarity mobile />
        </div>
      </div>
    </section>
  );
}

/**
 * Static visual composition showing scattered data fragments
 * converging into a clean Boost output card.
 */
function ChaosToClarity({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="relative">
        {/* Two fragment cards side by side */}
        <div className="flex justify-center gap-3 mb-4">
          <div className="bg-white border border-foreground/10 rounded-md px-3 py-2 opacity-50 -rotate-2 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Image src="/logos/google-analytics.svg" alt="" width={14} height={14} className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] text-foreground/60">2,400 mo/searches</span>
            </div>
          </div>
          <div className="bg-white border border-foreground/10 rounded-md px-3 py-2 opacity-50 rotate-2 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Image src="/logos/reddit.svg" alt="" width={14} height={14} className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] text-foreground/60">3 mentions</span>
            </div>
          </div>
          <div className="bg-white border border-foreground/10 rounded-md px-3 py-2 opacity-50 -rotate-1 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Image src="/logos/ahrefs.png" alt="" width={14} height={14} className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] text-foreground/60">847 backlinks</span>
            </div>
          </div>
        </div>

        {/* Convergence arrow */}
        <div className="flex justify-center my-2">
          <svg width="20" height="24" viewBox="0 0 20 24" className="text-foreground/20">
            <path d="M10 0 L10 18 M4 14 L10 20 L16 14" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Output card */}
        <BoostOutputCard />
      </div>
    );
  }

  return (
    <div className="relative h-[540px]">
      {/* Scattered data fragments */}
      {DATA_FRAGMENTS.map((fragment, i) => (
        <div
          key={i}
          className={`absolute ${fragment.position} ${fragment.rotate} opacity-50 hover:opacity-70 transition-opacity`}
        >
          <div
            className="bg-white border border-foreground/10 rounded-md px-3 py-2"
            style={{ boxShadow: "2px 2px 0 rgba(44, 62, 80, 0.04)" }}
          >
            <div className="flex items-center gap-1.5">
              {fragment.logo && (
                <Image src={fragment.logo} alt="" width={14} height={14} className="w-3.5 h-3.5" />
              )}
              {fragment.pills ? (
                <div className="flex gap-1">
                  <span className="font-mono text-[10px] text-foreground/50 bg-foreground/5 px-1.5 py-0.5 rounded">
                    best crm
                  </span>
                  <span className="font-mono text-[10px] text-foreground/50 bg-foreground/5 px-1.5 py-0.5 rounded">
                    startups
                  </span>
                </div>
              ) : (
                <span className="font-mono text-[10px] text-foreground/60 whitespace-nowrap">
                  {fragment.text}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Convergence lines — thin angled lines pointing toward output card */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 500 540"
        fill="none"
        preserveAspectRatio="none"
      >
        <line x1="80" y1="50" x2="200" y2="280" stroke="rgba(44,62,80,0.06)" strokeWidth="1" />
        <line x1="420" y1="40" x2="300" y2="280" stroke="rgba(44,62,80,0.06)" strokeWidth="1" />
        <line x1="30" y1="180" x2="180" y2="300" stroke="rgba(44,62,80,0.05)" strokeWidth="1" />
        <line x1="470" y1="170" x2="320" y2="300" stroke="rgba(44,62,80,0.05)" strokeWidth="1" />
      </svg>

      {/* The Boost output card — center of composition, the "clarity" */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[340px]">
        <BoostOutputCard />
      </div>
    </div>
  );
}

/**
 * The "clarity" card — a mini Boost market report.
 * This is the visual anchor that the chaos converges into.
 */
function BoostOutputCard() {
  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md overflow-hidden"
      style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
    >
      {/* Card header */}
      <div className="px-4 py-3 border-b border-foreground/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground tracking-tight">Boost</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">
            Market report
          </span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="w-2 h-2 rounded-full bg-foreground/10" />
          <div className="w-2 h-2 rounded-full bg-foreground/10" />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Focus line */}
        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/40 block mb-1">
            This week&apos;s focus
          </span>
          <p className="text-sm font-bold text-foreground leading-snug">
            Build one free tool targeting your highest-intent keyword
          </p>
        </div>

        {/* Priority actions */}
        <div className="space-y-2">
          {[
            "Publish the ROI calculator (competitor gets 14K visits/mo from theirs)",
            "Claim Google Business — you're invisible in local search",
            "Stop posting on Twitter — 0.2% of your traffic comes from there",
          ].map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0
                    ? "bg-cta text-white"
                    : "bg-foreground/5 text-foreground/50"
                }`}
              >
                {i + 1}
              </span>
              <p className="text-xs text-foreground/70 leading-relaxed">{action}</p>
            </div>
          ))}
        </div>

        {/* Market opportunity score */}
        <div className="pt-2 border-t border-foreground/10">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/40">
              Market opportunity
            </span>
            <span className="font-mono text-[10px] font-bold text-cta">73/100</span>
          </div>
          <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
            <div className="h-full bg-cta rounded-full" style={{ width: "73%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
