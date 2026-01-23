"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HeroSummaryCard } from "./HeroSummaryCard";

// Platform logos - the chaos (23 unique platforms)
// hasBackground = logo SVG has built-in background color (should fill entire card)
const PLATFORM_LOGOS = [
  // Social & Communication
  { name: "Instagram", src: "/logos/instagram.svg", hasBackground: true },
  { name: "Facebook", src: "/logos/facebook.svg", hasBackground: true },
  { name: "TikTok", src: "/logos/tiktok.svg" },
  { name: "LinkedIn", src: "/logos/linkedin.svg", hasBackground: true },
  { name: "Twitter", src: "/logos/x.svg", hasBackground: true },
  { name: "YouTube", src: "/logos/youtube.svg", hasBackground: true },
  { name: "Pinterest", src: "/logos/pinterest.svg" },
  { name: "Ahrefs", src: "/logos/ahrefs.png", hasBackground: true },
  { name: "Reddit", src: "/logos/reddit.svg", hasBackground: true },
  { name: "WhatsApp", src: "/logos/whatsapp.svg" },
  { name: "Threads", src: "/logos/threads.svg" },
  // E-commerce & Business
  { name: "Google", src: "/logos/google.svg" },
  { name: "Amazon", src: "/logos/amazon.svg" },
  { name: "Shopify", src: "/logos/shopify.svg" },
  { name: "Stripe", src: "/logos/stripe.svg", hasBackground: true },
  { name: "Etsy", src: "/logos/etsy.svg", hasBackground: true },
  { name: "Yelp", src: "/logos/yelp.svg" },
  // Marketing Tools
  { name: "Google Analytics", src: "/logos/google-analytics.svg" },
  { name: "Mailchimp", src: "/logos/mailchimp.svg" },
  { name: "HubSpot", src: "/logos/hubspot.svg" },
  { name: "Semrush", src: "/logos/semrush.png", hasBackground: true },
  { name: "WordPress", src: "/logos/wordpress.svg" },
  { name: "Slack", src: "/logos/slack.svg" },
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
  // More noise
  { text: "Go viral!", type: "advice" },
  { text: "SEO is dead", type: "advice" },
  { text: "CTR: 0.3%", type: "metric" },
  { text: "Be authentic", type: "advice" },
];

// Starting positions - scattered around hero area (percentages of container)
// Desktop: dense field of logos framing the content
const LOGO_POSITIONS = [
  // Row 1 - very top
  { x: 8, y: 3 },
  { x: 20, y: 5 },
  { x: 35, y: 4 },
  { x: 65, y: 3 },
  { x: 80, y: 5 },
  { x: 92, y: 4 },
  // Row 2 - upper
  { x: 6, y: 12 },
  { x: 18, y: 14 },
  { x: 82, y: 13 },
  { x: 94, y: 11 },
  // Row 3 - mid-upper (around headline)
  { x: 5, y: 22 },
  { x: 15, y: 24 },
  { x: 85, y: 23 },
  { x: 95, y: 21 },
  // Row 4 - mid (around subhead)
  { x: 7, y: 32 },
  { x: 20, y: 34 },
  { x: 80, y: 33 },
  { x: 93, y: 31 },
  // Row 5 - lower (around CTA)
  { x: 10, y: 42 },
  { x: 28, y: 44 },
  { x: 72, y: 43 },
  { x: 90, y: 41 },
  // Row 6 - bottom
  { x: 50, y: 52 },
];

