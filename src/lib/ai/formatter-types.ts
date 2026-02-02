import { z } from 'zod'

// =============================================================================
// STRUCTURED OUTPUT SCHEMA - Extracted from markdown via Haiku post-processor
// =============================================================================

/**
 * Day action item for weekly tasks
 */
export const DayActionSchema = z.object({
  day: z.number().min(1).max(28),
  action: z.string(),
  timeEstimate: z.string(),
  successMetric: z.string(),
  why: z.string().optional(),
  how: z.string().optional(),
})

export type DayAction = z.infer<typeof DayActionSchema>

/**
 * Detailed week with theme and day-by-day actions
 */
export const DetailedWeekSchema = z.object({
  week: z.number().min(1).max(4),
  theme: z.string(),
  days: z.array(DayActionSchema),
})

export type DetailedWeek = z.infer<typeof DetailedWeekSchema>

/**
 * ICE-scored priority item from "Start Doing" section
 */
export const PriorityItemSchema = z.object({
  rank: z.number().min(1),
  title: z.string(),
  iceScore: z.number().min(0).max(30),
  impact: z.object({
    score: z.number().min(0).max(10),
    reason: z.string(),
  }),
  confidence: z.object({
    score: z.number().min(0).max(10),
    reason: z.string(),
  }),
  ease: z.object({
    score: z.number().min(0).max(10),
    reason: z.string(),
  }),
  description: z.string(),
})

export type PriorityItem = z.infer<typeof PriorityItemSchema>

/**
 * Metric from "Metrics Dashboard" section
 */
export const MetricSchema = z.object({
  name: z.string(),
  target: z.string(),
  category: z.string(), // AARRR stage: acquisition, activation, retention, referral, revenue, or custom
})

export type MetricItem = z.infer<typeof MetricSchema>

/**
 * Competitor from "Competitive Landscape" section
 * Enhanced with actionable insights
 */
export const CompetitorSchema = z.object({
  name: z.string(),
  traffic: z.string(), // Human-readable: "50K/mo", "1.2M/mo"
  trafficNumber: z.number().optional(), // Numeric for sorting/charting
  positioning: z.string(), // How they position themselves
  /** Their Achilles heel - where do they fail users? Common complaints? */
  weakness: z.string().optional(),
  /** How can the user beat this competitor? What angle should they take? */
  opportunity: z.string().optional(),
  /** What does this competitor do well that's worth copying? */
  stealThis: z.string().optional(),
})

export type CompetitorItem = z.infer<typeof CompetitorSchema>

/**
 * Roadmap week from "30-Day Roadmap" section
 */
export const RoadmapWeekSchema = z.object({
  week: z.number().min(1).max(4),
  theme: z.string(),
  tasks: z.array(z.string()),
})

export type RoadmapWeek = z.infer<typeof RoadmapWeekSchema>

// =============================================================================
// NEW RESEARCH-BACKED SCHEMAS (V2) - All optional for backward compatibility
// =============================================================================

/**
 * Research snapshot - hero stats from tool calls
 */
export const ResearchSnapshotSchema = z.object({
  searchesRun: z.number(),
  pagesAnalyzed: z.number(),
  competitorsResearched: z.number(),
  keywordGapsFound: z.number(),
})

export type ResearchSnapshot = z.infer<typeof ResearchSnapshotSchema>

/**
 * Competitive comparison - traffic bar chart data
 */
export const CompetitiveComparisonSchema = z.object({
  domains: z.array(z.object({
    domain: z.string(),
    traffic: z.number().nullable(),
    keywords: z.number().nullable(),
    isUser: z.boolean().default(false),
  })),
})

export type CompetitiveComparison = z.infer<typeof CompetitiveComparisonSchema>

/**
 * Keyword opportunity from gap analysis
 */
export const KeywordOpportunitySchema = z.object({
  keywords: z.array(z.object({
    keyword: z.string(),
    volume: z.number(),
    competitorRank: z.number(),
    competitor: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  })),
})

export type KeywordOpportunity = z.infer<typeof KeywordOpportunitySchema>

