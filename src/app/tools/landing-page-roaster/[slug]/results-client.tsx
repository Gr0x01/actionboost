"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Check, AlertTriangle, AlertCircle, Info, ChevronDown, Link2 } from "lucide-react";
import { config } from "@/lib/config";
import { prefillStartForm } from "@/lib/prefill";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import type { RoasterStatus, RoasterOutput } from "./page";

const CATEGORY_LABELS: Record<string, string> = {
  copy: "Copy",
  design: "Design",
  conversion: "Conversion",
  trust: "Trust",
};

const SEVERITY_CONFIG = {
  critical: { label: "Critical", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", accent: "border-l-red-400" },
  major: { label: "Major", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", accent: "border-l-amber-400" },
  minor: { label: "Minor", icon: Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", accent: "border-l-blue-300" },
};

const SEVERITY_GROUP_LABELS = {
  critical: "Fix these first",
  major: "Should fix",
  minor: "Nice to fix",
};

const STAGES = [
  { text: "Screenshotting your full page", delay: 0, duration: 15 },
  { text: "Reading every line of copy", delay: 15, duration: 12 },
  { text: "Evaluating visual hierarchy", delay: 27, duration: 10 },
  { text: "Checking conversion path", delay: 37, duration: 10 },
  { text: "Looking for trust signals", delay: 47, duration: 10 },
  { text: "Writing the roast", delay: 57, duration: 18 },
] as const;

interface Props {
  initialResult: {
    slug: string;
    url: string;
    businessDescription: string;
    output: RoasterOutput | null;
    status: RoasterStatus;
  };
}

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const posthog = usePostHog();

  const handleCopy = async () => {
    const url = `${window.location.origin}/tools/landing-page-roaster/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    posthog?.capture("roaster_link_copied", { slug });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background active:translate-y-0.5 transition-all duration-100"
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      <span className="hidden sm:inline">{copied ? "Copied!" : "Copy link"}</span>
    </button>
  );
}

function RoastCard({ roast }: { roast: RoasterOutput["roasts"][number] }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[roast.severity];
  const SevIcon = sev.icon;

  return (
    <div
      className={`border-l-[3px] ${sev.accent} bg-background border border-foreground/10 border-l-0 rounded-r-md overflow-hidden`}
      style={{ boxShadow: "3px 3px 0 rgba(44, 62, 80, 0.06)" }}
    >
      <div className="p-4">
        {/* Top row: severity + category */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${sev.bg} ${sev.color} ${sev.border} border`}>
            <SevIcon className="w-2.5 h-2.5" />
            {sev.label}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/35">
            {CATEGORY_LABELS[roast.category]}
          </span>
        </div>

        {/* Roast text */}
        <p className="text-sm leading-[1.6] text-foreground mb-3">
          {roast.roast}
        </p>

        {/* Fix toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-cta/70 hover:text-cta transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Hide fix" : "Show fix"}
        </button>
      </div>

      {/* Fix — revealed on expand */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="border-l-2 border-cta/30 bg-cta/[0.03] pl-3 py-2 pr-2 rounded-r-sm">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-cta/60 block mb-0.5">
              Fix
            </span>
            <p className="text-[13px] text-foreground/70 leading-snug">
              {roast.fix}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function LandingPageRoasterResults({ initialResult }: Props) {
  const posthog = usePostHog();
  const [result, setResult] = useState(initialResult);
  const hasTrackedView = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedStages, setCompletedStages] = useState<Array<{ text: string; timestamp: number }>>([]);
  const [displayedText, setDisplayedText] = useState("");
  const currentStageRef = useRef<string>("");
  const typingIndexRef = useRef<number>(0);
  const pollRef = useRef(false);

  // Poll if not complete
  useEffect(() => {
    if (result.status === "complete" || result.status === "failed") return;
    if (pollRef.current) return;
    pollRef.current = true;

    let stopped = false;
    let count = 0;

    const poll = async () => {
      if (stopped) return;
      count++;

      try {
        const res = await fetch(`/api/landing-page-roaster/${result.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.result.status === "complete" || data.result.status === "failed") {
            stopped = true;
            setResult({
              slug: data.result.slug,
              url: data.result.url,
              businessDescription: data.result.business_description || "",
              output: data.result.output,
              status: data.result.status,
            });
            return;
          }
        }
      } catch {
        // Continue polling
      }

      if (!stopped && count < 60) {
        setTimeout(poll, 2000);
      } else if (!stopped) {
        stopped = true;
        setResult((prev) => ({ ...prev, status: "failed" as RoasterStatus }));
      }
    };

    poll();
    return () => { stopped = true; };
  }, [result.slug, result.status]);

  // Track results viewed
  useEffect(() => {
    if (result.status === "complete" && !hasTrackedView.current) {
      posthog?.capture("landing_page_roaster_viewed", { slug: result.slug });
      hasTrackedView.current = true;
    }
  }, [result.status, result.slug, posthog]);

  // Elapsed timer
  useEffect(() => {
    if (result.status === "complete" || result.status === "failed") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [result.status]);

  const currentStage = STAGES.find(
    (s) => elapsedSeconds >= s.delay && elapsedSeconds < s.delay + s.duration
  );
  const currentStageText = currentStage?.text ||
    (elapsedSeconds < 90 ? "Finalizing the roast..." : "Still working, almost there...");

  // Typewriter effect
  useEffect(() => {
    if (result.status === "complete" || result.status === "failed") return;
    if (!currentStageText) return;

    if (currentStageText !== currentStageRef.current) {
      if (currentStageRef.current) {
        const completedText = currentStageRef.current;
        setCompletedStages((prev) => {
          const updated = [...prev, { text: completedText, timestamp: Date.now() }];
          return updated.slice(-3);
        });
      }
      currentStageRef.current = currentStageText;
      typingIndexRef.current = 0;
      setDisplayedText("");
    }

    let animationId: number;
    let lastTime = 0;
    const charDelay = 25;

    const animate = (time: number) => {
      if (currentStageRef.current !== currentStageText) return;
      if (time - lastTime >= charDelay) {
        lastTime = time;
        if (typingIndexRef.current < currentStageText.length) {
          typingIndexRef.current++;
          setDisplayedText(currentStageText.slice(0, typingIndexRef.current));
        }
      }
      if (typingIndexRef.current < currentStageText.length) {
        animationId = requestAnimationFrame(animate);
      }
    };

    if (typingIndexRef.current < currentStageText.length) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [currentStageText, result.status]);

  // Pending/Processing
  if (result.status === "pending" || result.status === "processing") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-cta mb-3">
          Landing Page Roaster
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
          Preparing your roast...
        </h1>
        <p className="text-sm text-foreground/50 mb-8 max-w-sm mx-auto text-balance">
          Screenshotting your full page and evaluating copy, design, conversion, and trust signals.
        </p>

        <div className="w-full rounded-none border-[3px] border-foreground bg-foreground/5 p-6 shadow-[4px_4px_0_0_rgba(44,62,80,1)] text-left mb-6">
          {completedStages.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {completedStages.map((completed, idx) => (
                <div
                  key={completed.timestamp}
                  className="font-mono text-sm text-foreground/40 flex items-center gap-2 transition-opacity duration-500"
                  style={{ opacity: 0.25 + idx * 0.15 }}
                >
                  <Check className="w-3 h-3 text-green-500/60 flex-shrink-0" />
                  <span className="truncate">{completed.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="font-mono text-sm sm:text-base text-foreground min-h-[1.5rem]">
            <span className="text-cta font-semibold">&gt;</span>{" "}
            <span>{displayedText || currentStageText}</span>
            <span className="inline-block w-2 h-4 bg-cta ml-1 animate-[cursor-blink_1s_step-end_infinite]" />
          </div>
        </div>

        <p className="text-sm text-foreground/50 mb-12">
          About 60-90 seconds. Results appear automatically.
        </p>

        <div
          className="bg-white border-2 border-foreground/15 rounded-md p-6 text-left [&_p]:text-balance [&_span]:text-balance"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
        >
          <p className="text-base font-bold text-foreground mb-4">
            The roast finds the problems. Boost builds the fix.
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-bold text-foreground">This roast</span>
              <span className="text-foreground/60"> — shows exactly what&apos;s wrong with your landing page: weak copy, confusing design, broken conversion flow, missing trust.</span>
            </div>
            <div>
              <span className="font-bold text-foreground">Boost</span>
              <span className="text-foreground/60"> — gives you a 30-day action plan to fix your entire marketing, not just one page. Specific to your business.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed
  if (result.status === "failed") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div
          className="bg-white border-2 border-foreground/20 rounded-md p-10"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
        >
          <p className="text-lg font-semibold text-foreground mb-2">
            We couldn&apos;t complete your roast
          </p>
          <p className="text-foreground/60 text-sm mb-6">
            This usually happens when a site is unreachable or blocks automated tools. Want to try a different URL?
          </p>
          <Link
            href="/tools/landing-page-roaster"
            className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            Try a different URL
          </Link>
        </div>
      </div>
    );
  }

  // Complete — show results
  const output = result.output!;

  const scoreColor = (s: number) =>
    s >= 70 ? "text-green-600" : s >= 50 ? "text-amber-600" : "text-red-600";
  const borderColor = (s: number) =>
    s >= 70 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";
  const verdict = (s: number) =>
    s >= 85 ? "Exceptional" : s >= 70 ? "Strong" : s >= 50 ? "Getting There" : s >= 30 ? "Needs Work" : "Critical";

  // Group roasts by severity
  const groupedRoasts = {
    critical: output.roasts.filter((r) => r.severity === "critical"),
    major: output.roasts.filter((r) => r.severity === "major"),
    minor: output.roasts.filter((r) => r.severity === "minor"),
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24">
      {/* Header */}
      <section className="pt-16 pb-8">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
          Your landing page roast
        </span>
        <div className="flex items-center justify-between gap-4 mb-8">
          <p className="font-mono text-sm text-foreground/40">{result.url}</p>
          <div className="flex items-center gap-2 shrink-0">
            <CopyLinkButton slug={result.slug} />
            <SocialShareButtons
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/tools/landing-page-roaster/${result.slug}`}
              text={`${output.verdict} — my landing page scored ${output.scores.overall}/100`}
              source="roaster"
            />
          </div>
        </div>
      </section>

      {/* Hero: Verdict (3/5) + Score Gauge (2/5) */}
      <section className="pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left — verdict */}
          <div className="lg:col-span-3">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta block mb-3">
              The verdict
            </span>
            <p className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-4">
              {output.verdict}
            </p>
            {output.wins.length > 0 && (
              <div className="mt-6">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-green-600/70 block mb-3">
                  What&apos;s actually working
                </span>
                <div className="space-y-2">
                  {output.wins.map((win, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-[15px] leading-[1.6] text-foreground">{win}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — score gauge */}
          <div className="lg:col-span-2">
            <div
              className="bg-background border-2 border-foreground/20 rounded-md p-5"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
                Page score
              </span>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-[100px] h-[56px] shrink-0">
                  <svg viewBox="0 0 120 68" className="w-full h-full" fill="none">
                    <path
                      d="M 10 63 A 50 50 0 0 1 110 63"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                      className="text-foreground/10"
                    />
                    <path
                      d="M 10 63 A 50 50 0 0 1 110 63"
                      stroke={borderColor(output.scores.overall)}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${output.scores.overall * 1.57} 157`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
                    <span className={`text-[32px] font-bold leading-none tabular-nums ${scoreColor(output.scores.overall)}`}>
                      {output.scores.overall}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{verdict(output.scores.overall)}</span>
                  <p className="text-xs text-foreground/50 mt-0.5">out of 100</p>
                </div>
              </div>

              <div className="border-t border-foreground/10 pt-4 space-y-3">
                {([
                  ["Copy", output.scores.copy],
                  ["Design", output.scores.design],
                  ["Conversion", output.scores.conversion],
                  ["Trust", output.scores.trust],
                ] as const).map(([label, score]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40">
                      {label}
                    </span>
                    <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                      <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${score}%`,
                            backgroundColor: borderColor(score),
                          }}
                        />
                      </div>
                      <span className={`text-sm font-bold tabular-nums w-7 text-right ${scoreColor(score)}`}>
                        {score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Roasts — 2-col grid, grouped by severity */}
      <section className="pb-16">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
          The roast — {output.roasts.length} issues found
        </span>

        <div className="space-y-8">
          {(["critical", "major", "minor"] as const).map((severity) => {
            const roasts = groupedRoasts[severity];
            if (roasts.length === 0) return null;

            const sev = SEVERITY_CONFIG[severity];

            return (
              <div key={severity}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.15em] ${sev.color}`}>
                    {SEVERITY_GROUP_LABELS[severity]}
                  </span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${sev.bg} ${sev.color} ${sev.border} border`}>
                    {roasts.length}
                  </span>
                  <div className="flex-1 h-px bg-foreground/8" />
                </div>

                {/* Roast cards — 2-col on desktop, 1-col on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {roasts.map((roast, i) => (
                    <RoastCard key={i} roast={roast} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div
          className="bg-foreground rounded-md p-8 lg:p-10"
          style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.15)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-background mb-2 text-balance">
                Want the full strategy? Not just what&apos;s wrong — what to&nbsp;do&nbsp;next.
              </h2>
              <p className="text-[15px] leading-[1.6] text-background/60 mb-6">
                The roast showed you what&apos;s broken. Boost researches your market, your competitors, and builds a 30-day plan to fix everything — not just one page.
              </p>
              <a
                href={`/upgrade?from=landing-page-roaster&websiteUrl=${encodeURIComponent(result.url)}`}
                onClick={() => {
                  prefillStartForm({ websiteUrl: result.url, productDescription: result.businessDescription })
                  posthog?.capture("landing_page_roaster_cta_clicked", { slug: result.slug })
                }}
                className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-8 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100"
              >
                Get my Boost — {config.singlePrice}
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-sm text-background/40 mt-2">
                One-time payment. No subscription.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Full competitive research — who's winning and why",
                "30-day action plan ranked by impact, specific to your business",
                "Channel playbooks matched to your budget and audience",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-cta shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[15px] leading-[1.6] text-background/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
