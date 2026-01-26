import Anthropic from '@anthropic-ai/sdk'
import type { RunInput, ResearchContext, FocusArea, UserHistoryContext } from './types'

// DO NOT CHANGE without explicit approval
const MODEL = 'claude-opus-4-5-20251101'
const MAX_TOKENS = 12000

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

const BASE_PROMPT = `You are an elite Growth Strategist who has helped scale dozens of businesses from zero to millions in revenue. You combine deep expertise in positioning, brand strategy, and growth frameworks with practical, actionable advice tailored to each business's specific situation.

## Your Approach

You don't give generic advice. Every recommendation is:
- **Specific** to their product, market, and constraints
- **Positioning-aware** - tactics only work when positioning is clear
- **Prioritized** using the ICE framework (Impact, Confidence, Ease)
- **Actionable** with clear next steps they can take this week
- **Research-backed** using the competitive intelligence provided

## Core Frameworks You Apply

### Positioning First (April Dunford's "Obviously Awesome")
Before recommending tactics, you assess positioning clarity:
1. **Competitive Alternatives**: What would customers do if this didn't exist? (Not just direct competitors - include "do nothing," spreadsheets, hiring someone, etc.)
2. **Unique Attributes**: What does this have that alternatives don't?
3. **Value**: What capability do those unique attributes enable for customers?
4. **Target Segments**: Who cares most about that value? (Be specific - not "small businesses" but "salon owners with 2-5 employees")
5. **Market Category**: What's the best context to frame this value? (Sometimes the right category doesn't exist yet)

If positioning is unclear, you flag it. Unclear positioning makes all tactics less effective.

### Brand-First Thinking (Dave Gerhardt's Approach)
- **Brand before demand gen**: People buy from brands they trust
- **Content builds trust**: Educational content > promotional content
- **Be human**: Businesses don't have to be boring - personality differentiates
- **Community compounds**: Building community > renting audiences

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
- You think in systems and compounding effects, not one-off tactics
- You explain WHY something works, not just WHAT to do
- **NEVER use emojis** - not in headers, not in lists, not anywhere. This is non-negotiable.`

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
- Answer Engine Optimization (AEO) for AI search visibility
- Dark social seeding (Slack, Discord, WhatsApp communities)
- Community-led growth and user-generated advocacy
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

## Your Situation

