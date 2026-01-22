import { FrameworksNav } from "./FrameworksNav";

const FRAMEWORKS = [
  {
    id: "leaks",
    label: "The Analysis",
    title: "Where You're Losing Customers",
    subtitle: "Find the leaks in your business",
    description:
      "Every business loses customers somewhere. We find exactly where — and show you how to fix it.",
  },
  {
    id: "competitors",
    label: "The Research",
    title: "What Your Competitors Figured Out",
    subtitle: "Real data, not guesswork",
    description:
      "We dig into businesses in your space. Where their traffic comes from. What's actually working for them.",
  },
  {
    id: "priorities",
    label: "The Priorities",
    title: "What to Do First",
    subtitle: "Ranked by what moves the needle",
    description:
      "No more guessing. Every tactic scored by impact, confidence, and how easy it is to do. Start at the top.",
  },
  {
    id: "roadmap",
    label: "The Plan",
    title: "Your 30-Day Roadmap",
    subtitle: "Week by week, exactly what to do",
    description:
      "Not a list of ideas. Specific actions, specific timelines. A plan you can actually follow.",
  },
];

// Customer journey analysis content
function LeaksContent() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-4">
        We look at 5 stages of how customers find you and buy from you
      </h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground/20">
              <th className="text-left py-2 pr-4 font-bold text-foreground">Stage</th>
              <th className="text-left py-2 pr-4 font-bold text-foreground">What it means</th>
              <th className="text-left py-2 font-bold text-foreground">Example finding</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-foreground/10">
              <td className="py-3 pr-4 font-semibold text-foreground">Finding you</td>
              <td className="py-3 pr-4 text-foreground/70">Are people discovering you exist?</td>
              <td className="py-3 text-amber-700 italic">&quot;Only 200 visitors/month — need more visibility&quot;</td>
            </tr>
            <tr className="border-b border-foreground/10">
              <td className="py-3 pr-4 font-semibold text-foreground">Trying you</td>
              <td className="py-3 pr-4 text-foreground/70">Do they take the first step?</td>
              <td className="py-3 text-green-700 italic">&quot;15% book a consultation — that&apos;s healthy&quot;</td>
            </tr>
            <tr className="border-b border-foreground/10">
              <td className="py-3 pr-4 font-semibold text-foreground">Coming back</td>
              <td className="py-3 pr-4 text-foreground/70">Do they return after the first visit?</td>
              <td className="py-3 text-amber-700 italic">&quot;Only 10% rebook — follow-up needed&quot;</td>
            </tr>
            <tr className="border-b border-foreground/10">
              <td className="py-3 pr-4 font-semibold text-foreground">Telling friends</td>
              <td className="py-3 pr-4 text-foreground/70">Are they spreading the word?</td>
              <td className="py-3 text-red-700 italic">&quot;No referral program — leaving money on table&quot;</td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-semibold text-foreground">Paying you</td>
              <td className="py-3 pr-4 text-foreground/70">Are you actually making money?</td>
              <td className="py-3 text-green-700 italic">&quot;Good margins, but low volume&quot;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-foreground/80 leading-relaxed bg-surface rounded-lg p-4 border border-border">
        <span className="font-bold text-foreground">You&apos;ll see exactly where your leak is</span> — whether it&apos;s getting discovered, converting visitors, keeping customers, or getting referrals. Then we show you how to fix it.
      </p>
    </>
  );
}

// Competitor research content
function CompetitorsContent() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-6">
        Real research on businesses in your space
      </h3>

      <div className="space-y-4 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-border">
          <p className="text-sm text-foreground/60 mb-1">Traffic sources</p>
          <p className="font-semibold text-foreground">&quot;Your competitor gets 2,300 visitors/month from Pinterest. You&apos;re not on Pinterest.&quot;</p>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <p className="text-sm text-foreground/60 mb-1">Keywords they rank for</p>
          <p className="font-semibold text-foreground">&quot;They rank for &apos;best lip balm for runners&apos; — you could own &apos;best lip balm for equestrians&apos;&quot;</p>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <p className="text-sm text-foreground/60 mb-1">What they&apos;re doing that works</p>
          <p className="font-semibold text-foreground">&quot;They post 3x/week on Instagram Reels. Their top posts are behind-the-scenes content.&quot;</p>
        </div>
      </div>

      <p className="text-foreground/80 leading-relaxed">
        <span className="font-bold text-foreground">Not to copy them.</span> To find the gaps they&apos;re missing and the tactics that actually work in your market.
      </p>
    </>
  );
}