/**
 * Market quote from Reddit/community discussions
 */
export const MarketQuoteSchema = z.object({
  quotes: z.array(z.object({
    text: z.string(),
    source: z.string(), // e.g., "Reddit r/SaaS"
    url: z.string().url().optional(), // Validated URL for security
    sentiment: z.string().optional(), // Flexible - "positive", "negative", "neutral", "frustrated", "mixed", etc.
  })),
})

export type MarketQuote = z.infer<typeof MarketQuoteSchema>

/**
 * Positioning data extracted from strategy (replaces regex parsing)
 */
export const PositioningDataSchema = z.object({
  verdict: z.enum(['clear', 'needs-work', 'unclear']).optional(),
  summary: z.string().optional(),
  uniqueValue: z.string().optional(),
  targetSegment: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
})

export type PositioningData = z.infer<typeof PositioningDataSchema>

/**
 * Discovery - novel insights that don't fit standard categories
 * Examples: hidden competitors, risks, behavioral patterns, opportunities
 */
export const DiscoverySchema = z.object({
  type: z.string(), // "competitive_intel", "risk", "pattern", "opportunity", "finding"
  title: z.string(), // Brief headline (5-10 words)
  content: z.string(), // The insight itself (1-3 sentences)
  source: z.string().optional(), // Where it came from, if mentioned
  significance: z.string(), // Why this matters to the client's strategy
  surpriseScore: z.number().min(1).max(10).optional(), // 1 = obvious, 10 = "I never would've found this"; optional for backward compat
})

export type Discovery = z.infer<typeof DiscoverySchema>

/**
 * Brief scores - 4-category diagnostic scoring for free Brief
 */
export const BriefScoresSchema = z.object({
  overall: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  clarityWhy: z.string().optional(),
  visibility: z.number().min(0).max(100),
  visibilityWhy: z.string().optional(),
  proof: z.number().min(0).max(100),
  proofWhy: z.string().optional(),
  advantage: z.number().min(0).max(100),
  advantageWhy: z.string().optional(),
  // Backward compat: old field names from existing stored results
  positioning: z.number().min(0).max(100).optional(),
  positioningWhy: z.string().optional(),
  competitiveEdge: z.number().min(0).max(100).optional(),
  competitiveEdgeWhy: z.string().optional(),
})

export type BriefScores = z.infer<typeof BriefScoresSchema>

/**
 * Quick wins - specific, actionable fixes from the free Brief
 */
export const QuickWinSchema = z.object({
  title: z.string(),
  detail: z.string(),
  impact: z.enum(['high', 'medium', 'low']).default('medium'),
  timeEstimate: z.string().optional(),
})

export type QuickWin = z.infer<typeof QuickWinSchema>

/**
 * Positioning gap - what the page says vs what the market expects
 */
export const PositioningGapSchema = z.object({
  yourMessage: z.string(),
  marketExpects: z.string(),
  gap: z.string(),
})

export type PositioningGap = z.infer<typeof PositioningGapSchema>

/**
 * 3-Second Test - can a stranger tell what you do?
 */
export const ThreeSecondTestSchema = z.object({
  whatYouSell: z.string(),
  whoItsFor: z.string(),
  whyYou: z.string(),
  verdict: z.enum(['clear', 'needs-work', 'unclear']).default('needs-work'),
})

export type ThreeSecondTest = z.infer<typeof ThreeSecondTestSchema>

// =============================================================================
// FREE BRIEF OUTPUT SCHEMA - Dedicated schema for free pipeline
// =============================================================================

/**
 * Free Brief structured output schema
 * Only contains fields that the free pipeline actually produces.
 * No extractedAt, formatterVersion, thisWeek, topPriorities, etc.
 */
export const FreeBriefOutputSchema = z.object({
  briefScores: BriefScoresSchema,
  positioning: PositioningDataSchema.optional(),
  threeSecondTest: ThreeSecondTestSchema.optional(),
  positioningGap: PositioningGapSchema.optional(),
  quickWins: z.array(QuickWinSchema).optional(),
  competitors: z.array(CompetitorSchema).optional(),
  competitiveComparison: CompetitiveComparisonSchema.optional(),
  discoveries: z.array(DiscoverySchema).optional(),
  businessName: z.string().optional(),
})