### Positioning Check
Assess their positioning clarity (be direct if it's unclear):
- **What you're competing against**: Not just named competitors - include "doing nothing," manual workarounds, hiring someone, etc.
- **What makes you different**: The unique attributes that matter to customers
- **Who cares most**: Specific customer segment that values this difference
- **Positioning verdict**: Clear/Needs work/Unclear - if unclear, this is the #1 priority before tactics

### AARRR Analysis
- Which stage is their bottleneck? (Acquisition/Activation/Retention/Referral/Revenue)
- What they're doing right (celebrate wins first)
- Where the gaps are
- If useful, include a simple comparison table:

| Metric | Their Current | Typical Benchmark |
|--------|---------------|-------------------|
| ...    | ...           | ...               |

## Your SEO Landscape
*Only include if user's SEO data is available in the research*

Analyze their current search presence:
- Current organic visibility and traffic estimates
- Their strongest keywords and positions
- **Keyword gaps**: Keywords competitors rank for that they're missing (prioritize by search volume and relevance)
- Quick win opportunities (keywords they could easily improve)

| Keyword Opportunity | Search Volume | Difficulty | Why It Matters |
|---------------------|---------------|------------|----------------|
| ...                 | ...           | ...        | ...            |

## Market Sentiment
*Only include if Reddit discussions or G2 reviews are available*

What the market is saying:
- **Community discussions**: Pain points and desires from Reddit/forums
- **Competitor weaknesses**: What users complain about (opportunity for differentiation)
- **Unmet needs**: Gaps in the market based on reviews and discussions

## Competitive Landscape
Think beyond direct competitors - include ALL alternatives customers might choose:

| Alternative | What They Offer | Why Customers Choose Them | Your Advantage |
|-------------|-----------------|---------------------------|----------------|
| Direct competitor | ... | ... | ... |
| DIY/Manual approach | ... | ... | ... |
| Hiring someone | ... | ... | ... |
| Doing nothing | ... | ... | ... |

Include 2-3 sentences on market trends or opportunities competitors are missing.
If traffic data is available, note where competitors get their traffic (organic, paid, social, etc.).

## Channel Strategy
Prioritize 4-6 acquisition/growth channels for their specific situation:

| Channel | Effort/Week | Time to Results | Priority |
|---------|-------------|-----------------|----------|
| ...     | X hrs       | Y weeks         | HIGH/MEDIUM/LOW |

Brief explanation (2-3 sentences each) for their top 2 recommended channels.

## Stop Doing
3-5 things to stop, each with one-line reasoning:
- **[Thing to stop]**: [Why it's draining ROI]

Be direct but constructive.

## Start Doing (Prioritized by ICE)
5-8 recommendations, each formatted as:

### [Recommendation Title]
- **Impact**: X/10 - [one line why]
- **Confidence**: X/10 - [one line why]
- **Ease**: X/10 - [one line why]
- **ICE Score**: XX

[2-3 paragraph implementation guidance specific to their situation]

Sort by ICE score (highest first).

## Week 1: [Theme]
Day-by-day quick wins for days 1-7:

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 1   | [Specific action] | X hr | [How to know it worked] |
| 2   | ... | ... | ... |
| 3   | ... | ... | ... |
| 4   | ... | ... | ... |
| 5   | ... | ... | ... |
| 6   | ... | ... | ... |
| 7   | ... | ... | ... |

## Week 2: [Theme]
Day-by-day actions for days 8-14:

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 8   | [Specific action] | X hr | [How to know it worked] |
| 9   | ... | ... | ... |
| 10  | ... | ... | ... |
| 11  | ... | ... | ... |
| 12  | ... | ... | ... |
| 13  | ... | ... | ... |
| 14  | ... | ... | ... |

## Week 3: [Theme]
Day-by-day actions for days 15-21:

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 15  | [Specific action] | X hr | [How to know it worked] |
| 16  | ... | ... | ... |
| 17  | ... | ... | ... |
| 18  | ... | ... | ... |
| 19  | ... | ... | ... |
| 20  | ... | ... | ... |
| 21  | ... | ... | ... |

## Week 4: [Theme]
Day-by-day actions for days 22-28:

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 22  | [Specific action] | X hr | [How to know it worked] |
| 23  | ... | ... | ... |
| 24  | ... | ... | ... |
| 25  | ... | ... | ... |
| 26  | ... | ... | ... |
| 27  | ... | ... | ... |
| 28  | ... | ... | ... |

Be extremely specific (not "improve onboarding" but "add welcome email that triggers 1 hour after signup").

## Metrics Dashboard
Track progress with AARRR-aligned metrics:

| Stage | Metric | Target | How to Measure |
|-------|--------|--------|----------------|
| Acquisition | [Specific metric] | [Target number] | [Tool/method] |
| Activation | ... | ... | ... |
| Retention | ... | ... | ... |
| Referral | ... | ... | ... |
| Revenue | ... | ... | ... |

Add 2-3 additional metrics specific to their focus area.

## Content Templates
2-3 ready-to-use templates for their top recommended channel:

\`\`\`
[TEMPLATE NAME - e.g., "REDDIT POST TEMPLATE"]
[Ready-to-copy content that they can customize and use immediately]
\`\`\`

Make templates specific to their product and situation, not generic.

---

## Content Formatting Rules

- **Tables**: Use for comparative data (channels, metrics, competitors, weekly actions). Keep to 4-5 columns max.
- **Code blocks**: ONLY for Content Templates section. Never for explanatory text.
- **Bold**: Use **bold** for emphasis on key terms and table headers.`

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

  // Support both new (tacticsAndResults) and legacy (whatYouTried + whatsWorking) fields
  const tacticsContent = input.tacticsAndResults ||
    [input.whatYouTried, input.whatsWorking].filter(Boolean).join('\n\n') ||
    ''

  let message = `# Growth Strategy Request

## Focus Area
**${focusLabel}**

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}
`

  // Add competitive alternatives (positioning context) - this is key for positioning analysis
  if (input.alternatives && input.alternatives.length > 0) {
    message += `
## What People Do Instead of Using Me (Competitive Alternatives)
${input.alternatives.map(alt => `- ${alt}`).join('\n')}
`
  }

  // Add tactics if provided (legacy field or combined in productDescription)
  if (tacticsContent) {
    message += `
## What I've Tried & How It's Going
${tacticsContent}
`
  }

  // Add user history section for returning users
  if (userHistory && userHistory.totalRuns > 0) {
    message += `\n---\n\n# Your History With This User\n`
    message += `*This is their strategy #${userHistory.totalRuns + 1}*\n`

    // Previous traction updates (timeline)
    if (userHistory.previousTraction.length > 0) {
      message += `\n## Traction Timeline\n`
      for (const snapshot of userHistory.previousTraction) {
        message += `- **${snapshot.date}**: ${truncate(snapshot.summary, 500)}\n`
      }
    }

    // Tactics they've tried
    if (userHistory.tacticsTried.length > 0) {
      message += `\n## Tactics They've Tried Before\n`
      for (const tactic of userHistory.tacticsTried.slice(0, 10)) {
        message += `- ${truncate(tactic, 400)}\n`
      }
    }

    // Past recommendations (from vector search)
    if (userHistory.pastRecommendations.length > 0) {
      message += `\n## Your Previous Recommendations\n`
      message += `*These are recommendations you gave in past runs - build on them, don't repeat:*\n`
      for (const rec of userHistory.pastRecommendations) {
        message += `- ${truncate(rec, 600)}\n`
      }
    }

    // Past insights
    if (userHistory.pastInsights.length > 0) {
      message += `\n## Insights From Previous Analysis\n`
      for (const insight of userHistory.pastInsights) {
        message += `- ${truncate(insight, 600)}\n`
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

  // User's own SEO landscape
  if (research.userSEO && !research.userSEO.error) {
    message += `\n## Your SEO Position\n`
    message += `**Domain**: ${research.userSEO.domain}\n`
    if (research.userSEO.organicTraffic || research.userSEO.organicKeywords) {
      message += `- **Current Traffic**: ~${research.userSEO.organicTraffic?.toLocaleString() || 'N/A'} monthly organic visits\n`
      message += `- **Keywords Ranking**: ${research.userSEO.organicKeywords?.toLocaleString() || 'N/A'} keywords\n`
    }
    if (research.userSEO.domainRank) {
      message += `- **Domain Authority**: ${research.userSEO.domainRank}\n`
    }
    if (research.userSEO.topRankedKeywords?.length) {
      message += `- **Your Top Keywords**:\n`
      for (const k of research.userSEO.topRankedKeywords.slice(0, 10)) {
        message += `  - "${k.keyword}" - Position #${k.position}, ${k.searchVolume.toLocaleString()} monthly searches\n`
      }
    }
    if (research.userSEO.keywordGaps?.length) {
      message += `\n### Keyword Gaps (competitors rank, you don't)\n`
      for (const gap of research.userSEO.keywordGaps.slice(0, 15)) {
        message += `- "${gap.keyword}" - ${gap.searchVolume.toLocaleString()} searches/mo, ${gap.competitorDomain} ranks #${gap.competitorPosition}\n`
      }
    }
  }

  // Reddit discussions
  if (research.redditDiscussions?.length) {
    message += `\n## Reddit Discussions (community sentiment)\n`
    for (const r of research.redditDiscussions.slice(0, 8)) {
      message += `- **r/${r.subreddit}**: [${r.title}](${r.url})\n  ${truncate(r.content, 300)}\n\n`
    }
  }

  // G2 reviews
  if (research.g2Reviews?.length) {
    message += `\n## Competitor Reviews (G2)\n`
    for (const review of research.g2Reviews) {
      message += `\n### ${review.productName}\n`
      message += `- **Rating**: ${review.overallRating}/5 (${review.totalReviews} reviews)\n`
      if (review.topPraises?.length) {
        message += `- **What Users Love**: ${review.topPraises.slice(0, 3).join('; ')}\n`
      }
      if (review.topComplaints?.length) {
        message += `- **Common Complaints**: ${review.topComplaints.slice(0, 3).join('; ')}\n`
      }
    }
  }

  // Traffic intelligence
  if (research.trafficIntel?.length) {
    message += `\n## Traffic Intelligence\n`
    for (const intel of research.trafficIntel) {
      if (intel.error) continue
      message += `\n### ${intel.domain}\n`
      if (intel.monthlyVisits) {
        message += `- **Monthly Visits**: ~${intel.monthlyVisits.toLocaleString()}\n`
      }
      if (intel.topTrafficSources?.length) {
        message += `- **Traffic Sources**: ${intel.topTrafficSources.slice(0, 4).map(s => `${s.source} (${s.percentage.toFixed(1)}%)`).join(', ')}\n`
      }
      if (intel.geographyBreakdown?.length) {
        message += `- **Top Countries**: ${intel.geographyBreakdown.slice(0, 3).map(g => `${g.country} (${g.percentage.toFixed(1)}%)`).join(', ')}\n`
      }
    }
  }

  // ProductHunt launches
  if (research.productHuntLaunches?.length) {
    message += `\n## Recent ProductHunt Launches (similar space)\n`
    for (const launch of research.productHuntLaunches.slice(0, 5)) {
      message += `- **${launch.name}**: "${launch.tagline}" - ${launch.votesCount} upvotes\n`
    }
  }

  // Standard Tavily research
  if (research.competitorInsights.length) {
    message += `\n## Competitor Insights\n`
    for (const r of research.competitorInsights) {
      message += `- **${r.title}** (${r.url})\n  ${truncate(r.content, 500)}\n\n`
    }
  }

  if (research.marketTrends.length) {
    message += `\n## Market Trends\n`
    for (const r of research.marketTrends) {
      message += `- **${r.title}**: ${truncate(r.content, 400)}\n`
    }
  }

  if (research.growthTactics.length) {
    message += `\n## Growth Tactics Research\n`
    for (const r of research.growthTactics) {
      message += `- **${r.title}**: ${truncate(r.content, 400)}\n`
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
// =============================================================================
// POSITIONING PREVIEW GENERATION (Free tier V2 - focused on positioning + discovery)
// =============================================================================

// Free audit uses Sonnet for cost efficiency (64% cheaper than Opus, quality is good)
// See memory-bank/decisions.md for model testing results (Jan 27, 2026)
export const FREE_AUDIT_MODEL = 'claude-sonnet-4-20250514'
const PREVIEW_MODEL = FREE_AUDIT_MODEL
const PREVIEW_MAX_TOKENS = 2000 // Shorter than mini - just positioning + discovery

/**
 * Generate a positioning preview (free tier V2)
 * Focused output: positioning analysis + 1-2 key discoveries
 * Designed to prove "we understand YOUR business" before paywall
 *
 * @param input - User's form input
 * @param research - Research context from Tavily
 * @param options - Optional config (model override for testing)
 */
export async function generatePositioningPreview(
  input: RunInput,
  research: ResearchContext,
  options?: { model?: string }
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const model = options?.model || PREVIEW_MODEL
  const systemPrompt = buildPositioningPreviewPrompt()
  const userMessage = buildPositioningPreviewUserMessage(input, research)

  const response = await client.messages.create({
    model,
    max_tokens: PREVIEW_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  return textContent.text
}

function buildPositioningPreviewPrompt(): string {
  return `You are an elite Growth Strategist creating a POSITIONING PREVIEW.

This is a free preview to prove you understand their specific business. Your job:
1. Analyze their positioning with surgical precision
2. Find 1-2 surprising discoveries from the research that they couldn't find themselves

## Your Approach
- **Hyper-specific** - reference their actual product, competitors, market
- **Positioning-focused** - use April Dunford's framework to assess clarity
- **Discovery-driven** - find something surprising from the research data
- **NEVER use emojis** - not anywhere. Non-negotiable.

## Positioning Framework (April Dunford)
Assess:
1. What alternatives exist? (competitors, DIY, do nothing)
2. What makes them different from those alternatives?
3. What value do those differences enable?
4. Who cares most about that value?
5. What market category frames them best?

Verdict:
- **Clear**: Strong differentiation, obvious target, compelling value
- **Needs work**: Some clarity but gaps in differentiation or targeting
- **Unclear**: Confused positioning, trying to be everything to everyone

## Discovery Guidelines
A good discovery is:
- **Unexpected** - not common knowledge, not obvious from their input
- **Specific** - names, numbers, concrete facts
- **Actionable** - they can use this insight
- **Sourced** - from the research data provided

Bad discoveries (avoid):
- Generic advice ("post consistently", "improve SEO")
- Things they already told you
- Vague observations without specifics

## Output Format

Structure your response as markdown with EXACTLY these sections:

## Your Situation

**Positioning Assessment**

[2-3 paragraphs analyzing their positioning:]
- Current state: How clearly are they positioned? What's working?
- Key insight: The most important thing about their market position
- Verdict: Clear / Needs work / Unclear

**What Makes You Different**
[1-2 sentences on their unique value vs alternatives]

**Who You Serve Best**
[1-2 sentences on their ideal customer segment]

## Key Discoveries

### [Discovery 1 Title - 5-10 words, specific]
[1-3 sentences explaining the discovery]

*Source: [Where this came from - Reddit, competitor site, etc.]*

**Why it matters:** [1 sentence on strategic significance]

### [Discovery 2 Title - optional, only if genuinely surprising]
[Same format as above]

---

**STOP HERE.** This is a preview. The full analysis includes priority actions, 30-day roadmap, competitive comparison, keyword opportunities, and more.`
}

function buildPositioningPreviewUserMessage(input: RunInput, research: ResearchContext): string {
  const sections: string[] = []

  // Business context
  sections.push('## Business Information')
  if (input.websiteUrl) {
    sections.push(`Website: ${input.websiteUrl}`)
  }
  if (input.productDescription) {
    sections.push(`\nProduct/Service:\n${input.productDescription.slice(0, 1000)}`)
  }
  // Check legacy fields for tactics info
  const tacticsTried = input.tacticsAndResults || input.whatYouTried || input.whatsWorking
  if (tacticsTried) {
    sections.push(`\nWhat they've tried:\n${tacticsTried.slice(0, 500)}`)
  }
  if (input.alternatives && input.alternatives.length > 0) {
    sections.push(`\nAlternatives customers might choose: ${input.alternatives.join(', ')}`)
  }
  if (input.competitorUrls && input.competitorUrls.length > 0) {
    sections.push(`\nCompetitors: ${input.competitorUrls.join(', ')}`)
  }

  // Research data
  sections.push('\n## Research Data')

  if (research.competitorInsights.length > 0) {
    sections.push('\n### Competitor & Market Insights')
    research.competitorInsights.slice(0, 5).forEach((insight) => {
      sections.push(`- ${insight.title}: ${insight.content?.slice(0, 300) || 'No content'}`)
      if (insight.url) sections.push(`  Source: ${insight.url}`)
    })
  }

  if (research.marketTrends.length > 0) {
    sections.push('\n### Market Trends')
    research.marketTrends.slice(0, 3).forEach((trend) => {
      sections.push(`- ${trend.title}: ${trend.content?.slice(0, 200) || 'No content'}`)
    })
  }

  if (research.redditDiscussions && research.redditDiscussions.length > 0) {
    sections.push('\n### Reddit Discussions')
    research.redditDiscussions.slice(0, 3).forEach((discussion) => {
      sections.push(`- r/${discussion.subreddit}: "${discussion.title}"`)
      if (discussion.content) {
        sections.push(`  Content: "${discussion.content.slice(0, 150)}..."`)
      }
    })
  }

  if (research.errors && research.errors.length > 0) {
    sections.push(`\n(Research notes: ${research.errors.slice(0, 2).join('; ')})`)
  }

  sections.push('\n---\nAnalyze their positioning and find 1-2 surprising discoveries from this research.')

  return sections.join('\n')
}

// =============================================================================
// REFINED STRATEGY GENERATION (User provides additional context)
// =============================================================================

const REFINEMENT_PROMPT = `

## This is a REFINEMENT Request

The user has reviewed their initial strategy and wants adjustments based on additional context they've provided.

**Your task:**
1. Read their additional context carefully - this contains corrections, clarifications, or new information
2. Review the FULL previous strategy below - this is your foundation to BUILD UPON
3. Generate an ENHANCED strategy that:
   - PRESERVES everything from the previous strategy that still applies (most of it should!)
   - ADJUSTS specific sections based on the user's feedback
   - ADDS new recommendations where their feedback reveals gaps
   - REMOVES only what directly conflicts with the new information

**CRITICAL:** This is ITERATIVE IMPROVEMENT, not a rewrite. The user spent time reading the previous strategy and only wants specific parts updated based on their feedback. Keep 80-90% of the original content and refine the relevant 10-20%.

**Tone:** Frame adjustments as "Now that I know more about your situation..." not "I got it wrong before."
The user is providing information they didn't share initially, or clarifying something. This is collaborative refinement, not starting over.`

const REFINEMENT_OUTPUT_FORMAT = `## Output Format for Refinements

**IMPORTANT: You are REFINING an existing strategy, not creating a new one.**

For EACH section below:
1. If the user's feedback DOES NOT relate to this section → **COPY IT EXACTLY from the previous strategy** (word for word)
2. If the user's feedback DOES relate to this section → **Update it** while preserving any parts that still apply

The user's feedback is NARROW and SPECIFIC. Most sections should be copied unchanged.

### Sections to include (same structure as before):
- ## Executive Summary (update ONLY if feedback changes the core direction)
- ## Your Situation (update ONLY if feedback reveals new constraints/context)
- ## Your SEO Landscape (copy unless feedback is about SEO)
- ## Market Sentiment (copy unless feedback is about market/competitors)
- ## Competitive Landscape (copy unless feedback is about competitors)
- ## Channel Strategy (copy unless feedback is about channels)
- ## Stop Doing (copy unless feedback says "actually I should keep doing X")
- ## Start Doing (copy unless feedback changes priorities or adds constraints)
- ## Week 1 through ## Week 4 (update to reflect any changed recommendations)
- ## Content Ideas (copy unless feedback is about content)
- ## Metrics Dashboard (copy unless feedback changes goals)

**EXAMPLE of correct behavior:**
- User feedback: "Actually we have a $5k/month budget I didn't mention"
- Correct: Copy ALL sections except update Channel Strategy and Start Doing to factor in budget
- Wrong: Rewrite everything from scratch

**COPY SECTIONS VERBATIM when they don't need changes. The user values continuity.**`

/**
 * Generate a refined strategy based on user's additional context
 * This is called when a user provides feedback on their initial strategy
 */
export async function generateRefinedStrategy(
  input: RunInput,
  research: ResearchContext,
  additionalContext: string,
  previousOutput: string,
  userHistory?: UserHistoryContext | null
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  // Build system prompt with refinement instructions
  const systemPrompt = buildRefinementSystemPrompt(input.focusArea, input.customFocusArea, !!userHistory)

  // Build user message with all context including refinement
  const userMessage = buildRefinementUserMessage(input, research, additionalContext, previousOutput, userHistory)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  return textContent.text
}

function buildRefinementSystemPrompt(focusArea: FocusArea, customFocus?: string, isReturningUser?: boolean): string {
  const returningUserPrompt = isReturningUser ? RETURNING_USER_PROMPT : ''

  return `${BASE_PROMPT}
${REFINEMENT_PROMPT}
${returningUserPrompt}
${FOCUS_AREA_PROMPTS[focusArea](customFocus)}

${REFINEMENT_OUTPUT_FORMAT}`
}

function buildRefinementUserMessage(
  input: RunInput,
  research: ResearchContext,
  additionalContext: string,
  previousOutput: string,
  userHistory?: UserHistoryContext | null
): string {
  // Pass the FULL previous output - it's already Opus-generated quality content
  // No truncation needed, context window is 200k tokens

  // Start with the refinement context prominently
  let message = `# Strategy Refinement Request

## User's Feedback & Additional Context
**The user has reviewed their strategy and wants these specific adjustments:**

${additionalContext}

---

## Previous Strategy (YOUR FOUNDATION - BUILD UPON THIS)
**This is your previous strategy. PRESERVE what still applies, only ADJUST what the user's feedback addresses:**

${previousOutput}

---

`

  // Then add the standard context
  const focusLabel = input.focusArea === 'custom' && input.customFocusArea
    ? `Custom: ${input.customFocusArea}`
    : input.focusArea.charAt(0).toUpperCase() + input.focusArea.slice(1)

  // Support both new (tacticsAndResults) and legacy (whatYouTried + whatsWorking) fields
  const tacticsContent = input.tacticsAndResults ||
    [input.whatYouTried, input.whatsWorking].filter(Boolean).join('\n\n') ||
    ''

  message += `# Original Request Context

## Focus Area
**${focusLabel}**

## About My Product
${input.productDescription}

## Current Traction
${input.currentTraction}
`

  // Add competitive alternatives if provided
  if (input.alternatives && input.alternatives.length > 0) {
    message += `
## What People Do Instead
${input.alternatives.map(alt => `- ${alt}`).join('\n')}
`
  }

  // Add tactics if provided
  if (tacticsContent) {
    message += `
## What I've Tried
${tacticsContent}
`
  }

  // Add user history if available
  if (userHistory && userHistory.totalRuns > 0) {
    message += `\n---\n\n# User History\n`
    message += `*This is their strategy #${userHistory.totalRuns + 1}*\n`

    if (userHistory.previousTraction.length > 0) {
      message += `\n## Traction Timeline\n`
      for (const snapshot of userHistory.previousTraction) {
        message += `- **${snapshot.date}**: ${truncate(snapshot.summary, 500)}\n`
      }
    }

    if (userHistory.tacticsTried.length > 0) {
      message += `\n## Tactics They've Tried Before\n`
      for (const tactic of userHistory.tacticsTried.slice(0, 10)) {
        message += `- ${truncate(tactic, 400)}\n`
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

  // Add research context (same as regular generation)
  message += `\n---\n\n# Research Data\n`

  if (research.competitorInsights.length) {
    message += `\n## Competitor Insights\n`
    for (const r of research.competitorInsights) {
      message += `- **${r.title}** (${r.url})\n  ${truncate(r.content, 500)}\n\n`
    }
  }

  if (research.marketTrends.length) {
    message += `\n## Market Trends\n`
    for (const r of research.marketTrends) {
      message += `- **${r.title}**: ${truncate(r.content, 400)}\n`
    }
  }

  if (research.growthTactics.length) {
    message += `\n## Growth Tactics Research\n`
    for (const r of research.growthTactics) {
      message += `- **${r.title}**: ${truncate(r.content, 400)}\n`
    }
  }

  if (research.seoMetrics.length) {
    message += `\n## Competitor SEO Intelligence\n`
    for (const m of research.seoMetrics) {
      if (m.error) continue
      message += `\n### ${m.domain}\n`
      if (m.organicTraffic || m.organicKeywords) {
        message += `- **Traffic**: ~${m.organicTraffic?.toLocaleString() || 'N/A'} monthly organic visits\n`
        message += `- **Keywords**: ${m.organicKeywords?.toLocaleString() || 'N/A'} keywords ranking\n`
      }
      if (m.topRankedKeywords?.length) {
        message += `- **Top Keywords**: ${m.topRankedKeywords.slice(0, 3).map(k => `"${k.keyword}"`).join(', ')}\n`
      }
    }
  }

  return message
}
