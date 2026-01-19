import Link from "next/link";
import { Button } from "@/components/ui";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Full competitive analysis",
  "Prioritized recommendations",
  "30-day action roadmap",
  "Quick wins for this week",
  "Metrics to track",
];

export function Pricing() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cta/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider text-primary uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Simple, <span className="text-gradient">transparent</span> pricing
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            One payment. No subscription. No account required.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {/* Single */}
          <div className="relative group animate-slide-up stagger-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl border border-border bg-background p-8 hover-lift">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  Single Strategy
                </h3>
                <div className="mt-6 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">$15</span>
                </div>
                <p className="mt-2 text-sm text-muted">One-time payment</p>
              </div>

              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/start" className="block">
                  <Button className="w-full" size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 3-Pack - Featured */}
          <div className="relative group animate-slide-up stagger-2">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cta to-accent rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />

            <div className="relative rounded-2xl border-2 border-cta bg-background p-8">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cta to-accent px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  Best Value
                </span>
              </div>

              <div className="text-center pt-2">
                <h3 className="text-xl font-semibold text-foreground">
                  3-Pack
                </h3>
                <div className="mt-6 flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-foreground">$30</span>
                  <span className="text-xl text-muted line-through">$45</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  $10 per strategy &mdash; <span className="text-cta font-medium">Save $15</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-muted">{feature}</span>
                  </li>
                ))}
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cta/20">
                    <Check className="h-3 w-3 text-cta" strokeWidth={3} />
                  </div>
                  <span className="font-medium text-foreground">
                    3 strategy credits
                  </span>
                </li>
              </ul>

              <div className="mt-8">
                <Link href="/start?pack=3" className="block">
                  <Button className="w-full glow-cta" size="lg">
                    Get 3-Pack
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust */}
        <p className="mt-12 text-center text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Powered by Claude Opus 4.5 + live competitive research
          </span>
        </p>
      </div>
    </section>
  );
}
