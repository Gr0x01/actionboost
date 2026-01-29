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
            $29. Real research.{" "}
            <span className="font-black">Zero guessing.</span>
          </h2>
        </div>

        {/* Desktop: two-column grid, Mobile: single column */}
        <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">

          {/* Pricing card - left column */}
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0">
            <div
              className="rounded-xl border-2 border-foreground/20 bg-white overflow-hidden"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              {/* Value stack - merged into card */}
              <div className="px-8 pt-8 pb-6 lg:px-10 lg:pt-10 border-b border-foreground/10">
                <p className="text-foreground/50 uppercase tracking-wider text-xs font-mono mb-4">
                  What you were going to do instead
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Google &quot;how to market my business&quot;</span>
                    <span className="text-foreground/40">6 hours, no clarity</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Ask ChatGPT for the 47th time</span>
                    <span className="text-foreground/40">same generic advice</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Try another content calendar template</span>
                    <span className="text-foreground/40">still no direction</span>
                  </div>
                </div>
              </div>

              {/* Price + features */}
              <div className="px-8 py-8 lg:px-10">
                {/* Price */}
                <div className="mb-6 text-center lg:text-left">
                  <div className="flex items-baseline justify-center lg:justify-start gap-2">
                    <h3 className="text-6xl font-black text-foreground tracking-tight">{config.singlePrice}</h3>
                    <span className="text-lg text-foreground/50 font-medium">one-time</span>
                  </div>
                </div>

                {/* What's included - outcome-focused */}
                <div className="space-y-3 mb-6">
                  <FeatureItem>Your competitors&apos; actual traffic sources</FeatureItem>
                  <FeatureItem>The gaps they&apos;re missing that you can exploit</FeatureItem>
                  <FeatureItem>Week-by-week roadmap: what to do and why</FeatureItem>
                  <FeatureItem>Tactics ranked by effort-to-impact</FeatureItem>
                  <FeatureItem muted>Refine it twice until it feels right</FeatureItem>
                </div>
              </div>

              {/* CTA zone - warm background */}
              <div className="bg-cta/[0.04] px-8 py-6 lg:px-10">
                <PaidTierButton />
                <p className="mt-4 text-center text-sm text-foreground/60">
                  Didn&apos;t help? <span className="font-bold text-foreground">Full refund.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Social proof column - right side on desktop, below on mobile */}
          <div className="mt-8 space-y-6 max-w-md mx-auto lg:mt-0 lg:max-w-none lg:mx-0">

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
                  <p className="text-foreground font-bold text-base leading-snug">Real Boosts for SaaS, e-commerce,<br className="sm:hidden" /> consultants &amp; more</p>
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
                    We use our own Boost
                  </Link>
                </div>
              </div>
            </div>

            {/* Testimonial - editorial pull-quote, no card */}
            <div className="pl-4 border-l-3 border-cta/40">
              <blockquote className="text-base italic text-foreground/70 leading-relaxed">
                &ldquo;The competitor analysis alone is worth it. Finally know what to focus on.&rdquo;
              </blockquote>
              <p className="mt-2 text-sm text-foreground/50">
                — Noah P., founder
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-cta flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span className={muted ? "text-sm text-foreground/60" : "text-[15px] text-foreground"}>
        {children}
      </span>
    </div>
  );
}
