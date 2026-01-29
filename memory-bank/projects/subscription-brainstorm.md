# Boost Subscription ($49/mo) — Product Brainstorm

## The Core Insight

The one-shot plan is a diagnosis. The subscription is the treatment. A static 30-day plan stops being useful after week 1 because reality intervenes — you didn't do half the tasks, one thing worked way better than expected, and a competitor launched something. The plan needs to breathe.

---

## 1. The Weekly Loop

### User's Week
```
Monday:     See this week's tasks (generated or re-vectored)
Mon-Fri:    Check off tasks, add quick notes ("did this, got 3 signups" / "skipped, too hard")
Friday/Sat: Write weekly wrapup (5 min, guided prompts)
Sunday:     AI re-vectors next week's plan → ready Monday morning
```

### The Friday Wrapup (This Is the Product)

The wrapup is the beating heart of the subscription. It's where signal comes in. Make it dead simple — not a blank textarea. Guided prompts:

1. **What did you actually do this week?** (auto-populated from checked tasks, user confirms/edits)
2. **What worked?** (free text, but offer suggestions: "got signups", "engagement", "revenue", "learned something")
3. **What didn't work or got skipped?** (auto-populated from unchecked tasks, user adds why)
4. **Anything change in your business?** (new competitor, feature launch, funding, pivot)
5. **What do you want to focus on next week?** (optional override — user can steer)

This takes 3-5 minutes. It's reflection, not homework.

### The AI Sunday Run

Opus receives:
- Original thesis + full plan context
- All 4 weeks as originally planned
- This week's completion data + notes
- The wrapup reflection
- Accumulated history from prior weeks
- RAG-retrieved relevant past context

