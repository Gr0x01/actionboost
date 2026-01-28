import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { TableOfContents } from "@/components/results/TableOfContents";
import { GUIDE_SECTIONS } from "@/lib/constants/toc-sections";
import { config } from "@/lib/config";
import { FAQPageSchema, BreadcrumbSchema, ArticleSchema } from "@/components/seo";
import { FAQSection } from "@/components/landing";

const GUIDE_FAQS = [
  {
    question: "What's the best marketing plan template for small businesses?",
    answer:
      "The best marketing plan isn't a template—it's a framework built on competitive research. Templates give you structure but not strategy. A useful marketing plan requires knowing your specific market, your competitors' traffic sources, and where the gaps are. Boost automates this research and generates a custom plan for your business in under 5 minutes.",
  },
  {
    question: "How do I create a marketing plan without hiring an agency?",
    answer:
      "Start with competitive research: identify 3-5 competitors, analyze their traffic sources and top content, and find gaps you can own. Then prioritize 1-2 channels based on where your audience is active and competitors are weak. Build a 30-day roadmap with weekly milestones. Tools like Boost can automate the research step, giving you agency-quality competitive analysis at a fraction of the cost.",
  },
  {
    question: "How long should a marketing plan be?",
    answer:
      "A marketing plan that gets executed is typically 2-5 pages, not 40. It should include: specific goals with metrics, competitive landscape summary, 1-2 priority channels, a 30-day timeline with weekly actions, and success metrics. Anything longer usually signals overthinking and under-executing.",
  },
  {
    question: "What's the difference between a marketing plan and a marketing strategy?",
    answer:
      "A marketing strategy is the 'what' and 'why'—your positioning, target audience, and competitive differentiation. A marketing plan is the 'how' and 'when'—specific tactics, timelines, and metrics. You need both, but most businesses skip the strategy (competitive research, positioning) and jump straight to tactics, which is why their plans fail.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  { name: "Marketing Plan Guide", url: "https://aboo.st/marketing-plan-guide" },
];

export const metadata: Metadata = {
  title: "How to Create a Marketing Plan That Actually Works | 30-Day Guide",
  description:
    "Skip the generic templates. Learn how to build a marketing plan based on real competitor research, prioritized tactics, and a 30-day roadmap you'll actually execute.",
  alternates: {
    canonical: "https://aboo.st/marketing-plan-guide",
  },
  openGraph: {
    title: "How to Create a Marketing Plan That Actually Works",
    description:
      "Skip the generic templates. Learn how to build a marketing plan based on real competitor research and a 30-day roadmap.",
    type: "article",
    url: "https://aboo.st/marketing-plan-guide",
  },
};

export default function MarketingPlanGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="How to Create a Marketing Plan That Actually Works | 30-Day Guide"
        description="Skip the generic templates. Learn how to build a marketing plan based on real competitor research, prioritized tactics, and a 30-day roadmap you'll actually execute."
        url="https://aboo.st/marketing-plan-guide"
      />
      <BreadcrumbSchema items={BREADCRUMB_ITEMS} />
      <FAQPageSchema faqs={GUIDE_FAQS} />
      <Header />

      <main className="flex-1">
        {/* Mobile TOC */}
        <div className="lg:hidden">
          <TableOfContents sections={GUIDE_SECTIONS} variant="mobile" />
        </div>

        <div className="mx-auto max-w-5xl px-4 md:px-12 py-8 md:py-16">
          {/* Hero */}
          <header className="pb-8 lg:text-center">
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
              The Complete Guide
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              How to Create a Marketing Plan That Actually&nbsp;Works
            </h1>
            <p className="text-lg text-foreground/70 max-w-xl lg:mx-auto leading-relaxed">
              Most marketing plans fail before they start. Not because the
              tactics are wrong. Because they&apos;re built on guesswork instead of
              research.
            </p>
          </header>

          {/* CTA banner - Soft Brutalist */}
          <div className="rounded-lg mb-10 border-2 border-foreground/20 bg-background p-6 shadow-[4px_4px_0_rgba(44,62,80,0.1)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Want a marketing plan based on real research?</p>
                <p className="text-sm text-foreground/60">Get AI-powered competitive analysis and a 30-day roadmap.</p>
              </div>
              <Link href="/start">
                <button className="rounded-md whitespace-nowrap px-6 py-3 bg-cta text-white font-semibold border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:border-b-0 transition-all duration-100">
                  Get your plan - {config.singlePrice}
                </button>
              </Link>
            </div>
          </div>

          {/* Main content with sidebar TOC */}
          <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
            {/* Desktop TOC sidebar */}
            <aside className="hidden lg:block">
              <TableOfContents sections={GUIDE_SECTIONS} variant="desktop" />
            </aside>

            {/* Content */}
            <article className="prose-boost">
              <p>
                This guide is different. It&apos;s the framework we use at Boost to
                generate marketing plans for SaaS founders, e-commerce owners, and
                consultants who don&apos;t have time to waste on tactics that won&apos;t
                move the needle.
              </p>

              <p>
                By the end, you&apos;ll know exactly what goes into a marketing plan
                that works—and why most of what you&apos;ve seen before doesn&apos;t.
              </p>

              <hr />

              <h2 id="what-to-include">What a Marketing Plan Should Actually Include</h2>

              <p>
                Forget the 40-page strategy documents. A marketing plan that gets
                executed has six components:
              </p>

              <h3>1. Specific, Measurable Goals</h3>

              <p>
                &ldquo;Get more customers&rdquo; isn&apos;t a goal. &ldquo;Acquire 50 trial signups in 30
                days from organic search&rdquo; is.
              </p>

              <p>
                Your goal needs a number, a timeframe, and a channel. Without all
                three, you&apos;re just hoping.
              </p>

              <h3>2. Target Audience (The Real Version)</h3>

              <p>
                Demographics are useless. &ldquo;Marketing managers aged 25-45&rdquo; tells
                you nothing about what they need or where they spend time.
              </p>

              <p>Instead, answer these:</p>
              <ul>
                <li>What problem are they actively trying to solve?</li>
                <li>
                  Where do they look for solutions? (Reddit? LinkedIn? Google?)
                </li>
                <li>What have they already tried that didn&apos;t work?</li>
                <li>What would make them switch from their current solution?</li>
              </ul>

              <h3>3. Competitive Landscape</h3>

              <p>
                This is where most plans fall apart. You can&apos;t build an effective
                strategy without knowing:
              </p>
              <ul>
                <li>Who else is competing for your audience&apos;s attention</li>
                <li>What channels are working for them</li>
                <li>What positioning they&apos;ve claimed</li>
                <li>Where the gaps are that you can own</li>
              </ul>

              <p>More on this in a minute—it&apos;s the hard part.</p>

              <h3>4. Channel Strategy</h3>

              <p>Pick 1-2 channels to start. Not seven. Not &ldquo;omnichannel.&rdquo;</p>

              <p>
                The channel depends on your business type, your audience, and
                where your competitors are weak. A B2B SaaS company and a DTC
                candle brand need completely different approaches.
              </p>

              <h3>5. Timeline with Milestones</h3>

              <p>
                A plan without deadlines is a wish list. Structure yours in 30-day
                sprints:
              </p>
              <ul>
                <li>What are you doing in week 1?</li>
                <li>What metrics will you check at day 14?</li>
                <li>What&apos;s the decision point at day 30?</li>
              </ul>

              <h3>6. Success Metrics</h3>

              <p>
                Define what &ldquo;working&rdquo; looks like before you start. Otherwise
                you&apos;ll move the goalposts or, worse, keep doing something
                ineffective because you never defined what effective meant.
              </p>

              <hr />

              <h2 id="why-plans-fail">Why Most Marketing Plans Fail</h2>

              <p>
                After analyzing hundreds of marketing plans across industries, the
                failure modes are predictable:
              </p>

              <h3>Generic Templates</h3>

              <p>
                That marketing plan template you downloaded? It was designed for
                no one in particular, which means it works for no one in
                particular.
              </p>

              <p>
                Templates give you structure. They don&apos;t give you strategy.
                Strategy requires knowing YOUR market, YOUR competitors, YOUR
                audience.
              </p>

              <h3>Copy/Paste Tactics</h3>

              <p>
                &ldquo;Just post on LinkedIn&rdquo; or &ldquo;start a newsletter&rdquo; isn&apos;t advice. It&apos;s
                a tactic stripped of context.
              </p>

              <p>
                What worked for a productivity app selling to developers won&apos;t
                work for a coaching business selling to executives. The platforms
                might be the same. The approach is completely different.
              </p>

              <h3>No Competitive Analysis</h3>

              <p>
                This is the biggest gap. Most founders have a vague sense of who
                their competitors are but zero insight into:
              </p>
              <ul>
                <li>What keywords they rank for</li>
                <li>Where their traffic actually comes from</li>
                <li>What positioning they&apos;ve claimed</li>
                <li>What gaps they&apos;ve left open</li>
              </ul>

              <p>
                Flying blind means wasting months on tactics your competitors have
                already proven don&apos;t work in your market.
              </p>

              <h3>Too Many Tactics, Zero Execution</h3>

              <p>The 50-idea brainstorm feels productive. It&apos;s not.</p>

              <p>
                Every idea on your list has an execution cost. Most founders
                dramatically underestimate this. Better to do three things well
                than seven things poorly.
              </p>

              <h3>No Prioritization Framework</h3>

              <p>
                Not all marketing tactics are equal. Some move the needle in week
                one. Others take six months to pay off.
              </p>

              <p>
                Without a framework for deciding what to do first, you&apos;ll either
                pick randomly or default to whatever feels comfortable—which is
                usually not what your business actually needs.
              </p>

              <hr />

              <h2 id="competitor-research">How to Research Your Competitors (The Hard Part)</h2>

              <p>
                This is where marketing plans become useful or useless. Good
                competitive research takes time and tools most founders don&apos;t have
                access to.
              </p>

              <p>Here&apos;s what you&apos;re trying to learn:</p>

              <h3>Who You&apos;re Actually Competing With</h3>

              <p>
                Your competitors aren&apos;t just companies selling similar products.
                They&apos;re anyone competing for your audience&apos;s attention and budget.
              </p>

              <p>
                For most businesses, the biggest competitor is &ldquo;do nothing.&rdquo; Your
                prospect decides to keep using spreadsheets, keep doing it
                manually, keep putting off the problem.
              </p>

              <p>Beyond that, map out:</p>
              <ul>
                <li>
                  <strong>Direct competitors</strong>: Same product, same audience
                </li>
                <li>
                  <strong>Indirect competitors</strong>: Different product, same
                  problem
                </li>
                <li>
                  <strong>Substitutes</strong>: Different approach entirely
                </li>
              </ul>

              <h3>Where Their Traffic Comes From</h3>

              <p>
                Knowing a competitor gets 50K monthly visitors is useless. Knowing
                they get 30K from organic search on &ldquo;email productivity tips&rdquo; and
                15K from LinkedIn is actionable.
              </p>

              <p>
                Tools like Similarweb, Ahrefs, and SEMrush can show you this—but
                they cost $100-400/month and take time to learn.
              </p>

              <h3>Keyword and Content Gaps</h3>

              <p>
                Your competitor ranks for 500 keywords. Which ones are actually
                driving customers? Which ones are they missing that you could own?
              </p>

              <p>
                This analysis alone can define your entire content strategy for
                six months.
              </p>

              <h3>Their Positioning</h3>

              <p>
                How do they describe themselves? What benefits do they lead with?
                What audience are they explicitly targeting?
              </p>

              <p>
                This tells you what positioning is already claimed—and what
                territory is still available.
              </p>

              {/* Callout */}
              <div className="my-8 rounded-lg border-2 border-cta/30 bg-cta/5 p-6 shadow-[3px_3px_0_rgba(230,126,34,0.15)]">
                <p className="text-foreground font-semibold mb-2 font-sans">
                  This is exactly what Boost automates.
                </p>
                <p className="text-foreground/70 text-sm mb-3">
                  Instead of spending $300/month on tools and 10+ hours on
                  research, you answer a few questions about your business and get
                  a complete competitive analysis in minutes. Real research on
                  YOUR market, not generic templates.
                </p>
                <Link
                  href="/in-action"
                  className="text-sm font-semibold text-cta hover:text-cta-hover transition-colors font-sans"
                >
                  See real examples →
                </Link>
              </div>

              <hr />

              <h2 id="stop-start-continue">The Stop/Start/Continue Framework</h2>

              <p>
                Most marketing plans only add. Here&apos;s what to do. Here&apos;s what else
                to do. Here&apos;s more to add to your plate.
              </p>

              <p>That&apos;s backwards.</p>

              <p>
                Before you start anything new, you need to figure out what to
                stop. The Stop/Start/Continue framework forces prioritization:
              </p>

              <h3>Stop Doing</h3>

              <p>
                What marketing activities are consuming time without producing
                results?
              </p>

              <p>Common culprits:</p>
              <ul>
                <li>
                  Posting on social platforms where your audience doesn&apos;t hang out
                </li>
                <li>Creating content for keywords you&apos;ll never rank for</li>
                <li>Attending events that don&apos;t generate leads</li>
                <li>&ldquo;Brand building&rdquo; activities with no measurable outcome</li>
              </ul>

              <p>
                Stopping the wrong things frees up capacity for the right things.
              </p>

              <h3>Start Doing</h3>

              <p>
                Based on your competitive research, what high-leverage
                opportunities are you missing?
              </p>

              <p>These should be specific and tied to gaps you&apos;ve identified:</p>
              <ul>
                <li>
                  &ldquo;Start creating content for [keyword cluster] where Competitor X
                  is weak&rdquo;
                </li>
                <li>
                  &ldquo;Start building presence on [platform] where our audience is
                  active but competitors aren&apos;t&rdquo;
                </li>
                <li>
                  &ldquo;Start outbound to [specific segment] that competitors are
                  ignoring&rdquo;
                </li>
              </ul>

              <h3>Continue Doing</h3>

              <p>
                What&apos;s actually working? Most founders can&apos;t answer this clearly
                because they&apos;re not tracking the right metrics.
              </p>

              <p>
                Whatever is working, do more of it. This sounds obvious but most
                marketing plans ignore current wins in favor of new tactics.
              </p>

              <h3>Quick Wins</h3>

              <p>
                Separate from the above: what can you do THIS WEEK that will have
                impact?
              </p>

              <p>
                Quick wins build momentum and buy you credibility (with yourself,
                your team, your investors) to execute the longer-term plays.
              </p>

              <hr />

              <h2 id="30-day-roadmap">Building Your 30-Day Marketing Roadmap</h2>

              <p>
                Thirty days is long enough to see results, short enough to stay
                focused. Here&apos;s how to structure it:
              </p>

              <h3>Week 1: Foundation</h3>

              <p>
                <strong>Goal</strong>: Get the basics right before scaling
                anything.
              </p>

              <ul>
                <li>
                  Lock in your positioning (one sentence that explains who you
                  help and how)
                </li>
                <li>
                  Define your primary metric (the one number you&apos;re trying to
                  move)
                </li>
                <li>Pick ONE channel to focus on</li>
                <li>Set up tracking so you can actually measure results</li>
              </ul>

              <p>
                Don&apos;t skip this. Scaling without foundations means scaling
                problems.
              </p>

              <h3>Week 2: Content and Outreach</h3>

              <p>
                <strong>Goal</strong>: Start creating assets and making contact.
              </p>

              <p>For content-driven businesses (SaaS, e-commerce):</p>
              <ul>
                <li>
                  Create 2-3 pieces of content targeting your priority keywords
                </li>
                <li>Optimize existing pages based on competitive gaps</li>
                <li>Start building backlinks or social distribution</li>
              </ul>

              <p>For relationship-driven businesses (consulting, services):</p>
              <ul>
                <li>Launch outreach to 20-30 qualified prospects</li>
                <li>Publish 1 piece of thought leadership</li>
                <li>Activate your network for introductions</li>
              </ul>

              <h3>Week 3: Optimization</h3>

              <p>
                <strong>Goal</strong>: Learn from the data and adjust.
              </p>

              <ul>
                <li>Review metrics from week 1-2</li>
                <li>What&apos;s getting traction? What&apos;s flat?</li>
                <li>Double down on what&apos;s working</li>
                <li>Kill or pause what isn&apos;t</li>
                <li>
                  Run one A/B test on your highest-traffic page or best-performing
                  channel
                </li>
              </ul>

              <p>
                Most founders skip this week and keep pushing forward blindly.
                Don&apos;t.
              </p>

              <h3>Week 4: Scale</h3>

              <p>
                <strong>Goal</strong>: Take what&apos;s working and amplify it.
              </p>

              <ul>
                <li>Increase volume on your winning channel</li>
                <li>Repurpose your best content for other formats</li>
                <li>
                  Start testing a second channel (only if channel one is working)
                </li>
                <li>Document what you&apos;ve learned for the next 30-day cycle</li>
              </ul>

              <hr />

              <h2 id="real-examples">Real Examples by Industry</h2>

              <p>
                Theory is nice. Here&apos;s what this looks like for real businesses:
              </p>

              {/* Example Cards */}
              <div className="my-8 space-y-4">
                <Link
                  href="/in-action/saas-email-productivity"
                  className="block rounded-lg border-2 border-foreground/15 bg-white p-5 shadow-[3px_3px_0_rgba(44,62,80,0.08)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.12)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-cta">
                    SaaS
                  </span>
                  <h4 className="text-lg font-semibold text-foreground mt-1 mb-2">
                    Email Productivity Tool
                  </h4>
                  <p className="text-sm text-foreground/70 font-serif">
                    Lavender gets 14K organic visits/month. Here&apos;s how a
                    bootstrapped email tool can compete.
                  </p>
                  <span className="text-sm font-semibold text-cta mt-3 inline-block">
                    See the full plan →
                  </span>
                </Link>

                <Link
                  href="/in-action/shopify-candles-growth"
                  className="block rounded-lg border-2 border-foreground/15 bg-white p-5 shadow-[3px_3px_0_rgba(44,62,80,0.08)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.12)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-cta">
                    E-commerce
                  </span>
                  <h4 className="text-lg font-semibold text-foreground mt-1 mb-2">
                    Artisan Candle Brand
                  </h4>
                  <p className="text-sm text-foreground/70 font-serif">
                    Brooklyn Candle Studio ranks for 5K keywords. Your SEO gap is
                    actually an opportunity.
                  </p>
                  <span className="text-sm font-semibold text-cta mt-3 inline-block">
                    See the full plan →
                  </span>
                </Link>

                <Link
                  href="/in-action/leadership-coaching-pipeline"
                  className="block rounded-lg border-2 border-foreground/15 bg-white p-5 shadow-[3px_3px_0_rgba(44,62,80,0.08)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.12)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-cta">
                    Consulting
                  </span>
                  <h4 className="text-lg font-semibold text-foreground mt-1 mb-2">
                    Leadership Coach
                  </h4>
                  <p className="text-sm text-foreground/70 font-serif">
                    You don&apos;t need BetterUp&apos;s budget. LinkedIn + one lead magnet
                    can fill a $96K coaching pipeline.
                  </p>
                  <span className="text-sm font-semibold text-cta mt-3 inline-block">
                    See the full plan →
                  </span>
                </Link>
              </div>

              <hr />

              <h2>Skip the Guesswork</h2>

              <p>You now know what goes into a marketing plan that works.</p>

              <p>The hard part isn&apos;t the framework. It&apos;s the research.</p>

              <p>
                Finding your real competitors. Analyzing their traffic sources.
                Identifying keyword gaps. Understanding what positioning is
                available. Prioritizing tactics based on YOUR situation, not
                someone else&apos;s playbook.
              </p>

              <p>
                This research takes 10+ hours with expensive tools—or 5 minutes
                with Boost.
              </p>
            </article>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <FAQSection
              faqs={GUIDE_FAQS}
              title="Marketing plan FAQs."
              subtitle="Quick answers"
            />
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Your turn
            </p>
            <h3 className="text-2xl font-bold text-foreground">
              Here&apos;s what you get:
            </h3>
            <ul className="space-y-2 text-foreground/80 text-left max-w-lg mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-cta font-bold">✓</span>
                <span>
                  <strong>Competitive analysis</strong> of your actual market
                  (not a generic template)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta font-bold">✓</span>
                <span>
                  <strong>Stop/Start/Continue</strong> recommendations based on
                  what&apos;s working in your space
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta font-bold">✓</span>
                <span>
                  <strong>Quick wins</strong> you can execute this week
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta font-bold">✓</span>
                <span>
                  <strong>30-day roadmap</strong> prioritized for your business
                  type and goals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cta font-bold">✓</span>
                <span>
                  <strong>Channel-specific tactics</strong> based on where your
                  competitors are weak
                </span>
              </li>
            </ul>

            <p className="text-foreground/70 pt-4">
              <strong className="text-foreground text-xl">{config.singlePrice}.</strong>{" "}
              One-time. No subscription.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/start">
                <Button size="xl">
                  Get my 30-day marketing plan
                </Button>
              </Link>
              <Link href="/in-action">
                <Button variant="outline" size="xl">
                  See examples first
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-sm text-foreground/50">
            Boost is built for founders who&apos;d rather execute than research. We
            handle the competitive analysis so you can focus on the work that
            actually grows your&nbsp;business.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
