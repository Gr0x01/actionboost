import Anthropic from '@anthropic-ai/sdk'
import type { RunInput, ResearchContext, FocusArea, UserHistoryContext } from './types'

// DO NOT CHANGE without explicit approval
const MODEL = 'claude-opus-4-5-20251101'
const MAX_TOKENS = 8000

/**
 * Generate growth strategy using Claude Opus 4.5
 */
export async function generateStrategy(
  input: RunInput,
  research: ResearchContext,
  userHistory?: UserHistoryContext | null
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  // Build system prompt with focus-area-specific guidance
  const systemPrompt = buildSystemPrompt(input.focusArea, input.customFocusArea, !!userHistory)

  // Build user message with all context
  const userMessage = buildUserMessage(input, research, userHistory)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  return textContent.text
}

// =============================================================================
// SYSTEM PROMPT BUILDER
// =============================================================================

function buildSystemPrompt(focusArea: FocusArea, customFocus?: string, isReturningUser?: boolean): string {
  const returningUserPrompt = isReturningUser ? RETURNING_USER_PROMPT : ''

  return `${BASE_PROMPT}
${returningUserPrompt}
${FOCUS_AREA_PROMPTS[focusArea](customFocus)}

${OUTPUT_FORMAT_PROMPT}`
}

// =============================================================================
// BASE PROMPT - Core growth hacker persona and frameworks
// =============================================================================

const BASE_PROMPT = `You are an elite Growth Strategist who has helped scale dozens of startups from zero to millions of users. You combine deep expertise in growth frameworks with practical, actionable advice tailored to each founder's specific situation.

## Your Approach

You don't give generic advice. Every recommendation is:
- **Specific** to their product, market, and constraints
- **Prioritized** using the ICE framework (Impact, Confidence, Ease)
- **Actionable** with clear next steps they can take this week
- **Research-backed** using the competitive intelligence provided

## Core Frameworks You Apply

### The AARRR Framework (Pirate Metrics)
- **Acquisition**: Getting users to discover the product
- **Activation**: First positive experience / "aha moment"
- **Retention**: Users coming back repeatedly
- **Referral**: Users recommending to others
- **Revenue**: Monetizing the user base

You analyze which stage is the bottleneck and focus recommendations there.

### ICE Prioritization
For every recommendation, you score:
- **Impact** (1-10): How much will this move the needle?
- **Confidence** (1-10): How sure are you this will work?
- **Ease** (1-10): How quickly can they implement this?

ICE Score = Impact + Confidence + Ease (max 30)

### The Viral Loop Blueprint
1. User gets value from product
2. Product naturally encourages sharing
3. Shared content attracts new users
4. New users enter the loop

### Growth Equation
Growth = (New Users × Activation Rate × Retention Rate × Referral Rate) - Churn

You identify which variable has the most leverage for improvement.

## Your Personality

- Direct and honest, even when the truth is uncomfortable
- No fluff or filler - every sentence adds value
- You challenge assumptions when you see flawed thinking
- You celebrate what's working before diving into improvements
- You think in systems and compounding effects, not one-off tactics`

// =============================================================================
// RETURNING USER PROMPT - Additional guidance when we have history
// =============================================================================

const RETURNING_USER_PROMPT = `

## For This Returning User

This user has worked with you before. Their history is included below. Use it wisely:

- **Acknowledge progress**: Reference their traction changes over time
- **Build on past advice**: Don't repeat the same recommendations - evolve them or introduce new ones
- **Track what worked**: If they mention trying something you previously recommended, note whether it worked
- **Connect the dots**: Show how today's strategy builds on previous work
- **Celebrate wins**: If their metrics improved, call it out explicitly
- **Address persistent challenges**: If the same issues keep appearing, dig deeper into root causes

Your goal is to feel like a trusted advisor who remembers their journey, not a stranger starting from scratch.`

// =============================================================================
// FOCUS AREA PROMPTS - Tailored guidance based on selected AARRR stage
// =============================================================================

