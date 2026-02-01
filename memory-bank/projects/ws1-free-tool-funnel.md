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

**Add scoring to every free tool — grounded in real marketing frameworks, not arbitrary numbers:**

- **Boost Snapshot**: Already uses 3-Second Test (Clarity, Customer Focus, Proof, Friction). Rooted in conversion copywriting principles (Schwartz awareness levels, Cialdini trust signals). Add explicit per-category scores + overall.
- **Boost Brief**: Scoring rubric TBD — must be designed before building. Categories should map to positioning strength (Dunford framework), channel readiness (AARRR), competitive exposure (real data: traffic gaps, keyword gaps, content gaps vs competitors found). Each score backed by specific evidence from the research, not LLM inference.
- **Future Snapshot tools** (headline analyzer, email subject scorer): Each gets its own framework-grounded rubric.

**Hard rule: if we can't explain WHY something scores a 4/10 with a named principle and specific evidence, we don't score it.** No vibes scoring. Every number has receipts.

**The score IS the urgency.** "Your Proof score is 3/10 because we found zero third-party mentions and your competitors both have case studies" = instant motivation grounded in fact.

**Prerequisite**: Design the Brief scoring rubric (categories, what each measures, what data feeds each score) before building the UI. This is product design work — consult growth-hacker agent for framework selection.

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

From `free-tools-seo.md` — more Snapshot-style entry points:
1. **Headline / Value Prop Analyzer** — highest search volume (20-40K/mo), ~$0.02-0.04/run
2. **Email Subject Line Scorer** — cheapest (~$0.01-0.02), high volume
3. All follow existing pattern: form → Inngest async → result page with CTA to Brief/Plan

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

- [ ] Diagnostic scoring on Snapshot (category scores + overall)
- [ ] Diagnostic scoring on Brief (marketing position score + breakdown)
- [ ] Brief leads with score + competitive landscape, locks tactics
- [ ] Brief shows one specific finding from full strategy as urgency hook
- [ ] 7-day expiry on Brief results
- [ ] All free tools funnel to single conversion page
- [ ] At least 1 new Snapshot-style tool shipped (headline analyzer)
- [ ] Public audit directory live with opt-in
