"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface TrackedStrategyLinkProps {
  runId: string;
  status: string | null;
  children: React.ReactNode;
  muted?: boolean;
}

export function TrackedStrategyLink({ runId, status, children, muted = false }: TrackedStrategyLinkProps) {
  const posthog = usePostHog();

  return (
    <Link
      href={`/results/${runId}`}
      onClick={() => {
        posthog?.capture("strategy_clicked", {
          run_id: runId,
          status: status || "unknown",
        });
      }}
      className={`group flex items-center justify-between transition-all duration-150 ${
        muted
          ? "px-6 py-3 bg-surface/20 hover:bg-surface/40"
          : "px-6 py-4 bg-background hover:bg-surface/50 border-l-4 border-l-transparent hover:border-l-cta"
      }`}
    >
      {children}
    </Link>
  );
}

interface TrackedFreeAuditLinkProps {
  auditId: string;
  status: string | null;
  children: React.ReactNode;
}

export function TrackedFreeAuditLink({ auditId, status, children }: TrackedFreeAuditLinkProps) {
  const posthog = usePostHog();

  return (
    <Link
      href={`/free-results/${auditId}`}
      onClick={() => {
        posthog?.capture("free_audit_clicked", {
          free_audit_id: auditId,
          status: status || "unknown",
        });
      }}
      className="group flex items-center justify-between px-6 py-4 bg-background hover:bg-surface/50 border-l-4 border-l-transparent hover:border-l-violet-500 transition-all duration-150"
    >
      {children}
    </Link>
  );
}

interface TrackedCTAButtonProps {
  button: "get_first_strategy" | "generate_another";
  variant?: "primary" | "secondary";
}

export function TrackedCTAButton({ button, variant = "primary" }: TrackedCTAButtonProps) {
  const posthog = usePostHog();

  const label = button === "get_first_strategy"
    ? "Create my marketing plan"
    : "Create another plan";

  const isPrimary = variant === "primary";

  return (
    <Link
      href="/start"
      onClick={() => {
        posthog?.capture("dashboard_cta_clicked", { button });
      }}
      className={`inline-flex items-center gap-2 rounded-md px-6 py-3 font-semibold border-2 transition-all duration-100
        ${isPrimary
          ? "bg-cta text-white border-cta/80 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:shadow-none"
          : "bg-background text-foreground border-foreground/20 hover:border-foreground/40 hover:-translate-y-0.5 active:translate-y-0.5"
        }`}
      style={{ boxShadow: isPrimary ? '4px 4px 0 rgba(44, 62, 80, 0.2)' : '4px 4px 0 rgba(44, 62, 80, 0.1)' }}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

interface TrackedHeroCardProps {
  runId: string;
  title: string;
  date: string;
  status: string | null;
  hasRefinements: boolean;
}

export function TrackedHeroCard({ runId, title, date, status, hasRefinements }: TrackedHeroCardProps) {
  const posthog = usePostHog();

  const isProcessing = status === "processing";
  const isFailed = status === "failed";

  return (
    <Link
      href={`/results/${runId}`}
      onClick={() => {
        posthog?.capture("hero_card_clicked", {
          run_id: runId,
          status: status || "unknown",
        });
      }}
      className="group block rounded-md border-2 border-foreground/20 bg-background p-6 hover:border-cta/50 transition-all duration-150"
      style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-cta transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-foreground/50">
            <span>{date}</span>
            {hasRefinements && (
              <span className="text-xs px-2 py-0.5 bg-surface rounded-full">
                Refined
              </span>
            )}
          </div>

          {/* Status indicator for non-complete */}
          {isProcessing && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Building your plan...</span>
            </div>
          )}
          {isFailed && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
              <span>Something went wrong. Click to retry.</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {!isProcessing && !isFailed && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Ready</span>
            </div>
          )}
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-cta group-hover:gap-3 transition-all">
            View plan
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
