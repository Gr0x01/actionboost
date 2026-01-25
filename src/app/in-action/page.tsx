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
  title: "Marketing Plan Examples | Boost in Action",
  description:
    "See real Boost outputs: competitor research, traffic analysis, and 30-day marketing plans for SaaS, e-commerce, and service businesses. Not templates.",
  alternates: {
    canonical: "https://aboo.st/in-action",
  },
  openGraph: {
    title: "Marketing Plan Examples | Boost in Action",
    description:
      "See real Boost outputs: competitor research, traffic analysis, and 30-day marketing plans for SaaS, e-commerce, and service businesses. Not templates.",
  },
};

function ExampleCard({ example }: { example: Example }) {
  return (
    <Link href={`/in-action/${example.slug}`} className="block group">
      <article className="h-full flex flex-col rounded-md border-2 border-foreground/20 bg-white p-6 shadow-[4px_4px_0_rgba(44,62,80,0.1)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.18)] hover:-translate-y-0.5 transition-all duration-150">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide bg-cta/10 text-cta rounded-full">
            {example.industry}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide border border-foreground/15 text-foreground/60 rounded-full">
            {example.stage}
          </span>
        </div>

        {/* Insight - the hook */}
        <p className="text-lg font-semibold text-foreground leading-snug group-hover:text-cta transition-colors">
          {example.insight}
        </p>

        {/* View link - pushed to bottom */}
        <div className="mt-auto pt-4">
          <div className="pt-4 border-t border-foreground/10">
            <span className="text-sm font-semibold text-cta group-hover:underline">
              See full plan &rarr;
            </span>
          </div>
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
            <p className="text-xs font-semibold tracking-wide text-cta uppercase mb-4">
              Boost in Action
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              See what you
              <br />
              <span className="relative inline-block">
                actually get.
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
              Real competitor research. Specific tactics. Plans for SaaS,
              e-commerce, and service businesses.
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
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-md border-2 border-foreground/20 bg-white p-10 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Get a plan for your business.
              </h2>
              <p className="text-foreground/70 mb-8">
                Real competitor research. Specific tactics. Not a template.
              </p>
              <Link href="/start">
                <Button size="xl">
                  Get my 30-day plan - {config.singlePrice}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
