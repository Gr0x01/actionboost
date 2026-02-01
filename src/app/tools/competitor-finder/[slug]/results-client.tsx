"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { config } from "@/lib/config";
import type { ResultStatus } from "./page";
import type { CompetitorFinderOutput } from "@/lib/ai/competitor-finder";

const STAGES = [
  { text: "Searching for competitors", delay: 0, duration: 6 },
  { text: "Analyzing market alternatives", delay: 6, duration: 6 },
  { text: "Evaluating positioning", delay: 12, duration: 6 },
  { text: "Identifying weaknesses", delay: 18, duration: 6 },
  { text: "Finding your opportunities", delay: 24, duration: 10 },
] as const;

interface Props {
  initialResult: {
    slug: string;
    url: string;
    output: CompetitorFinderOutput | null;
    status: ResultStatus;
  };
}

export function CompetitorFinderResults({ initialResult }: Props) {
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
        const res = await fetch(`/api/competitor-finder/${result.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.result.status === "complete" || data.result.status === "failed") {
            stopped = true;
            const input = data.result.input as { url?: string } | null;
            setResult({
              slug: data.result.slug,
              url: input?.url || result.url,
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
  }, [result.slug, result.status, result.url]);

  // Track results viewed
  useEffect(() => {
    if (result.status === "complete" && !hasTrackedView.current) {
      posthog?.capture("competitor_finder_viewed", { slug: result.slug });
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
          Competitor Finder
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-8">
          Finding your competitors...
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
            Competitors are one piece. Boost shows the full picture.
          </p>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-bold text-foreground">This report</span>
              <span className="text-foreground/60"> — 5 competitors with positioning, weaknesses, and opportunities.</span>
            </div>
            <div>
              <span className="font-bold text-foreground">Boost</span>
              <span className="text-foreground/60"> — competitive landscape, positioning strategy, quick wins, and a 30-day action plan.</span>
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
            We couldn&apos;t find your competitors
          </p>
          <p className="text-foreground/60 text-sm mb-6">
            Something went wrong on our end. Want to try again?
          </p>
          <Link
            href="/tools/competitor-finder"
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
          Competitor Analysis
        </span>

        {/* Summary */}
        <div
          className="bg-background border-2 border-foreground/20 rounded-md p-6 md:p-8 mb-10"
          style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-3">
            The landscape
          </span>
          <p className="text-base lg:text-lg text-foreground leading-relaxed">
            {output.summary}
          </p>
        </div>
      </section>

      {/* Competitors */}
      <section className="mb-12">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
          Your competitors
        </span>
        <p className="text-sm text-foreground/50 mb-6">
          {output.competitors.length} competitors found for {result.url}
        </p>

        <div className="space-y-5">
          {output.competitors.map((competitor, idx) => (
            <div
              key={idx}
              className="bg-background border-2 border-foreground/15 rounded-md p-5 md:p-6"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              {/* Competitor header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{competitor.name}</h3>
                  <a
                    href={competitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cta hover:underline inline-flex items-center gap-1"
                  >
                    {competitor.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/30 shrink-0">
                  #{idx + 1}
                </span>
              </div>

              <p className="text-sm text-foreground/70 mb-4">{competitor.description}</p>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground/50 block mb-1">
                    Positioning
                  </span>
                  <p className="text-sm text-foreground/70">{competitor.positioning}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-red-500/70 block mb-1">
                    Weakness
                  </span>
                  <p className="text-sm text-foreground/70">{competitor.weakness}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-green-600/70 block mb-1">
                    Your Opportunity
                  </span>
                  <p className="text-sm text-foreground/70">{competitor.opportunity}</p>
                </div>
              </div>
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
              Now you know who. Boost tells you what to do about it.
            </h2>
            <ul className="space-y-3 text-sm text-foreground/70 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Full competitive landscape</strong> — deeper analysis with traffic data and keyword gaps</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">Positioning strategy</strong> — how to differentiate based on what you just learned</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cta mt-1.5 shrink-0" />
                <span><strong className="text-foreground">30-day action plan</strong> — exactly what to do this week, next week, and beyond</span>
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
              href="/upgrade?from=competitor-finder"
              onClick={() => posthog?.capture("competitor_finder_cta_clicked", { slug: result.slug })}
              className="w-full inline-flex items-center justify-center gap-2 bg-cta text-white font-semibold px-6 py-4 rounded-md text-base border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Get the full picture
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
