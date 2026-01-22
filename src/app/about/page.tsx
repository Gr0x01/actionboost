import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, TrendingUp, Users, Target, Zap } from "lucide-react";

// X (formerly Twitter) logo
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// LinkedIn logo
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "About | Aboost",
  description: "Solo dev. Real experiment. Watch Aboost grow itself using its own AI-generated growth strategy.",
  openGraph: {
    title: "About Aboost - Building in Public",
    description: "Solo dev. Real experiment. Watch Aboost grow itself using its own AI-generated growth strategy.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Aboost - Building in Public",
    description: "Solo dev. Real experiment. Watch Aboost grow itself using its own AI-generated growth strategy.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-6">

          {/* Hero Section */}
          <section className="mb-12">
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
              Building in public
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-6">
              The Experiment
            </h1>
            <p className="text-xl text-foreground/70 leading-relaxed max-w-2xl">
              Can an AI growth strategist grow itself? I&apos;m finding out—publicly.
              Every recommendation Aboost generates for itself, I follow.
            </p>
          </section>

          {/* Founder Card - Brutalist */}
          <section className="mb-12">
            <div className="rounded-2xl border-[3px] border-foreground bg-background p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
              <div className="flex flex-col sm:flex-row gap-6">
                <img
                  src="/rbaten.png"
                  alt="@rbaten"
                  className="w-20 h-20 rounded-full border-2 border-foreground shrink-0"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Hey, I&apos;m Rashaad
                  </h2>
                  <p className="text-foreground/70 leading-relaxed mb-4">
                    Product designer for 10+ years, now a designer digging into code.
                    Building <a href="https://inkdex.io?ref=aboost" target="_blank" rel="noopener noreferrer" className="text-cta hover:underline">Inkdex.io</a> (visual tattoo search) and
                    experimenting with Aboost.
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href="https://x.com/rbaten"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <XIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">@rbaten</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/rbaten/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <LinkedInIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Story */}
          <section className="mb-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                The Problem I Kept Hitting
              </h2>
              <p className="text-foreground/70 leading-relaxed">
                While building Inkdex, I tried using LLMs to get growth advice. ChatGPT, Claude,
                you name it. Every time, the same generic playbook. &quot;Build in public.&quot;
                &quot;Try content marketing.&quot; &quot;Engage on Twitter.&quot; Nothing specific to my
                project or competitors.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                The Breakthrough
              </h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                One day I developed a prompt and hooked it up to the research APIs I was
                already using—competitor traffic data, SEO metrics, real market intel.
                The output was completely different. Specific tactics. Actual competitor
                weaknesses to exploit. Avenues I hadn&apos;t thought of.
              </p>
              <p className="text-foreground/70 leading-relaxed">
                That&apos;s when it clicked, <strong className="text-foreground">building is the easy part.</strong> Getting
                users, getting customers, getting money—that&apos;s the hard part. And most
                founders are flying blind.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                The Experiment
              </h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                I built this as a tool for other founders, startups, and entrpreneurs. But then I realized—how can I
                prove this works unless I follow its own advice? So that&apos;s what I&apos;m doing.
                Aboost generates a growth strategy for itself, and I execute.
              </p>
              <p className="text-foreground/70 leading-relaxed">
                I&apos;ll give regular updates and findings along the way. Real results,
                good or bad. Hopefully good.
              </p>
            </div>
          </section>

          {/* Progress Metrics - Brutalist Cards */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Experiment Progress
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-cta" />
                  <span className="font-mono text-xs tracking-wide text-foreground/60 uppercase">
                    Day
                  </span>
                </div>
                <p className="text-3xl font-black text-foreground">2</p>
              </div>

              <div className="rounded-2xl border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-cta" />
                  <span className="font-mono text-xs tracking-wide text-foreground/60 uppercase">
                    Revenue
                  </span>
                </div>
                <p className="text-3xl font-black text-foreground">$0</p>
              </div>

              <div className="rounded-2xl border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-cta" />
                  <span className="font-mono text-xs tracking-wide text-foreground/60 uppercase">
                    Status
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">Just launched</p>
              </div>

              <div className="rounded-2xl border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-cta" />
                  <span className="font-mono text-xs tracking-wide text-foreground/60 uppercase">
                    Current Focus
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">Product polish</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-foreground/50 text-center">
              Updated Jan 22, 2026 · Real numbers, updated as we go
            </p>
          </section>

          {/* CTA - See the Strategy */}
          <section className="mb-12">
            <Link href="/blog/our-growth-plan" className="group block">
              <div className="rounded-2xl border-[3px] border-foreground bg-background p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:shadow-[8px_8px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs tracking-[0.15em] text-cta uppercase font-semibold">
                      Proof of concept
                    </span>
                    <h3 className="text-xl font-bold text-foreground mt-2">
                      Read the actual strategy Aboost generated for itself
                    </h3>
                    <p className="text-foreground/60 mt-1">
                      Real competitive research. Real recommendations. The same output you&apos;d get.
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-foreground/40 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-cta" />
                </div>
              </div>
            </Link>
          </section>

          {/* Bottom CTA */}
          <section>
            <div className="rounded-2xl border-[3px] border-foreground bg-background p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)] text-center space-y-4">
              <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase">
                Your turn
              </p>
              <h2 className="text-2xl font-black text-foreground">
                Want a growth strategy built for you?
              </h2>
              <p className="text-foreground/70 max-w-md mx-auto">
                Same AI. Same competitive research. Tailored to your product,
                your market, your constraints.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/start">
                  <button className="rounded-xl px-8 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
                    Get My Action Plan — $9.99
                  </button>
                </Link>
                <Link href="/">
                  <button className="rounded-xl px-8 py-4 bg-transparent text-foreground font-bold text-lg border-2 border-foreground shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100">
                    See How It Works
                  </button>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
