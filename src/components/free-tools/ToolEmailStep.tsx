"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronLeft, Loader2, Mail, Check } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { isValidEmail } from "@/lib/validation";

const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY;

interface ToolEmailStepProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  turnstileToken: string | null;
  setTurnstileToken: (t: string) => void;
  submitting: boolean;
  sendLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
}

export function ToolEmailStep({
  value,
  onChange,
  onSubmit,
  onBack,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  turnstileToken,
  setTurnstileToken,
  submitting,
  sendLabel = "Where should we send your results?",
  submitLabel = "Submit",
  loadingLabel = "Processing...",
}: ToolEmailStepProps) {
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
        {sendLabel}
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
        We don&apos;t share your data or send spam. Just your results.
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
              {loadingLabel}
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
