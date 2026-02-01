"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";
import { config } from "@/lib/config";
import { Header, Footer } from "@/components/layout";
import { StatusMessage, MagicLinkBanner, ResultsHeader, FreeAuditPending } from "@/components/results";
import { FreeInsightsView, FreeTasksEmptyState } from "@/components/results/free";
import type { StructuredOutput } from "@/lib/ai/formatter-types";
import type { TabType } from "@/lib/storage/visitTracking";

type AuditStatus = "pending" | "processing" | "complete" | "failed";

interface FreeAuditData {
  id: string;
  email: string;
  status: AuditStatus;
  output: string | null;
  structured_output: StructuredOutput | null;
  created_at: string;
  completed_at: string | null;
}


function FreeResultsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const freeAuditId = params.id as string;
  const isNewCheckout = searchParams.get("new") === "1";
  const trackedRef = useRef(false);
  const pageLoadTime = useRef(Date.now());
  const statusRef = useRef<AuditStatus | null>(null);

  // Token handling: prefer sessionStorage, fallback to URL param
  // This prevents token leakage via referrer headers
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    if (!freeAuditId) return;

    const storageKey = `audit_token_${freeAuditId}`;
    const urlToken = searchParams.get("token");

    // sessionStorage may not be available in some contexts (private browsing edge cases)
    let storedToken: string | null = null;
    try {
      storedToken = sessionStorage.getItem(storageKey);
    } catch {
      // sessionStorage not available
    }

    if (urlToken) {
      // Store token and clean URL to prevent referrer leakage
      try {
        sessionStorage.setItem(storageKey, urlToken);
      } catch {
        // sessionStorage not available
      }
      setToken(urlToken);

      // Remove token from URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    } else if (storedToken) {
      setToken(storedToken);
    }

    setTokenChecked(true);
  }, [freeAuditId, searchParams]);

  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [freeAudit, setFreeAudit] = useState<FreeAuditData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep statusRef in sync with freeAudit.status
  statusRef.current = freeAudit?.status ?? null;

  // Track time spent on free results page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (trackedRef.current) {
        const timeSpent = Math.round((Date.now() - pageLoadTime.current) / 1000);
        posthog?.capture("free_audit_time_spent", {
          free_audit_id: freeAuditId,
          seconds: timeSpent,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [posthog, freeAuditId]);

  useEffect(() => {
    if (!freeAuditId || !token) return;

    const fetchFreeAudit = async () => {
      try {
        const res = await fetch(`/api/free-audit/${freeAuditId}?token=${encodeURIComponent(token)}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Free audit not found");
          } else if (res.status === 403) {
            setError("Invalid or expired link");
          } else {
            setError("Failed to load audit");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setFreeAudit(data.freeAudit);

        // Track view if complete
        if (data.freeAudit.status === "complete" && !trackedRef.current) {
          trackedRef.current = true;
          posthog?.capture("free_audit_viewed", {
            free_audit_id: freeAuditId,
          });
        }

        setLoading(false);
      } catch {
        setError("Failed to load audit");
        setLoading(false);
      }
    };

    fetchFreeAudit();
  }, [freeAuditId, token, posthog]);

  // Poll for status if pending/processing (skips first iteration since initial fetch already ran)
  useEffect(() => {
    if (!freeAuditId || !token) return;
    if (statusRef.current === "complete" || statusRef.current === "failed") return;

    let pollCount = 0;
    let stopped = false;
    let isFirstPoll = true;

    const poll = async () => {
      if (stopped) return;
      pollCount++;

      // Skip first poll — the initial fetch (above) already loaded the data
      if (isFirstPoll) {
        isFirstPoll = false;
        if (!stopped && pollCount < 100) {
          setTimeout(poll, 2000);
        }
        return;
      }

      try {
        const res = await fetch(`/api/free-audit/${freeAuditId}?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const data = await res.json();

          if (data.freeAudit.status === "complete") {
            stopped = true;
            setFreeAudit(data.freeAudit);
            if (!trackedRef.current) {
              trackedRef.current = true;
              posthog?.capture("free_audit_viewed", {
                free_audit_id: freeAuditId,
              });
            }
            return;
          } else if (data.freeAudit.status === "failed") {
            stopped = true;
            setFreeAudit((prev) => (prev ? { ...prev, status: "failed" } : null));
            return;
          }
        }
      } catch {
        // Continue polling on network errors
      }

      if (!stopped && pollCount < 100) {
        setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      stopped = true;
    };
  }, [freeAuditId, token, posthog]);

  // Missing token - invalid link (wait for token check to complete first)
  if (tokenChecked && !token) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="rounded-2xl border-[3px] border-foreground bg-surface p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] text-center max-w-md">
            <p className="font-mono text-[10px] tracking-[0.15em] text-foreground/60 uppercase font-semibold mb-2">
              Link expired
            </p>
            <p className="text-foreground font-medium mb-6">
              This link is no longer valid. Start a fresh audit to get your growth strategy.
            </p>
            <a
              href="/start"
              className="rounded-xl inline-flex items-center gap-2 px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
            >
              Start a new audit
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading your mini-audit...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !freeAudit) {
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
  if (freeAudit.status !== "complete") {
    // Failed state uses StatusMessage for error display
    if (freeAudit.status === "failed") {
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

    // Pending/processing - engaging loading state with simulated progress
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <FreeAuditPending />
        </main>
        <Footer />
      </div>
    );
  }

  // Check if we have structured output for the new dashboard-style rendering
  const hasStructuredOutput = freeAudit.structured_output &&
    (freeAudit.structured_output.positioning ||
     (freeAudit.structured_output.discoveries && freeAudit.structured_output.discoveries.length > 0));

  // Extract product name from input for display
  const planName = freeAudit.structured_output?.positioning?.summary
    ? freeAudit.structured_output.positioning.summary.slice(0, 50)
    : "Your Business";

  // Success state - render positioning preview with paywall
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Sticky results header - same as paid, with disabled features */}
      <ResultsHeader
        plan={{
          id: freeAudit.id,
          name: planName,
          updatedAt: freeAudit.created_at,
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exportProps={{
          markdown: "",
          runId: freeAudit.id,
          shareSlug: null,
          disabled: true,
        }}
        showCalendar={false}
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
          {/* Magic link banner for new checkouts */}
          {isNewCheckout && <MagicLinkBanner />}

          {/* Render tab content */}
          {activeTab === "dashboard" ? (
            <FreeTasksEmptyState freeAuditId={freeAudit.id} token={token!} />
          ) : hasStructuredOutput ? (
            <FreeInsightsView
              structuredOutput={freeAudit.structured_output!}
              freeAuditId={freeAudit.id}
              token={token!}
            />
          ) : (
            <FallbackContent />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Fallback when structured output extraction failed
 * Shows a simple message with CTA to get the full plan
 */
function FallbackContent() {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <div className="text-center py-12">
      <p className="font-mono text-[10px] tracking-[0.15em] text-foreground/60 uppercase font-semibold mb-2">
        Preview Ready
      </p>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        We&apos;ve analyzed your business
      </h2>
      <p className="text-foreground/70 mb-8 max-w-md mx-auto">
        Get your full marketing strategy with prioritized actions, competitor analysis, and weekly tasks.
      </p>
      <button
        onClick={() => {
          posthog?.capture("free_audit_fallback_cta_clicked");
          router.push("/start");
        }}
        className="rounded-xl inline-flex items-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg border-b-4 border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100"
      >
        Get my full plan — {config.singlePrice}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function FreeResultsPage() {
  return <FreeResultsPageContent />;
}