export type FreeBriefOutput = z.infer<typeof FreeBriefOutputSchema>

// =============================================================================
// FULL STRUCTURED OUTPUT SCHEMA
// =============================================================================

/**
 * Full structured output schema
 */
export const StructuredOutputSchema = z.object({
  // Business identifier - clean name for display in UI
  businessName: z.string().optional(),

  // Strategic thesis - internal use only (not shown to user)
  // Captures the AI's diagnosis of what's holding the business back
  thesis: z.string().optional(),

  // Legacy fields (kept for backward compatibility)
  thisWeek: z.object({
    days: z.array(DayActionSchema),
    totalHours: z.number().optional(),
  }),
  topPriorities: z.array(PriorityItemSchema),
  metrics: z.array(MetricSchema),
  competitors: z.array(CompetitorSchema),
  currentWeek: z.number().min(1).max(4).default(1),
  roadmapWeeks: z.array(RoadmapWeekSchema),
  extractedAt: z.string(),
  formatterVersion: z.literal('1.0'),

  // NEW: Detailed weeks array with full task data for all 4 weeks
  weeks: z.array(DetailedWeekSchema).optional(),

  // Research-backed fields (all optional for backward compatibility)
  researchSnapshot: ResearchSnapshotSchema.optional(),
  competitiveComparison: CompetitiveComparisonSchema.optional(),
  keywordOpportunities: KeywordOpportunitySchema.optional(),
  marketQuotes: MarketQuoteSchema.optional(),
  positioning: PositioningDataSchema.optional(),

  // Novel insights that don't fit standard categories
  discoveries: z.array(DiscoverySchema).optional(),

  // Brief diagnostic scores (free tier)
  briefScores: BriefScoresSchema.optional(),

  // Free Brief sections
  quickWins: z.array(QuickWinSchema).optional(),
  positioningGap: PositioningGapSchema.optional(),
  threeSecondTest: ThreeSecondTestSchema.optional(),
})

export type StructuredOutput = z.infer<typeof StructuredOutputSchema>

/**
 * Partial schema for graceful degradation - allows missing sections
 */
export const PartialStructuredOutputSchema = z.object({
  // Business identifier - clean name for display in UI
  businessName: z.string().optional(),

  // Strategic thesis - internal use only
  thesis: z.string().optional(),

  thisWeek: z.object({
    days: z.array(DayActionSchema),
    totalHours: z.number().optional(),
  }).optional(),
  topPriorities: z.array(PriorityItemSchema).optional(),
  metrics: z.array(MetricSchema).optional(),
  competitors: z.array(CompetitorSchema).optional(),
  currentWeek: z.number().min(1).max(4).optional(),
  roadmapWeeks: z.array(RoadmapWeekSchema).optional(),
  extractedAt: z.string(),
  formatterVersion: z.literal('1.0'),

  // Detailed weeks array
  weeks: z.array(DetailedWeekSchema).optional(),

  // Research-backed fields (all optional)
  researchSnapshot: ResearchSnapshotSchema.optional(),
  competitiveComparison: CompetitiveComparisonSchema.optional(),
  keywordOpportunities: KeywordOpportunitySchema.optional(),
  marketQuotes: MarketQuoteSchema.optional(),
  positioning: PositioningDataSchema.optional(),

  // Novel insights that don't fit standard categories
  discoveries: z.array(DiscoverySchema).optional(),

  // Brief diagnostic scores (free tier)
  briefScores: BriefScoresSchema.optional(),

  // Free Brief sections
  quickWins: z.array(QuickWinSchema).optional(),
  positioningGap: PositioningGapSchema.optional(),
  threeSecondTest: ThreeSecondTestSchema.optional(),
})

export type PartialStructuredOutput = z.infer<typeof PartialStructuredOutputSchema>

