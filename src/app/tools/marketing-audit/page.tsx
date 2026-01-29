"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Globe,
  Mail,
  Check,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Header, Footer } from "@/components/layout";
import { isValidEmail } from "@/lib/validation";
import { config } from "@/lib/config";

const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY;

const FAQ_ITEMS = [
  {
    q: "Is this actually free?",
    a: "Yes. No credit card, no trial, no 'free but actually we'll call you 47 times.' You get a real audit with real findings. We built this so you can see what Boost does before you ever spend a dollar.",
  },
  {
    q: "How does the audit work?",
    a: "We screenshot your homepage and analyze what visitors actually see in the first 3 seconds — layout, visual hierarchy, copy clarity, and conversion path. A short description of your business helps us give more relevant advice. No logins or access needed.",
  },
  {
    q: "How long does it take?",
    a: "About 60 seconds. You'll get a prioritized list of what's hurting your site most — with specific observations and the fix that'll make the biggest difference.",
  },
  {
    q: "What happens after I get my audit?",
    a: "You see your results immediately. No waiting for an email, no scheduling a call. If you want a plan to fix what we found, Boost builds you one for $29. But the audit is yours either way.",
  },
  {
    q: "Is my information safe?",
    a: "We don't share your data, sell your email, or send spam. We use your URL to run the audit and your email to send the report. That's it.",
  },
];


// --- Mock audit output for the hero preview ---
// Styled to match the real results page output format

