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

---

## Dashboard Design (Feb 2, 2026)

### Design Principles

1. **Task-centric** — The dashboard IS a task list, not a dashboard with a task panel. Tasks are the primary interaction.
2. **Mobile-first** — Primary actions (check tasks, mark done, add notes) must work perfectly on phone. Deeper work (profile editing, reading strategy) comfortable on desktop.
3. **Multi-project** — Solo founders run 2-3 projects. Switching must be instant. Project switcher is also the upsell surface ($15-20/mo per additional project).
4. **Time-navigable** — Current week is default, but users can peek ahead (next week's plan) or look back (past weeks with notes and retros). Week navigator, not separate pages.
5. **No sidebar** — Not enough sections to justify one. Top nav (desktop) + bottom nav (mobile/tablet).
6. **Original strategy absorbed** — The 10-section Opus output is never shown as a document. It's decomposed into tasks, thesis, competitive context, and signals that populate the dashboard.

### Navigation

**Desktop**: Top bar with sliding underline (framer-motion `layoutId`)
```
Boost   [▾ Project Name]       This Week   Insights   Brand   ⚙
```

**Mobile/Tablet**: Slim top bar + bottom nav
```
Top:    Boost   [▾ Project Name]
Bottom: 📋 This Week   📊 Insights   🪪 Brand   ⚙ Settings
```

4 nav items. "Insights" starts as a placeholder — fills up as analytics integrations connect. "Brand" replaced "Profile" — strategic identity (ICP, voice, competitors) lives here. Business basics/goals moved to Settings.

### Project Switcher

Dropdown in top bar. Shows all projects, active one checked. "+ Add project" always visible at bottom (upsell surface). Everything below nav is scoped to selected project.

```
[▾ MyApp.io]
 ├ MyApp.io  ✓
 ├ The Growth Letter
 └ + Add project
```

### View 1: This Week (Primary)

The main view. Task list with week context.

**Week Navigator**
```
← Week 3 (This Week) →
  Jan 27 – Feb 2
```
- Tap forward: next week's plan (preview, may adjust)
- Tap back: past weeks (with notes, completion, retro)
- Current week has visual indicator

**Week Theme Card**
```
"Your competitors are ignoring LinkedIn. That's your opening."
Sprint · 4 tasks · 1 done
```
The thesis/theme for the week. From the Opus strategy or re-vectoring output.

**Task Cards** (expandable)
- Collapsed: checkbox + task title + track label (Sprint/Build)
- Expanded: WHY (strategic context) + HOW (instructions/suggested approach)
- Actions: Mark done + Add note
- Task-level notes capture what was actually done and what happened ("posted it, got 3 DMs")
- Notes feed back into re-vectoring — the system learns from outcomes

**Completed tasks** show inline note if one exists.

**Past week view**: Same layout but read-only. Shows completion status, notes, and the weekly retro summary.

**Next week view**: Shows theme + planned tasks with a note: "Plan adjusts based on this week's results." Tasks not yet actionable.

**What's Moving** (below tasks, current week only)
```
↑ Organic sessions +12% vs last week
↓ Homepage bounce rate up 8%
→ No change in signup conversion
```
Signals from connected analytics. Empty until integrations are connected. This is what makes re-vectoring smart — real data, not just user self-reports.

**Weekly Check-in** (bottom of current week)
```
How'd this week go?
[ Great ]  [ Okay ]  [ Rough ]
Anything worth noting? [textarea]
[Save]
```
Minimal. One-tap sentiment + optional notes. Not 5-question homework. AI re-vectors on whatever data exists — completion data alone is enough signal.

**Weekly Retro** (past weeks, AI-generated)
Summary of: what you did + what moved + what got carried forward. Generated from task notes + analytics data + check-in sentiment. A record you can look back on.

### View 2: Insights (Future — placeholder for now)

Where analytics data lives. Not actionable directly — informational.

Future contents:
- Analytics trends (PostHog, Mixpanel, GA4, GSC data)
- Landing page monitoring (periodic re-audits, conversion tracking over time)
- SEO tracking (keyword rankings, content performance)
- Competitive monitoring (competitor changes, positioning shifts)
- Notifications/alerts ("conversion dropped 20%", "competitor changed pricing")

Starts empty. Fills up as integrations connect. Build this view when WS4 (integrations) ships.

### View 3: Brand (per project) ✅ Built

Strategic identity. The "marketing brain" that feeds strategy and drafts.

**Sections (3 cards, inline edit):**

**Your Customers (ICP)** — Who, problem they solve, alternatives. Single ICP (not multi — kept simple). View/edit card.

**Brand Voice** — Tone, copy examples, do's list, don'ts list. Do's/don'ts are explicit rules ("Always mention the free tier", "Never compare to X by name"). Feed into future content drafting.

**Competitors** — Up to 5 URLs. Add/remove. Fed into competitive monitoring and re-vectoring.

**"Fill with AI" button** — Uses Sonnet (`claude-sonnet-4-20250514`) to generate all 3 sections from available business context (onboarding profile + accumulated run data). Rate-limited to 1 call per 5 minutes per business. Input sanitized. `?save=true` param auto-persists suggestions.

Business basics (name, URL, description, industry) and goals moved to Settings (not yet built).

### View 4: Settings

- Account (email, auth)
- Subscription management (plan, billing, cancel/pause)
- Integrations config (connect PostHog, GA4, GSC, etc.)
- Notification preferences

### How the Original Strategy Maps

The 10-section Opus output on signup (week 1) gets decomposed:

| Original Section | Where It Lives Now |
|------------------|--------------------|
| Executive Summary / Thesis | Week theme card |
| Your Situation | Absorbed into first week's context |
| Competitive Landscape | Profile > Competitors (updated by re-vectoring) |
| Stop Doing / Start Doing | Tasks |
| This Week | Tasks |
| 30-Day Roadmap | Weeks 1-4 task plans |
| Channel Strategy | Informs task generation |
| Metrics Dashboard | Eventually replaced by real analytics (Insights) |
| Content Templates | Future "Draft this" territory |

User never reads a document. They interact with tasks and context.

### Future Features (designed to fit, not built now)

| Feature | Where It Fits | When |
|---------|---------------|------|
| "Draft this" | Inline on task cards, ICP selector for targeting | WS3 |
| Analytics integrations | Insights view + "What's moving" signals | WS4 |
| Landing page monitoring | Insights view (periodic re-audits + conversion tracking) | WS4+ |
| SEO tracking | Insights view | WS4+ |
| Competitive alerts | Insights view or task generation | WS4+ |
| Content library | New nav item or sub-view of Profile | WS3+ |

The layout accommodates all of these without restructuring. Tasks absorb actionable items. Insights absorbs informational data. Profile grows by adding sections.

---

## What Was Built (Original Phases — Complete)

Core subscription infrastructure shipped Feb 2, 2026:
- Business profiles (`businesses` table with `context` JSONB)
- Stripe subscription billing (active/paused/canceled)
- Task tracking with completion persistence (`task_completions` table)
- Weekly check-in (sentiment + notes, `weekly_checkins` table)
- Automated weekly re-vectoring (Inngest Sunday cron, Opus orchestrator)
- Draft generation (`/api/draft`, Sonnet)

See `subscription-brainstorm.md` for original design details.

---

## Dashboard Redesign — Implementation Phases

Current dashboard is a single-page 3-panel layout (WeeklyFocus + WhatsWorking + DraftIt + WeeklyCheckin). Needs to be rebuilt into the new task-centric, multi-project, mobile-first layout described above.

### Phase 0: Fix Existing Bugs ✅ Complete (Feb 2, 2026)
- Fixed task extraction in `/api/tasks/route.ts`, `/api/draft/route.ts`, and `DraftIt.tsx` — all referenced non-existent `structuredOutput.tasks`. Now use shared `extractTasksFromStructuredOutput()` helper in `src/lib/dashboard/extract-tasks.ts`
- Helper reads from `weeks[].days[]` (new format) or `thisWeek.days[]` (legacy), with `Array.isArray` guards for malformed JSONB
- Fixed invalid Supabase `.select("id", { count: "exact" })` in `subscription.ts`
- Remaining: `WhatsWorking.tsx` still uses fragile regex parsing — will be replaced in Phase 3 with structured data

### Phase 1: Layout Shell + Navigation ✅ Complete
- Dashboard layout with route structure (`DashboardShell.tsx`)
- Top nav (desktop): `Boost [▾ Project] This Week Insights Brand ⚙` with sliding underline (framer-motion `layoutId`)
- Bottom nav (mobile/tablet): 4 icon+label items
- Project switcher dropdown (queries all user businesses, scopes via `?biz=` param)
- Responsive breakpoint: top nav ≥ 768px, bottom nav < 768px
- Nav config: `src/components/dashboard/nav-config.ts`

### Phase 2: Brand Page ✅ Complete
- Built `/dashboard/brand` with 3 editable sections: ICP, Brand Voice (tone + do's/don'ts), Competitors
- `/dashboard/profile` redirects to `/dashboard/brand` (preserves `?biz=` param)
- Reusable `ProfileSection` card component with view/edit modes
- Added `dos?: string[]` and `donts?: string[]` to `BusinessProfile.voice`
- "Fill with AI" button: `POST /api/business/[id]/brand/suggest` (Sonnet, rate-limited, input-sanitized)
- `?save=true` param for auto-persisting AI suggestions
- Business basics and goals deferred to Settings page (not yet built)

**Key files:**
- `src/app/dashboard/brand/page.tsx` (server)
- `src/components/dashboard/brand/BrandClient.tsx` (client)
- `src/components/dashboard/profile/ProfileSection.tsx` (reusable card)
- `src/app/api/business/[id]/brand/suggest/route.ts` (AI endpoint)

### Phase 3a: Week Theme + Task Cards ✅ Complete
- `WeekTheme.tsx` — week theme card showing thesis from `structured_output.thesis`
- `TaskCard.tsx` — collapsed-only cards: checkbox + title + track pill
- Click card opens detail panel, click again closes it
- `TaskCheckbox.tsx` deleted (replaced by TaskCard)

### Phase 3b: Task Detail Panel ✅ Complete
- `TaskDetailPanel.tsx` — slide-over panel (desktop right side, framer-motion spring) / bottom sheet (mobile)
- Panel sections: header (checkbox + title + track + ghost close), WHY (amber callout), HOW, success metric, notes (auto-save on blur), quick draft (chips always visible)
- Panel pushes main content left via `lg:mr-[28rem]` on `SubscriberDashboard`
- Per-task draft cache in `WeeklyFocus` — drafts survive panel close/reopen
- WHY/HOW enrichment: `enrichTasksWithContext()` Sonnet post-processor in `formatter.ts`, wired into both pipelines (non-fatal)
- `DayActionSchema` extended with optional `why`/`how` fields, passed through extraction + API
- Sticky navbar: `DashboardShell` header `sticky top-0 z-50`

**Key files:**
- `src/components/dashboard/TaskDetailPanel.tsx` (new)
- `src/components/dashboard/TaskCard.tsx` (rewritten)
- `src/components/dashboard/WeekTheme.tsx` (new)
- `src/components/dashboard/WeeklyFocus.tsx` (manages selection + draft cache)
- `src/lib/ai/formatter.ts` (`enrichTasksWithContext()`)

### Phase 3c: Week Navigator — Not Started
- `← Week 3 (This Week) →`
- Query runs by `subscription_id` + `week_number`
- Current week highlighted, forward/back navigation

**Dependencies**: Phase 3b (needs task view).

### Phase 4: Weekly Retro + History
- Past week view: read-only tasks with completion status + notes + retro
- Next week preview: theme + planned tasks + "may adjust" note
- AI-generated weekly retro summary (from task notes + analytics + sentiment)
- **Marketing history** — running log of what the user has tried and what they've learned
  - Seed from onboarding data (currently baked into `productDescription` in the `/start` flow — no separate `triedBefore` collection exists in any active flow)
  - Grows over time as user completes weekly tasks, marks things as tried, adds notes
  - This replaces the static "What You've Tried" concept — a snapshot goes stale, a living history is useful
  - `triedBefore` field kept in profile schema for backward compat (brand suggest + inngest read it) but not exposed in UI
- "What's Moving" signals section below tasks (current week only)
  - Container exists but empty until analytics integrations (WS4)
  - Shows placeholder: "Connect analytics to see what's moving"

**Dependencies**: Phase 3c (needs week navigation).

### Phase Summary

| Phase | What | Status |
|-------|------|--------|
| 0 | Fix bugs (task extraction, DraftIt) | ✅ Complete |
| 1 | Layout shell + nav + project switcher | ✅ Complete |
| 2 | Brand page (ICP, voice, competitors + AI fill) | ✅ Complete |
| 2.5 | Business page (basics, goals + AI fill) | ✅ Complete |
| 3a | Week theme + task cards | ✅ Complete |
| 3b | Task detail panel (WHY/HOW/notes/draft) | ✅ Complete |
| 3c | Week navigator | **Next** |
| 4 | Weekly retro + marketing history | Blocked on Phase 3 |

## Data Model Changes

From subscription-brainstorm.md §3 (Option A — extend `runs`):

**New tables needed:**
- `subscriptions` (id, user_id, stripe_subscription_id, status, current_week, original_run_id)
- `business_profiles` (id, user_id, project_name, url, description, stage, icps JSONB, brand_voice JSONB, dos_and_donts JSONB, competitors JSONB, goals JSONB) — one per project
- `task_completions` (id, run_id, task_index, completed, note, outcome, track)
- `weekly_wrapups` (id, subscription_id, week_number, structured reflection data)

**Extend existing:**
- `runs` + subscription_id, week_number, parent_plan_id, thesis columns
- `subscriptions` links to `business_profiles` (one subscription per project)

**Use Supabase branching (WS5) to develop schema safely.**

**ICP storage**: JSONB array on `business_profiles`. Each ICP is an object with name, description, pain_points, buying_triggers, channels. Always accessed with the project, never queried independently.

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dashboard layout | Top nav (desktop) + bottom nav (mobile), no sidebar | Not enough sections for sidebar. 4 nav items fits both patterns. |
| Primary view | Task-centric single column | Tasks are the main interaction. Not a multi-panel dashboard. |
| Multi-project | Project switcher in top bar | Founders run 2-3 projects. Instant switching. Also upsell surface. |
| ICP storage | Single ICP in JSONB (not multi-ICP array) | Kept simple for MVP. Multi-ICP adds complexity without proven need. |
| Business profile | JSONB on `businesses.context.profile` | No separate table needed — always accessed with business. |
| Profile vs Brand split | Brand = ICP + voice + competitors; Settings = basics + goals | ICP and voice are strategic identity, not "settings". Cleaner mental model. |
| AI brand suggestions | Sonnet (not Haiku) via dedicated endpoint | Haiku too shallow for nuanced brand positioning. Sonnet worth the cost. |
| Original strategy display | Decomposed into tasks + theme, never shown as document | Users interact with actions, not reports. |
| Week navigation | Time navigator on main view, not separate pages | One layout, time dimension. Past/current/future in same view. |
| "Draft this" | Quick draft on task detail panel | Sonnet drafts per content type (tweet, Reddit, LinkedIn, email, DM, blog outline). ~$0.01-0.02/draft. Per-task cache. |

## Key Decisions Still Needed

| Decision | Options | Notes |
|----------|---------|-------|
| Free trial mechanism | Free week / free re-vector / none | Growth hacker recommends free first re-vector |
| One-shot relationship to subscription | Entry point / independent / killed | See master plan open decisions |

## Cost Model

From subscription-brainstorm.md §8:
- Weekly fixed cost per subscriber: ~$0.19
- Average monthly cost: ~$1.50 (with execution drafts)
- Margin at $50/mo: 95-97%

## Definition of Done

- [x] Business profile builder live and populated for test users
- [x] Stripe subscription billing working
- [x] Task tracking with completion persistence
- [x] Weekly check-in flow functional
- [x] Automated re-vectoring running for active subscribers

**Status: Code complete and merged to main (Feb 2, 2026).** Dashboard access currently limited to manually added users. Not yet publicly launched — needs dashboard redesign (see Dashboard Design section above) before opening up.

**Next: Dashboard redesign implementation.** Current single-page dashboard needs to be rebuilt with the new layout (top/bottom nav, project switcher, task-centric view, profile page). This is the gate before public launch.
