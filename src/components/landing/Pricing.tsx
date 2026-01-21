import { config } from "@/lib/config";
import { FreeTierButton, PaidTierButton } from "./PricingButtons";

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

const freeIncludes = [
  "Executive summary of your situation",
  "Basic competitive landscape",
  "Channel strategy overview",
  "3 quick-win suggestions",
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
            Your competitors&apos; traffic data.{" "}
            <span className="font-black">Tactics ranked by impact.</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Data ChatGPT can&apos;t see. A 30-day roadmap you can actually execute. $9.99, no subscription.
          </p>
        </div>

        {/* Pricing cards - side by side, centered */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Free tier */}
          <div className="border-[3px] border-foreground/30 bg-background p-6 lg:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-foreground">Free</h3>
              <p className="text-sm text-foreground/60 mt-1">Mini audit to test the waters</p>
            </div>

            <div className="space-y-2.5 flex-1">
              {freeIncludes.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 flex items-center justify-center font-bold text-foreground">
                    ✓
                  </span>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <FreeTierButton />
              <p className="mt-4 text-xs text-foreground/50 text-center">
                No credit card required
              </p>
            </div>
          </div>

          {/* Paid tier */}
          <div className="border-[3px] border-foreground bg-background p-6 lg:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-foreground">{config.singlePrice}</h3>
              <p className="text-sm text-foreground/60 mt-1">Full action plan with competitor intel</p>
            </div>

            {/* Sample output snippets */}
            <div className="space-y-4 flex-1">
              <p className="text-xs font-mono text-foreground/50 uppercase tracking-wider">What you&apos;ll get:</p>
              {paidSamples.map((sample) => (
                <div key={sample.label} className="border-l-2 border-cta pl-3">
                  <p className="text-xs font-bold text-cta uppercase tracking-wide mb-1">{sample.label}</p>
                  <p className="text-sm text-foreground/70 italic">{sample.example}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <PaidTierButton />
              <p className="mt-4 text-xs text-foreground/60 text-center flex items-center justify-center gap-1.5">
                <span className="text-green-600">✓</span>
                7-day money-back guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-sm text-foreground/50 mt-8 font-mono text-center">
          No subscription. Pay once, get your plan. Not happy? Full refund, no questions asked.
        </p>
      </div>
    </section>
  );
}
