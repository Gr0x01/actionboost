"use client";

import { Mail, X } from "lucide-react";
import { useState } from "react";

export function MagicLinkBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-background border border-border rounded-xl p-4 shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Mail className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Check your email for a login link
        </p>
        <p className="text-xs text-muted mt-0.5">
          Access your dashboard anytime to view this action plan again
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-foreground transition-colors p-1 -m-1"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
