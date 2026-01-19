"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

interface DashboardTrackerProps {
  stats: {
    runs: number;
    credits: number;
  };
}

export function DashboardTracker({ stats }: DashboardTrackerProps) {
  const posthog = usePostHog();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      posthog?.capture("dashboard_viewed", {
        total_strategies: stats.runs,
        remaining_credits: stats.credits,
      });
      hasTracked.current = true;
    }
  }, [posthog, stats.runs, stats.credits]);

  return null;
}
