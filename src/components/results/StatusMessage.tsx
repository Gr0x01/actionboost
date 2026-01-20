"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";

type Status = "pending" | "processing" | "complete" | "failed";

interface StatusMessageProps {
  status: Status;
  message?: string;
  submessage?: string;
}

export function StatusMessage({ status, message, submessage }: StatusMessageProps) {
  // Complete state
  if (status === "complete") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto border-[3px] border-green-600 bg-green-600 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
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
          <div className="w-20 h-20 mx-auto border-[3px] border-red-500 bg-red-500 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
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
            className="px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
          >
            Try Again
          </Link>
          <a
            href="mailto:team@actionboo.st"
            className="px-6 py-3 bg-transparent text-foreground font-bold border-2 border-foreground/30 hover:border-foreground transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Pending/processing state
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-6">
      <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
        {message || (status === "pending" ? "Preparing your action plan" : "Generating your action plan")}
        <span className="inline-block w-8 text-left animate-pulse">...</span>
      </h1>
      <p className="text-foreground/60 max-w-md mx-auto">
        {submessage || (status === "pending"
          ? "Setting up the analysis."
          : "Analyzing your business, researching competitors, crafting personalized tactics.")}
      </p>

      <div className="mt-10">
        <div className="flex justify-center items-center gap-4">
          <StepIndicator
            label="Research"
            active={status === "pending" || status === "processing"}
            complete={status === "processing"}
          />
          <div className="w-8 h-0.5 bg-foreground/20" />
          <StepIndicator
            label="Analysis"
            active={status === "processing"}
            complete={false}
          />
          <div className="w-8 h-0.5 bg-foreground/20" />
          <StepIndicator
            label="Action Plan"
            active={false}
            complete={false}
          />
        </div>

        <p className="text-sm text-foreground/40 font-mono mt-6">
          This typically takes 2-3 minutes
        </p>
      </div>
    </div>
  );
}

function StepIndicator({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-3 h-3 transition-colors ${
          complete
            ? "bg-green-600"
            : active
            ? "bg-cta"
            : "bg-foreground/20"
        }`}
      />
      <span
        className={`text-xs font-bold ${
          active || complete ? "text-foreground" : "text-foreground/40"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
