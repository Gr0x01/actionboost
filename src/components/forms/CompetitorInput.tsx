"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";

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
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm"
            >
              {url}
              <button
                onClick={() => removeCompetitor(i)}
                className="text-muted hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {value.length < 3 && (
        <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            ref={inputRef}
            type="url"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://competitor.com"
            className="w-full bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none"
          />
        </div>
      )}

      {current.trim() && (
        <div className="flex justify-center">
          <button
            onClick={addCompetitor}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            + Add ({value.length}/3)
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
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
        <div className="flex items-center gap-2">
          {value.length === 0 && (
            <button
              onClick={onSkip}
              className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium text-muted hover:text-foreground hover:border-border transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={value.length > 0 ? onSubmit : onSkip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
