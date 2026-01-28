import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { config } from "@/lib/config";
import {
  ArticleSchema,
  BreadcrumbSchema,
  FAQPageSchema,
} from "@/components/seo";
import { FAQSection } from "@/components/landing";

export const metadata: Metadata = {
  title: "Boost vs Marketing Agency | $29 Plan vs $5,000+ Strategy Project",
  description:
    "Marketing agencies charge $2,000-10,000+ and take 2-4 weeks. Boost delivers competitive research and a 30-day plan in 5 minutes for $29. Here's when each makes sense.",
  alternates: {
    canonical: "https://aboo.st/boost-vs-alternatives/agency",
  },
  openGraph: {
    title: "Boost vs Marketing Agency",
    description:
      "Marketing agencies charge $2,000-10,000+ and take weeks. Boost delivers competitive research in 5 minutes for $29.",
    type: "article",
    url: "https://aboo.st/boost-vs-alternatives/agency",
  },
};

const PAGE_FAQS = [
  {
    question: "How much does a marketing agency charge for a marketing plan?",
    answer:
      "Most agencies charge $2,000-10,000+ for a strategy project, with timelines of 2-4 weeks. Ongoing retainers typically run $500-2,000/month. Some boutique agencies offer lighter engagements for $1,000-2,000, but quality varies wildly at that price point.",
  },
  {
    question: "Is an agency better than Boost for marketing strategy?",
    answer:
      "Agencies bring human judgment, industry experience, and can handle execution. If you have $5K+ budget and want someone accountable for results, an agency is the better call. If you need direction now, want to execute yourself, and your budget is under $100, Boost gives you the competitive research an agency would start with.",
  },
  {
    question: "Can Boost replace a marketing agency?",
    answer:
      "Not entirely. Boost replaces the competitive research and strategic planning phase — the part that normally takes an agency 2-4 weeks and costs $2,000+. It doesn't replace ongoing execution, creative work, or strategic counsel. Think of it as the starting point an agency would use, at a fraction of the cost.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  { name: "Boost vs Alternatives", url: "https://aboo.st/boost-vs-alternatives" },
  { name: "vs Agency", url: "https://aboo.st/boost-vs-alternatives/agency" },
];

export default function BoostVsAgencyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="Boost vs Marketing Agency"
        description="Marketing agencies charge $2,000-10,000+ and take weeks. Boost delivers competitive research in 5 minutes for $29."
        url="https://aboo.st/boost-vs-alternatives/agency"
      />
      <BreadcrumbSchema items={BREADCRUMB_ITEMS} />
      <FAQPageSchema faqs={PAGE_FAQS} />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-12 py-8 md:py-16">
          <header className="pb-8">
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
              Comparison
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Boost vs hiring a marketing&nbsp;agency
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
              Agencies are great if you have the budget. Most solopreneurs
              don&apos;t. Here&apos;s the honest&nbsp;breakdown.
            </p>
          </header>

          {/* Quick comparison card */}
          <div
            className="rounded-md border-2 border-foreground/20 bg-white p-6 mb-10"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div />
              <div className="font-semibold text-center">Agency</div>
              <div className="font-semibold text-center text-cta">Boost</div>

              <div className="text-foreground/60">Cost</div>
              <div className="text-center">$2,000-10,000+</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$29 one-time</div>

              <div className="text-foreground/60">Timeline</div>
              <div className="text-center">2-4 weeks</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">5 minutes</div>

              <div className="text-foreground/60">Competitor data</div>
              <div className="text-center">Comprehensive</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">Live traffic + content</div>

              <div className="text-foreground/60">Execution help</div>
              <div className="text-center">Yes (with retainer)</div>
              <div className="text-center bg-cta/5 rounded px-2 py-1">Plan only</div>

              <div className="text-foreground/60">Ongoing cost</div>
              <div className="text-center">$500-2,000/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$0</div>
            </div>
          </div>

          <article className="prose-boost">
            <h2>What a good agency delivers</h2>

            <p>
              A good agency brings experience, tools, and dedicated attention
              to your marketing. They&apos;ll do comprehensive research,
              interview your team, and deliver a professional strategy
              document. The best ones also handle execution.
            </p>

            <p>
              That expertise has real value. The question is whether you
              need all of it right now.
            </p>

            <h2>When an agency makes sense</h2>

            <ul>
              <li>You have budget ($5K+ for strategy, $1-2K/month for execution)</li>
              <li>You need someone to actually run your marketing, not just plan it</li>
              <li>You want a human accountable for results</li>
              <li>You need credibility with investors or stakeholders</li>
            </ul>

            <h2>When Boost makes sense</h2>

            <ul>
              <li>You need a plan this week, not next month</li>
              <li>Your budget is hundreds, not thousands</li>
              <li>You want to execute yourself and just need direction</li>
              <li>You want the competitive research an agency starts with — at 1% of the cost</li>
            </ul>

            <h2>They&apos;re not the same thing</h2>

            <p>
              Boost gives you the plan. You execute it. If you need someone
              to run your marketing for you, an agency is the better call.
            </p>

            <p>
              But if you know how to do the work and just need to know
              <em> what</em> work to do — that&apos;s what Boost is for.
              Some founders use Boost first, then bring the plan to an
              agency for execution.
            </p>
          </article>

          <div className="mt-16">
            <FAQSection
              faqs={PAGE_FAQS}
              title="Agency vs Boost FAQs."
              subtitle="Quick answers"
            />
          </div>

          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Agency research, solopreneur price
            </p>
            <h3 className="text-2xl font-bold text-foreground text-balance">
              Get the plan. Execute it&nbsp;yourself.
            </h3>
            <p className="text-foreground/70 max-w-lg mx-auto text-pretty">
              Live competitor data. 30-day roadmap. Channel-specific tactics.
              One-time {config.singlePrice}. Full refund if it&apos;s not&nbsp;useful.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/start">
                <Button size="xl">Get my marketing plan</Button>
              </Link>
              <Link href="/boost-vs-alternatives">
                <Button variant="outline" size="xl">
                  See all comparisons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
