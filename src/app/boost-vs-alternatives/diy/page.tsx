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
  title: "Boost vs DIY Marketing Plans | Skip the $400/mo Tool Subscriptions",
  description:
    "DIY marketing plans require Ahrefs, SEMrush, and 10-20 hours of research. Boost delivers the same competitive analysis in 10 minutes for $29 one-time.",
  alternates: {
    canonical: "https://aboo.st/boost-vs-alternatives/diy",
  },
  openGraph: {
    title: "Boost vs DIY Marketing Plans",
    description:
      "DIY marketing plans require expensive tools and 10-20 hours. Boost delivers the same competitive analysis in 10 minutes for $29.",
    type: "article",
    url: "https://aboo.st/boost-vs-alternatives/diy",
  },
};

const PAGE_FAQS = [
  {
    question: "How much does it cost to create a marketing plan yourself?",
    answer:
      "The tools alone cost $200-400/month (Ahrefs, Similarweb, SEMrush). Add 10-20 hours of your time for the first plan. If your hourly rate is $50+, DIY costs $700-1,400+ for a single plan. Boost delivers comparable competitive research for $29 one-time.",
  },
  {
    question: "Is DIY marketing research better than using a tool like Boost?",
    answer:
      "DIY gives you maximum control and the deepest learning. If you're building marketing as a core competency and plan to run analysis monthly, owning the tools and skills is valuable. But if you need a plan now and don't want to learn Ahrefs, Boost is faster and cheaper for a one-time analysis.",
  },
  {
    question: "What tools do I need for DIY competitive research?",
    answer:
      "At minimum: Ahrefs or SEMrush for keyword and backlink data ($99-199/month), Similarweb for traffic analysis ($149+/month), and a spreadsheet to synthesize findings. You'll also need to learn how to interpret the data, which has a steep learning curve.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  { name: "Boost vs Alternatives", url: "https://aboo.st/boost-vs-alternatives" },
  { name: "vs DIY", url: "https://aboo.st/boost-vs-alternatives/diy" },
];

export default function BoostVsDIYPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="Boost vs DIY Marketing Plans"
        description="DIY marketing plans require expensive tools and 10-20 hours. Boost delivers the same competitive analysis in 10 minutes for $29."
        url="https://aboo.st/boost-vs-alternatives/diy"
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
              Boost vs DIY marketing&nbsp;plans
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
              You can absolutely do this yourself. Here&apos;s what that
              actually involves — and when it makes sense to&nbsp;skip&nbsp;it.
            </p>
          </header>

          {/* Quick comparison card */}
          <div
            className="rounded-md border-2 border-foreground/20 bg-white p-6 mb-10"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div />
              <div className="font-semibold text-center">DIY</div>
              <div className="font-semibold text-center text-cta">Boost</div>

              <div className="text-foreground/60">Cost</div>
              <div className="text-center">$200-400/mo tools</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$29 one-time</div>

              <div className="text-foreground/60">Time</div>
              <div className="text-center">10-20 hours</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">10 minutes</div>

              <div className="text-foreground/60">Competitor data</div>
              <div className="text-center">Manual research</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">Automated</div>

              <div className="text-foreground/60">Learning curve</div>
              <div className="text-center">Steep</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">None</div>

              <div className="text-foreground/60">Ongoing cost</div>
              <div className="text-center">$200-400/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">$0</div>
            </div>
          </div>

          <article className="prose-boost">
            <h2>What DIY actually looks like</h2>

            <p>
              The DIY approach means subscribing to tools like Ahrefs,
              Similarweb, or SEMrush ($100-400/month each), learning how to
              use them, manually researching your competitors, and synthesizing
              the data into a plan.
            </p>

            <p>
              It&apos;s not that hard. But it&apos;s time-consuming, and the
              tools aren&apos;t cheap.
            </p>

            <h2>When DIY makes sense</h2>

            <ul>
              <li>You&apos;re building marketing as a core competency</li>
              <li>You have time to learn the tools (and want to)</li>
              <li>You&apos;ll run this analysis monthly, not just once</li>
              <li>You want maximum control over the research process</li>
            </ul>

            <h2>When Boost makes sense</h2>

            <ul>
              <li>You need a plan now, not after 20 hours of learning Ahrefs</li>
              <li>You don&apos;t want to subscribe to $200-400/month in tools for a one-time plan</li>
              <li>You want someone (or something) to tell you what the data means</li>
              <li>You&apos;d rather spend your time executing than researching</li>
            </ul>

            <h2>The real trade-off</h2>

            <p>
              DIY teaches you the skill. Boost gives you the output. If you
              plan to do competitive research regularly, learning the tools
              pays for itself. If you need one plan to get moving, Boost is
              $29 vs $400+ in subscriptions plus a weekend of research.
            </p>
          </article>

          <div className="mt-16">
            <FAQSection
              faqs={PAGE_FAQS}
              title="DIY vs Boost FAQs."
              subtitle="Quick answers"
            />
          </div>

          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Skip the tool subscriptions
            </p>
            <h3 className="text-2xl font-bold text-foreground text-balance">
              Get the research without the learning&nbsp;curve
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
