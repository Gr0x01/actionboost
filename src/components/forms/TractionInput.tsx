"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";

interface TractionInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
}

const TRACTION_CHIPS = ["Pre-launch", "< 100 users", "100-1K users", "1K-10K users", "10K+ users"];

export function TractionInput({ value, onChange, onSubmit, onBack }: TractionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {TRACTION_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              value === chip
                ? "bg-primary text-white border-primary"
                : "bg-surface/50 border-border/60 text-foreground hover:border-primary/50 hover:bg-surface"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="text-center text-muted text-sm">or type specifics</div>
      <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 500 users, $2k MRR, 10k monthly visitors"
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
        {value.trim() && !TRACTION_CHIPS.includes(value) && (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
