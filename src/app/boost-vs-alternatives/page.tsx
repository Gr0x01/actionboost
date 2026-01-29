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
  title: "Best Marketing Plan Tool for Small Business | Boost vs Alternatives",
  description:
    "Compare Boost to DIY marketing plans, ChatGPT, agencies, and tools like Enji. Find the best way to create a marketing plan for your small business.",
  alternates: {
    canonical: "https://aboo.st/boost-vs-alternatives",
  },
  openGraph: {
    title: "Best Marketing Plan Tool for Small Business | Boost vs Alternatives",
    description:
      "Compare Boost to DIY marketing plans, ChatGPT, agencies, and tools like Enji. Find the best way to create a marketing plan.",
    type: "article",
    url: "https://aboo.st/boost-vs-alternatives",
  },
};

const HUB_FAQS = [
  {
    question: "What's the best marketing plan tool for small businesses?",
    answer:
      "It depends on your budget and time. If you have $5K+ and can wait weeks, an agency delivers the most comprehensive work. If you need a plan today for under $50, Boost provides agency-quality competitive research at a fraction of the cost. DIY is free but requires 10+ hours and expensive tool subscriptions. ChatGPT is fast but lacks real market data.",
  },
  {
    question: "How much does a marketing plan cost?",
    answer:
      "Ranges wildly. A DIY plan is 'free' but costs $200-400/month in tool subscriptions plus 10-20 hours of your time. An agency charges $2,000-10,000+ for a strategy project. Marketing platforms like Enji run $49/month. Boost is $29 one-time — you get the competitive research and plan without the ongoing cost.",
  },
  {
    question: "What kind of businesses use Boost?",
    answer:
      "SaaS founders, e-commerce store owners, consultants, coaches, agency owners, and niche businesses. We've run plans for everything from email productivity tools to artisan candle brands to equestrian product companies. If you have competitors, Boost can research them.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  { name: "Boost vs Alternatives", url: "https://aboo.st/boost-vs-alternatives" },
];

const COMPARISON_PAGES = [
  {
    href: "/boost-vs-alternatives/chatgpt",
    label: "vs ChatGPT",
    tagline: "Generic advice vs live competitor data",
    highlight: "ChatGPT can't see your competitors' traffic sources. Boost can.",
  },
  {
    href: "/boost-vs-alternatives/diy",
    label: "vs DIY",
    tagline: "$400/month in tools vs $29 one-time",
    highlight: "Same research, fraction of the cost and time.",
  },
  {
    href: "/boost-vs-alternatives/agency",
    label: "vs Agency",
    tagline: "$5,000+ strategy project vs $29 plan",
    highlight: "Agency-quality research. Solopreneur price.",
  },
  {
    href: "/boost-vs-alternatives/enji",
    label: "vs Enji",
    tagline: "Strategy vs execution tool",
    highlight: "Boost tells you what to do. Enji helps you do it.",
  },
];

export default function ComparisonHubPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="Best Marketing Plan Tool for Small Business | Boost vs Alternatives"
        description="Compare Boost to DIY marketing plans, ChatGPT, agencies, and tools like Enji."
        url="https://aboo.st/boost-vs-alternatives"
      />
      <BreadcrumbSchema items={BREADCRUMB_ITEMS} />
      <FAQPageSchema faqs={HUB_FAQS} />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-12 py-8 md:py-16">
          {/* Hero */}
          <header className="pb-8 lg:text-center">
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
              Comparison Guide
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              What&apos;s the best way to create a marketing&nbsp;plan?
            </h1>
            <p className="text-lg text-foreground/70 max-w-xl lg:mx-auto leading-relaxed text-pretty">
              Five options. Real trade-offs. Here&apos;s what each one actually
              delivers — and what it&nbsp;doesn&apos;t.
            </p>
          </header>

          {/* Overview */}
          <div className="prose-boost max-w-3xl lg:mx-auto mb-12">
            <p>
              You need a marketing plan. You don&apos;t have $5K for an agency
              or 20 hours for DIY research. So what actually works?
            </p>
            <p>
              We&apos;re obviously biased — we built Boost — but we&apos;ll
              tell you when the other options are better. (They sometimes are.)
            </p>
          </div>

          {/* Comparison table - Desktop */}
          <div className="hidden md:block overflow-x-auto mb-12">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground/20">
                  <th className="text-left py-3 px-4 font-semibold">Factor</th>
                  <th className="text-left py-3 px-4 font-semibold">DIY</th>
                  <th className="text-left py-3 px-4 font-semibold">ChatGPT</th>
                  <th className="text-left py-3 px-4 font-semibold">Agency</th>
                  <th className="text-left py-3 px-4 font-semibold">Enji</th>
                  <th className="text-left py-3 px-4 font-semibold bg-cta/5 rounded-t-md">
                    Boost
                  </th>
                </tr>
              </thead>
              <tbody className="font-serif">
                <tr className="border-b border-foreground/10">
                  <td className="py-3 px-4 font-semibold font-sans">Cost</td>
                  <td className="py-3 px-4">Free + tools ($200-400/mo)</td>
                  <td className="py-3 px-4">Free-$20/mo</td>
                  <td className="py-3 px-4">$2,000-10,000+</td>
                  <td className="py-3 px-4">$49/mo</td>
                  <td className="py-3 px-4 bg-cta/5 font-semibold">$29 one-time</td>
                </tr>
                <tr className="border-b border-foreground/10">
                  <td className="py-3 px-4 font-semibold font-sans">Time to plan</td>
                  <td className="py-3 px-4">10-20 hours</td>
                  <td className="py-3 px-4">1-2 hours</td>
                  <td className="py-3 px-4">2-4 weeks</td>
                  <td className="py-3 px-4">2-3 hours</td>
                  <td className="py-3 px-4 bg-cta/5 font-semibold">10 minutes</td>
                </tr>
                <tr className="border-b border-foreground/10">
                  <td className="py-3 px-4 font-semibold font-sans">Competitor research</td>
                  <td className="py-3 px-4">Manual (if you know how)</td>
                  <td className="py-3 px-4">None (no live data)</td>
                  <td className="py-3 px-4">Comprehensive</td>
                  <td className="py-3 px-4">Basic templates</td>
                  <td className="py-3 px-4 bg-cta/5 font-semibold">Live traffic + content</td>
                </tr>
                <tr className="border-b border-foreground/10">
                  <td className="py-3 px-4 font-semibold font-sans">Personalization</td>
                  <td className="py-3 px-4">High (you control it)</td>
                  <td className="py-3 px-4">Medium (generic base)</td>
                  <td className="py-3 px-4">High</td>
                  <td className="py-3 px-4">Medium</td>
                  <td className="py-3 px-4 bg-cta/5 font-semibold">High (market-specific)</td>
                </tr>
                <tr className="border-b border-foreground/10">
                  <td className="py-3 px-4 font-semibold font-sans">Ongoing cost</td>
                  <td className="py-3 px-4">$200-400/mo for tools</td>
                  <td className="py-3 px-4">$0-20/mo</td>
                  <td className="py-3 px-4">$500-2,000/mo retainer</td>
                  <td className="py-3 px-4">$49/mo</td>
                  <td className="py-3 px-4 bg-cta/5 font-semibold">$0</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold font-sans">Actionable roadmap</td>
                  <td className="py-3 px-4">You build it</td>
                  <td className="py-3 px-4">Generic suggestions</td>
                  <td className="py-3 px-4">Detailed</td>
                  <td className="py-3 px-4">Task-based</td>
                  <td className="py-3 px-4 bg-cta/5 rounded-b-md font-semibold">30-day weekly plan</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4 mb-12">
            {[
              { name: "DIY", cost: "Free + $200-400/mo tools", time: "10-20 hours", research: "Manual", ongoing: "$200-400/mo" },
              { name: "ChatGPT", cost: "Free-$20/mo", time: "1-2 hours", research: "None", ongoing: "$0-20/mo" },
              { name: "Agency", cost: "$2,000-10,000+", time: "2-4 weeks", research: "Comprehensive", ongoing: "$500-2,000/mo" },
              { name: "Enji", cost: "$49/mo", time: "2-3 hours", research: "Templates", ongoing: "$49/mo" },
              { name: "Boost", cost: "$29 one-time", time: "10 minutes", research: "Live data", ongoing: "$0", highlight: true },
            ].map((option) => (
              <div
                key={option.name}
                className={`rounded-md border-2 p-4 ${
                  option.highlight
                    ? "border-cta/40 bg-cta/5"
                    : "border-foreground/15 bg-white"
                }`}
                style={{
                  boxShadow: option.highlight
                    ? "4px 4px 0 rgba(230, 126, 34, 0.15)"
                    : "3px 3px 0 rgba(44, 62, 80, 0.08)",
                }}
              >
                <h4 className={`font-bold text-lg mb-3 ${option.highlight ? "text-cta" : ""}`}>
                  {option.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Cost</span>
                    <span className="font-medium">{option.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Time</span>
                    <span className="font-medium">{option.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Research</span>
                    <span className="font-medium">{option.research}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Ongoing</span>
                    <span className="font-medium">{option.ongoing}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Individual comparison links */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Detailed comparisons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMPARISON_PAGES.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="block rounded-md border-2 border-foreground/15 bg-white p-5 shadow-[3px_3px_0_rgba(44,62,80,0.08)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.12)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-cta">
                    {page.label}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">
                    {page.tagline}
                  </h3>
                  <p className="text-sm text-foreground/70 font-serif">
                    {page.highlight}
                  </p>
                  <span className="text-sm font-semibold text-cta mt-3 inline-block">
                    Read comparison →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom line */}
          <div className="prose-boost max-w-3xl lg:mx-auto mb-12">
            <h2>The bottom line</h2>
            <ul>
              <li>
                <strong>Zero budget, have time:</strong> DIY with free tools
                or ChatGPT for structure
              </li>
              <li>
                <strong>Need a plan today, budget under $50:</strong> Boost.
                Real competitive research, 10 minutes, $29.
              </li>
              <li>
                <strong>Need ongoing execution help:</strong> Enji or a
                marketing platform
              </li>
              <li>
                <strong>Five-figure budget, want full service:</strong>{" "}
                Agency for strategy and execution
              </li>
            </ul>
            <p>
              Boost gives you the plan. You execute it. If you need someone
              to run your marketing for you, an agency is the better call.
              But if you know how to do the work and just need to know
              <em> what</em> work to do — that&apos;s what Boost is for.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <FAQSection
              faqs={HUB_FAQS}
              title="Comparison FAQs."
              subtitle="Quick answers"
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Ready to try it?
            </p>
            <h3 className="text-2xl font-bold text-foreground text-balance">
              Get your marketing plan in 5&nbsp;minutes
            </h3>
            <p className="text-foreground/70 max-w-lg mx-auto text-pretty">
              Live competitive research. 30-day roadmap. Channel-specific tactics.
              One-time {config.singlePrice}. Full refund if it&apos;s not&nbsp;useful.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/start">
                <Button size="xl">Get my marketing plan</Button>
              </Link>
              <Link href="/in-action">
                <Button variant="outline" size="xl">
                  See examples first
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
