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

/**
 * Full structured output schema
 */
export const StructuredOutputSchema = z.object({
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
})

export type PartialStructuredOutput = z.infer<typeof PartialStructuredOutputSchema>

// =============================================================================
// EXTRACTION PROMPT - Instructions for Haiku to extract structured data
// =============================================================================

export const FORMATTER_SYSTEM_PROMPT = `You are a precise data extractor. Your job is to parse markdown strategy documents and extract structured JSON data.

IMPORTANT RULES:
1. Extract ONLY data that is explicitly present in the markdown
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
  "formatterVersion": "1.0"
}`

export const FORMATTER_USER_PROMPT = `Extract structured data from this strategy document. Return ONLY the JSON object, no other text.

---
STRATEGY DOCUMENT:

`
