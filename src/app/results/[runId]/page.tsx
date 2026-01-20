"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResultsContent, StatusMessage, ExportBar, TableOfContents, MagicLinkBanner } from "@/components/results";
import { parseStrategy, type ParsedStrategy } from "@/lib/markdown/parser";

type RunStatus = "pending" | "processing" | "complete" | "failed";

interface RunData {
  id: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output: string | null;
  share_slug: string | null;
  completed_at: string | null;
}

function ResultsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const posthog = usePostHog();
  const runId = params.runId as string;
  const shareSlug = searchParams.get("share");
  const isNewCheckout = searchParams.get("new") === "1";
  const trackedRef = useRef(false);
  const pageLoadTime = useRef(Date.now());

  const [run, setRun] = useState<RunData | null>(null);
  const [strategy, setStrategy] = useState<ParsedStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Track time spent on results page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (trackedRef.current) {
        const timeSpent = Math.round((Date.now() - pageLoadTime.current) / 1000);
        posthog?.capture("results_time_spent", {
          run_id: runId,
          seconds: timeSpent,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [posthog, runId]);

  // Build API URL with share param if available
  const getApiUrl = useCallback((path: string) => {
    const url = new URL(path, window.location.origin);
    if (shareSlug) url.searchParams.set("share", shareSlug);
    return url.toString();
  }, [shareSlug]);

  useEffect(() => {
    if (!runId) return;

    const fetchRun = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/runs/${runId}`));

        if (!res.ok) {
          if (res.status === 401) {
            // Not authenticated, redirect to login
            posthog?.capture("results_error", {
              run_id: runId,
              error_type: "unauthorized",
              status_code: 401,
            });
            router.push(`/login?next=/results/${runId}`);
            return;
          }
          const errorType = res.status === 403 ? "forbidden" : res.status === 404 ? "not_found" : "fetch_failed";
          posthog?.capture("results_error", {
            run_id: runId,
            error_type: errorType,
            status_code: res.status,
          });
          if (res.status === 403) {
            setError("You don't have access to this action plan");
          } else if (res.status === 404) {
            setError("Action plan not found");
          } else {
            setError("Failed to load action plan");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setRun(data.run);

        // Parse strategy if complete
        if (data.run.status === "complete" && data.run.output) {
          const parsed = parseStrategy(data.run.output);
          setStrategy(parsed);
          if (!trackedRef.current) {
            trackedRef.current = true;
            posthog?.capture("results_viewed", {
              run_id: runId,
              via_share_link: !!shareSlug,
            });
          }
        }

        setLoading(false);
      } catch {
        posthog?.capture("results_error", {
          run_id: runId,
          error_type: "network_error",
        });
        setError("Failed to load action plan");
        setLoading(false);
      }
    };

    fetchRun();
  }, [runId, getApiUrl, router, posthog]);

  // Poll for status if pending/processing (max 100 polls = ~5 minutes)
  useEffect(() => {
    if (!runId || !run) return;
    if (run.status !== "pending" && run.status !== "processing") return;

    const MAX_POLLS = 100;
    let pollCount = 0;

    const interval = setInterval(async () => {
      pollCount++;

      // Stop polling after max attempts
      if (pollCount >= MAX_POLLS) {
        clearInterval(interval);
        setError("Action plan generation is taking longer than expected. Please refresh the page.");
        return;
      }

      try {
        const res = await fetch(getApiUrl(`/api/runs/${runId}/status`));
        if (res.ok) {
          const data = await res.json();

          if (data.status === "complete") {
            // Refetch full data
            const fullRes = await fetch(getApiUrl(`/api/runs/${runId}`));
            if (fullRes.ok) {
              const fullData = await fullRes.json();
              setRun(fullData.run);
              if (fullData.run.output) {
                setStrategy(parseStrategy(fullData.run.output));
                if (!trackedRef.current) {
                  trackedRef.current = true;
                  posthog?.capture("results_viewed", {
                    run_id: runId,
                    via_share_link: !!shareSlug,
                  });
                }
              }
            }
            clearInterval(interval);
          } else if (data.status === "failed") {
            setRun((prev) => (prev ? { ...prev, status: "failed" } : null));
            clearInterval(interval);
          }
        }
      } catch {
        // Silently continue polling on network errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [runId, run, getApiUrl]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !run) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <StatusMessage status="failed" />
        </main>
        <Footer />
      </div>
    );
  }

  // Status states (pending/processing/failed)
  if (run.status !== "complete") {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <StatusMessage
            status={run.status as "pending" | "processing" | "failed"}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Extract product name for PDF title
  const productName =
    typeof run.input === "object" && run.input !== null
      ? (run.input as { productDescription?: string }).productDescription?.slice(
          0,
          50
        )
      : undefined;

  // Success state - render full results
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto px-6">
          {/* Magic link banner for new checkouts */}
          {isNewCheckout && <MagicLinkBanner />}

          {/* Mobile TOC - full width horizontal tabs */}
          <div className="lg:hidden">
            {strategy && <TableOfContents strategy={strategy} variant="mobile" />}
          </div>

          {/* Desktop layout wrapper */}
          <div className="max-w-5xl mx-auto">
            {/* Export bar */}
            <ExportBar
              markdown={run.output || ""}
              runId={run.id}
              shareSlug={run.share_slug}
              productName={productName}
            />

            {/* Sidebar + content flex */}
            <div className="lg:flex lg:gap-12 py-8">
              {/* Desktop sidebar */}
              <div className="hidden lg:block lg:w-[180px] lg:flex-shrink-0">
                {strategy && <TableOfContents strategy={strategy} variant="desktop" />}
              </div>

              {/* Main content - extra padding for shadows on desktop */}
              <div className="flex-1 min-w-0 lg:pr-2 overflow-x-hidden">
                {strategy && <ResultsContent strategy={strategy} />}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-mesh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted">Loading...</div>
          </main>
          <Footer />
        </div>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}
