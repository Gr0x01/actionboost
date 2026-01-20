import { Check, Search, StopCircle, PlayCircle, Zap, Calendar, LineChart } from "lucide-react";

const benefits = [
  {
    icon: Search,
    text: "Competitive landscape analysis",
    detail: "Real research, not generic",
  },
  {
    icon: StopCircle,
    text: "What to STOP doing",
    detail: "With clear reasoning",
  },
  {
    icon: PlayCircle,
    text: "What to START doing",
    detail: "Prioritized by impact",
  },
  {
    icon: Zap,
    text: "Quick wins for this week",
    detail: "Immediate actions",
  },
  {
    icon: Calendar,
    text: "30-day action roadmap",
    detail: "Step by step plan",
  },
  {
    icon: LineChart,
    text: "Metrics to track success",
    detail: "See what's moving",
  },
];

export function WhatYouGet() {
  return (
    <section id="features" className="relative py-24">
      {/* Background decoration */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium tracking-wide text-accent mb-3">
            What you get
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            What&apos;s in your <span className="text-gradient">action plan</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Research, priorities, and a plan. Built for your business, not a template.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.text}
              className={`group flex items-start gap-4 p-5 rounded-xl border border-transparent hover:border-border hover:bg-surface/50 transition-all duration-300 animate-slide-up stagger-${Math.min(index + 1, 5)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
              </div>
              <div>
                <span className="block font-semibold text-foreground group-hover:text-primary transition-colors">
                  {benefit.text}
                </span>
                <span className="block text-sm text-muted mt-0.5">
                  {benefit.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
