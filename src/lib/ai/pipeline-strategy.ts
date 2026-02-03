/**
 * Opus Strategy Pipeline — generates quarter focus + monthly theme.
 *
 * Uses the agentic engine directly with a strategy-specific system prompt.
 * Runs on signup + monthly (every 4th week).
 * Output parsed into StrategyContext and stored on subscriptions.strategy_context.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { StrategyContext } from './types'
import type { BusinessProfile } from '@/lib/types/business-profile'
import type { ResearchData } from './agentic-engine'
import type { StructuredOutput } from './formatter-types'
import { trackApiCall, calculateApiCost } from '@/lib/analytics'
import { runAgenticLoop, SEARCH_HISTORY_TOOL, createSearchHistoryExecutor } from './agentic-engine'
import { extractStructuredOutput } from './formatter'

// DO NOT CHANGE without explicit approval
const MODEL = 'claude-opus-4-5-20251101'
const EXTRACT_MODEL = 'claude-sonnet-4-20250514'

type StageCallback = (stage: string) => Promise<void>

/**
 * Generate strategic context using Opus with agentic research.
 *
 * Returns a StrategyContext object ready to store on subscriptions.strategy_context.
 */
export async function generateStrategyContext(params: {
  profile: BusinessProfile
  monthNumber: number
  carryForward?: StrategyContext['monthlyTheme']['carryForward']
  historicalContext?: string
  onStageUpdate?: StageCallback
  runId?: string
  userId?: string
  businessId?: string
}): Promise<{ strategyContext: StrategyContext; researchData?: ResearchData; insights?: StructuredOutput }> {
  const { profile, monthNumber, carryForward, historicalContext, onStageUpdate, runId, userId, businessId } = params

  let systemPrompt = buildStrategySystemPrompt(monthNumber, carryForward)

  if (historicalContext) {
    systemPrompt += `\n\n## Historical Context\nPast strategy outcomes, task results, and user feedback from previous weeks:\n${historicalContext}`
  }

  const userMessage = buildStrategyUserMessage(profile)

  await onStageUpdate?.('Researching your market...')

  // Add search_history tool alongside research tools if we have user/business context
  const customToolExecutors: Record<string, (input: Record<string, unknown>) => Promise<string>> = {}
  const additionalTools: Anthropic.Tool[] = []
  if (userId && businessId) {
    additionalTools.push(SEARCH_HISTORY_TOOL)
    const executor = createSearchHistoryExecutor(userId, businessId)
    customToolExecutors['search_history'] = async (input) => executor(input.query as string)
  }

  const result = await runAgenticLoop({
    model: MODEL,
    maxTokens: 8000,
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    maxIterations: 8,
    maxToolCalls: 20,
    onStageUpdate,
    runId,
    userId,
    userDomain: profile.websiteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    ...(additionalTools.length > 0 ? { tools: [...(await import('./agentic-engine')).TOOLS, ...additionalTools] } : {}),
    ...(Object.keys(customToolExecutors).length > 0 ? { customToolExecutors } : {}),
  })

  if (!result.success || !result.output) {
    throw new Error(result.error || 'Strategy generation failed')
  }

  // Extract structured StrategyContext from Opus markdown
  const strategyContext = await extractStrategyContext(result.output, monthNumber)

  // Extract StructuredOutput (positioning, competitors, keywords, etc.) from research
  let insights: StructuredOutput | undefined
  try {
    const extracted = await extractStructuredOutput(result.output, result.researchData)
    if (extracted) insights = extracted
  } catch (err) {
    console.warn('[Strategy] Failed to extract insights:', err)
  }

  return { strategyContext, researchData: result.researchData, insights }
}

/**
 * System prompt for the strategy pipeline.
 * Tells Opus to produce quarter focus + monthly theme, NOT weekly tasks.
 */
function buildStrategySystemPrompt(
  monthNumber: number,
  carryForward?: StrategyContext['monthlyTheme']['carryForward']
): string {
  let prompt = `You are a senior growth strategist. Your job is to research a business and produce a focused quarterly strategy with a monthly action theme.

You have access to tools for market research: web search, website scraping, SEO analysis, keyword gap analysis, and screenshots. Use them to ground your strategy in real data.

## Your Deliverable

Produce a strategic document with these sections:

### Quarter Focus
The ONE strategic bet for the next 3 months:
- Primary objective (specific, measurable)
- Which AARRR growth lever to pull (acquisition/activation/retention/referral/monetization)
- Channel strategy (primary + optional secondary)
- Success metric with current baseline and target
- Strategic rationale (2-3 sentences explaining why THIS bet)

### Monthly Theme (month ${monthNumber})
What to focus on THIS month:
- Theme name (e.g., "Channel Setup", "Content Engine", "Community Seeding")
- Specific focus area
- Milestone: what "done" looks like this month

### Research Summary
Key research findings condensed into insights that will inform weekly task generation.

### Strategic Rationale
Detailed reasoning (3-5 paragraphs) grounding your strategy in the research you conducted.

## Rules
- DO NOT generate weekly task tables or day-by-day action plans. Weekly tasks will be generated separately by another system.
- Focus on strategic clarity over tactical detail.
- Be specific to THIS business — generic advice is useless.
- Use your research tools to validate assumptions before recommending channels or tactics.`

  if (carryForward) {
    prompt += `

## Previous Month Results
What worked: ${carryForward.worked.join('; ') || 'Nothing recorded'}
What didn't work: ${carryForward.didntWork.join('; ') || 'Nothing recorded'}
Learnings: ${carryForward.learnings.join('; ') || 'Nothing recorded'}

Use these results to inform this month's theme. Build on what worked, pivot away from what didn't.`
  }

  return prompt
}