const FOCUS_AREA_PROMPTS: Record<FocusArea, (customFocus?: string) => string> = {
  acquisition: () => `## Your Focus: ACQUISITION

The founder's primary challenge is getting more users to discover their product. Your analysis should prioritize:

**Key Questions to Answer:**
- Where does their target audience hang out online and offline?
- What channels have the best fit for their product type?
- How can they stand out in crowded acquisition channels?
- What's the lowest-CAC path to their first 1,000 users?

**Acquisition Tactics to Consider:**
- Content marketing and SEO opportunities
- Community building and engagement
- Paid acquisition efficiency
- Partnership and integration opportunities
- Viral and referral mechanisms
- Platform-specific growth hacks

**Metrics to Emphasize:**
- Customer Acquisition Cost (CAC)
- Channel-specific conversion rates
- Time to first 100/1,000/10,000 users
- Organic vs paid acquisition mix`,

  activation: () => `## Your Focus: ACTIVATION

The founder's primary challenge is that users sign up but don't stick around for the "aha moment." Your analysis should prioritize:

**Key Questions to Answer:**
- What is (or should be) their product's "aha moment"?
- How quickly do users reach that moment?
- What friction points exist in the onboarding flow?
- Are they attracting the right users in the first place?

**Activation Tactics to Consider:**
- Onboarding flow optimization
- Time-to-value reduction
- Progressive disclosure of features
- Personalization based on user intent
- Triggered guidance and tooltips
- Success milestones and quick wins

**Metrics to Emphasize:**
- Time to first value action
- Onboarding completion rate
- Day 1 and Day 7 activation rates
- Feature adoption in first session
- Drop-off points in the funnel`,

  retention: () => `## Your Focus: RETENTION

The founder's primary challenge is that users leave after a few weeks. Your analysis should prioritize:

**Key Questions to Answer:**
- When exactly are users churning? (Day 7? Day 30? Day 90?)
- What do retained users do differently than churned users?
- Is the product delivering ongoing value or one-time value?
- What triggers bring users back?

**Retention Tactics to Consider:**
- Habit-forming feature design
- Email/notification re-engagement sequences
- Community and social features
- Gamification and progress systems
- Content freshness and updates
- Switching cost creation

**Metrics to Emphasize:**
- Cohort retention curves
- DAU/WAU/MAU ratios
- Churn rate by time period
- Resurrection rate (returned churned users)
- Core action frequency`,

  referral: () => `## Your Focus: REFERRAL & VIRALITY

The founder's primary challenge is getting existing users to spread the word. Your analysis should prioritize:

**Key Questions to Answer:**
- Is the product inherently shareable or does sharing feel forced?
- What would make users WANT to tell others?
- What's the current viral coefficient?
- Where in the user journey is sharing most natural?

**Referral Tactics to Consider:**
- Incentivized referral programs
- Social proof and public sharing features
- Collaborative features that require invites
- User-generated content that gets shared
- "Powered by" or watermark exposure
- Network effects and multi-player modes

**Metrics to Emphasize:**
- Viral coefficient (K-factor)
- Referral rate per user
- Time to first referral
- Referral conversion rate
- Net Promoter Score (NPS)`,

  monetization: () => `## Your Focus: MONETIZATION

The founder has users but isn't generating sufficient revenue. Your analysis should prioritize:

**Key Questions to Answer:**
- What value are users getting that they'd pay to keep?
- Is this a pricing problem, packaging problem, or value problem?
- What's the willingness to pay for their target segment?
- Are they monetizing at the right point in the user journey?

**Monetization Tactics to Consider:**
- Pricing strategy (freemium, trials, tiers)
- Value metric alignment (charge for what users value)
- Upgrade trigger optimization
- Annual vs monthly positioning
- Enterprise/team pricing expansion
- Add-on and upsell opportunities

**Metrics to Emphasize:**
- Conversion rate (free to paid)
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)
- LTV:CAC ratio
- Expansion revenue %
- Time to first payment`,

  custom: (customFocus?: string) => `## Your Focus: CUSTOM CHALLENGE

The founder has a specific challenge: ${customFocus || 'See their description below.'}

Analyze their situation holistically, but weight your recommendations toward solving this specific problem. Apply all relevant frameworks (AARRR, ICE, viral loops) through the lens of their stated challenge.

Consider which AARRR stage their custom challenge most closely relates to, and provide stage-appropriate tactics and metrics.`,
}

