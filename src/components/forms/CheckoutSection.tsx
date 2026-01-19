"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface CheckoutSectionProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  hasValidCode: boolean;
  promoCode: string;
  setPromoCode: (v: string) => void;
  codeStatus: { valid: boolean; credits?: number; error?: string } | null;
  validateCode: () => void;
  isValidatingCode: boolean;
  clearCode: () => void;
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
}: CheckoutSectionProps) {
  const [showCode, setShowCode] = useState(false);

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

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
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
        ) : (
          "Generate Strategy — $15"
        )}
      </button>

      {/* Promo code */}
      <div>
        {!showCode && !hasValidCode && (
          <button
            onClick={() => setShowCode(true)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Have a promo code?
          </button>
        )}

        {showCode && !hasValidCode && (
          <div className="max-w-xs mx-auto mt-4 space-y-2">
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
            {codeStatus && !codeStatus.valid && (
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
    </motion.div>
  );
}
