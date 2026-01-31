"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-1.5 bg-foreground/10 overflow-hidden">
        <motion.div
          className="h-full bg-cta"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      {label && (
        <p className="text-xs text-foreground/40 text-center mt-2 font-medium">
          {label}
        </p>
      )}
    </div>
  );
}
