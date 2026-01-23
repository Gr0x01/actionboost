"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";

interface TractionInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  autoFocus?: boolean;
}

const TRACTION_CHIPS = ["Pre-launch", "< 100 users", "100-1K users", "1K-10K users", "10K+ users"];

export function TractionInput({ value, onChange, onSubmit, onBack, autoFocus = false }: TractionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChipClick = (chip: string) => {
    onChange(chip);
    setTimeout(onSubmit, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {TRACTION_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className={`rounded-xl px-4 py-2 border-2 text-sm font-bold transition-all duration-100 ${
              value === chip
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-foreground/30 text-foreground hover:border-foreground hover:shadow-[2px_2px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="text-center text-foreground/50 text-sm font-mono">or type specifics</div>

      <div className="rounded-xl border-2 border-foreground/30 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 500 users, $2k MRR, 10k monthly visitors"
          className="w-full bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
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
        {value.trim() && (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 bg-cta text-white text-sm font-bold border-2 border-cta shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
