# WS1: Free Tool Funnel (Boost Snapshot + Boost Brief)

*Parent: v2-master-plan.md*

---

## Goal

All free tools drive to one conversion point. Add urgency through specificity, not fear. Expand entry points for organic traffic.

## Product Names

- **Boost Snapshot** = the free 3-Second Test (quick site audit, ~$0.05)
- **Boost Brief** = the free mini-audit (situational clarity + competitive landscape, ~$0.10)

## Why Now

- Both competitor audits flagged urgency as Boost's #1 gap (Landkit scored urgency 2/10)
- Free tools currently show "locked" features passively — no specificity-driven urgency
- Landkit has 4+ free entry points, Boost has 2
- Free tools are cheap to run ($0.02-0.10 each) and drive email capture

## What to Build

### 1. Diagnostic Scoring on All Free Tools

Both Landkit and LandingBoost give users an instant score (88/100, 48/100). That visceral number creates the impulse to act. Boost's free tools currently output prose — no score.

**Unified Scoring Framework — same 4 categories across all tiers, each going deeper:**

| Category | Weight | Grounded In | What It Measures |
|----------|--------|-------------|------------------|
| **Clarity** | 35% | Dunford positioning, Ries/Trout | Can people immediately understand what you do, who it's for, and why you? |
| **Visibility** | 25% | Sharp's mental/physical availability | Can your target audience actually find you? SEO, channels, discoverability |
| **Proof** | 20% | Cialdini social proof, Keller brand equity | Do you have evidence that builds trust? Reviews, case studies, mentions |
| **Advantage** | 20% | Ritson competitive strategy, Porter | What makes you defensibly different from alternatives? |

**How it maps across tiers:**

| | Boost Snapshot (3s) | Boost Brief (free) | Boost Weekly (paid) |
|---|---|---|---|
| **Clarity** | Headline clear? Value prop visible? | Positioning gap analysis, market fit | Full messaging strategy, ICP alignment |
| **Visibility** | Basic page signals | Traffic vs competitors, SEO snapshot | Keyword gaps, channel strategy, weekly tasks |
| **Proof** | Trust signals on page? | Third-party mentions, review presence | Full proof-building roadmap |
| **Advantage** | Differentiation visible? | Competitor positioning + weaknesses | Exploitable gaps, counter-strategies |
| **Depth** | Surface scan (~$0.05) | Real research (~$0.10-0.15) | Full strategy + execution (~$0.15-0.20) |

**Category rename needed**: Snapshot's current categories (Clarity, Focus, Proof, Ease) → Clarity, Visibility, Proof, Advantage. Brief's current categories (Positioning, Visibility, Proof, Competitive Edge) → same.

**Hard rule: if we can't explain WHY something scores a 4/10 with a named principle and specific evidence, we don't score it.** No vibes scoring. Every number has receipts.

**The score IS the urgency.** "Your Proof score is 3/10 because we found zero third-party mentions and your competitors both have case studies" = instant motivation grounded in fact.

### 2. Boost Brief: Lead with Competitive Landscape

The Brief's competitive landscape section is the differentiator Landkit cannot replicate — real competitors found via Tavily, not Gemini guessing from scraped pages.

Current: Locks tabs with "Available with the full Boost plan" tooltip.

New:
- **Score + competitive landscape up front** — the score hooks, the research proves it's real
- **Lock tactical sections** (Stop/Start Doing, Quick Wins, Roadmap) behind Boost Weekly upgrade
- **Show one specific finding from the locked strategy**: "Your competitor [name] gets [X] monthly visitors from [keyword]. Boost Weekly includes the counter-strategy."
- **Time-decay**: "Your Brief expires in 7 days" — honest, competitive data goes stale
- **No fear-based copy.** The score and data create their own urgency.

### 2. Single Conversion Landing Page

All free tools → one page that sells Boost Weekly ($29/mo founder, $49/mo later).