// Prioritization content
function PrioritiesContent() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-4">
        Every tactic scored so you know where to start
      </h3>

      <p className="text-foreground/70 mb-6">
        We score each recommendation on three things:
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-border text-center">
          <p className="font-bold text-foreground">Impact</p>
          <p className="text-sm text-foreground/60">How much will this help?</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border text-center">
          <p className="font-bold text-foreground">Confidence</p>
          <p className="text-sm text-foreground/60">How sure are we it&apos;ll work for YOU?</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border text-center">
          <p className="font-bold text-foreground">Ease</p>
          <p className="text-sm text-foreground/60">Can you do this in a weekend?</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-cta/10 rounded-lg p-3 border border-cta/20">
          <span className="font-mono text-xs bg-cta text-white px-2 py-1 rounded font-bold">Score: 28</span>
          <span className="font-semibold text-foreground">Set up a simple referral program</span>
        </div>
        <div className="flex items-center gap-3 bg-surface rounded-lg p-3 border border-border">
          <span className="font-mono text-xs bg-foreground/10 text-foreground px-2 py-1 rounded font-bold">Score: 24</span>
          <span className="font-semibold text-foreground">Start posting on Pinterest</span>
        </div>
        <div className="flex items-center gap-3 bg-surface rounded-lg p-3 border border-border">
          <span className="font-mono text-xs bg-foreground/10 text-foreground px-2 py-1 rounded font-bold">Score: 22</span>
          <span className="font-semibold text-foreground">Add a follow-up email sequence</span>
        </div>
      </div>

      <p className="mt-4 text-foreground/70 text-sm">
        No more guessing. Just start at the top and work your way down.
      </p>
    </>
  );
}

// Roadmap content
function RoadmapContent() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-6">
        Not a list of ideas. A week-by-week plan.
      </h3>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Week 1</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Set up the foundation</p>
            <p className="text-foreground/60 text-sm">Create your referral program, set up tracking, prep your first Pinterest boards</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Week 2</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Launch your first experiment</p>
            <p className="text-foreground/60 text-sm">Start posting on Pinterest, announce referral program to existing customers</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Week 3</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Double down on what&apos;s working</p>
            <p className="text-foreground/60 text-sm">Check which Pinterest posts got traction, make more like those</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-20">
            <span className="font-mono text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Week 4</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Build the system</p>
            <p className="text-foreground/60 text-sm">Create a content calendar, automate follow-up emails, measure results</p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-foreground/80 leading-relaxed bg-surface rounded-lg p-4 border border-border">
        <span className="font-bold text-foreground">Specific actions. Specific timelines.</span> Written for your business, not generic advice that works for everyone and no one.
      </p>
    </>
  );
}

function renderContent(id: string) {
  switch (id) {
    case "leaks":
      return <LeaksContent />;
    case "competitors":
      return <CompetitorsContent />;
    case "priorities":
      return <PrioritiesContent />;
    case "roadmap":
      return <RoadmapContent />;
    default:
      return null;
  }
}

export function FrameworksSection() {
  return (
    <section id="how-it-works" className="relative py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16">
          <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-4">
            What you&apos;ll get
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            Real research on <span className="font-black">YOUR market.</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/60 max-w-2xl">
            Not generic advice that works for everyone and no one. Actual data about your competitors, your channels, and what will work for your specific business.
          </p>
        </div>

        <div className="lg:flex lg:gap-16">
          {/* Sidebar - sticky nav with left border indicator */}
          <aside className="hidden lg:block lg:w-72 lg:shrink-0">
            <FrameworksNav frameworks={FRAMEWORKS} />
          </aside>

          {/* Content cards */}
          <div className="flex-1 space-y-16">
            {FRAMEWORKS.map((framework) => (
              <div key={framework.id} data-framework={framework.id}>
                {/* Mobile header */}
                <div className="lg:hidden mb-6">
                  <span className="font-mono text-[10px] text-cta uppercase tracking-[0.12em] font-semibold">
                    {framework.label}
                  </span>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{framework.title}</h3>
                  <p className="text-foreground/60 mt-1 text-sm">{framework.subtitle}</p>
                </div>

                {/* Content card - softer style */}
                <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 shadow-md">
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
