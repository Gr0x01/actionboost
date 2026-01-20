"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header, Footer } from "@/components/layout";
import { Check, X } from "lucide-react";

type RunStatus = "pending" | "processing" | "complete" | "failed";

interface RunData {
  status: RunStatus;
}

const STATUS_MESSAGES: Record<RunStatus, string> = {
  pending: "Preparing your analysis",
  processing: "Generating your action plan",
  complete: "Action plan ready!",
  failed: "Something went wrong",
};

const STATUS_SUBMESSAGES: Record<RunStatus, string> = {
  pending: "Setting up our AI agents",
  processing: "Analyzing your business, researching competitors, crafting personalized tactics.",
  complete: "Redirecting you to your results",
  failed: "Please try again or contact support",
};

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const paramId = params.runId as string;
  const isNewCheckout = searchParams.get("new") === "1";

  // If paramId is a Stripe session, we need to resolve it to actual runId
  const isStripeSession = paramId?.startsWith("cs_");
  const [resolvedRunId, setResolvedRunId] = useState<string | null>(
    isStripeSession ? null : paramId
  );
  const runId = resolvedRunId;

  const [status, setStatus] = useState<RunStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState("");
  const trackedStart = useRef(false);
  const trackedStatuses = useRef<Set<string>>(new Set());
  const sessionRetryCount = useRef(0);

  // Resolve Stripe session to actual run ID
  useEffect(() => {
    if (!isStripeSession || resolvedRunId) return;

    const MAX_RETRIES = 30; // 60 seconds total (2s intervals)

    const resolveSession = async () => {
      // Check if we've exceeded max retries
      if (sessionRetryCount.current >= MAX_RETRIES) {
        setError("Payment processing is taking longer than expected. Please refresh or contact support.");
        setStatus("failed");
        return;
      }

      try {
        const res = await fetch(`/api/runs/by-checkout/${paramId}`);
        if (res.ok) {
          const data = await res.json();
          // Redirect to the actual run ID URL for cleaner history
          const newParam = isNewCheckout ? "?new=1" : "";
          router.replace(`/processing/${data.runId}${newParam}`);
        } else {
          // 404 = webhook hasn't processed yet, will retry
          sessionRetryCount.current++;
        }
      } catch {
        // Network error, will retry
        sessionRetryCount.current++;
      }
    };

    // Try immediately
    resolveSession();

    // Retry every 2 seconds until resolved
    const interval = setInterval(resolveSession, 2000);
    return () => clearInterval(interval);
  }, [isStripeSession, paramId, resolvedRunId, router]);

  // Track processing started
  useEffect(() => {
    if (runId && !trackedStart.current) {
      posthog?.capture("run_processing_started", { run_id: runId });
      trackedStart.current = true;
    }
  }, [runId, posthog]);

  // Track status changes
  useEffect(() => {
    if (!trackedStatuses.current.has(status)) {
      trackedStatuses.current.add(status);
      posthog?.capture("run_status_changed", { run_id: runId, status });

      if (status === "complete") {
        posthog?.capture("run_completed", { run_id: runId });
      } else if (status === "failed") {
        posthog?.capture("run_failed", { run_id: runId, error });
      }
    }
  }, [status, runId, error, posthog]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll for status
  useEffect(() => {
    if (!runId) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/runs/${runId}/status`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Run not found");
            setStatus("failed");
            return;
          }
          throw new Error("Failed to fetch status");
        }

        const data: RunData = await res.json();
        setStatus(data.status);

        if (data.status === "complete") {
          // Short delay before redirect for UX
          setTimeout(() => {
            const newParam = isNewCheckout ? "?new=1" : "";
            router.push(`/results/${runId}${newParam}`);
          }, 1500);
        } else if (data.status === "failed") {
          setError("Processing failed. Please try again.");
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Don't set failed state on network errors, just retry
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 3 seconds while pending/processing
    const interval = setInterval(() => {
      if (status === "pending" || status === "processing") {
        pollStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [runId, status, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="mx-auto max-w-lg px-6 text-center">
          {/* Icon - only show for complete/failed states */}
          {(status === "complete" || status === "failed") && (
            <div className="mb-8">
              {status === "complete" ? (
                <div className="w-20 h-20 mx-auto border-[3px] border-green-600 bg-green-600 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                  <Check className="w-10 h-10 text-white" />
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto border-[3px] border-red-500 bg-red-500 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                  <X className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Status text */}
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            {STATUS_MESSAGES[status]}
            {(status === "pending" || status === "processing") && dots}
          </h1>
          <p className="text-foreground/60 max-w-md mx-auto">
            {error || STATUS_SUBMESSAGES[status]}
          </p>

          {/* Progress indicators */}
          {(status === "pending" || status === "processing") && (
            <div className="mt-10">
              {/* Step indicators */}
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
          )}

          {/* Error actions */}
          {status === "failed" && (
            <div className="mt-8">
              <button
                onClick={() => router.push("/start")}
                className="px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
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
