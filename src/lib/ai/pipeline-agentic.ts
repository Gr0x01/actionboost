/**
 * Agentic Pipeline — $29 one-shot + free audit + refinement.
 *
 * This file contains the PROMPTS and WRAPPERS specific to each pipeline.
 * The reusable tool-calling loop lives in agentic-engine.ts.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { RunInput, UserHistoryContext } from './types'
import { runAgenticLoop, TOOLS, type AgenticResult, type ResearchData, type StageCallback } from './agentic-engine'
import { trackApiCall, calculateApiCost } from '@/lib/analytics'

// Re-export types so existing consumers don't break
export type { ResearchData, AgenticResult, StageCallback } from './agentic-engine'

// DO NOT CHANGE without explicit approval
const MODEL = 'claude-opus-4-5-20251101'
const MAX_TOKENS = 12000

// =============================================================================
// $29 ONE-SHOT SYSTEM PROMPT
// =============================================================================

function buildSystemPrompt(userHistory?: UserHistoryContext | null): string {
  const historySection = userHistory && userHistory.totalRuns > 0
    ? `
## Returning User

This is their ${userHistory.totalRuns + 1}th strategy. Build on what you know:
${userHistory.previousTraction.map(t => `- ${t.date}: ${t.summary}`).join('\n') || 'No traction history'}

Previous tactics: ${userHistory.tacticsTried.slice(0, 5).join('; ') || 'None recorded'}

Your past recommendations (evolve, don't repeat): ${userHistory.pastRecommendations.slice(0, 3).join('; ') || 'None'}
`
    : ''

  return `You're a senior marketing analyst. A client just hired you for a week of dedicated research to build them a growth strategy.

You have access to real data:
- Search the entire web for discussions, reviews, trends, news, competitor intel
- Read any page in full when you need deeper context
- Look up traffic and keyword rankings for any domain
- Compare keyword positions between competing domains
- Screenshot any homepage to see what visitors actually see (visual layout, above-the-fold content, trust signals)

The client will see your strategy alongside the data you gathered—competitive traffic comparisons, keyword opportunities, market quotes, and your key discoveries. Empty data sections signal shallow research. Do the work.

## Your Approach

When the client provides competitor URLs, investigate them—you want to know their traffic, what keywords drive it, and where the gaps are. When they mention a market, understand it. When they describe a problem, find how others have solved it.

A good analyst doesn't wait to be told what to research. You see the inputs, you know what data would make the strategy stronger, you go get it.

${historySection}

## Your Deliverable

After your research, write the full strategy:
- Executive Summary (2-3 paragraphs)
- Your Situation (AARRR analysis)
- Your SEO Landscape (if you gathered SEO data)
- Market Sentiment (if you found relevant discussions)
- Competitive Landscape
- Key Discoveries (novel insights that don't fit above—hidden competitors, risks, behavioral patterns, opportunities, surprising finds)
- Channel Strategy (table + explanations)
- Stop Doing (3-5 items)
- Start Doing (5-8 with ICE scores: Impact + Confidence + Ease, each 1-10)
- Week 1 through Week 4 (each with 7-day action table: Day | Action | Time | Success Metric)
- Metrics Dashboard (AARRR metrics table)
- Content Templates (2-3 ready-to-use)
- Diagnostic Scores

## Diagnostic Scoring (REQUIRED)
After the strategy, score the business on 4 categories, 0-100 each:

| Category | What It Measures | Framework |
|----------|-----------------|-----------|
| **Clarity** | Can people immediately understand what you do, who it's for, and why you? | Dunford positioning, Ries/Trout |
| **Visibility** | Can the target audience actually find them? | Sharp's mental/physical availability |
| **Proof** | Do they have evidence that builds trust? | Cialdini social proof, Keller brand equity |
| **Advantage** | What makes them defensibly different from alternatives? | Ritson competitive strategy |

Calibration:
- 90-100: Exceptional
- 70-89: Solid
- 50-69: Needs work
- 0-49: Significant problems

**Hard rule**: Every score must cite specific evidence. Overall = weighted average. Be honest — most early-stage businesses score 30-55.

Output as a "## Scores" section with this JSON block:

\`\`\`json
{
  "overall": [0-100],
  "clarity": [0-100],
  "visibility": [0-100],
  "proof": [0-100],
  "advantage": [0-100]
}
\`\`\`

**Clarity** ([score]/100): [1-sentence evidence]
**Visibility** ([score]/100): [1-sentence evidence]
**Proof** ([score]/100): [1-sentence evidence]
**Advantage** ([score]/100): [1-sentence evidence]

No emojis. Be direct. Challenge flawed assumptions. Say "unknown" rather than guessing metrics.`
}

// =============================================================================
// USER MESSAGE BUILDER
// =============================================================================

function buildUserMessage(input: RunInput, priorContext?: string | null): string {
  const focusLabel =
    input.focusArea === 'custom' && input.customFocusArea
      ? `Custom: ${input.customFocusArea}`
      : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  let message = `# Growth Strategy Request

## Focus Area
**${focusLabel}**

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}

## What I've Tried & How It's Going
${input.tacticsAndResults || 'Not specified'}
`

  if (input.websiteUrl) message += `\n## My Website\n${input.websiteUrl}\n`
  if (input.competitorUrls?.length) message += `\n## Competitors\n${input.competitorUrls.join('\n')}\n`
  if (input.analyticsSummary) message += `\n## Analytics Summary\n${input.analyticsSummary}\n`
  if (input.constraints) message += `\n## Constraints\n${input.constraints}\n`

  if (input.icp) {
    message += `\n## Target Customer\n`
    message += `**Who**: ${input.icp.who}\n`
    message += `**Problem you solve**: ${input.icp.problem}\n`
    message += `**What they do instead**: ${input.icp.alternatives}\n`
  }

  if (input.voice) {
    message += `\n## Brand Voice\n`
    message += `**Tone**: ${input.voice.tone}\n`
    if (input.voice.dos?.length) message += `**Always**: ${input.voice.dos.join('; ')}\n`
    if (input.voice.donts?.length) message += `**Never**: ${input.voice.donts.join('; ')}\n`
  }

  if (priorContext) message += `\n---\n\n${priorContext}\n`

  return message
}

// =============================================================================
// $29 ONE-SHOT GENERATION
// =============================================================================

/**
 * Run agentic strategy generation with dynamic tool calling.
 * This is the $29 one-shot pipeline.
 */
