# Current: Phase 2 - AI Pipeline

## Goal
Build the core value: Tavily research → Claude Opus 4.5 → markdown strategy output.

Test with hardcoded input before UI exists.

---

## Components

### 1. Research Service (Tavily + DataForSEO)
```typescript
// src/lib/ai/research.ts
async function runResearch(input: RunInput): Promise<ResearchContext>
```

**Tavily searches**:
- Competitor analysis (if URLs provided)
- Market/industry trends for the product category
- Growth tactics for similar products

**DataForSEO** (if competitor URLs provided):
- Traffic estimates
- Top keywords
- Backlink overview

### 2. Strategy Generation (Claude Opus 4.5)
```typescript
// src/lib/ai/generate.ts
async function generateStrategy(input: RunInput, research: ResearchContext): Promise<string>
```

**Model**: `claude-opus-4-5-20251101` (DO NOT CHANGE)

**System prompt**: Load from `.claude/agents/growth-hacker.md`

**Output format**: Markdown with sections:
- Executive Summary
- Your Current Situation
- Competitive Landscape
- Stop Doing (with reasoning)
- Start Doing (prioritized by ICE)
- Quick Wins (This Week)
- 30-Day Roadmap
- Metrics to Track

### 3. Pipeline Orchestrator
```typescript
// src/lib/ai/pipeline.ts
async function runPipeline(runId: string): Promise<void>
```

1. Fetch run from DB
2. Update status → "processing"
3. Run research (with timeout/fallback)
4. Generate strategy
5. Save output, update status → "complete"
6. On error: status → "failed", log error

---

## Input Schema
```typescript
type RunInput = {
  // Required
  productDescription: string
  currentTraction: string
  whatYouTried: string
  whatsWorking: string

  // Optional
  competitorUrls?: string[]
  websiteUrl?: string
  analyticsSummary?: string
  constraints?: string
  focusArea: 'growth' | 'monetization' | 'positioning'

  // Attachments (from storage)
  attachments?: Attachment[]
}
```

---

## Tasks

- [ ] Create `src/lib/ai/research.ts` - Tavily + DataForSEO integration
- [ ] Create `src/lib/ai/generate.ts` - Claude Opus 4.5 strategy generation
- [ ] Create `src/lib/ai/pipeline.ts` - Orchestrate research → generate → save
- [ ] Create test script to run pipeline with hardcoded input
- [ ] Verify output quality matches expected format
- [ ] Handle errors gracefully (research fails → proceed, Claude fails → mark failed)

---

## Files to Create

```
src/lib/ai/
├── research.ts     # Tavily + DataForSEO
├── generate.ts     # Claude Opus 4.5
├── pipeline.ts     # Orchestrator
└── types.ts        # RunInput, ResearchContext types
```

---

## Env Vars Needed

```
ANTHROPIC_API_KEY=sk-ant-...     # ✅ Already set
TAVILY_API_KEY=tvly-...          # ⚠️ Need to add (typo in .env.local: TAAVILY_API)
DATAFORSEO_LOGIN=...             # ✅ Already set
DATAFORSEO_PASSWORD=...          # ✅ Already set
```

---

## Done When

- [ ] Can run pipeline with test input and get quality markdown output
- [ ] Research includes real competitor data (when URLs provided)
- [ ] Output follows the growth-hacker agent format
- [ ] Errors are handled without crashing
