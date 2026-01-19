"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Mail } from "lucide-react";
import { isValidEmail } from "@/lib/validation";
import { config } from "@/lib/config";

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
}: CheckoutSectionProps) {
  const [showCode, setShowCode] = useState(!config.pricingEnabled);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const emailValid = isValidEmail(email);
  const canSubmitWithCode = hasValidCode && emailValid;
  const waitlistEmailValid = isValidEmail(waitlistEmail);

  // Show waitlist when code fails and pricing is disabled
  const shouldShowWaitlist = !config.pricingEnabled && codeStatus && !codeStatus.valid && !hasValidCode;

  async function handleWaitlistSubmit() {
    if (!waitlistEmailValid) return;

    setWaitlistSubmitting(true);
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail, source: "checkout" }),
      });

      if (res.ok) {
        setWaitlistSuccess(true);
      } else {
        setWaitlistError("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Waitlist error:", error);
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
          onClick={onSubmit}
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

      {/* Promo code section */}
      <div>
        {!showCode && !hasValidCode && config.pricingEnabled && (
          <button
            onClick={() => setShowCode(true)}
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