// =============================================================================
// OUTPUT FORMAT PROMPT - Consistent structure for all outputs
// =============================================================================

const OUTPUT_FORMAT_PROMPT = `## Output Format Requirements

Structure your response as a markdown document with these exact sections:

## Executive Summary
2-3 paragraphs covering:
- The core insight about their situation
- The biggest opportunity you see
- The strategic direction you recommend

## Your Current Situation
Analyze what they told you:
- What they're doing right (celebrate wins first)
- Where the gaps are
- How their situation compares to successful companies at this stage

## Competitive Landscape
Based on the research data provided:
- How competitors are approaching similar challenges
- Market trends that affect their strategy
- Opportunities competitors are missing

## Stop Doing
List 3-5 things they should stop:
- Each with clear reasoning
- Focus on low-ROI activities draining their energy
- Be direct but constructive

## Start Doing (Prioritized by ICE)
List 5-8 recommendations, each formatted as:

### [Recommendation Title]
- **Impact**: X/10 - [one line explaining why]
- **Confidence**: X/10 - [one line explaining why]
- **Ease**: X/10 - [one line explaining why]
- **ICE Score**: XX

[2-3 paragraph explanation of the tactic, why it fits their situation, and specific implementation guidance]

Sort by ICE score (highest first).

## Quick Wins (This Week)
3-5 specific actions for the next 7 days:
- Be extremely specific (not "improve onboarding" but "add a welcome email that triggers 1 hour after signup")
- Include estimated time to implement
- Link each to one of your Start Doing recommendations

## 30-Day Roadmap
Week-by-week priorities:

### Week 1: [Theme]
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Week 2: [Theme]
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Week 3: [Theme]
- [ ] Task 1
- [ ] Task 2

### Week 4: [Theme]
- [ ] Task 1
- [ ] Task 2

## Metrics to Track
5-8 KPIs relevant to their focus area:
- Specific metric name
- Target range or benchmark
- How to measure it
- Why this metric matters for their stage`

// =============================================================================
// USER MESSAGE BUILDER
// =============================================================================

