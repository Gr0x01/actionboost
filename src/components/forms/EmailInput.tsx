"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, ArrowRight, ChevronLeft, Check } from "lucide-react";
import { isValidEmail } from "@/lib/validation";

interface EmailInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function EmailInput({ value, onChange, onSubmit, onSkip, onBack }: EmailInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const emailValid = isValidEmail(value);
  const showError = hasInteracted && value.trim() && !emailValid;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && emailValid) {
      onSubmit();
    }
  };

  const handleBlur = () => {
    setHasInteracted(true);
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-3 border-2 bg-background px-4 py-4 transition-colors ${
        showError
          ? "border-red-500"
          : emailValid
            ? "border-green-500"
            : "border-foreground/30 focus-within:border-foreground"
      }`}>
        <Mail className={`w-5 h-5 ${emailValid ? "text-green-500" : "text-foreground/40"}`} />
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="your@email.com"
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
        />
        {emailValid && <Check className="w-5 h-5 text-green-500" />}
      </div>

      {showError && (
        <p className="mt-2 text-sm text-red-500 font-bold">Please enter a valid email address</p>
      )}

      <p className="mt-2 text-sm text-foreground/50">
        We&apos;ll send your strategy here (and never spam you)
      </p>

      <div className="flex items-center justify-between mt-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {onSkip && !value.trim() && (
            <button
              onClick={onSkip}
              className="px-4 py-2 border-2 border-foreground/30 text-sm font-bold text-foreground/60 hover:border-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={emailValid ? onSubmit : (value.trim() ? undefined : onSkip)}
            disabled={!!value.trim() && !emailValid}
            className="flex items-center gap-1.5 px-4 py-2 bg-cta text-white text-sm font-bold border-2 border-cta shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
