"use client";

import { useEffect, useState } from "react";

interface Framework {
  id: "aarrr" | "ice" | "growth";
  label: string;
  title: string;
  subtitle: string;
  description: string;
}

const FRAMEWORKS: Framework[] = [
  {
    id: "aarrr",
    label: "The Framework",
    title: "AARRR",
    subtitle: "Find where you're leaking growth",
    description:
      "The pirate metrics framework used by Y Combinator, Reforge, and every serious growth team. We analyze each stage to find where users are dropping off.",
  },
  {
    id: "ice",
    label: "The Prioritization",
    title: "ICE Scoring",
    subtitle: "Know exactly where to focus",
    description:
      "Every tactic gets scored on Impact, Confidence, and Ease. No more guessing. Just a ranked list of what to do first.",
  },
  {
    id: "growth",
    label: "The Output",
    title: "Your Action Plan",
    subtitle: "Real strategy, not generic advice",
    description:
      "Stop Doing, Start Doing, Quick Wins, 30-Day Roadmap. Research on YOUR competitors. A plan you can actually execute.",
  },
];

// Document preview wrapper component
function DocumentPreview({ filename, children }: { filename: string; children: React.ReactNode }) {
  return (
    <div className="bg-background rounded-xl border border-border/60 shadow-md overflow-hidden">
      {/* Document header */}
      <div className="px-6 py-4 border-b border-border/30 bg-surface/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
          <span className="ml-3 text-xs text-muted">{filename}</span>
        </div>
      </div>
      {/* Document content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        <article className="font-serif text-[15px] leading-[1.75] text-foreground/90">
          {children}
        </article>
      </div>
      {/* Fade overlay at bottom */}
      <div
        className="h-16 -mt-16 relative z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }}
      />
    </div>
  );
}

// AARRR section - actual strategy output
function AARRRCard() {
  return (
    <DocumentPreview filename="your-growth-strategy.md">
      <h2 className="text-xl font-bold text-foreground mb-4 font-sans">Current Situation Analysis</h2>

      <h3 className="text-base font-semibold text-foreground mt-6 mb-3 font-sans">
        AARRR Funnel Breakdown
      </h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-4 font-sans font-semibold text-foreground">Stage</th>
              <th className="text-left py-2 pr-4 font-sans font-semibold text-foreground">Metric</th>
              <th className="text-left py-2 font-sans font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 font-sans font-medium text-foreground">Acquisition</td>
              <td className="py-2 pr-4">2,000 visitors/mo</td>
              <td className="py-2 text-amber-600">Needs work</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 font-sans font-medium text-foreground">Activation</td>
              <td className="py-2 pr-4">15% start form</td>
              <td className="py-2 text-green-600">Healthy</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 font-sans font-medium text-foreground">Retention</td>
              <td className="py-2 pr-4">10% return</td>
              <td className="py-2 text-amber-600">Needs work</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 font-sans font-medium text-foreground">Referral</td>
              <td className="py-2 pr-4">5% share rate</td>
              <td className="py-2 text-red-600">Critical gap</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-sans font-medium text-foreground">Revenue</td>
              <td className="py-2 pr-4">3% conversion</td>
              <td className="py-2 text-green-600">Healthy</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-4">
        <strong className="font-sans">Primary leak:</strong> Referral. Users who love the product aren't
        sharing it. The share link exists but isn't promoted post-purchase.
      </p>

      <p>
        <strong className="font-sans">Secondary leak:</strong> Acquisition. Zero organic traffic pipeline.
        All growth depends on manual promotion.
      </p>
    </DocumentPreview>
  );
}

// ICE section - actual strategy output with scored tactics
function ICECard() {
  return (
    <DocumentPreview filename="your-growth-strategy.md">
      <h2 className="text-xl font-bold text-foreground mb-4 font-sans">Start Doing (ICE-Prioritized)</h2>

      <h3 className="text-base font-semibold text-foreground mt-6 mb-2 font-sans">
        1. Publish This Growth Plan as Content Marketing
      </h3>
      <p className="text-sm font-medium mb-3 font-sans">
        <span className="text-cta">ICE Score: 10/9/9 = 28</span>
      </p>
      <p className="mb-4">
        This document is the first piece of social proof. It demonstrates the quality of
        output, your expertise in growth, and a real strategy—not generic advice.
      </p>

      <hr className="border-border/30 my-6" />

      <h3 className="text-base font-semibold text-foreground mt-6 mb-2 font-sans">
        2. Launch on Indie Hackers Before Product Hunt
      </h3>
      <p className="text-sm font-medium mb-3 font-sans">
        <span className="text-cta">ICE Score: 9/9/8 = 26</span>
      </p>
      <p className="mb-4">
        Indie Hackers is the natural habitat for your target user. Unlike Product Hunt
        (one-day spike), IH builds persistent community presence.
      </p>

      <hr className="border-border/30 my-6" />

      <h3 className="text-base font-semibold text-foreground mt-6 mb-2 font-sans">
        3. Build in Public on Twitter/X
      </h3>
      <p className="text-sm font-medium mb-3 font-sans">
        <span className="text-cta">ICE Score: 8/8/9 = 25</span>
      </p>
      <p>
        The #buildinpublic community is 500K+ founders who celebrate transparency.
        Your pricing, margins, and architecture decisions are interesting content.
      </p>
    </DocumentPreview>
  );
}

