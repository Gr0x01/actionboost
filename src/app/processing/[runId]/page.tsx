"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header, Footer } from "@/components/layout";
import { StatusMessage } from "@/components/results";

type RunStatus = "pending" | "processing" | "complete" | "failed";

interface RunData {
  status: RunStatus;
  stage?: string | null;
}

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
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  }, [isStripeSession, paramId, resolvedRunId, router, isNewCheckout]);

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
        setStage(data.stage || null);

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
  }, [runId, status, router, isNewCheckout]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <StatusMessage
          status={status}
          stage={stage}
          submessage={error || undefined}
        />
      </main>

      <Footer />
    </div>
  );
}
