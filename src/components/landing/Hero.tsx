import Link from "next/link";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative bg-mesh py-16 lg:py-24 overflow-x-clip">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float stagger-2" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left - Hero content */}
          <div className="text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-slide-up">
              <span className="text-foreground">Stuck on growth?</span>
              <br />
              <span className="text-gradient">Get your next moves.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-lg text-muted sm:text-xl max-w-xl animate-slide-up stagger-2">
              Real competitive research. Prioritized recommendations.
              A 30-day roadmap built for <em>your</em> business.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-slide-up stagger-3">
              <Link href="/start">
                <Button size="lg" className="glow-cta text-lg px-8 py-4">
                  Get Started &mdash; $15
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="secondary" size="lg" className="text-lg">
                  See pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Right - Example strategy preview */}
          <div className="hidden lg:block relative lg:-mr-24 lg:-mt-48 lg:mb-[-200px] animate-fade-in">
            {/* Preview card - extends beyond container top and bottom */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-border/50">
              {/* Top fade overlay - content fades in from top */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white to-transparent z-10 rounded-t-xl" />

              {/* Content */}
              <div className="px-10 py-8 space-y-8 font-serif">
                {/* Previous item (partially visible at top) */}
                <div className="border-b border-border/30 pb-6">
                  <ol className="list-decimal list-inside text-muted" start={4}>
                    <li>Track email-to-profile-view conversion as your key retention metric.</li>
                  </ol>
                </div>

                {/* Main example strategy item */}
                <div className="border-b border-border/30 pb-8">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-navy">
                        5. Partner with Tattoo-Adjacent Communities
                      </h3>
                      <p className="mt-2 text-muted leading-relaxed">
                        Go where your users already congregate but aren&apos;t being marketed to.
                      </p>
                    </div>
                    {/* ICE Score Box */}
                    <div className="shrink-0 flex gap-6 px-5 py-3 rounded-lg border border-border/50 bg-surface/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-navy">6</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-navy">7</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-navy">6</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">Ease</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="font-semibold text-navy mb-3">Implementation:</p>
                    <ol className="space-y-2 text-muted list-decimal list-inside ml-1">
                      <li>Identify tattoo-adjacent communities:</li>
                    </ol>
                    <ul className="mt-2 ml-6 space-y-1.5 text-muted list-disc list-inside">
                      <li>Aftercare product brands (Mad Rabbit, Hustle Butter)</li>
                      <li>Tattoo-themed clothing/jewelry brands</li>
                      <li>Tattoo convention organizers</li>
                    </ul>
                  </div>
                </div>

                {/* Second item preview (partial - fades out) */}
                <div className="pb-12">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-navy">
                        6. Launch Pinterest Strategy
                      </h3>
                      <p className="mt-2 text-muted leading-relaxed">
                        Pinterest is where people <em>plan</em> tattoos. Reddit is where people <em>browse</em>. Huge difference.
                      </p>
                    </div>
                    {/* ICE Score Box */}
                    <div className="shrink-0 flex gap-6 px-5 py-3 rounded-lg border border-border/50 bg-surface/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-navy">8</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-navy">7</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-navy">7</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">Ease</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="font-semibold text-navy mb-3">Implementation:</p>
                    <ol className="space-y-2 text-muted list-decimal list-inside ml-1">
                      <li>Create a Pinterest Business account for Inkdex.</li>
                      <li>Create boards for each style: &quot;Blackwork Ideas,&quot; &quot;Japanese Inspiration&quot;</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Bottom fade - blends into next section */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface via-surface to-transparent rounded-b-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
