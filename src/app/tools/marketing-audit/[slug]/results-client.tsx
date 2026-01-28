"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { config } from "@/lib/config";
import type { AuditStatus, MarketingAuditOutput } from "./page";

const CATEGORY_LABELS: Record<string, string> = {
  clarity: "Clarity",
  "customer-focus": "Customer Focus",
  proof: "Proof",
  friction: "Friction",
};

// Terminal-style simulated stages (matches FreeAuditPending pattern)
const STAGES = [
  { text: "Fetching your page", delay: 0, duration: 10 },
  { text: "Running the 3-Second Test", delay: 10, duration: 12 },
  { text: "Counting customer vs. company focus", delay: 22, duration: 10 },
  { text: "Checking proof of transformation", delay: 32, duration: 10 },
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
  const [audit, setAudit] = useState(initialAudit);
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
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-8">
          Running the 3-Second Test...
        </h1>

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
          <a
            href="/tools/marketing-audit"
            className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            Try a different URL
          </a>
        </div>
      </div>
    );
  }

  // Complete state — show results
  const output = audit.output!;
  const [firstFinding, ...restFindings] = output.findings;

  return (
    <div className="max-w-3xl mx-auto px-6 pb-24">
      {/* Header */}
      <section className="pt-16 pb-12">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
          Your free marketing audit
        </span>

        <p className="font-mono text-sm text-foreground/40 mb-8">{audit.url}</p>

        {/* Silent Killer — hero card (LeadDiscovery pattern) */}
        <div
          className="bg-background border-2 border-foreground/20 rounded-md p-6 md:p-8 mb-10"
          style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta block mb-3">
            Biggest silent killer
          </span>
          <p className="text-xl lg:text-2xl font-serif text-foreground leading-relaxed">
            {output.silentKiller}
          </p>
        </div>

        {/* Summary — pull quote style */}
        <p className="font-serif text-[17px] lg:text-[18px] leading-[1.75] text-foreground/85">
          {output.summary}
        </p>
      </section>

      {/* Section divider */}
      <div className="border-t-[3px] border-foreground mb-10" />

      {/* Finding Cards */}
      <section className="pb-16">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-8">
          What&apos;s costing you customers
        </span>

        {/* First finding — featured, 2-column with fix pulled right */}
        {firstFinding && (
          <div
            className="bg-background border-2 border-foreground/20 rounded-md p-6 md:p-8 mb-8"
            style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
          >
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-6 md:gap-10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40 block mb-2">
                  {CATEGORY_LABELS[firstFinding.category] || firstFinding.category}
                </span>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-3">
                  {firstFinding.title}
                </h3>
                <p className="font-serif text-[17px] leading-[1.75] text-foreground/85">
                  {firstFinding.detail}
                </p>
              </div>
              <div className="border-l-[3px] border-cta/40 bg-cta/[0.04] pl-5 py-4 pr-4 rounded-r-md self-start md:mt-6">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cta/70 block mb-1.5">
                  Fix
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {firstFinding.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Remaining findings — 2-column grid */}
        {restFindings.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            {restFindings.map((finding, i) => (
              <div
                key={i}
                className="bg-background border border-foreground/15 rounded-md p-5 flex flex-col"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40 block mb-2">
                  {CATEGORY_LABELS[finding.category] || finding.category}
                </span>

                <h3 className="text-base font-bold text-foreground leading-snug mb-2">
                  {finding.title}
                </h3>

                <p className="text-sm text-foreground/70 leading-relaxed mb-4 flex-1">
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
        )}
      </section>

      {/* CTA — 2-column: value left, price card right */}
      <section>
        <div className="border-t-[3px] border-foreground mb-10" />

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-start">
          {/* Left: value pitch */}
          <div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-3">
              Ready to fix it?
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight mb-4">
              You&apos;ve seen what&apos;s broken. Here&apos;s how to fix it.
            </h2>
            <ul className="space-y-3 text-sm text-foreground/70 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">30-day action plan</strong> — week-by-week tasks, ranked by impact</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Specific to your business</strong> — your market, your competitors, your budget</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Real research</strong> — built from competitive analysis, not generic templates</span>
              </li>
            </ul>
          </div>

          {/* Right: price card */}
          <div
            className="bg-background border-2 border-foreground/20 rounded-md p-6 text-center"
            style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.15)" }}
          >
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
              Your full plan
            </span>
            <p className="text-3xl font-bold text-foreground mb-1">
              {config.singlePrice}
            </p>
            <p className="text-sm text-foreground/50 mb-6">
              One-time payment. No subscription.
            </p>
            <a
              href="/start"
              className="w-full inline-flex items-center justify-center gap-2 bg-cta text-white font-semibold px-6 py-4 rounded-md text-base border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Get my Boost
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
