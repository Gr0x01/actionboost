"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { MAX_TOTAL_CHARS } from "@/lib/types/form";

interface TextareaInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  placeholder?: string;
  /** Current total chars across all form fields */
  currentTotal?: number;
  /** Max total chars allowed (default 25000) */
  maxTotal?: number;
}

export function TextareaInput({
  value,
  onChange,
  onSubmit,
  onBack,
  placeholder,
  currentTotal,
  maxTotal = MAX_TOTAL_CHARS,
}: TextareaInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Show counter when >80% of limit
  const showCounter = currentTotal !== undefined && currentTotal > maxTotal * 0.8;
  const isWarning = currentTotal !== undefined && currentTotal > maxTotal * 0.9;
  const isOver = currentTotal !== undefined && currentTotal > maxTotal;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim() && !isOver) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Auto-resize up to max height, then scroll
  const maxHeight = 300; // px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [value]);

  return (
    <div className="relative">
      <div className="rounded-xl border-2 border-foreground/30 bg-background px-4 py-4 focus-within:border-foreground transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your answer..."}
          rows={2}
          className="w-full bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none resize-none min-h-[60px]"
        />
      </div>

      {/* Character counter - only shows when >80% of limit */}
      {showCounter && (
        <p className={`text-xs font-mono mt-2 text-right ${isOver ? "text-red-500 font-bold" : isWarning ? "text-amber-500" : "text-foreground/50"}`}>
          {currentTotal?.toLocaleString()} / {maxTotal.toLocaleString()} characters
          {isOver && " (over limit)"}
        </p>
      )}

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
          <p className="text-xs text-foreground/40 font-mono">Shift+Enter for new line</p>
        )}
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isOver}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 bg-cta text-white text-sm font-bold border-2 border-cta shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0 transition-all duration-100"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
