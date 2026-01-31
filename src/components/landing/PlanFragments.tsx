"use client";

import { type ReactNode } from "react";
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
  {
    label: "Market opportunity",
    businessType: "scam detection tool",
    text: (
      <>
        You{"\u2019"}re competing against giants {"\u2014"} Norton Genie,
        Bitdefender Scamio, Surfshark {"\u2014"} but with a differentiator they
        can{"\u2019"}t easily replicate: <B>privacy-first local AI</B> via
        Ollama. The research reveals a growing segment of privacy-conscious users
        and an enormous underserved demographic {"\u2014"} adult children seeking
        scam protection for <B>aging parents</B>.
      </>
    ),
  },
  {
    label: "Executive summary",
    businessType: "webpage commenting platform",
    text: (
      <>
        You{"\u2019"}re entering a market with one dominant player {"\u2014"}{" "}
        Disqus, at <B>~15K monthly organic visits</B> {"\u2014"} that has severe
        trust issues around privacy, tracking, and forced advertising. Hyvor Talk
        (<B>~2.4K monthly visits</B>) positions as the privacy-first
        alternative. Your concept of {"\u2018"}turning any webpage into a forum
        {"\u2019"} sits at an interesting intersection.
      </>
    ),
  },
  {
    label: "Competitive gap",
    businessType: "founder positioning studio",
    text: (
      <>
        Fletch PMM charges <B>$10K{"\u2013"}$15K sprints</B> for generic B2B
        SaaS. April Dunford runs <B>$50K{"\u2013"}$100K workshops</B> for
        enterprise. Neither specializes in complex, regulated industries. Your
        wedge {"\u2014"} {"\u2018"}clarity before design, direction before pixels
        {"\u2019"} {"\u2014"} targets founders who can{"\u2019"}t articulate what
        they do, and investors cite that as a <B>deal-breaker</B>.
      </>
    ),
  },
  {
    label: "Market analysis",
    businessType: "creator pipeline tool",
    text: (
      <>
        The market is crowded but fragmented. Creators cobble together Notion,
        Google Sheets, Trello, and various note apps. Research shows their
        biggest frustrations are {"\u2018"}
        <B>too many tools</B>,{"\u2019"} disorganization across apps, and the
        tedium of tracking ideas. Notion has brand recognition but an{" "}
        <B>overwhelming learning curve</B>. Be the simple alternative that just
        works.
      </>
    ),
  },
];

/* Split fragments across two rows — 5 per row */
const ROW_1 = [FRAGMENTS[0], FRAGMENTS[2], FRAGMENTS[4], FRAGMENTS[6], FRAGMENTS[8]];
const ROW_2 = [FRAGMENTS[1], FRAGMENTS[3], FRAGMENTS[5], FRAGMENTS[7], FRAGMENTS[9]];

function FragmentCard({ fragment }: { fragment: Fragment }) {
  return (
    <div
      className="w-[340px] md:w-[440px] shrink-0 p-5 md:p-6
                 border border-surface/[0.08] bg-surface/[0.03] rounded-sm"
    >
      <p className="font-mono text-cta text-[11px] font-bold uppercase tracking-[0.08em] mb-1">
        {fragment.label}
      </p>
      <p className="font-mono text-surface/40 text-xs mb-3">
        {fragment.businessType}
      </p>
      <p className="text-surface/80 text-sm md:text-[15px] leading-relaxed font-light">
        {fragment.text}
      </p>
    </div>
  );
}

function MarqueeRow({
  fragments,
  direction,
}: {
  fragments: Fragment[];
  direction: "left" | "right";
}) {
  // Duplicate for seamless infinite loop
  const items = [...fragments, ...fragments];

  return (
    <div
      className="marquee-container overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        className={`flex gap-4 w-max ${
          direction === "left"
            ? "animate-marquee-left"
            : "animate-marquee-right"
        }`}
        style={{ animationDuration: "55s" }}
      >
        {items.map((f, i) => (
          <FragmentCard key={`${f.label}-${i}`} fragment={f} />
        ))}
      </div>
    </div>
  );
}

export function PlanFragments() {
  return (
    <section className="relative bg-foreground py-16 sm:py-20 overflow-hidden">
      {/* Heading */}
      <div className="mx-auto max-w-2xl px-6 text-center mb-10 md:mb-14">
        <p className="font-mono text-xs tracking-[0.15em] text-surface/50 uppercase mb-4">
          From real plans
        </p>
        <h2 className="text-2xl sm:text-3xl font-light text-surface tracking-tight">
          What{" "}
          <span className="font-black">real research</span>{" "}
          looks like.
        </h2>
        <p className="text-base text-surface/50 mt-3">
          Every Boost plan is built on live market data. These are real excerpts.
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <MarqueeRow fragments={ROW_1} direction="left" />

      {/* Gap */}
      <div className="h-3 md:h-4" />

      {/* Row 2 — scrolls right */}
      <MarqueeRow fragments={ROW_2} direction="right" />

      {/* Inline CTA */}
      <div className="mt-10 md:mt-14 text-center px-6">
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
    </section>
  );
}
