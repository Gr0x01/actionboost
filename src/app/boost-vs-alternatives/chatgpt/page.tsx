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
  title: "Boost vs ChatGPT for Marketing Plans | Real Data vs Generic Advice",
  description:
    "ChatGPT gives generic marketing advice. Boost uses live competitor data — traffic sources, keyword gaps, content performance — to build a plan specific to your market.",
  alternates: {
    canonical: "https://aboo.st/boost-vs-alternatives/chatgpt",
  },
  openGraph: {
    title: "Boost vs ChatGPT for Marketing Plans",
    description:
      "ChatGPT gives generic marketing advice. Boost uses live competitor data to build a plan specific to your market.",
    type: "article",
    url: "https://aboo.st/boost-vs-alternatives/chatgpt",
  },
};

const PAGE_FAQS = [
  {
    question: "Can ChatGPT create a good marketing plan?",
    answer:
      "ChatGPT can help structure a marketing plan and brainstorm tactics, but it can't access live competitor data — traffic sources, keyword rankings, content performance. It gives generic advice based on training data, not specific insights about your market. Use ChatGPT for brainstorming, but you'll need actual research to make the plan actionable.",
  },
  {
    question: "Can I use Boost and ChatGPT together?",
    answer:
      "Yes, and many people do. Use Boost for the competitive research and strategic plan (the part ChatGPT can't do), then use ChatGPT to help write the actual content, emails, or social posts your plan calls for. Boost tells you what to do; ChatGPT can help you do it.",
  },
  {
    question: "Is ChatGPT free for marketing planning?",
    answer:
      "ChatGPT has a free tier, though the best models require a $20/month subscription. Even with the paid version, the fundamental limitation remains: it can't access live data about your competitors or market. The advice is based on training data, not your specific situation.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  { name: "Boost vs Alternatives", url: "https://aboo.st/boost-vs-alternatives" },
  { name: "vs ChatGPT", url: "https://aboo.st/boost-vs-alternatives/chatgpt" },
];

export default function BoostVsChatGPTPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="Boost vs ChatGPT for Marketing Plans"
        description="ChatGPT gives generic marketing advice. Boost uses live competitor data to build a plan specific to your market."
        url="https://aboo.st/boost-vs-alternatives/chatgpt"
      />
      <BreadcrumbSchema items={BREADCRUMB_ITEMS} />
      <FAQPageSchema faqs={PAGE_FAQS} />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-12 py-8 md:py-16">
          {/* Hero */}
          <header className="pb-8">
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
              Comparison
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Boost vs ChatGPT for marketing&nbsp;plans
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
              ChatGPT is great at a lot of things. Competitive research
              isn&apos;t one of&nbsp;them.
            </p>
          </header>

          {/* Quick comparison card */}
          <div
            className="rounded-md border-2 border-foreground/20 bg-white p-6 mb-10"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div />
              <div className="font-semibold text-center">ChatGPT</div>
              <div className="font-semibold text-center text-cta">Boost</div>

              <div className="text-foreground/60">Cost</div>
              <div className="text-center">Free–$20/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$29 one-time</div>

              <div className="text-foreground/60">Time</div>
              <div className="text-center">1–2 hours</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">5 minutes</div>

              <div className="text-foreground/60">Competitor data</div>
              <div className="text-center">None</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">Live traffic + content</div>

              <div className="text-foreground/60">Personalization</div>
              <div className="text-center">Generic base</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">Market-specific</div>

              <div className="text-foreground/60">Ongoing cost</div>
              <div className="text-center">$0–20/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$0</div>
            </div>
          </div>

          {/* Content */}
          <article className="prose-boost">
            <h2>The fundamental problem</h2>

            <p>
              ChatGPT (and Claude, Gemini, etc.) can help you brainstorm
              marketing ideas and structure a plan. They&apos;re fast, cheap, and
              available 24/7.
            </p>

            <p>
              But they have no access to live data. ChatGPT can&apos;t tell you
              that your competitor gets 40% of traffic from Pinterest, or that
              they rank for 500 keywords you&apos;re missing, or that their top
              content is about a topic you haven&apos;t covered.
            </p>

            <p>
              Instead, you get generic best practices: &ldquo;Post consistently
              on social media.&rdquo; &ldquo;Focus on SEO.&rdquo; &ldquo;Build
              an email list.&rdquo; These aren&apos;t wrong — they&apos;re just
              not specific to your market.
            </p>

            <h2>When ChatGPT makes sense</h2>

            <ul>
              <li>You need help organizing your thoughts</li>
              <li>You already know your market and just need a sounding board</li>
              <li>You&apos;re working with a $0 budget</li>
              <li>You want to brainstorm content ideas or write copy</li>
            </ul>

            <h2>When Boost makes sense</h2>

            <ul>
              <li>You need actual competitive intelligence about your market</li>
              <li>You want to know what&apos;s working for your specific competitors</li>
              <li>You need a plan based on real data, not generic advice</li>
              <li>You&apos;re willing to pay $29 for research that would cost $200-400/month in tools</li>
            </ul>

            <h2>Use both</h2>

            <p>
              The best approach for most founders: use Boost for the competitive
              research and strategic plan (the part ChatGPT can&apos;t do), then
              use ChatGPT to help execute — writing the emails, social posts,
              and content your plan calls for. Boost tells you <em>what</em> to
              do. ChatGPT helps you <em>do</em> it.
            </p>
          </article>

          {/* FAQ Section */}
          <div className="mt-16">
            <FAQSection
              faqs={PAGE_FAQS}
              title="ChatGPT vs Boost FAQs."
              subtitle="Quick answers"
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Ready?
            </p>
            <h3 className="text-2xl font-bold text-foreground text-balance">
              Get the research ChatGPT can&apos;t&nbsp;do
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
