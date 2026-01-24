const OBJECTIONS = [
  {
    question: "Is this just ChatGPT wrapped in a pretty UI?",
    answer:
      "No. We use real research APIs to pull live competitor data, traffic estimates, keyword rankings, and market trends. ChatGPT can't see any of that — it's working from training data. We're working from what's happening right now.",
  },
  {
    question: "$29 seems cheap. Is the output actually useful?",
    answer:
      "We spent months building this. The research alone would cost you $500+ if you bought API access yourself. We make money because we've automated the research, not because we cut corners. And if it's not useful? Full refund.",
  },
  {
    question: "What if my business is too weird or niche?",
    answer:
      "We've run plans for SaaS, e-commerce, consultants, local services, coaches, agencies, and a guy selling handmade fishing lures. If you have customers (or want them), we can research your market.",
  },
  {
    question: "What if it sucks?",
    answer:
      "Full refund. No questions, no hassle. We'd rather give your money back than have you feel stuck. Seriously — just email us.",
  },
];

export function Objections() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            Fair questions
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            What you&apos;re probably <span className="font-black">thinking.</span>
          </h2>
        </div>

        {/* FAQ list */}
        <div className="space-y-6">
          {OBJECTIONS.map((obj, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-foreground/15 bg-white p-6"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              <h3 className="text-lg font-bold text-foreground mb-3">
                &ldquo;{obj.question}&rdquo;
              </h3>
              <p className="text-foreground/70 leading-relaxed">{obj.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
