"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui";
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
      className="flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition-colors"
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
      className="flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition-colors"
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
    : "Generate another action plan";

  return (
    <Link href="/start">
      <Button
        variant={variant}
        size="lg"
        onClick={() => {
          posthog?.capture("dashboard_cta_clicked", { button });
        }}
      >
        {label}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </Link>
  );
}
