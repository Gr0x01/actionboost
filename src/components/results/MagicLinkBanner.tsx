"use client";

import { Mail, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function MagicLinkBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // Don't show if dismissed, still loading, or user is logged in
  if (dismissed || isLoggedIn === null || isLoggedIn) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl bg-surface border-2 border-foreground p-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.8)] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-lg border-2 border-foreground bg-background flex items-center justify-center flex-shrink-0">
        <Mail className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">
          Check your email for a login link
        </p>
        <p className="text-xs text-foreground/60 mt-0.5">
          Access your dashboard anytime to view this action plan again
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-foreground/50 hover:text-foreground transition-colors p-1 -m-1"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
