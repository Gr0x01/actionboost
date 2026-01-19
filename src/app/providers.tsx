"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

interface PHProviderProps {
  children: React.ReactNode;
  cookieless?: boolean;
}

export function PHProvider({ children, cookieless = false }: PHProviderProps) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
        // GDPR: cookieless mode for EU users, cookies for everyone else
        ...(cookieless && { persistence: "memory" }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // cookieless is server-determined, won't change during session

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
