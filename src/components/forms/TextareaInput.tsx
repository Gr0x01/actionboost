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
      <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your answer..."}
          rows={2}
          className="w-full bg-transparent font-serif text-lg text-foreground placeholder:font-sans placeholder:text-muted/50 outline-none resize-none min-h-[60px]"
        />
      </div>

      {/* Character counter - only shows when >80% of limit */}
      {showCounter && (
        <p className={`text-xs mt-2 text-right ${isOver ? "text-red-500 font-medium" : isWarning ? "text-amber-500" : "text-muted"}`}>
          {currentTotal?.toLocaleString()} / {maxTotal.toLocaleString()} characters
          {isOver && " (over limit)"}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <p className="text-xs text-muted">Shift+Enter for new line</p>
        )}
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isOver}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
