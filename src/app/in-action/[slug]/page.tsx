import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { MarkdownContent } from "@/components/results/MarkdownContent";
import { createServiceClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import type { Example } from "@/lib/types/database";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
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

  const title = `${example.industry} Growth Plan | Boost in Action`;
  const description = example.insight;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
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

          {/* Badges */}
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-cta/10 text-cta rounded-full">
              {typedExample.industry}
            </span>
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide bg-foreground/5 text-foreground/60 rounded-full">
              {typedExample.stage}
            </span>
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide bg-foreground/5 text-foreground/50 rounded-full">
              Example Plan
            </span>
          </div>

          {/* Full Boost Output */}
          <article className="prose-like">
            <MarkdownContent content={typedExample.content} extended />
          </article>

          {/* Bottom CTA */}
          <section className="mt-16 pt-10 border-t border-foreground/10">
            <div className="rounded-lg border-2 border-foreground/20 bg-surface p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                Get a plan like this for your business.
              </h2>
              <p className="text-foreground/70 mb-6 max-w-md mx-auto">
                Real research on your market, your competitors, your opportunities.
              </p>
              <Link href="/start">
                <Button size="xl">
                  Get my plan - {config.singlePrice}
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