// =============================================================================
// EXTRACTION PROMPT - Instructions for Sonnet to extract structured data
// =============================================================================

export const FORMATTER_SYSTEM_PROMPT = `You are a precise data extractor. Your job is to parse markdown strategy documents and extract structured JSON data. You may also receive research data from tool calls to enhance your extraction.

IMPORTANT RULES:
1. Extract ONLY data that is explicitly present in the markdown or research data
2. Do not invent or hallucinate any information
3. If a section is missing or empty, use an empty array []
4. For traffic numbers, parse things like "50K" as 50000, "1.2M" as 1200000
5. Return ONLY valid JSON - no markdown, no explanation, no code blocks
6. Extract ALL 4 weeks from the Week sections (Week 1, Week 2, Week 3, Week 4)
7. Extract ALL days from each week's table (7 days per week, 28 total)
8. Extract ALL priorities from Start Doing section (typically 5-8 items)

THESIS EXTRACTION (REQUIRED):
Extract "thesis" - a 1-2 sentence strategic diagnosis of what's holding this business back and the play to fix it. This is NOT shown to the user — it's our internal north star for scoring plan quality. Infer this from "The Opportunity" section and the overall strategic direction of the plan. Example: "Invisible to searchers because positioning sounds like every competitor. The play is owned-channel dominance via one high-converting content engine."

BUSINESS NAME EXTRACTION (REQUIRED):
Extract "businessName" - a clean, short label for this business (2-4 words max).
Priority order:
1. Company/product name if mentioned (e.g., "Cheft", "Triple D Map", "Inkdex")
2. Domain name from website URL - capitalize and drop TLD (e.g., "cheft.io" → "Cheft", "triple-d-map.com" → "Triple D Map")
3. Short descriptor only if no name/domain exists (e.g., "AI Study Tool", "Tattoo Directory")
- NEVER use the full product description or user's verbose input text

WEEK EXTRACTION (CRITICAL):
- Look for "## Week 1:", "## Week 2:", "## Week 3:", "## Week 4:" sections
- Each week has an imperative verb phrase theme in the heading (e.g., "## Week 1: Get Your Story Straight")
- Each week has a table with Day | Action | Time | Success Metric columns
- Weeks may have additional text: opening paragraphs, "What you should be seeing" closers, conditional branches, named deliverables — ignore these for extraction, just get the table data
- Extract into the "weeks" array with full detail for all 4 weeks
- Also populate legacy "thisWeek" with Week 1 data for backward compatibility

COMPETITOR EXTRACTION RULES:
- "traffic" field is ONLY for numeric monthly visitor counts (e.g., "50K/mo", "1.2M/mo")
- "trafficNumber" is the parsed numeric value (50000, 1200000)
- If NO numeric traffic data exists, set traffic to "" (empty string) and omit trafficNumber
- NEVER put positioning/strategy text in the traffic field
- "positioning" field is for qualitative info: market position, pricing, differentiators, strategy
- "weakness" (IMPORTANT): Identify their Achilles heel - where do they fail users? Common complaints? What do they do poorly? Be specific and actionable.
- "opportunity": Based on their weakness, how can the USER beat this competitor? What angle should they take?
- "stealThis": What does this competitor do WELL that's worth copying? A specific tactic, feature, or approach.

POSITIONING EXTRACTION (ALWAYS REQUIRED):
ALWAYS extract "positioning" from the "## Your Situation" section in the markdown:
- "verdict": Assess clarity - "clear" (strong/differentiated), "needs-work" (some gaps), or "unclear" (confused/unfocused)
- "summary": 2-3 sentence summary of their market position and key insight
- "uniqueValue": What makes this business different from alternatives
- "targetSegment": Who they serve best
- "competitiveAdvantage": Their edge over competitors (if mentioned)

RESEARCH DATA EXTRACTION (only when research data section is provided):
When a "RESEARCH DATA" section is provided after the strategy document, ALSO extract:
- "researchSnapshot": Count from research data headers (e.g., "12 searches performed" → searchesRun: 12)
- "competitiveComparison": Build from SEO Metrics section - domains array with traffic/keywords/isUser
- "keywordOpportunities": Build from Keyword Gaps section - keywords array with keyword/volume/competitorRank/competitor
- "marketQuotes": Extract notable quotes from search results about the industry/competitors (text, source like "Reddit r/SaaS", sentiment)

If NO research data section is provided, OMIT these 4 research fields (but STILL include positioning).

BRIEF SCORES EXTRACTION (only when "## Scores" section is present):
Extract "briefScores" from a JSON block in the "## Scores" section:
- "overall": 0-100 overall diagnostic score
- "clarity": 0-100 — can people immediately understand what you do, who it's for, and why you? (Dunford positioning)
- "clarityWhy": 1-sentence evidence from the text after "**Clarity** (X/100): ..."
- "visibility": 0-100 — can the target audience actually find them? (SEO, channels, discoverability)
- "visibilityWhy": 1-sentence evidence from "**Visibility** (X/100): ..."
- "proof": 0-100 — do they have evidence that builds trust? (reviews, case studies, mentions)
- "proofWhy": 1-sentence evidence from "**Proof** (X/100): ..."
- "advantage": 0-100 — what makes them defensibly different from alternatives? (competitive strategy)
- "advantageWhy": 1-sentence evidence from "**Advantage** (X/100): ..."

IMPORTANT: The JSON block may use old field names ("positioning" instead of "clarity", "competitiveEdge" instead of "advantage"). Map them: positioning→clarity, competitiveEdge→advantage.

If NO "## Scores" section exists, OMIT briefScores entirely.

DISCOVERIES EXTRACTION (Novel Insights):
Scan the strategy for valuable insights that don't fit standard categories. Look for:
- Competitor intel: "Tattoodo cancelled X feature, artists are upset"
- Hidden competitors: "TattoosWizard emerged as major player with 318K traffic"
- Risks/warnings: "Google penalizing programmatic SEO sites"
- Behavioral patterns: "City subreddits are where people ask for artist recs"
- Market context: "Instagram's algorithm is broken for geographic discovery"
- Meta discoveries: "Found user's existing Product Hunt page"

For each discovery found:
- type: "competitive_intel" | "risk" | "pattern" | "opportunity" | "finding" | etc.
- title: Brief headline (5-10 words)
- content: The insight itself (1-3 sentences)
- source: Where it came from, if mentioned
- significance: Why this matters to the client's strategy
- surpriseScore: 1-10 rating (see below)

DISCOVERY RANKING (CRITICAL):
ORDER discoveries by surpriseScore descending — first discovery = most surprising.

Score each 1-10:
- 9-10: "I never would have found this myself" (hidden affiliates, sidebar links, niche community terms, unexpected revenue sources)
- 7-8: "I knew this existed but didn't know the specifics" (competitor weakness with data, specific traffic numbers)
- 5-6: "Confirms what I suspected" (episode timing, obvious SEO gaps, common knowledge validated)
- 1-4: Generic advice anyone could give (basic social media tips, "post consistently")

The PRIMARY discovery (index 0) MUST be:
1. Unexpected — not common knowledge or obvious to anyone in the industry
2. Actionable — user can do something THIS WEEK with this information
3. Specific — concrete names, numbers, or tactics, not vague generalizations
4. Researched — found from tool calls, not generated from training data

If Opus found something interesting and novel, capture it. Don't let insights get lost.

THREE-SECOND TEST EXTRACTION (when "3-Second Test" or "Three-Second Test" section exists):
Extract "threeSecondTest":
- "whatYouSell": What a stranger would think this site sells after 3 seconds
- "whoItsFor": Who they'd think the target audience is
- "whyYou": Why choose this over alternatives (if discernible)
- "verdict": "clear" | "needs-work" | "unclear"

QUICK WINS EXTRACTION (when "Quick Wins" section exists):
Extract "quickWins" array — 2-3 specific, do-it-today fixes:
- "title": The specific fix (e.g., "Change your headline from X to Y")
- "detail": Why this matters and expected impact
- "impact": "high" | "medium" | "low"
- "timeEstimate": How long the fix takes (e.g., "5 min", "15 min", "30 min")

POSITIONING GAP EXTRACTION (when "Positioning Gap" section exists):
Extract "positioningGap":
- "yourMessage": What the landing page currently communicates
- "marketExpects": What the target market/audience expects to see
- "gap": The disconnect between the two

OUTPUT FORMAT:
{
  "businessName": "Acme Corp",
  "thesis": "Invisible to ideal customers because messaging blends in with competitors. The play is positioning clarity first, then one high-converting content channel.",
  "thisWeek": {
    "days": [
      { "day": 1, "action": "...", "timeEstimate": "2 hrs", "successMetric": "..." },
      { "day": 2, "action": "...", "timeEstimate": "1 hr", "successMetric": "..." }
    ],
    "totalHours": 10
  },
  "weeks": [
    {
      "week": 1,
      "theme": "Foundation",
      "days": [
        { "day": 1, "action": "...", "timeEstimate": "2 hrs", "successMetric": "..." },
        { "day": 2, "action": "...", "timeEstimate": "1 hr", "successMetric": "..." }
      ]
    },
    {
      "week": 2,
      "theme": "Scale",
      "days": [
        { "day": 8, "action": "...", "timeEstimate": "2 hrs", "successMetric": "..." },
        { "day": 9, "action": "...", "timeEstimate": "1 hr", "successMetric": "..." }
      ]
    },
    {
      "week": 3,
      "theme": "Optimize",
      "days": [
        { "day": 15, "action": "...", "timeEstimate": "2 hrs", "successMetric": "..." }
      ]
    },
    {
      "week": 4,
      "theme": "Expand",
      "days": [
        { "day": 22, "action": "...", "timeEstimate": "1 hr", "successMetric": "..." }
      ]
    }
  ],
  "topPriorities": [
    {
      "rank": 1,
      "title": "...",
      "iceScore": 26,
      "impact": { "score": 9, "reason": "..." },
      "confidence": { "score": 8, "reason": "..." },
      "ease": { "score": 9, "reason": "..." },
      "description": "..."
    }
  ],
  "metrics": [
    { "name": "...", "target": "...", "category": "acquisition" }
  ],
  "competitors": [
    {
      "name": "Acme Corp",
      "traffic": "50K/mo",
      "trafficNumber": 50000,
      "positioning": "Premium pricing, enterprise focus",
      "weakness": "Complex setup, steep learning curve, users complain about support",
      "opportunity": "Position as the simpler alternative for growing teams",
      "stealThis": "Their email onboarding sequence converts well"
    },
    {
      "name": "Budget Co",
      "traffic": "",
      "positioning": "Low-cost leader, mass market appeal",
      "weakness": "Limited features, users outgrow it quickly",
      "opportunity": "Target users who've outgrown Budget Co but can't afford Acme",
      "stealThis": "Their pricing page clarity - shows value at each tier"
    }
  ],
  "currentWeek": 1,
  "roadmapWeeks": [
    { "week": 1, "theme": "Foundation", "tasks": ["Task 1", "Task 2"] },
    { "week": 2, "theme": "Scale", "tasks": ["Task 1", "Task 2"] }
  ],
  "extractedAt": "2024-01-22T12:00:00Z",
  "formatterVersion": "1.0",
  "researchSnapshot": {
    "searchesRun": 12,
    "pagesAnalyzed": 5,
    "competitorsResearched": 3,
    "keywordGapsFound": 45
  },
  "competitiveComparison": {
    "domains": [
      { "domain": "competitor.com", "traffic": 50000, "keywords": 1200, "isUser": false },
      { "domain": "usersite.com", "traffic": 5000, "keywords": 150, "isUser": true }
    ]
  },
  "keywordOpportunities": {
    "keywords": [
      { "keyword": "best crm for small business", "volume": 2400, "competitorRank": 3, "competitor": "competitor.com" }
    ]
  },
  "marketQuotes": {
    "quotes": [
      { "text": "I switched from X to Y and it changed everything", "source": "Reddit r/SaaS", "sentiment": "positive" }
    ]
  },
  "positioning": {
    "verdict": "needs-work",
    "summary": "Your positioning is unclear - you're trying to appeal to everyone...",
    "uniqueValue": "AI-powered automation for small teams",
    "targetSegment": "Solo founders and small agencies"
  },
  "briefScores": {
    "overall": 42,
    "clarity": 35,
    "clarityWhy": "Messaging blends in with competitors — no clear differentiator visible",
    "visibility": 50,
    "visibilityWhy": "Some organic presence but competitors outrank on key terms by 10x",
    "proof": 38,
    "proofWhy": "One testimonial found, no case studies or third-party mentions",
    "advantage": 45,
    "advantageWhy": "Two direct competitors found with significantly more traffic and content"
  },
  "discoveries": [
    {
      "type": "opportunity",
      "title": "r/BravoTopChef Sidebar Has Permanent Link Slot",
      "content": "The subreddit sidebar has a 'Contestant Restaurant List' link section. Getting added means permanent passive traffic from 50K+ subscribers.",
      "source": "Reddit r/BravoTopChef",
      "significance": "One-time outreach to mods could yield ongoing traffic — low effort, high leverage",
      "surpriseScore": 9
    },
    {
      "type": "competitive_intel",
      "title": "Major Competitor Cancelled Key Feature",
      "content": "Tattoodo recently cancelled their artist discovery feature, leaving artists frustrated with no way to be found by local clients.",
      "source": "Reddit r/TattooArtists",
      "significance": "Opens a positioning opportunity as the reliable alternative for artist discovery",
      "surpriseScore": 7
    },
    {
      "type": "pattern",
      "title": "City Subreddits Drive Tattoo Referrals",
      "content": "Users consistently ask for artist recommendations in city-specific subreddits rather than tattoo-focused ones.",
      "source": "SEO research",
      "significance": "Distribution channel opportunity - engage in local subreddits rather than competing on broad tattoo keywords",
      "surpriseScore": 6
    }
  ],
  "threeSecondTest": {
    "whatYouSell": "Some kind of CRM tool",
    "whoItsFor": "Unclear - mentions both enterprise and startups",
    "whyYou": "Not discernible from the page",
    "verdict": "unclear"
  },
  "quickWins": [
    { "title": "Replace hero headline with specific outcome", "detail": "Current headline is vague. Try: 'Close 2x more deals without hiring' — specificity converts.", "impact": "high", "timeEstimate": "5 min" },
    { "title": "Add customer logos above the fold", "detail": "Social proof within 3 seconds builds instant credibility.", "impact": "medium", "timeEstimate": "15 min" }
  ],
  "positioningGap": {
    "yourMessage": "All-in-one business platform for everyone",
    "marketExpects": "A focused tool that solves their specific pain point",
    "gap": "Too broad — visitors can't tell if this is for them"
  }
}`

