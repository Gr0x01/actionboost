"use client";

import { Loader2, AlertCircle, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Status = "pending" | "processing" | "failed";

interface StatusMessageProps {
  status: Status;
}

export function StatusMessage({ status }: StatusMessageProps) {
  if (status === "failed") {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6">
        {/* Error icon with glow */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-light text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="text-muted mb-8">
          We encountered an error while generating your action plan.
          <br />
          Please try again or contact support.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/start">
            <Button>Try Again</Button>
          </Link>
          <a href="mailto:support@actionboo.st">
            <Button variant="ghost">Contact Support</Button>
          </a>
        </div>
      </div>
    );
  }

  // Processing/pending state
  return (
    <div className="max-w-md mx-auto text-center py-16 px-6">
      {/* Animated loading visual */}
      <div className="relative inline-flex mb-10">
        {/* Outer glow ring - pulses */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />

        {/* Spinning outer ring */}
        <div className="relative h-24 w-24">
          <svg className="absolute inset-0 h-24 w-24 animate-spin" style={{ animationDuration: "3s" }}>
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="20 10"
              className="text-primary/30"
            />
          </svg>

          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {status === "pending" ? (
              <Clock className="h-10 w-10 text-primary/70" />
            ) : (
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-light text-foreground mb-2">
        {status === "pending"
          ? "Preparing your action plan..."
          : "Generating your action plan..."}
      </h1>

      <p className="text-muted mb-8">
        {status === "pending"
          ? "Setting up the analysis. This usually takes a moment."
          : "Analyzing your business, researching competitors, crafting personalized tactics."}
      </p>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-8 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              status === "processing" ? "bg-green-500" : "bg-primary animate-pulse"
            }`}
          />
          <span className={status === "processing" ? "text-green-500" : "text-primary"}>
            Research
          </span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div className="flex flex-col items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              status === "processing" ? "bg-primary animate-pulse" : "bg-border"
            }`}
          />
          <span className={status === "processing" ? "text-primary" : "text-muted"}>
            Analysis
          </span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-border" />
          <span className="text-muted">Action Plan</span>
        </div>
      </div>

      {/* Time estimate */}
      <p className="mt-8 text-xs text-muted/70">
        This typically takes 2-3 minutes
      </p>
    </div>
  );
}
