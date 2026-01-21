import { FooterCTAForm } from "./FooterCTAForm";

export function FooterCTA() {
  return (
    <section className="relative py-24 bg-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Headline */}
        <p className="font-mono text-xs tracking-[0.15em] text-background/50 uppercase mb-4">
          Let&apos;s go
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-background tracking-tight mb-4">
          Ready to <span className="font-black">stop guessing?</span>
        </h2>
        <p className="text-lg text-background/60 mb-10">
          Drop your URL. Get a real growth plan.
        </p>

        {/* Form (client component) */}
        <FooterCTAForm />
      </div>
    </section>
  );
}