function HeroAuditPreview() {
  return (
    <div
      className="bg-white border-2 border-foreground/15 rounded-md p-6 md:p-8 max-w-2xl mx-auto"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
    >
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-4">
            Your marketing audit is ready
          </p>

          <p className="text-foreground/40 text-xs font-mono mb-4">
            sweetspot-bakery.com
          </p>

          {/* Silent killer callout */}
          <div className="bg-foreground/[0.03] border-2 border-foreground/10 rounded-md px-4 py-3 mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-cta/80 mb-1">
              Biggest silent killer
            </p>
            <p className="text-sm font-bold text-foreground leading-snug">
              Your site talks about your process for 4 paragraphs before ever mentioning what the customer gets.
            </p>
          </div>

          <p className="text-foreground/70 text-sm leading-relaxed max-w-sm mb-5">
            Your homepage has a clear offer, but it&apos;s buried under company-focused copy. Visitors can&apos;t tell why you&apos;re different and there&apos;s no proof your work delivers.
          </p>

          {/* Finding cards preview */}
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-3">
            What we found
          </p>

          <div className="space-y-3">
            {/* Finding 1 */}
            <div
              className="border-2 border-foreground/10 rounded-md p-4"
              style={{ boxShadow: "2px 2px 0 rgba(44, 62, 80, 0.04)" }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 inline-block mb-2">
                Clarity
              </span>
              <h3 className="text-sm font-bold text-foreground mb-1">
                No &quot;only&quot; statement — you sound like every other bakery
              </h3>
              <p className="text-xs text-foreground/55 leading-relaxed">
                &quot;Artisan baked goods made fresh daily&quot; describes what you do, but not why someone should pick you over the bakery down the street.
              </p>
            </div>

            {/* Finding 2 */}
            <div
              className="border-2 border-foreground/10 rounded-md p-4"
              style={{ boxShadow: "2px 2px 0 rgba(44, 62, 80, 0.04)" }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 inline-block mb-2">
                Customer Focus
              </span>
              <h3 className="text-sm font-bold text-foreground mb-1">
                14 mentions of &quot;we&quot; before a single &quot;you&quot;
              </h3>
              <p className="text-xs text-foreground/55 leading-relaxed">
                Your homepage opens with your story, your process, your team. Visitors want to know what&apos;s in it for them.
              </p>
            </div>

            {/* Finding 3 — partially visible */}
            <div
              className="border-2 border-foreground/10 rounded-md p-4"
              style={{ boxShadow: "2px 2px 0 rgba(44, 62, 80, 0.04)" }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 inline-block mb-2">
                Proof
              </span>
              <h3 className="text-sm font-bold text-foreground mb-1">
                No transformation story — just a list of services
              </h3>
              <p className="text-xs text-foreground/55 leading-relaxed">
                Visitors see what you do but not what customers become. No before/after, no specific results, no reason to believe.
              </p>
            </div>
          </div>
    </div>
  );
}

// --- Inline wizard step components ---

function WizardUrlStep({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const favicon = (() => {
    if (value && value.includes(".")) {
      try {
        const url = value.startsWith("http") ? value : `https://${value}`;
        return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
      } catch {
        return null;
      }
    }
    return null;
  })();

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        What&apos;s your website?
      </label>
      <div className="flex items-center gap-3 rounded-lg border-2 border-foreground/20 bg-background px-4 py-4 focus-within:border-foreground focus-within:ring-2 focus-within:ring-cta/20 transition-all">
        {favicon ? (
          <img src={favicon} alt="" className="w-6 h-6" />
        ) : (
          <Globe className="w-6 h-6 text-foreground/30" />
        )}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onSubmit();
          }}
          placeholder="yoursite.com"
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
        />
      </div>
      <button
        onClick={value.trim() ? onSubmit : undefined}
        disabled={!value.trim()}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Run my free audit
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        60 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardDescriptionStep({
  value,
  onChange,
  onSubmit,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-sm font-bold text-foreground mb-1">What do you do?</p>
      <p className="text-xs text-foreground/50 mb-3">
        So we can compare you to the right competitors
      </p>
      <div className="rounded-md border-2 border-foreground/20 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && value.trim().length >= 10) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="We sell handmade candles to gift shoppers online"
          rows={2}
          className="w-full bg-transparent text-foreground placeholder:text-foreground/30 outline-none resize-none min-h-[60px]"
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={value.trim().length >= 10 ? onSubmit : undefined}
          disabled={value.trim().length < 10}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function WizardEmailStep({
  value,
  onChange,
  onSubmit,
  onBack,
  turnstileToken,
  setTurnstileToken,
  submitting,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  turnstileToken: string | null;
  setTurnstileToken: (t: string) => void;
  submitting: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const [hasInteracted, setHasInteracted] = useState(false);
  const emailValid = isValidEmail(value);
  const showError = hasInteracted && value.trim() && !emailValid;

  return (
    <div>
      <p className="text-sm font-bold text-foreground mb-3">
        Where should we send your report?
      </p>
      <div
        className={`flex items-center gap-3 rounded-md border-2 bg-background px-4 py-3 transition-colors ${
          showError
            ? "border-red-500"
            : emailValid
              ? "border-green-500"
              : "border-foreground/20 focus-within:border-foreground"
        }`}
      >
        <Mail className={`w-5 h-5 ${emailValid ? "text-green-500" : "text-foreground/40"}`} />
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && emailValid && !submitting) onSubmit();
          }}
          onBlur={() => setHasInteracted(true)}
          placeholder="you@yourbusiness.com"
          className="flex-1 bg-transparent text-foreground placeholder:text-foreground/30 outline-none"
        />
        {emailValid && <Check className="w-5 h-5 text-green-500" />}
      </div>
      {showError && (
        <p className="mt-2 text-sm text-red-500 font-bold">Please enter a valid email address</p>
      )}
      <p className="mt-2 text-xs text-foreground/50">
        We don&apos;t share your data or send spam. Just your report.
      </p>

      {turnstileSiteKey && (
        <div className="mt-3 flex justify-center">
          <Turnstile siteKey={turnstileSiteKey} onSuccess={setTurnstileToken} />
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={emailValid && !submitting ? onSubmit : undefined}
          disabled={!emailValid || submitting}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Run my free audit
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// --- FAQ Accordion ---

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-foreground/10 rounded-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-foreground hover:bg-foreground/[0.02] transition-colors"
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-foreground/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-foreground/60 text-sm leading-relaxed">{a}</div>
      )}
    </div>
  );
}

// --- Main Page ---

function MarketingAuditContent() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/marketing-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          businessDescription: businessDescription.trim(),
          email: email.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          router.push(`/tools/marketing-audit/${data.existingSlug}`);
          return;
        }
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push(`/tools/marketing-audit/${data.slug}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, url, businessDescription, email, turnstileToken, router]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        {/* ── Hero: Centered headline, subtext, form ── */}
        <section className="pt-20 lg:pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-foreground leading-[1.05]">
              Your website is
              <br />
              <span className="font-black">losing customers.</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Most small business sites fail the 3-Second Test. Get a free audit that shows you exactly where — and the one fix that&apos;ll make the biggest difference.
            </p>
          </div>

          {/* Form card — centered below headline */}
          <div id="audit-form" className="max-w-lg mx-auto px-6 mt-12">
            <div
              className="relative bg-white border-2 border-foreground/20 rounded-xl p-8 md:p-10 overflow-hidden"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.15)" }}
            >
              {/* Orange top accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cta rounded-t-xl" />

              {/* Progress dots — only show after step 0 */}
              {step > 0 && (
                <div className="flex items-center justify-center gap-2 mb-5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i <= step ? "bg-cta w-8" : "bg-foreground/15 w-4"
                      }`}
                    />
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="url"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WizardUrlStep
                      value={url}
                      onChange={setUrl}
                      onSubmit={() => setStep(1)}
                    />
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WizardDescriptionStep
                      value={businessDescription}
                      onChange={setBusinessDescription}
                      onSubmit={() => setStep(2)}
                      onBack={() => setStep(0)}
                    />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WizardEmailStep
                      value={email}
                      onChange={setEmail}
                      onSubmit={handleSubmit}
                      onBack={() => setStep(1)}
                      turnstileToken={turnstileToken}
                      setTurnstileToken={setTurnstileToken}
                      submitting={submitting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="mt-4 text-sm text-red-600 font-medium text-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sample audit preview — 2-column: explainer left, output right */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase text-center mb-4">
            What you get
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground tracking-tight text-center mb-12">
            The <span className="font-black">3-Second Test</span> — Can Your Site Pass It?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-start">
            {/* Left: explain the framework */}
            <div className="space-y-6">
              <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                When a stranger lands on your site, can they answer three questions in 3 seconds: <span className="text-foreground font-semibold">What do you sell? Who is it for? Why should I pick you?</span>
              </p>
              <p className="text-base sm:text-lg text-foreground/70 leading-relaxed">
                Most small business sites fail all three. We show you exactly where yours does — and what to fix first.
              </p>

              <div className="space-y-5 pt-4 border-t border-foreground/10">
                <div>
                  <p className="text-base font-bold text-foreground">Biggest Silent Killer</p>
                  <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                    The one thing costing you the most customers, named plainly.
                  </p>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Clarity</p>
                  <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                    Can someone tell what makes you the only choice — not just a better choice?
                  </p>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Customer Focus</p>
                  <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                    Is your site talking about you or about your customer&apos;s problem?
                  </p>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Proof</p>
                  <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                    Do you show what customers become — or just what you do?
                  </p>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Friction</p>
                  <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
                    What&apos;s stopping visitors from taking the next step?
                  </p>
                </div>
              </div>
            </div>

            {/* Right: mock output */}
            <HeroAuditPreview />
          </div>
        </section>


        {/* ── Mid-page CTA ── */}
        <section className="text-center py-8">
          <p className="text-lg font-bold text-foreground mb-3">
            Ready to see what&apos;s costing you customers?
          </p>
          <a
            href="#audit-form"
            className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            Get my free audit
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ── Educational Content ── */}
        <section className="max-w-2xl mx-auto px-4 pt-8 space-y-10">
          <div className="border-l-4 border-cta pl-6 py-1">
            <h2 className="text-xl font-bold text-foreground mb-3">
              The 3 silent sales killers on most small business websites
            </h2>
            <div className="space-y-3 text-foreground/70 text-sm leading-relaxed">
              <p>
                <strong className="text-foreground">1. It talks about you, not them.</strong>{" "}
                Visitors don&apos;t care about your story yet. They care whether you solve
                their problem. Most sites lead with &quot;About Us&quot; when they should lead
                with &quot;Here&apos;s what you get.&quot;
              </p>
              <p>
                <strong className="text-foreground">2. Google can&apos;t find it.</strong> No
                meta descriptions, no local keywords, no Google Business connection.
                You&apos;re invisible to people actively searching for what you sell.
              </p>
              <p>
                <strong className="text-foreground">
                  3. There&apos;s no obvious next step.
                </strong>{" "}
                No clear button. No phone number above the fold. No booking link. Visitors
                who can&apos;t figure out how to buy in 10 seconds just leave.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-foreground/15 pl-6 py-1">
            <h2 className="text-xl font-bold text-foreground mb-3">
              You look at your website like an owner. Your customers don&apos;t.
            </h2>
            <div className="space-y-3 text-foreground/70 text-sm leading-relaxed">
              <p>
                You know where the booking page is. You know what you offer. You know your
                prices are fair.
              </p>
              <p>
                But a first-time visitor doesn&apos;t know any of that. They landed 3 seconds
                ago. They&apos;re already deciding whether to stay or hit the back button.
              </p>
              <p>
                This audit shows you what that stranger actually experiences — the confusing
                bits, the missing bits, the parts that make them leave. Things you can&apos;t
                see because you know too much about your own business.
              </p>
            </div>
          </div>

          {/* Boost pitch woven in */}
          <div
            className="bg-foreground text-white rounded-md p-6 md:p-8"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.2)" }}
          >
            <h2 className="text-lg font-bold mb-2">
              You&apos;ve seen what&apos;s broken. Here&apos;s the plan to fix it.
            </h2>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              The free audit shows you where your site is losing customers. Boost builds
              you a 30-day action plan to fix it — specific to your business, your market,
              your budget. Research-backed. No fluff.
            </p>
            <a
              href="/start"
              className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-sm"
            >
              Get my full Boost — {config.singlePrice}
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-3 text-white/40 text-xs">
              One-time payment. No subscription.
            </p>
          </div>

          <div className="border-l-4 border-cta/50 pl-6 py-1">
            <h2 className="text-xl font-bold text-foreground mb-3">
              Why your positioning matters more than your tactics
            </h2>
            <div className="space-y-3 text-foreground/70 text-sm leading-relaxed">
              <p>
                Most marketing advice jumps straight to tactics — post on Instagram, run
                Google Ads, start a blog. But tactics don&apos;t work if you haven&apos;t
                answered the basic question: why should anyone pick you?
              </p>
              <p>
                <strong className="text-foreground">Positioning</strong> is the answer to that
                question. It&apos;s what makes you different, who you serve best, and why your
                offer matters to them specifically. Without it, every tactic is a coin flip.
              </p>
              <p>
                The audit checks whether your positioning is visible to a stranger landing on
                your site. Can they tell what makes you different? Do they know who this is
                for? If not, no amount of ad spend will fix it.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-foreground/15 pl-6 py-1">
            <h2 className="text-xl font-bold text-foreground mb-3">
              How to do a marketing audit yourself
            </h2>
            <div className="space-y-3 text-foreground/70 text-sm leading-relaxed">
              <p>
                Even without our tool, you can catch the big issues. Open your website in an
                incognito browser. Pretend you&apos;ve never seen it. Then ask:
              </p>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold mt-0.5">1.</span>
                  Can I tell what this business does in 5 seconds?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold mt-0.5">2.</span>
                  Is there an obvious button or action to take?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold mt-0.5">3.</span>
                  Do I trust this business? Is there proof other people use it?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold mt-0.5">4.</span>
                  If I Google what this business sells + my city, does it show up?
                </li>
              </ul>
              <p>
                If you said no to any of those, you&apos;ve found your starting point.
                Our audit automates this — and goes deeper on each one.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-2xl mx-auto px-4 pt-16 pb-20">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Questions you might have
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

export default function MarketingAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-mesh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
          </main>
          <Footer />
        </div>
      }
    >
      <MarketingAuditContent />
    </Suspense>
  );
}
