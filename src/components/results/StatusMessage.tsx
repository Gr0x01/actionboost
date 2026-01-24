"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X, Lightbulb, HelpCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  PROCESSING_TIPS,
  TIP_ROTATION_INTERVAL,
  type TipType,
} from "@/lib/constants/processing-content";

type Status = "pending" | "processing" | "complete" | "failed";

interface CompletedStage {
  text: string;
  timestamp: number;
}

interface StatusMessageProps {
  status: Status;
  stage?: string | null;
  message?: string;
  submessage?: string;
}

export function StatusMessage({
  status,
  stage,
  message,
  submessage,
}: StatusMessageProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [displayedDataPoints, setDisplayedDataPoints] = useState(0);

  // Combined state to avoid cascading render warnings
  const [stageTracking, setStageTracking] = useState({
    seenStages: [] as string[],
    targetDataPoints: 0
  });
  const seenStagesRef = useRef<Set<string>>(new Set()); // For O(1) lookup

  // Stage history and typewriter state
  const [completedStages, setCompletedStages] = useState<CompletedStage[]>([]);
  const [displayedText, setDisplayedText] = useState("");
  const typingStageRef = useRef<string>(""); // The stage we're currently typing
  const typingIndexRef = useRef<number>(0);  // Current character index

  // Typewriter effect using requestAnimationFrame for smooth, uninterruptible typing
  useEffect(() => {
    if (!stage) return;

    // If this is a NEW stage, handle the transition
    if (stage !== typingStageRef.current) {
      // Complete previous stage and add to history
      if (typingStageRef.current) {
        const completedText = typingStageRef.current;
        setCompletedStages(prev => {
          const updated = [...prev, { text: completedText, timestamp: Date.now() }];
          return updated.slice(-3);
        });
      }

      // Start fresh for new stage
      typingStageRef.current = stage;
      typingIndexRef.current = 0;
      setDisplayedText("");
    }

    // Typing animation loop
    let animationId: number;
    let lastTime = 0;
    const charDelay = 20; // ms per character

    const animate = (time: number) => {
      // Check if we're still typing this stage
      if (typingStageRef.current !== stage) return;

      if (time - lastTime >= charDelay) {
        lastTime = time;

        if (typingIndexRef.current < stage.length) {
          typingIndexRef.current++;
          setDisplayedText(stage.slice(0, typingIndexRef.current));
        }
      }

      // Continue if not done
      if (typingIndexRef.current < stage.length) {
        animationId = requestAnimationFrame(animate);
      }
    };

    // Only start animation if we haven't finished typing this stage
    if (typingIndexRef.current < stage.length) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [stage]);

  // Track unique stages and accumulate estimated data points
  useEffect(() => {
    if (stage && !seenStagesRef.current.has(stage)) {
      seenStagesRef.current.add(stage);
      const points = estimateDataPoints(stage);
      // Defer state update to avoid cascading render warnings
      queueMicrotask(() => {
        setStageTracking(prev => ({
          seenStages: [...prev.seenStages, stage],
          targetDataPoints: prev.targetDataPoints + points
        }));
      });
    }
  }, [stage]);

  // Animate counter with bursty, discovery-like timing
  // Pattern: duh duh...........duh duh duh...duh..........duh duh duh duh
  const [tickTrigger, setTickTrigger] = useState(0);
  const { seenStages, targetDataPoints } = stageTracking;

  useEffect(() => {
    if (displayedDataPoints >= targetDataPoints) return;

    const difference = targetDataPoints - displayedDataPoints;
    const roll = Math.random();

    let delay: number;
    let increment: number;

    if (roll < 0.15) {
      // 15% chance: long pause (searching/processing)
      delay = 400 + Math.random() * 300; // 400-700ms pause
      increment = 0; // No data this tick, just waiting
    } else if (roll < 0.35) {
      // 20% chance: quick burst of data
      delay = 40 + Math.random() * 30; // 40-70ms (fast)
      increment = difference > 10 ? 3 : 2; // Find multiple
    } else if (roll < 0.55) {
      // 20% chance: medium pause
      delay = 180 + Math.random() * 120; // 180-300ms
      increment = 1;
    } else {
      // 45% chance: normal tick
      delay = 80 + Math.random() * 60; // 80-140ms
      increment = Math.random() > 0.7 ? 2 : 1;
    }

    const timer = setTimeout(() => {
      if (increment > 0) {
        setDisplayedDataPoints(prev => Math.min(prev + increment, targetDataPoints));
      }
      // Always tick to keep the loop going during pauses
      setTickTrigger(t => t + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedDataPoints, targetDataPoints, tickTrigger]);

  // Rotate tips during processing
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return;

    let timeoutId: NodeJS.Timeout | null = null;

    const interval = setInterval(() => {
      setTipVisible(false);
      timeoutId = setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % PROCESSING_TIPS.length);
        setTipVisible(true);
      }, 200);
    }, TIP_ROTATION_INTERVAL);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status]);

  // Complete state
  if (status === "complete") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-xl border-[3px] border-green-600 bg-green-600 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
            <Check className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
          {message || "Action plan ready!"}
        </h1>
        <p className="text-foreground/60 max-w-md mx-auto">
          {submessage || "Redirecting you to your results"}
        </p>
      </div>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-xl border-[3px] border-red-500 bg-red-500 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
            <X className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
          {message || "Something went wrong"}
        </h1>
        <p className="text-foreground/60 mb-8">
          {submessage || (
            <>
              We encountered an error while generating your action plan.
              <br />
              Please try again or contact support.
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/start"
            className="rounded-xl px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
          >
            Try Again
          </Link>
          <a
            href="mailto:team@aboo.st"
            className="rounded-xl px-6 py-3 bg-transparent text-foreground font-bold border-2 border-foreground/30 hover:border-foreground transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Pending/processing state - dynamic activity display
  const currentTip = PROCESSING_TIPS[currentTipIndex];
  const displayStage = stage || "Preparing your strategy...";

  return (
    <div className="max-w-lg mx-auto text-center py-16 px-6">
      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-8">
        {message || "Building your action plan"}
      </h1>

      {/* Dynamic Activity Display - Terminal Style */}
      <div className="rounded-none border-[3px] border-foreground bg-foreground/5 p-6 shadow-[4px_4px_0_0_rgba(44,62,80,1)] text-left mb-6">
        {/* Completed stages history */}
        {completedStages.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {completedStages.map((completed, idx) => (
              <div
                key={completed.timestamp}
                className="font-mono text-sm text-foreground/40 flex items-center gap-2 transition-opacity duration-500"
                style={{
                  opacity: 0.25 + (idx * 0.15), // Older = more faded
                  animation: "fadeSlideIn 0.3s ease-out",
                }}
              >
                <Check className="w-3 h-3 text-green-500/60 flex-shrink-0" />
                <span className="truncate">{completed.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current action with typewriter effect */}
        <div className="font-mono text-sm sm:text-base text-foreground min-h-[1.5rem]">
          <span className="text-cta font-semibold">&gt;</span>{" "}
          <span>{displayedText || displayStage}</span>
          <span className="inline-block w-2 h-4 bg-cta ml-1 animate-[cursor-blink_1s_step-end_infinite]" />
        </div>

        {/* Divider */}
        <div className="border-t border-foreground/20 my-4" />

        {/* Data points counter */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-foreground tabular-nums">
              {displayedDataPoints}
            </p>
            <p className="text-xs text-foreground/60 uppercase tracking-wide font-bold">
              data points gathered
            </p>
          </div>
          {displayedDataPoints > 0 && seenStages.length > 0 && (
            <div className="text-right text-xs text-foreground/50">
              {getSourceTypes(seenStages)}
            </div>
          )}
        </div>
      </div>

      {/* Rotating Tip Card */}
      <div className="rounded-none border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)] text-left">
        <div
          className={`transition-all duration-200 ${
            tipVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <div className="flex items-start gap-3">
            <TipIcon type={currentTip.type} />
            <p className="text-foreground/80 text-sm leading-relaxed">
              {currentTip.content}
            </p>
          </div>
        </div>
      </div>

      {/* Time estimate + email notice */}
      <div className="mt-6 space-y-2">
        <p className="text-sm font-semibold text-foreground/70">
          Real research takes real time.
        </p>
        <p className="text-sm text-foreground/50">
          We&apos;re pulling live competitive data and building your custom 30-day plan.
          <br />
          About 8 minutes. We&apos;ll email you when it&apos;s done.
        </p>
      </div>
    </div>
  );
}

/**
 * Estimate data points gathered based on tool type
 * Each tool gathers multiple pieces of information
 */
function estimateDataPoints(stage: string): number {
  const lower = stage.toLowerCase();

  // Search returns ~8 results with title, URL, snippet each
  if (lower.includes("searching") || lower.includes("researching")) {
    return 15; // 8 results × ~2 useful fields
  }

  // Scraping a page yields lots of content sections
  if (lower.includes("reading") || lower.includes("scrape")) {
    return 25; // Full page with multiple sections
  }

  // SEO metrics: traffic, keywords, positions, etc.
  if (lower.includes("seo") || lower.includes("checking seo")) {
    return 12; // Traffic + keyword count + position breakdown
  }

  // Keyword gap analysis returns many keywords
  if (lower.includes("keyword")) {
    return 20; // ~15-20 keyword opportunities
  }

  // Analyzing/preparing stages (including refinement analysis)
  if (lower.includes("analyzing") || lower.includes("preparing") || lower.includes("feedback")) {
    return 8;
  }

  // Loading history (past recommendations, insights)
  if (lower.includes("loading") || lower.includes("history")) {
    return 10;
  }

  // Generating/identifying stages (refinement-specific)
  if (lower.includes("generating") || lower.includes("identifying") || lower.includes("improve")) {
    return 12;
  }

  // Finalizing stages
  if (lower.includes("finalizing") || lower.includes("refined")) {
    return 5;
  }

  // Context reading (refinement-specific)
  if (lower.includes("context") || lower.includes("original")) {
    return 15;
  }

  return 8; // Default for unknown tool types
}

/**
 * Extract source types from stage messages for display
 */
function getSourceTypes(stages: string[]): string {
  const types: string[] = [];

  for (const stage of stages) {
    const lower = stage.toLowerCase();
    if (lower.includes("reddit") && !types.includes("Reddit")) {
      types.push("Reddit");
    } else if (lower.includes("seo") && !types.includes("SEO")) {
      types.push("SEO");
    } else if (
      (lower.includes("competitor") || lower.includes("scrape") || lower.includes("reading")) &&
      !types.includes("Competitors")
    ) {
      types.push("Competitors");
    } else if (lower.includes("market") && !types.includes("Market data")) {
      types.push("Market data");
    } else if (lower.includes("etsy") && !types.includes("Etsy")) {
      types.push("Etsy");
    } else if (lower.includes("keyword") && !types.includes("Keywords")) {
      types.push("Keywords");
    } else if (
      (lower.includes("feedback") || lower.includes("context") || lower.includes("original")) &&
      !types.includes("Your feedback")
    ) {
      types.push("Your feedback");
    } else if (
      (lower.includes("history") || lower.includes("loading")) &&
      !types.includes("Past strategies")
    ) {
      types.push("Past strategies");
    }
  }

  if (types.length === 0) return "";
  if (types.length <= 2) return types.join(", ");
  return types.slice(0, 2).join(", ") + "...";
}

function TipIcon({ type }: { type: TipType }) {
  const iconClass = "w-5 h-5 text-cta flex-shrink-0 mt-0.5";
  switch (type) {
    case "tip":
      return <Lightbulb className={iconClass} />;
    case "reflection":
      return <HelpCircle className={iconClass} />;
    case "preview":
      return <Sparkles className={iconClass} />;
    default:
      return <Lightbulb className={iconClass} />;
  }
}
