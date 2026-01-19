"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { config } from "@/lib/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResultsContent, StatusMessage, TableOfContents } from "@/components/results";
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
          Get Full Strategy — {config.singlePrice}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function LockedSectionsTeaser() {
  const router = useRouter();
  const posthog = usePostHog();

  const lockedSections = [
    { title: "Quick Wins", description: "Actionable tactics you can implement this week" },
    { title: "30-Day Roadmap", description: "Day-by-day plan for your first month" },
    { title: "Metrics to Track", description: "KPIs to measure your growth progress" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="border border-border/60 rounded-2xl overflow-hidden mt-8"
    >
      <div className="bg-surface/50 px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-2 text-muted">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">Included in the full version</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {lockedSections.map((section, index) => (
          <div
            key={section.title}
            className="flex items-start gap-3 opacity-60"
          >
            <div className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center text-xs text-muted flex-shrink-0 mt-0.5">
              {index + 6}
            </div>
            <div>
              <h4 className="font-medium text-foreground">{section.title}</h4>
              <p className="text-sm text-muted">{section.description}</p>
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            posthog?.capture("free_audit_locked_section_clicked");
            router.push("/start");
          }}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-border hover:bg-surface/80 rounded-xl font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Unlock All Sections
        </button>
      </div>
    </motion.div>
  );
}

function FreeResultsPageContent() {
  const params = useParams();
  const posthog = usePostHog();
  const freeAuditId = params.id as string;
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

  // Poll for status if pending/processing (use ref to avoid interval recreation)
  useEffect(() => {
    if (!freeAuditId) return;
    // Check ref instead of state to avoid dependency on freeAudit
    if (statusRef.current !== "pending" && statusRef.current !== "processing") return;

    const MAX_POLLS = 100;
    let pollCount = 0;
    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;
      pollCount++;

      if (pollCount >= MAX_POLLS) {
        clearInterval(interval);
        setError("Generation is taking longer than expected. Please refresh the page.");
        return;
      }

      try {
        const res = await fetch(`/api/free-audit/${freeAuditId}`);
        if (res.ok) {
          const data = await res.json();

          if (data.freeAudit.status === "complete") {
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
            clearInterval(interval);
          } else if (data.freeAudit.status === "failed") {
            setFreeAudit((prev) => (prev ? { ...prev, status: "failed" } : null));
            clearInterval(interval);
          }
        }
      } catch {
        // Silently continue polling on network errors
      }
    }, 3000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [freeAuditId, posthog]); // Removed freeAudit from deps - use statusRef instead

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

  // Success state - render free results with upsell
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6">
          {/* Mini audit badge */}
          <div className="lg:ml-[220px] pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Free Mini-Audit
            </div>
          </div>

          {/* Upsell banner */}
          <div className="lg:ml-[220px]">
            <UpsellBanner />
          </div>

          {/* Mobile TOC - full width horizontal tabs */}
          <div className="lg:hidden">
            {strategy && <TableOfContents strategy={strategy} variant="mobile" />}
          </div>

          {/* Desktop layout: sidebar + content */}
          <div className="lg:flex lg:gap-8 py-8">
            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:w-[200px] lg:flex-shrink-0">
              {strategy && <TableOfContents strategy={strategy} variant="desktop" />}
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              {strategy && <ResultsContent strategy={strategy} />}

              {/* Locked sections teaser */}
              <LockedSectionsTeaser />
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
