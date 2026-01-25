import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { MarkdownContent } from "@/components/results/MarkdownContent";
import {
  PriorityCards,
  MetricsSnapshot,
  DeepDivesAccordion,
  CompetitiveComparison,
  KeywordOpportunities,
  MarketPulse,
  PositioningSummaryV2,
  LeadDiscovery,
  Discoveries,
} from "@/components/results/dashboard";
import { ArticleSchema } from "@/components/seo";
import { parseStrategy } from "@/lib/markdown/parser";
import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import type { Example } from "@/lib/types/database";
import type { StructuredOutput } from "@/lib/ai/formatter-types";

// ISR: revalidate every hour for fresh data while keeping pages static for SEO
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-generate pages for all live examples at build time
export async function generateStaticParams() {
  const supabase = createServiceClient();

  const { data: examples } = await supabase
    .from("examples")
    .select("slug")
    .eq("is_live", true);

  return (examples ?? []).map((example) => ({
    slug: example.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: example } = await supabase
    .from("examples")
    .select("industry, insight")
    .eq("slug", slug)
    .eq("is_live", true)
    .single();

  if (!example) {
    return {
      title: "Example Not Found | Actionboo.st",
    };
  }

  const title = `${example.industry} Marketing Plan Example | Boost`;
  const description = `${example.insight} See the full competitor research and 30-day roadmap.`;
  const canonicalUrl = `https://aboo.st/in-action/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
    },
  };
}

export default async function ExampleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: example, error } = await supabase
    .from("examples")
    .select("*")
    .eq("slug", slug)
    .eq("is_live", true)
    .single();

  if (error || !example) {
    notFound();
  }

  const typedExample = example as Example;
  const structuredOutput = typedExample.structured_output as StructuredOutput | null;
  const strategy = parseStrategy(typedExample.content);

  // Check if we have dashboard data
  const hasDashboardData = structuredOutput && (
    (structuredOutput.thisWeek?.days?.length ?? 0) > 0 ||
    (structuredOutput.topPriorities?.length ?? 0) > 0
  );

  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title={`${typedExample.industry} Marketing Plan Example`}
        description={typedExample.insight}
        url={`https://aboo.st/in-action/${slug}`}
        publishedAt={typedExample.published_at || undefined}
        industry={typedExample.industry}
      />
      <Header />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="mb-10">
            {/* Breadcrumb row with CTA card */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <nav>
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link
                      href="/in-action"
                      className="text-foreground/60 hover:text-cta transition-colors"
                    >
                      Boost in Action
                    </Link>
                  </li>
                  <li className="text-foreground/40">/</li>
                  <li className="text-foreground font-medium truncate">
                    {typedExample.industry}
                  </li>
                </ol>
              </nav>

              {/* CTA card */}
              <Link
                href="/start"
                className="hidden sm:flex items-center gap-2 rounded-lg border-2 border-foreground/20 bg-surface px-4 py-2 shadow-[3px_3px_0_rgba(44,62,80,0.08)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.12)] hover:-translate-y-0.5 transition-all"
              >
                <span className="text-sm text-foreground/70">Your turn.</span>
                <span className="text-sm font-semibold text-cta">Build yours - {config.singlePrice} &rarr;</span>
              </Link>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-cta/10 text-cta rounded-full">
                {typedExample.industry}
              </span>
              <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide border border-foreground/15 text-foreground/60 rounded-full">
                {typedExample.stage}
              </span>
              <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide border border-foreground/15 text-foreground/50 rounded-full">
                Example Plan
              </span>
            </div>
          </div>

          {/* Content - Dashboard or Markdown */}
          {hasDashboardData && structuredOutput ? (
            <ExampleDashboard
              structuredOutput={structuredOutput}
              strategy={strategy}
            />
          ) : (
            <article className="prose-like max-w-3xl">
              <MarkdownContent content={typedExample.content} extended />
            </article>
          )}

          {/* Bottom CTA */}
          <section className="mt-16 pt-10 border-t border-foreground/10">
            <div className="max-w-2xl mx-auto rounded-md border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Get a plan like this for your business.
              </h2>
              <p className="text-foreground/70 mb-6 max-w-md mx-auto">
                Real research on your market, your competitors, your opportunities.
              </p>
              <Link href="/start">
                <Button size="xl">
                  Get my 30-day plan - {config.singlePrice}
                </Button>
              </Link>
            </div>
          </section>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/in-action"
              className="text-sm text-foreground/60 hover:text-cta transition-colors"
            >
              &larr; View all examples
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Dashboard view for examples with structured output
 * Same layout as InsightsView but without refinement interstitial
 */
function ExampleDashboard({
  structuredOutput,
  strategy,
}: {
  structuredOutput: StructuredOutput;
  strategy: ReturnType<typeof parseStrategy>;
}) {
  const {
    positioning,
    competitiveComparison,
    keywordOpportunities,
    marketQuotes,
    discoveries,
  } = structuredOutput;

  // Split discoveries: first one is hero, rest go to secondary section
  const leadDiscovery = discoveries?.[0];
  const remainingDiscoveries = discoveries?.slice(1) || [];

  return (
    <div className="space-y-24">
      {/* 1. Positioning */}
      {positioning && <PositioningSummaryV2 positioning={positioning} />}

      {/* 2. Lead Discovery (hero) */}
      {leadDiscovery && <LeadDiscovery discovery={leadDiscovery} />}

      {/* 3. Top Priorities */}
      {structuredOutput.topPriorities.length > 0 && (
        <PriorityCards priorities={structuredOutput.topPriorities} />
      )}

      {/* 4. Competitive Comparison */}
      {competitiveComparison && competitiveComparison.domains.length > 0 && (
        <CompetitiveComparison comparison={competitiveComparison} />
      )}

      {/* 5. Market Pulse */}
      {marketQuotes && marketQuotes.quotes.length > 0 && (
        <MarketPulse quotes={marketQuotes} />
      )}

      {/* 6. Keyword Opportunities */}
      {keywordOpportunities && keywordOpportunities.keywords.length > 0 && (
        <KeywordOpportunities opportunities={keywordOpportunities} />
      )}

      {/* 7. Metrics Snapshot */}
      {structuredOutput.metrics.length > 0 && (
        <MetricsSnapshot metrics={structuredOutput.metrics} />
      )}

      {/* 8. Remaining Discoveries */}
      {remainingDiscoveries.length > 0 && (
        <Discoveries discoveries={remainingDiscoveries} />
      )}

      {/* 9. Deep Dives */}
      <DeepDivesAccordion strategy={strategy} />
    </div>
  );
}
