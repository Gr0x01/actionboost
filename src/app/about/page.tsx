import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Boost",
  description:
    "We help small businesses figure out marketing. Real research on your competitors, turned into a plan you can actually follow.",
  openGraph: {
    title: "About Boost",
    description:
      "We help small businesses figure out marketing. Real research on your competitors, turned into a plan you can actually follow.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Boost",
    description:
      "We help small businesses figure out marketing. Real research on your competitors, turned into a plan you can actually follow.",
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
              We help small businesses figure out&nbsp;marketing
            </h1>
            <p className="text-xl text-foreground/70 leading-relaxed max-w-2xl">
              Real research on your competitors. A 30-day plan you can actually
              follow. No jargon, no fluff.
            </p>
          </section>

          {/* The Problem We Solve */}
          <section className="mb-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Marketing advice is broken
            </h2>
            <div className="space-y-4 text-foreground/70 leading-relaxed">
              <p>
                You&apos;ve probably tried asking ChatGPT for marketing help.
                You got the same advice everyone else gets. &quot;Post on social
                media.&quot; &quot;Build an email list.&quot; Great. But what
                should <em>you</em> do, specifically, this week?
              </p>
              <p>
                Most marketing advice is either generic (one-size-fits-all blog
                posts) or expensive (agencies charging thousands per month).
              </p>
              <p>
                <strong className="text-foreground">
                  We built Boost to fill the gap.
                </strong>{" "}
                Real research on your competitors, your market, turned into a
                30-day plan you can actually follow.
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
                      We research your actual competitors
                    </p>
                    <p className="text-foreground/60 text-sm">
                      Not generic advice. We look at what&apos;s working for
                      businesses like yours.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-cta shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Plain English, no marketing speak
                    </p>
                    <p className="text-foreground/60 text-sm">
                      We explain what to do and why. No acronyms, no jargon.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-cta shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">
                      A plan you can start today
                    </p>
                    <p className="text-foreground/60 text-sm">
                      30 days of specific actions, prioritized by what will move
                      the needle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Who We Help */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Built for small businesses
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-6">
              We work with people who are good at what they do, but don&apos;t
              have time to become marketing experts.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  Salons and spas
                </p>
                <p className="text-sm text-foreground/60">
                  Figuring out Instagram vs. Google, getting more bookings
                </p>
              </div>
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  E-commerce shops
                </p>
                <p className="text-sm text-foreground/60">
                  Deciding where to spend ad budget, standing out on Etsy
                </p>
              </div>
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  Consultants and coaches
                </p>
                <p className="text-sm text-foreground/60">
                  LinkedIn vs. email, getting referrals, building authority
                </p>
              </div>
              <div
                className="bg-white border-2 border-foreground/20 rounded-md p-5"
                style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
              >
                <p className="font-semibold text-foreground mb-1">
                  Local services
                </p>
                <p className="text-sm text-foreground/60">
                  Getting found online, beating competitors in your area
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
                    I spent 10+ years in product design, helping companies
                    figure out what to build. Now I&apos;m using that same
                    research-first approach to help small businesses figure out
                    marketing. Behind Boost is a small team that actually reads
                    what you submit. If your plan doesn&apos;t help, we&apos;ll
                    refund you.
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
                      What does a Boost plan look like?
                    </h3>
                    <p className="text-foreground/60 mt-1">
                      Browse real plans we&apos;ve created for different
                      businesses.
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-foreground/40 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-cta" />
                </div>
              </div>
            </Link>
          </section>

          {/* Bottom CTA */}
          <section>
            <div
              className="bg-white border-2 border-foreground/20 rounded-md p-8 text-center space-y-4"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
            >
              <h2 className="text-2xl font-black text-foreground">
                Ready to get unstuck?
              </h2>
              <p className="text-foreground/70 max-w-md mx-auto">
                Tell us about your business. Get a 30-day marketing plan built
                on real research. Money back if it doesn&apos;t help.
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
                    Get my 30-day plan — $29
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
