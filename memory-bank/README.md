# Boost

**Founder**: Rashaad

## The Product

**Stop guessing. Get clarity on what's working and what's not.**

Target audience: **Tech-adjacent entrepreneurs** — SaaS founders, solopreneurs, e-commerce/Shopify, service businesses. People who can find and buy tools but won't build their own.

### Product Ladder (Feb 2026)

| Name | Price | What It Delivers | Cost |
|------|-------|-----------------|------|
| **Boost Snapshot** | Free | "Here's what a stranger sees" — quick site audit (3-Second Test) | ~$0.05 |
| **Boost Brief** | Free | "Here's where you stand" — situational clarity + real competitive landscape | ~$0.10 |
| **Boost Weekly** | $29/mo (founder) → $49/mo later | "Here's what to do this week" — full strategy + execution drafts + live data | ~$1.50/mo |

Additional projects: $15-20/mo each. No agency tiers.

**v1 (current, sunsetting when Weekly launches)**: One-shot runs at $29. Still live, still works.

**v2 (building now — Boost Weekly)**: $29/mo subscription. Business profile (ICP, voice, competitors), full Opus strategy on signup (replaces one-shot), weekly re-vectoring, "Draft this" execution engine, GSC/GA4 integration (later). Dashboard shows 3 things: this week's focus, what's working, draft it.

**The flywheel**: Boost Snapshot/Brief (free, proves research is real) → Boost Weekly ($29/mo, full strategy + execution). Brief leads with competitive landscape — the "wow" Landkit can't replicate.

**Output format**: Executive Summary → Your Situation → Competitive Landscape → Stop Doing → Start Doing → Quick Wins → 30-Day Roadmap.

**Brand voice**: Direct strategist. "Stop guessing. Get clarity on what's working and what's not." — confident, specific, respects intelligence. No hand-holding, no startup bro energy, no emojis.

**IMPORTANT — Positioning guidance**: The value prop is **clarity**, not "marketing plan" or "competitive research." Competitor research is one input/feature, not the headline. When describing Boost externally (copy, posts, pitches), lead with the outcome (clarity on your market, what to do next) not the mechanism (competitor data, keyword rankings). "30-day marketing plan" framing tested poorly — avoid it.

## Why It Works

1. **Real research on YOUR market** - Tavily searches, DataForSEO metrics, homepage screenshots. Not templated advice.
2. **Depth over breadth** - Competitors (Landkit) use Gemini on scraped pages. Boost uses Opus + real external data. Found competitors that ChatGPT/Claude/manual searches all missed.
3. **Execute, not just plan** - "Draft this" turns strategy into ready-to-post content aligned to ICP and brand voice.

## Traction

- **#1 App of the Week** on PeerPush (Jan 2026)
- First paid customer (Jan 2026)

## The Core Tech

| Service | Purpose | Why It Matters |
|---------|---------|----------------|
| **Claude Opus 4.5** | Strategy generation | Best reasoning model |
| **Claude Sonnet 4** | Execution drafts, free audits | Quality at low cost |
| **Tavily** | Web search | Real-time competitive intel, recent content, trends |
| **DataForSEO** | SEO/traffic data | Competitor traffic estimates, keyword gaps |
| **Stripe** | Payments | $29/mo subscription (founder), $49/mo (later) |
| **Supabase** | DB + Auth | Magic links, run storage, business profiles |
| **Inngest** | Background jobs | Async pipeline execution, retries, weekly cron |
| **Screenshot Service** | Homepage capture | Vultr Puppeteer service for visual audit (45.63.3.155, $10/mo) |

**Model ID**: `claude-opus-4-5-20251101` - DO NOT CHANGE without approval.

**Domain**: aboo.st (product name is "Boost")

## Pricing & Economics

| Product | Price | Cost | Margin |
|---------|-------|------|--------|
| Boost Weekly (1 project) | $29/mo | ~$1.50/mo | ~95% |
| Additional project | $15-20/mo | ~$1.50/mo | ~90%+ |
| Boost Brief (free) | $0 | ~$0.10 | lead gen |
| Boost Snapshot (free) | $0 | ~$0.05 | lead gen |

Cost breakdown in `architecture.md`. Full plan in `projects/v2-master-plan.md`.

---

## For Development

**Stack**: Next.js 16, React 19, Tailwind 4, Supabase, Stripe

**Commands**:
```bash
npm run dev          # localhost:3001
npm run inngest:dev  # Inngest Dev Server on :8288 (run alongside dev)
npm run build        # production build
npm run test:run     # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:all     # Both
```

**Env vars needed**: See `.env.example` or architecture.md

**Dev process**: Feature branches + Supabase branching for schema changes. See `projects/ws5-dev-infrastructure.md`.

---

## Doc Map

| Doc | Read when... |
|-----|--------------|
| `phases/current.md` | Starting work (ALWAYS read this) |
| `product.md` | Building user-facing features |
| `architecture.md` | Building backend/infra |
| `decisions.md` | You need to understand "why" |
| `projects/v2-master-plan.md` | Understanding the full product direction |
