import { Target, BarChart3, TrendingUp } from "lucide-react";
import { FeatureCard } from "@/components/ui";

const frameworks = [
  {
    icon: Target,
    title: "AARRR (Pirate Metrics)",
    description:
      "Acquisition, Activation, Retention, Referral, Revenue. We analyze where you're leaking growth.",
  },
  {
    icon: BarChart3,
    title: "ICE Prioritization",
    description:
      "Every recommendation scored by Impact, Confidence, and Ease. Know exactly where to focus.",
  },
  {
    icon: TrendingUp,
    title: "Growth Equation",
    description:
      "(New Users x Activation x Retention x Referral) - Churn. We find your biggest multiplier.",
  },
];

export function Frameworks() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider text-primary uppercase mb-4">
            Proven Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Built on frameworks that <span className="text-gradient">actually work</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Not random AI advice. Strategy grounded in the same frameworks used by
            growth teams at top startups.
          </p>
        </div>

        {/* Framework cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {frameworks.map((framework, index) => (
            <div
              key={framework.title}
              className={`animate-slide-up stagger-${index + 1}`}
            >
              <FeatureCard
                icon={framework.icon}
                title={framework.title}
                description={framework.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
