const testimonials = [
  {
    quote: "The competitor analysis feature is incredibly valuable. The 30-day playbook alone is worth the price.",
    author: "@noahpraduns",
  },
  {
    quote: "This is an amazing tool love it.",
    author: "@hanscadx8",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 bg-foreground/[0.02]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            Social Proof
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            Don&apos;t take our word for it.{" "}
            <span className="font-black">Take theirs.</span>
          </h2>
        </div>

        {/* Featured testimonial - Simon */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="rounded-2xl border-[3px] border-foreground bg-background p-8 lg:p-10 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
            <div className="text-6xl text-cta font-serif leading-none mb-4">&ldquo;</div>
            <blockquote className="text-2xl lg:text-3xl font-light text-foreground leading-relaxed mb-6">
              seems alright actually
              <br />
              <span className="font-black">good product</span>
            </blockquote>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-bold text-foreground">@simonbalfe</p>
                <p className="text-sm text-foreground/60">
                  After being cold-called about actionboo.st
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting testimonials */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border-[3px] border-foreground/30 bg-background p-6 flex flex-col"
            >
              <blockquote className="text-foreground leading-relaxed flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <p className="font-mono text-sm text-foreground/60 mt-4">
                {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
