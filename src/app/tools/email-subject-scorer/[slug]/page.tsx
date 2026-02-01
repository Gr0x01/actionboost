import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import { EmailSubjectAnalysisResults } from "./results-client";
import type { EmailSubjectAnalysisOutput } from "@/lib/ai/email-subject-analyzer";

type Props = { params: Promise<{ slug: string }> };

export type ResultStatus = "pending" | "processing" | "complete" | "failed";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("free_tool_results")
    .select("input, output, status")
    .eq("slug", slug)
    .eq("tool_type", "email-subject-scorer")
    .single();

  if (!data || data.status !== "complete") {
    return { title: "Subject Line Analysis | Boost", robots: { index: false } };
  }

  const input = data.input as { subjectLine?: string } | null;
  const output = data.output as EmailSubjectAnalysisOutput | null;

  return {
    title: `Subject Line Analysis: "${input?.subjectLine || "Your Subject Line"}" | Boost`,
    description: output?.verdict || "Free email subject line analysis with scoring and rewrite suggestions.",
    openGraph: {
      title: `Subject Line Score: ${output?.overall || "?"}/100`,
      description: output?.verdict || "Free subject line analysis",
    },
  };
}

export default async function EmailSubjectScorerResultsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("free_tool_results")
    .select("slug, input, output, status, created_at, completed_at")
    .eq("slug", slug)
    .eq("tool_type", "email-subject-scorer")
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
              href="/tools/email-subject-scorer"
              className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Score a subject line
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const input = data.input as { subjectLine: string; emailAbout?: string; audience?: string } | null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <EmailSubjectAnalysisResults
          initialResult={{
            slug: data.slug,
            subjectLine: input?.subjectLine || "",
            output: data.output as EmailSubjectAnalysisOutput | null,
            status: data.status as ResultStatus,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
