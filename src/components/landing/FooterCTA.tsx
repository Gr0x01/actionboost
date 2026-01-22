import { FooterCTAForm } from "./FooterCTAForm";

export function FooterCTA() {
  return (
    <section className="relative py-24 bg-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Headline */}
        <p className="font-mono text-xs tracking-[0.15em] text-background/50 uppercase mb-4">
          Still here?
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-background tracking-tight mb-4">
          I was stuck too. <span className="font-black">This is what got me unstuck.</span>
        </h2>
        <p className="text-lg text-background/60 mb-10">
          $10. Your URL. See what you&apos;re missing.
        </p>

        {/* Form (client component) */}
        <FooterCTAForm />
      </div>
    </section>
  );
}
