"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";

// Business type content - specific, actionable plans for each
const BUSINESS_TYPES = {
  salon: {
    label: "Hair Salon",
    week1: [
      { text: "Add 8 before/after photos to Google Business (focus on balayage)" },
      { text: "Reply to your 5 most recent Google reviews with personalized responses" },
      { text: "Create an Instagram highlight called 'Transformations'" },
    ],
    week2: [
      { text: "Post a 15-second Reel showing a color process with trending audio" },
      { text: "Text your last 20 color clients offering $15 off rebooking" },
    ],
    insight: "Your top competitor ranks for 31 keywords you don't - like 'balayage near me'",
    sources: ["google", "instagram", "yelp", "facebook"],
  },
  candles: {
    label: "Candle Shop",
    week1: [
      { text: "Add burn time and scent notes to every product description" },
      { text: "Email your list with 'Back in stock: [your #1 seller]' subject line" },
      { text: "Create a 'Bestsellers' collection on your homepage" },
    ],
    week2: [
      { text: "Set up an abandoned cart email - send 3 hours after abandonment" },
      { text: "Post a TikTok showing the 'first light' of a new candle" },
    ],
    insight: "3 competitors offer subscription boxes - subscribers have 3x higher lifetime value",
    sources: ["google-analytics", "tiktok", "pinterest", "mailchimp"],
  },
  cafe: {
    label: "Local Cafe",
    week1: [
      { text: "Update Google Business hours and verify 'Popular times' accuracy" },
      { text: "Add 6 food photos to Yelp with specific dish names as captions" },
      { text: "Claim your Apple Maps listing and add your menu link" },
    ],
    week2: [
      { text: "Create an Instagram Story template for your daily special" },
      { text: "Reply to your 3 most critical Yelp reviews with an invitation to return" },
    ],
    insight: "Your closest competitor has 147 more Google reviews than you",
    sources: ["google", "yelp", "instagram", "facebook"],
  },
  coach: {
    label: "Business Coach",
    week1: [
      { text: "Rewrite LinkedIn headline to focus on specific results you deliver" },
      { text: "Turn your best client result into a LinkedIn carousel" },
      { text: "Send voice notes to 10 past clients asking for testimonials" },
    ],
    week2: [
      { text: "Post a 'hot take' about a common mistake in your niche" },
      { text: "Create a lead magnet: '5 Questions to Ask Before...'" },
    ],
    insight: "Your top 3 competitors publish weekly LinkedIn newsletters with 1K+ subscribers",
    sources: ["linkedin", "google-analytics", "hubspot", "youtube"],
  },
  fitness: {
    label: "Fitness Studio",
    week1: [
      { text: "Add class schedules to Google Business with prices visible" },
      { text: "Film 3 short-form videos of members mid-workout" },
      { text: "Create an Instagram 'New Here?' highlight with studio tour" },
    ],
    week2: [
      { text: "Text inactive members: 'We miss you! Reply BACK for a free class'" },
      { text: "Partner with a nearby smoothie shop for cross-promo" },
    ],
    insight: "Your competitor gets 73% of new members from Instagram DMs, not their website",
    sources: ["instagram", "google", "tiktok", "facebook"],
  },
};

type BusinessType = keyof typeof BUSINESS_TYPES;
const BUSINESS_KEYS = Object.keys(BUSINESS_TYPES) as BusinessType[];

// Source logos - maps to files in /public/logos/
const SOURCE_LOGOS: Record<string, string> = {
  google: "/logos/google.svg",
  "google-analytics": "/logos/google-analytics.svg",
  instagram: "/logos/instagram.svg",
  facebook: "/logos/facebook.svg",
  tiktok: "/logos/tiktok.svg",
  pinterest: "/logos/pinterest.svg",
  linkedin: "/logos/linkedin.svg",
  yelp: "/logos/yelp.svg",
  youtube: "/logos/youtube.svg",
  mailchimp: "/logos/mailchimp.svg",
  hubspot: "/logos/hubspot.svg",
};

interface HeroSummaryCardProps {
  visible: boolean;
}

