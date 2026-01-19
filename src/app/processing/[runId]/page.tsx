"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header, Footer } from "@/components/layout";
import { Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

type RunStatus = "pending" | "processing" | "complete" | "failed";

interface RunData {
  status: RunStatus;
}

const STATUS_MESSAGES: Record<RunStatus, string> = {
  pending: "Preparing your analysis...",
  processing: "Generating your action plan...",
  complete: "Action plan ready!",
  failed: "Something went wrong",
};

const STATUS_SUBMESSAGES: Record<RunStatus, string> = {
  pending: "Setting up our AI agents",
  processing: "Analyzing your business, researching competitors, crafting tactics",
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
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="mx-auto max-w-lg px-6 text-center">
          {/* Animated visual */}
          <div className="relative mb-10">
            {/* Outer glow ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full ${
                  status === "failed"
                    ? "bg-red-500/10"
                    : status === "complete"
                    ? "bg-green-500/20"
                    : "bg-primary/10"
                } animate-pulse`}
              />
            </div>

            {/* Spinning ring */}
            {(status === "pending" || status === "processing") && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin" />
              </div>
            )}

            {/* Center icon */}
            <div className="relative flex items-center justify-center h-32">
              {status === "complete" ? (
                <CheckCircle className="w-16 h-16 text-green-500 animate-scale-in" />
              ) : status === "failed" ? (
                <AlertCircle className="w-16 h-16 text-red-500 animate-scale-in" />
              ) : (
                <div className="relative">
                  <Sparkles className="w-14 h-14 text-primary animate-pulse" />
                  <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-cta animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Status text */}
          <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
            {STATUS_MESSAGES[status]}
            {(status === "pending" || status === "processing") && dots}
          </h1>
          <p className="text-muted animate-fade-in stagger-1">
            {error || STATUS_SUBMESSAGES[status]}
          </p>

          {/* Progress indicators */}
          {(status === "pending" || status === "processing") && (
            <div className="mt-10 animate-fade-in stagger-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted mb-4">
                <span>This usually takes 2-3 minutes</span>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-3">
                <StepIndicator
                  label="Research"
                  active={status === "pending" || status === "processing"}
                  complete={status === "processing"}
                />
                <StepIndicator
                  label="Analysis"
                  active={status === "processing"}
                  complete={false}
                />
                <StepIndicator
                  label="Action Plan"
                  active={false}
                  complete={false}
                />
              </div>
            </div>
          )}

          {/* Error actions */}
          {status === "failed" && (
            <div className="mt-8 animate-fade-in stagger-2">
              <button
                onClick={() => router.push("/start")}
                className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Fun facts while waiting */}
          {(status === "pending" || status === "processing") && (
            <div className="mt-12 p-6 rounded-xl bg-surface/50 border border-border animate-fade-in stagger-3">
              <p className="text-sm text-muted italic">
                "The best growth strategies come from understanding what makes your
                business unique, not copying what worked for others."
              </p>
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
        className={`w-3 h-3 rounded-full transition-all duration-500 ${
          complete
            ? "bg-green-500"
            : active
            ? "bg-primary animate-pulse"
            : "bg-border"
        }`}
      />
      <span
        className={`text-xs ${
          active || complete ? "text-foreground" : "text-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
