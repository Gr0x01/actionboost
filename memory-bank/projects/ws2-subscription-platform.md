# WS2: Boost Weekly — Subscription Platform

*Parent: v2-master-plan.md | Detailed design: subscription-brainstorm.md*

---

## Goal

Persistent business profiles, Stripe subscription billing ($29/mo founder, $49/mo later), focused dashboard, weekly strategy loop. The $29 one-shot is killed — the Opus pipeline becomes week 1 of the subscription.

## Why Now

- One-shot caps LTV at $29. Subscription is the business.
- Landkit proves market exists for AI marketing co-pilot at $29/mo (and they're scaling to $29/mo target)
- Users already confused about one-shot vs ongoing — subscription is the natural model
- The subscription brainstorm + reviews are thorough. Architecture is designed. Time to build.

## What to Build

### Phase 1: Business Profile + Workspace Shell

The business profile replaces the one-time `/start` form with a persistent workspace. User builds their "Business DNA" over time:

- **Business basics**: Name, URL, what you sell, stage
- **ICP definition**: Who they serve, pain points, buying triggers, objections
- **Brand voice**: Tone, words they use, words they avoid, examples
- **Competitive landscape**: Known competitors, how they position
- **What's been tried**: Marketing history, what worked, what didn't
- **Goals**: What they're trying to achieve right now

This is the context layer that makes everything else smart. It feeds into strategy generation and content drafting.

**Key design decision**: This should feel like building something valuable ("your marketing brain"), not filling out a form. Progressive — start with basics, deepen over time. No gamification (no health scores, no "Context Health %" — that's Landkit territory and creates anxiety, not clarity).

### Phase 2: Stripe Subscription + Upgrade Flow

- $29/mo founder price (locked for life, first 100 founders)
- $49/mo for new signups after proof + integrations ship
- Initial plan generation = full Opus pipeline (replaces the $29 one-shot)
- Upgrade flow from:
  - Boost Brief results (post-urgency framing from WS1)
  - Direct landing page
  - Homepage
- Cancellation + pause flows
- **Validation gate**: Before full automation, manually re-vector for first 5-10 subscribers

### Phase 3: Task Tracking + Weekly Check-in

- Parse strategy output into interactive tasks (checkboxes, DB-backed)
- Sprint vs Build track classification (see subscription-brainstorm.md §2)
- Minimal weekly check-in: one-tap sentiment + optional notes (not 5-question form)
- Task completion data feeds re-vectoring

### Phase 4: Automated Weekly Re-Vectoring (Orchestrator)

- Inngest Sunday cron job
- Orchestrator (Opus) + sub-agents (Sonnet) — see subscription-brainstorm.md §8
- Monday morning notification: "Your week is ready"
- "What I changed and why" summary
- Build-track protection (only changes with user consent)

## Data Model Changes

From subscription-brainstorm.md §3 (Option A — extend `runs`):

**New tables needed:**
- `subscriptions` (id, user_id, stripe_subscription_id, status, current_week, original_run_id)
- `task_completions` (id, run_id, task_index, completed, note, outcome, track)
- `weekly_wrapups` (id, subscription_id, week_number, structured reflection data)

**Extend existing:**
- `runs` + subscription_id, week_number, parent_plan_id, thesis columns
- `users` + business profile JSONB (or separate `business_profiles` table if it gets complex)

**Use Supabase branching (WS5) to develop schema safely.**

## Key Decisions Still Needed

| Decision | Options | Notes |
|----------|---------|-------|
| Business profile: JSONB column vs separate table | JSONB on users / new table | Start JSONB, migrate if needed |
| Free trial mechanism | Free week / free re-vector / none | Growth hacker recommends free first re-vector |
| One-shot relationship to subscription | Entry point / independent / killed | See master plan open decisions |

## Cost Model

From subscription-brainstorm.md §8:
- Weekly fixed cost per subscriber: ~$0.19
- Average monthly cost: ~$1.50 (with execution drafts)
- Margin at $50/mo: 95-97%

## Definition of Done

- [ ] Business profile builder live and populated for test users
- [ ] Stripe subscription billing working ($50/mo)
- [ ] Task tracking with completion persistence
- [ ] Weekly check-in flow functional
- [ ] At least 5 subscribers before building full orchestrator
- [ ] Automated re-vectoring running for active subscribers
