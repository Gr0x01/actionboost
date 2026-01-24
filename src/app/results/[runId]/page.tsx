"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header, Footer } from "@/components/layout";
import { ResultsContent, StatusMessage, MagicLinkBanner } from "@/components/results";
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
              const runData = fullData.run;

              // Check if we have valid dashboard data
              const hasDashboard = runData.structured_output &&
                (runData.structured_output.thisWeek?.days?.length > 0 ||
                 runData.structured_output.topPriorities?.length > 0);

              // If complete but no dashboard data yet, keep polling (max 5 more cycles)
              // This handles race conditions where status is set before structured_output is readable
              if (!hasDashboard && pollCount < MAX_POLLS - 5) {
                console.log('[Results] Status complete but no dashboard data yet, continuing to poll...');
                return; // Don't clear interval, keep polling
              }

              setRun(runData);
              if (runData.output) {
                setStrategy(parseStrategy(runData.output));
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

  // Legacy run without structured output - show apology page
  if (!run.structured_output) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-6 py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              We upgraded your experience
            </h1>
            <p className="text-foreground/70 mb-6">
              This plan was created before our new dashboard. We&apos;ve added 3 free credits
              to your account so you can generate a fresh plan with the improved experience.
            </p>
            <a
              href="/start"
              className="inline-block bg-cta text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Create New Plan
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Always use dashboard view
  return (
    <DashboardResults
      run={run}
      strategy={strategy!}
      productName={productName}
      isNewCheckout={isNewCheckout}
      isShareAccess={isShareAccess}
    />
  );
}

interface UserRun {
  id: string;
  status: string;
  input: { productDescription?: string } | null;
  created_at: string;
  completed_at: string | null;
  parent_run_id: string | null;
}

/**
 * Get the latest version of each plan chain
 * - Groups runs by their root (original plan)
 * - Returns only the most recent run in each chain
 * - Excludes intermediate refinements
 */
function getLatestPlans(runs: UserRun[], currentRunId: string): Plan[] {
  // Build parent->children map
  const childrenMap = new Map<string, UserRun[]>();
  const rootRuns: UserRun[] = [];

  runs.forEach((run) => {
    if (run.status !== "complete") return;

    if (run.parent_run_id) {
      const siblings = childrenMap.get(run.parent_run_id) || [];
      siblings.push(run);
      childrenMap.set(run.parent_run_id, siblings);
    } else {
      rootRuns.push(run);
    }
  });

  // For each root, find the latest in its chain
  const latestPlans: Plan[] = [];

  rootRuns.forEach((root) => {
    // Walk down the chain to find the leaf (most recent refinement)
    let current = root;
    let children = childrenMap.get(current.id);

    while (children && children.length > 0) {
      // Sort by date, take most recent
      children.sort((a, b) =>
        new Date(b.completed_at || b.created_at).getTime() -
        new Date(a.completed_at || a.created_at).getTime()
      );
      current = children[0];
      children = childrenMap.get(current.id);
    }

    // Skip if this is the current run
    if (current.id === currentRunId) return;

    latestPlans.push({
      id: current.id,
      name: current.input?.productDescription || "Marketing Plan",
      updatedAt: current.completed_at || current.created_at,
    });
  });

  // Sort by date (newest first)
  latestPlans.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return latestPlans;
}

interface Plan {
  id: string;
  name: string;
  updatedAt: string;
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
  const [otherPlans, setOtherPlans] = useState<Plan[]>([]);

  // Tab state management
  const { activeTab, onTabChange } = useResultsTab({
    runId: run.id,
    isNewCheckout,
  });

  // Fetch user's other runs for the plan switcher
  useEffect(() => {
    // Don't fetch for share access (not the owner)
    if (isShareAccess) return;

    async function fetchUserRuns() {
      try {
        const res = await fetch("/api/user/runs");
        if (!res.ok) return;

        const data = await res.json();
        const runs = data.runs as UserRun[];

        // Get only the latest version of each plan chain
        const plans = getLatestPlans(runs, run.id);
        setOtherPlans(plans);
      } catch {
        // Silently fail - dropdown just won't show other plans
      }
    }

    fetchUserRuns();
  }, [run.id, isShareAccess]);

  // Plan info for the header
  const planName = productName || "Your Marketing Plan";
  const planUpdatedAt = run.completed_at || new Date().toISOString();

  // Refinement tracking
  const refinementsUsed = run.root_refinements_used ?? run.refinements_used ?? 0;
  const isOwner = !isShareAccess;

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
        otherPlans={otherPlans}
        activeTab={activeTab}
        onTabChange={onTabChange}
        exportProps={{
          markdown: run.output || "",
          runId: run.id,
          shareSlug: run.share_slug,
          productName: productName?.slice(0, 50),
        }}
        refinementProps={{
          refinementsUsed,
          isOwner,
        }}
      />

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-12 py-8 md:py-16">
          {/* Magic link banner for new checkouts */}
          {isNewCheckout && <MagicLinkBanner />}

          {/* Tab content */}
          <ResultsContent
            strategy={strategy}
            structuredOutput={run.structured_output}
            runId={run.id}
            activeTab={activeTab}
            refinementsUsed={refinementsUsed}
            isOwner={isOwner}
          />
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
