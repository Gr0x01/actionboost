'use client'

import { ArrowRight } from "lucide-react";
import { config } from "@/lib/config";
import { prefillStartForm } from "@/lib/prefill";

interface ToolBoostPitchProps {
  headline: string;
  description: string;
  /** Prefill data to carry forward to /start */
  prefill?: { websiteUrl?: string; productDescription?: string };
}

export function ToolBoostPitch({ headline, description, prefill }: ToolBoostPitchProps) {
  return (
    <div
      className="bg-foreground text-white rounded-md p-6 md:p-8"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.2)" }}
    >
      <h2 className="text-xl md:text-2xl font-bold mb-3">{headline}</h2>
      <p className="text-white/70 text-sm mb-4 leading-relaxed">{description}</p>
      <a
        href="/start"
        onClick={() => prefill && prefillStartForm(prefill)}
        className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-sm"
      >
        Get my full Boost — {config.singlePrice}
        <ArrowRight className="w-4 h-4" />
      </a>
      <p className="mt-3 text-white/40 text-xs">
        One-time payment. No subscription.
      </p>
    </div>
  );
}
