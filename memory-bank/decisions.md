# Decisions

Key architectural and product decisions. Reference this when you need to understand "why".

---

## Free Brief Results Page Layout (Feb 1 2026)

**Decision**: 5-zone wide layout (max-w-6xl) with varied visual treatments per zone. Mix of open typography, cards, and accent borders to avoid card-card-card monotony.

**Zone architecture**: Positioning + score (3/5 + 2/5 grid) → Positioning gap + 3-second test (3/5 + 2/5) → Quick wins (3-col cards) → Competitive landscape (left border blocks) → Dark transition CTA → Locked skeletons → Paywall.

**Conversion flow**: Primary CTA lives in a dark `bg-foreground` card between free content and locked skeletons. H2 + subtitle + CTA button (left) with checkmark benefits (right). Locked sections below serve as visual proof. Bottom paywall is a safety net for scrollers.

**Competitive section**: Replaced traffic bar chart with strategic intelligence — competitor positioning, weakness, opportunity. Bar charts with massive traffic disparities (1.4M vs 49) are demoralizing, not useful. Strategic insights are more actionable.

**Typography system**: Consolidated to consistent scale — `font-mono text-[10px] tracking-[0.25em] text-foreground/40` for labels, `text-[15px] leading-[1.6] text-foreground` for body, `text-sm leading-relaxed text-foreground/50` for secondary. Body text at full foreground color for WCAG AA (text-foreground/70 fails at 4.0:1 contrast).

---

## Design Process: UI Designer Suggests, Frontend Skill Implements (Feb 1 2026)

**Decision**: The ui-designer subagent provides design SUGGESTIONS only (direction, not code). Implementation uses the frontend-design skill to ensure Soft Brutalist consistency. The ui-designer should never write code directly.

**Why**: When the ui-designer wrote code directly, it produced inconsistent results — random badges, decorative elements, typography that didn't match the page system. Separating suggestion from implementation keeps designs cohesive.

---

## Product Ladder & Naming (Feb 1 2026)

**Decision**: Three-tier product ladder, each tier = increasing clarity from the same strategist voice.

| Name | Price | Delivers |
|------|-------|----------|
| **Boost Snapshot** | Free | "Here's what a stranger sees" — quick site audit |
| **Boost Brief** | Free | "Here's where you stand" — situational clarity + real competitive landscape |
| **Boost Weekly** | $29/mo (founder) → $49/mo later | "Here's what to do this week" — full strategy + execution drafts + live data |

**No middle tier.** The $29 one-shot is killed. The current Opus pipeline becomes week 1 of the subscription. One decision point: free or $29/mo.

**Why kill the one-shot**: Users expected ongoing access for $29 ("multiple runs" confusion). Two paid tiers = two decision points = more off-ramps. The Brief does the one-shot's old job as a conversion tool. Simpler product, simpler checkout, simpler messaging.

**Why $29/mo at launch**: Our advantages (real data, Opus quality) are experience goods — invisible until used. Landkit's advantages (12 modules, $10) are visible in a screenshot. At launch with zero testimonials, we need people in the door. $29/mo matches Landkit's target price, signals same category without undercutting.

**Additional projects: $15-20/mo each.** No agency tiers, no white-label, no feature gates. Just "+Add Project" with a price tag. Freelancer managing 3 clients pays ~$59-69/mo. Organic expansion revenue without product complexity. Landkit charges $39/mo for 15 projects + team members — overbuilds for a use case that doesn't need its own tier.

**Why $49/mo later**: After GSC/GA4 ships + 30-50 subscribers + testimonials, raise for new signups. Early adopters stay at $29 — framed as respect for people who showed up first, not a deal or promotion.

**Why these names**: Functional, not clever. No tier labels (Starter/Pro). "Boost Lite" rejected — tells users they're getting lesser version. "Boost Weekly" sets expectations (cadence, not commitment) and sounds like something you open Monday morning.

**Full plan**: `projects/v2-master-plan.md`

---

## Product Philosophy: Success = Graduation (Feb 1 2026)

**Decision**: If someone leaves after 3 months because they figured out their marketing, the product worked.

Boost Weekly is not a dependency machine. No dark-pattern retention, no guilt-trip cancellation flows, no feature bloat to justify ongoing billing. Healthy churn from founders who outgrew us is the goal. Acquisition solves volume, not stickiness hacks.

Building for month 3+ retention via platform expansion is a year+ problem. Not now.

---

## Urgency Strategy: Specificity, Not Fear (Feb 1 2026)

