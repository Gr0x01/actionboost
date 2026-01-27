/**
 * ResearchProof - "Generic advice vs. your actual market"
 *
 * Left: ChatGPT-style chat bubbles (flat, grey, generic)
 * Right: Actual Boost product components (rich, data-dense, specific)
 * The visual contrast does the persuading.
 */

import { Bot } from "lucide-react";

const CHAT_MESSAGES = [
  "Focus on creating high-quality content that provides value to your target audience. Post 3-4 times per week.",
  "Consider investing in SEO to improve your organic rankings. Target long-tail keywords related to your niche.",
  "Email marketing is one of the most effective channels. Start a newsletter and send weekly updates.",
];

export function ResearchProof() {
  return (
    <section className="relative py-16 sm:py-20 bg-surface">
      <div className="mx-auto max-w-5xl px-6">
        {/* Headline */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            The difference
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            Generic advice vs.{" "}
            <span className="font-black">your actual market.</span>
          </h2>
        </div>

        {/* Comparison grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Generic AI chat */}
          <div className="lg:pr-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/40 mb-4">
              Ask any AI chatbot
            </p>
            <div className="space-y-4">
              {CHAT_MESSAGES.map((msg, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-4 last:mb-0">
                  <div className="w-7 h-7 rounded-full bg-[#ABABAB] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-base text-[#374151] leading-relaxed">
                      {msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop divider */}
          <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center justify-center z-10">
            <div className="w-px h-full bg-foreground/10 absolute" />
            <span className="relative bg-surface px-2 py-1 text-[11px] font-mono font-bold text-foreground/30 uppercase tracking-widest">
              vs
            </span>
          </div>

          {/* Mobile divider */}
          <div className="flex items-center gap-3 my-6 lg:hidden">
            <div className="h-px flex-1 bg-foreground/10" />
            <span className="text-[11px] font-mono font-bold text-foreground/30 uppercase tracking-widest">
              vs
            </span>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          {/* Right: Boost product UI */}
          <div className="lg:pl-8 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cta font-bold mb-4">
              Ask Boost
            </p>

            {/* Key Discovery card — matches LeadDiscovery.tsx */}
            <div
              className="bg-white border-2 border-foreground/20 rounded-md p-5 relative"
              style={{ boxShadow: "6px 6px 0 rgba(44, 62, 80, 0.12)" }}
            >
              <span className="inline-block font-mono text-[10px] uppercase tracking-wider text-foreground/50 bg-foreground/5 px-2 py-1 rounded mb-3">
                Competitive intel
              </span>
              <h4 className="text-xl font-bold text-foreground leading-tight">
                Pinterest drives 3x more tattoo bookings than Instagram DMs
              </h4>
              <p className="text-base text-foreground/80 mt-3 leading-relaxed">
                Your competitors get 40% of traffic from Pinterest. You have
                zero presence there.
              </p>
              <div className="mt-4 pt-3 border-t border-foreground/10">
                <cite className="block text-sm text-foreground/50 italic">
                  Traffic analysis + Pinterest Trends
                </cite>
              </div>
            </div>

            {/* Priority #1 card — matches PriorityCards.tsx */}
            <div
              className="relative bg-white border-2 border-foreground/25 rounded-md p-5 mt-4"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              <div
                className="absolute -top-3 -left-1 font-mono font-bold px-3 py-1 rounded-md bg-cta text-white text-sm"
                style={{ boxShadow: "2px 2px 0 rgba(44, 62, 80, 0.15)" }}
              >
                #1
              </div>
              <h4 className="text-lg font-bold text-foreground leading-snug mt-1">
                Create Pinterest boards for your top 5 tattoo styles
              </h4>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">
                Set up boards for each specialty style, pin reference images
                and finished work. High-intent planners save these before booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
