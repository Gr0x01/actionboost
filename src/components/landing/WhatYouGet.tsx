import { Target, ListOrdered, Calendar, RefreshCw } from "lucide-react";

const DELIVERABLES = [
  {
    icon: Target,
    title: "Where you're leaking growth",
    description:
      "We map your customer journey and find exactly where people drop off. Not theory — specific gaps in YOUR funnel.",
  },
  {
    icon: ListOrdered,
    title: "What to do first",
    description:
      "Every tactic scored by impact and effort. No more guessing. Just a prioritized list: do #1 first, then #2.",
  },
  {
    icon: Calendar,
    title: "Your 30-day roadmap",
    description:
      "Week-by-week actions you can actually execute. Not a vague strategy doc — specific tasks with deadlines.",
  },
  {
    icon: RefreshCw,
    title: "2 refinements included",
    description:
      '"Actually, we already tried that" — no problem. Tell us what\'s different and we\'ll adjust your Boost.',
  },
];

export function WhatYouGet() {
  return (
    <section className="relative py-20 bg-surface">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            What you get
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            A Boost you can <span className="font-black">actually use.</span>
          </h2>
        </div>

        {/* Grid of deliverables */}
        <div className="grid sm:grid-cols-2 gap-6">
          {DELIVERABLES.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border-2 border-foreground/15 bg-white p-6 lg:p-8"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cta/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-cta" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
