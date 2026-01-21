"use client";

import { useState, useEffect } from "react";
import { Check, X, Lightbulb, HelpCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  PIPELINE_STAGES,
  PROCESSING_TIPS,
  TIP_ROTATION_INTERVAL,
  type TipType,
} from "@/lib/constants/processing-content";
import type { PipelineStage } from "@/lib/types/database";

type Status = "pending" | "processing" | "complete" | "failed";

interface StatusMessageProps {
  status: Status;
  stage?: PipelineStage | null;
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
            href="mailto:team@actionboo.st"
            className="rounded-xl px-6 py-3 bg-transparent text-foreground font-bold border-2 border-foreground/30 hover:border-foreground transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Pending/processing state - enhanced with stages and tips
  const currentStageIndex = stage
    ? PIPELINE_STAGES.findIndex((s) => s.key === stage)
    : 0;
  const currentStageLabel =
    PIPELINE_STAGES[currentStageIndex >= 0 ? currentStageIndex : 0]?.label ||
    "Preparing...";
  const currentTip = PROCESSING_TIPS[currentTipIndex];

  return (
    <div className="max-w-lg mx-auto text-center py-16 px-6">
      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
        {message || "Generating your action plan"}
        <span className="inline-block w-8 text-left animate-pulse">...</span>
      </h1>

      {/* Current stage label */}
      <p className="text-foreground/60 mb-8">{currentStageLabel}</p>

      {/* Stage Progress Bar */}
      <div className="mb-10">
        <StageProgressBar
          currentIndex={currentStageIndex >= 0 ? currentStageIndex : 0}
        />
      </div>

      {/* Rotating Tip Card */}
      <div className="rounded-2xl border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)] text-left">
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

      {/* Time estimate */}
      <p className="text-sm text-foreground/40 font-mono mt-6">
        typically 2-3 minutes
      </p>
    </div>
  );
}

function StageProgressBar({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {PIPELINE_STAGES.map((stage, index) => (
        <div key={stage.key} className="flex items-center">
          {/* Stage dot */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-4 h-4 transition-all duration-300 ${
                index < currentIndex
                  ? "bg-green-600"
                  : index === currentIndex
                  ? "bg-cta animate-[stage-pulse_1.5s_ease-in-out_infinite]"
                  : "bg-foreground/20"
              }`}
            />
            <span
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                index <= currentIndex
                  ? "text-foreground"
                  : "text-foreground/40"
              }`}
            >
              {stage.shortLabel}
            </span>
          </div>

          {/* Connector line */}
          {index < PIPELINE_STAGES.length - 1 && (
            <div
              className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 ${
                index < currentIndex ? "bg-green-600" : "bg-foreground/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
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
