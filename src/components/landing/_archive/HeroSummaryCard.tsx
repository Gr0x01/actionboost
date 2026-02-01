"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Real businesses with real Boost reports
// These link to actual companies and full reports on /in-action
const BUSINESS_TYPES = {
  cheft: {
    label: "Cheft",
    url: "https://cheft.app",
    inActionSlug: "cheft",
    positioning: {
      verdict: "clear" as const,
      summary: "You own the gap between watching a chef on TV and figuring out where to actually eat their food. Narrow but defensible — and nobody else is there.",
      differentiator: "Comprehensive database across Top Chef, Tournament of Champions, Chef's Table",
      targetSegment: "Food enthusiasts who watch cooking shows and want to eat at the restaurants",
    },
    discovery: {
      title: "r/BravoTopChef sidebar has a resource link — get added for permanent passive traffic",
      type: "opportunity",
      content: "The subreddit sidebar has a 'Contestant Restaurant List' resource section. Getting your site added would provide permanent passive traffic from engaged users who already want exactly what you built.",
      source: "Reddit community analysis",
      significance: "One outreach message to moderators could unlock consistent traffic from your core audience.",
    },
    sources: ["google-analytics", "youtube", "instagram", "hubspot"],
  },
  inkdex: {
    label: "Inkdex",
    url: "https://inkdex.io",
    inActionSlug: "inkdex",
    positioning: {
      verdict: "needs-work" as const,
      summary: "Your visual search is genuinely differentiated — but 'find tattoo artists' positioning undersells it. Lead with what makes you the only: upload any image, find artists who work in that exact style.",
      differentiator: "Visual search — find artists by uploading reference images",
      targetSegment: "People with a specific tattoo vision ready to book, not browse",
    },
    discovery: {
      title: "Pinterest is where people PLAN tattoos. Reddit is where they BROWSE.",
      type: "pattern",
      content: "Your Reddit ad experiment got exposure but minimal conversions. Meanwhile, Pinterest has thousands of monthly saves on tattoo style searches — high-intent users actively planning. You're invisible there.",
      source: "Traffic analysis + Pinterest Trends",
      significance: "You're spending on channels that can't convert while ignoring where your customers actually plan.",
    },
    sources: ["google-analytics", "pinterest", "instagram", "youtube"],
  },
  tripledmap: {
    label: "Tripledmap",
    url: "https://tripledmap.com",
    inActionSlug: "tripledmap",
    positioning: {
      verdict: "clear" as const,
      summary: "You're the only DDD directory with true route planning and verified-open status. That second part is the differentiator — fans hate driving 200 miles to a closed restaurant.",
      differentiator: "Route planner + real-time open/closed tracking for 1,540+ restaurants",
      targetSegment: "RV travelers and DDD superfans planning multi-stop food trips",
    },
    discovery: {
      title: "RV LIFE Pro affiliate found — 25% commission, 180-day cookie, perfect audience fit",
      type: "opportunity",
      content: "RV LIFE Pro offers 25% commission with a 180-day cookie window. Your road trip planning audience aligns perfectly with their RV traveler customer base.",
      source: "Monetization research",
      significance: "Non-spammy revenue that actually serves your users instead of annoying them.",
    },
    sources: ["google-analytics", "pinterest", "youtube", "mailchimp"],
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
  const [selectedType, setSelectedType] = useState<BusinessType>("cheft");
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
        {/* Header with real business tabs */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-foreground/10">
          <div className="flex flex-wrap gap-2">
            {BUSINESS_KEYS.map((key) => (
              <a
                key={key}
                href={BUSINESS_TYPES[key].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  // Left click selects tab, doesn't navigate
                  // Right click / cmd+click still opens link
                  if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                    e.preventDefault();
                    setSelectedType(key);
                  }
                }}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-100 cursor-pointer
                  ${selectedType === key
                    ? "bg-foreground text-white shadow-sm"
                    : "bg-foreground/5 text-foreground/60 border border-foreground/15 hover:border-foreground/30 hover:text-foreground"
                  }
                `}
                title={`Click to view report • Cmd+click to visit ${BUSINESS_TYPES[key].label}`}
              >
                {BUSINESS_TYPES[key].label}
              </a>
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

            {/* Discovery card - highlighted with CTA border */}
            <div
              className="bg-white border-2 border-cta/60 rounded-md p-4 sm:p-5 relative"
              style={{ boxShadow: "4px 4px 0 rgba(230, 126, 34, 0.15)" }}
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

          {/* === FOOTER - link to full report === */}
          <div className="pt-4 border-t border-foreground/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-foreground/50">Built from:</span>
              <div className="flex items-center gap-1">
                {businessData.sources.slice(0, 4).map((source) => (
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
                <span className="text-xs font-medium text-foreground/30 ml-0.5">+8</span>
              </div>
            </div>
            <Link
              href={`/in-action/${businessData.inActionSlug}`}
              className="text-xs font-semibold text-cta hover:underline"
            >
              See full report &rarr;
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
