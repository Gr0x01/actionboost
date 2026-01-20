import { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { Header, Footer, ResultsLayout } from "@/components/layout";
import { MarkdownContent } from "@/components/results/MarkdownContent";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import { BLOG_SECTIONS } from "@/lib/constants/toc-sections";
import { config } from "@/lib/config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Growth Plan | Actionboo.st",
  description: "We ran Actionboo.st on itself. Here's the AI-generated action plan for our own product - real competitive research, actionable tactics, and a 30-day roadmap.",
  openGraph: {
    title: "We Ran Actionboo.st on Itself - Our Growth Plan",
    description: "See what happens when an AI growth strategist analyzes its own product. Real action plan, real research, real results.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Ran Actionboo.st on Itself - Our Growth Plan",
    description: "See what happens when an AI growth strategist analyzes its own product.",
  },
};

async function getGrowthPlan(): Promise<string> {
  const filePath = path.join(process.cwd(), "docs", "growth-plan-actionboost.md");
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch {
    return "# Growth Plan Not Found\n\nThe growth plan document could not be loaded.";
  }
}

export default async function GrowthPlanPage() {
  const markdown = await getGrowthPlan();

  // Remove the title, subtitle, date, and first hr since we render them in the hero
  const contentWithoutTitle = markdown
    .replace(/^# Actionboo\.st Growth Plan\n+/, "")
    .replace(/^\*\*AI Growth Strategist.*?\*\*\n+/m, "")
    .replace(/^\*Generated:.*?\*\n+/m, "")
    .replace(/^\*Updated:.*?\*\n+/m, "")
    .replace(/^---\n+/, "")
    .replace(/^\s+/, ""); // Remove leading whitespace

  const hero = (
    <>
      {/* Hero / header area */}
      <div className="pt-12 pb-8 lg:text-center">
        <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
          We ran Actionboo.st on itself
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Our Growth Plan
        </h1>
        <p className="text-lg text-foreground/70 max-w-xl lg:mx-auto leading-relaxed">
          What happens when an AI growth strategist analyzes its own product?
          Here&apos;s the <span className="text-foreground font-semibold">real action plan</span> we&apos;re following to grow Actionboo.st.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-6 text-sm lg:justify-center">
          <span className="text-foreground/50">January 2026 · 15 min read</span>
          <span className="text-foreground/20 hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="text-foreground/50">Share:</span>
            <SocialShareButtons
              url="https://actionboo.st/blog/our-growth-plan"
              text="Actionboo.st ran their AI on their own product. Here's the result:"
              source="blog"
            />
          </div>
        </div>
      </div>

      {/* CTA banner - brutalist box */}
      <div className="mb-8 border-[3px] border-foreground bg-background p-6 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">Want an action plan like this for your product?</p>
            <p className="text-sm text-foreground/60">Get AI-powered growth recommendations with live competitive research.</p>
          </div>
          <Link href="/start">
            <button className="whitespace-nowrap px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
              Get Your Action Plan - {config.singlePrice}
            </button>
          </Link>
        </div>
      </div>
    </>
  );

  const bottomCta = (
    <div className="mt-16 border-[3px] border-foreground bg-background p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] text-center space-y-4">
      <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase">
        Your turn
      </p>
      <h2 className="text-2xl font-black text-foreground">
        Ready to get your own action plan?
      </h2>
      <p className="text-foreground/70 max-w-md mx-auto">
        Actionboo.st uses live competitive research and Claude Opus to create
        actionable strategies specifically for your product.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/start">
          <button className="px-8 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
            Get Started - {config.singlePrice}
          </button>
        </Link>
        <Link href="/">
          <button className="px-8 py-4 bg-transparent text-foreground font-bold text-lg border-2 border-foreground shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
            Learn More
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <ResultsLayout
        toc={{ sections: BLOG_SECTIONS, hideThreshold: 400 }}
        slots={{ hero, bottomCta }}
      >
        <article className="font-serif text-[18px] leading-[1.75] text-foreground/90">
          <MarkdownContent content={contentWithoutTitle} extended />
        </article>
      </ResultsLayout>

      <Footer />
    </div>
  );
}