const NOISE_POSITIONS = [
  // Scattered among logos
  { x: 14, y: 7 },
  { x: 86, y: 8 },
  { x: 10, y: 18 },
  { x: 90, y: 17 },
  { x: 12, y: 28 },
  { x: 88, y: 27 },
  { x: 18, y: 38 },
  { x: 82, y: 37 },
  { x: 22, y: 48 },
  { x: 78, y: 47 },
  { x: 8, y: 55 },
  { x: 92, y: 54 },
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
      {/* Gradient shapes spanning both sections */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large warm blob - top right */}
        <div
          className="absolute -top-20 -right-20 w-[800px] h-[800px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(230, 126, 34, 0.25) 0%, transparent 60%)" }}
        />
        {/* Cool blob - bottom left */}
        <div
          className="absolute top-[50%] -left-60 w-[900px] h-[900px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(52, 152, 219, 0.15) 0%, transparent 60%)" }}
        />
        {/* Warm accent - center */}
        <div
          className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(243, 156, 18, 0.2) 0%, transparent 60%)" }}
        />
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col justify-center py-16 lg:py-24">

        {/* Scrim - radial gradient to push icons back behind text */}
        {/* Mobile: wider and taller to cover more */}
        <div
          className="absolute inset-0 z-[6] pointer-events-none md:hidden"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 100% 75% at 50% 50%, rgba(252, 249, 245, 0.98) 0%, rgba(252, 249, 245, 0.9) 50%, rgba(252, 249, 245, 0) 80%)",
          }}
        />
        {/* Desktop: more subtle, lets icons peek through edges */}
        <div
          className="absolute inset-0 z-[6] pointer-events-none hidden md:block"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 60% 70% at 50% 45%, rgba(252, 249, 245, 0.97) 0%, rgba(252, 249, 245, 0.85) 40%, rgba(252, 249, 245, 0) 70%)",
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
              href="/start"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 bg-cta text-white text-lg font-bold border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.4)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.45)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.4)] active:translate-y-0.5 transition-all duration-100"
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
          <p className="mt-8 text-sm text-foreground/70 font-medium">
            $29 one-time · 5 minutes · <span className="text-foreground">100% refund if it doesn&apos;t help</span>
          </p>
        </div>
      </section>

      {/* ===== EXPLAINER SECTION - where logos converge TO ===== */}
      <section id="how-it-works" className="relative py-16 lg:py-20">
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
            All that noise?
            <br />
            <span className="font-black text-cta">We turned it into this.</span>
          </h2>
        </motion.div>

        {/* The card - convergence target, fades in fast to catch icons */}
        <motion.div
          className="relative z-10 mx-auto max-w-3xl px-6"
          style={{
            opacity: useTransform(scrollYProgress, [0.2, 0.3], [0, 1]),
            scale: useTransform(scrollYProgress, [0.2, 0.35], [0.95, 1]),
            y: useTransform(scrollYProgress, [0.2, 0.35], [30, 0]),
          }}
        >
          <HeroSummaryCard visible={true} />
        </motion.div>

        {/* Bottom text - bridge to pricing */}
        <motion.div
          className="relative z-10 mx-auto max-w-2xl px-6 text-center mt-12"
          style={{
            opacity: useTransform(scrollYProgress, [0.4, 0.55], [0, 1]),
          }}
        >
          <p className="text-xl text-foreground font-medium mb-2">
            That&apos;s your first two weeks.
          </p>
          <p className="text-lg text-foreground/60">
            The full plan includes competitor research, customer journey analysis, and a complete 30-day roadmap.
          </p>
        </motion.div>
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
  logo: { name: string; src: string; hasBackground?: boolean };
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
      {logo.hasBackground ? (
        // Logos with built-in backgrounds - fill the entire card
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-[3px_3px_0_rgba(44,62,80,0.08)]">
          <Image
            src={logo.src}
            alt=""
            role="presentation"
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        // Icon-only logos - white card with centered icon
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border-2 border-foreground/15 shadow-[3px_3px_0_rgba(44,62,80,0.08)] flex items-center justify-center">
          <Image
            src={logo.src}
            alt=""
            role="presentation"
            width={28}
            height={28}
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
        </div>
      )}
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
      ? "bg-red-50 border-red-200"
      : card.type === "alert"
        ? "bg-amber-50 border-amber-200"
        : "bg-white border-foreground/15";

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
        className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium whitespace-nowrap ${bgColor} ${textColor}`}
        style={{ boxShadow: "3px 3px 0 rgba(44, 62, 80, 0.08)" }}
      >
        {card.text}
      </div>
    </motion.div>
  );
}
