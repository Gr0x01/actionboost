"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroSummaryCard } from "./HeroSummaryCard";

// Platform logos - the chaos
const PLATFORM_LOGOS = [
  { name: "Google Analytics", src: "/logos/google-analytics.svg" },
  { name: "Instagram", src: "/logos/instagram.svg" },
  { name: "Facebook", src: "/logos/facebook.svg" },
  { name: "TikTok", src: "/logos/tiktok.svg" },
  { name: "Pinterest", src: "/logos/pinterest.svg" },
  { name: "LinkedIn", src: "/logos/linkedin.svg" },
  { name: "Yelp", src: "/logos/yelp.svg" },
  { name: "Google", src: "/logos/google.svg" },
  { name: "Twitter", src: "/logos/x.svg" },
  { name: "YouTube", src: "/logos/youtube.svg" },
  { name: "Mailchimp", src: "/logos/mailchimp.svg" },
  { name: "HubSpot", src: "/logos/hubspot.svg" },
];

// Noise cards - contradictory advice
const NOISE_CARDS = [
  { text: "Post 3x daily", type: "advice" },
  { text: "Quality over quantity", type: "advice" },
  { text: "Bounce rate: 67%", type: "metric" },
  { text: "Algorithm changed", type: "alert" },
  { text: "Email is dead", type: "advice" },
  { text: "Email is back", type: "advice" },
  { text: "Reach down 23%", type: "metric" },
  { text: "Try Reels!", type: "advice" },
];

// Starting positions - scattered around hero area (percentages of container)
// These will be in the top portion where the hero headline is
const LOGO_POSITIONS = [
  // Top corners and edges
  { x: 6, y: 4 },
  { x: 22, y: 6 },
  { x: 78, y: 5 },
  { x: 94, y: 7 },
  // Upper sides
  { x: 4, y: 16 },
  { x: 96, y: 14 },
  // Mid sides (around headline level)
  { x: 5, y: 26 },
  { x: 95, y: 24 },
  // Lower sides (below headline, above scroll point)
  { x: 7, y: 36 },
  { x: 28, y: 38 },
  { x: 72, y: 37 },
  { x: 93, y: 35 },
];

const NOISE_POSITIONS = [
  { x: 14, y: 8 },
  { x: 86, y: 10 },
  { x: 8, y: 20 },
  { x: 92, y: 18 },
  { x: 10, y: 32 },
  { x: 90, y: 30 },
  { x: 18, y: 40 },
  { x: 82, y: 38 },
];

