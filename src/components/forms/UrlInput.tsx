"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ArrowRight, ChevronLeft } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function UrlInput({ value, onChange, onSubmit, onSkip, onBack }: UrlInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (value && value.includes(".")) {
      try {
        const url = value.startsWith("http") ? value : `https://${value}`;
        const domain = new URL(url).hostname;
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
      } catch {
        setFavicon(null);
      }
    } else {
      setFavicon(null);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/30 bg-background px-4 py-4 focus-within:border-foreground transition-colors">
        {favicon ? (
          <img src={favicon} alt="" className="w-5 h-5" />
        ) : (
          <Globe className="w-5 h-5 text-foreground/40" />
        )}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://yourproduct.com"
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
        />
      </div>
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
              className="rounded-xl px-4 py-2 border-2 border-foreground/30 text-sm font-bold text-foreground/60 hover:border-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={value.trim() ? onSubmit : onSkip}
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
