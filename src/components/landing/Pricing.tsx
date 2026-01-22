import { config } from "@/lib/config";
import { PaidTierButton } from "./PricingButtons";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight text-balance">
            Your competitors already figured something out.{" "}
            <span className="font-black">Find out what.</span>
          </h2>
        </div>

        {/* Single pricing card - centered */}
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl border border-border bg-background p-8 lg:p-10 shadow-lg">
            {/* Price */}
            <div className="mb-8 text-center">
              <h3 className="text-5xl font-black text-foreground">{config.singlePrice}</h3>
              <p className="text-foreground/60 mt-2">One payment. No subscription. No account needed.</p>
            </div>

            {/* What's included */}
            <div className="space-y-3 mb-8">
              <p className="text-xs font-mono text-foreground/50 uppercase tracking-wider mb-4">What&apos;s included:</p>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground">Full market research</p>
                  <p className="text-sm text-foreground/60">Your competitors, their traffic, their keywords</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground">Customer journey analysis</p>
                  <p className="text-sm text-foreground/60">Find where you&apos;re losing customers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground">Prioritized tactics</p>
                  <p className="text-sm text-foreground/60">Ranked by impact so you know what to do first</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground">30-day roadmap</p>
                  <p className="text-sm text-foreground/60">Week-by-week plan with specific actions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground">2 refinements included</p>
                  <p className="text-sm text-foreground/60">Add more context, get a better plan</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div>
              <PaidTierButton />
              <p className="mt-3 text-center font-medium text-foreground/70">
                Didn&apos;t help? <span className="font-bold text-foreground">Full refund.</span> No questions asked.
              </p>
              <p className="mt-4 text-xs text-foreground/40 text-center">
                <Link href="/start?free=true" className="underline hover:text-foreground/60 transition-colors">
                  Want to see a sample first?
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="max-w-xl mx-auto mt-8">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-md">
            <blockquote className="text-lg font-medium text-foreground leading-relaxed italic">
              &quot;The competitor analysis feature is incredibly valuable. The 30-day playbook alone is worth the price.&quot;
            </blockquote>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-8 h-[3px] bg-cta"></span>
              <p className="font-mono text-sm text-foreground/70 uppercase tracking-wider">@noahpraduns</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