Current state: Free results have scattered CTAs to `/start`. Need a dedicated conversion page that:
- References what the Brief/Snapshot found (personalized)
- Shows what the Plan unlocks (the tactical sections)
- Introduces Weekly as the ongoing option
- Has pricing, social proof, guarantee
- Handles context from any free tool entry point

**Open question**: Is this a new page or an upgraded `/start`?

### 3. Free Tool Expansion (Boost Snapshot variants)

Aligned to unified scoring categories — each tool maps to a category, naturally funneling to the Brief for the full picture:

**Clarity tools** (35% weight = highest funnel priority):
1. **Headline / Value Prop Analyzer** — highest search volume (20-40K/mo), ~$0.02-0.04/run. "Is your headline clear?" → Clarity score → "See how your full positioning stacks up" → Brief
2. **Homepage 3-Second Test** — already built (Boost Snapshot). Expand standalone distribution.

**Visibility tools** (25% weight):
3. **SEO Visibility Check** — "How findable are you?" One domain lookup via DataForSEO (~$0.01). Shows traffic estimate + top keywords. → "See how you compare to competitors" → Brief
4. **Google My Business Audit** — for local businesses. Check listing completeness. Low cost, high local search volume.

**Proof tools** (20% weight):
5. **Social Proof Audit** — "Do strangers trust you?" Scan for reviews, testimonials, case studies on the page. ~$0.02-0.04. → "See what competitors are doing better" → Brief

**Advantage tools** (20% weight):
6. **Competitor Quick Compare** — enter your URL + one competitor. Side-by-side positioning snapshot. ~$0.05. → "Get the full competitive landscape" → Brief

**Not forced**: These are brainstormed options. Only build what has search volume and natural distribution. The Brief is the real conversion tool — Snapshots are entry points.

All follow existing pattern: form → Inngest async → result page with CTA to Brief

### 4. Public Audit Directory (SEO Play)

Landkit indexes completed audits at `/audits` for organic traffic. Boost can do this with:
- Opt-in public Brief results (anonymized)
- Each page = indexed content with long-tail keywords
- "See what Boost found for businesses like yours"

**Privacy**: Opt-in only. Checkbox on form: "Make my results public (anonymized)"

## Key Files to Modify

- `src/app/tools/marketing-audit/[slug]/results-client.tsx` — Brief urgency framing
- `src/components/free-tools/ToolBoostPitch.tsx` — upgrade CTA component
- Free tool shared components in `src/components/free-tools/`
- New conversion landing page (location TBD)

## Definition of Done

- [x] Diagnostic scoring on Snapshot (category scores + overall) — shipped Feb 1, 2026
- [x] Diagnostic scoring on Brief (BriefScoreGauge: overall + Positioning/Visibility/Proof/Competitive Edge) — shipped Feb 1, 2026
- [x] ~~Brief urgency hook~~ — removed UrgencyHook component (redundant with competitive landscape) — Feb 1, 2026
- [x] Brief leads with competitive landscape — agentic Sonnet pipeline finds competitors via search + SEO lookups, CompetitiveComparison now populated — shipped Feb 1, 2026
- [x] Free Brief redesigned: 3-Second Test, Quick Wins, Positioning Gap, score, competitive comparison — shipped Feb 1, 2026
- [x] DataForSEO cost reduced: domain_rank_overview ($0.01) replaces domain_metrics_by_categories ($0.10) — shipped Feb 1, 2026
- [x] Screenshot + Tavily extract fallback for bot-protected sites — shipped Feb 1, 2026
- [ ] Unify scoring categories across all tiers: Clarity/Visibility/Proof/Advantage (rename from current mismatched names)
- [ ] Brief locks tactical sections behind Weekly upgrade
- [ ] 7-day expiry on Brief results
- [ ] All free tools funnel to single conversion page
- [ ] At least 1 new Snapshot-style tool shipped (headline analyzer)
- [ ] Public audit directory live with opt-in
