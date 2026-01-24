import { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { Header, Footer, ResultsLayout } from "@/components/layout";
import { ResultsContent } from "@/components/results";
import { parseStrategy } from "@/lib/markdown/parser";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { config } from "@/lib/config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Growth Plan | Boost",
  description: "We ran Boost on itself. Here's the AI-generated action plan for our own product - real competitive research, actionable tactics, and a 30-day roadmap.",
  openGraph: {
    title: "We Ran Boost on Itself - Our Growth Plan",
    description: "See what happens when an AI growth strategist analyzes its own product. Real action plan, real research, real results.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Ran Boost on Itself - Our Growth Plan",
    description: "See what happens when an AI growth strategist analyzes its own product.",
  },
};

async function getStrategy(): Promise<string> {
  const filePath = path.join(process.cwd(), "docs", "actionboost-strategy-export.md");
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return "# Growth Plan Not Found\n\nThe growth plan document could not be loaded.";
  }
}

export default async function GrowthPlanPage() {
  const markdown = await getStrategy();
  const strategy = parseStrategy(markdown);

  const hero = (
    <>
      {/* Hero / header area */}
      <div className="pt-12 pb-8 lg:text-center">
        <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
          We ran Boost on itself
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Our Growth Plan
        </h1>
        <p className="text-lg text-foreground/70 max-w-xl lg:mx-auto leading-relaxed">
          What happens when an AI growth strategist analyzes its own product?
          Here&apos;s the <span className="text-foreground font-semibold">real action plan</span> we&apos;re following to grow Boost.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm lg:justify-center">
          <span className="text-foreground/50">January 2026 · 15 min read</span>
          <span className="text-foreground/20 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="text-foreground/50">Share:</span>
            <SocialShareButtons
              url="https://aboo.st/blog/our-growth-plan"
              text="Boost ran their AI on their own product. Here's the result:"
              source="blog"
            />
          </div>
        </div>
      </div>

      {/* CTA banner - Soft Brutalist */}
      <div className="rounded-lg mb-8 border-2 border-foreground/20 bg-background p-6 shadow-[4px_4px_0_rgba(44,62,80,0.1)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Want a marketing plan like this for your business?</p>
            <p className="text-sm text-foreground/60">Get AI-powered growth recommendations with live competitive research.</p>
          </div>
          <Link href="/start">
            <button className="rounded-md whitespace-nowrap px-6 py-3 bg-cta text-white font-semibold border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:border-b-0 transition-all duration-100">
              Get your plan - {config.singlePrice}
            </button>
          </Link>
        </div>
      </div>
    </>
  );

  const bottomCta = (
    <div className="rounded-lg mt-16 border-2 border-foreground/20 bg-background p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
      <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
        Your turn
      </p>
      <h2 className="text-2xl font-bold text-foreground">
        Ready to get your own marketing plan?
      </h2>
      <p className="text-foreground/70 max-w-md mx-auto">
        Boost uses live competitive research and AI to create
        actionable strategies specifically for your business.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/start">
          <button className="rounded-md px-8 py-4 bg-cta text-white font-semibold text-lg border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0 transition-all duration-100">
            Get started - {config.singlePrice}
          </button>
        </Link>
        <Link href="/">
          <button className="rounded-md px-8 py-4 bg-transparent text-foreground font-semibold text-lg border-2 border-foreground/30 hover:bg-foreground/5 hover:border-foreground/50 transition-all duration-100">
            Learn more
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <ResultsLayout
        toc={{ strategy }}
        slots={{ hero, bottomCta }}
      >
        <ResultsContent strategy={strategy} />
      </ResultsLayout>

      <Footer />
    </div>
  );
}
