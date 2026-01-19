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
    // Prevent double-click
    if (freeSubmitRef.current || !freeEmailValid || !formData) return;
    freeSubmitRef.current = true;

    // Don't log full email for privacy - only domain
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
      className="text-center space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Ready to generate your strategy</h2>
        <p className="text-muted">Our AI will analyze your inputs and create a custom growth playbook</p>
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

      {/* Main CTA button - hide when waitlist is showing */}
      {!shouldShowWaitlist && (
        <button
          onClick={() => {
            posthog?.capture("checkout_initiated", {
              method: hasValidCode ? "code" : "stripe",
            });
            onSubmit();
          }}
          disabled={isSubmitting || (hasValidCode && !canSubmitWithCode) || (!config.pricingEnabled && !hasValidCode)}
          className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all ${
            hasValidCode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : hasValidCode ? (
            "Generate Strategy — Free"
          ) : config.pricingEnabled ? (
            "Generate Strategy — $7.99"
          ) : (
            "Enter code to continue"
          )}
        </button>
      )}

      {/* Free mini-audit option - only show when pricing enabled and no promo code */}
      {config.pricingEnabled && !hasValidCode && !shouldShowWaitlist && formData && (
        <div className="mt-4">
          {!showFreeOption ? (
            <button
              onClick={() => {
                posthog?.capture("free_audit_option_clicked");
                setShowFreeOption(true);
              }}
              className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Just want a taste? Get a free mini-audit
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-sm mx-auto space-y-3"
            >
              <p className="text-sm text-muted">
                Enter your email for a condensed 5-section audit (vs 8 in the full version)
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-surface/50 border border-border/60 rounded-lg px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Mail className="w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={freeEmail}
                    onChange={(e) => setFreeEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/50 outline-none"
                  />
                </div>
                <button
                  onClick={handleFreeAuditSubmit}
                  disabled={!freeEmailValid || freeSubmitting}
                  className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface/80 transition-colors disabled:opacity-50"
                >
                  {freeSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get Free Audit"
                  )}
                </button>
              </div>
              {freeError && (
                <p className="text-sm text-red-500">{freeError}</p>
              )}
              <button
                onClick={() => setShowFreeOption(false)}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                ← Back to full version
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Promo code section */}
      <div>
        {!showCode && !hasValidCode && config.pricingEnabled && (
          <button
            onClick={() => {
              posthog?.capture("promo_code_toggled");
              setShowCode(true);
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Have a promo code?
          </button>
        )}

        {showCode && !hasValidCode && !shouldShowWaitlist && (
          <div className="max-w-xs mx-auto mt-4 space-y-2">
            {!config.pricingEnabled && (
              <p className="text-sm text-muted mb-3">Enter your promo code to continue</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-surface/50 text-sm text-foreground placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={validateCode}
                disabled={!promoCode.trim() || isValidatingCode}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface/80 transition-colors disabled:opacity-50"
              >
                {isValidatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            {codeStatus && !codeStatus.valid && config.pricingEnabled && (
              <p className="text-sm text-red-500">{codeStatus.error || "Invalid code"}</p>
            )}
          </div>
        )}

        {hasValidCode && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">
              Code applied: {codeStatus?.credits} free {codeStatus?.credits === 1 ? "strategy" : "strategies"}
            </span>
            <button onClick={clearCode} className="text-muted hover:text-foreground ml-2">
              ×
            </button>
          </div>
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
