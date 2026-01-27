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
    title: "Your Boost",
    subtitle: "Real strategy, not generic advice",
    description:
      "Stop Doing, Start Doing, Quick Wins, 30-Day Roadmap. Research on YOUR competitors. A Boost you can actually execute.",
  },
];

// AARRR section content
function AARRRContent() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-4">
        Your AARRR Funnel Breakdown
      </h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground/20">
              <th className="text-left py-2 pr-4 font-bold text-foreground">Stage</th>
              <th className="text-left py-2 pr-4 font-bold text-foreground">Metric</th>
              <th className="text-left py-2 font-bold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            <tr className="border-b border-foreground/20">
              <td className="py-3 pr-4 font-sans font-semibold">Acquisition</td>
              <td className="py-3 pr-4 text-foreground/70">2,000 visitors/mo</td>
              <td className="py-3 text-amber-600 font-semibold">Needs work</td>
            </tr>
            <tr className="border-b border-foreground/20">
              <td className="py-3 pr-4 font-sans font-semibold">Activation</td>
              <td className="py-3 pr-4 text-foreground/70">15% start form</td>
              <td className="py-3 text-green-600 font-semibold">Healthy</td>
            </tr>
            <tr className="border-b border-foreground/20">
              <td className="py-3 pr-4 font-sans font-semibold">Retention</td>
              <td className="py-3 pr-4 text-foreground/70">10% return</td>
              <td className="py-3 text-amber-600 font-semibold">Needs work</td>
            </tr>
            <tr className="border-b border-foreground/20">
              <td className="py-3 pr-4 font-sans font-semibold">Referral</td>
              <td className="py-3 pr-4 text-foreground/70">5% share rate</td>
              <td className="py-3 text-red-600 font-semibold">Critical gap</td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-sans font-semibold">Revenue</td>
              <td className="py-3 pr-4 text-foreground/70">3% conversion</td>
              <td className="py-3 text-green-600 font-semibold">Healthy</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-foreground/80 leading-relaxed">
        <span className="font-bold text-foreground">Primary leak:</span> Referral. Users who love the product aren&apos;t sharing it.{" "}
        <span className="font-bold text-foreground">Secondary leak:</span> Acquisition. Zero organic traffic pipeline.
      </p>
    </>
  );
}

// ICE section content
function ICEContent() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-6">
        Start Doing (ICE-Prioritized)
      </h3>

      <div className="space-y-6">
        <div className="border-l-4 border-cta pl-4">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-xs bg-cta text-white px-2 py-0.5 rounded font-bold">ICE: 28</span>
            <h4 className="font-bold text-foreground">Publish This Growth Plan as Content</h4>
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed">
            This document is proof. It demonstrates output quality, growth expertise, and real strategy—not generic advice.
          </p>
        </div>

        <div className="border-l-4 border-cta/70 pl-4">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-xs bg-foreground/10 text-foreground px-2 py-0.5 rounded font-bold">ICE: 26</span>
            <h4 className="font-bold text-foreground">Launch on Indie Hackers First</h4>
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed">
            IH is the natural habitat for your target user. Unlike Product Hunt (one-day spike), IH builds persistent community presence.
          </p>
        </div>

        <div className="border-l-4 border-foreground/30 pl-4">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-xs bg-foreground/10 text-foreground px-2 py-0.5 rounded font-bold">ICE: 25</span>
            <h4 className="font-bold text-foreground">Build in Public on Twitter/X</h4>
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed">
            The #buildinpublic community is 500K+ founders who celebrate transparency. Your pricing and architecture decisions are content.
          </p>
        </div>
      </div>
    </>
  );
}

// Output section content
function OutputContent() {
  return (
    <>
      <div className="mb-8">
        <h3 className="text-lg font-bold text-foreground mb-3">Stop Doing</h3>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="font-bold text-red-800 mb-1">Building more features before proving distribution</p>
          <p className="text-red-700/80 text-sm">
            The MVP is complete. Every hour on features is an hour not on distribution. Freeze for 30 days.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Wins (This Week)</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 h-fit rounded font-bold">D1-2</span>
            <div>
              <p className="font-semibold text-foreground text-sm">Publish this plan</p>
              <p className="text-foreground/60 text-sm">Create /blog/our-growth-plan, share on Twitter with #buildinpublic</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 h-fit rounded font-bold">D3-4</span>
            <div>
              <p className="font-semibold text-foreground text-sm">Add founder presence</p>
              <p className="text-foreground/60 text-sm">Photo on landing page, update Twitter bio with link</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 h-fit rounded font-bold">D5-7</span>
            <div>
              <p className="font-semibold text-foreground text-sm">Launch on Indie Hackers</p>
              <p className="text-foreground/60 text-sm">&ldquo;We ran our AI growth tool on ourselves&rdquo; — first paying customers</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function FrameworksSection() {
  const [activeFramework, setActiveFramework] = useState<string>("aarrr");

  // Scroll-spy: track which card is closest to viewport center
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestId = "aarrr";
      let closestDistance = Infinity;

      FRAMEWORKS.forEach((framework) => {
        const element = document.querySelector(`[data-framework="${framework.id}"]`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = framework.id;
        }
      });

      setActiveFramework(closestId);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const renderContent = (id: string) => {
    switch (id) {
      case "aarrr":
        return <AARRRContent />;
      case "ice":
        return <ICEContent />;
      case "growth":
        return <OutputContent />;
      default:
        return null;
    }
  };

  return (
    <section id="how-it-works" className="relative py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            What you get
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            Frameworks that <span className="font-black">actually work.</span>
          </h2>
        </div>

        <div className="lg:flex lg:gap-16">
          {/* Sidebar - sticky nav with left border indicator */}
          <aside className="hidden lg:block lg:w-72 lg:shrink-0">
            <nav className="sticky top-36 space-y-4">
              {FRAMEWORKS.map((framework) => {
                const isActive = activeFramework === framework.id;

                return (
                  <button
                    key={framework.id}
                    onClick={() => scrollToFramework(framework.id)}
                    className={`
                      w-full text-left pl-5 border-l-4 transition-all duration-150
                      ${isActive
                        ? "border-cta opacity-100"
                        : "border-transparent opacity-40 hover:opacity-70 hover:border-foreground/20"}
                    `}
                  >
                    <span
                      className={`
                        font-mono text-[10px] uppercase tracking-[0.15em]
                        ${isActive ? "text-cta font-semibold" : "text-foreground"}
                      `}
                    >
                      {framework.label}
                    </span>
                    <h3 className="text-2xl font-black text-foreground mt-1">
                      {framework.title}
                    </h3>
                    <p className="text-sm text-foreground/70 mt-1">
                      {framework.subtitle}
                    </p>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content cards */}
          <div className="flex-1 space-y-24">
            {FRAMEWORKS.map((framework) => (
              <div key={framework.id} data-framework={framework.id}>
                {/* Mobile header */}
                <div className="lg:hidden mb-6">
                  <span className="font-mono text-[10px] text-cta uppercase tracking-[0.15em] font-semibold">
                    {framework.label}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{framework.title}</h3>
                  <p className="text-foreground/60 mt-1 text-sm">{framework.subtitle}</p>
                </div>

                {/* Content card - Soft Brutalist style */}
                <div
                  className="border-2 border-foreground/20 bg-white rounded-xl p-6 lg:p-8"
                  style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
                >
                  {renderContent(framework.id)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