**Decision**: Both competitor audits scored Boost 2/10 on urgency. Fix with data-driven specificity, not fear tactics.

**Boost Brief urgency**: Lead with competitive landscape (real differentiator), lock tactics, show one specific finding from full strategy, 7-day expiry on results (honest — data goes stale). Email nurture sequence during the 7-day window (3 emails).

**Boost Weekly pricing**: Early adopters keep their rate. Framed as respect, not a promotion. No "locked for life" deal energy, no founder counters.

**What we're NOT doing**: Countdown timers, founder counters, fake scarcity, fear-based copy. If the urgency doesn't come from the data itself, it's not real urgency.

**Why**: The brand is a direct strategist. Specificity creates its own urgency — "Your competitor ranks for 47 keywords you don't" hits harder than "you're bleeding money." Trust > manipulation.

---

## Dashboard Philosophy: Focus Over Sprawl (Feb 1 2026)

**Decision**: Boost Weekly dashboard shows three things, not twelve. Resist Landkit's packed-module approach.

1. **This week's focus** — 1-3 specific actions picked by the strategist
2. **What's working** — filtered data, not raw dashboards
3. **Draft it** — one button per action, aligned to ICP/voice/strategy

Business profile = settings. No gamification, no health scores, no "Blueprint Locked" gating.

**Why**: Clarity is the brand promise. A cluttered dashboard undermines it. Landkit's 12+ modules with "Activate Feature" buttons are dashboard dressing for a solo dev 30 days in. Do fewer things with real data.

---

## Positioning: Clarity, Not Plans or Competitor Research (Feb 1 2026)

