import { HeroForm } from "./HeroForm";

export function Hero() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Organic flowing line - top left */}
      <svg
        className="absolute -top-20 -left-32 w-[600px] h-[400px] pointer-events-none hidden lg:block"
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 350C100 280 180 320 250 250C320 180 280 120 350 80C420 40 500 100 550 50"
          stroke="#E67E22"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.12"
          fill="none"
        />
        <path
          d="M20 300C80 250 140 280 200 220C260 160 220 100 300 70C380 40 420 90 480 60"
          stroke="#D4A574"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.10"
          fill="none"
        />
      </svg>

      {/* Organic flowing line - bottom right */}
      <svg
        className="absolute -bottom-16 -right-24 w-[500px] h-[350px] pointer-events-none hidden lg:block"
        viewBox="0 0 500 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M450 300C400 250 420 180 350 150C280 120 300 60 230 50C160 40 100 80 50 30"
          stroke="#E67E22"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.10"
          fill="none"
        />
        <path
          d="M480 250C420 200 440 150 380 130C320 110 340 70 280 50C220 30 180 60 120 40"
          stroke="#D4A574"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.08"
          fill="none"
        />
      </svg>

      {/* Small accent curve - right side */}
      <svg
        className="absolute top-1/3 -right-8 w-[200px] h-[150px] pointer-events-none hidden lg:block"
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M180 20C140 40 160 80 120 100C80 120 60 90 20 120"
          stroke="#E67E22"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.15"
          fill="none"
        />
      </svg>

      {/* Warm glow behind form */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(230, 126, 34, 0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h1 className="mb-6">
          <span className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground leading-[1.1]">
            Stuck on marketing?
          </span>
          <span className="relative inline-block mt-2 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Let&apos;s figure it out.
            {/* Hand-drawn underline SVG */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-4"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M2 8C30 4 50 9 80 5C110 1 140 8 170 4C185 2 198 6 198 6"
                stroke="#E67E22"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          Answer a few quick questions. I&apos;ll research your market, see
          what&apos;s working for competitors, and build you a 30-day plan.
        </p>

        {/* Form wizard */}
        <div className="mt-12 max-w-xl mx-auto">
          <HeroForm />
        </div>

        {/* Trust line */}
        <p className="mt-6 text-sm text-foreground/50">
          Takes 5 minutes. No jargon. Money back if it doesn&apos;t help.
        </p>
      </div>
    </section>
  );
}
