# Roadmap

## v1: One-Shot Runs — COMPLETE (Sunsetting)

| # | Phase | Status |
|---|-------|--------|
| 0 | Setup & Docs | Done |
| 1 | Database | Done |
| 2 | AI Pipeline | Done |
| 3 | Payments (Stripe) | Done |
| 4 | Landing + Input | Done |
| 5 | Results | Done |
| 6 | Dashboard | Done |
| 7 | Launch | Done |

v1 stays live until Boost Weekly launches, then sunsets. The Opus pipeline (Tavily + DataForSEO + Opus strategy) carries forward as week 1 of the subscription.

---

## v2: Boost Weekly — IN PROGRESS

**The real product.** Free tools prove research quality, subscription is the business.

**Full plan**: `projects/v2-master-plan.md`

### Product Ladder

| Name | Price | Purpose |
|------|-------|---------|
| Boost Snapshot | Free | SEO lead gen, quick site audit |
| Boost Brief | Free | Conversion tool — proves research is real |
| Boost Weekly | $29/mo (founder) → $49/mo later | The product. Strategy + execution + live data |

Additional projects: $15-20/mo each. No agency tiers.

### Workstreams

| WS | What | Status | Depends On |
|----|------|--------|------------|
| WS5 | Dev infrastructure (branching, previews) | Not started | — |
| WS1 | Free tool funnel (urgency, single conversion page) | Not started | WS5 |
| WS2 | Boost Weekly platform (profiles, billing, dashboard) | Not started | WS5 |
| WS3 | Execution engine ("Draft this") | Not started | WS2 |
| WS4 | Integrations (GSC, GA4) | Not started | WS2 |

**Build order**: WS5 → WS1 (ships independently) → WS2 (core) → WS3 + WS4 (parallel)

**Validation gate**: Before building the full orchestrator (WS2 Phase 3), get 3-5 paying subscribers via manual re-vectoring.

### Key Decisions Made

- Kill the $29 one-shot — subscription only
- $29/mo at launch (experience goods need people in the door), $49/mo after proof
- Dashboard: 3 panels (this week / what's working / draft it), not 12 modules
- Urgency through specificity, not fear
- Founder pricing locked for life

See `decisions.md` for rationale.

---

## Phase Summaries (v1, for reference)

### 1. Database
Supabase schema, RLS policies, client utilities.

### 2. AI Pipeline
Tavily research → Claude Opus 4.5 → markdown output. The core value. Carries forward into Boost Weekly as initial plan generation.

### 3. Payments
Stripe checkout ($29 single run), webhooks trigger pipeline. Evolving to $29/mo subscription.

### 4. Landing + Input
Marketing page, form with all fields, localStorage persistence.

### 5. Results
Display markdown strategy, copy button, share link.

### 6. Dashboard
Past runs, credits remaining. Will be replaced by Boost Weekly dashboard.

### 7. Launch
Production deploy, domain (aboo.st), monitoring.
