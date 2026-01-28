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
  title: "Boost vs Enji | Strategy vs Execution Tool for Small Business Marketing",
  description:
    "Enji is a $49/month marketing platform for ongoing tasks. Boost is a $29 one-time competitive analysis and plan. Different tools for different problems.",
  alternates: {
    canonical: "https://aboo.st/boost-vs-alternatives/enji",
  },
  openGraph: {
    title: "Boost vs Enji for Small Business Marketing",
    description:
      "Enji is a $49/month marketing platform. Boost is a $29 one-time competitive analysis and plan. Different tools for different problems.",
    type: "article",
    url: "https://aboo.st/boost-vs-alternatives/enji",
  },
};

const PAGE_FAQS = [
  {
    question: "Is Enji or Boost better for small business marketing?",
    answer:
      "They solve different problems. Enji helps you stay consistent with ongoing marketing tasks — scheduling posts, managing brand assets, following templates. Boost tells you WHAT to do based on competitive research. Use Boost to figure out your strategy, then use Enji (or just a calendar) to execute it.",
  },
  {
    question: "Does Enji do competitive research?",
    answer:
      "No. Enji provides templates and task management for marketing execution, but it doesn't analyze your competitors' traffic sources, keyword rankings, or content performance. That's the gap Boost fills — live competitive data turned into a specific plan for your market.",
  },
  {
    question: "Can I use Boost and Enji together?",
    answer:
      "Yes. Use Boost for the initial competitive research and strategic plan ($29 one-time), then use Enji for ongoing execution and task management ($49/month). Boost tells you what to do; Enji helps you do it consistently.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  { name: "Boost vs Alternatives", url: "https://aboo.st/boost-vs-alternatives" },
  { name: "vs Enji", url: "https://aboo.st/boost-vs-alternatives/enji" },
];

export default function BoostVsEnjiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="Boost vs Enji for Small Business Marketing"
        description="Enji is a $49/month marketing platform. Boost is a $29 one-time competitive analysis and plan. Different tools for different problems."
        url="https://aboo.st/boost-vs-alternatives/enji"
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
              Boost vs&nbsp;Enji
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
              Different tools for different problems. One helps you figure
              out what to do. The other helps you&nbsp;do&nbsp;it.
            </p>
          </header>

          {/* Quick comparison card */}
          <div
            className="rounded-md border-2 border-foreground/20 bg-white p-6 mb-10"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div />
              <div className="font-semibold text-center">Enji</div>
              <div className="font-semibold text-center text-cta">Boost</div>

              <div className="text-foreground/60">Cost</div>
              <div className="text-center">$49/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$29 one-time</div>

              <div className="text-foreground/60">Focus</div>
              <div className="text-center">Execution</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">Strategy</div>

              <div className="text-foreground/60">Competitor data</div>
              <div className="text-center">Templates</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">Live traffic + content</div>

              <div className="text-foreground/60">Ongoing value</div>
              <div className="text-center">Task management</div>
              <div className="text-center bg-cta/5 rounded px-2 py-1">One-time plan</div>

              <div className="text-foreground/60">Ongoing cost</div>
              <div className="text-center">$49/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$0</div>
            </div>
          </div>

          <article className="prose-boost">
            <h2>What Enji does</h2>

            <p>
              Enji is a marketing platform for small businesses that provides
              templates, task management, and guidance. It&apos;s designed for
              ongoing marketing operations — scheduling posts, managing brand
              assets, staying consistent.
            </p>

            <p>
              It&apos;s a good tool for the &ldquo;doing&rdquo; part of
              marketing.
            </p>

            <h2>What Enji doesn&apos;t do</h2>

            <p>
              Enji doesn&apos;t tell you <em>what</em> to do. Its templates
              are generic — not based on your specific competitors, market, or
              traffic data. It assumes you already know your strategy and just
              need help executing it.
            </p>

            <h2>When Enji makes sense</h2>

            <ul>
              <li>You already know your strategy and need help staying consistent</li>
              <li>You want templates and scheduling tools</li>
              <li>You&apos;re looking for ongoing software, not a one-time plan</li>
              <li>You need brand asset management</li>
            </ul>

            <h2>When Boost makes sense</h2>

            <ul>
              <li>You need to know WHAT to do before you need help DOING it</li>
              <li>You want strategy based on your actual market, not templates</li>
              <li>You prefer one-time cost over subscriptions</li>
              <li>You want competitive research, not task management</li>
            </ul>

            <h2>Use both (seriously)</h2>

            <p>
              They&apos;re complementary. Use Boost for the competitive
              research and strategic plan ($29 once). Use Enji for ongoing
              execution and consistency ($49/month). Strategy first,
              execution second.
            </p>

            <p className="text-sm text-foreground/50 mt-8">
              Last updated: January 2026. Enji pricing and features may change.
            </p>
          </article>

          <div className="mt-16">
            <FAQSection
              faqs={PAGE_FAQS}
              title="Enji vs Boost FAQs."
              subtitle="Quick answers"
            />
          </div>

          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Strategy first
            </p>
            <h3 className="text-2xl font-bold text-foreground text-balance">
              Figure out what to do — then go do&nbsp;it
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
