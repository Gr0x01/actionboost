"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Check } from "lucide-react";
import { config } from "@/lib/config";
import type { ResultStatus } from "./page";
import type { HeadlineAnalysisOutput } from "@/lib/ai/headline-analyzer";

const STAGES = [
  { text: "Reading your headline", delay: 0, duration: 5 },
  { text: "Evaluating clarity", delay: 5, duration: 5 },
  { text: "Checking specificity", delay: 10, duration: 5 },
  { text: "Assessing differentiation", delay: 15, duration: 5 },
  { text: "Writing better alternatives", delay: 20, duration: 10 },
] as const;

const SCORE_LABELS: Record<string, string> = {
  clarity: "Clarity",
  specificity: "Specificity",
  differentiation: "Differentiation",
  customerFocus: "Customer Focus",
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className={`text-4xl font-black ${color}`}>{score}</span>
      <span className="text-foreground/40 text-sm font-medium">/100</span>
    </div>
  );
}

function CategoryScore({ label, score, analysis }: { label: string; score: number; analysis: string }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-400";
  const pct = Math.max(score, 3);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{score}</span>
      </div>
      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-foreground/60">{analysis}</p>
    </div>
  );
}

interface Props {
  initialResult: {
    slug: string;
    headline: string;
    output: HeadlineAnalysisOutput | null;
    status: ResultStatus;
  };
}

export function HeadlineAnalysisResults({ initialResult }: Props) {
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
        const res = await fetch(`/api/headline-analyzer/${result.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.result.status === "complete" || data.result.status === "failed") {
            stopped = true;
            const input = data.result.input as { headline?: string } | null;
            setResult({
              slug: data.result.slug,
              headline: input?.headline || result.headline,
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
        setResult((prev) => ({ ...prev, status: "failed" as ResultStatus }));
      }
    };

    poll();
    return () => { stopped = true; };
  }, [result.slug, result.status, result.headline]);

  // Track results viewed
  useEffect(() => {
    if (result.status === "complete" && !hasTrackedView.current) {
      posthog?.capture("headline_analysis_viewed", { slug: result.slug });
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

  // Current stage
  const currentStage = STAGES.find(
    (s) => elapsedSeconds >= s.delay && elapsedSeconds < s.delay + s.duration
  );
  const currentStageText = currentStage?.text ||
    (elapsedSeconds < 40 ? "Finalizing..." : "Still working, almost there...");

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
          Headline Analyzer
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-8">
          Analyzing your headline...
        </h1>

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
          About 30 seconds. Results appear automatically.
        </p>

        <div
          className="bg-white border-2 border-foreground/15 rounded-md p-6 text-left [&_p]:text-balance [&_span]:text-balance"
          style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
        >
          <p className="text-base font-bold text-foreground mb-4">
            The score tells you what&apos;s wrong. Boost tells you what to do about it.
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-bold text-foreground">This analysis</span>
              <span className="text-foreground/60"> — scores your headline on clarity, specificity, differentiation, and customer focus. Plus 3 rewrites.</span>
            </div>
            <div>
              <span className="font-bold text-foreground">Boost</span>
              <span className="text-foreground/60"> — gives you the full picture: competitive landscape, positioning strategy, and a 30-day action plan.</span>
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
            We couldn&apos;t analyze your headline
          </p>
          <p className="text-foreground/60 text-sm mb-6">
            Something went wrong on our end. Want to try again?
          </p>
          <Link
            href="/tools/headline-analyzer"
            className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  // Complete
  const output = result.output;
  if (!output) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 pb-24">
      {/* Header */}
      <section className="pt-16 pb-12">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-4">
          Headline Analysis
        </span>

        {/* The headline being analyzed */}
        <div
          className="bg-background border-2 border-foreground/20 rounded-md p-6 md:p-8 mb-10"
          style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-3">
            Your headline
          </span>
          <p className="text-xl lg:text-2xl font-serif text-foreground leading-relaxed">
            &ldquo;{result.headline}&rdquo;
          </p>
        </div>

        {/* Overall score + verdict */}
        <div className="flex items-start gap-6 mb-10">
          <ScoreGauge score={output.overall} />
          <div className="flex-1 pt-1">
            <p className="text-base font-bold text-foreground mb-1">The verdict</p>
            <p className="text-foreground/70 leading-relaxed">{output.verdict}</p>
          </div>
        </div>
      </section>

      {/* Category scores */}
      <section className="mb-12">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-6">
          Score breakdown
        </span>
        <div className="space-y-6">
          {(Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>).map((key) => (
            <CategoryScore
              key={key}
              label={SCORE_LABELS[key]}
              score={output.scores[key as keyof typeof output.scores]}
              analysis={output.analysis[key as keyof typeof output.analysis]}
            />
          ))}
        </div>
      </section>

      {/* Rewrites */}
      <section className="mb-12">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
          Better alternatives
        </span>
        <p className="text-sm text-foreground/50 mb-6">
          Here&apos;s what your headline could look like.
        </p>
        <div className="space-y-4">
          {output.rewrites.map((rewrite, idx) => (
            <div
              key={idx}
              className="bg-background border-2 border-foreground/15 rounded-md p-5"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              <p className="text-lg font-bold text-foreground mb-2">
                &ldquo;{rewrite.headline}&rdquo;
              </p>
              <p className="text-sm text-foreground/50">{rewrite.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="border-t-[3px] border-foreground mb-10" />

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-start">
          <div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-3">
              Go deeper
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight mb-4">
              Your headline is one piece. See the full picture.
            </h2>
            <ul className="space-y-3 text-sm text-foreground/70 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Competitive landscape</strong> — who you&apos;re up against and where they&apos;re weak</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Positioning analysis</strong> — how clear your market position is</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Quick wins</strong> — the fastest changes you can make right now</span>
              </li>
            </ul>
          </div>

          <div
            className="bg-foreground rounded-md p-6 text-center"
            style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.15)" }}
          >
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-background/40 block mb-2">
              Full Boost
            </span>
            <p className="text-3xl font-bold text-background mb-1">
              {config.singlePrice}
            </p>
            <p className="text-sm text-background/50 mb-6">
              One-time. No subscription.
            </p>
            <a
              href="/upgrade?from=headline"
              onClick={() => posthog?.capture("headline_cta_clicked", { slug: result.slug })}
              className="w-full inline-flex items-center justify-center gap-2 bg-cta text-white font-semibold px-6 py-4 rounded-md text-base border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              See the full picture
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-sm text-background/40 mt-3">
              Didn&apos;t help? Full refund.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
