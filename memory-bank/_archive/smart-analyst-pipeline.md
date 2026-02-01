# Smart Analyst Pipeline

**Status**: Active - #1 Priority
**Created**: 2026-01-24
**Goal**: Transform the agentic pipeline from rule-following tool operator to intelligent marketing analyst

---

## The Problem

### Current State: Micromanaged Tool Operator

The pipeline treats Opus like a junior employee with a checklist:

```
You have tools: search, scrape, seo, keyword_gaps
- search: use for X
- seo: use when SEO is relevant to focus area
- keyword_gaps: use when organic search matters
```

**Result**: Claude follows rules literally. User asks for SEO help, provides competitor URLs, but Claude calls `seo` on "ubersuggest.com" (a tool it recommended) instead of the actual competitors - because the rules didn't explicitly say "call seo on competitor URLs."

### Current State: Rigid Formatter

Sonnet extracts into fixed schema fields:
- `positioning`, `competitors`, `priorities`, `weeklyPlan`, etc.

**Result**: If Opus finds something valuable that doesn't fit a predefined box (viral trend, regulatory risk, niche community, competitor PR disaster), it gets dropped on the floor.

---

## The Vision

### Opus: Senior Marketing Analyst

Not a tool operator. A senior analyst hired for a week of dedicated research.

**Mindset shift**:
- Has capabilities, not "tools"
- Naturally investigates competitors when given competitor URLs
- Gathers data to back up recommendations
- Finds unexpected insights, not just expected categories

### Sonnet: Intelligent Extractor

Not a form-filler. An intelligent extractor that catches both structured data AND novel discoveries.

**Mindset shift**:
- Extracts known structure (positioning, priorities, plan)
- ALSO captures anything else valuable Opus found
- Flexible containers for unexpected insights

---

## Implementation

### Part 1: Reframe Opus System Prompt

**Before** (tool operator):
```
You are an elite Growth Strategist. You have research tools available: search, scrape, seo, keyword_gaps.

## Tool Usage Guidelines
- search: Market discussions, reviews...
- seo: Domain traffic/keywords - use when SEO is relevant
- keyword_gaps: use when organic search matters

Don't use SEO tools just because URLs exist.
```

**After** (senior analyst):
```
You're a senior marketing analyst. A client just hired you for a week of dedicated research to build them a growth strategy.

You have access to real data:
- Search the entire web for discussions, reviews, trends, competitor intel
- Read any page in full when you need deeper context
- Look up traffic and keyword data for any domain
- Compare keyword rankings between competing domains

The client will see your strategy alongside the data you gathered - competitive traffic comparisons, keyword opportunities, market quotes, and your key discoveries. Empty data sections signal shallow research. Do the work.

When the client provides competitor URLs, investigate them. When they mention a market, understand it. When they describe a problem, find how others have solved it. Be thorough.
```

**Key changes**:
- Role is "senior analyst" not "strategist with tools"
- Capabilities described as what analyst CAN DO, not tool names
- Clear that output includes the data (incentive to gather it)
- Explicit: "When client provides X, investigate X"
- No tool-by-tool usage rules - trust the analyst's judgment

### Part 2: Add Flexible Discoveries to Schema

**New schema field** in `formatter-types.ts`:

```typescript
/**
 * Flexible container for insights that don't fit standard categories
 * Catches the "wild stuff" Opus might find
 */
export const DiscoverySchema = z.object({
  type: z.string(), // "trend", "risk", "opportunity", "quote", "data_point", "competitive_intel", "community", "channel", etc.
  title: z.string(),
  content: z.string(),
  source: z.string().optional(), // URL or "Reddit r/X", "G2 reviews", etc.
  significance: z.string(), // Why this matters to the strategy
})

export type Discovery = z.infer<typeof DiscoverySchema>

// Add to StructuredOutputSchema:
discoveries: z.array(DiscoverySchema).optional(),
```

### Part 3: Update Formatter Prompt

**Add to extraction instructions**:

```
## DISCOVERIES (Flexible Insights)

Scan the strategy for any valuable insights that don't fit the standard categories above. These might include:
- Market trends or shifts
- Risks or threats identified
- Unexpected opportunities
- Notable quotes from research
- Data points worth highlighting
- Competitive intelligence findings
- Community or channel discoveries
- Regulatory or industry changes

For each discovery, capture:
- type: What kind of insight is this?
- title: Brief headline
- content: The insight itself
- source: Where it came from (if mentioned)
- significance: Why this matters to the client's strategy

If Opus found something interesting, don't let it get lost. Capture it.
```

### Part 4: UI for Discoveries

Create a flexible card component that renders discoveries:
- Icon/color varies by `type`
- Shows title, content, source, significance
- Adapts to whatever types Opus/Sonnet produce
- Lives in Insights tab, perhaps after Priorities or before Deep Dives

---

## Success Criteria

1. **Competitor URLs → Competitor Data**: When user provides competitor URLs, Traffic Comparison shows those competitors (not random tools mentioned in strategy)

2. **Focus Area Doesn't Limit Research**: Even if focus is "social", analyst still gathers competitive intel because a good analyst would

3. **Novel Insights Captured**: When Opus finds something unexpected (trend, risk, opportunity), it appears in the dashboard under Discoveries

4. **No Rule Explosion**: System prompt stays concise - describes capabilities and expectations, not 50 conditional rules

---

## Files to Modify

1. `src/lib/ai/pipeline-agentic.ts`
   - `buildSystemPrompt()` - reframe as senior analyst
   - Remove tool-by-tool usage guidelines
   - Add capability-based framing

2. `src/lib/ai/formatter-types.ts`
   - Add `DiscoverySchema`
   - Add `discoveries` to `StructuredOutputSchema`
   - Add `discoveries` to `PartialStructuredOutputSchema`

3. `src/lib/ai/formatter-types.ts` (FORMATTER_SYSTEM_PROMPT)
   - Add discoveries extraction instructions
   - Emphasize catching novel insights

4. `src/components/results/dashboard/` (new)
   - Create `Discoveries.tsx` component
   - Flexible card rendering by type

5. `src/components/results/InsightsView.tsx`
   - Add Discoveries component to layout

---

## Notes

- This is about trusting smart models to be smart
- Rules create loopholes; capabilities create freedom
- Two geniuses (Opus + Sonnet) should amplify each other, not constrain each other
- The user sees the data alongside the strategy - empty sections = shallow work
