import { z } from 'zod'

// =============================================================================
// STRUCTURED OUTPUT SCHEMA - Extracted from markdown via Haiku post-processor
// =============================================================================

/**
 * Day action item for "This Week" section
 */
export const DayActionSchema = z.object({
  day: z.number().min(1).max(7),
  action: z.string(),
  timeEstimate: z.string(),
  successMetric: z.string(),
})

export type DayAction = z.infer<typeof DayActionSchema>

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
 */
export const CompetitorSchema = z.object({
  name: z.string(),
  traffic: z.string(), // Human-readable: "50K/mo", "1.2M/mo"
  trafficNumber: z.number().optional(), // Numeric for sorting/charting
  positioning: z.string(), // How they position themselves
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
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
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

// =============================================================================
// FULL STRUCTURED OUTPUT SCHEMA
// =============================================================================

/**
 * Full structured output schema
 */
export const StructuredOutputSchema = z.object({
  // Existing fields
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

  // NEW: Research-backed fields (all optional for backward compatibility)
  researchSnapshot: ResearchSnapshotSchema.optional(),
  competitiveComparison: CompetitiveComparisonSchema.optional(),
  keywordOpportunities: KeywordOpportunitySchema.optional(),
  marketQuotes: MarketQuoteSchema.optional(),
  positioning: PositioningDataSchema.optional(),
})

export type StructuredOutput = z.infer<typeof StructuredOutputSchema>

/**
 * Partial schema for graceful degradation - allows missing sections
 */
export const PartialStructuredOutputSchema = z.object({
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

  // NEW: Research-backed fields (all optional)
  researchSnapshot: ResearchSnapshotSchema.optional(),
  competitiveComparison: CompetitiveComparisonSchema.optional(),
  keywordOpportunities: KeywordOpportunitySchema.optional(),
  marketQuotes: MarketQuoteSchema.optional(),
  positioning: PositioningDataSchema.optional(),
})

export type PartialStructuredOutput = z.infer<typeof PartialStructuredOutputSchema>

// =============================================================================
// EXTRACTION PROMPT - Instructions for Haiku to extract structured data
// =============================================================================

export const FORMATTER_SYSTEM_PROMPT = `You are a precise data extractor. Your job is to parse markdown strategy documents and extract structured JSON data. You may also receive research data from tool calls to enhance your extraction.

IMPORTANT RULES:
1. Extract ONLY data that is explicitly present in the markdown or research data
2. Do not invent or hallucinate any information
3. If a section is missing or empty, use an empty array []
4. For traffic numbers, parse things like "50K" as 50000, "1.2M" as 1200000
5. Return ONLY valid JSON - no markdown, no explanation, no code blocks
6. Extract ALL weeks from the 30-Day Roadmap (typically 4 weeks) - do not stop at week 1
7. Extract ALL days from the This Week table (typically 7 days)
8. Extract ALL priorities from Start Doing section (typically 5-8 items)

COMPETITOR EXTRACTION RULES:
- "traffic" field is ONLY for numeric monthly visitor counts (e.g., "50K/mo", "1.2M/mo")
- "trafficNumber" is the parsed numeric value (50000, 1200000)
- If NO numeric traffic data exists, set traffic to "" (empty string) and omit trafficNumber
- NEVER put positioning/strategy text in the traffic field
- "positioning" field is for qualitative info: market position, pricing, differentiators, strategy

RESEARCH DATA EXTRACTION (IMPORTANT - include these fields when research data section is provided):
When a "RESEARCH DATA" section is provided after the strategy document, you MUST extract these additional fields:
- "researchSnapshot": Count from research data headers (e.g., "12 searches performed" → searchesRun: 12)
- "competitiveComparison": Build from SEO Metrics section - domains array with traffic/keywords/isUser
- "keywordOpportunities": Build from Keyword Gaps section - keywords array with keyword/volume/competitorRank/competitor
- "marketQuotes": Extract notable quotes from search results about the industry/competitors (text, source like "Reddit r/SaaS", sentiment)
- "positioning": Extract from "Your Situation" section in markdown (verdict: clear/needs-work/unclear, summary, uniqueValue, targetSegment)

If NO research data section is provided, OMIT these 5 fields entirely.

OUTPUT FORMAT:
{
  "thisWeek": {
    "days": [
      { "day": 1, "action": "...", "timeEstimate": "2 hrs", "successMetric": "..." },
      { "day": 2, "action": "...", "timeEstimate": "1 hr", "successMetric": "..." },
      { "day": 3, "action": "...", "timeEstimate": "3 hrs", "successMetric": "..." }
    ],
    "totalHours": 10
  },
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
    { "name": "Acme Corp", "traffic": "50K/mo", "trafficNumber": 50000, "positioning": "Premium pricing, enterprise focus" },
    { "name": "Budget Co", "traffic": "", "positioning": "Low-cost leader, mass market appeal" }
  ],
  "currentWeek": 1,
  "roadmapWeeks": [
    { "week": 1, "theme": "Foundation", "tasks": ["Task 1", "Task 2", "Task 3"] },
    { "week": 2, "theme": "Scale", "tasks": ["Task 1", "Task 2"] },
    { "week": 3, "theme": "Optimize", "tasks": ["Task 1", "Task 2"] },
    { "week": 4, "theme": "Expand", "tasks": ["Task 1", "Task 2"] }
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
