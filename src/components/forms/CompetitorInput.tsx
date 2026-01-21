"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, X } from "lucide-react";

interface CompetitorInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

export function CompetitorInput({
  value,
  onChange,
  onSubmit,
  onSkip,
  onBack,
}: CompetitorInputProps) {
  const [current, setCurrent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addCompetitor = () => {
    if (current.trim() && value.length < 3) {
      onChange([...value, current.trim()]);
      setCurrent("");
    }
  };

  const removeCompetitor = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (current.trim()) {
        addCompetitor();
      } else if (value.length > 0) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-foreground text-background text-sm font-bold"
            >
              {url}
              <button
                onClick={() => removeCompetitor(i)}
                className="text-background/60 hover:text-background"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {value.length < 3 && (
        <div className="rounded-xl border-2 border-foreground/30 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
          <input
            ref={inputRef}
            type="url"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://competitor.com"
            className="w-full bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
          />
        </div>
      )}

      {current.trim() && (
        <div className="flex justify-center">
          <button
            onClick={addCompetitor}
            className="text-sm font-bold text-cta hover:text-cta/80 transition-colors"
          >
            + Add ({value.length}/3)
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
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
          {value.length === 0 && (
            <button
              onClick={onSkip}
              className="rounded-xl px-4 py-2 border-2 border-foreground/30 text-sm font-bold text-foreground/60 hover:border-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={value.length > 0 ? onSubmit : onSkip}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 bg-cta text-white text-sm font-bold border-2 border-cta shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