export function HeroSummaryCard({ visible }: HeroSummaryCardProps) {
  const [selectedType, setSelectedType] = useState<BusinessType>("salon");
  const businessData = BUSINESS_TYPES[selectedType];

  // Build tasks from selected business type
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set(["0", "1"]));

  // Reset checked state when switching business types
  useEffect(() => {
    setCheckedTasks(new Set(["0", "1"]));
  }, [selectedType]);

  const allTasks = [
    ...businessData.week1.map((t, i) => ({ ...t, id: `${i}`, week: 1 })),
    ...businessData.week2.map((t, i) => ({ ...t, id: `${businessData.week1.length + i}`, week: 2 })),
  ];

  const week1Tasks = allTasks.filter(t => t.week === 1);
  const week2Tasks = allTasks.filter(t => t.week === 2);

  const toggleTask = (id: string) => {
    setCheckedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const prevWeekCompletions = useRef({ week1: false, week2: false });

  // Check for week completions
  const week1Complete = week1Tasks.every(t => checkedTasks.has(t.id));
  const week2Complete = week2Tasks.every(t => checkedTasks.has(t.id));

  // Trigger confetti when a week becomes complete
  useEffect(() => {
    const wasWeek1Complete = prevWeekCompletions.current.week1;
    const wasWeek2Complete = prevWeekCompletions.current.week2;

    if ((week1Complete && !wasWeek1Complete) || (week2Complete && !wasWeek2Complete)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }

    prevWeekCompletions.current = { week1: week1Complete, week2: week2Complete };
  }, [week1Complete, week2Complete]);

  if (!visible) return null;

  return (
    <motion.div
      className="relative max-w-2xl mx-auto overflow-visible"
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Big confetti burst behind card */}
      <AnimatePresence>
        {showConfetti && <BigConfettiBurst />}
      </AnimatePresence>

      {/* The card - SOFT BRUTALIST */}
      <div
        className="relative z-10 bg-white border-2 border-foreground/20 rounded-xl overflow-hidden"
        style={{
          boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)",
        }}
      >
        {/* Header with business type selector */}
        <div className="px-6 pt-5 pb-4 border-b-2 border-foreground/10">
          {/* Business type tabs - Soft Brutalist style */}
          <div className="flex flex-wrap gap-2 mb-4">
            {BUSINESS_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-100
                  ${selectedType === key
                    ? "bg-foreground text-white shadow-sm"
                    : "bg-foreground/5 text-foreground/60 border border-foreground/15 hover:border-foreground/30 hover:text-foreground"
                  }
                `}
              >
                {BUSINESS_TYPES[key].label}
              </button>
            ))}
          </div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">
            Your first two weeks
          </h3>
        </div>

        {/* Content - horizontal layout on desktop */}
        <div className="p-5">
          {/* Two-column layout for weeks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Week 1 */}
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
                  Week 1
                </span>
                <span className="text-sm font-bold text-foreground">
                  Foundation
                </span>
              </div>
              <div className="space-y-2">
                {week1Tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    checked={checkedTasks.has(task.id)}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.text}
                  </TaskItem>
                ))}
              </div>
            </div>

            {/* Week 2 */}
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
                  Week 2
                </span>
                <span className="text-sm font-bold text-foreground">
                  Quick Wins
                </span>
              </div>
              <div className="space-y-2">
                {week2Tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    checked={checkedTasks.has(task.id)}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.text}
                  </TaskItem>
                ))}
                {/* Fade hint inline */}
                <div className="opacity-40 pt-1">
                  <TaskItem disabled>+ 2 more weeks...</TaskItem>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Insight + Sources */}
          <div className="mt-5 pt-5 border-t-2 border-foreground/10 flex flex-col md:flex-row md:items-center gap-4">
            {/* Competitive Insight - Soft Brutalist accent */}
            <div className="flex-1 bg-cta/10 border-l-4 border-l-cta rounded-r-md px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cta mb-1">
                What we found
              </p>
              <p className="text-sm font-medium text-foreground leading-snug">
                {businessData.insight}
              </p>
            </div>

            {/* Source icons */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-foreground/50">Built from:</span>
              {businessData.sources.map((source) => (
                <div
                  key={source}
                  className="w-6 h-6 rounded-md bg-white border-2 border-foreground/10 flex items-center justify-center"
                  title={source}
                >
                  <Image
                    src={SOURCE_LOGOS[source]}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                </div>
              ))}
              <span className="text-xs font-semibold text-foreground/30">+8</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskItem({
  children,
  checked,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-start gap-3 text-sm w-full text-left
        ${disabled ? "cursor-default" : "cursor-pointer group"}
      `}
    >
      <div
        className={`
          w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5
          transition-all duration-100
          ${checked
            ? "bg-cta border-2 border-cta"
            : disabled
              ? "border-2 border-foreground/20 bg-transparent"
              : "border-2 border-foreground/25 bg-white group-hover:border-foreground/40"
          }
        `}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <span
        className={`
          transition-colors duration-100 leading-snug
          ${checked ? "text-foreground/40 line-through" : "text-foreground/80"}
          ${!disabled && !checked ? "group-hover:text-foreground" : ""}
        `}
      >
        {children}
      </span>
    </button>
  );
}

// Big confetti burst from behind the card
const CONFETTI_COLORS = ["#E67E22", "#F39C12", "#3498DB", "#9B59B6", "#1ABC9C", "#E74C3C", "#2ECC71"];

function BigConfettiBurst() {
  const particles = Array.from({ length: 70 }, (_, i) => {
    const angle = Math.random() * 360;
    const distance = 350 + Math.random() * 250;

    const finalX = Math.cos((angle * Math.PI) / 180) * distance;
    const peakY = -180 - Math.random() * 200;
    const finalY = 280 + Math.random() * 150;

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const width = 10 + Math.random() * 12;
    const height = width * (0.4 + Math.random() * 0.4);
    const rotateEnd = (Math.random() - 0.5) * 1080;
    const delay = Math.random() * 0.12;

    return { finalX, peakY, finalY, color, width, height, rotateEnd, delay };
  });

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ overflow: "visible" }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-[1px]"
          style={{
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            marginLeft: -p.width / 2,
            marginTop: -p.height / 2,
            transformOrigin: "center",
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0, rotateX: 0 }}
          animate={{
            x: [0, p.finalX],
            y: [0, p.peakY, p.finalY],
            scale: [0, 1, 1],
            opacity: [1, 1, 0],
            rotate: p.rotateEnd,
            rotateX: 360,
          }}
          exit={{ opacity: 0 }}
          transition={{
            delay: p.delay,
            x: { duration: 3, ease: "easeOut" },
            y: { duration: 3, times: [0, 0.35, 1], ease: "easeInOut" },
            scale: { duration: 3, times: [0, 0.15, 1] },
            opacity: { duration: 3, times: [0, 0.7, 1] },
            rotate: { duration: 3, ease: "linear" },
            rotateX: { duration: 3, ease: "linear" },
          }}
        />
      ))}
    </div>
  );
}
