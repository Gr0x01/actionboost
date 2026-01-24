/**
 * ResearchProof - Big Quote + Soft Metric Cards
 *
 * One large finding as blockquote, rest in soft cards
 */

const DISMISSED_ADVICE = [
  "Post consistently",
  "Build an email list",
  "Focus on your ICP",
  "Create valuable content",
  "Optimize for SEO",
];

const FINDINGS = [
  {
    label: "Keyword gap",
    finding: '"Free trial" keywords ignored',
    detail: "23 opportunities",
  },
  {
    label: "Market signal",
    finding: "Reddit questions this month",
    detail: "47 people asking",
  },
  {
    label: "Competitor intel",
    finding: "Their pricing page converts better",
    detail: "Here's why",
  },
  {
    label: "Traffic source",
    finding: "Top channel you're missing",
    detail: "Reddit > Instagram",
  },
];

export function ResearchProof() {
  return (
    <section className="relative py-20 bg-surface">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            The difference
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            Real research. <span className="font-black">Not ChatGPT guessing.</span>
          </h2>
        </div>

        {/* Dismissed advice - compact pills, pushed aside */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {DISMISSED_ADVICE.map((text, i) => (
            <span
              key={i}
              className="text-sm text-foreground/40 line-through decoration-foreground/20 px-3 py-1.5 bg-foreground/[0.04] rounded-full"
            >
              {text}
            </span>
          ))}
          <span className="text-xs text-foreground/30 self-center ml-1">
            ...and other AI guesses
          </span>
        </div>

        {/* Big quote - the hero finding */}
        <blockquote className="text-center mb-10">
          <p className="text-3xl font-light text-foreground leading-snug">
            &ldquo;Your top competitor gets{" "}
            <span className="font-bold text-cta">40% of traffic from&nbsp;Reddit</span>
            &rdquo;
          </p>
          <cite className="text-sm text-foreground/50 mt-4 block not-italic">
            — Actual finding from a Boost report
          </cite>
        </blockquote>

        {/* What else we find label */}
        <p className="text-xs font-mono uppercase tracking-[0.15em] text-foreground/50 mb-4">
          What else we find
        </p>

        {/* Findings - 4 individual soft cards in 2x2 grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {FINDINGS.map((item, i) => (
            <div
              key={i}
              className="bg-white border-2 border-foreground/15 rounded-xl p-5"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              <p className="text-xs font-mono uppercase tracking-[0.15em] text-foreground/40 mb-2">
                {item.label}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {item.finding}
              </p>
              <p className="text-foreground/50 font-mono text-sm mt-1">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Closing line */}
        <p className="text-center text-foreground/50 text-sm mt-10">
          Specific. Actionable. Based on your market.
        </p>
      </div>
    </section>
  );
}
