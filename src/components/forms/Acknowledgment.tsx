"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface AcknowledgmentProps {
  text: string;
}

export function Acknowledgment({ text }: AcknowledgmentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-center gap-2 text-cta"
    >
      <Check className="w-5 h-5" />
      <span className="text-lg font-bold">{text}</span>
    </motion.div>
  );
}
