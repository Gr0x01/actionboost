"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header, Footer } from "@/components/layout";
import { ResultsContent, StatusMessage, MagicLinkBanner, AddContextSection } from "@/components/results";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { parseStrategy, type ParsedStrategy } from "@/lib/markdown/parser";
import type { StructuredOutput } from "@/lib/ai/formatter-types";
import { useResultsTab } from "@/lib/hooks/useResultsTab";

type RunStatus = "pending" | "processing" | "complete" | "failed";

interface RunData {
  id: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output: string | null;
  share_slug: string | null;
  completed_at: string | null;
  refinements_used: number | null;
  parent_run_id: string | null;
  root_refinements_used: number | null;
  structured_output: StructuredOutput | null;
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
  const [stage, setStage] = useState<string | null>(null);
  // Track if user is accessing via share link (not the owner)
  const isShareAccess = !!shareSlug;

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

          // Update stage for StatusMessage display
          if (data.stage) {
            setStage(data.stage);
          }

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
            stage={stage}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Extract product name for PDF title and plan display
  const productName =
    typeof run.input === "object" && run.input !== null
      ? (run.input as { productDescription?: string }).productDescription
      : undefined;

  // Check if we have dashboard data (same logic as ResultsContent)
  const hasDashboardData = run.structured_output &&
    (run.structured_output.thisWeek.days.length > 0 ||
     run.structured_output.topPriorities.length > 0);

  // Success state - render full results
  // Use DashboardResults for structured output, otherwise use traditional layout
  if (hasDashboardData && strategy) {
    return (
      <DashboardResults
        run={run}
        strategy={strategy}
        productName={productName}
        isNewCheckout={isNewCheckout}
        isShareAccess={isShareAccess}
      />
    );
  }

  // Traditional layout for runs without structured output
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {isNewCheckout && <MagicLinkBanner />}
          {strategy && (
            <>
              <ResultsContent
                strategy={strategy}
                structuredOutput={run.structured_output}
                runId={run.id}
              />
              <AddContextSection
                runId={run.id}
                refinementsUsed={run.root_refinements_used ?? run.refinements_used ?? 0}
                isOwner={!isShareAccess}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Dashboard Results - Plan-centric view with header and tabs
 */
function DashboardResults({
  run,
  strategy,
  productName,
  isNewCheckout,
  isShareAccess,
}: {
  run: RunData;
  strategy: ParsedStrategy;
  productName?: string;
  isNewCheckout: boolean;
  isShareAccess: boolean;
}) {
  // Tab state management
  const { activeTab, onTabChange } = useResultsTab({
    runId: run.id,
    isNewCheckout,
  });

  // Plan info for the header
  const planName = productName || "Your Marketing Plan";
  const planUpdatedAt = run.completed_at || new Date().toISOString();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Results Header - sticky below global header */}
      <ResultsHeader
        plan={{
          id: run.id,
          name: planName,
          updatedAt: planUpdatedAt,
        }}
        activeTab={activeTab}
        onTabChange={onTabChange}
        exportProps={{
          markdown: run.output || "",
          runId: run.id,
          shareSlug: run.share_slug,
          productName: productName?.slice(0, 50),
        }}
      />

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Magic link banner for new checkouts */}
          {isNewCheckout && <MagicLinkBanner />}

          {/* Tab content */}
          <ResultsContent
            strategy={strategy}
            structuredOutput={run.structured_output}
            runId={run.id}
            activeTab={activeTab}
          />

          {/* Add Context Section - shown to owners */}
          <div className="mt-12">
            <AddContextSection
              runId={run.id}
              refinementsUsed={run.root_refinements_used ?? run.refinements_used ?? 0}
              isOwner={!isShareAccess}
            />
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
