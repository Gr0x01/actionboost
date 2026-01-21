"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { Header, Footer } from "@/components/layout";

const ALLOWED_EMAIL = "gr0x01@pm.me";

function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export default function FirstImpressionsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    // Allow localhost immediately
    if (isLocalhost()) {
      setAuthorized(true);
      return;
    }

    // Check if user is logged in as allowed email
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ALLOWED_EMAIL) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/first-impressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create impression");
      }

      const { id } = await res.json();
      router.push(`/i/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  // Loading authorization check
  if (authorized === null) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not authorized - show 404-like page
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-black text-foreground mb-4">404</h1>
            <p className="text-foreground/60 mb-6">Page not found</p>
            <a
              href="/"
              className="inline-flex rounded-xl px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
            >
              Go home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authorized - show input form
  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-2xl border-[3px] border-foreground bg-surface p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
            <p className="font-mono text-[10px] tracking-[0.15em] text-cta uppercase font-semibold mb-2">
              First Impressions
            </p>
            <h1 className="text-2xl font-black text-foreground mb-2">
              Quick startup audit
            </h1>
            <p className="text-foreground/60 text-sm mb-6">
              Paste a URL to generate a social-ready take for Reddit/Twitter.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="url"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Website URL
                </label>
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={submitting}
                  className="w-full rounded-xl px-4 py-3 bg-background border-2 border-foreground text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2 disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Get First Impressions
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-foreground/40 mt-4 text-center">
              Cost: ~$0.02-0.03 per run (Sonnet + Tavily)
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
