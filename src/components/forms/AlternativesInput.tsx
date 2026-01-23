"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, Plus } from "lucide-react";
import { ALTERNATIVES_CHIPS } from "@/lib/types/form";

interface AlternativesInputProps {
  value: string[];
  onChange: (v: string[]) => void;
  onSubmit: () => void;
  onBack?: () => void;
}

export function AlternativesInput({ value, onChange, onSubmit, onBack }: AlternativesInputProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleChip = (chipLabel: string) => {
    if (value.includes(chipLabel)) {
      onChange(value.filter((v) => v !== chipLabel));
    } else {
      onChange([...value, chipLabel]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (customInput.trim()) {
        addCustom();
      } else if (value.length > 0) {
        onSubmit();
      }
    }
  };

  // Check if a value is a custom entry (not one of the preset chips)
  const isCustomValue = (v: string) => !ALTERNATIVES_CHIPS.some((chip) => chip.label === v);

  return (
    <div className="space-y-6">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALTERNATIVES_CHIPS.map((chip) => {
          const isSelected = value.includes(chip.label);
          return (
            <button
              key={chip.id}
              onClick={() => toggleChip(chip.label)}
              className={`rounded-xl px-4 py-2 border-2 text-sm font-bold transition-all duration-100 ${
                isSelected
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-foreground/30 text-foreground hover:border-foreground hover:shadow-[2px_2px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5"
              }`}
            >
              <span>{chip.label}</span>
              <span className="ml-1.5 opacity-60 font-normal">({chip.description})</span>
            </button>
          );
        })}
      </div>

      {/* Custom entries display */}
      {value.filter(isCustomValue).length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {value.filter(isCustomValue).map((custom) => (
            <button
              key={custom}
              onClick={() => onChange(value.filter((v) => v !== custom))}
              className="rounded-xl px-3 py-1.5 border-2 text-sm font-bold bg-foreground text-background border-foreground flex items-center gap-1.5"
            >
              {custom}
              <span className="opacity-60">&times;</span>
            </button>
          ))}
        </div>
      )}

      <div className="text-center text-foreground/50 text-sm font-mono">or add your own</div>

      {/* Custom input */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl border-2 border-foreground/30 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Use a competitor, hire a freelancer..."
            className="w-full bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
          />
        </div>
        {customInput.trim() && (
          <button
            onClick={addCustom}
            className="rounded-xl px-4 py-3 bg-foreground/10 border-2 border-foreground/30 hover:border-foreground transition-colors"
          >
            <Plus className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
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
        {value.length > 0 && (
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
