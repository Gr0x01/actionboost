"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { MessageSquarePlus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { MAX_FREE_REFINEMENTS, MIN_CONTEXT_LENGTH, MAX_CONTEXT_LENGTH } from "@/lib/types/database";

interface AddContextSectionProps {
  runId: string;
  refinementsUsed: number;
  isOwner: boolean;
}

type SectionState = "collapsed" | "expanded" | "submitting";

export function AddContextSection({
  runId,
  refinementsUsed,
  isOwner,
}: AddContextSectionProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const [state, setState] = useState<SectionState>("collapsed");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refinementsRemaining = MAX_FREE_REFINEMENTS - refinementsUsed;
  const canRefine = refinementsRemaining > 0 && isOwner;
  const contextLength = context.trim().length;
  const isValidLength = contextLength >= MIN_CONTEXT_LENGTH && contextLength <= MAX_CONTEXT_LENGTH;

  // Don't render if user doesn't own this run or has no refinements left
  if (!isOwner || refinementsRemaining <= 0) {
    return null;
  }

  const handleExpand = () => {
    setState("expanded");
    posthog?.capture("refinement_started", { run_id: runId });
  };

  const handleCollapse = () => {
    setState("collapsed");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isValidLength || state === "submitting") return;

    setState("submitting");
    setError(null);

    try {
      const response = await fetch(`/api/runs/${runId}/add-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalContext: context.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setState("expanded");
        return;
      }

      // Success - redirect to the new run's results page
      posthog?.capture("refinement_completed", {
        run_id: data.runId,
        parent_run_id: runId,
      });

      router.push(`/results/${data.runId}`);
    } catch (err) {
      setError("Failed to submit. Please try again.");
      setState("expanded");
      console.error("Refinement submit error:", err);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t-2 border-foreground/10">
      {state === "collapsed" ? (
        <button
          onClick={handleExpand}
          className="group w-full text-left"
        >
          <div className="flex items-center justify-between p-6 border-2 border-foreground/20 hover:border-foreground/40 bg-surface/50 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <MessageSquarePlus className="h-5 w-5 text-foreground/50 group-hover:text-foreground/70 transition-colors" />
              <div>
                <p className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                  Something missing? Not quite right?
                </p>
                <p className="text-sm text-foreground/50">
                  Tell us what we missed and get an improved strategy.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-foreground/40">
                {refinementsRemaining} of {MAX_FREE_REFINEMENTS} remaining
              </span>
              <ChevronDown className="h-5 w-5 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
            </div>
          </div>
        </button>
      ) : (
        <div className="border-[3px] border-foreground bg-background shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-foreground/20">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-foreground/70" />
              <span className="font-mono text-xs tracking-[0.1em] text-foreground/60 uppercase">
                Tell Us More
              </span>
            </div>
            <button
              onClick={handleCollapse}
              disabled={state === "submitting"}
              className="p-1 text-foreground/50 hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-foreground/70 mb-4">
              What did we get wrong? What context would make this strategy sharper?
              The more specific you are, the better your updated strategy will be.
            </p>

            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={state === "submitting"}
              placeholder="e.g., 'We already tried content marketing for 6 months - it didn't work because our audience isn't searching for solutions yet. Also, we have a $5K/month marketing budget you should factor in.'"
              className="w-full h-32 p-4 text-sm border-2 border-foreground/30 bg-white focus:border-foreground focus:outline-none resize-none font-sans placeholder:text-foreground/30 disabled:opacity-50 disabled:bg-gray-50"
            />

            {/* Character count */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={contextLength < MIN_CONTEXT_LENGTH ? "text-foreground/40" : "text-foreground/60"}>
                {contextLength < MIN_CONTEXT_LENGTH && (
                  <span>At least {MIN_CONTEXT_LENGTH} characters needed</span>
                )}
                {contextLength >= MIN_CONTEXT_LENGTH && contextLength <= MAX_CONTEXT_LENGTH && (
                  <span className="text-green-600">{contextLength} characters</span>
                )}
                {contextLength > MAX_CONTEXT_LENGTH && (
                  <span className="text-red-600">{contextLength} / {MAX_CONTEXT_LENGTH} (too long)</span>
                )}
              </span>
              <span className="font-mono text-foreground/40">
                {refinementsRemaining} of {MAX_FREE_REFINEMENTS} remaining
              </span>
            </div>

            {/* Error message */}
            {error && (
              <p className="mt-3 text-sm text-red-600 font-medium">
                {error}
              </p>
            )}

            {/* Submit button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!isValidLength || state === "submitting"}
                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-foreground bg-surface border-[3px] border-foreground shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[5px_5px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0"
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Improved Strategy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
