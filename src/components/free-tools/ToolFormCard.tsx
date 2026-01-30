"use client";

import { AnimatePresence } from "framer-motion";

interface ToolFormCardProps {
  id: string;
  step: number;
  totalSteps: number;
  error: string | null;
  children: React.ReactNode;
}

export function ToolFormCard({ id, step, totalSteps, error, children }: ToolFormCardProps) {
  return (
    <div id={id} className="max-w-lg mx-auto px-6 mt-12">
      <div
        className="relative bg-white border-2 border-foreground/20 rounded-xl p-8 md:p-10 overflow-hidden"
        style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.15)" }}
      >
        {/* Orange top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-cta rounded-t-xl" />

        {/* Progress dots — only show after step 0 */}
        {step > 0 && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-cta w-8" : "bg-foreground/15 w-4"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>

        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
