"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { config } from "@/lib/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResultsContent, StatusMessage, TableOfContents, MagicLinkBanner } from "@/components/results";
import { parseStrategy, type ParsedStrategy } from "@/lib/markdown/parser";

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
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Ready for the complete playbook?
          </h3>
          <p className="text-muted text-sm">
            The full analysis includes your Quick Wins, 30-Day Roadmap, and specific metrics to track.
          </p>
        </div>
        <button
          onClick={() => {
            posthog?.capture("free_audit_upsell_clicked");
            router.push("/start");
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
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
    "Stop Doing",
    "Start Doing",
    "Quick Wins",
    "30-Day Roadmap",
    "Metrics to Track",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mt-12 pt-8 border-t border-border text-center"
    >
      <p className="text-muted text-sm mb-2">
        The full action plan also includes:
      </p>
      <p className="text-foreground font-medium mb-6">
        {lockedSections.join(" · ")}
      </p>
      <button
        onClick={() => {
          posthog?.capture("free_audit_upgrade_clicked");
          router.push("/start");
        }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25"
      >
        Get the Full Playbook — {config.singlePrice}
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Locked section IDs for the free version
const LOCKED_SECTION_IDS = ["stop-doing", "start-doing", "quick-wins", "roadmap", "metrics"];

function FreeResultsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const freeAuditId = params.id as string;
  const isNewCheckout = searchParams.get("new") === "1";
  const trackedRef = useRef(false);
  const pageLoadTime = useRef(Date.now());
  const statusRef = useRef<AuditStatus | null>(null);

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
    if (!freeAuditId) return;

    const fetchFreeAudit = async () => {
      try {
        const res = await fetch(`/api/free-audit/${freeAuditId}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Free audit not found");
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
  }, [freeAuditId, posthog]);

  // Poll for status if pending/processing
  useEffect(() => {
    if (!freeAuditId) return;
    if (statusRef.current === "complete" || statusRef.current === "failed") return;

    let pollCount = 0;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      pollCount++;

      try {
        const res = await fetch(`/api/free-audit/${freeAuditId}`);
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
  }, [freeAuditId, posthog]);

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

  // Success state - render free results with upsell
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6">
          {/* Mobile TOC - full width horizontal tabs */}
          <div className="lg:hidden">
            {freeStrategy && <TableOfContents strategy={freeStrategy} variant="mobile" />}
          </div>

          {/* Desktop layout: sidebar + content */}
          <div className="lg:flex lg:gap-8 py-8">
            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:w-[200px] lg:flex-shrink-0">
              {freeStrategy && (
                <TableOfContents
                  strategy={freeStrategy}
                  variant="desktop"
                  lockedSectionIds={LOCKED_SECTION_IDS}
                />
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              {/* Magic link banner for new checkouts */}
              {isNewCheckout && <MagicLinkBanner />}

              {/* Upsell banner */}
              <UpsellBanner />

              {/* Strategy content */}
              {freeStrategy && <ResultsContent strategy={freeStrategy} />}

              {/* Locked sections teaser */}
              <UpgradeCTA />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function FreeResultsPage() {
  return <FreeResultsPageContent />;
}
