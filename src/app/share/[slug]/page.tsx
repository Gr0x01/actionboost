import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { parseStrategy } from "@/lib/markdown/parser";
import { Header, Footer, ResultsLayout } from "@/components/layout";
import { ResultsContent } from "@/components/results";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { config } from "@/lib/config";
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
    return { title: "Action Plan Not Found | Aboost" };
  }

  // Extract product description for meta
  const input = run.input as { productDescription?: string } | null;
  const productDesc = input?.productDescription?.slice(0, 100) || "Action Plan";

  return {
    title: `${productDesc} | Aboost`,
    description: "AI-powered action plan for startups and entrepreneurs. Real competitive research, actionable tactics, 30-day roadmap.",
    openGraph: {
      title: `Action Plan: ${productDesc}`,
      description: "AI-powered action plan built with live competitive research.",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `Action Plan: ${productDesc}`,
      description: "AI-powered action plan built with live competitive research.",
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
            <p className="text-muted">This action plan is still being generated.</p>
            <p className="text-sm text-muted">Check back in a few minutes.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const strategy = parseStrategy(run.output);

  const shareBanner = (
    <div className="rounded-2xl border-[3px] border-foreground bg-background p-4 shadow-[4px_4px_0_0_rgba(44,62,80,1)] mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-foreground/70">
            This action plan was created with Aboost
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/30 hidden sm:inline">|</span>
            <SocialShareButtons
              url={`https://aboo.st/share/${slug}`}
              text="Interesting action plan I found on Aboost"
              source="share_page"
            />
          </div>
        </div>
        <Link href="/start">
          <button className="rounded-lg whitespace-nowrap px-4 py-2 bg-cta text-white font-bold text-sm border-2 border-cta shadow-[3px_3px_0_0_rgba(44,62,80,1)] hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
            Get Your Own Plan
          </button>
        </Link>
      </div>
    </div>
  );

  const bottomCta = (
    <div className="rounded-2xl mt-16 border-[3px] border-foreground bg-background p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] text-center space-y-4">
      <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase">
        Your turn
      </p>
      <h2 className="text-2xl font-black text-foreground">
        Want an action plan for your product?
      </h2>
      <p className="text-foreground/70 max-w-md mx-auto">
        Aboost uses live competitive research and AI to create actionable strategies for startups and entrepreneurs.
      </p>
      <Link href="/start">
        <button className="rounded-xl px-8 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
          Get Started - {config.singlePrice}
        </button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <ResultsLayout
        toc={{ strategy }}
        slots={{
          afterToc: shareBanner,
          bottomCta,
        }}
      >
        <ResultsContent strategy={strategy} />
      </ResultsLayout>

      <Footer />
    </div>
  );
}
