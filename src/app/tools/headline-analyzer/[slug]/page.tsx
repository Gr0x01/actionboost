import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import { HeadlineAnalysisResults } from "./results-client";
import type { HeadlineAnalysisOutput } from "@/lib/ai/headline-analyzer";

type Props = { params: Promise<{ slug: string }> };

export type ResultStatus = "pending" | "processing" | "complete" | "failed";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("free_tool_results")
    .select("input, output, status")
    .eq("slug", slug)
    .eq("tool_type", "headline-analyzer")
    .single();

  if (!data || data.status !== "complete") {
    return { title: "Headline Analysis | Boost", robots: { index: false } };
  }

  const input = data.input as { headline?: string } | null;
  const output = data.output as HeadlineAnalysisOutput | null;

  return {
    title: `Headline Analysis: "${input?.headline || "Your Headline"}" | Boost`,
    description: output?.verdict || "Free headline and value proposition analysis with scoring and rewrite suggestions.",
    openGraph: {
      title: `Headline Score: ${output?.overall || "?"}/100`,
      description: output?.verdict || "Free headline analysis",
    },
  };
}

export default async function HeadlineAnalysisResultsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("free_tool_results")
    .select("slug, input, output, status, created_at, completed_at")
    .eq("slug", slug)
    .eq("tool_type", "headline-analyzer")
    .single();

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div
            className="bg-white border-2 border-foreground/20 rounded-md p-8 text-center max-w-md"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <p className="text-foreground font-semibold mb-2">Analysis not found</p>
            <p className="text-foreground/60 text-sm mb-6">
              This link may be invalid or expired.
            </p>
            <Link
              href="/tools/headline-analyzer"
              className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Analyze a headline
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const input = data.input as { headline: string; whatTheySell?: string; whoItsFor?: string } | null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeadlineAnalysisResults
          initialResult={{
            slug: data.slug,
            headline: input?.headline || "",
            output: data.output as HeadlineAnalysisOutput | null,
            status: data.status as ResultStatus,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
