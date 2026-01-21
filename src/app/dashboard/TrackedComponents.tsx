"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";

interface TrackedStrategyLinkProps {
  runId: string;
  status: string | null;
  children: React.ReactNode;
}

export function TrackedStrategyLink({ runId, status, children }: TrackedStrategyLinkProps) {
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
      className="group flex items-center justify-between px-6 py-4 bg-background hover:bg-surface/80 border-l-4 border-l-transparent hover:border-l-cta transition-all duration-100"
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
      className="group flex items-center justify-between px-6 py-4 bg-background hover:bg-surface/80 border-l-4 border-l-transparent hover:border-l-violet-600 transition-all duration-100"
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
    ? "Get your first action plan"
    : "Generate another plan";

  const isPrimary = variant === "primary";

  return (
    <Link
      href="/start"
      onClick={() => {
        posthog?.capture("dashboard_cta_clicked", { button });
      }}
      className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold border-2 transition-all duration-100
        ${isPrimary
          ? "bg-cta text-white border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1"
          : "bg-background text-foreground border-foreground shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1"
        }`}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