// Output section - actual strategy output
function OutputCard() {
  return (
    <DocumentPreview filename="your-growth-strategy.md">
      <h2 className="text-xl font-bold text-foreground mb-4 font-sans">Stop Doing</h2>

      <h3 className="text-base font-semibold text-foreground mt-6 mb-2 font-sans">
        1. Building more features before proving distribution
      </h3>
      <p className="text-sm text-primary font-medium mb-3 font-sans">
        ICE Score: Impact 3, Confidence 9, Ease 8
      </p>
      <p className="mb-3">
        The MVP is complete. Adding Google OAuth, weekly crons, or integrations before
        validating acquisition channels is premature optimization. Every hour spent on
        features is an hour not spent on distribution.
      </p>
      <p className="mb-6">
        <strong className="font-sans">Action:</strong> Freeze feature development for 30 days.
        Exceptions only for critical bugs.
      </p>

      <hr className="border-border/30 my-6" />

      <h2 className="text-xl font-bold text-foreground mb-4 font-sans">Quick Wins (This Week)</h2>

      <p className="mb-2 font-sans font-semibold text-sm">Day 1-2: Publish this plan</p>
      <ul className="list-disc list-inside space-y-1 mb-4 text-sm text-muted">
        <li>Create /blog/our-growth-plan page</li>
        <li>Share on Twitter with #buildinpublic tag</li>
        <li>Post to Indie Hackers: "We ran our AI growth tool on ourselves"</li>
      </ul>

      <p className="mb-2 font-sans font-semibold text-sm">Day 3-4: Add founder presence</p>
      <ul className="list-disc list-inside space-y-1 mb-4 text-sm text-muted">
        <li>Add founder name and photo to landing page</li>
        <li>Create or update Twitter bio with link</li>
        <li>Set up Google Alert for brand mentions</li>
      </ul>

      <p>
        <strong className="font-sans">By end of week:</strong> First paying customers from organic
        channels, baseline metrics established.
      </p>
    </DocumentPreview>
  );
}

export function FrameworksSection() {
  const [activeFramework, setActiveFramework] = useState<string>("aarrr");

  // Scroll-spy: track which card is in the center of the viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    FRAMEWORKS.forEach((framework) => {
      const element = document.querySelector(
        `[data-framework="${framework.id}"]`
      );
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveFramework(framework.id);
            }
          });
        },
        {
          // Trigger when card is in the middle 30% of viewport
          rootMargin: "-35% 0px -35% 0px",
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToFramework = (id: string) => {
    const element = document.querySelector(`[data-framework="${id}"]`);
    if (element) {
      const headerOffset = 160;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const renderCard = (id: string) => {
    switch (id) {
      case "aarrr":
        return <AARRRCard />;
      case "ice":
        return <ICECard />;
      case "growth":
        return <OutputCard />;
      default:
        return null;
    }
  };

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="lg:flex lg:gap-12">
          {/* Sidebar - sticky on desktop */}
          <aside className="hidden lg:block lg:w-80 lg:shrink-0">
            <nav className="sticky top-36 h-fit space-y-3">
              {FRAMEWORKS.map((framework) => {
                const isActive = activeFramework === framework.id;

                return (
                  <button
                    key={framework.id}
                    onClick={() => scrollToFramework(framework.id)}
                    className={`
                      w-full text-left p-4 rounded-xl transition-all duration-300
                      ${
                        isActive
                          ? "bg-surface border border-border shadow-md"
                          : "hover:bg-surface/50"
                      }
                    `}
                  >
                    <span
                      className={`
                        text-xs font-medium uppercase tracking-wider transition-colors duration-300
                        ${isActive ? "text-accent" : "text-muted"}
                      `}
                    >
                      {framework.label}
                    </span>
                    <h3
                      className={`
                        text-xl font-bold mt-1 transition-colors duration-300
                        ${isActive ? "text-foreground" : "text-muted"}
                      `}
                    >
                      {framework.title}
                    </h3>

                    {/* Expandable description */}
                    <div
                      className={`
                        overflow-hidden transition-all duration-300
                        ${isActive ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}
                      `}
                    >
                      <p className="text-sm text-muted leading-relaxed">
                        {framework.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content - scrolling cards */}
          <div className="flex-1 space-y-32">
            {FRAMEWORKS.map((framework) => (
              <div key={framework.id} data-framework={framework.id}>
                {/* Mobile: show description above card */}
                <div className="lg:hidden text-center mb-8">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">
                    {framework.label}
                  </span>
                  <h3 className="text-2xl font-bold mt-1">{framework.title}</h3>
                  <p className="text-muted mt-2 max-w-md mx-auto text-sm">
                    {framework.description}
                  </p>
                </div>
                {renderCard(framework.id)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--background) 100%)",
        }}
      />
    </section>
  );
}
