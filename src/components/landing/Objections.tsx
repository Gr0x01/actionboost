const COMPACT_OBJECTIONS = [
  {
    question: "Is this just ChatGPT wrapped in a pretty UI?",
    answer:
      "No. Your plan is built on live competitor data, traffic estimates, and market trends. ChatGPT can't see any of that.",
  },
  {
    question: "What if my business is too weird or niche?",
    answer:
      "Boost has worked for SaaS, e-commerce, consultants, local services, and niche products you've never heard of. If your competitors have a website, you're covered.",
  },
  {
    question: "$29 seems cheap. Is it actually useful?",
    answer:
      "You get a real strategy based on live research — the same data APIs bigger agencies use, without their markup.",
  },
  {
    question: "What if I get the plan and don't follow through?",
    answer:
      "We can't make you execute. But the plan is specific enough that the first step is obvious. Not 'build a content strategy,' but 'post this, here, today.' Momentum comes from clarity, not motivation.",
  },
];

export function Objections() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            Skeptical? Good.
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            What you&apos;re probably <span className="font-black">thinking.</span>
          </h2>
        </div>

        {/* Hero objection - the refund promise */}
        <blockquote className="text-center mb-12">
          <p className="text-2xl sm:text-3xl font-light text-foreground leading-snug mb-4">
            &ldquo;What if it <span className="font-bold text-cta">sucks?</span>&rdquo;
          </p>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto">
            Full refund. No questions, no hassle. We&apos;d rather give your money back than have you feel stuck.
          </p>
        </blockquote>

        {/* Compact objection list */}
        <div className="space-y-0">
          {COMPACT_OBJECTIONS.map((obj, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-2 sm:gap-8 py-5 border-b border-foreground/10 last:border-b-0"
            >
              <p className="text-foreground/60 text-base sm:w-2/5 shrink-0">
                {obj.question}
              </p>
              <p className="text-foreground text-sm sm:text-base leading-relaxed">
                {obj.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