export function HeroWithExplainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={containerRef} className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col justify-center py-16 lg:py-24">
        {/* Warm glow background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(230, 126, 34, 0.08) 0%, transparent 60%)",
          }}
        />

        {/* Hero content - centered */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-foreground leading-[1.05]">
            You didn&apos;t start a business
            <br />
            <span className="font-black text-foreground">to become a marketer.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl lg:text-2xl text-foreground/70 max-w-2xl mx-auto font-medium">
            Yet here you are, drowning in advice about algorithms, engagement rates, and &quot;just be consistent.&quot;
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 bg-cta text-white text-lg font-bold border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[5px_5px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100"
            >
              Get Your Plan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground font-medium transition-colors"
            >
              See how it works
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-sm text-foreground/50">
            $49 one-time · Takes 5 minutes · Money back if it doesn&apos;t help
          </p>
        </div>
      </section>

      {/* ===== EXPLAINER SECTION - where logos converge TO ===== */}
      <section id="how-it-works" className="relative py-16 lg:py-20 bg-gradient-to-b from-background to-surface">
        {/* Section header */}
        <motion.div
          className="relative z-10 mx-auto max-w-3xl px-6 text-center mb-12"
          style={{
            opacity: useTransform(scrollYProgress, [0.15, 0.3], [0, 1]),
            y: useTransform(scrollYProgress, [0.15, 0.3], [30, 0]),
          }}
        >
          <p className="font-mono text-xs tracking-[0.12em] text-foreground/60 uppercase mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight leading-tight">
            We scan{" "}
            <span className="font-black">the entire internet</span>
            <br />
            and build you{" "}
            <span className="font-black text-cta">one clear plan.</span>
          </h2>
        </motion.div>

        {/* The card - convergence target, fades in fast to catch icons */}
        <motion.div
          className="relative z-10 mx-auto max-w-xl px-6"
          style={{
            opacity: useTransform(scrollYProgress, [0.2, 0.3], [0, 1]),
            scale: useTransform(scrollYProgress, [0.2, 0.35], [0.95, 1]),
            y: useTransform(scrollYProgress, [0.2, 0.35], [30, 0]),
          }}
        >
          <HeroSummaryCard visible={true} />
        </motion.div>

        {/* Bottom text */}
        <motion.p
          className="relative z-10 mx-auto max-w-2xl px-6 text-center mt-10 text-lg text-foreground/70"
          style={{
            opacity: useTransform(scrollYProgress, [0.4, 0.55], [0, 1]),
          }}
        >
          Data from <span className="font-semibold text-foreground">12+ platforms</span>,
          analyzed and distilled into{" "}
          <span className="font-semibold text-foreground">24 specific actions</span>.
        </motion.p>
      </section>

      {/* ===== FLOATING CHAOS LAYER - spans both sections, BEHIND all content ===== */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
          {PLATFORM_LOGOS.map((logo, i) => (
            <ConvergingLogo
              key={logo.name}
              logo={logo}
              startPos={LOGO_POSITIONS[i]}
              scrollProgress={scrollYProgress}
              index={i}
            />
          ))}
          {NOISE_CARDS.map((card, i) => (
            <ConvergingNoise
              key={card.text}
              card={card}
              startPos={NOISE_POSITIONS[i]}
              scrollProgress={scrollYProgress}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConvergingLogo({
  logo,
  startPos,
  scrollProgress,
  index,
}: {
  logo: { name: string; src: string };
  startPos: { x: number; y: number };
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
}) {
  const targetX = 50;
  const targetY = 80; // Lower to match card position

  // Create curved paths by adding a "swing" midpoint
  const isLeftSide = startPos.x < 50;
  const swingAmount = 15 + (index % 4) * 5;
  const midX = isLeftSide
    ? startPos.x + swingAmount
    : startPos.x - swingAmount;

  // Vertical midpoint
  const verticalVariation = (index % 3 - 1) * 8;
  const midY = startPos.y + 18 + verticalVariation;

  // Converge toward card - card fades in fast to cover icons
  const left = useTransform(
    scrollProgress,
    [0, 0.2, 0.4],
    [`${startPos.x}%`, `${midX}%`, `${targetX}%`]
  );
  const top = useTransform(
    scrollProgress,
    [0, 0.2, 0.4],
    [`${startPos.y}%`, `${midY}%`, `${targetY}%`]
  );
  // Fade out as they reach the card
  const opacity = useTransform(scrollProgress, [0, 0.25, 0.4], [0.9, 0.8, 0]);
  const scale = useTransform(scrollProgress, [0, 0.4], [1, 0.15]);

  // Varied rotation speeds
  const rotateAmount = 120 + (index % 5) * 30;
  const rotate = useTransform(scrollProgress, [0, 0.5], [0, (index % 2 ? 1 : -1) * rotateAmount]);

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{ left, top, opacity, scale, rotate }}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-lg border border-border/50 flex items-center justify-center">
        <Image
          src={logo.src}
          alt=""
          role="presentation"
          width={28}
          height={28}
          className="w-7 h-7 sm:w-8 sm:h-8"
        />
      </div>
    </motion.div>
  );
}

function ConvergingNoise({
  card,
  startPos,
  scrollProgress,
  index,
}: {
  card: { text: string; type: string };
  startPos: { x: number; y: number };
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
}) {
  const targetX = 50;
  const targetY = 80; // Lower to match card position

  // Curved paths - opposite swing direction from logos for variety
  const isLeftSide = startPos.x < 50;
  const swingAmount = 10 + (index % 3) * 8;
  const midX = isLeftSide
    ? startPos.x + swingAmount * 1.5
    : startPos.x - swingAmount * 1.5;

  const verticalVariation = ((index + 1) % 3 - 1) * 10;
  const midY = startPos.y + 15 + verticalVariation;

  // Converge toward card - card fades in fast to cover
  const left = useTransform(
    scrollProgress,
    [0, 0.18, 0.4],
    [`${startPos.x}%`, `${midX}%`, `${targetX}%`]
  );
  const top = useTransform(
    scrollProgress,
    [0, 0.18, 0.4],
    [`${startPos.y}%`, `${midY}%`, `${targetY}%`]
  );
  const opacity = useTransform(scrollProgress, [0, 0.25, 0.4], [0.85, 0.75, 0]);
  const scale = useTransform(scrollProgress, [0, 0.4], [1, 0.12]);

  const rotateAmount = 60 + (index % 4) * 25;
  const rotate = useTransform(scrollProgress, [0, 0.5], [0, (index % 2 ? -1 : 1) * rotateAmount]);

  const bgColor =
    card.type === "metric"
      ? "bg-red-50 border-red-200/50"
      : card.type === "alert"
        ? "bg-amber-50 border-amber-200/50"
        : "bg-white border-border/50";

  const textColor =
    card.type === "metric"
      ? "text-red-700"
      : card.type === "alert"
        ? "text-amber-700"
        : "text-foreground/70";

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{ left, top, opacity, scale, rotate }}
    >
      <div
        className={`px-4 py-2.5 rounded-lg shadow-lg border text-sm font-medium whitespace-nowrap ${bgColor} ${textColor}`}
      >
        {card.text}
      </div>
    </motion.div>
  );
}
