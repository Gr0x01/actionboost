"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Business type content - positioning-first approach
// Priority order: SaaS/tech → E-commerce → Service businesses (per Jan 24 pivot)
const BUSINESS_TYPES = {
  saas: {
    label: "SaaS Product",
    positioning: {
      verdict: "needs-work" as const,
      summary: "You're positioned as generic 'project management for teams' but your unique async-first workflow could own the remote team niche. Lead with the differentiator.",
      differentiator: "Async-first workflow, built for remote",
      targetSegment: "Remote-first teams tired of sync meetings",
    },
    discovery: {
      title: "Your top competitor spends $47K/mo on 'project management' keywords",
      type: "competitive_intel",
      content: "They're winning broad terms you can't afford. But 'async project management' and 'remote team workflow' have 4K monthly searches with almost no competition.",
      source: "Ahrefs keyword analysis + ad spend data",
      significance: "You're fighting the wrong battle. Own the niche first.",
    },
    sources: ["google-analytics", "hubspot", "linkedin", "youtube"],
  },
  ecommerce: {
    label: "E-commerce",
    positioning: {
      verdict: "unclear" as const,
      summary: "You're selling 'premium skincare' in a sea of premium skincare. Your ingredient transparency and cruelty-free testing could differentiate — but it's buried in the footer.",
      differentiator: "Full ingredient transparency, cruelty-free",
      targetSegment: "Clean beauty enthusiasts, 25-40, who read labels",
    },
    discovery: {
      title: "3 competitors get 40% of traffic from TikTok Shop",
      type: "pattern",
      content: "They're not running ads — they're doing live shopping events 2x/week. Average order value from TikTok is 23% higher than their website.",
      source: "SimilarWeb + TikTok Shop analysis",
      significance: "The channel shift already happened. You're late but not too late.",
    },
    sources: ["google-analytics", "tiktok", "instagram", "mailchimp"],
  },
  agency: {
    label: "Agency",
    positioning: {
      verdict: "clear" as const,
      summary: "Your 'conversion-focused design for B2B SaaS' positioning is tight. Nobody else in your price range is this specific. Now you need to be findable.",
      differentiator: "B2B SaaS focus, conversion expertise",
      targetSegment: "B2B SaaS startups, Series A-B, $2-10M ARR",
    },
    discovery: {
      title: "Top 5 agencies in your space all run a weekly newsletter",
      type: "competitive_intel",
      content: "They're building audiences while you chase cold leads. The agencies with newsletters close 3x more inbound deals and charge 40% higher rates.",
      source: "LinkedIn + competitor content analysis",
      significance: "Content is the new cold outreach. You're leaving money on the table.",
    },
    sources: ["linkedin", "google-analytics", "hubspot", "youtube"],
  },
  consultant: {
    label: "Consultant",
    positioning: {
      verdict: "needs-work" as const,
      summary: "Your coaching framework is unique, but it's buried. Lead with 'From overwhelmed founder to 3-day workweek' — not 'business coaching services'.",
      differentiator: "Proven framework, undersold outcome",
      targetSegment: "Burned-out founders ready to work less",
    },
    discovery: {
      title: "Your ICP is asking questions in r/Entrepreneur daily",
      type: "opportunity",
      content: "47 posts this month asking about 'scaling without burning out' or 'founder time management'. These are perfect-fit prospects actively seeking help.",
      source: "Reddit research + sentiment analysis",
      significance: "Your customers are assembled and asking. Go answer them.",
    },
    sources: ["linkedin", "google-analytics", "hubspot", "youtube"],
  },
  shopify: {
    label: "Shopify Store",
    positioning: {
      verdict: "clear" as const,
      summary: "Your 'sustainable pet supplies' niche is well-defined. Eco-conscious pet parents are a real and growing segment. You just need more of them to find you.",
      differentiator: "Sustainable materials, eco-conscious pet parents",
      targetSegment: "Urban millennials who treat pets like family",
    },
    discovery: {
      title: "Pinterest drives 34% of competitor traffic (you're not on it)",
      type: "opportunity",
      content: "'Eco-friendly dog toys' and 'sustainable pet products' pins get 15K saves/month. This audience researches on Pinterest before buying on Shopify.",
      source: "Pinterest Trends + competitor traffic analysis",
      significance: "You're invisible on the platform where your customers browse.",
    },
    sources: ["google-analytics", "pinterest", "instagram", "mailchimp"],
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

// Verdict styles - matching PositioningSummaryV2
function getVerdictStyle(verdict: "clear" | "needs-work" | "unclear") {
  switch (verdict) {
    case "clear":
      return { word: "Sharp.", subtitle: "Your positioning is clear" };
    case "needs-work":
      return { word: "Close.", subtitle: "Room to sharpen" };
    case "unclear":
      return { word: "Fuzzy.", subtitle: "Needs more clarity" };
  }
}

// Discovery type display - matching actual dashboard
function formatDiscoveryType(type: string) {
  return type.replace(/_/g, " ").toUpperCase();
}

interface HeroSummaryCardProps {
  visible: boolean;
}

export function HeroSummaryCard({ visible }: HeroSummaryCardProps) {
  const [selectedType, setSelectedType] = useState<BusinessType>("saas");
  const businessData = BUSINESS_TYPES[selectedType];
  const verdictStyle = getVerdictStyle(businessData.positioning.verdict);

  if (!visible) return null;

  return (
    <motion.div
      className="relative max-w-4xl mx-auto overflow-visible"
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* The card - SOFT BRUTALIST */}
      <div
        className="relative z-10 bg-white border-2 border-foreground/20 rounded-xl overflow-hidden"
        style={{
          boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)",
        }}
      >
        {/* Header with business type selector */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-foreground/10">
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* === POSITIONING SECTION - matching PositioningSummaryV2 === */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:gap-6">
              {/* Left: Verdict + Summary */}
              <div className="flex-1">
                {/* Section label */}
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/40 block mb-2">
                  Your Positioning
                </span>

                {/* Verdict header - exact match */}
                <div className="flex items-baseline gap-2 flex-wrap mb-4">
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    {verdictStyle.word}
                  </span>
                  <span className="text-base text-foreground/60 font-medium">
                    {verdictStyle.subtitle}
                  </span>
                </div>

                {/* Summary - matching font-serif, no italic, no quotes */}
                <p className="text-base font-serif text-foreground leading-relaxed">
                  {businessData.positioning.summary}
                </p>
              </div>

              {/* Right: Sidebar - matching insight style */}
              <div className="mt-4 md:mt-0 md:w-56 shrink-0 md:border-l md:border-foreground/10 md:pl-6">
                {/* What makes you different */}
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/50 block mb-2">
                  What makes you different
                </span>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {businessData.positioning.differentiator}
                </p>

                {/* Who you serve best */}
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/50 block mb-2 mt-5">
                  Who you serve best
                </span>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {businessData.positioning.targetSegment}
                </p>
              </div>
            </div>
          </div>

          {/* === KEY DISCOVERY - matching LeadDiscovery === */}
          <div className="mb-5">
            {/* Section label */}
            <span className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/40 mb-3">
              Key Discovery
            </span>

            {/* Discovery card - matching LeadDiscovery styling */}
            <div
              className="bg-background border-2 border-foreground/20 rounded-md p-4 sm:p-5 relative"
              style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
            >
              {/* Type badge - inline on mobile, absolute on desktop */}
              <span className="sm:absolute sm:top-3 sm:right-3 inline-block sm:inline mb-2 sm:mb-0 font-mono text-[9px] uppercase tracking-wider text-foreground/30 bg-surface px-2 py-0.5 rounded">
                {formatDiscoveryType(businessData.discovery.type)}
              </span>

              {/* Title - full width on mobile, room for badge on desktop */}
              <h4 className="text-base font-bold text-foreground leading-tight sm:pr-36">
                {businessData.discovery.title}
              </h4>

              {/* Content */}
              <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
                {businessData.discovery.content}
              </p>

              {/* Footer - source + significance */}
              <div className="mt-4 pt-3 border-t border-foreground/10">
                <cite className="block text-xs text-foreground/50 italic mb-1 not-italic">
                  {businessData.discovery.source}
                </cite>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  <span className="font-medium text-foreground/70">Why it matters:</span>{" "}
                  {businessData.discovery.significance}
                </p>
              </div>
            </div>
          </div>

          {/* === SOURCES - condensed footer === */}
          <div className="pt-4 border-t border-foreground/10 flex items-center justify-end gap-2">
            <span className="text-xs font-medium text-foreground/50">Built from:</span>
            {businessData.sources.map((source) => (
              <div
                key={source}
                className="w-5 h-5 rounded bg-white border border-foreground/10 flex items-center justify-center"
                title={source}
              >
                <Image
                  src={SOURCE_LOGOS[source]}
                  alt=""
                  width={12}
                  height={12}
                  className="w-3 h-3"
                />
              </div>
            ))}
            <span className="text-xs font-semibold text-foreground/30">+8</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
