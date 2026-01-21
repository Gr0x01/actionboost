import Image from "next/image";
import { HeroForm } from "./HeroForm";

export function Hero() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main grid: 4/3 split */}
        <div className="grid lg:grid-cols-7 gap-12 lg:gap-16 items-start">
          {/* Left column - 4/7 width (Server rendered - LCP content) */}
          <div className="lg:col-span-4">
            {/* Tagline - mono, utility feel */}
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-6">
              $9.99 → 30-day growth plan → no fluff
            </p>

            {/* Headline - brutalist contrast (LCP element) */}
            <h1 className="space-y-1">
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-foreground leading-[0.95]">
                Stop guessing.
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-foreground leading-[0.95]">
                Start growing.
              </span>
            </h1>

            {/* Subhead - punchy, direct */}
            <p className="mt-8 text-lg sm:text-xl text-foreground/70 max-w-lg leading-relaxed">
              We pull your competitors&apos; traffic data. We score every tactic by impact. You get a{" "}
              <span className="text-foreground font-semibold">real plan</span>—not another AI word salad.
            </p>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-foreground/40 line-through">$200/hr consultant</span>
                <span className="font-bold text-cta">$9.99</span>
              </div>
              <span className="text-foreground/20">|</span>
              <span className="text-foreground/60">Money-back guarantee</span>
              <span className="text-foreground/20">|</span>
              <a
                href="https://x.com/rbaten"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
              >
                <Image src="/rbaten.png" alt="" width={20} height={20} className="rounded-full grayscale" />
                Built by @rbaten
              </a>
            </div>
          </div>

          {/* Right column - 3/7 width (Client component for interactivity) */}
          <div className="lg:col-span-3">
            <HeroForm />
          </div>
        </div>
      </div>
    </section>
  );
}
