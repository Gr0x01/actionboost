"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

interface Fragment {
  label: string;
  businessType: string;
  text: ReactNode;
}

const B = ({ children }: { children: ReactNode }) => (
  <strong className="text-surface font-semibold">{children}</strong>
);

const FRAGMENTS: Fragment[] = [
  {
    label: "Competitor intel",
    businessType: "walking tour operator, Florence",
    text: (
      <>
        Your core problem is distribution, not product quality. Locals
        recommending your tours proves the experience delivers. But
        word-of-mouth cannot compete with the digital discovery layer where 90%+
        of tourists book. Viator gets <B>8.7M monthly visits</B>. GetYourGuide
        gets <B>7M</B>. That{"\u2019"}s where your customers are looking.
      </>
    ),
  },
  {
    label: "Activation diagnosis",
    businessType: "session replay SaaS",
    text: (
      <>
        Your <B>8% trial-to-paid conversion</B> is bleeding revenue. With 40
        paying customers at $29/month, you{"\u2019"}ve likely had{" "}
        <B>500+ trial signups</B>. The pattern {"\u2014"} sign up, watch a few
        replays, never come back {"\u2014"} reveals the core problem: users aren
        {"\u2019"}t reaching the moment your tool proves its value.
      </>
    ),
  },
  {
    label: "Channel strategy",
    businessType: "expense tracker app",
    text: (
      <>
        Your path to acquisition isn{"\u2019"}t competing head-to-head with YNAB
        {"\u2019"}s <B>168K monthly organic visitors</B>. It{"\u2019"}s owning
        the long-tail: {"\u2018"}offline expense tracker,{"\u2019"} {"\u2018"}
        subscription tracker no bank sync{"\u2019"} {"\u2014"} and capturing the{" "}
        <B>post-Mint refugees</B> through targeted content.
      </>
    ),
  },
  {
    label: "Market positioning",
    businessType: "tall women\u2019s fashion brand",
    text: (
      <>
        You{"\u2019"}re not invisible {"\u2014"} you{"\u2019"}re mispositioned.
        There are two audiences searching for tall clothing. The first wants
        affordable basics from mass retailers. The second is searching Reddit
        threads titled {"\u2018"}
        <B>Ethical Brands for Tall Women</B>
        {"\u2019"} and finding almost nothing. That second audience is yours, and
        nobody is serving them.
      </>
    ),
  },
  {
    label: "Competitive landscape",
    businessType: "Spanish-market resume builder",
    text: (
      <>
        While global competitors have Spanish versions, there are only a few
        dedicated Spanish-market players {"\u2014"} AyudaCV.es at{" "}
        <B>374 monthly visits</B>, CandyCV with <B>1,782 visits</B>. Reddit
        threads in Spanish communities show users asking {"\u2018"}how do I
        optimize for ATS filters?{"\u2019"} The demand signal is clear.
      </>
    ),
  },
  {
    label: "Acquisition strategy",
    businessType: "YouTube transcript search tool",
    text: (
      <>
        Your current organic traffic {"\u2014"} <B>2,665 monthly visits</B> from
        11 keywords {"\u2014"} severely underperforms your competitive potential.
        VidIQ pulls <B>312K monthly visits</B>. TubeBuddy gets <B>118K</B>. The
        keyword categories you should own: {"\u2018"}YouTube transcript search,
        {"\u2019"} {"\u2018"}YouTube monitoring,{"\u2019"} and {"\u2018"}
        competitor mention tracking.{"\u2019"}
      </>
    ),
  },
];

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function PlanFragments() {
  const [fragments, setFragments] = useState<Fragment[]>(FRAGMENTS);

  useEffect(() => {
    setFragments(shuffle(FRAGMENTS));
  }, []);

  return (
    <section className="relative py-16 sm:py-20 bg-foreground">
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading */}
        <div className="mb-10">
          <p className="font-mono text-xs tracking-[0.15em] text-surface/50 uppercase mb-4">
            From real plans
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-surface tracking-tight">
            Excerpts from{" "}
            <span className="font-black">actual plans.</span>
          </h2>
          <p className="text-base text-surface/50 mt-3">
            Every Boost plan is built on live market data. Here&apos;s what that
            looks like.
          </p>
        </div>

        {/* Fragments — two-column on desktop, show 3 on mobile / all 6 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          {fragments.map((fragment, i) => (
            <div
              key={fragment.label}
              className={`py-5 ${
                /* Border between rows: on mobile, all except last visible (index 2).
                   On desktop, items 0-3 get borders (first two rows), last row (4-5) don't. */
                i < 2 ? "border-b border-surface/10" : ""
              } ${
                i >= 2 && i < 4
                  ? "md:border-b md:border-surface/10"
                  : ""
              } ${
                /* Hide fragments 4-6 on mobile */
                i >= 3 ? "hidden md:block" : ""
              }`}
            >
              {/* Category label */}
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-cta">
                {fragment.label}
              </span>

              {/* Fragment text */}
              <p className="text-[15px] leading-relaxed text-surface/80 mt-2">
                {fragment.text}
              </p>

              {/* Attribution */}
              <p className="text-[13px] italic text-surface/35 mt-3">
                From a plan built for a {fragment.businessType}
              </p>
            </div>
          ))}
        </div>

        {/* Inline CTA */}
        <div className="mt-10 pt-8 text-center">
          <p className="text-base text-surface/60">
            Want to see what Boost finds for your business?{" "}
            <Link
              href="/start?free=true"
              className="font-semibold text-cta underline decoration-cta/40 decoration-2 underline-offset-[3px] transition-all hover:decoration-cta"
            >
              Get a free preview
            </Link>
            . No payment, no&nbsp;signup.
          </p>
        </div>
      </div>
    </section>
  );
}
