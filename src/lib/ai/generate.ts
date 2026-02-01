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

## The Opportunity
This is the bridge between your research and your recommendations. In 3-5 sentences, name the SPECIFIC opening the research revealed and why it matters right now. Be concrete — "Your competitors are all fighting over [X] while nobody is addressing [Y pain point] that showed up repeatedly in Reddit discussions" is good. "There's a big opportunity in content marketing" is worthless.

Connect the dots between the competitive landscape, market sentiment, and SEO data to identify what this business should exploit. This section is the "therefore" — everything after it should trace back to this opportunity.

## Stop Doing
3-5 things to stop, each with one-line reasoning:
- **[Thing to stop]**: [Why it's draining ROI or distracting from the opportunity]

Be direct but constructive. Only include things that actively hurt their ability to capture the opportunity above.

## Start Doing (Prioritized by ICE)
5-8 recommendations that all serve the opportunity identified above. Each formatted as:

### [Recommendation Title]
- **Impact**: X/10 - [one line why]
- **Confidence**: X/10 - [one line why]
- **Ease**: X/10 - [one line why]
- **ICE Score**: XX

[2-3 paragraph implementation guidance specific to their situation. Explain how this connects to The Opportunity. Weave in channel recommendations here — don't list channels separately, recommend them as part of specific plays.]

Sort by ICE score (highest first). Be honest with scores — most plays are 6-8 range. If everything scores 9+, you're inflating.

## 30-Day Plan

BEFORE WRITING THE WEEKLY PLAN, form a strategic thesis internally. The thesis is your diagnosis of what's actually holding this business back and the strategic logic for fixing it. Do NOT write the thesis as a visible section — instead, let it silently drive every week of the plan so that the weeks build on each other coherently rather than being a scattershot task list.

The thesis should:
- Connect to The Opportunity section above
- Be specific to THIS business (if you could swap in a different company and the thesis still works, it's too generic)
- Dictate why these specific actions, in this order, for this business

STRUCTURAL RULES:
- Each week gets a short imperative verb phrase as its theme (3-6 words, conversational — "Put It In Front of People" not "Distribution Phase")
- Week 3-4 actions should build on Week 1-2 work. Later tasks should reference or use outputs from earlier tasks.
- Week 3 should include conditional logic in the actions themselves: "If [Week 2 signal], do X. If not, do Y instead."
- Each week should represent HIGHER sophistication than the previous. Week 1 = research/build, Week 4 = systematize.
- Max 2-3 actions per day. Each action 30-60 minutes. These are busy people.
- Be extremely specific (not "improve onboarding" but "add welcome email that triggers 1 hour after signup").
- Do not hedge. "Do this" not "consider doing this."

WEEK PROGRESSION LOGIC (adapt the specifics to the business, but follow this escalation):
- Week 1: Understand and build. Research, positioning clarity, create the raw materials the other weeks use.
- Week 2: Deploy and test. Put Week 1 assets into the market. Run 2-3 small experiments. Collect signal.
- Week 3: Read and adapt. Kill what didn't work, double down on what did. Include conditional actions based on Week 2 results.
- Week 4: Lock it in. Turn winning experiments into repeatable processes. Set up the next 30 days.

## Week 1: [Imperative Verb Phrase]

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 1   | [Specific action] | X hr | [How to know it worked] |
| 2   | ... | ... | ... |
| 3   | ... | ... | ... |
| 4   | ... | ... | ... |
| 5   | ... | ... | ... |
| 6   | ... | ... | ... |
| 7   | ... | ... | ... |

## Week 2: [Imperative Verb Phrase]

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 8   | [Actions that use Week 1 outputs] | X hr | ... |
| 9   | ... | ... | ... |
| 10  | ... | ... | ... |
| 11  | ... | ... | ... |
| 12  | ... | ... | ... |
| 13  | ... | ... | ... |
| 14  | ... | ... | ... |

## Week 3: [Imperative Verb Phrase]

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 15  | [Actions that adapt based on Week 2 results — include conditional logic] | X hr | ... |
| 16  | ... | ... | ... |
| 17  | ... | ... | ... |
| 18  | ... | ... | ... |
| 19  | ... | ... | ... |
| 20  | ... | ... | ... |
| 21  | ... | ... | ... |

## Week 4: [Imperative Verb Phrase]

| Day | Action | Time | Success Metric |
|-----|--------|------|----------------|
| 22  | [Actions that systematize Week 3 winners] | X hr | ... |
| 23  | ... | ... | ... |
| 24  | ... | ... | ... |
| 25  | ... | ... | ... |
| 26  | ... | ... | ... |
| 27  | ... | ... | ... |
| 28  | ... | ... | ... |

## Metrics Dashboard
Track progress on the opportunity — not generic AARRR metrics. Every metric should connect to the opportunity identified above.

| Stage | Metric | Target | How to Measure |
|-------|--------|--------|----------------|
| [AARRR stage or "Goal"] | [Specific metric tied to The Opportunity] | [Target number] | [Tool/method] |
| ... | ... | ... | ... |

4-6 metrics max. If a metric doesn't help them know whether they're on track toward the opportunity, cut it.

## Content Templates
2-3 ready-to-use templates connected to specific actions in the weekly plan:

\`\`\`
[TEMPLATE NAME - e.g., "REDDIT POST TEMPLATE"]
[Ready-to-copy content that they can customize and use immediately]
\`\`\`

Make templates specific to their product and situation, not generic. Reference which day/action in the plan each template supports.

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
- ## The Opportunity (update if feedback changes the strategic opening)
- ## Stop Doing (copy unless feedback says "actually I should keep doing X")
- ## Start Doing (copy unless feedback changes priorities or adds constraints)
- ## Week 1 through ## Week 4 (update to reflect any changed recommendations — maintain named deliverables, week-over-week dependencies, and conditional branching)
- ## Metrics Dashboard (copy unless feedback changes goals)
- ## Content Templates (copy unless feedback is about content)

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
