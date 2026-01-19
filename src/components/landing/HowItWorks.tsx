import { FileText, Search, Rocket } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Tell us about your business",
    description:
      "5-10 minutes to fill out a detailed form about your product, traction, and what you've tried.",
  },
  {
    number: 2,
    icon: Search,
    title: "We research your competitors",
    description:
      "Real-time competitive analysis using live web search and SEO data. Not recycled templates.",
  },
  {
    number: 3,
    icon: Rocket,
    title: "Get your custom playbook",
    description:
      "Prioritized recommendations, quick wins, and a 30-day roadmap. Actionable, not theoretical.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute left-0 top-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute right-0 bottom-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-semibold tracking-wider text-primary uppercase mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            From form to strategy in <span className="text-gradient">minutes</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            No meetings. No back-and-forth. Just actionable strategy.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative animate-slide-up stagger-${index + 1}`}
              >
                {/* Number + icon circle */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150" />
                    {/* Circle */}
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background border-2 border-primary/30 shadow-lg">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gradient">
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-muted leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
