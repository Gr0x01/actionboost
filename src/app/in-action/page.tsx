import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import type { Example } from "@/lib/types/database";

// Force dynamic rendering to always show latest examples
export const dynamic = "force-dynamic";

// Metadata for SEO
export const metadata = {
  title: "Boost in Action | Real Strategies for Real Businesses",
  description:
    "See real growth strategies for salons, e-commerce shops, and service businesses. Actual plans from Actionboo.st showing what works.",
  openGraph: {
    title: "Boost in Action | Real Strategies for Real Businesses",
    description:
      "See real growth strategies for salons, e-commerce shops, and service businesses. Actual plans from Actionboo.st showing what works.",
  },
};

function ExampleCard({ example }: { example: Example }) {
  return (
    <Link href={`/in-action/${example.slug}`} className="block group">
      <article className="h-full rounded-2xl border-[3px] border-foreground bg-surface p-6 shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-1 transition-all duration-150">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide bg-cta/10 text-cta rounded font-semibold">
            {example.industry}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide bg-foreground/10 text-foreground/70 rounded">
            {example.stage}
          </span>
        </div>

        {/* Insight - the hook */}
        <p className="text-lg font-bold text-foreground leading-snug group-hover:text-cta transition-colors">
          {example.insight}
        </p>

        {/* View link */}
        <div className="mt-4 pt-4 border-t border-border">
          <span className="text-sm font-semibold text-cta group-hover:underline">
            See full plan &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}

export default async function InActionPage() {
  const supabase = createServiceClient();

  const { data: examples } = await supabase
    .from("examples")
    .select("id, slug, industry, stage, insight, metadata, published_at")
    .eq("is_live", true)
    .order("published_at", { ascending: false });

  const liveExamples = (examples || []) as Example[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-cta uppercase font-semibold mb-4">
              Boost in Action
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">
              Real strategies.
              <br />
              Real businesses.
              <br />
              <span className="relative inline-block">
                Actual results.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-4"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8C30 4 50 9 80 5C110 1 140 8 170 4C185 2 198 6 198 6"
                    stroke="#E67E22"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              These are salons, niche e-commerce shops, and service
              businesses&mdash;just like yours. Here&apos;s what they&apos;re
              doing differently.
            </p>
          </div>
        </section>

        {/* Examples Grid */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            {liveExamples.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60 mb-6">
                  Examples coming soon. Check back later.
                </p>
                <Link href="/start">
                  <Button>Get your own strategy</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveExamples.map((example) => (
                  <ExampleCard key={example.id} example={example} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-surface border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">
              Your situation is different.
            </h2>
            <p className="text-foreground/70 mb-8">
              Get a strategy built for your actual business&mdash;not a template.
            </p>
            <Link href="/start">
              <Button size="xl">
                Get My Plan &mdash; {config.singlePrice}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