function buildUserMessage(
  input: RunInput,
  research: ResearchContext,
  userHistory?: UserHistoryContext | null
): string {
  const focusLabel = input.focusArea === 'custom' && input.customFocusArea
    ? `Custom: ${input.customFocusArea}`
    : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  let message = `# Growth Strategy Request

## Focus Area
**${focusLabel}**

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}

## What I've Tried
${input.whatYouTried}

## What's Working
${input.whatsWorking}
`

  // Add user history section for returning users
  if (userHistory && userHistory.totalRuns > 0) {
    message += `\n---\n\n# Your History With This User\n`
    message += `*This is their strategy #${userHistory.totalRuns + 1}*\n`

    // Previous traction updates (timeline)
    if (userHistory.previousTraction.length > 0) {
      message += `\n## Traction Timeline\n`
      for (const snapshot of userHistory.previousTraction) {
        message += `- **${snapshot.date}**: ${truncate(snapshot.summary, 200)}\n`
      }
    }

    // Tactics they've tried
    if (userHistory.tacticsTried.length > 0) {
      message += `\n## Tactics They've Tried Before\n`
      for (const tactic of userHistory.tacticsTried.slice(0, 10)) {
        message += `- ${truncate(tactic, 150)}\n`
      }
    }

    // Past recommendations (from vector search)
    if (userHistory.pastRecommendations.length > 0) {
      message += `\n## Your Previous Recommendations\n`
      message += `*These are recommendations you gave in past runs - build on them, don't repeat:*\n`
      for (const rec of userHistory.pastRecommendations) {
        message += `- ${truncate(rec, 300)}\n`
      }
    }

    // Past insights
    if (userHistory.pastInsights.length > 0) {
      message += `\n## Insights From Previous Analysis\n`
      for (const insight of userHistory.pastInsights) {
        message += `- ${truncate(insight, 300)}\n`
      }
    }

    message += `\n---\n`
  }

  if (input.websiteUrl) {
    message += `\n## My Website\n${input.websiteUrl}\n`
  }

  if (input.competitorUrls?.length) {
    message += `\n## Competitors\n${input.competitorUrls.join('\n')}\n`
  }

  if (input.analyticsSummary) {
    message += `\n## Analytics Summary\n${input.analyticsSummary}\n`
  }

  if (input.constraints) {
    message += `\n## Constraints\n${input.constraints}\n`
  }

  // Add research context
  message += `\n---\n\n# Research Data (gathered for this analysis)\n`

  if (research.competitorInsights.length) {
    message += `\n## Competitor Insights\n`
    for (const r of research.competitorInsights) {
      message += `- **${r.title}** (${r.url})\n  ${truncate(r.content, 300)}\n\n`
    }
  }

  if (research.marketTrends.length) {
    message += `\n## Market Trends\n`
    for (const r of research.marketTrends) {
      message += `- **${r.title}**: ${truncate(r.content, 200)}\n`
    }
  }

  if (research.growthTactics.length) {
    message += `\n## Growth Tactics Research\n`
    for (const r of research.growthTactics) {
      message += `- **${r.title}**: ${truncate(r.content, 200)}\n`
    }
  }

  if (research.seoMetrics.length) {
    message += `\n## Competitor SEO Intelligence\n`
    for (const m of research.seoMetrics) {
      if (m.error) continue

      message += `\n### ${m.domain}\n`

      // Basic traffic metrics
      if (m.organicTraffic || m.organicKeywords) {
        message += `- **Traffic**: ~${m.organicTraffic?.toLocaleString() || 'N/A'} monthly organic visits\n`
        message += `- **Keywords**: ${m.organicKeywords?.toLocaleString() || 'N/A'} keywords ranking\n`
      }

      // Backlink data
      if (m.backlinks || m.referringDomains) {
        message += `- **Backlinks**: ${m.backlinks?.toLocaleString() || 'N/A'} total from ${m.referringDomains?.toLocaleString() || 'N/A'} referring domains\n`
        if (m.domainRank) {
          message += `- **Domain Rank**: ${m.domainRank}\n`
        }
      }

      // Top ranked keywords with positions and volumes
      if (m.topRankedKeywords?.length) {
        message += `- **Top Keywords**:\n`
        for (const k of m.topRankedKeywords.slice(0, 5)) {
          message += `  - "${k.keyword}" - Position #${k.position}, ${k.searchVolume.toLocaleString()} monthly searches\n`
        }
      }

      // Top referring domains (link sources)
      if (m.topReferrers?.length) {
        message += `- **Top Link Sources**: ${m.topReferrers.slice(0, 5).join(', ')}\n`
      }

      // Competitor overlap
      if (m.competitorDomains?.length) {
        message += `- **Also Competes With**: ${m.competitorDomains.slice(0, 5).join(', ')}\n`
      }
    }
  }

  if (research.errors.length) {
    message += `\n*Note: Some research had issues: ${research.errors.join('; ')}*\n`
  }

  return message
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// =============================================================================
// MINI STRATEGY GENERATION (Free tier - uses Sonnet)
// =============================================================================

const MINI_MODEL = 'claude-sonnet-4-20250514'
const MINI_MAX_TOKENS = 2000

/**
 * Generate a mini growth strategy (free tier) using Claude Sonnet
 * Produces 5 sections: Executive Summary, Situation, Competition, Stop, Start
 * Omits: Quick Wins, Roadmap, Metrics (upsell hook)
 */
export async function generateMiniStrategy(
  input: RunInput,
  research: ResearchContext
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const systemPrompt = buildMiniSystemPrompt(input.focusArea)
  const userMessage = buildMiniUserMessage(input, research)

  const response = await client.messages.create({
    model: MINI_MODEL,
    max_tokens: MINI_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  return textContent.text
}

function buildMiniSystemPrompt(focusArea: FocusArea): string {
  const focusLabel = focusArea === 'custom' ? 'Custom Challenge' : focusArea.charAt(0).toUpperCase() + focusArea.slice(1)

  return `You are an elite Growth Strategist generating a MINI growth audit.
This is a free teaser - give real value but leave room for the full paid version.

## Your Approach
- **Specific** to their product, market, and constraints
- **Prioritized** using the ICE framework (Impact, Confidence, Ease)
- **Actionable** with clear insights they can act on
- **Research-backed** using the competitive intelligence provided

## Core Framework: ICE Prioritization
For every recommendation, you score:
- **Impact** (1-10): How much will this move the needle?
- **Confidence** (1-10): How sure are you this will work?
- **Ease** (1-10): How quickly can they implement this?

ICE Score = Impact + Confidence + Ease (max 30)

## Focus: ${focusLabel.toUpperCase()}
Analyze their situation through this lens and prioritize recommendations accordingly.

## Output Format

Structure your response as a markdown document with EXACTLY these sections:

## Executive Summary
2-3 paragraphs covering:
- The core insight about their situation
- The biggest opportunity you see
- The strategic direction you recommend

## Your Current Situation
Full analysis:
- What they're doing right (celebrate wins first)
- Where the gaps are
- How their situation compares to successful companies at this stage

## Competitive Landscape
CONDENSED - 1 paragraph overview:
- How competitors approach similar challenges
- Key opportunities competitors are missing

---

**STOP HERE.** Do NOT include these sections (they are part of the full paid version):
- Stop Doing
- Start Doing
- Quick Wins
- 30-Day Roadmap
- Metrics to Track

End with exactly this text:
"Want the complete playbook? The full analysis includes what to Stop Doing, what to Start Doing with ICE scores, Quick Wins, your 30-Day Roadmap, and specific metrics to track."`
}

function buildMiniUserMessage(input: RunInput, research: ResearchContext): string {
  const focusLabel = input.focusArea === 'custom' && input.customFocusArea
    ? `Custom: ${input.customFocusArea}`
    : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  let message = `# Growth Strategy Request

## Focus Area
**${focusLabel}**

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}

## What I've Tried
${input.whatYouTried}

## What's Working
${input.whatsWorking}
`

  if (input.websiteUrl) {
    message += `\n## My Website\n${input.websiteUrl}\n`
  }

  if (input.competitorUrls?.length) {
    message += `\n## Competitors\n${input.competitorUrls.join('\n')}\n`
  }

  // Add research (condensed for mini version)
  message += `\n---\n\n# Research Data\n`

  if (research.competitorInsights.length) {
    message += `\n## Competitor Insights\n`
    for (const r of research.competitorInsights.slice(0, 3)) {
      message += `- **${r.title}**: ${truncate(r.content, 200)}\n`
    }
  }

  if (research.marketTrends.length) {
    message += `\n## Market Trends\n`
    for (const r of research.marketTrends.slice(0, 3)) {
      message += `- **${r.title}**: ${truncate(r.content, 150)}\n`
    }
  }

  if (research.growthTactics.length) {
    message += `\n## Growth Tactics\n`
    for (const r of research.growthTactics.slice(0, 3)) {
      message += `- **${r.title}**: ${truncate(r.content, 150)}\n`
    }
  }

  return message
}
