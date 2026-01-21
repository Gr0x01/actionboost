"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { captureSource, getSourceProperties } from "@/lib/source";

interface PHProviderProps {
  children: React.ReactNode;
  cookieless?: boolean;
}

export function PHProvider({ children, cookieless = false }: PHProviderProps) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || typeof window === "undefined") {
      return;
    }

    const initPostHog = () => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
        // GDPR: cookieless mode for EU users, cookies for everyone else
        ...(cookieless && { persistence: "memory" }),
      });

      // Capture UTM/ref params and register as super properties
      // All future events will automatically include source attribution
      captureSource();
      const sourceProps = getSourceProperties();
      if (Object.keys(sourceProps).length > 0) {
        posthog.register(sourceProps);
      }
    };

    // Defer PostHog init until browser is idle to avoid blocking LCP
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initPostHog, { timeout: 3000 });
    } else {
      // Fallback for Safari
      setTimeout(initPostHog, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // cookieless is server-determined, won't change during session

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
