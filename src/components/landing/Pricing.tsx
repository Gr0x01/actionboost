import Link from "next/link";
import { config } from "@/lib/config";
import { PaidTierButton } from "./PricingButtons";

export function Pricing() {
  return (
    <section id="pricing" className="relative pt-16 pb-24">
      {/* Subtle warm gradient continuation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(243, 156, 18, 0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-12 text-center max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight text-balance">
            One plan.{" "}
            <span className="font-black">One price.</span>
          </h2>
        </div>

        {/* Value stack */}
        <div className="max-w-md mx-auto mb-10 text-sm font-mono">
          <p className="text-foreground/50 uppercase tracking-wider text-xs mb-4 text-center">
            What this would cost elsewhere
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground/60">Competitor analysis tool</span>
              <span className="text-foreground/40 line-through">$99/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Marketing strategist (1 hour)</span>
              <span className="text-foreground/40 line-through">$200+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Agency discovery session</span>
              <span className="text-foreground/40 line-through">$500+</span>
            </div>
          </div>
          <div className="border-t border-foreground/20 mt-4 pt-4 flex justify-between">
            <span className="font-bold text-foreground font-sans">Your complete plan</span>
            <span className="font-bold text-cta">{config.singlePrice}</span>
          </div>
        </div>

        {/* Desktop: two-column grid, Mobile: single column */}
        <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

          {/* Pricing card - left column */}
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <div
              className="rounded-xl border-2 border-foreground/20 bg-white p-8 lg:p-10"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              {/* Price */}
              <div className="mb-8 text-center lg:text-left">
                <div className="flex items-baseline justify-center lg:justify-start gap-2">
                  <h3 className="text-6xl font-black text-foreground tracking-tight">{config.singlePrice}</h3>
                  <span className="text-lg text-foreground/50 font-medium">one-time</span>
                </div>
              </div>

              {/* What's included */}
              <div className="space-y-3 mb-8">
                <FeatureItem emphasis>Competitor research &amp; traffic analysis</FeatureItem>
                <FeatureItem emphasis>Customer journey breakdown</FeatureItem>
                <FeatureItem emphasis>Prioritized tactics (ranked by impact)</FeatureItem>
                <FeatureItem emphasis>30-day week-by-week roadmap</FeatureItem>
                <FeatureItem>2 refinements included</FeatureItem>
              </div>

              {/* CTA */}
              <div>
                <PaidTierButton />
                <p className="mt-4 text-center text-sm text-foreground/50">
                  Didn&apos;t help? <span className="font-bold text-foreground/80">Full refund.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Social proof column - right side on desktop, below on mobile */}
          <div className="mt-8 space-y-4 max-w-md mx-auto lg:mt-0 lg:max-w-none lg:mx-0">

            {/* In-Action callout + Trust links */}
            <div
              className="rounded-xl border-2 border-cta bg-white overflow-hidden"
              style={{ boxShadow: "4px 4px 0 rgba(230, 126, 34, 0.35)" }}
            >
              <Link
                href="/in-action"
                className="group flex items-center justify-between px-5 py-5 bg-cta/10 hover:bg-cta/15 transition-all"
              >
                <div>
                  <p className="font-mono text-[10px] text-cta font-bold uppercase tracking-widest mb-1">See the output</p>
                  <p className="text-foreground font-bold text-base leading-snug">Real plans for SaaS, e-commerce,<br className="sm:hidden" /> consultants &amp; more</p>
                </div>
                <svg className="w-6 h-6 text-cta group-hover:translate-x-1 transition-transform flex-shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Trust links as footer */}
              <div className="border-t border-cta/30 px-5 py-2.5">
                <div className="flex items-center justify-center gap-3 text-xs text-foreground/60">
                  <Link
                    href="/start?free=true"
                    className="hover:text-foreground transition-colors"
                  >
                    Try free first
                  </Link>
                  <span className="text-foreground/30">·</span>
                  <Link
                    href="/blog/our-growth-plan"
                    className="hover:text-foreground transition-colors"
                  >
                    We use our own plan
                  </Link>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div
              className="rounded-xl border-2 border-foreground/20 bg-white p-5"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              <blockquote className="text-lg italic text-foreground leading-relaxed">
                &ldquo;The competitor analysis alone is worth it. Finally know what to focus on.&rdquo;
              </blockquote>
              <p className="mt-3 text-sm font-semibold text-foreground/70">
                <span className="text-cta">—</span> Noah P.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ children, emphasis = false }: { children: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg className="w-5 h-5 text-cta flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span className={emphasis ? "text-[15px] font-medium text-foreground" : "text-sm text-foreground/70"}>
        {children}
      </span>
    </div>
  );
}