/**
 * Build the user message from the business profile.
 */
function buildStrategyUserMessage(profile: BusinessProfile): string {
  const parts: string[] = []

  parts.push(`## Business`)
  parts.push(profile.description || 'No description provided.')

  if (profile.industry) parts.push(`Industry: ${profile.industry}`)
  if (profile.websiteUrl) parts.push(`Website: ${profile.websiteUrl}`)

  if (profile.icp) {
    parts.push(`\n## Ideal Customer`)
    if (profile.icp.who) parts.push(`Who: ${profile.icp.who}`)
    if (profile.icp.problem) parts.push(`Problem: ${profile.icp.problem}`)
    if (profile.icp.alternatives) parts.push(`Alternatives: ${profile.icp.alternatives}`)
  }

  if (profile.competitors && profile.competitors.length > 0) {
    parts.push(`\n## Competitors`)
    parts.push(profile.competitors.join(', '))
  }

  if (profile.triedBefore) {
    parts.push(`\n## What they've tried`)
    parts.push(profile.triedBefore)
  }

  if (profile.goals) {
    parts.push(`\n## Goals`)
    if (profile.goals.primary) parts.push(`Primary: ${profile.goals.primary}`)
    if (profile.goals.timeline) parts.push(`Timeline: ${profile.goals.timeline}`)
    if (profile.goals.budget) parts.push(`Budget: ${profile.goals.budget}`)
  }

  if (profile.voice) {
    parts.push(`\n## Brand Voice`)
    if (profile.voice.tone) parts.push(`Tone: ${profile.voice.tone}`)
    if (profile.voice.dos) parts.push(`Do: ${profile.voice.dos}`)
    if (profile.voice.donts) parts.push(`Don't: ${profile.voice.donts}`)
  }

  parts.push(`\nResearch this business and produce a quarterly strategy with a monthly theme.`)

  return parts.join('\n')
}

/**
 * Extract structured StrategyContext from Opus markdown output.
 * Uses Sonnet for reliable JSON extraction.
 */
async function extractStrategyContext(
  rawStrategy: string,
  monthNumber: number
): Promise<StrategyContext> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const extractionPrompt = `Extract the strategic context from this strategy document into structured JSON.

<strategy>
${rawStrategy}
</strategy>

Return ONLY valid JSON matching this exact shape:
{
  "quarterFocus": {
    "primaryObjective": "string — the ONE strategic bet",
    "growthLever": "string — AARRR stage (acquisition/activation/retention/referral/monetization)",
    "channelStrategy": { "primary": "string", "secondary": "string or omit" },
    "successMetric": { "metric": "string", "current": number_or_null, "target": number },
    "strategicRationale": "string — 2-3 sentences"
  },
  "monthlyTheme": {
    "theme": "string — short theme name",
    "focusArea": "string — what specifically this month",
    "milestone": "string — what done looks like"
  },
  "researchSummary": "string — key research findings condensed to 2-3 paragraphs"
}`

  const startTime = Date.now()

  const response = await client.messages.create({
    model: EXTRACT_MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: extractionPrompt }],
  })

  trackApiCall('system', {
    service: 'anthropic',
    endpoint: 'messages.create',
    latency_ms: Date.now() - startTime,
    success: true,
    input_tokens: response.usage?.input_tokens,
    output_tokens: response.usage?.output_tokens,
    model: EXTRACT_MODEL,
    estimated_cost_usd: calculateApiCost('anthropic', 'messages.create', {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    }),
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  const text = textBlock && textBlock.type === 'text' ? textBlock.text : ''

  // Extract JSON from response (may be wrapped in markdown code block)
  const fenceMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
  const jsonMatch = fenceMatch ? [fenceMatch[1]] : text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from strategy context response')
  }

  let parsed: {
    quarterFocus: StrategyContext['quarterFocus']
    monthlyTheme: Omit<StrategyContext['monthlyTheme'], 'carryForward'>
    researchSummary?: string
  }
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('LLM returned invalid JSON for strategy context extraction')
  }

  return {
    quarterFocus: parsed.quarterFocus,
    monthlyTheme: parsed.monthlyTheme,
    rawStrategy,
    researchSummary: parsed.researchSummary,
    generatedAt: new Date().toISOString(),
    monthNumber,
  }
}
