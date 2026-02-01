# V2 Master Plan: From One-Shot to Marketing Co-Pilot

*Feb 1, 2026 — Living document. Update as decisions are made.*

---

## What We Know

**First sale landed.** Product works. The research depth is real and differentiated — Boost found a competitor (Enji) that ChatGPT, Claude, and manual searches all missed. That's the moat.

**But:**
- Users think $29 entitles them to multiple runs, not one audit. The one-shot framing is confusing or feels like bad value at that price.
- Landkit ($9.99/mo, scaling to $29/mo) is doing the same thing with worse data but better distribution. 10K visitors and 2,400 audits in 30 days. They're overbuilding and messy, but they're reaching people.
- The one-shot model caps LTV at $29. Subscription is where the business is.
- Both competitor audits of aboo.st flagged **urgency/scarcity** as the #1 gap.

**The opportunity:** Landkit proves there's market demand for an AI marketing co-pilot at $29-50/mo. Their product is wide but shallow (Gemini on scraped pages, no real data). Boost has depth (Tavily + DataForSEO + Opus). The play is: match their distribution model, crush them on output quality, and build the execution layer they can't.

---

## Decisions Made (Feb 1, 2026)

### Product Ladder — Decided

Two tiers. Free and paid. No middle tier. One decision point.

| Name | Price | What It Delivers | Cost |
|------|-------|-----------------|------|
| **Boost Snapshot** | Free | "Here's what a stranger sees" — quick site audit, 3-Second Test | ~$0.05 |
| **Boost Brief** | Free | "Here's where you stand" — situational clarity with real competitive landscape | ~$0.10 |
| **Boost Weekly** | $29/mo | "Here's exactly what to do — this week" — full strategy + execution drafts + live data | ~$1.50/mo |

**No middle tier.** The $29 one-shot is killed. The current Opus pipeline (Tavily + DataForSEO + Opus strategy) becomes the **initial plan generation** when someone subscribes to Weekly. Same depth, same quality — it's week 1 of the subscription, not a standalone product.

**Why kill the one-shot:**
- Eliminates "multiple runs" confusion (users expected ongoing access for $29)
- Removes the awkward $0 → $29 → $50/mo ladder with two decision points
- One conversion decision: free or $29/mo
- The Brief does the one-shot's old job as conversion tool (prove research is real, then upgrade)
- Simpler product, simpler checkout, simpler messaging

**Naming rationale**: Functional, not clever. Not tiers — stages of the same strategist relationship, at different depths.

### Pricing — Decided

- **$29/mo per project for Boost Weekly at launch.** Early adopters keep their rate — not a promotion, just respect for people who showed up first. Our advantages (real data, Opus quality) are experience goods — invisible until someone uses them. Landkit's advantages (12 modules, $10 price) are search goods — visible in a screenshot. At launch with zero testimonials, experience goods lose. Get people in the door.
- **Additional projects: $15-20/mo each.** No agency tiers, no white-label, no feature gates. Just "+Add Project" with a price. A freelancer managing 3 clients pays ~$59-69/mo organically. Expansion revenue without product complexity.
- **$49/mo per project for new signups later** — after GSC/GA4 ships + 30-50 subscribers + testimonials. Early adopters stay at $29 forever. They become evangelists because the deal is visibly gone.
- **$29/mo matches Landkit's target price** ($29/mo after their first 100 founders). Same category, not undercutting. 1x the old one-shot price — easy mental math.
- **Positioned against fractional CMO** ($500-2K/mo), not ChatGPT ($20/mo). Different anchor than Landkit.

### Urgency — Decided

Not fear. Specificity as urgency. Data creates its own urgency when it's concrete enough.