export async function generateAgenticStrategy(
  input: RunInput,
  userHistory?: UserHistoryContext | null,
  onStageUpdate?: StageCallback,
  runId?: string,
  userId?: string,
  priorContext?: string | null
): Promise<AgenticResult> {
  const systemPrompt = buildSystemPrompt(userHistory)
  const userMessage = buildUserMessage(input, priorContext)

  await onStageUpdate?.('Analyzing your situation...')

  return runAgenticLoop({
    model: MODEL,
    maxTokens: MAX_TOKENS,
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    onStageUpdate,
    runId,
    userId,
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  })
}

// =============================================================================
// LEGACY WRAPPER (for compatibility with existing pipeline.ts)
// =============================================================================

export type AgenticStrategyResult = {
  output: string
  researchData: ResearchData
}

export async function generateStrategyAgentic(
  input: RunInput,
  _research?: unknown,
  userHistory?: UserHistoryContext | null,
  onStageUpdate?: StageCallback,
  runId?: string,
  userId?: string,
  priorContext?: string | null
): Promise<AgenticStrategyResult> {
  const result = await generateAgenticStrategy(input, userHistory, onStageUpdate, runId, userId, priorContext)

  if (!result.success || !result.output) {
    throw new Error(result.error || 'Agentic generation failed')
  }

  console.log(`[Agentic] Completed with ${result.toolCalls?.length || 0} tool calls`)
  console.log(`[Agentic] Timing: ${result.timing?.total}ms total, ${result.timing?.tools}ms tools`)

  return {
    output: result.output,
    researchData: result.researchData || { searches: [], seoMetrics: [], keywordGaps: [], scrapes: [], screenshots: [] },
  }
}

// =============================================================================
// REFINEMENT PIPELINE
// =============================================================================

function buildRefinementSystemPrompt(): string {
  return `You are refining a growth strategy based on user feedback.

CRITICAL: Your output MUST be the COMPLETE strategy document with ALL sections. Do not answer the user's feedback as a question—incorporate it into an updated full strategy.

The user's feedback might be:
- A correction ("My product is actually X, not Y")
- Additional context ("I forgot to mention we have a $500 budget")
- A request to expand something ("Can you go deeper on keywords?")
- A question ("What specific keywords should I target?")

Regardless of format, your response is ALWAYS a complete updated strategy document with these sections:
- Executive Summary
- Your Situation
- Your SEO Landscape (if applicable)
- Market Sentiment (if applicable)
- Competitive Landscape
- Key Discoveries
- Channel Strategy
- Stop Doing
- Start Doing (with ICE scores)
- Week 1-4 action tables
- Metrics Dashboard
- Content Templates

If the user asks a question, answer it BY incorporating the answer into the relevant section(s) of the full strategy. For example, if they ask "what keywords should I target?", expand the SEO Landscape or add a Keyword Strategy section—but still output the COMPLETE document.

You have research tools available (search, scrape, seo, keyword_gaps). Use them if the feedback warrants new research.

Preserve what still applies from the previous strategy—most of it should. Only change/expand what the feedback addresses. No emojis. Be direct.`
}

