import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { parseStrategy } from "@/lib/markdown/parser";
import { Header, Footer } from "@/components/layout";
import { ResultsContent } from "@/components/results";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { config } from "@/lib/config";
import Link from "next/link";
import type { StructuredOutput } from "@/lib/ai/formatter-types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSharedRun(slug: string) {
  const supabase = createServiceClient();

  const { data: run } = await supabase
    .from("runs")
    .select("id, status, input, output, share_slug, completed_at, created_at, structured_output")
    .eq("share_slug", slug)
    .single();

  return run;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const run = await getSharedRun(slug);

  if (!run || run.status !== "complete") {
    return { title: "Boost Not Found" };
  }

  // Extract product description for meta
  const input = run.input as { productDescription?: string } | null;
  const productDesc = input?.productDescription?.slice(0, 100) || "Boost";

  const canonicalUrl = `https://aboo.st/share/${slug}`;

  return {
    title: `${productDesc} | Boost`,
    description: "AI-powered Boost for startups and entrepreneurs. Real competitive research, actionable tactics, 30-day roadmap.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Boost: ${productDesc}`,
      description: "AI-powered Boost built with live competitive research.",
      type: "article",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `Boost: ${productDesc}`,
      description: "AI-powered Boost built with live competitive research.",
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params;
  const run = await getSharedRun(slug);

  if (!run) {
    notFound();
  }

  if (run.status !== "complete" || !run.output) {
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted">This Boost is still being generated.</p>
            <p className="text-sm text-muted">Check back in a few minutes.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const strategy = parseStrategy(run.output);
  const structuredOutput = run.structured_output as StructuredOutput | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 md:px-12 py-8 md:py-16">
          {/* Share Banner - Soft Brutalist */}
          <div className="rounded-lg border-2 border-foreground/20 bg-background p-4 shadow-[4px_4px_0_rgba(44,62,80,0.1)] mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm text-foreground/70">
                  This Boost was created with live competitor research
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground/20 hidden sm:inline">|</span>
                  <SocialShareButtons
                    url={`https://aboo.st/share/${slug}`}
                    text="Check out this Boost — real competitor research and a 30-day roadmap"
                    source="share_page"
                  />
                </div>
              </div>
              <Link href="/start">
                <button className="rounded-md whitespace-nowrap px-4 py-2 bg-cta text-white font-semibold text-sm border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:border-b-0 transition-all duration-100">
                  Get your own Boost
                </button>
              </Link>
            </div>
          </div>

          {/* Results Content - InsightsView if structured_output available */}
          <ResultsContent
            strategy={strategy}
            structuredOutput={structuredOutput}
            runId={run.id}
            activeTab="insights"
            isOwner={false}
          />

          {/* Bottom CTA - Soft Brutalist */}
          <div className="rounded-lg mt-20 border-2 border-foreground/20 bg-background p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Your turn
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              Want a Boost for your business?
            </h2>
            <p className="text-foreground/70 max-w-md mx-auto">
              Boost uses live competitive research and AI to create actionable strategies for small businesses.
            </p>
            <div className="pt-2">
              <Link href="/start">
                <button className="rounded-md px-8 py-4 bg-cta text-white font-semibold text-lg border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100">
                  Get started - {config.singlePrice}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
