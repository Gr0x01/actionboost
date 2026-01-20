"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { config } from "@/lib/config";
import { Header, Footer, ResultsLayout } from "@/components/layout";
import { ResultsContent, StatusMessage, MagicLinkBanner } from "@/components/results";
import { parseStrategy, type ParsedStrategy } from "@/lib/markdown/parser";
import { FREE_TIER_LOCKED_SECTIONS } from "@/lib/constants/toc-sections";

type AuditStatus = "pending" | "processing" | "complete" | "failed";

interface FreeAuditData {
  id: string;
  email: string;
  status: AuditStatus;
  output: string | null;
  created_at: string;
  completed_at: string | null;
}

function UpsellBanner() {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="border-[3px] border-foreground bg-surface p-6 shadow-[6px_6px_0_0_rgba(44,62,80,1)] mt-8 mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <p className="font-mono text-[10px] tracking-[0.15em] text-cta uppercase font-semibold mb-1">
            Unlock the full playbook
          </p>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Ready for the complete playbook?
          </h3>
          <p className="text-foreground/70 text-sm">
            The full analysis includes Channel Strategy, This Week actions, 30-Day Roadmap, Metrics Dashboard, and Content Templates.
          </p>
        </div>
        <button
          onClick={() => {
            posthog?.capture("free_audit_upsell_clicked");
            router.push("/start");
          }}
          className="flex items-center gap-2 px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100 whitespace-nowrap"
        >
          Get Full Action Plan — {config.singlePrice}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function UpgradeCTA() {
  const router = useRouter();
  const posthog = usePostHog();

  const lockedSections = [
    "Channel Strategy",
    "Stop Doing",
    "Start Doing",
    "This Week",
    "30-Day Roadmap",
    "Metrics Dashboard",
    "Content Templates",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mt-12 pt-8 pb-8 border-t-[3px] border-foreground text-center"
    >
      <p className="font-mono text-xs tracking-[0.1em] text-foreground/60 uppercase mb-3">
        The full action plan also includes
      </p>
      <p className="text-foreground font-medium mb-6">
        {lockedSections.join(" · ")}
      </p>
      <button
        onClick={() => {
          posthog?.capture("free_audit_upgrade_clicked");
          router.push("/start");
        }}
        className="inline-flex items-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
      >
        Get the Full Playbook — {config.singlePrice}
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
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
    const storedToken = sessionStorage.getItem(storageKey);

    if (urlToken) {
      // Store token and clean URL to prevent referrer leakage
      sessionStorage.setItem(storageKey, urlToken);
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

  const [freeAudit, setFreeAudit] = useState<FreeAuditData | null>(null);
  const [strategy, setStrategy] = useState<ParsedStrategy | null>(null);
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

        // Parse strategy if complete
        if (data.freeAudit.status === "complete" && data.freeAudit.output) {
          const parsed = parseStrategy(data.freeAudit.output);
          setStrategy(parsed);
          if (!trackedRef.current) {
            trackedRef.current = true;
            posthog?.capture("free_audit_viewed", {
              free_audit_id: freeAuditId,
            });
          }
        }

        setLoading(false);
      } catch {
        setError("Failed to load audit");
        setLoading(false);
      }
    };

    fetchFreeAudit();
  }, [freeAuditId, token, posthog]);

  // Poll for status if pending/processing
  useEffect(() => {
    if (!freeAuditId || !token) return;
    if (statusRef.current === "complete" || statusRef.current === "failed") return;

    let pollCount = 0;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      pollCount++;

      try {
        const res = await fetch(`/api/free-audit/${freeAuditId}?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const data = await res.json();

          if (data.freeAudit.status === "complete") {
            stopped = true;
            setFreeAudit(data.freeAudit);
            if (data.freeAudit.output) {
              setStrategy(parseStrategy(data.freeAudit.output));
              if (!trackedRef.current) {
                trackedRef.current = true;
                posthog?.capture("free_audit_viewed", {
                  free_audit_id: freeAuditId,
                });
              }
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
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted mb-4">Invalid or expired link</p>
            <a href="/start" className="text-primary hover:underline">Start a new audit →</a>
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
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <StatusMessage
            status={freeAudit.status as "pending" | "processing" | "failed"}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Filter out premium sections (Stop/Start Doing) for free version
  const freeStrategy: ParsedStrategy | null = strategy ? {
    ...strategy,
    stopDoing: null,
    startDoing: null,
  } : null;

  const magicLinkBanner = isNewCheckout ? <MagicLinkBanner /> : undefined;

  const topContent = (
    <>
      {magicLinkBanner}
      <UpsellBanner />
    </>
  );

  // Success state - render free results with upsell
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {freeStrategy && (
        <ResultsLayout
          toc={{
            strategy: freeStrategy,
            lockedSectionIds: FREE_TIER_LOCKED_SECTIONS,
          }}
          slots={{
            afterToc: topContent,
            bottomCta: <UpgradeCTA />,
          }}
        >
          <ResultsContent strategy={freeStrategy} />
        </ResultsLayout>
      )}

      <Footer />
    </div>
  );
}

export default function FreeResultsPage() {
  return <FreeResultsPageContent />;
}
