import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import { MarketingAuditResults } from "./results-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data: audit } = await supabase
    .from("free_tool_results")
    .select("url, output, status")
    .eq("slug", slug)
    .single();

  if (!audit || audit.status !== "complete") {
    return { title: "Marketing Audit | Boost", robots: { index: false } };
  }

  const output = audit.output as { summary?: string } | null;

  return {
    title: `Marketing Audit for ${audit.url} | Boost`,
    description: output?.summary || "See what's costing your site customers — free marketing audit with specific findings and fixes.",
    openGraph: {
      title: `Marketing Audit — ${audit.url}`,
      description: output?.summary || "Free marketing audit — see what's costing your site customers",
    },
  };
}

export default async function MarketingAuditResultsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: audit } = await supabase
    .from("free_tool_results")
    .select("slug, url, business_description, output, status, created_at, completed_at")
    .eq("slug", slug)
    .single();

  if (!audit) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div
            className="bg-white border-2 border-foreground/20 rounded-md p-8 text-center max-w-md"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <p className="text-foreground font-semibold mb-2">Audit not found</p>
            <p className="text-foreground/60 text-sm mb-6">
              This link may be invalid or expired.
            </p>
            <Link
              href="/tools/marketing-audit"
              className="inline-flex items-center gap-2 bg-cta text-white font-semibold px-6 py-3 rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Run a new audit
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <MarketingAuditResults
          initialAudit={{
            slug: audit.slug,
            url: audit.url || "",
            businessDescription: audit.business_description || "",
            output: audit.output as MarketingAuditOutput | null,
            status: audit.status as AuditStatus,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}

// Re-export types for client component
export type AuditStatus = "pending" | "processing" | "complete" | "failed";
export type MarketingAuditOutput = {
  silentKiller: string;
  summary: string;
  scores?: {
    overall: number;
    clarity: number;
    customerFocus: number;
    proof: number;
    friction: number;
  };
  findings: Array<{
    category: "clarity" | "customer-focus" | "proof" | "friction";
    title: string;
    detail: string;
    recommendation: string;
  }>;
};
