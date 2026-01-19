import { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarkdownContent } from "@/components/results/MarkdownContent";
import { Button } from "@/components/ui/Button";
import { SocialShareButtons } from "@/components/ui/SocialShareButtons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Growth Plan | Actionboo.st",
  description: "We ran Actionboo.st on itself. Here's the AI-generated growth strategy for our own product - real competitive research, actionable tactics, and a 30-day roadmap.",
  openGraph: {
    title: "We Ran Actionboo.st on Itself - Our Growth Plan",
    description: "See what happens when an AI growth strategist analyzes its own product. Real strategy, real research, real results.",
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

  // Remove the title line since we'll render it separately
  const contentWithoutTitle = markdown.replace(/^# Actionboo\.st Growth Plan\n+/, "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Hero section */}
          <div className="mb-12 text-center">
            <p className="text-sm font-medium text-primary mb-3">
              We ran Actionboo.st on itself
            </p>
            <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
              Our Growth Plan
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto">
              What happens when an AI growth strategist analyzes its own product?
              Here&apos;s the real strategy we&apos;re following to grow Actionboo.st.
            </p>
            <p className="text-sm text-muted mt-4">
              January 2026 · 15 min read
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="text-sm text-muted">Share:</span>
              <SocialShareButtons
                url="https://actionboo.st/blog/our-growth-plan"
                text="Actionboo.st ran their AI on their own product. Here's the result:"
                source="blog"
              />
            </div>
          </div>

          {/* CTA banner */}
          <div className="mb-12 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Want a strategy like this for your product?</p>
                <p className="text-sm text-muted">Get AI-powered growth recommendations with live competitive research.</p>
              </div>
              <Link href="/start">
                <Button>Get Your Strategy - $7.99</Button>
              </Link>
            </div>
          </div>

          {/* Main content */}
          <article className="prose-custom">
            <MarkdownContent content={contentWithoutTitle} extended />
          </article>

          {/* Bottom CTA */}
          <div className="mt-16 p-8 rounded-xl bg-surface border border-border text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Ready to get your own growth strategy?
            </h2>
            <p className="text-muted max-w-md mx-auto">
              Actionboo.st uses live competitive research and Claude Opus to create
              actionable strategies specifically for your product.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/start">
                <Button size="lg">Get Started - $7.99</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="lg">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
