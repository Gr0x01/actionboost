import Link from "next/link";
import { Button } from "@/components/ui";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh py-24 lg:py-32">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 -right-32 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float stagger-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cta/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-4 py-2 text-sm font-medium text-muted shadow-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            AI-powered growth strategy
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-slide-up stagger-1">
          <span className="text-foreground">Stuck on growth?</span>
          <br />
          <span className="text-gradient">Get your next moves.</span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg text-muted sm:text-xl max-w-2xl mx-auto animate-slide-up stagger-2">
          Real competitive research. Prioritized recommendations.
          <br className="hidden sm:block" />
          A 30-day roadmap built for <em>your</em> business.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
          <Link href="/start">
            <Button size="lg" className="glow-cta text-lg px-8 py-4">
              Get Started &mdash; $15
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="secondary" size="lg" className="text-lg">
              See how it works
            </Button>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted animate-fade-in stagger-4">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            No account required
          </span>
          <span className="hidden sm:block text-border">|</span>
          <span>Takes 5-10 minutes</span>
          <span className="hidden sm:block text-border">|</span>
          <span>Powered by Claude Opus 4.5</span>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