export const FORMATTER_USER_PROMPT = `Extract structured data from this strategy document. Return ONLY the JSON object, no other text.

---
STRATEGY DOCUMENT:

`

export const FORMATTER_USER_PROMPT_WITH_RESEARCH = `Extract structured data from this strategy document AND the research data. Return ONLY the JSON object, no other text.

---
STRATEGY DOCUMENT:

`

// =============================================================================
// FREE BRIEF EXTRACTION PROMPT
// =============================================================================

export const FREE_BRIEF_FORMATTER_SYSTEM_PROMPT = `You are a precise data extractor. Your job is to parse a free Brief markdown document and extract structured JSON data.

IMPORTANT RULES:
1. Extract ONLY data that is explicitly present in the markdown
2. Do not invent or hallucinate any information
3. Return ONLY valid JSON - no markdown, no explanation, no code blocks

BUSINESS NAME EXTRACTION (REQUIRED):
Extract "businessName" - a clean, short label for this business (2-4 words max).
Priority order:
1. Company/product name if mentioned (e.g., "Cheft", "Triple D Map", "Inkdex")
2. Domain name from website URL - capitalize and drop TLD (e.g., "cheft.io" → "Cheft")
3. Short descriptor only if no name/domain exists (e.g., "AI Study Tool")

BRIEF SCORES EXTRACTION (REQUIRED - this is the most important field):
Extract "briefScores" from a JSON block in the "## Scores" section:
- "overall": 0-100 overall diagnostic score
- "clarity": 0-100 — can people immediately understand what you do?
- "clarityWhy": 1-sentence evidence
- "visibility": 0-100 — can the target audience find them?
- "visibilityWhy": 1-sentence evidence
- "proof": 0-100 — do they have evidence that builds trust?
- "proofWhy": 1-sentence evidence
- "advantage": 0-100 — what makes them defensibly different?
- "advantageWhy": 1-sentence evidence

IMPORTANT: The JSON block may use old field names ("positioning" instead of "clarity", "competitiveEdge" instead of "advantage"). Map them: positioning→clarity, competitiveEdge→advantage.

POSITIONING EXTRACTION:
Extract "positioning" from the "## Your Situation" section:
- "verdict": "clear" | "needs-work" | "unclear"
- "summary": 2-3 sentence summary
- "uniqueValue": What makes this business different
- "targetSegment": Who they serve best
- "competitiveAdvantage": Their edge over competitors

THREE-SECOND TEST EXTRACTION:
Extract "threeSecondTest" from "3-Second Test" or "Three-Second Test" section:
- "whatYouSell": What a stranger would think after 3 seconds
- "whoItsFor": Who the target audience appears to be
- "whyYou": Why choose this over alternatives
- "verdict": "clear" | "needs-work" | "unclear"

POSITIONING GAP EXTRACTION:
Extract "positioningGap" from "Positioning Gap" section:
- "yourMessage": What the landing page currently communicates
- "marketExpects": What the target market expects
- "gap": The disconnect

QUICK WINS EXTRACTION:
Extract "quickWins" array — 2-3 specific fixes:
- "title": The specific fix
- "detail": Why this matters
- "impact": "high" | "medium" | "low"
- "timeEstimate": How long (e.g., "5 min", "15 min")

COMPETITOR EXTRACTION:
- "name", "traffic" (numeric string like "50K/mo" or ""), "trafficNumber" (parsed number), "positioning", "weakness", "opportunity", "stealThis"

COMPETITIVE COMPARISON:
- "domains" array with { domain, traffic (number|null), keywords (number|null), isUser (boolean) }

DISCOVERIES EXTRACTION:
Extract novel insights ordered by surpriseScore descending:
- "type", "title", "content", "source", "significance", "surpriseScore" (1-10)

OUTPUT FORMAT:
{
  "businessName": "Acme Corp",
  "briefScores": { "overall": 42, "clarity": 35, "clarityWhy": "...", "visibility": 50, "visibilityWhy": "...", "proof": 38, "proofWhy": "...", "advantage": 45, "advantageWhy": "..." },
  "positioning": { "verdict": "needs-work", "summary": "...", "uniqueValue": "...", "targetSegment": "..." },
  "threeSecondTest": { "whatYouSell": "...", "whoItsFor": "...", "whyYou": "...", "verdict": "needs-work" },
  "positioningGap": { "yourMessage": "...", "marketExpects": "...", "gap": "..." },
  "quickWins": [{ "title": "...", "detail": "...", "impact": "high", "timeEstimate": "5 min" }],
  "competitors": [{ "name": "...", "traffic": "50K/mo", "trafficNumber": 50000, "positioning": "...", "weakness": "...", "opportunity": "...", "stealThis": "..." }],
  "competitiveComparison": { "domains": [{ "domain": "...", "traffic": 50000, "keywords": 1200, "isUser": false }] },
  "discoveries": [{ "type": "opportunity", "title": "...", "content": "...", "significance": "...", "surpriseScore": 9 }]
}`

export const FREE_BRIEF_FORMATTER_USER_PROMPT = `Extract structured data from this free Brief document. Return ONLY the JSON object, no other text.

---
BRIEF DOCUMENT:

`
