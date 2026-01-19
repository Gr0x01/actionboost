"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, Mail, Sparkles } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { isValidEmail } from "@/lib/validation";
import { config } from "@/lib/config";
import type { FormInput } from "@/lib/types/form";

interface CheckoutSectionProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  hasValidCode: boolean;
  promoCode: string;
  setPromoCode: (v: string) => void;
  codeStatus: { valid: boolean; credits?: number; error?: string; errorCode?: string } | null;
  validateCode: () => void;
  isValidatingCode: boolean;
  clearCode: () => void;
  email: string;
  setEmail: (v: string) => void;
  formData?: FormInput; // For free audit submission
}

export function CheckoutSection({
  onSubmit,
  isSubmitting,
  hasValidCode,
  promoCode,
  setPromoCode,
  codeStatus,
  validateCode,
  isValidatingCode,
  clearCode,
  email,
  setEmail,
  formData,
}: CheckoutSectionProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const [showCode, setShowCode] = useState(!config.pricingEnabled);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const hasTrackedView = useRef(false);
  const hasTrackedWaitlist = useRef(false);

  // Free audit states
  const [showFreeOption, setShowFreeOption] = useState(false);
  const [freeEmail, setFreeEmail] = useState("");
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);
  const freeSubmitRef = useRef(false); // Prevent double-click

  const emailValid = isValidEmail(email);
  const canSubmitWithCode = hasValidCode && emailValid;
  const waitlistEmailValid = isValidEmail(waitlistEmail);
  const freeEmailValid = isValidEmail(freeEmail);

  // Show waitlist when code fails and pricing is disabled
  const shouldShowWaitlist = !config.pricingEnabled && codeStatus && !codeStatus.valid && !hasValidCode;

  // Handler for free audit submission
  async function handleFreeAuditSubmit() {
    if (freeSubmitRef.current || !freeEmailValid || !formData) return;
    freeSubmitRef.current = true;

    posthog?.capture("free_audit_submitted", { email_domain: freeEmail.split("@")[1] });
    setFreeSubmitting(true);
    setFreeError(null);

    try {
      const res = await fetch("/api/free-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: freeEmail,
          input: formData,
          posthogDistinctId: posthog?.get_distinct_id(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.freeAuditId) {
        posthog?.capture("free_audit_success", { free_audit_id: data.freeAuditId });
        router.push(`/free-results/${data.freeAuditId}`);
      } else if (res.status === 409) {
        // Already has a free audit
        posthog?.capture("free_audit_duplicate", { error: data.error });
        setFreeError("You've already received a free audit. Get the full version for deeper insights!");
      } else {
        posthog?.capture("free_audit_error", { error: data.error });
        setFreeError(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Free audit error:", error);
      posthog?.capture("free_audit_error", { error: "network_error" });
      setFreeError("Connection failed. Please try again.");
    } finally {
      setFreeSubmitting(false);
      freeSubmitRef.current = false; // Reset for retry
    }
  }

  // Track checkout section viewed (once)
  useEffect(() => {
    if (!hasTrackedView.current) {
      posthog?.capture("checkout_viewed", {
        pricing_enabled: config.pricingEnabled,
        has_valid_code: hasValidCode,
      });
      hasTrackedView.current = true;
    }
  }, [posthog, hasValidCode]);

  // Track waitlist section viewed
  useEffect(() => {
    if (shouldShowWaitlist && !hasTrackedWaitlist.current) {
      posthog?.capture("waitlist_viewed", {
        reason: codeStatus?.errorCode || "invalid_code",
      });
      hasTrackedWaitlist.current = true;
    }
  }, [shouldShowWaitlist, posthog, codeStatus?.errorCode]);

  // Track promo code validation result
  const prevCodeStatus = useRef<typeof codeStatus>(null);
  useEffect(() => {
    if (codeStatus && codeStatus !== prevCodeStatus.current) {
      posthog?.capture("promo_code_attempted", {
        code: promoCode,
        success: codeStatus.valid,
        error_code: codeStatus.errorCode,
        credits: codeStatus.credits,
      });
      prevCodeStatus.current = codeStatus;
    }
  }, [codeStatus, posthog, promoCode]);

  async function handleWaitlistSubmit() {
    if (!waitlistEmailValid) return;

    posthog?.capture("waitlist_submitted");
    setWaitlistSubmitting(true);
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail, source: "checkout" }),
      });

      if (res.ok) {
        posthog?.capture("waitlist_success");
        setWaitlistSuccess(true);
      } else {
        posthog?.capture("waitlist_error", { error: "api_error" });
        setWaitlistError("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Waitlist error:", error);
      posthog?.capture("waitlist_error", { error: "network_error" });
      setWaitlistError("Connection failed. Please try again.");
    } finally {
      setWaitlistSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      {/* Header with editorial flair */}
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
          Ready to generate your strategy
        </h2>
        <p className="text-muted text-lg max-w-md mx-auto">
          Our AI will analyze your inputs and create a custom growth playbook
        </p>
      </div>

      {/* Email input for promo code users */}
      {hasValidCode && (
        <div className="max-w-sm mx-auto mb-6 space-y-2">
          <div className="flex items-center gap-3 bg-surface/50 border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Mail className="w-5 h-5 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (isValidEmail(email)) {
                  posthog?.capture("checkout_email_entered", { email_valid: true });
                }
              }}
              placeholder="your@email.com"
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none"
            />
          </div>
          {email.trim() && !emailValid ? (
            <p className="text-xs text-red-500 text-center">
              Please enter a valid email address
            </p>
          ) : (
            <p className="text-xs text-muted text-center">
              Your results will be sent via magic link — use a real email
            </p>
          )}
        </div>
      )}

      {/* Main CTA button - hide when waitlist or free option is showing */}
      {!shouldShowWaitlist && !showFreeOption && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            posthog?.capture("checkout_initiated", {
              method: hasValidCode ? "code" : "stripe",
            });
            onSubmit();
          }}
          disabled={isSubmitting || (hasValidCode && !canSubmitWithCode) || (!config.pricingEnabled && !hasValidCode)}
          className={`group relative px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 ${
            hasValidCode
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
              : "bg-gradient-to-r from-cta to-amber-500 text-white shadow-lg shadow-cta/30 hover:shadow-xl hover:shadow-cta/40"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {/* Subtle shine effect */}
          <span className="absolute inset-0 rounded-2xl overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </span>

          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : hasValidCode ? (
              "Generate Strategy — Free"
            ) : config.pricingEnabled ? (
              <>
                Generate Strategy
                <span className="font-normal opacity-90">— $7.99</span>
              </>
            ) : (
              "Enter code to continue"
            )}
          </span>
        </motion.button>
      )}

      {/* Free mini-audit option - only show when pricing enabled and no promo code */}
      {config.pricingEnabled && !hasValidCode && !shouldShowWaitlist && formData && (
        <div className="pt-2">
          {!showFreeOption ? (
            <button
              type="button"
              onClick={() => {
                posthog?.capture("free_audit_option_clicked");
                setShowFreeOption(true);
              }}
              className="group text-sm text-muted hover:text-foreground transition-colors flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-accent group-hover:text-cta transition-colors" />
              <span>Just want a taste? Get a free mini-audit</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto p-6 rounded-2xl bg-surface/60 border border-border/50 space-y-4"
            >
              <div className="flex items-center gap-2 justify-center text-accent">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Free Mini-Audit</span>
              </div>
              <p className="text-sm text-muted">
                Get a condensed 5-section audit to preview our analysis style
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-background border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Mail className="w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={freeEmail}
                    onChange={(e) => setFreeEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && freeEmailValid) {
                        e.preventDefault();
                        handleFreeAuditSubmit();
                      }
                    }}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/50 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFreeAuditSubmit}
                  disabled={!freeEmailValid || freeSubmitting}
                  className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {freeSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get It"
                  )}
                </button>
              </div>
              {freeError && (
                <p className="text-sm text-red-500">{freeError}</p>
              )}
              <button
                type="button"
                onClick={() => setShowFreeOption(false)}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                ← Back to full version
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Promo code section - hide when free option is showing */}
      <div>
        {!showCode && !hasValidCode && config.pricingEnabled && !showFreeOption && (
          <button
            onClick={() => {
              posthog?.capture("promo_code_toggled");
              setShowCode(true);
            }}
            className="text-sm text-primary/80 hover:text-primary transition-colors underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60"
          >
            Have a promo code?
          </button>
        )}

        {showCode && !hasValidCode && !shouldShowWaitlist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="max-w-sm mx-auto mt-4 space-y-3"
          >
            {!config.pricingEnabled && (
              <p className="text-sm text-muted">Enter your promo code to continue</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono tracking-wider"
              />
              <button
                onClick={validateCode}
                disabled={!promoCode.trim() || isValidatingCode}
                className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isValidatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            {codeStatus && !codeStatus.valid && config.pricingEnabled && (
              <p className="text-sm text-red-500">{codeStatus.error || "Invalid code"}</p>
            )}
          </motion.div>
        )}

        {hasValidCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">
              {codeStatus?.credits} free {codeStatus?.credits === 1 ? "strategy" : "strategies"}
            </span>
            <button onClick={clearCode} className="text-green-500 hover:text-green-700 ml-1 text-lg leading-none">
              ×
            </button>
          </motion.div>
        )}
      </div>

      {/* Waitlist fallback when code fails (promo-only mode) */}
      {shouldShowWaitlist && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto p-6 rounded-xl bg-surface/50 border border-border/60"
        >
          {waitlistSuccess ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">You&apos;re on the list!</p>
              <p className="text-sm text-muted">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-foreground mb-1">
                We&apos;re launching this week!
              </p>
              <p className="text-sm text-muted mb-4">
                Join the waitlist to get notified when we go live.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm text-foreground placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleWaitlistSubmit}
                  disabled={!waitlistEmailValid || waitlistSubmitting}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {waitlistSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Join"
                  )}
                </button>
              </div>
              {waitlistError && (
                <p className="text-sm text-red-500 mt-2">{waitlistError}</p>
              )}
              <button
                onClick={() => {
                  clearCode();
                  setShowCode(true);
                }}
                className="mt-3 text-xs text-muted hover:text-foreground transition-colors"
              >
                Try another code
              </button>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
