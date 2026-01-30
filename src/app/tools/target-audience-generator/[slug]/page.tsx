import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import { TargetAudienceResults } from "./results-client";
import type { TargetAudienceOutput } from "@/lib/ai/target-audience";

type Props = { params: Promise<{ slug: string }> };

export type ResultStatus = "pending" | "processing" | "complete" | "failed";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("free_tool_results")
    .select("input, output, status")
    .eq("slug", slug)
    .eq("tool_type", "target-audience")
    .single();

  if (!data || data.status !== "complete") {
    return { title: "Target Audience Profile | Boost", robots: { index: false } };
  }

  const input = data.input as { businessName?: string } | null;
  const output = data.output as TargetAudienceOutput | null;

  return {
    title: `Target Audience for ${input?.businessName || "Your Business"} | Boost`,
    description: output?.primaryAudience?.headline || "Detailed target audience profile with demographics, psychographics, pain points, and messaging guide.",
    openGraph: {
      title: `Target Audience — ${input?.businessName || "Your Business"}`,
      description: output?.primaryAudience?.headline || "Free target audience profile",
    },
  };
}

export default async function TargetAudienceResultsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("free_tool_results")
    .select("slug, input, output, status, created_at, completed_at")
    .eq("slug", slug)
    .eq("tool_type", "target-audience")
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
            <p className="text-foreground font-semibold mb-2">Profile not found</p>
            <p className="text-foreground/60 text-sm mb-6">
              This link may be invalid or expired.
            </p>
            <Link
              href="/tools/target-audience-generator"
              className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Generate a new profile
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const input = data.input as { businessName: string; whatTheySell: string; targetCustomer?: string } | null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <TargetAudienceResults
          initialResult={{
            slug: data.slug,
            businessName: input?.businessName || "Your Business",
            output: data.output as TargetAudienceOutput | null,
            status: data.status as ResultStatus,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
