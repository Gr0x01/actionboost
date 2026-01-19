# Actionboo.st

## The Product

**AI growth strategist for startups and entrepreneurs who are stuck.**

Not another ChatGPT wrapper. Not generic "have you tried content marketing?" advice.

**v1 (now)**: One-shot runs. Pay $9.99, paste your situation, get a real strategy built on live competitive research + Claude Opus 4.5 reasoning.

**v2 (future)**: Connected growth advisor. Link PostHog/Mixpanel/GA → weekly analysis email → reply to ask questions → $29-49/mo. The real product.

**The flywheel**: User does $9.99 one-shot, loves it → "Want this every week, automatically?" → $29/mo subscription.

**Output format**: Executive Summary → Your Situation → Competitive Landscape → Stop Doing → Start Doing → Quick Wins → 30-Day Roadmap.

**AI persona**: `.claude/agents/growth-hacker.md` - AARRR framework, ICE prioritization, systematic growth thinking.

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
| **Stripe** | Payments | $9.99 single run |
| **Supabase** | DB + Auth | Magic links, run storage, credits |

**Model ID**: `claude-opus-4-5-20251101` - DO NOT CHANGE without approval.

## Pricing & Economics

| Product | Price | Cost |
|---------|-------|------|
| One-shot | $9.99 | ~$0.50 |
| Free mini-audit | $0 | ~$0.04 |
| Subscription (v2) | $29/mo | TBD |

Per-run cost: ~$0.50 (Opus + research APIs). Free tier uses Sonnet + Tavily only (~$0.04).

3-pack removed — subscription is the upsell path, not bulk credits.

---

## For Development

**Domain**: actionboo.st

**Stack**: Next.js 16, React 19, Tailwind 4, Supabase, Stripe

**Commands**:
```bash
npm run dev          # localhost:3000
npm run build        # production build
npm run test:e2e     # Playwright tests
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
