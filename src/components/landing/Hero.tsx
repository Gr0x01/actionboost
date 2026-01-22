import { HeroForm } from "./HeroForm";

export function Hero() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Main grid: 4/3 split */}
        <div className="grid lg:grid-cols-7 gap-12 lg:gap-16 items-start">
          {/* Left column - 4/7 width */}
          <div className="lg:col-span-4">
            {/* Tagline */}
            <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-6">
              $49 · Your market researched · Money back if it doesn&apos;t help
            </p>

            {/* Headline - friendly, approachable */}
            <h1 className="space-y-1">
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground leading-[1.1]">
                Stuck on marketing?
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Let&apos;s figure it out.
              </span>
            </h1>

            {/* Subhead - warm, helpful */}
            <p className="mt-8 text-lg sm:text-xl text-foreground/70 max-w-lg leading-relaxed">
              Tell me about your business — what you do, what you&apos;ve tried, where you&apos;re stuck. I&apos;ll research your market, see what&apos;s working for your competitors, and build you a 30-day plan with exactly what to do.
            </p>

            {/* Trust row - SMB focused */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-foreground/70">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No marketing degree needed
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-foreground/70">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No jargon
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-foreground/70">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Works for any business
              </span>
            </div>
          </div>

          {/* Right column - 3/7 width */}
          <div className="lg:col-span-3">
            <HeroForm />
          </div>
        </div>
      </div>
    </section>
  );
}
