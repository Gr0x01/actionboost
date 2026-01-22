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
              $10 → competitor + channel research → money back if it&apos;s useless
            </p>

            {/* Headline - brutalist contrast (LCP element) */}
            <h1 className="space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground leading-[0.95]">
                ChatGPT told me&nbsp;Reddit.
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-foreground leading-[0.95]">
                This said Pinterest. It&apos;s&nbsp;working.
              </span>
            </h1>

            {/* Subhead - punchy, direct */}
            <p className="mt-8 text-lg sm:text-xl text-foreground/70 max-w-lg leading-relaxed">
              I built this to figure out my own marketing. It researched my competitors, found channels I&apos;d never considered, and gave me a plan. $10, refund if it doesn&apos;t help.
            </p>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <a
                href="https://x.com/rbaten"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
              >
                <Image src="/rbaten.png" alt="" width={24} height={24} className="rounded-full" />
                <span className="font-medium">Built by @rbaten</span>
              </a>
              <span className="text-foreground/20">|</span>
              <span className="text-foreground/60">Side project</span>
              <span className="text-foreground/20">|</span>
              <span className="text-foreground/60">$10 because $5 seemed fake</span>
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
