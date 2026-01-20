import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Frameworks() {
  return (
    <section id="how-it-works" className="relative pt-16 pb-24 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background opacity-60" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Dogfooding callout */}
        <Link
          href="/blog/our-growth-plan"
          className="group flex items-center justify-between gap-4 mb-16 py-2.5 px-5 rounded-lg bg-background border border-border hover:border-primary/30 transition-all duration-200 animate-slide-up max-w-xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-primary tracking-wide">DOGFOODING</span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span className="text-sm text-muted">We ran Actionboo.st on itself</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium shrink-0">
            <span className="hidden sm:inline">Read our plan</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium tracking-wide text-accent mb-3">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            The same frameworks <span className="text-gradient">real growth teams use</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Not ChatGPT vibes. Actual growth methodology, applied to your business.
          </p>
        </div>

        {/* Framework cards - 3 columns */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* AARRR */}
          <div className="animate-slide-up stagger-1">
            <h3 className="text-xl font-bold text-navy mb-3">
              <span className="font-mono text-primary">AARRR</span>
              <span className="text-muted font-normal text-base ml-2">(Pirate Metrics)</span>
            </h3>
            <p className="text-muted leading-relaxed">
              <span className="font-semibold text-foreground">Acquisition, Activation, Retention, Referral, Revenue.</span>
              {" "}We analyze where you&apos;re leaking&nbsp;growth.
            </p>
          </div>

          {/* ICE */}
          <div className="animate-slide-up stagger-2">
            <h3 className="text-xl font-bold text-navy mb-3">
              <span className="font-mono text-primary">ICE</span>
              <span className="text-muted font-normal text-base ml-2">Prioritization</span>
            </h3>
            <p className="text-muted leading-relaxed">
              Every recommendation scored by{" "}
              <span className="font-semibold text-foreground">Impact</span>,{" "}
              <span className="font-semibold text-foreground">Confidence</span>, and{" "}
              <span className="font-semibold text-foreground">Ease</span>.
              {" "}Know exactly where to&nbsp;focus.
            </p>
          </div>

          {/* Growth Equation */}
          <div className="animate-slide-up stagger-3">
            <h3 className="text-xl font-bold text-navy mb-3">
              <span className="font-mono text-primary">Growth</span>
              <span className="text-muted font-normal text-base ml-2">Equation</span>
            </h3>
            <p className="text-muted leading-relaxed">
              <code className="font-mono text-sm text-navy/70">
                (Users × Activation × Retention × Referral)&nbsp;−&nbsp;Churn
              </code>
              <br />
              We find where to&nbsp;focus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
