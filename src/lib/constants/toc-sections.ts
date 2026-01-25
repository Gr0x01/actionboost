/**
 * Shared TOC section definitions for results and blog pages.
 */

export interface TOCSection {
  id: string;
  label: string;
  shortLabel: string;
}

/**
 * Sections for strategy results pages (10 sections).
 * Used by: /results/[runId], /free-results/[id], /results/demo, /share/[slug]
 */
export const STRATEGY_SECTIONS: TOCSection[] = [
  { id: "executive-summary", label: "Executive Summary", shortLabel: "Summary" },
  { id: "current-situation", label: "Your Situation", shortLabel: "Situation" },
  { id: "competitive-landscape", label: "Competition", shortLabel: "Competition" },
  { id: "channel-strategy", label: "Channel Strategy", shortLabel: "Channels" },
  { id: "stop-doing", label: "Stop Doing", shortLabel: "Stop" },
  { id: "start-doing", label: "Start Doing", shortLabel: "Start" },
  { id: "this-week", label: "This Week", shortLabel: "This Week" },
  { id: "roadmap", label: "30-Day Roadmap", shortLabel: "Roadmap" },
  { id: "metrics-dashboard", label: "Metrics Dashboard", shortLabel: "Metrics" },
  { id: "content-templates", label: "Content Templates", shortLabel: "Templates" },
];

/**
 * Sections for the growth plan blog post (13 sections).
 * Used by: /blog/our-growth-plan
 */
export const BLOG_SECTIONS: TOCSection[] = [
  { id: "executive-summary", label: "Executive Summary", shortLabel: "Summary" },
  { id: "1-target-audience-analysis", label: "Target Audience", shortLabel: "Audience" },
  { id: "2-positioning-and-differentiation", label: "Positioning", shortLabel: "Positioning" },
  { id: "3-acquisition-channels-and-tactics", label: "Acquisition", shortLabel: "Acquisition" },
  { id: "4-activation-optimization", label: "Activation", shortLabel: "Activation" },
  { id: "5-retention-strategies", label: "Retention", shortLabel: "Retention" },
  { id: "6-referral-mechanics", label: "Referral", shortLabel: "Referral" },
  { id: "7-monetization-path", label: "Monetization", shortLabel: "Revenue" },
  { id: "8-quick-wins-vs-long-term-plays", label: "Quick Wins", shortLabel: "Quick Wins" },
  { id: "9-metrics-to-track", label: "Metrics", shortLabel: "Metrics" },
  { id: "10-90-day-roadmap", label: "90-Day Roadmap", shortLabel: "Roadmap" },
  { id: "11-solo-developer-execution-guide", label: "Solo Dev Guide", shortLabel: "Solo Dev" },
  { id: "12-risks-and-mitigations", label: "Risks", shortLabel: "Risks" },
];

/**
 * Section IDs that are locked (not shown) in the free tier.
 * These sections require a paid run to access.
 */
export const FREE_TIER_LOCKED_SECTIONS = [
  "channel-strategy",
  "stop-doing",
  "start-doing",
  "this-week",
  "roadmap",
  "metrics-dashboard",
  "content-templates",
];

/**
 * Sections for the marketing plan guide page (6 sections).
 * Used by: /marketing-plan-guide
 */
export const GUIDE_SECTIONS: TOCSection[] = [
  { id: "what-to-include", label: "What to Include", shortLabel: "Include" },
  { id: "why-plans-fail", label: "Why Plans Fail", shortLabel: "Fail" },
  { id: "competitor-research", label: "Competitor Research", shortLabel: "Research" },
  { id: "stop-start-continue", label: "Stop/Start/Continue", shortLabel: "Framework" },
  { id: "30-day-roadmap", label: "30-Day Roadmap", shortLabel: "Roadmap" },
  { id: "real-examples", label: "Real Examples", shortLabel: "Examples" },
];