Opus outputs:
- Updated next week plan (day-by-day tasks adjusted)
- Brief "What I changed and why" summary (2-3 sentences — user needs to trust the AI's reasoning)
- Updated remaining weeks (lighter touch — themes/goals may shift, specific tasks only for the immediate next week)

**Key UX**: The user wakes up Monday to a notification: "Your week 2 plan is ready. Here's what changed based on your feedback." This is the moment that justifies the subscription.

---

## 2. Quick Wins vs. Compounding Plays

This is the hardest design problem. If you re-vector weekly, you'll kill every strategy that needs patience.

### The Solution: Two Track System

Every task in the plan gets classified as one of two types:

**Track A: Sprints** (quick wins, experiments, one-off tasks)
- "Post in r/SaaS with your launch story"
- "Set up email capture on your landing page"
- "Run a $50 Facebook ad test"
- These CAN be re-vectored, swapped, reprioritized weekly

**Track B: Builds** (compounding plays, multi-week investments)
- "Publish 2 SEO articles per week" (compounds over 4-8 weeks)
- "Post daily on Twitter for 30 days" (compounds via audience building)
- "Build an email nurture sequence" (compounds via automation)
- These get PROTECTED from re-vectoring unless the user explicitly says "this isn't working"

### How Re-Vectoring Handles Each Track

**Sprints**: Full flexibility. If a sprint failed, try a different one. If it worked, double down or move on.

**Builds**: AI preserves builds across weeks UNLESS:
1. User explicitly says "I want to stop doing X" in their wrapup
2. User has consistently not done the build tasks (3+ skipped in a row → AI asks "Should we drop this or recommit?")
3. New information makes the build irrelevant (competitor owns the space, pivot happened)

### In the Prompt

Tell Opus: "Build-track items are sacred. Do not remove or replace them unless the user signals abandonment or irrelevance. Sprint-track items are expendable — swap freely based on what's working."

### In the UI

Show both tracks visually. Builds get a different visual treatment — maybe a progress bar showing "Week 2 of 4" so the user sees momentum building. Sprints are checkboxes that feel more tactical.

---

## 3. Data Model

### New Tables/Columns

**Option A: Extend `runs` table** (recommended for MVP)

The subscription generates a new "run" each week, but they're linked. This reuses all existing infrastructure.

```
runs (existing, add columns):
  + subscription_id     UUID (nullable) — links runs in a subscription
  + week_number         INTEGER (nullable) — which week of the subscription
  + parent_plan_id      UUID (nullable) — the original plan this descends from
  + thesis              TEXT (nullable) — carried forward from original plan
```

```
subscriptions (new table — needed):
  id                  UUID
  user_id             UUID
  stripe_subscription_id  TEXT
  status              TEXT (active/paused/cancelled)
  current_week        INTEGER
  original_run_id     UUID — the initial $29 plan that started this
  created_at          TIMESTAMPTZ
  cancelled_at        TIMESTAMPTZ (nullable)
```

```
task_completions (new table — needed):
  id                  UUID
  run_id              UUID — which week's plan
  task_index          INTEGER — position in the week (day number or task order)
  completed           BOOLEAN
  completed_at        TIMESTAMPTZ (nullable)
  note                TEXT (nullable) — user's comment on this task
  outcome             TEXT (nullable) — "worked" / "didn't work" / "skipped"
  track               TEXT — "sprint" or "build"
```

```
weekly_wrapups (new table — needed):
  id                  UUID
  subscription_id     UUID
  week_number         INTEGER
  what_worked         TEXT
  what_didnt          TEXT
  business_changes    TEXT (nullable)
  next_week_focus     TEXT (nullable)
  raw_reflection      JSONB — full structured data
  created_at          TIMESTAMPTZ
```

**Why separate tables here**: Task completions and wrapups have their own lifecycle — they're user-generated data that grows unbounded per subscription. They don't fit as columns on runs.

### What NOT to Store Separately

- Task definitions: These live in `runs.structured_output` already. No need to duplicate.
- Thesis: Store as a column on runs, carried forward. Not its own table.
- Build/sprint classification: Part of the structured_output schema (add `track` field to `DayActionSchema`).

---

## 4. How Context Accumulates

### Layer 1: Structured Context (users.context JSONB)

Already exists. Extend with:
```typescript
{
  // ...existing fields...
  subscription: {
    currentWeek: number
    thesis: string
    activeBuilds: Array<{
      name: string
      startedWeek: number
      status: 'active' | 'paused' | 'completed' | 'abandoned'
    }>
    weeklySignals: Array<{
      week: number
      topWin: string
      topLoss: string
      completionRate: number  // 0-1
    }>
  }
}
```

### Layer 2: Embeddings (existing RAG system)

After each weekly wrapup, embed:
- The wrapup text (what worked, what didn't)
- Task outcomes with notes
- The "What I changed and why" summary from Opus

Chunk types to add: `weekly_wrapup`, `task_outcome`, `plan_adjustment`

This means by week 4, Opus has access to a rich history of what actually happened — not just what was planned.

### Layer 3: What Opus Sees at Re-Vector Time

```
System prompt (same as one-shot, plus subscription context)

User message:
1. Original thesis: "..."
2. Original 4-week plan: [summary, not full detail]
3. Current week: 2
4. Week 1 results:
   - Completed: 5/7 tasks (71%)
   - Sprint wins: "Reddit post got 40 upvotes, 3 signups"
   - Sprint losses: "Facebook ad test: $50 spent, 0 conversions"
   - Build progress: "SEO articles: 2 published (week 1 of 4)"
   - Skipped: "Didn't set up email automation (no time)"
5. User reflection: "Reddit is working way better than ads. Want to double down on community. Also launched a new feature this week."
6. RAG context: [top 5 relevant past recommendations/insights]

Output: Updated week 2 plan + "What I changed and why"
```

### Token Budget

This is where RAG matters. By week 4 you could have 3 wrapups + 20+ task outcomes + the original plan. That's potentially 3-4K tokens of history.

Strategy: Summarize aggressively. Each week's data gets compressed into ~200 tokens for the context window. Full detail available via RAG if Opus needs to drill in.

---

## 5. The Re-Generation Model

### What Changes Each Week

| Element | Changes? | How |
|---------|----------|-----|
| Thesis | Rarely | Only if user pivots or fundamental assumption invalidated |
| Week themes | Sometimes | If a sprint approach isn't working, theme may shift |
| Build-track items | Protected | Only removed with explicit user signal |
| Sprint-track items | Freely | Swapped based on what worked/didn't |
| Metrics targets | Sometimes | Adjusted based on actual results |
| Remaining weeks | Light touch | Themes may shift, specific tasks only set for next week |

### What Opus Regenerates

**Next week only** gets full day-by-day detail. Remaining weeks get theme + goal updates. This is important because:
1. Detailed plans for week 4 are useless right now — too much will change
2. It keeps generation cost reasonable (~same as one-shot per week)
3. It matches how humans actually plan (detail the near, sketch the far)

### Cost Per Weekly Re-Vector

Same as a one-shot run but potentially cheaper (less research needed):
- Opus generation: ~$0.13 (input heavier due to context, but output shorter — only 1 week detail)
- Research: $0-0.20 (may not need fresh research every week — only if business context changed)
- Embeddings: ~$0.0001
- **Total: ~$0.15-0.35 per week**

At $49/mo, that's $0.60-$1.40/mo in AI costs. **~97% margin.**

---

## 6. Subscription Value Prop

### Why $49/mo vs. Another $29 One-Shot

The one-shot gives you a plan. The subscription gives you a **system**.

| One-Shot ($29) | Subscription ($49/mo) |
|---|---|
| Static plan | Living plan that adapts weekly |
| You guess what worked | AI tracks what worked and adjusts |
| Plan is stale by week 2 | Plan is fresh every Monday |
| No accountability | Weekly check-ins keep you moving |
| Start over if it doesn't work | AI re-vectors automatically |
| "Here's what to do" | "Here's what to do NEXT, based on what happened" |

### The Upgrade Path

This is critical. The subscription should feel like the natural evolution, not a separate product.

```
User buys $29 one-shot
    → Gets thesis-driven 4-week plan
    → Executes week 1
    → Week 2: plan feels stale, they deviated, what now?
    → CTA appears: "Week 1 done? Tell us what happened. We'll adjust your plan."
    → User clicks → enters subscription flow
    → Provides week 1 wrapup
    → Gets re-vectored week 2 → hooked
```

The $29 is the gateway drug. The subscription is the treatment plan.

### Retention Hooks

1. **Monday notification**: "Your new week is ready." This is the hook that brings them back.
2. **Streak/momentum**: "Week 3 of 4 — you've completed 68% of tasks. Most users who hit 70% see results by week 6."
3. **Build progress**: Visual progress on multi-week plays. Abandoning feels like wasting investment.
4. **History**: After 2 months, the accumulated context makes Boost irreplaceable — it knows your business.
5. **Month 2 fresh plan**: After 4 weeks, Opus generates a NEW 4-week plan informed by everything that happened. This is the subscription renewal moment.

### What Happens After Week 4?

The original plan covered 4 weeks. At the end of week 4:

1. Opus generates a **Month 1 Retrospective**: What worked, what didn't, key metrics, thesis validation
2. Opus generates a **new 4-week plan** for month 2, building on everything learned
3. The thesis may evolve: "Month 1 validated that Reddit is your channel. Month 2: go deeper on Reddit + start building SEO as a compounding play."

This is the "second month" hook. The first month proved the system works. The second month builds on real data.

---

## 7. MVP Scope (What to Build First)

### Phase 1: Interactive Task List + Wrapups (1-2 weeks)

Build the core loop without AI re-vectoring. Let users interact with their existing one-shot plan.

1. Task completion tracking (checkboxes + notes, stored in DB not localStorage)
2. Weekly wrapup form (guided prompts)
3. Dashboard showing week view with completion stats
4. Store task_completions and weekly_wrapups

**Why start here**: This is useful even without re-vectoring. Users get a task manager for their Boost plan. It's also the data collection layer you need before AI can re-vector.

### Phase 2: Weekly Re-Vectoring (1-2 weeks)

Add the AI loop.

1. Sunday night Inngest cron job: for each active subscription, generate next week
2. Opus re-vector prompt with accumulated context
3. "What I changed" summary
4. Monday notification (email via Resend)
5. Sprint/Build track classification

### Phase 3: Subscription Billing (1 week)

1. Stripe subscription ($49/mo)
2. Upgrade flow from one-shot results page
3. Cancellation flow
4. Pausing (keep data, stop re-vectoring)

### Phase 4: Polish

1. Month-end retrospective generation
2. New 4-week plan generation for month 2+
3. Build progress visualization
4. Historical view (what happened each week)

---

## 8. Orchestrator Architecture

### The Problem: Prompt Bloat

The one-shot works as a single monolithic Opus call — one big system prompt, one generation. But the subscription accumulates context every week: task outcomes, wrapups, build progress, history of what worked/didn't. By month 3, you're shoving too much into Opus. The system prompt is already dense with generation instructions, positioning frameworks, and output format rules. Adding unbounded user history on top breaks.

### The Solution: Two Different Execution Models

**One-shot ($29)**: Monolithic. One Opus call with tools. Great for a single deliverable. Stays as-is.

**Subscription ($49/mo)**: Orchestrated. An Opus "manager" that holds the strategic picture and delegates detail work to focused sub-agents.

### The Orchestrator Model

```
┌─────────────────────────────────────────────┐
│           ORCHESTRATOR (Opus)                │
│                                             │
│  Holds:                                     │
│  ├── Thesis (from original plan)            │
│  ├── Active builds + status                 │
│  ├── Weekly signals (compressed)            │
│  ├── Haiku-generated history briefing       │
│  └── Current week number + arc position     │
│                                             │
│  Decides:                                   │
│  ├── What needs attention this week         │
│  ├── Which builds to protect vs revisit     │
│  ├── Whether thesis needs updating          │
│  └── What research is needed                │
│                                             │
│  Calls sub-agents via tool use:             │
└──────────┬──────────────────────────────────┘
           │
     ┌─────┴─────┬──────────┬──────────┬──────────┐
     ▼           ▼          ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Research │ │History │ │Sprint  │ │Build   │ │Wrapup  │
│Agent    │ │Agent   │ │Planner │ │Tracker │ │Analyzer│
│         │ │        │ │        │ │        │ │        │
│Tavily + │ │RAG     │ │Generate│ │Check   │ │Parse   │
│DataFor  │ │search  │ │3-5 exp │ │progress│ │user's  │
│SEO      │ │user    │ │for the │ │on multi│ │Friday  │
│         │ │history │ │week    │ │-week   │ │wrapup  │
│         │ │        │ │        │ │plays   │ │        │
│Sonnet/  │ │Haiku   │ │Sonnet  │ │Haiku   │ │Haiku   │
│tools    │ │        │ │        │ │        │ │        │
└─────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### How It Solves Prompt Bloat

The orchestrator prompt stays lean (~1-2K tokens) regardless of how much history exists:

| Context Type | Where It Lives | Tokens |
|---|---|---|
| Thesis + week number | Always in orchestrator prompt | ~50 |
| Active builds + status | Always in orchestrator prompt | ~100 |
| Last week's completion stats | Always in orchestrator prompt | ~50 |
| Haiku-compressed history briefing | Always in orchestrator prompt | ~500 |
| Detailed past outcomes | Retrieved by History Agent on demand | 0 (unless requested) |
| Fresh competitor data | Retrieved by Research Agent on demand | 0 (unless requested) |
| Full wrapup text | Retrieved by Wrapup Analyzer on demand | 0 (unless requested) |

**Total base prompt: ~700 tokens of user context** — same whether it's week 1 or week 52.

### The Haiku Briefing Layer

Before each orchestrator run, Haiku reads ALL accumulated history and compresses it into a ~500 token briefing:

```
"Month 1 summary: User validated Reddit as primary channel (3 posts,
avg 30 upvotes, 8 signups). Facebook ads tested and abandoned ($50,
0 conversions). SEO build started week 2, 4 articles published, no
organic traffic yet (expected). Email list at 45 subscribers.
Completion rate trending up: 50% → 71% → 80%. User energy high on
community tactics, low on paid acquisition. Thesis still valid:
organic community-first growth."
```

This briefing is the orchestrator's "memory." It costs ~$0.001 to generate and replaces thousands of tokens of raw history.

### Sub-Agent Responsibilities

**Research Agent** (Sonnet + tools)
- Fresh competitive intel when orchestrator requests it
- "Check if competitor launched anything this week"
- "Find new Reddit threads about [topic]"
- Only called when orchestrator decides research is needed (not every week)

**History Agent** (Haiku + RAG)
- Searches embeddings for specific past outcomes
- "What happened last time they tried paid ads?"
- "Which Reddit subreddits got the most engagement?"
- Returns focused context, not everything

**Sprint Planner** (Sonnet)
- Given: this week's focus, what worked/didn't, user preferences
- Outputs: 3-5 tactical experiments for the week with time estimates
- Focused generation, no strategic reasoning needed

**Build Tracker** (Haiku)
- Given: list of active builds, completion data, timeline
- Outputs: progress report, flags for stalled builds
- "SEO build: week 3 of 4, 6/8 articles published, on track"
- "Email sequence: 2 weeks, no progress — recommend: recommit or drop?"

**Wrapup Analyzer** (Haiku)
- Parses the user's Friday wrapup into structured signals
- Extracts: wins, losses, mood, focus shift, new information
- Feeds clean signal to orchestrator (not raw user text)

### Model Allocation & Cost

| Agent | Model | Est. Cost/Week | When Called |
|---|---|---|---|
| Orchestrator | Opus | ~$0.10 | Every Sunday |
| History briefing | Sonnet | ~$0.02 | Every Sunday (pre-orchestrator) |
| Wrapup Analyzer | Sonnet | ~$0.02 | Every Sunday |
| Sprint Planner | Sonnet | ~$0.03 | Every Sunday |
| Build Tracker | Sonnet | ~$0.02 | Every Sunday |
| Research Agent | Sonnet + tools | ~$0.10-0.20 | When needed (~2x/month) |
| **Weekly fixed** | | **~$0.19** | |

**Monthly cost by user type (includes execution layer drafts):**

| User Type | Behavior | Fixed/mo | Variable/mo | Total/mo | Margin at $50 |
|---|---|---|---|---|---|
| Light | 2 drafts/wk, minimal regens | $0.76 | $0.24 | **~$1.00** | 98% |
| Average | 5 drafts/wk, some regens, research 2x/mo | $0.76 | $0.70 | **~$1.50** | 97% |
| Heavy | 10 drafts/wk, regens, weekly research | $0.76 | $1.60 | **~$2.35** | 95.3% |
| Abusive | 20 drafts/wk, constant regens | $0.76 | $3.50 | **~$4.25** | 91.5% |

Month 1 adds ~$0.50-0.60 for the initial plan generation (full agentic pipeline with research). Still 94-97% margin even in month 1.

**Note:** No Haiku in the pipeline. Sonnet handles all sub-agent work; Opus handles strategic orchestration only. Quality over pennies.

### Why This Is Better Than Stuffing The Prompt

1. **Scales indefinitely** — Month 12 costs the same as month 1
2. **Opus does strategy, not grunt work** — Expensive model only reasons about the big picture
3. **Sub-agents are replaceable** — Swap models as better/cheaper ones ship
4. **Selective research** — Don't burn Tavily/DataForSEO credits every week, only when the orchestrator decides it's needed
5. **Mirrors how real strategists work** — A CMO doesn't read every report; they get briefings and ask follow-up questions

### How It Connects to the One-Shot

The one-shot generates the thesis, the 4-week arc, and the initial structured output. When the user subscribes:

1. Thesis extracted from one-shot → becomes orchestrator's north star
2. 4-week plan → becomes the initial build/sprint classification
3. First week's tasks → become the first interactive task list
4. All one-shot research data → embedded for History Agent access

The one-shot is the diagnosis. The orchestrator runs the treatment.

### Implementation Notes

- Orchestrator is an Opus call with tool_use (same pattern as agentic pipeline)
- Sub-agents are tool implementations — orchestrator calls `analyze_wrapup`, `search_history`, `plan_sprints`, etc.
- Inngest handles the Sunday cron job: briefing → wrapup analysis → orchestrator → save new week
- New embeddings after each week: wrapup chunks, task outcome chunks, plan adjustment chunks
- Chunk types to add: `weekly_wrapup`, `task_outcome`, `plan_adjustment`

### Open Design Questions

1. **Should the orchestrator explain its reasoning to the user?** A "What I changed and why" blurb builds trust but adds output. Probably yes — 2-3 sentences.
2. **Can sub-agents run independently?** Build Tracker could flag stalled builds mid-week without waiting for Sunday. Research Agent could monitor competitors on a schedule. This is post-MVP but the architecture supports it.
3. **What if Opus disagrees with the user's wrapup?** User says "Reddit isn't working" but data shows 8 signups. Orchestrator should surface the contradiction, not blindly follow.

---

## 9. Open Questions

1. **Should the first week of a subscription be free?** The user already paid $29 for the plan. Making week 1 of the subscription just "interact with your existing plan" (no AI cost) could be a natural trial.

2. **What if the user doesn't do the wrapup?** AI can still re-vector based on task completion data alone. But the wrapup is where the gold is. Maybe: if no wrapup by Saturday night, send a nudge. If still nothing by Sunday, re-vector with just completion data + a note: "We noticed you didn't check in this week. Based on what you completed..."

3. **Can users buy a subscription without the one-shot first?** Probably yes eventually ($49/mo includes the initial plan). But for MVP, require the $29 one-shot as entry. It proves value and collects the business context you need.

4. **How aggressive should re-vectoring be?** Start conservative. Only change sprint tasks, protect builds, and make small adjustments. Users who feel their plan is being rewritten every week will lose trust. "Your plan, refined" not "a new plan every week."

5. **What about the $29 price?** If subscription is $49/mo, the one-shot at $29 is essentially a first-month discount. Could eventually make it: $49 one-shot OR $49/mo subscription (first month includes the plan). Simplifies pricing.

---

## 9. Positioning (Dunford Framework)

**Competitive alternatives for the subscription**:
- Buy another one-shot plan each month (but it doesn't learn)
- Hire a fractional CMO ($2-5K/mo)
- Use a marketing tool suite (Enji at $29/mo — but no intelligence, just tools)
- Wing it with ChatGPT weekly (generic, no memory, no research)

**Unique attributes**:
- Learns from your actual results
- Researches your specific market
- Adapts weekly, not monthly or quarterly
- Accumulates context (the longer you use it, the better it gets)

**Value**:
- "A marketing strategist that learns what works for YOUR business, every week, for $49/mo"

**Market category**:
- AI marketing strategist (not a tool, not an agency, not a chatbot)

---

## 11. Execution Layer — "Do It For Me"

### The Insight (from founder dogfooding)

The founder's actual behavior: gets the plan, sees "Post on r/SaaS about your launch," and instead of doing it himself, spins up Claude Code to draft it. He doesn't want a to-do list. He wants Boost to do the work so he can focus on other things.

**This changes the product from strategist to strategist + executor.** The plan tells you what to do. The execution layer does it (or gets you 80% there).

### Task Type Spectrum

Not all tasks are equal. AI can help differently depending on the task:

| Category | Examples | AI Can Do | UI Action |
|---|---|---|---|
| **Fully draftable** | Reddit/Twitter/LinkedIn posts, emails, blog articles, ad copy, SEO content | Write the whole thing | "Draft this" button → ready to copy-paste |
| **Partially draftable** | TikTok/Reel scripts, podcast outlines, pitch decks, outreach emails | Script/outline, not execute | "Get a script" button → outline + talking points |
| **Advisory only** | Trade shows, networking, physical displays, filming video | Guidance and prep notes | Expanded guidance notes inline |

The task type could be classified by the orchestrator when generating the weekly plan (or by the Sprint Planner sub-agent). Each task gets tagged with its execution capability.

### The Execution Loop

```
Plan says: "Post in r/SaaS about your launch"
    ↓
User clicks: "Draft this"
    ↓
Sonnet generates draft with context:
  - Business description, thesis, target audience
  - Task goal and strategic intent from the plan
  - Brand voice guidelines
    ↓
User reviews, edits, posts
    ↓
Task auto-marked "in progress" when draft generated
    ↓
User marks "Done" + optional note ("got 12 upvotes")
    ↓
Outcome feeds into weekly signal → orchestrator uses it for re-vectoring
```

**The value loop closes**: execution data feeds back into the strategist. Opus doesn't just know what was planned — it knows what was drafted, what was posted, and what happened.

### Model Choice: Sonnet for Drafts, Not Opus

The drafts don't need to be perfect. The founder edits every output anyway (same pattern as the n8n comment generator). Sonnet with good context (business info, thesis, task goal, audience) gets 80% there at ~$0.01-0.03 per draft. Opus stays in the strategist seat.

### Cost Impact

See **Section 8 → Model Allocation & Cost** for full breakdown. Summary:

| User Type | Monthly Cost | Margin at $50/mo |
|---|---|---|
| Light (2 drafts/wk) | ~$1.00 | 98% |
| Average (5 drafts/wk) | ~$1.50 | 97% |
| Heavy (10 drafts/wk) | ~$2.35 | 95.3% |

Even heavy usage is negligible. Opus orchestration (~$0.40/mo) is the dominant cost. All drafting is Sonnet.

### Credits vs Unlimited — Current Thinking

**Leaning toward unlimited with basic rate limiting.**

- Per-draft cost is cents. A credit system adds UX friction for no real margin protection.
- Genuine users won't abuse — they're busy solopreneurs, not content mills.
- Rate abuse (someone regenerating to be a jerk) is handled with simple limits: e.g., 10 regenerations per task per day. Anyone hitting that isn't a real user.
- "Unlimited AI drafts" is a feature that justifies the $50/mo price point.
- Revisit if abuse actually materializes. Probably won't.

### Pricing Model — Under Discussion

**Option A: Single product, $50/mo subscription only.**
- Includes initial plan generation, weekly re-vectoring, task tracking, execution drafts, everything.
- Cancel after month 1 and you effectively paid $50 for a one-shot. Self-selecting.
- Clean mental model — solopreneurs live in subscriptions ($50/mo is a Notion or Linear).
- Risk: $50/mo recurring commitment upfront before seeing any output. Mitigated by examples page, money-back guarantee, and potentially a free trial week.

**Option B: $29 one-shot + $50/mo subscription upsell.**
- Lower entry friction. Prove value before asking for recurring commitment.
- Previously recommended by brand guardian + growth hacker.
- Adds product complexity — two purchase flows, two user states, upgrade funnel.
- The one-shot is effectively "month 1 without the loop."

**Founder instinct**: Option A. No one mixes one-shot with subscription. The subscription IS the product.

**Open question**: Does a free trial week (fill out form → get initial plan → use it for a week → subscription kicks in) bridge the trust gap without needing the $29 one-shot?

---

## Summary: The One Decision

The entire subscription hinges on one question: **Does the Monday morning re-vectored plan feel valuable enough to keep paying?**

If the answer is yes, everything else is details. If the user wakes up Monday, sees their adjusted plan, and thinks "yes, this is exactly what I should do this week based on what happened last week" — you have a subscription business.

Build the interactive task list first. Get the data flowing. Then add the AI loop. The task list alone might retain users long enough to validate demand before building the full system.

---

## Review: Brand Guardian (Jan 28, 2026)

Context given: $29 one-shot + $50/mo subscription is settled (previously validated by both reviewers). Orchestrator is a hard requirement due to Opus prompt limits at ~90% on the one-shot alone.

### 1. Subscription Experience Aligns — With One Voice Shift

The weekly loop mirrors how a real strategist works. The orchestrator reinforces "strategist, not tool." One tension: the subscription audience (returning users who already bought and executed) deserves a sharper voice than first-time buyers. **The one-shot can stay accessible. The subscription voice should level up** — Monday morning briefing from a sharp operator, not a friendly tutor. This is a natural progression, not an inconsistency.

### 2. Upgrade Path Feels Natural

"Plan goes stale" is the right trigger. The CTA at the end of week 1 solves a real problem the user is feeling.

**One guardrail**: The one-shot must always feel complete on its own. If someone buys $29 and never upgrades, they should feel they got their money's worth. The subscription is for users whose situation demands ongoing adaptation — not for people who got an incomplete product.

### 3. Three Brand Risks

**Risk 1: "AI changed my plan" trust problem.** Never let users open Monday's plan and feel ambushed. The "What I changed and why" summary is essential, not optional. Build-track changes always require explicit user consent. Frame as "your strategist has recommendations" not "the AI rewrote your plan."

**Risk 2: Wrapup as homework.** The moment it feels like an obligation, you lose them. Auto-populate from task completion data. Minimize typing. Frame as "tell your strategist what happened" not "fill out your weekly report."

**Risk 3: Orchestrator quality variance.** Different models touch different parts. If Sprint Planner (Sonnet) generates generic tasks lacking Opus's strategic context, users see it in the output quality. Test handoff points aggressively. Output must read like one voice, one mind.

### 4. User-Facing Language

| Internal term | User-facing term |
|---|---|
| Re-vectoring | "Your updated plan" or "This week's plan, adjusted" |
| Thesis | "Your strategy" or "Your growth thesis" (founders get it) |
| Sprint track | "This week's experiments" |
| Build track | "Ongoing plays" or "Compounding plays" |
| Orchestrator | Never exposed |
| Wrapup | "Weekly check-in" |

**Monday notification example**: "Week 3 is ready. Based on your Reddit wins, we're doubling down on community this week. One change: we dropped the Facebook test — the numbers said stop. Here's your week."

---

## Review: Growth Hacker (Jan 28, 2026)

Context given: Same as above. Solo dev. Orchestrator is required, not over-engineering.

### 1. Upgrade Path: Start Earlier, Offer Free First Re-Vector

The "week 2 stale plan" trigger is too late. Most one-shot buyers never finish week 1. By week 2, they're gone.

**Better approach:**
- Day 3 email: "What have you done so far?" Link to check-in page (proto-wrapup)
- The check-in page IS the subscription sales page — "Tell us what you did. We'll adjust your plan."
- **Offer the first re-vector free.** They fill out check-in, you run one re-vector (~$0.35), deliver it. THEN ask for $50/mo.
- Estimated conversion with current design: 3-5%. With free first re-vector: 10-15%.

### 2. Simplify Weekly Interaction to Near-Zero Friction

Friday wrapup with 5 guided prompts is too much. Solopreneurs will do it 2 weeks then stop.

**Minimum viable interaction:**
- Task checkboxes during the week (10-second bursts)
- One-tap Friday check-in: thumbs up / mixed / thumbs down
- Optional text field: "anything to add?"
- The 5-question wrapup is a power user feature, not the default
- AI re-vectors on whatever data exists — completion data alone is plenty of signal

### 3. Retention Timing

| Period | Churn Risk | Why |
|---|---|---|
| Month 1 (weeks 1-4) | Low | Novelty, plan is adapting |
| Month 2 (weeks 5-8) | **HIGH — kill zone** | Original 4-week plan done. Month 2 must feel like progression, not reset |
| Month 3+ | Moderate, declining | Context moat kicks in. Switching costs are real |

**Expected**: ~60% month 1→2, ~75% month 2→3, ~80%+ after. Average lifetime ~3.5 months = ~$175 LTV.

**Key retention levers:**
1. Build progress visualization (move to Phase 1, not Phase 4) — "SEO build: week 3 of 8" makes cancelling feel like waste
2. Month 2 plan must explicitly reference month 1 results — "Last month you got 8 signups from Reddit. This month: subreddit-specific strategy."
3. Cancel flow shows accumulated data — "You have 12 weeks of marketing intelligence. If you cancel, your next plan starts from scratch."

### 4. Revised MVP Build Order

**Phase 1: Interactive task list + check-in page (1 week)**
- Task checkboxes with DB-backed completion tracking
- Check-in page (doubles as upgrade pitch)
- Email sequence: day 1 (delivered), day 3 (check-in nudge), day 7 (how was week 1?)
- Free for all one-shot buyers

**Phase 2: Stripe subscription + manual re-vector (1 week)**
- $50/mo billing
- Upgrade flow from check-in page (after free first re-vector)
- Founder manually re-vectors for first 5-10 subscribers using Opus
- **This is the validation gate** — if nobody subscribes, you saved weeks of orchestrator engineering

**Phase 3: Automated orchestrator (2 weeks)**
- Inngest Sunday cron
- Orchestrator + sub-agents
- Monday notification
- Sprint/Build classification

**Phase 4: Retention features (1 week)**
- Build progress visualization
- Month-end retrospective
- History view

### 5. Validate Before Building

**Can start this week with zero new code:**
1. Email existing one-shot buyers: "How's your plan going?"
2. Offer manual re-vectoring to responders (free)
3. Pitch $50/mo to anyone who engaged
4. Target: 3-5 paying subscribers before writing orchestrator code

### Summary

Architecture is sound. Orchestrator is justified. Economics are excellent. The risk is not technical — it's building the full system before confirming solopreneurs will actually do the weekly loop. De-risk with concierge first.
