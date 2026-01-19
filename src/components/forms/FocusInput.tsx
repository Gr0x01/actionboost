"use client";

import { useState, useRef, useEffect } from "react";
import { Users, Zap, RefreshCw, Share2, DollarSign, MessageSquare, ArrowRight, ChevronLeft } from "lucide-react";
import type { FocusArea } from "@/lib/types/form";

interface FocusInputProps {
  value: FocusArea;
  onChange: (v: FocusArea) => void;
  onSubmit: () => void;
  onBack?: () => void;
  customChallenge?: string;
  onCustomChallengeChange?: (v: string) => void;
}

const FOCUS_OPTIONS: { value: FocusArea; label: string; hint: string; icon: React.ReactNode }[] = [
  { value: "acquisition", label: "Acquisition", hint: "Get more users", icon: <Users className="w-5 h-5" /> },
  { value: "activation", label: "Activation", hint: "Users don't stick", icon: <Zap className="w-5 h-5" /> },
  { value: "retention", label: "Retention", hint: "Users leave", icon: <RefreshCw className="w-5 h-5" /> },
  { value: "referral", label: "Referral", hint: "Spread the word", icon: <Share2 className="w-5 h-5" /> },
  { value: "monetization", label: "Monetization", hint: "No revenue yet", icon: <DollarSign className="w-5 h-5" /> },
  { value: "custom", label: "Other", hint: "Specific challenge", icon: <MessageSquare className="w-5 h-5" /> },
];

export function FocusInput({
  value,
  onChange,
  onSubmit,
  onBack,
  customChallenge = "",
  onCustomChallengeChange,
}: FocusInputProps) {
  const [showCustomInput, setShowCustomInput] = useState(value === "custom");
  const [localCustom, setLocalCustom] = useState(customChallenge);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleSelect = (v: FocusArea) => {
    onChange(v);
    if (v === "custom") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setTimeout(onSubmit, 150);
    }
  };

  const handleCustomSubmit = () => {
    if (localCustom.trim()) {
      onCustomChallengeChange?.(localCustom);
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && localCustom.trim()) {
      handleCustomSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
        {FOCUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
              value === option.value
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                : "bg-surface/50 border-border/60 text-foreground hover:border-primary/50 hover:bg-surface"
            }`}
          >
            <span className={value === option.value ? "text-white" : "text-primary"}>
              {option.icon}
            </span>
            <span className="font-medium text-sm">{option.label}</span>
            <span className={`text-xs ${value === option.value ? "text-white/80" : "text-muted"}`}>
              {option.hint}
            </span>
          </button>
        ))}
      </div>

      {showCustomInput && (
        <div className="max-w-md mx-auto space-y-3">
          <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={localCustom}
              onChange={(e) => setLocalCustom(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's your biggest challenge right now?"
              className="w-full bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleCustomSubmit}
              disabled={!localCustom.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {!showCustomInput && onBack && (
        <div className="flex justify-center">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}
    </div>
  );
}
