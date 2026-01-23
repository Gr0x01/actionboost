"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Platform logos - the sources of overwhelm
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

// Marketing noise - the contradictory advice (includes deliberate contradictions)
const NOISE_CARDS = [
  { text: "Post 3x daily", type: "advice" },
  { text: "Quality over quantity", type: "advice" }, // contradiction
  { text: "Bounce rate: 67%", type: "metric" },
  { text: "Algorithm changed", type: "alert" },
  { text: "Email is dead", type: "advice" },
  { text: "Email is back", type: "advice" }, // contradiction
  { text: "Reach down 23%", type: "metric" },
  { text: "Try Reels!", type: "advice" },
  { text: "CTR: 0.3%", type: "metric" },
  { text: "Boost this post", type: "advice" },
  { text: "Followers: +3", type: "metric" },
  { text: "SEO needs work", type: "alert" },
];

// Position each element around the viewport - avoiding center where content lives
const CHAOS_POSITIONS = [
  // Top area
  { x: 8, y: 8, rotation: -8, scale: 0.9 },
  { x: 25, y: 5, rotation: 5, scale: 1.1 },
  { x: 75, y: 6, rotation: 7, scale: 1 },
  { x: 88, y: 10, rotation: -5, scale: 0.95 },

  // Upper sides
  { x: 3, y: 25, rotation: 12, scale: 1 },
  { x: 92, y: 22, rotation: -10, scale: 0.9 },

  // Middle sides (away from center content)
  { x: 5, y: 45, rotation: -6, scale: 1.05 },
  { x: 93, y: 40, rotation: 8, scale: 0.85 },
  { x: 2, y: 60, rotation: 4, scale: 0.9 },
  { x: 95, y: 55, rotation: -12, scale: 1 },

  // Lower sides
  { x: 6, y: 75, rotation: -8, scale: 0.95 },
  { x: 90, y: 72, rotation: 6, scale: 1.1 },

  // Bottom area
  { x: 15, y: 88, rotation: 10, scale: 0.9 },
  { x: 35, y: 92, rotation: -4, scale: 1 },
  { x: 65, y: 90, rotation: 7, scale: 0.85 },
  { x: 85, y: 85, rotation: -9, scale: 0.95 },

  // Extra scattered positions
  { x: 12, y: 35, rotation: -7, scale: 0.8 },
  { x: 88, y: 30, rotation: 11, scale: 0.9 },
  { x: 10, y: 65, rotation: 5, scale: 1 },
  { x: 85, y: 78, rotation: -6, scale: 0.85 },
  { x: 20, y: 15, rotation: 8, scale: 0.9 },
  { x: 80, y: 12, rotation: -4, scale: 1 },
  { x: 18, y: 80, rotation: 3, scale: 0.95 },
  { x: 82, y: 88, rotation: -8, scale: 0.9 },
];

// Pre-built static array combining logos and noise cards
const ALL_ELEMENTS = [
  ...PLATFORM_LOGOS.map((logo, i) => ({
    type: "logo" as const,
    data: logo,
    pos: CHAOS_POSITIONS[i],
    key: `logo-${logo.name}`,
  })),
  ...NOISE_CARDS.map((card, i) => ({
    type: "card" as const,
    data: card,
    pos: CHAOS_POSITIONS[PLATFORM_LOGOS.length + i] || CHAOS_POSITIONS[i % CHAOS_POSITIONS.length],
    key: `card-${card.text}`,
  })),
];

export function HeroChaos() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {ALL_ELEMENTS.map((element, index) => (
        <ChaosElement
          key={element.key}
          element={element}
          index={index}
        />
      ))}
    </div>
  );
}

interface ChaosElementProps {
  element: {
    type: "logo" | "card";
    data: (typeof PLATFORM_LOGOS)[0] | (typeof NOISE_CARDS)[0];
    pos: (typeof CHAOS_POSITIONS)[0];
    key: string;
  };
  index: number;
}

function ChaosElement({ element, index }: ChaosElementProps) {
  const { pos } = element;

  // Each element gets unique animation parameters for organic feel
  // Vary duration, direction, and amplitude based on index
  const baseDuration = 15 + (index % 7) * 3; // 15-36 seconds
  const xAmplitude = 8 + (index % 5) * 4; // 8-24px drift
  const yAmplitude = 12 + (index % 4) * 5; // 12-27px drift
  const rotateAmplitude = 3 + (index % 3) * 2; // 3-7 degrees

  // Alternate directions for more chaos
  const xDirection = index % 2 === 0 ? 1 : -1;
  const yDirection = index % 3 === 0 ? 1 : -1;

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
      }}
      initial={{
        rotate: pos.rotation,
        scale: pos.scale,
        opacity: 0,
      }}
      animate={{
        // Perpetual drifting motion - like debris in zero gravity
        x: [
          0,
          xAmplitude * xDirection,
          -xAmplitude * 0.5 * xDirection,
          xAmplitude * 0.7 * xDirection,
          0,
        ],
        y: [
          0,
          yAmplitude * yDirection,
          -yAmplitude * 0.6 * yDirection,
          yAmplitude * 0.4 * yDirection,
          0,
        ],
        rotate: [
          pos.rotation,
          pos.rotation + rotateAmplitude,
          pos.rotation - rotateAmplitude * 0.5,
          pos.rotation + rotateAmplitude * 0.3,
          pos.rotation,
        ],
        opacity: [0.7, 0.85, 0.75, 0.8, 0.7],
        scale: [pos.scale, pos.scale * 1.02, pos.scale * 0.98, pos.scale * 1.01, pos.scale],
      }}
      transition={{
        duration: baseDuration,
        repeat: Infinity,
        ease: "easeInOut",
        // Stagger start times so elements don't all sync up
        delay: (index * 0.3) % 3,
      }}
    >
      {element.type === "logo" ? (
        <LogoElement logo={element.data as (typeof PLATFORM_LOGOS)[0]} />
      ) : (
        <NoiseCard card={element.data as (typeof NOISE_CARDS)[0]} />
      )}
    </motion.div>
  );
}

function LogoElement({ logo }: { logo: (typeof PLATFORM_LOGOS)[0] }) {
  return (
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
  );
}

function NoiseCard({ card }: { card: (typeof NOISE_CARDS)[0] }) {
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
    <div
      className={`px-4 py-2.5 rounded-lg shadow-lg border text-sm sm:text-base font-medium whitespace-nowrap ${bgColor} ${textColor}`}
    >
      {card.text}
    </div>
  );
}
