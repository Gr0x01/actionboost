import { FooterCTAForm } from "./FooterCTAForm";

export function FooterCTA() {
  return (
    <section className="relative py-24 bg-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Headline */}
        <p className="font-mono text-xs tracking-[0.12em] text-background/50 uppercase mb-4">
          Ready to stop guessing?
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-background tracking-tight mb-4">
          Tell me about your business.{" "}
          <span className="font-black">Your plan ready in 5 minutes.</span>
        </h2>
        <p className="text-lg text-background/60 mb-10">
          If it doesn&apos;t help, you get your money back. Seriously.
        </p>

        {/* Form (client component) */}
        <FooterCTAForm />
      </div>
    </section>
  );
}
