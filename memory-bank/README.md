# ActionBoost

## The Product

**One-shot AI growth strategist for solo founders who are stuck.**

Not another ChatGPT wrapper. Not generic "have you tried content marketing?" advice.

You pay $15, paste your actual situation, get back a real strategy built on:
- **Live competitive research** via Tavily (web search) + DataForSEO (traffic/SEO data)
- **Serious AI reasoning** via Claude Opus 4.5 - not GPT-3.5 slop

The output is a battle-tested format: Executive Summary → Your Situation → Competitive Landscape → Stop Doing → Start Doing → Quick Wins → 30-Day Roadmap.

**The AI persona**: `.claude/agents/growth-hacker.md` - uses AARRR framework, ICE prioritization, systematic growth thinking. This is what makes the output valuable, not just "ask ChatGPT".

## Why It Works

1. **User invests time before money** - Fill out detailed form BEFORE seeing checkout. After 10 minutes of input, they're committed.
2. **Real research on YOUR competitors** - Tavily searches, DataForSEO metrics. Not templated advice.
3. **No friction** - No account, no subscription. Email for receipt + magic link to access later.

## The Core Tech

| Service | Purpose | Why It Matters |
|---------|---------|----------------|
| **Claude Opus 4.5** | Strategy generation | Best reasoning model. Worth the cost at $15/run. |
| **Tavily** | Web search | Real-time competitive intel, recent content, trends |
| **DataForSEO** | SEO/traffic data | Competitor traffic estimates, keyword gaps |
| **Stripe** | Payments | $15 single, $30 for 3-pack |
| **Supabase** | DB + Auth | Magic links, run storage, credits |

**Model ID**: `claude-opus-4-5-20251101` - DO NOT CHANGE without approval.

## Pricing & Economics

| Product | Price | Margin |
|---------|-------|--------|
| Single | $15 | ~$12 (~80%) |
| 3-Pack | $30 | ~$24 (~80%) |

Per-run cost breakdown: ~$1-2 Opus, ~$0.50-1 research APIs, ~$0.75 Stripe fees.

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
