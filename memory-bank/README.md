# Boost

**Founder**: Rashaad

## The Product

**Your 30-day marketing plan. Real research, not generic advice.**

Target audience: **Tech-adjacent entrepreneurs** — SaaS founders, solopreneurs, e-commerce/Shopify, service businesses. People who can find and buy tools but won't build their own.

**v1 (now)**: One-shot runs. Pay $29, tell us about your business, get a real strategy built on live competitive research + Claude Opus 4.5 reasoning. Includes 2 refinements + dashboard access.

**v2 (future)**: Subscription tier. $49/mo for integrations (PostHog/Mixpanel/GA), fresh competitor data, weekly check-ins. Dashboard sells the subscription via grayed-out integration slots.

**The flywheel**: User does $29 one-shot → gets dashboard → sees grayed-out integrations → "Connect Google Analytics for weekly insights" → $49/mo subscription.

**Output format**: Executive Summary → Your Situation → Competitive Landscape → Stop Doing → Start Doing → Quick Wins → 30-Day Roadmap.

**Brand voice**: Direct strategist. "Stop guessing. Get a marketing plan that works." — confident, specific, respects intelligence. No hand-holding, no startup bro energy, no emojis.

## Why It Works

1. **User invests time before money** - Fill out detailed form BEFORE seeing checkout. After 10 minutes of input, they're committed.
2. **Real research on YOUR competitors** - Tavily searches, DataForSEO metrics. Not templated advice.
3. **No friction** - No account, no subscription. Email for receipt + magic link to access later.

## Traction

- **#1 App of the Week** on PeerPush (Jan 2026)

## The Core Tech

| Service | Purpose | Why It Matters |
|---------|---------|----------------|
| **Claude Opus 4.5** | Strategy generation | Best reasoning model |
| **Tavily** | Web search | Real-time competitive intel, recent content, trends |
| **DataForSEO** | SEO/traffic data | Competitor traffic estimates, keyword gaps |
| **Stripe** | Payments | $29 one-shot, $49/mo subscription |
| **Supabase** | DB + Auth | Magic links, run storage, credits |
| **Inngest** | Background jobs | Async pipeline execution, retries |
| **Screenshot Service** | Homepage capture | Vultr Puppeteer service for visual audit (45.63.3.155, $10/mo) |

**Model ID**: `claude-opus-4-5-20251101` - DO NOT CHANGE without approval.

**Domain**: aboo.st (product name is "Boost")

## Pricing & Economics

| Product | Price | Cost | Margin |
|---------|-------|------|--------|
| One-shot | $29 | ~$1.50-2.50 | ~91% |
| Free mini-audit | $0 | ~$0.07 | lead gen |
| Marketing audit (visual) | $0 | ~$0.04-0.06 | lead gen |
| Subscription | $49/mo | TBD | TBD |
| Annual | ~$400/yr ($33/mo) | TBD | TBD |

Cost breakdown in `architecture.md`. Dashboard sells subscription via integration upsells.

---

## For Development

**Stack**: Next.js 16, React 19, Tailwind 4, Supabase, Stripe

**Commands**:
```bash
npm run dev          # localhost:3000
npm run inngest:dev  # Inngest Dev Server on :8288 (run alongside dev)
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
