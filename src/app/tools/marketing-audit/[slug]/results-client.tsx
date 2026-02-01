"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Check } from "lucide-react";
import { config } from "@/lib/config";
import { prefillStartForm } from "@/lib/prefill";
import type { AuditStatus, MarketingAuditOutput } from "./page";

const CATEGORY_LABELS: Record<string, string> = {
  clarity: "Clarity",
  visibility: "Visibility",
  proof: "Proof",
  advantage: "Advantage",
  // Backward compat for old stored results
  "customer-focus": "Visibility",
  friction: "Advantage",
};

// Terminal-style simulated stages (matches FreeAuditPending pattern)
const STAGES = [
  { text: "Fetching your page", delay: 0, duration: 10 },
  { text: "Running the 3-Second Test", delay: 10, duration: 12 },
  { text: "Checking visibility signals", delay: 22, duration: 10 },
  { text: "Scanning for proof and trust signals", delay: 32, duration: 10 },
  { text: "Generating your report", delay: 42, duration: 18 },
] as const;

interface Props {
  initialAudit: {
    slug: string;
    url: string;
    businessDescription: string;
    output: MarketingAuditOutput | null;
    status: AuditStatus;
  };
}

export function MarketingAuditResults({ initialAudit }: Props) {
  const posthog = usePostHog();
  const [audit, setAudit] = useState(initialAudit);
  const hasTrackedView = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedStages, setCompletedStages] = useState<Array<{ text: string; timestamp: number }>>([]);
  const [displayedText, setDisplayedText] = useState("");
  const currentStageRef = useRef<string>("");
  const typingIndexRef = useRef<number>(0);
  const pollRef = useRef(false);

  // Poll if not complete
  useEffect(() => {
    if (audit.status === "complete" || audit.status === "failed") return;
    if (pollRef.current) return;
    pollRef.current = true;

    let stopped = false;
    let count = 0;

    const poll = async () => {
      if (stopped) return;
      count++;

      try {
        const res = await fetch(`/api/marketing-audit/${audit.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.audit.status === "complete" || data.audit.status === "failed") {
            stopped = true;
            setAudit({
              slug: data.audit.slug,
              url: data.audit.url,
              businessDescription: data.audit.business_description,
              output: data.audit.output,
              status: data.audit.status,
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
        setAudit((prev) => ({ ...prev, status: "failed" as AuditStatus }));
      }
    };

    poll();
    return () => { stopped = true; };
  }, [audit.slug, audit.status]);

  // Track results viewed
  useEffect(() => {
    if (audit.status === "complete" && !hasTrackedView.current) {
      posthog?.capture("marketing_audit_viewed", { slug: audit.slug });
      hasTrackedView.current = true;
    }
  }, [audit.status, audit.slug, posthog]);

  // Elapsed timer for terminal stages
  useEffect(() => {
    if (audit.status === "complete" || audit.status === "failed") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [audit.status]);

  // Determine current stage
  const currentStage = STAGES.find(
    (s) => elapsedSeconds >= s.delay && elapsedSeconds < s.delay + s.duration
  );
  const currentStageText = currentStage?.text ||
    (elapsedSeconds < 70 ? "Finalizing..." : "Still working, almost there...");

  // Typewriter effect (matches FreeAuditPending)
  useEffect(() => {
    if (audit.status === "complete" || audit.status === "failed") return;
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
  }, [currentStageText, audit.status]);

  // Pending/Processing state — terminal style + sell section
  if (audit.status === "pending" || audit.status === "processing") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-cta mb-3">
          Free Marketing Audit
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
          Running the 3-Second Test...
        </h1>
        <p className="text-sm text-foreground/50 mb-8 max-w-sm mx-auto text-balance">
          Testing whether strangers can tell what you sell, who it&apos;s for, and why you in under 3 seconds.
        </p>

        {/* Terminal-style activity display */}
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
          About 60 seconds. Results appear automatically.
        </p>

        {/* Sell section while they wait */}
        <div
          className="bg-white border-2 border-foreground/15 rounded-md p-6 text-left [&_p]:text-balance [&_span]:text-balance"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
        >
          <p className="text-base font-bold text-foreground mb-4">
            The audit shows what&apos;s broken. Boost shows how to fix it.
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-bold text-foreground">This audit</span>
              <span className="text-foreground/60"> — shows what&apos;s costing you customers: weak positioning, missing proof, unclear messaging.</span>
            </div>
            <div>
              <span className="font-bold text-foreground">Boost</span>
              <span className="text-foreground/60"> — gives you a 30-day action plan to fix it, week by week. Specific to your business.</span>
            </div>
          </div>
          <p className="text-xs text-foreground/40 mt-4">
            Your audit will be done in about 60 seconds. Then you decide if you want the full plan.
          </p>
        </div>
      </div>
    );
  }

  // Failed state
  if (audit.status === "failed") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div
          className="bg-white border-2 border-foreground/20 rounded-md p-10"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
        >
          <p className="text-lg font-semibold text-foreground mb-2">
            We couldn&apos;t complete your audit
          </p>
          <p className="text-foreground/60 text-sm mb-6">
            This usually happens when a site is unreachable or blocks automated tools. Want to try a different URL?
          </p>
          <Link
            href="/tools/marketing-audit"
            className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            Try a different URL
          </Link>
        </div>
      </div>
    );
  }

  // Complete state — show results
  const output = audit.output!;

  const scoreColor = (s: number) =>
    s >= 70 ? "text-green-600" : s >= 50 ? "text-amber-600" : "text-red-600";
  const borderColor = (s: number) =>
    s >= 70 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";
  const verdict = (s: number) =>
    s >= 85 ? "Exceptional" : s >= 70 ? "Strong" : s >= 50 ? "Getting There" : s >= 30 ? "Needs Work" : "Critical";

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24">
      {/* Header */}
      <section className="pt-16 pb-8">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
          Your free marketing audit
        </span>
        <p className="font-mono text-sm text-foreground/40 mb-8">{audit.url}</p>
      </section>

      {/* Hero: Silent Killer (3/5) + Score Gauge (2/5) — matches Brief layout */}
      <section className="pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left — silent killer + summary (open typography) */}
          <div className="lg:col-span-3">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta block mb-3">
              The biggest thing costing you customers
            </span>
            <p className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-4">
              {output.silentKiller}
            </p>
            <p className="text-[15px] leading-[1.7] text-foreground">
              {output.summary}
            </p>
          </div>

          {/* Right — score gauge in card */}
          {output.scores && (
            <div className="lg:col-span-2">
              <div
                className="bg-background border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
              >
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
                  Diagnostic score
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
                    ["Clarity", output.scores.clarity],
                    ["Visibility", output.scores.visibility ?? output.scores.customerFocus],
                    ["Proof", output.scores.proof],
                    ["Advantage", output.scores.advantage ?? output.scores.friction],
                  ] as const).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40">
                        {label}
                      </span>
                      <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>
                        {score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Findings */}
      <section className="pb-16">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-8">
          What&apos;s costing you customers
        </span>

        <div className={`grid gap-5 ${output.findings.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {output.findings.map((finding, i) => (
            <div
              key={i}
              className="bg-background border border-foreground/15 rounded-md p-5 flex flex-col"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40 block mb-2">
                {CATEGORY_LABELS[finding.category] || finding.category}
              </span>
              <h3 className="text-base font-bold text-foreground leading-snug mb-2">
                {finding.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-foreground mb-4 flex-1">
                {finding.detail}
              </p>
              <div className="border-l-[3px] border-cta/40 bg-cta/[0.04] pl-4 py-2.5 pr-3 rounded-r-md">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta/70 block mb-1">
                  Fix
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {finding.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — dark full-width block (matches Brief transition) */}
      <section className="pb-16">
        <div
          className="bg-foreground rounded-md p-8 lg:p-10"
          style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.15)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-background mb-2 text-balance">
                You&apos;ve seen what&apos;s broken. Here&apos;s how to&nbsp;fix&nbsp;it.
              </h2>
              <p className="text-[15px] leading-[1.6] text-background/60 mb-6">
                Get a 30-day action plan built from competitive research — specific to your business, your market, and your budget.
              </p>
              <a
                href={`/upgrade?from=snapshot&websiteUrl=${encodeURIComponent(audit.url)}`}
                onClick={() => {
                  prefillStartForm({ websiteUrl: audit.url, productDescription: audit.businessDescription })
                  posthog?.capture("marketing_audit_cta_clicked", { slug: audit.slug })
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
                "Week-by-week tasks ranked by what fixes your score fastest",
                "Competitor gaps you can exploit this month, with exact steps",
                "Channel-specific playbooks matched to your budget and audience",
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
