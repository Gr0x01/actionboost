# Actionboo.st

**Founder**: Rashaad

## The Product

**Your 30-day marketing plan. Real research, not generic advice.**

Target audience: **Small business owners** — salons, local services, niche e-commerce. People who are stuck on marketing and don't have time to become marketing experts.

**v1 (now)**: One-shot runs. Pay $49, tell us about your business, get a real strategy built on live competitive research + Claude Opus 4.5 reasoning. Includes 2 refinements.

**v2 (future)**: Connected growth advisor. Link PostHog/Mixpanel/GA → weekly analysis email → reply to ask questions → $29-49/mo.

**The flywheel**: User does $49 one-shot, loves it → "Want this every week, automatically?" → subscription.

**Output format**: Executive Summary → Your Situation → Competitive Landscape → Stop Doing → Start Doing → Quick Wins → 30-Day Roadmap.

**Brand voice**: Friendly, hand-holding, no jargon. "Let's figure it out together" — not intimidating marketing-speak. Explains frameworks in plain English (AARRR → "Finding you, Trying you, Coming back, Telling friends, Paying you").

## Why It Works

1. **User invests time before money** - Fill out detailed form BEFORE seeing checkout. After 10 minutes of input, they're committed.
2. **Real research on YOUR competitors** - Tavily searches, DataForSEO metrics. Not templated advice.
3. **No friction** - No account, no subscription. Email for receipt + magic link to access later.

## The Core Tech

| Service | Purpose | Why It Matters |
|---------|---------|----------------|
| **Claude Opus 4.5** | Strategy generation | Best reasoning model |
| **Tavily** | Web search | Real-time competitive intel, recent content, trends |
| **DataForSEO** | SEO/traffic data | Competitor traffic estimates, keyword gaps |
| **Stripe** | Payments | $49 single run |
| **Supabase** | DB + Auth | Magic links, run storage, credits |

**Model ID**: `claude-opus-4-5-20251101` - DO NOT CHANGE without approval.

## Pricing & Economics

| Product | Price | Cost | Margin |
|---------|-------|------|--------|
| One-shot | $49 | ~$1.50-2.50 | ~95% |
| Free mini-audit | $0 | ~$0.07 | lead gen |
| Subscription (v2) | $29-49/mo | TBD | TBD |

Cost breakdown in `architecture.md`. Subscription is the upsell path.

---

## For Development

**Domain**: actionboo.st

**Stack**: Next.js 16, React 19, Tailwind 4, Supabase, Stripe

**Commands**:
```bash
npm run dev          # localhost:3000
npm run build        # production build
npm run test:run     # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run test:all     # Both
```

**Env vars needed**: See `.env.example` or architecture.md

---

## Doc Map

| Doc | Read when... |
|-----|--------------|
| `phases/current.md` | Starting work (ALWAYS read this) |
| `product.md` | Building user-facing features |
| `architecture.md` | Building backend/infra |
| `decisions.md` | You need to understand "why" |