**Boost Brief (free tier):**
- Lead with competitive landscape (the "wow" Landkit can't replicate)
- Lock tactical sections (Stop/Start Doing, Quick Wins, Roadmap)
- Show one specific finding from the full strategy: "Your competitor [name] gets [X] monthly visitors from [keyword]. Boost Weekly includes the counter-strategy."
- Time-decay: "Your Brief expires in 7 days" (honest — competitive data goes stale)

**Boost Weekly ($29/mo):**
- Early adopter pricing — rate stays the same as long as you're subscribed
- Don't over-sell the dashboard. The dashboard sells itself via "Draft this" buttons and weekly re-vectoring.

**What we're NOT doing:** Countdown timers, fake scarcity, founder counters, fear-based copy. The brand is a strategist, not a used car salesman. If the urgency doesn't come from the data itself, it's not real urgency.

### "Multiple Runs" Confusion — Solved

Killed the one-shot. The subscription IS ongoing access. Problem gone.

### Dashboard Philosophy — Decided

**Resist Landkit envy.** Not 12 modules and health percentages.

Three things on the main screen:
1. **This week's focus.** 1-3 specific actions. The strategist picked these.
2. **What's working.** Filtered data — not "here are 200 keywords" but "impressions for [target keyword] up 23% since [that post]."
3. **Draft it.** One button per action item. Aligned to ICP, voice, strategy.

Business profile is settings — always there, rarely visited after setup. No feature sprawl, no platform-engagement gamification.

### Diagnostic Scoring — Decided

**Every tier outputs a score.** Not gamification — diagnostic clarity. A number is instant, visceral, shareable, and creates the impulse to act.

| Tier | Score | What It's Based On |
|------|-------|-------------------|
| Snapshot | Category scores (Clarity, Customer Focus, Proof, Friction) + overall | 3-Second Test framework — what a stranger sees |
| Brief | Overall marketing position score + category breakdown | Real competitive data (Tavily research, market position relative to competitors found) |
| Weekly | Rolling score, tracked week over week | Real data — actual traffic, keyword positions, task completion, competitive movement |

**HARD CONSTRAINT: Every score must be grounded in established marketing principles.** No arbitrary weights, no LLM "vibes scoring." Each score category must map to a named framework or measurable principle. If we can't explain *why* something scores a 4/10 with a specific principle and evidence, we don't score it.

| Tier | Framework Basis |
|------|----------------|
| Snapshot | 3-Second Test (already built) — Clarity, Customer Focus, Proof, Friction. Rooted in conversion copywriting (Schwartz awareness levels, Cialdini trust signals). |
| Brief | Needs design — scoring categories should map to positioning strength (Dunford), channel readiness (AARRR stage), competitive exposure (real data: traffic gaps, keyword gaps, content gaps). Each category backed by the actual research data, not inference. |
| Weekly | Trajectory based on measurable inputs: task completion rate, actual metric movement (traffic, rankings, engagement when GSC is connected), competitive position changes. Not a vanity score. |

**How this differs from Landkit/LandingBoost**: Their scores are LLM inference on scraped pages — Gemini assigns a number with no transparent methodology. Ours are grounded in named frameworks + real external data. The score is explainable: "Your Proof score is 3/10 because we found zero third-party mentions, no testimonials above the fold, and your two competitors both have case studies."

**The score creates urgency without fear.** "Your marketing position: 52/100" is a fact backed by evidence. "Here's what moves it to 65" is direction grounded in the same framework. That's the brand — blunt diagnosis with receipts.

**Scoring framework design is a prerequisite for WS1.** Define the Brief scoring rubric (categories, what each measures, what data feeds it) before building the UI. This is product design work, not just a prompt change.

**In Weekly dashboard**: "What's working" panel shows trajectory, not a static number. "Your position last week: 52. This week: 58. Here's what moved it." Progress tied to real actions and real data.

### Voice Across Tiers — Decided

Same voice, different speed. One strategist in three contexts:

| Tier | Voice Expression |
|------|-----------------|
| Snapshot | Blunt, two sentences max. "Your headline says nothing. A stranger has no idea what you sell." |
| Brief | Direct assessment. Short paragraphs. Specific to their market. "You have 4 competitors doing X. None are doing Y. That's your opening." |
| Weekly | Terse, operational. "Last week you published 2 of 3 posts. GSC impressions up 12% on [keyword]. This week: focus on [action]." |

### Product Philosophy — Decided

**If someone leaves after 3 months because they figured it out, the product worked.**

Boost Weekly is not a dependency machine. It's a strategist that gets you unstuck and moving. If a founder uses Weekly for 3 months, builds real traction, and graduates to doing their own marketing — that is success. Healthy churn from founders who outgrew us is the goal, not a problem to engineer away.

**What this means:**
- No dark-pattern retention. No "here's what you'll lose" guilt trips on cancellation.
- No feature bloat to justify ongoing billing. The product stays focused.
- If monthly churn is high because people are getting value and moving on, that's fine — acquisition solves it, not stickiness hacks.
- Building for month 3+ retention via platform expansion (more tools, bigger team, agency features) is a year+ problem. Not now.

**The one-sentence pitch for Boost Weekly:**
"Your strategy, updated every week based on what's actually working."

---

## The Product Arc

```
BOOST SNAPSHOT (free)          BOOST WEEKLY ($29/mo founder, $49 later)
  "What a stranger sees"         Business profile (ICP, voice, context)
         ↓                       Full Opus strategy (week 1 = initial plan)
BOOST BRIEF (free)               Weekly re-vectoring + execution drafts
  "Where you stand"              "Draft this" for any tactic
  (real competitive data)        GSC/GA4 integration (later)
         ↓
BOOST WEEKLY ($29/mo)
  "What to do THIS WEEK"
```

Two tiers. One decision point. The Brief proves the research is real. The Weekly gives you the full strategy and helps you execute it.

---

## Workstreams

### WS1: Free Tool Funnel (Snapshot + Brief)
**Goal**: All free tools drive to one conversion point. Add urgency through specificity.

- Boost Brief leads with competitive landscape (differentiator)
- Lock tactics, show one specific finding from paid plan
- Time-decay on Brief results (7 days)
- All free tools → single conversion page
- Expand free tool catalog for more SEO entry points
- Public audit directory for organic traffic

**Project doc**: `projects/ws1-free-tool-funnel.md`

### WS2: Boost Weekly Platform (includes basic "Draft This")
**Goal**: Business profiles, Stripe billing ($29/mo), focused dashboard, weekly loop, basic execution drafts.

- Business profile builder (ICP, voice, context — persistent, progressive enrichment)
- Stripe subscription: $29/mo (early adopters keep rate), $49/mo later for new signups
- Initial plan generation = full Opus pipeline (replaces one-shot)
- Dashboard: 3-panel focus (this week / what's working / draft it)
- Task tracking with DB-backed completion
- Weekly check-in (minimal — checkboxes + one-tap sentiment)
- **Basic "Draft This"** — Sonnet call with business context for top content types (Reddit, email, DM). Without this, the dashboard is a to-do list, not worth $29/mo.
- **Email nurture sequence** — 3 emails during the Brief's 7-day expiry window (Brief → value reminder → urgency → last chance)

**Project doc**: `projects/ws2-subscription-platform.md`

### WS3: Execution Engine (Full)
**Goal**: Expand "Draft This" to all content types with feedback loops.

- Full content type registry (ads, blog outlines, Twitter threads, cold outreach, scripts)
- Regeneration with feedback ("shorter", "more casual", "focus on the pain point")
- Task type classification: fully draftable / partially draftable / advisory
- Outcome tracking (drafted → posted → result noted)

**Project doc**: `projects/ws3-execution-engine.md`

### WS4: Integrations (GSC, GA4, Future)
**Goal**: Real performance data feeding into the strategy loop.

- Google Search Console first (most actionable for ICP)
- GA4 second
- OAuth flow, read-only, data feeds into re-vectoring
- Future: PostHog, Mixpanel, social APIs

**Project doc**: `projects/ws4-integrations.md`

### WS5: Dev Infrastructure ✅ COMPLETE
**Goal**: Ship safely. Feature branches + Supabase branching.

- Git feature branches for all WS work
- Supabase branching for schema changes ($0.01344/hr — create when needed, delete when done)
- Vercel preview deployments per branch (already configured)
- Stripe test mode for subscription development (live keys in prod, test keys for branches)
- Migration compatibility fix applied (IF EXISTS on DROP statements)

**Project doc**: `projects/ws5-dev-infrastructure.md`

---

## Dependencies & Build Order

### Build Order

```
WS5 (Dev Infra)          ← Set up first, enables safe development
  ↓
WS1 (Free Tool Funnel)   ← Ships independently, improves conversion now
  ↓
WS2 (Boost Weekly + basic Draft This) ← Core platform
  ↓
WS3 (Full Execution Engine)  ← Expand content types + feedback loops
WS4 (Integrations)           ← GSC/GA4 feed into re-vectoring
```

WS1 and WS5 can run in parallel. WS3 and WS4 can run in parallel after WS2.

**Brief urgency improvements can ship on main NOW** — don't wait for WS5 to be perfect. Speed > process for low-risk frontend changes.

**WS2 includes basic "Draft This"** (was WS3). A dashboard without drafts is a to-do list. Not worth $29/mo. Basic Sonnet drafting for top 3 content types (Reddit posts, emails, DMs) ships with the dashboard.

### Pre-Integration Weekly Loop

Before GSC/GA4 exist (WS4), the weekly re-vectoring uses:
- Task completion data (what they did / didn't do)
- User's check-in sentiment + optional notes
- Business profile context
- Original research data from the initial plan
- Fresh Tavily search if business context changed

This is enough signal. Integration data makes it better, but the loop works without it.

---

## Immediate Actions

The existing $29 one-shot stays live until Boost Weekly is ready. Meanwhile:
1. ~~**Set up WS5 dev infrastructure**~~ ✅ Complete (Feb 1, 2026)
2. **Improve Brief urgency** — ✅ Scoring + urgency hook shipped. Still needs: competitive landscape data in free pipeline, tactical section locking, 7-day expiry
3. **Write the one-sentence Weekly pitch** — "Your strategy, updated every week based on what's actually working." (Draft. Refine with copywriter agent before launch.)
4. **Plan the one-shot sunset** — when Weekly launches, existing one-shot customers get offered subscription

---

## Success Metrics

| Metric | Current | Target (3 months) |
|--------|---------|-------------------|
| Free audit → email capture | Unknown | 30%+ |
| Brief → Weekly conversion | ~4% (Landkit benchmark) | 8-10% |
| Monthly Boost Weekly subscribers | 0 | 20-50 |
| MRR | $0 | $580-1,450 |
| Month 1→2 retention | N/A | 60%+ |
| Avg LTV | $29 (one-shot) | $100+ (~3.5 mo avg) |

---

## Reference Docs

- `subscription-brainstorm.md` — detailed subscription design (orchestrator, data model, weekly loop, execution layer, cost model)
- `v2-vision.md` — original v2 thinking (data flywheel, actionable UI, moat)
- `competitors/competitors.md` — competitive landscape + Landkit deep dive
- `free-tools-seo.md` — free tool expansion plan
