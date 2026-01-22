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
          10 minutes to fill out the form.{" "}
          <span className="font-black">Your plan ready in about an hour.</span>
        </h2>
        <p className="text-lg text-background/60 mb-10">
          If it doesn&apos;t help, you get your money back. No questions asked.
        </p>

        {/* Form (client component) */}
        <FooterCTAForm />
      </div>
    </section>
  );
}
