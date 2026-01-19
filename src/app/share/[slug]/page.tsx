import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { parseStrategy } from "@/lib/markdown/parser";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResultsContent, TableOfContents } from "@/components/results";
import { Button } from "@/components/ui/Button";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSharedRun(slug: string) {
  const supabase = createServiceClient();

  const { data: run } = await supabase
    .from("runs")
    .select("id, status, input, output, share_slug, completed_at, created_at")
    .eq("share_slug", slug)
    .single();

  return run;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const run = await getSharedRun(slug);

  if (!run || run.status !== "complete") {
    return { title: "Strategy Not Found | ActionBoost" };
  }

  // Extract product description for meta
  const input = run.input as { productDescription?: string } | null;
  const productDesc = input?.productDescription?.slice(0, 100) || "Growth Strategy";

  return {
    title: `${productDesc} | ActionBoost`,
    description: "AI-powered growth strategy for solo founders. Real competitive research, actionable tactics, 30-day roadmap.",
    openGraph: {
      title: `Growth Strategy: ${productDesc}`,
      description: "AI-powered growth strategy built with live competitive research.",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Growth Strategy: ${productDesc}`,
      description: "AI-powered growth strategy built with live competitive research.",
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
            <p className="text-muted">This strategy is still being generated.</p>
            <p className="text-sm text-muted">Check back in a few minutes.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const strategy = parseStrategy(run.output);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6">
          {/* Shared banner */}
          <div className="lg:ml-[220px] py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm text-muted">
                  This strategy was created with ActionBoost
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted hidden sm:inline">|</span>
                  <SocialShareButtons
                    url={`https://actionboo.st/share/${slug}`}
                    text="Interesting growth strategy I found on ActionBoost"
                    source="share_page"
                  />
                </div>
              </div>
              <Link href="/start">
                <Button size="sm">Get Your Own Strategy</Button>
              </Link>
            </div>
          </div>

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TableOfContents strategy={strategy} variant="mobile" />
          </div>

          {/* Desktop layout */}
          <div className="lg:flex lg:gap-8 py-8">
            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:w-[200px] lg:flex-shrink-0">
              <TableOfContents strategy={strategy} variant="desktop" />
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-prose">
              <ResultsContent strategy={strategy} />
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="lg:ml-[220px] pb-12">
            <div className="p-8 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Want a growth strategy for your product?
              </h2>
              <p className="text-muted max-w-md mx-auto">
                ActionBoost uses live competitive research and AI to create actionable strategies for solo founders.
              </p>
              <Link href="/start">
                <Button size="lg">Get Started - $7.99</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