**Decision**: The value prop is **clarity** — "get clarity on what's working and what's not." NOT "30-day marketing plan" (tested poorly, sounds generic) and NOT "competitive research" (that's a feature/input, not the outcome).

**When writing about Boost externally**: Lead with the outcome (clarity on your market, where you stand, what to do next). Competitor data, keyword rankings, traffic analysis are supporting details, not the headline.

**Why**: "Marketing plan generator" made people bounce — sounds like a ChatGPT wrapper. "Competitive research" is too narrow and feature-focused. "Clarity" is what people actually want and what triggered the first paid conversion.

---

## Thesis-Driven Plan Architecture (Jan 27 2026)

**Decision**: Restructure Opus pipeline prompt around an internal "thesis" — a strategic diagnosis that silently drives plan coherence — instead of a single goal or scattered goals.

**Why a thesis?** Gives coherence of one goal with breadth of multiple goals. User feels diagnosed, not assigned homework. Backed by research: professionals use OMTM as north star but multiple experiments feeding it.

**Thesis is internal.** Not shown to user. Captured in `structured_output.thesis` for future subscription quality scoring.

**New section: "The Opportunity."** Bridges research → action. The "therefore" that was missing.

**Channel Strategy removed as standalone.** Woven into Start Doing (ICE-scored plays).

**Prompt only enforces what UI renders.** Named deliverables, week closers — saved for subscription tier.

---

## Facebook Pixel + Conversion API (Jan 27 2026)

**Decision**: Both client-side Pixel and server-side Conversion API for purchase tracking.

- Client-side alone misses ~30-40% iOS conversions due to ATT
- Event deduplication via shared `eventID` (`purchase_${runId}`)
- GDPR conditional: Pixel only for non-GDPR countries
- `?new=1` URL param triggers purchase event, then cleared

**Files**: `FacebookPixel.tsx`, `api/fb/conversion/route.ts`, `next.config.ts` (CSP)

---

## Target Audience: Tech-Adjacent Entrepreneurs (Jan 24 2026)

**Decision**: Pivot from pure SMBs to tech-adjacent entrepreneurs who can find and buy tools.

**Why**: Enji.co (direct competitor) tried SMBs for 4+ years with 12 people, still only 1.5K monthly visits. SMBs are hard to reach online. SaaS/solopreneur subreddits have proven, active demand.

**Audience (priority order)**:
1. SaaS founders / solopreneurs — r/SaaS, r/solopreneur, Twitter
2. E-commerce / Shopify — r/ecommerce, r/shopify
3. Service businesses — consultants, agencies (self-selecting)

**Key insight**: Distribution > features. Enji built everything, still invisible.

---

## Competitive Intel: Enji.co (Jan 24 2026)

Boost found Enji.co — a competitor ChatGPT, Claude, and manual searches all missed. Only Tavily + DataForSEO surfaced it. **Validates the "real research" differentiator.**

Enji: ~2021, ~12 people, 1.5K monthly visits, $29/mo full suite (strategy, calendar, scheduler, AI copywriter, coaching). Despite all features — hasn't cracked distribution.

**Positioning**: Enji = "tools to do marketing" vs Boost = "intelligence that tells you what to do."

---

## Brand Voice: Direct Strategist (Jan 24 2026)

**Decision**: Direct, confident voice that respects the audience's intelligence.

**Core**: "Finally know what's working — and what to do next."

**Why**: Original warm voice was for SMBs (unreachable). New audience wants answers, not hand-holding. Founder personality is naturally blunt/direct — authentic voice > performed voice.

**Tone**: Direct, confident, helpful. Second person. Specific recs backed by research.

**Avoid**: Hand-holding, startup bro energy, hedging, emojis, preachy tone.

---

## Pricing: $29 One-Shot + $49/mo Subscription (Jan 23 2026)

| Product | Price | What You Get |
|---------|-------|--------------|
| One-shot | $29 | 1 strategy + 2 refinements + dashboard (static) |
| Subscription | $49/mo | Integrations + fresh data + weekly check-ins |

**Why $29**: $10 = GPT wrapper feel. $25 = instant buy. $40+ = hesitation. $29 = floor for "real product."

**Conversion funnel**: $29 one-shot → dashboard → grayed-out integrations → $49/mo subscription. Dashboard sells subscription, not pricing page.

**History**: $9.99 (zero traction) → $49 (SMB repositioning) → $29 (optimized for funnel).

---

## Visual Style: Soft Brutalist (Jan 23 2026)

**Decision**: Updated from Light Skeuomorphism to Soft Brutalist.

**Why**: Light Skeu felt too generic SaaS. Needed visual confidence for "Direct Strategist" brand.

**Token reference**:
- Cards: `border-2 border-foreground/20`, `boxShadow: 4px 4px 0 rgba(44,62,80,0.1)`, `rounded-xl`
- Primary buttons: `shadow-[4px_4px_0_rgba(44,62,80,0.3-0.4)]`
- On dark backgrounds: `rgba(255,255,255,0.08)` for shadows

**Full history**: `_archive/decisions/visual-styles-evolution.md`

---

## LLM Model: Claude Opus 4.5 (Paid) / Sonnet 4 (Free)

| Pipeline | Model | Cost |
|----------|-------|------|
| Paid strategy (agentic) | Opus 4.5 | ~$0.15-0.20 |
| Free Brief (agentic) | Sonnet 4 + tools | ~$0.10-0.15 |
| Formatter (all pipelines) | Sonnet 4 | ~$0.02 |
| Refinements | Opus 4.5 | ~$0.10-0.15 |

Free Brief upgraded from one-shot to agentic Sonnet with search + SEO tools (Feb 1 2026). Cost increased from ~$0.04 to ~$0.10-0.15 but output is dramatically better — real competitors found, actual SEO data, landing page analysis.

**Constraint**: Do NOT change model names without explicit user approval.

---

## Free-to-Paid Upgrade: Context Continuity (Jan 27 2026)

Free audit output passed as context to paid pipeline. Claude instructed: "Build on it, don't repeat, go deeper." Checked via `upgrade_from_free_audit_id` in Stripe metadata.

---

## Credit System: Separate Table

Track credits in `run_credits` table for audit trail. Sum credits for balance. Alternative rejected: simple counter on users (no history).

---

## Auth: Magic Links Only

No passwords. Email magic link via Supabase Auth. `auth_id` on `public.users` links to `auth.users.id`. Users created via Stripe before auth, linked on first login by email match.

---

## Research APIs: Tavily + DataForSEO

Both for competitive intelligence. Tavily = real-time web search. DataForSEO = SEO metrics, keyword data. Fallback: proceed with partial research if one fails.

---

## DataForSEO: Focus-Area Routing

| Focus Area | Endpoints | Cost |
|------------|-----------|------|
| acquisition / custom | all 5 | ~$0.50 |
| referral | 3 | ~$0.20 |
| activation/retention/monetization | 1 | ~$0.05 |

Keeps costs proportional to how useful SEO data is for each problem type.

---

## Processing: Inngest Background Jobs (Jan 25 2026)

Vercel Pro = 300s limit. Pipelines take 5-10 min. Inngest = up to 2 hours per step, built-in retries.

**Setup gotcha**: If Vercel integration rotates keys, events won't send. Verify keys match between Vercel env vars and Inngest dashboard.

Previous approach: `after()` failed when pipeline exceeded 300s.

---

## Context Limits: Bounded Arrays

| Array | Limit |
|-------|-------|
| traction.history | 10 |
| tactics.tried/working/notWorking | 50 each |
| competitors | 10 |

Prevents unbounded JSONB growth. `.slice(-MAX)` in `accumulate.ts`.

---

## AI Context Limits: Relaxed for Quality (Jan 21 2026)

Increased truncation limits (MAX_TOKENS 8K→12K, various char limits 150-300→400-800). Cost ~$0.50→$0.60/run. Margin remains 85-94%.

---

## Positioning Reframe: Diagnosis Over Plan (Jan 30 2026)

**Decision**: Stop leading with "30-day marketing plan" in copy. Lead with diagnosis, clarity, and direction instead.

**Why**: "30-day plan" describes the delivery format, not the value. The ICP is pre-traction — they don't even have acquisition figured out. They don't want a plan (homework). They want someone to tell them what's going on and what to do about it. "Plan" works for workouts, not for people who are lost. Nobody searches for or clicks on "marketing plan" in FB ads — the term doesn't resonate.

**The reframe**:
- FROM: "Get a 30-day marketing plan" → TO: "Find out what's working, what's not, and what to do next"
- FROM: "Plan ready in 5 minutes" → TO: don't lead with time (fast = shallow)
- FROM: naming specific tools (Tavily, DataForSEO) → TO: "hundreds of sources across the internet" (don't reveal the secret sauce)

**Where "30-day" is OK**: As a supporting detail deep in copy ("includes a week-by-week roadmap"), not as the headline or CTA.

**Applies to**: All customer-facing copy — ads, landing pages, CTAs, emails, social. Internal docs can still reference the plan structure.

---

## Refinement Counting: Live Count, Not Counter (Feb 1 2026)

**Decision**: Replace upfront `refinements_used` counter increment with a live count of completed refinement child runs.

**Why**: The counter was incremented before the pipeline ran. If the pipeline failed, the slot was consumed for nothing. Now only `status = 'complete'` refinements count against the limit.

**How it works**:
- Limit check: `SELECT count(*) FROM runs WHERE parent_run_id = :rootRunId AND source = 'refinement' AND status = 'complete'`
- Concurrency gate: `refinements_used` column kept for optimistic locking (prevents two concurrent requests slipping past the count check), but it no longer determines the limit
- All refinement runs set `parent_run_id` to the **root** run (flat hierarchy) so counts are accurate regardless of which run in the chain the user refines from
- In-flight check blocks submitting while a refinement is pending/processing

**Files**: `api/runs/[runId]/add-context/route.ts`, `api/runs/[runId]/route.ts`

---

## Supabase Branching: Migration Compatibility Fix (Feb 1 2026)

**Decision**: Patched stored migration SQL in `supabase_migrations.schema_migrations` to use `IF EXISTS` on all DROP statements.

**What happened**: Migration `fix_rls_and_security_advisors` (20260128221642) used `DROP POLICY "Allow all access to reddit_sent_posts"` without `IF EXISTS`. That policy was manually created on production (not via migration), so it existed on prod but not on fresh branch databases. Branch creation failed with `MIGRATIONS_FAILED`.

**Fix**: Updated the stored `statements` array for that migration to use `DROP POLICY IF EXISTS` and `DROP FUNCTION IF EXISTS` on all DROP statements. This is safe because IF EXISTS is a no-op when the object exists (prod) and skips cleanly when it doesn't (branches).

**Lesson**: Never use `DROP POLICY/FUNCTION` without `IF EXISTS` in migrations. Policies created manually on prod won't exist on fresh branch databases.

**GitHub integration not required** for Supabase branching — branches are created/managed via the Supabase MCP API. GitHub integration is optional (auto-creates branches from PRs).

---

## Minor Decisions

- **URL Routes**: `/start`, `/results/[id]`, `/share/[slug]` — descriptive, memorable
- **Form Before Payment**: Psychological investment from filling form first
- **No User Accounts**: Email-only identifier for MVP
- **Share Links**: Random UUIDs, not sequential (security)
- **AI Prompts**: Inlined in code, not external files
- **AARRR Focus Areas**: User selects one of 6 for focused output
- **Research Timeouts**: Promise.race (Tavily doesn't support AbortSignal). 15s Tavily, 10s DataForSEO.

---

**Archived decisions**: `_archive/decisions/` (visual-styles-evolution, rag-implementation-details, superseded-pricing)
