import { config } from "@/lib/config";
import { PaidTierButton } from "./PricingButtons";
import Link from "next/link";

// Sample output snippets to show what users actually get
const paidSamples = [
  {
    label: "Competitor Intel",
    example: '"Notion gets 2.3M monthly visits. 62% from organic search, targeting keywords you\'re ignoring."',
  },
  {
    label: "Ranked Tactics",
    example: '"ICE 28: Publish this report as a blog post. Impact: High. Effort: 2 hours."',
  },
  {
    label: "30-Day Roadmap",
    example: '"Week 1: Indie Hackers launch. Week 2: Twitter thread strategy. Week 3: Partner outreach..."',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight text-balance">
            Your competitors already figured something out.{" "}
            <span className="font-black">Find out what.</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            This isn&apos;t ChatGPT guessing. Real research on your market—channels, tactics, and a 30-day plan you&apos;ll actually follow.
          </p>
        </div>

        {/* Single pricing card - centered */}
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl border-[3px] border-foreground bg-background p-8 lg:p-10 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
            {/* Price */}
            <div className="mb-8">
              <h3 className="text-5xl font-black text-foreground">{config.singlePrice}</h3>
              <p className="text-foreground/60 mt-2">One payment. No subscription.</p>
            </div>

            {/* Sample output snippets */}
            <div className="space-y-4 mb-8">
              <p className="text-xs font-mono text-foreground/50 uppercase tracking-wider">What you&apos;ll get:</p>
              {paidSamples.map((sample) => (
                <div key={sample.label} className="border-l-2 border-cta pl-3">
                  <p className="text-xs font-bold text-cta uppercase tracking-wide mb-1">{sample.label}</p>
                  <p className="text-sm text-foreground/70 italic">{sample.example}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div>
              <PaidTierButton />
              <p className="mt-3 text-center font-mono text-sm font-bold text-foreground">
                Didn&apos;t help? Full refund.
              </p>
              <p className="mt-4 text-xs text-foreground/40 text-center">
                <Link href="/start?free=true" className="underline hover:text-foreground/60 transition-colors">
                  Need to see a sample first?
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="max-w-xl mx-auto mt-6">
          <div className="rounded-2xl border-[3px] border-foreground/20 bg-background p-6">
            <blockquote className="text-foreground leading-relaxed">
              &ldquo;The competitor analysis feature is incredibly valuable. The 30-day playbook alone is worth the price.&rdquo;
            </blockquote>
            <p className="font-mono text-sm text-foreground/60 mt-3">@noahpraduns</p>
          </div>
        </div>
      </div>
    </section>
  );
}