function buildRefinementUserMessage(
  input: RunInput,
  previousOutput: string,
  additionalContext: string
): string {
  const focusLabel =
    input.focusArea === 'custom' && input.customFocusArea
      ? `Custom: ${input.customFocusArea}`
      : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  let message = `# Strategy Refinement Request

## User's Feedback & Additional Context
**The user has reviewed their strategy and wants these specific adjustments:**

${additionalContext}

---

## Previous Strategy (YOUR FOUNDATION - BUILD UPON THIS)
**This is your previous strategy. PRESERVE what still applies, only ADJUST what the user's feedback addresses:**

${previousOutput}

---

## Original Request Context

### Focus Area
**${focusLabel}**

### About My Product
${input.productDescription}

### Current Traction
${input.currentTraction}

### What I've Tried & How It's Going
${input.tacticsAndResults || 'Not specified'}
`

  if (input.websiteUrl) message += `\n### My Website\n${input.websiteUrl}\n`
  if (input.competitorUrls?.length) message += `\n### Competitors\n${input.competitorUrls.join('\n')}\n`
  if (input.constraints) message += `\n### Constraints\n${input.constraints}\n`

  return message
}

export async function generateAgenticRefinement(
  input: RunInput,
  previousOutput: string,
  additionalContext: string,
  onStageUpdate?: StageCallback,
  runId?: string,
  userId?: string
): Promise<AgenticResult> {
  const systemPrompt = buildRefinementSystemPrompt()
  const userMessage = buildRefinementUserMessage(input, previousOutput, additionalContext)

  await onStageUpdate?.('Analyzing your feedback...')

  return runAgenticLoop({
    model: MODEL,
    maxTokens: MAX_TOKENS,
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    maxIterations: 6,
    maxToolCalls: 10,
    onStageUpdate,
    runId,
    userId,
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  })
}

// =============================================================================
// FREE AGENTIC PIPELINE (Sonnet + limited tools)
// =============================================================================

const FREE_MODEL = 'claude-sonnet-4-20250514'
const FREE_MAX_TOKENS = 4000

const FREE_TOOLS: Anthropic.Tool[] = TOOLS.filter((t) =>
  ['search', 'seo'].includes(t.name)
)

