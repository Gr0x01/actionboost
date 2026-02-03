/**
 * Sonnet Weekly Task Pipeline — generates 7 daily tasks with WHY/HOW baked in.
 *
 * Runs every Sunday. Single Sonnet call, no tools, structured JSON output.
 * Input: foundation (business profile) + strategy context + last week's results.
 * Output: WeeklyTaskOutput stored in runs.structured_output.
 */

import type { StrategyContext, WeeklyTaskOutput } from './types'
import type { BusinessProfile } from '@/lib/types/business-profile'
import { runAgenticLoop, SEARCH_HISTORY_TOOL, createSearchHistoryExecutor } from './agentic-engine'

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4000

const SYSTEM_PROMPT = `You generate weekly marketing tasks for a specific business.
Given: their foundation (who they are, ICP, voice), their quarter focus,
this month's theme, and last week's outcomes.

Generate exactly 7 daily tasks. Each task must include:
- title: actionable verb phrase (start with a verb)
- description: what success looks like (1 sentence)
- track: "sprint" (quick win, under 30min) or "build" (longer initiative, 1-2 hours)
- why: 1 sentence strategic rationale connecting to the quarterly objective
- how: 2-3 sentences of concrete execution steps
- timeEstimate: realistic time (e.g., "20 min", "1 hour", "45 min")

Tasks should directly serve the monthly milestone and quarter objective.
Adapt based on last week — don't repeat failed approaches, build on what worked.
Mix sprint and build tasks: aim for 4-5 sprints and 2-3 builds per week.
Order tasks Monday through Sunday (task 1 = Monday).

Return ONLY valid JSON matching this exact shape:
{
  "weekTheme": "string — 3-5 word theme for this week",
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "track": "sprint" | "build",
      "why": "string",
      "how": "string",
      "timeEstimate": "string"
    }
  ]
}`

/**
 * Assemble the foundation context from a business profile (~500 tokens).
 */
function buildFoundation(profile: BusinessProfile): string {
  const parts: string[] = ['## Foundation']

  if (profile.description) parts.push(`**Business**: ${profile.description}`)
  if (profile.industry) parts.push(`**Industry**: ${profile.industry}`)
  if (profile.websiteUrl) parts.push(`**Website**: ${profile.websiteUrl}`)

  if (profile.icp) {
    parts.push(`**ICP**: ${profile.icp.who}`)
    parts.push(`**Problem**: ${profile.icp.problem}`)
    parts.push(`**Alternatives**: ${profile.icp.alternatives}`)
  }

  if (profile.voice) {
    parts.push(`**Voice**: ${profile.voice.tone}`)
    if (profile.voice.dos?.length) parts.push(`**Always**: ${profile.voice.dos.join('; ')}`)
    if (profile.voice.donts?.length) parts.push(`**Never**: ${profile.voice.donts.join('; ')}`)
  }

  if (profile.competitors?.length) {
    parts.push(`**Competitors**: ${profile.competitors.join(', ')}`)
  }

  return parts.join('\n')
}

/**
 * Generate weekly tasks using Sonnet.
 * Uses a lightweight agentic loop with search_history tool so Sonnet can
 * look up past outcomes when the pre-retrieved context isn't enough.
 */
export async function generateWeeklyTasks(params: {
  profile: BusinessProfile
  strategyContext: StrategyContext
  lastWeekSummary?: string // completion summary + outcomes
  checkinContext?: string // sentiment + notes
  historicalContext?: string // pre-retrieved from vector search
  runId?: string
  userId?: string
  businessId?: string
}): Promise<WeeklyTaskOutput> {
  const { profile, strategyContext, lastWeekSummary, checkinContext, historicalContext, runId, userId, businessId } = params

  const foundation = buildFoundation(profile)

  let userMessage = `${foundation}

## Quarter Focus
**Objective**: ${strategyContext.quarterFocus.primaryObjective}
**Growth Lever**: ${strategyContext.quarterFocus.growthLever}
**Primary Channel**: ${strategyContext.quarterFocus.channelStrategy.primary}${strategyContext.quarterFocus.channelStrategy.secondary ? ` + ${strategyContext.quarterFocus.channelStrategy.secondary}` : ''}
**Target**: ${strategyContext.quarterFocus.successMetric.metric} → ${strategyContext.quarterFocus.successMetric.target}${strategyContext.quarterFocus.successMetric.current != null ? ` (current: ${strategyContext.quarterFocus.successMetric.current})` : ''}

## This Month
**Theme**: ${strategyContext.monthlyTheme.theme}
**Focus**: ${strategyContext.monthlyTheme.focusArea}
**Milestone**: ${strategyContext.monthlyTheme.milestone}

## Last Week
${lastWeekSummary || 'First week — no prior data.'}
${checkinContext || ''}`

  if (historicalContext) {
    userMessage += `\n\n## Historical Patterns\nRelevant results from past weeks:\n${historicalContext}`
  }

  // Set up search_history tool if we have user/business context
  const tools = []
  const customToolExecutors: Record<string, (input: Record<string, unknown>) => Promise<string>> = {}

  if (userId && businessId) {
    tools.push(SEARCH_HISTORY_TOOL)
    const executor = createSearchHistoryExecutor(userId, businessId)
    customToolExecutors['search_history'] = async (input) => executor(input.query as string)
  }

  const result = await runAgenticLoop({
    model: MODEL,
    maxTokens: MAX_TOKENS,
    systemPrompt: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    tools: tools.length > 0 ? tools : undefined,
    maxIterations: 2,
    maxToolCalls: 3,
    runId,
    userId,
    ...(Object.keys(customToolExecutors).length > 0 ? { customToolExecutors } : {}),
  })

  if (!result.success || !result.output) {
    throw new Error(result.error || 'Weekly task generation failed')
  }

  const text = result.output

  // Extract JSON from response (may be wrapped in code fence)
  const fenceMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
  const jsonMatch = fenceMatch ? [fenceMatch[1]] : text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from weekly tasks response')
  }

  let parsed: WeeklyTaskOutput
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('LLM returned invalid JSON for weekly tasks')
  }

  // Validate shape
  if (!parsed.weekTheme || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    throw new Error('Invalid weekly tasks output: missing weekTheme or tasks')
  }

  // Ensure exactly 7 tasks (pad or trim)
  if (parsed.tasks.length > 7) {
    parsed.tasks = parsed.tasks.slice(0, 7)
  }

  return parsed
}
