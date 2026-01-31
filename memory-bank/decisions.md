# Decisions

Key architectural and product decisions. Reference this when you need to understand "why".

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
| Free positioning preview | Sonnet 4 | ~$0.02 |
| Formatter (all pipelines) | Sonnet 4 | ~$0.02 |
| Refinements | Opus 4.5 | ~$0.10-0.15 |

Sonnet-Sonnet for free audits: 64% cost savings ($0.10 → $0.04), quality good. Sonnet's slightly critical tone creates urgency to upgrade.

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
