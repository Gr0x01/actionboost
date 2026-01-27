import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ALTERNATIVES = [
  {
    id: "diy",
    title: "Wing it or ask ChatGPT",
    price: "Free",
    time: "Hours of guessing",
    points: [
      "Generic advice that applies to everyone",
      "No competitor research",
      '"Maybe try posting more consistently?"',
    ],
    highlighted: false,
  },
  {
    id: "boost",
    title: "Get a real Boost",
    price: "$29",
    priceNote: "once",
    time: "Built on real research",
    points: [
      "Real competitor research on YOUR market",
      "Specific tactics ranked by impact",
      "30-day roadmap you can actually follow",
    ],
    highlighted: true,
  },
  {
    id: "agency",
    title: "Hire an agency",
    price: "$2,000-10,000",
    priceNote: "/month",
    time: "2-4 week onboarding",
    points: [
      "Real research and strategy",
      "Custom to your business",
      "Ongoing retainer relationship",
    ],
    highlighted: false,
  },
];

export function CompetitiveAlternatives() {
  return (
    <section className="relative py-20 bg-surface">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            Your options
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            What you&apos;d do <span className="font-black">without us.</span>
          </h2>
        </div>

        {/* Three cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {ALTERNATIVES.map((alt) => (
            <div
              key={alt.id}
              className={`
                relative rounded-xl p-6 lg:p-8
                ${alt.highlighted
                  ? "bg-white border-2 border-cta"
                  : "bg-white border-2 border-foreground/15"
                }
              `}
              style={{
                boxShadow: alt.highlighted
                  ? "6px 6px 0 rgba(230, 126, 34, 0.25)"
                  : "4px 4px 0 rgba(44, 62, 80, 0.08)",
              }}
            >
              {/* Recommended badge */}
              {alt.highlighted && (
                <div className="absolute -top-3 left-6">
                  <span className="bg-cta text-white text-xs font-bold px-3 py-1 rounded-full">
                    Best value
                  </span>
                </div>
              )}

              {/* Title */}
              <h3
                className={`text-lg font-bold mb-4 ${
                  alt.highlighted ? "text-cta" : "text-foreground"
                }`}
              >
                {alt.title}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span
                  className={`text-3xl font-black ${
                    alt.highlighted ? "text-foreground" : "text-foreground/70"
                  }`}
                >
                  {alt.price}
                </span>
                {alt.priceNote && (
                  <span className="text-foreground/50 ml-1">{alt.priceNote}</span>
                )}
              </div>

              {/* Time */}
              <p className="text-sm text-foreground/60 mb-6">{alt.time}</p>

              {/* Points */}
              <ul className="space-y-3">
                {alt.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        alt.highlighted ? "bg-cta" : "bg-foreground/30"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        alt.highlighted
                          ? "text-foreground"
                          : "text-foreground/60"
                      }`}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA for highlighted card */}
              {alt.highlighted && (
                <Link
                  href="/start"
                  className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-cta text-white font-bold border-2 border-cta shadow-[3px_3px_0_rgba(44,62,80,0.2)] hover:shadow-[4px_4px_0_rgba(44,62,80,0.25)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100"
                >
                  Get Your Boost
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
