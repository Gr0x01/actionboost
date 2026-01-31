import Link from "next/link";
import { config } from "@/lib/config";
import { PaidTierButton, FreeTierButton } from "./PricingButtons";

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
            Start free. Go deeper for{" "}<span className="font-black">{config.singlePrice}.</span>
          </h2>
        </div>

        {/* Testimonial */}
        <div className="mb-10 max-w-2xl mx-auto text-center">
          <blockquote className="text-lg italic text-foreground/60 leading-relaxed">
            &ldquo;The competitor analysis alone is worth it. Finally know what to focus on.&rdquo;
          </blockquote>
          <p className="text-sm text-foreground/40 mt-2">
            — Noah P., founder
          </p>
        </div>

        {/* Two-tier grid: free left/top, paid right/bottom */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto md:max-w-none">

          {/* FREE tier card */}
          <div
            className="rounded-xl border-2 border-foreground/20 bg-white overflow-hidden flex flex-col"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="px-8 pt-8 pb-2 lg:px-10 lg:pt-10">
              <p className="font-mono text-xs tracking-[0.12em] text-foreground/50 uppercase mb-3">
                Free preview
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <h3 className="text-5xl font-black text-foreground tracking-tight">$0</h3>
                <span className="text-lg text-foreground/50 font-medium">no card needed</span>
              </div>

              <div className="space-y-3 mb-6">
                <FeatureItem>Your top competitors identified</FeatureItem>
                <FeatureItem>Market positioning snapshot</FeatureItem>
                <FeatureItem>Surface-level gaps &amp; opportunities</FeatureItem>
                <LockedItem>Full 30-day action plan</LockedItem>
                <LockedItem>Channel-by-channel strategy</LockedItem>
                <LockedItem>Tactics ranked by effort-to-impact</LockedItem>
              </div>
            </div>

            {/* Free CTA zone */}
            <div className="mt-auto px-8 py-6 lg:px-10">
              <FreeTierButton />
              <p className="mt-3 text-center text-xs text-foreground/40">
                No account needed. Results in 2 minutes.
              </p>
            </div>
          </div>

          {/* PAID tier card — visually elevated */}
          <div
            className="rounded-xl border-2 border-cta bg-white overflow-hidden flex flex-col"
            style={{ boxShadow: "4px 4px 0 rgba(230, 126, 34, 0.35)" }}
          >
            <div className="px-8 pt-8 pb-2 lg:px-10 lg:pt-10">
              <p className="font-mono text-xs tracking-[0.12em] text-cta font-bold uppercase mb-3">
                Full Boost
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <h3 className="text-5xl font-black text-foreground tracking-tight">{config.singlePrice}</h3>
                <span className="text-lg text-foreground/50 font-medium">one-time</span>
              </div>

              <p className="text-sm text-foreground/60 mb-5">
                Everything in Free, plus:
              </p>
              <div className="space-y-3 mb-6">
                <FeatureItem>Your competitors&apos; actual traffic sources</FeatureItem>
                <FeatureItem>The gaps they&apos;re missing that you can exploit</FeatureItem>
                <FeatureItem>What to do this week, next week, and why</FeatureItem>
                <FeatureItem>Tactics ranked by effort-to-impact</FeatureItem>
                <FeatureItem muted>Refine it twice until it feels right</FeatureItem>
              </div>
            </div>

            {/* Paid CTA zone */}
            <div className="mt-auto bg-cta/[0.04] px-8 py-6 lg:px-10">
              <PaidTierButton />
              <p className="mt-4 text-center text-sm text-foreground/60">
                Didn&apos;t help? <span className="font-bold text-foreground">Full refund.</span>
              </p>
            </div>
          </div>
        </div>

        {/* In-Action + trust links below tiers */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="/in-action"
            className="group inline-flex items-center gap-2 text-cta text-base font-bold hover:text-cta/80 transition-colors"
          >
            See real Boosts for SaaS, e-commerce &amp; more
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/blog/our-growth-plan"
            className="text-xs text-foreground/40 underline underline-offset-2 hover:text-foreground/60 transition-colors"
          >
            We use our own Boost
          </Link>
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

function LockedItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-foreground/25 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="text-[15px] text-foreground/35">{children}</span>
    </div>
  );
}
