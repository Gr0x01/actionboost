import { FooterCTAForm } from "./FooterCTAForm";

export function FooterCTA() {
  return (
    <section className="relative py-24 bg-foreground">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Headline */}
        <p className="font-mono text-[11px] tracking-[0.2em] text-cta uppercase font-semibold mb-4">
          You scrolled this far.
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-background tracking-tight mb-4">
          That tells me something&apos;s not working{" "}
          <span className="font-black">and you know it.</span>
        </h2>
        <p className="text-lg text-background/70 mb-10">
          This is where you start. $29. Full refund if it&apos;s not worth it.
        </p>

        {/* Form (client component) */}
        <FooterCTAForm />
      </div>
    </section>
  );
}
