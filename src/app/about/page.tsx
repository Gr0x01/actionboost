import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Boost",
  description:
    "Real competitor research. A 30-day Boost you can actually execute. Built for founders who know marketing matters but need to know what to do next.",
  openGraph: {
    title: "About Boost",
    description:
      "Real competitor research. A 30-day Boost you can actually execute. Built for founders who know marketing matters but need to know what to do next.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Boost",
    description:
      "Real competitor research. A 30-day Boost you can actually execute. Built for founders who know marketing matters but need to know what to do next.",
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
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-6">
              Real competitor research. A Boost you can&nbsp;execute.
            </h1>
            <p className="text-xl text-foreground/70 leading-relaxed max-w-2xl">
              You know marketing matters. You just need to know what to do next.
              We research your competitors and tell you exactly what&apos;s working.
            </p>
          </section>

          {/* The Problem We Solve */}
          <section className="mb-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Generic advice doesn&apos;t work
            </h2>
            <div className="space-y-4 text-foreground/70 leading-relaxed">
              <p>
                ChatGPT tells everyone the same thing. &quot;Post on social
                media.&quot; &quot;Build an email list.&quot; But what
                should <em>you</em> do, specifically, this week?
              </p>
              <p>
                Most marketing advice is either generic (one-size-fits-all) or
                expensive (agencies at $2K+/month).
              </p>
              <p>
                <strong className="text-foreground">
                  Boost fills the gap.
                </strong>{" "}
                We research your actual competitors and market, then give you a
                specific 30-day Boost. What to stop. What to start. What to do this week.
              </p>
            </div>
          </section>

          {/* How We're Different */}
          <section className="mb-12">
            <div
              className="bg-white border-2 border-foreground/20 rounded-md p-6 sm:p-8"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                What makes Boost different
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-cta shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Real competitor research
                    </p>
                    <p className="text-foreground/60 text-sm">
                      We analyze your actual competitors — their traffic sources,
                      positioning, what&apos;s working for them.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-cta shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Specific, not generic
                    </p>
                    <p className="text-foreground/60 text-sm">
                      You get tactics for your business, your stage, your market.
                      Not one-size-fits-all advice.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-cta shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Ready to execute
                    </p>
                    <p className="text-foreground/60 text-sm">
                      30 days of prioritized actions. What to stop, what to start,
                      what to do this week.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Who We Help */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Built for founders who ship
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-6">
              You know how to build. You know marketing matters. You just need
              to know what to do next.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  SaaS founders
                </p>
                <p className="text-sm text-foreground/60">
                  Product-market fit questions, acquisition channels, positioning
                </p>
              </div>
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  E-commerce brands
                </p>
                <p className="text-sm text-foreground/60">
                  Ad spend allocation, differentiation, scaling what works
                </p>
              </div>
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  Solopreneurs
                </p>
                <p className="text-sm text-foreground/60">
                  Limited time, need to focus on high-impact channels
                </p>
              </div>
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  Consultants and agencies
                </p>
                <p className="text-sm text-foreground/60">
                  Lead gen, authority building, referral systems
                </p>
              </div>
            </div>
          </section>

          {/* Founder Card */}
          <section className="mb-12">
            <div
              className="bg-white border-2 border-foreground/20 rounded-md p-6 sm:p-8"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/rbaten.png"
                  alt="Rashaad"
                  className="w-20 h-20 rounded-full border-2 border-foreground/20 shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50 mb-1">
                    Founder
                  </p>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Hey, I&apos;m Rashaad
                  </h2>
                  <p className="text-foreground/70 leading-relaxed">
                    10+ years in product design, helping companies figure out
                    what to build. Now I&apos;m applying that same research-first
                    approach to marketing strategy. Boost does the competitive
                    research and gives you a specific Boost. If it doesn&apos;t
                    help, full refund.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* See an Example */}
          <section className="mb-12">
            <Link href="/in-action" className="group block">
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-6 sm:p-8 hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-100"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cta mb-2">
                      See real examples
                    </p>
                    <h3 className="text-xl font-bold text-foreground">
                      What does a Boost look like?
                    </h3>
                    <p className="text-foreground/60 mt-1">
                      Browse real Boosts we&apos;ve created for different
                      businesses.
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-foreground/40 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-cta" />
                </div>
              </div>
            </Link>
          </section>

          {/* Featured On */}
          <section className="mb-12">
            <div className="flex flex-wrap justify-center items-center gap-4 opacity-50">
              <a
                href="https://peerpush.net/p/actionboost"
                target="_blank"
                rel="noopener"
                style={{ width: 230 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://peerpush.net/p/actionboost/badge.png"
                  alt="Boost badge"
                  style={{ width: 230 }}
                />
              </a>
              <a
                href="https://auraplusplus.com/projects/boost-market-research-strategy"
                target="_blank"
                rel="noopener"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://auraplusplus.com/images/badges/featured-on-dark.svg"
                  alt="Featured on Aura++"
                  width={120}
                  height={28}
                />
              </a>
            </div>
          </section>

          {/* Bottom CTA */}
          <section>
            <div
              className="bg-white border-2 border-foreground/20 rounded-md p-8 text-center space-y-4"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              <h2 className="text-2xl font-black text-foreground">
                Stop guessing. Get a Boost.
              </h2>
              <p className="text-foreground/70 max-w-md mx-auto">
                Real competitor research. A 30-day Boost you can execute.
                Money back if it doesn&apos;t help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/start">
                  <button
                    className="rounded-md px-8 py-4 bg-cta text-white font-bold text-lg
                               border-b-[3px] border-b-[#B85D10]
                               hover:-translate-y-0.5 hover:shadow-lg
                               active:translate-y-0.5 active:border-b-0
                               transition-all duration-100"
                  >
                    Get my 30-day Boost — $29
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
