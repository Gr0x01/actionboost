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
  formData?: FormInput;
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

  const [showFreeOption, setShowFreeOption] = useState(false);
  const [freeEmail, setFreeEmail] = useState("");
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);
  const freeSubmitRef = useRef(false);

  const emailValid = isValidEmail(email);
  const canSubmitWithCode = hasValidCode && emailValid;
  const waitlistEmailValid = isValidEmail(waitlistEmail);
  const freeEmailValid = isValidEmail(freeEmail);

  const shouldShowWaitlist = !config.pricingEnabled && codeStatus && !codeStatus.valid && !hasValidCode;

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

      if (res.ok && data.freeAuditId && data.token) {
        posthog?.capture("free_audit_success", { free_audit_id: data.freeAuditId });
        router.push(`/free-results/${data.freeAuditId}?new=1&token=${encodeURIComponent(data.token)}`);
      } else if (res.status === 409) {
        posthog?.capture("free_audit_duplicate", { error: data.error });
        setFreeError("You've already received a free audit. Get the full version for deeper insights!");
      } else {
        posthog?.capture("free_audit_error", { error: data.error });
        setFreeError(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Free audit error:", error);
      posthog?.capture("checkout_api_error", { type: "free_audit", error: "network_error" });
      setFreeError("Connection failed. Please try again.");
    } finally {
      setFreeSubmitting(false);
      freeSubmitRef.current = false;
    }
  }

  useEffect(() => {
    if (!hasTrackedView.current) {
      posthog?.capture("checkout_viewed", {
        pricing_enabled: config.pricingEnabled,
        has_valid_code: hasValidCode,
      });
      hasTrackedView.current = true;
    }
  }, [posthog, hasValidCode]);

  useEffect(() => {
    if (shouldShowWaitlist && !hasTrackedWaitlist.current) {
      posthog?.capture("waitlist_viewed", { reason: codeStatus?.errorCode || "invalid_code" });
      hasTrackedWaitlist.current = true;
    }
  }, [shouldShowWaitlist, posthog, codeStatus?.errorCode]);

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
      posthog?.capture("checkout_api_error", { type: "waitlist", error: "network_error" });
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
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
          Ready to <span className="font-black">generate your plan</span>
        </h2>
        <p className="text-foreground/60 text-lg max-w-md mx-auto">
          Our AI will analyze your inputs and create a custom growth playbook
        </p>
      </div>

      {/* Email input for promo code users */}
      {hasValidCode && (
        <div className="max-w-sm mx-auto mb-6 space-y-2">
          <div className="flex items-center gap-3 border-2 border-foreground/30 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
            <Mail className="w-5 h-5 text-foreground/40" />
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
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
            />
          </div>
          {email.trim() && !emailValid ? (
            <p className="text-xs text-red-500 text-center font-bold">Please enter a valid email</p>
          ) : (
            <p className="text-xs text-foreground/50 text-center font-mono">Results sent via magic link</p>
          )}
        </div>
      )}

      {/* Main CTA button */}
      {!shouldShowWaitlist && !showFreeOption && (
        <button
          type="button"
          onClick={() => {
            posthog?.capture("checkout_initiated", { method: hasValidCode ? "code" : "stripe" });
            onSubmit();
          }}
          disabled={isSubmitting || (hasValidCode && !canSubmitWithCode) || (!config.pricingEnabled && !hasValidCode)}
          className={`px-10 py-5 text-lg font-bold transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${
            hasValidCode
              ? "bg-green-600 text-white border-2 border-green-600 shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0"
              : "bg-cta text-white border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </span>
          ) : hasValidCode ? (
            "Generate Action Plan — Free"
          ) : config.pricingEnabled ? (
            <>Generate Action Plan — {config.singlePrice}</>
          ) : (
            "Enter code to continue"
          )}
        </button>
      )}

      {/* Free mini-audit option */}
      {config.pricingEnabled && !hasValidCode && !shouldShowWaitlist && formData && (
        <div className="pt-2">
          {!showFreeOption ? (
            <button
              type="button"
              onClick={() => {
                posthog?.capture("free_audit_option_clicked");
                setShowFreeOption(true);
              }}
              className="group text-sm text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-cta" />
              <span>Just want a taste? Get a free mini-audit</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto p-6 border-2 border-foreground/20 bg-background space-y-4"
            >
              <div className="flex items-center gap-2 justify-center text-cta">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">Free Mini-Audit</span>
              </div>
              <p className="text-sm text-foreground/60">
                Get a condensed 5-section audit to preview our analysis style
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 border-2 border-foreground/30 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
                  <Mail className="w-4 h-4 text-foreground/40" />
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
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFreeAuditSubmit}
                  disabled={!freeEmailValid || freeSubmitting}
                  className="px-5 py-3 bg-cta text-white text-sm font-bold border-2 border-cta hover:bg-cta-hover transition-colors disabled:opacity-50"
                >
                  {freeSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get It"}
                </button>
              </div>
              {freeError && <p className="text-sm text-red-500 font-bold">{freeError}</p>}
              <button
                type="button"
                onClick={() => setShowFreeOption(false)}
                className="text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                ← Back to full version
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Promo code section */}
      <div>
        {!showCode && !hasValidCode && config.pricingEnabled && !showFreeOption && (
          <button
            onClick={() => {
              posthog?.capture("promo_code_toggled");
              setShowCode(true);
            }}
            className="text-sm text-cta hover:text-cta/80 transition-colors underline underline-offset-2"
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
              <p className="text-sm text-foreground/60">Enter your promo code to continue</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 border-2 border-foreground/30 bg-background text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground focus:outline-none font-mono tracking-wider"
              />
              <button
                onClick={validateCode}
                disabled={!promoCode.trim() || isValidatingCode}
                className="px-5 py-3 bg-foreground text-background text-sm font-bold border-2 border-foreground hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {isValidatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            {codeStatus && !codeStatus.valid && config.pricingEnabled && (
              <p className="text-sm text-red-500 font-bold">{codeStatus.error || "Invalid code"}</p>
            )}
          </motion.div>
        )}

        {hasValidCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">
              {codeStatus?.credits} free {codeStatus?.credits === 1 ? "action plan" : "action plans"}
            </span>
            <button onClick={clearCode} className="text-white/70 hover:text-white ml-1 text-lg leading-none">
              ×
            </button>
          </motion.div>
        )}
      </div>

      {/* Waitlist fallback */}
      {shouldShowWaitlist && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto p-6 border-2 border-foreground/20 bg-background"
        >
          {waitlistSuccess ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-600 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-bold text-foreground mb-1">You&apos;re on the list!</p>
              <p className="text-sm text-foreground/60">We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground mb-1">We&apos;re launching this week!</p>
              <p className="text-sm text-foreground/60 mb-4">Join the waitlist to get notified.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 border-2 border-foreground/30 bg-background text-sm text-foreground placeholder:text-foreground/30 focus:border-foreground focus:outline-none"
                />
                <button
                  onClick={handleWaitlistSubmit}
                  disabled={!waitlistEmailValid || waitlistSubmitting}
                  className="px-4 py-2 bg-foreground text-background text-sm font-bold border-2 border-foreground hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {waitlistSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                </button>
              </div>
              {waitlistError && <p className="text-sm text-red-500 mt-2 font-bold">{waitlistError}</p>}
              <button
                onClick={() => {
                  clearCode();
                  setShowCode(true);
                }}
                className="mt-3 text-xs text-foreground/50 hover:text-foreground transition-colors"
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