function buildFreeSystemPrompt(): string {
  return `You're a marketing analyst doing a quick competitive assessment for a client.

You have access to:
- Web search (find competitors, market discussions, reviews)
- SEO metrics lookup (traffic and keyword data for any domain)

The client's homepage screenshot is attached. You will also receive their product description.

IMPORTANT: If the screenshot shows a Cloudflare verification page, CAPTCHA, cookie wall, or any kind of bot-protection interstitial instead of the actual website, IGNORE the screenshot entirely. Base the 3-Second Test on the product description and what you find via search instead. Do NOT mention the bot-check page in your output — just assess based on available information and note "Based on product description and search results" in the 3-Second Test section.

## Your Job

1. **3-Second Test** — Look at the screenshot. Can a stranger tell in 3 seconds: What do they sell? Who is it for? Why should I pick them? Be specific about what's clear and what's not. If the screenshot was blocked (see above), infer from the product description and search results instead.

2. **Find Real Competitors** — Search for alternatives in their space. Find 2-3 direct competitors with actual websites, not just "DIY" or "do nothing."

3. **SEO Comparison** — Look up traffic/keyword metrics for the user's site AND the top 1-2 competitors you found.

4. **Positioning Gap** — Based on the screenshot + competitor research: What does their page communicate? What does the market/audience expect? Where's the disconnect?

5. **Quick Wins** — 2-3 specific, do-it-today fixes based on what you found. Each should reference something concrete (their actual headline, a specific competitor advantage, a real metric).

6. **Score** — Rate them 0-100 on Clarity, Visibility, Proof, and Advantage.

## Budget
You have 5 tool calls total. Be strategic:
- 1-2 searches to find competitors and market context
- 1-2 SEO lookups on the most relevant domains (always include the user's domain)

## Output Format

Structure your response as markdown with EXACTLY these sections:

## 3-Second Test

**What You Sell**: [What the page communicates / Clear or Unclear]
**Who It's For**: [Target audience visible or not / Clear or Unclear]
**Why You**: [Differentiation visible or not / Clear or Unclear]
**Verdict**: [Clear / Needs Work / Unclear]

[1-2 sentences explaining the overall impression a stranger gets]

## Positioning Gap

**Your page says**: [What their site actually communicates]
**The market expects**: [What competitors/audience are looking for]
**The gap**: [The specific disconnect — be direct]

## Competitive Landscape

| Competitor | Domain | What They Do | Their Advantage | Your Angle |
|-----------|--------|-------------|-----------------|------------|
| [Name] | [domain.com] | [Brief] | [Where they're stronger] | [Where you can win] |

## Quick Wins

1. **[Specific action]** — [Why this matters, referencing real evidence] — Impact: [High/Medium/Low] — Time: [5 min/15 min/30 min]
2. **[Specific action]** — [Evidence] — Impact: [High/Medium/Low] — Time: [5 min/15 min/30 min]
3. **[Specific action]** — [Evidence] — Impact: [High/Medium/Low] — Time: [5 min/15 min/30 min]

## Key Discovery

### [Title — something surprising from your research]
[1-3 sentences. Must be specific, sourced, and not obvious.]

*Source: [Where this came from]*

## Scores

\`\`\`json
{
  "overall": [0-100],
  "clarity": [0-100],
  "visibility": [0-100],
  "proof": [0-100],
  "advantage": [0-100]
}
\`\`\`

**Clarity** ([score]/100): [1-sentence evidence]
**Visibility** ([score]/100): [1-sentence evidence]
**Proof** ([score]/100): [1-sentence evidence]
**Advantage** ([score]/100): [1-sentence evidence]

---

**STOP HERE.** This is a free preview. The full strategy with 30-day roadmap, execution drafts, and weekly action plans is available with Boost Weekly.

## Rules
- No emojis. Ever.
- Every claim needs evidence — don't guess traffic numbers, look them up.
- Be direct. If their clarity or advantage is weak, say so.
- Quick wins must be specific enough to act on TODAY, not vague advice like "improve your SEO."
- Say "unknown" rather than estimating metrics you haven't looked up.`
}

function buildFreeUserMessage(
  input: RunInput,
  screenshotBase64?: string | null,
  pageContent?: string | null
): Anthropic.MessageParam {
  let textContent = `# Quick Assessment Request

## About My Product
${input.productDescription}
`

  if (input.websiteUrl) textContent += `\n## My Website\n${input.websiteUrl}\n`
  if (input.competitorUrls?.length) textContent += `\n## Known Competitors\n${input.competitorUrls.join('\n')}\n`
  if (input.currentTraction) textContent += `\n## Current Traction\n${input.currentTraction}\n`
  if (pageContent) textContent += `\n## Extracted Page Content\nThis is the text content from their landing page:\n\n${pageContent}\n`

  if (!screenshotBase64 && !pageContent) {
    textContent += `\nNote: Could not capture screenshot or extract page content. Base the 3-Second Test on the product description and search results.\n`
  } else if (!screenshotBase64 && pageContent) {
    textContent += `\nNote: Screenshot was blocked by the site's bot protection. Use the extracted page content above for the 3-Second Test instead.\n`
  }

  const content: Array<Anthropic.ImageBlockParam | Anthropic.TextBlockParam> = []

  if (screenshotBase64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: screenshotBase64 },
    })
  }

  content.push({ type: 'text', text: textContent })

  return { role: 'user', content }
}

/**
 * Run agentic strategy generation for FREE tier.
 * Sonnet with limited tools (search + seo), screenshot passed as vision input.
 *
 * NOTE: This uses its own loop because of the vision input handling.
 * The free pipeline has different enough message construction that runAgenticLoop
 * doesn't cleanly fit without adding complexity.
 */
export async function generateFreeAgenticStrategy(
  input: RunInput,
  screenshotBase64?: string | null,
  freeAuditId?: string,
  pageContent?: string | null
): Promise<AgenticResult> {
  const systemPrompt = buildFreeSystemPrompt()
  const userMessage = buildFreeUserMessage(input, screenshotBase64, pageContent)

  // The free pipeline uses runAgenticLoop with custom tools and limits
  return runAgenticLoop({
    model: FREE_MODEL,
    maxTokens: FREE_MAX_TOKENS,
    systemPrompt,
    messages: [userMessage],
    tools: FREE_TOOLS,
    maxIterations: 3,
    maxToolCalls: 5,
    runId: freeAuditId,
    userDomain: input.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  })
}
