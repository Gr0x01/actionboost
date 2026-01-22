"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, ExternalLink, X, Loader2, Mail, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Header, Footer } from "@/components/layout";
import { FocusInput } from "@/components/forms";
import { FormInput, FocusArea, INITIAL_FORM_STATE } from "@/lib/types/form";
import { isValidEmail } from "@/lib/validation";

type ImpressionStatus = "pending" | "processing" | "complete" | "failed";

interface FirstImpression {
  id: string;
  url: string;
  output: string | null;
  status: ImpressionStatus;
  created_at: string;
  completed_at: string | null;
}

function ProcessingState({ url }: { url?: string }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-6">
      <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
        Analyzing
        <span className="inline-block w-8 text-left animate-pulse">...</span>
      </h1>
      <p className="text-foreground/60 mb-8">
        Checking the website and market context
      </p>
      {url && (
        <p className="text-sm text-foreground/40 font-mono truncate max-w-xs mx-auto">
          {url}
        </p>
      )}
      <p className="text-sm text-foreground/40 font-mono mt-4">
        typically 10-15 seconds
      </p>
    </div>
  );
}

function FullStrategyForm({ url }: { url: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormInput>({
    ...INITIAL_FORM_STATE,
    websiteUrl: url,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free option state
  const [showFreeOption, setShowFreeOption] = useState(false);
  const [freeEmail, setFreeEmail] = useState("");
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);

  const updateField = <K extends keyof FormInput>(field: K, value: FormInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFreeSubmit = async () => {
    if (freeSubmitting || !isValidEmail(freeEmail)) return;

    // Basic validation (same as paid - server requires both)
    if (!form.productDescription.trim()) {
      setFreeError("Tell us about your product first");
      return;
    }
    if (!form.currentTraction.trim()) {
      setFreeError("What traction do you have?");
      return;
    }

    setFreeSubmitting(true);
    setFreeError(null);

    try {
      const res = await fetch("/api/free-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: freeEmail, input: form }),
      });
      const data = await res.json();

      if (res.ok && data.freeAuditId && data.token) {
        router.push(`/free-results/${data.freeAuditId}?new=1&token=${encodeURIComponent(data.token)}`);
      } else if (res.status === 409) {
        setFreeError("You've already received a free audit. Get the full version!");
      } else {
        setFreeError(data.error || "Something went wrong");
      }
    } catch {
      setFreeError("Something went wrong");
    } finally {
      setFreeSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    if (!form.productDescription.trim()) {
      setError("Tell us about your product");
      return;
    }
    if (!form.currentTraction.trim()) {
      setError("What traction do you have?");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create checkout session
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create checkout");
        setIsSubmitting(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border-[3px] border-foreground bg-surface p-6 md:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]"
    >
      <p className="text-foreground/70 text-sm mb-6">
        Tell us more and get a complete growth strategy with weekly actions, 30-day roadmap, and content templates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Website URL - pre-filled */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-1">Website</label>
          <input
            type="text"
            value={form.websiteUrl}
            onChange={(e) => updateField("websiteUrl", e.target.value)}
            className="w-full rounded-lg px-3 py-2 bg-background border-2 border-foreground/30 text-foreground text-sm focus:outline-none focus:border-cta"
          />
        </div>

        {/* Product description */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-1">About your product</label>
          <textarea
            value={form.productDescription}
            onChange={(e) => updateField("productDescription", e.target.value)}
            placeholder="We help [who] do [what] by [how]..."
            rows={2}
            className="w-full rounded-lg px-3 py-2 bg-background border-2 border-foreground/30 text-foreground text-sm focus:outline-none focus:border-cta resize-none"
          />
        </div>

        {/* Current traction */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-1">Current traction</label>
          <input
            type="text"
            value={form.currentTraction}
            onChange={(e) => updateField("currentTraction", e.target.value)}
            placeholder="e.g., 500 users, $2k MRR, 10k visitors/mo"
            className="w-full rounded-lg px-3 py-2 bg-background border-2 border-foreground/30 text-foreground text-sm focus:outline-none focus:border-cta"
          />
        </div>

        {/* What you've tried and results */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-1">What have you tried, and how&apos;s it going?</label>
          <textarea
            value={form.tacticsAndResults}
            onChange={(e) => updateField("tacticsAndResults", e.target.value)}
            placeholder="SEO, content marketing, paid ads... and what's working or not"
            rows={3}
            className="w-full rounded-lg px-3 py-2 bg-background border-2 border-foreground/30 text-foreground text-sm focus:outline-none focus:border-cta resize-none"
          />
        </div>

        {/* Focus area */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-3">Where should we focus?</label>
          <FocusInput
            value={form.focusArea}
            onChange={(v) => updateField("focusArea", v)}
            onSubmit={() => {}}
            showContinue={false}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Button row - Free ghost + Paid CTA */}
        {!showFreeOption && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFreeOption(true)}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-bold bg-transparent text-foreground border-2 border-foreground/30 transition-all duration-100 hover:border-foreground hover:shadow-[3px_3px_0_0_rgba(44,62,80,0.3)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5"
            >
              Free Preview
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl flex items-center justify-center gap-2 px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  $9.99
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Free option expanded */}
        {showFreeOption && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 border-2 border-foreground/20 bg-background space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cta">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">Free Mini-Audit</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFreeOption(false)}
                aria-label="Close"
                className="text-foreground/40 hover:text-foreground transition-colors text-xl leading-none font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-foreground/60">
              Get a condensed 5-section audit to preview our analysis
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-lg border-2 border-foreground/30 bg-background px-3 py-2 focus-within:border-foreground transition-colors">
                <Mail className="w-4 h-4 text-foreground/40" />
                <input
                  type="email"
                  value={freeEmail}
                  onChange={(e) => setFreeEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidEmail(freeEmail)) {
                      e.preventDefault();
                      handleFreeSubmit();
                    }
                  }}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleFreeSubmit}
                disabled={!isValidEmail(freeEmail) || freeSubmitting}
                className="rounded-lg px-4 py-2 bg-cta text-white text-sm font-bold border-2 border-cta hover:bg-cta-hover transition-colors disabled:opacity-50"
              >
                {freeSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get It"}
              </button>
            </div>
            {freeError && <p className="text-xs text-red-500 font-bold">{freeError}</p>}
          </motion.div>
        )}

        <p className="text-xs text-foreground/50 text-center">
          Or use a promo code on the <a href="/start" className="underline hover:text-cta">full form</a>
        </p>
      </form>
    </motion.div>
  );
}

export default function FirstImpressionsPage() {
  const params = useParams();
  const id = params.id as string;
  const statusRef = useRef<ImpressionStatus | null>(null);

  const [impression, setImpression] = useState<FirstImpression | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep statusRef in sync
  statusRef.current = impression?.status ?? null;

  // Initial fetch
  useEffect(() => {
    if (!id) return;

    const fetchImpression = async () => {
      try {
        const res = await fetch(`/api/first-impressions/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Not found");
          } else {
            setError("Failed to load");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setImpression(data);
        setLoading(false);
      } catch {
        setError("Failed to load");
        setLoading(false);
      }
    };

    fetchImpression();
  }, [id]);

  // Poll for status if pending/processing
  useEffect(() => {
    if (!id) return;
    if (statusRef.current === "complete" || statusRef.current === "failed") return;

    let pollCount = 0;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      pollCount++;

      try {
        const res = await fetch(`/api/first-impressions/${id}`);
        if (res.ok) {
          const data = await res.json();

          if (data.status === "complete" || data.status === "failed") {
            stopped = true;
            setImpression(data);
            return;
          }

          // Update status for UI
          setImpression((prev) => (prev ? { ...prev, status: data.status } : null));
        }
      } catch {
        // Continue polling on network errors
      }

      if (!stopped && pollCount < 60) {
        setTimeout(poll, 2000);
      }
    };

    // Start polling after initial load
    if (!loading) {
      poll();
    }

    return () => {
      stopped = true;
    };
  }, [id, loading]);

  // Loading state
  if (loading) {
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

  // Error state
  if (error || !impression) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="rounded-2xl border-[3px] border-foreground bg-surface p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] text-center max-w-md">
            <p className="text-foreground font-medium mb-4">
              {error || "Something went wrong"}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
            >
              Go home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Processing state (pending/processing)
  if (impression.status === "pending" || impression.status === "processing") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <ProcessingState url={impression.url} />
        </main>
        <Footer />
      </div>
    );
  }

  // Failed state
  if (impression.status === "failed") {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg mx-auto text-center py-16 px-6">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto rounded-xl border-[3px] border-red-500 bg-red-500 flex items-center justify-center shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                <X className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Something went wrong
            </h1>
            <p className="text-foreground/60 mb-8">
              We encountered an error. Please try again.
            </p>
            <a
              href="/first-impressions"
              className="rounded-xl px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100"
            >
              Try Again
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* URL badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="font-mono text-[10px] tracking-[0.15em] text-foreground/60 uppercase">
              First Impressions
            </span>
            <a
              href={impression.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-cta hover:underline"
            >
              {new URL(impression.url).hostname}
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-[3px] border-foreground bg-surface p-6 md:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]"
          >
            <div className="prose prose-lg max-w-none text-foreground leading-relaxed prose-headings:font-black prose-headings:text-foreground prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-li:my-1 prose-ul:my-2 prose-p:my-3">
              <ReactMarkdown>{impression.output || ""}</ReactMarkdown>
            </div>
          </motion.div>

          {/* Arrow indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center py-6"
          >
            <p className="text-sm font-bold text-foreground/60 mb-2">Want the full playbook?</p>
            <ArrowDown className="w-6 h-6 text-cta animate-bounce" />
          </motion.div>

          {/* Full Strategy Form */}
          <FullStrategyForm url={impression.url} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
