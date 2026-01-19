# Product: Actionboo.st

## Value Prop

> "Stuck on growth? Get your next moves."

Not generic ChatGPT advice - analyzes YOUR situation with live competitive research.

---

## User Flow

```
Landing (/) → Input Form (/start) → Checkout → Processing → Results
                                         ↓
                              [or redeem coupon code]
                                         ↓
                              [or free mini-audit]
```

**Key insight**: User fills out form BEFORE paying. Invested time = harder to bounce.

### Free Mini-Audit (Lead Magnet)
Subtle "Just want a taste?" option at checkout → 5-section condensed audit → upsell to full version.
- Model: Claude Sonnet (cheaper)
- Research: Tavily only (no DataForSEO)
- Cost: ~$0.04/run
- Rate limit: 1 per email (Gmail aliases normalized)

---

## Landing Page Content

### Hero
- Headline: "Stuck on growth? Get your next moves."
- Subhead: AI-powered growth strategy with real competitive research. Not ChatGPT fluff.
- CTA: "Get Started" → /start

### Credibility Section (show the frameworks)
Display these to prove there's real methodology:

**"Built on proven growth frameworks"**
- **AARRR (Pirate Metrics)** - Acquisition, Activation, Retention, Referral, Revenue
- **ICE Prioritization** - Every recommendation scored by Impact, Confidence, Ease
- **Growth Equation** - Systematic approach: (New Users × Activation × Retention × Referral) - Churn

### What You Get
- Competitive landscape analysis (real research, not generic)
- What to STOP doing (with reasoning)
- What to START doing (prioritized by impact)
- Quick wins for this week
- 30-day action roadmap
- Metrics to track success

### How It Works
1. Tell us about your business (5-10 min form)
2. We research your competitors and market
3. Get your custom growth playbook

### Pricing
- $7.99 for one strategy
- $19.99 for 3 (shown but not primary CTA)

### Social Proof
- Sample output snippet (show quality)
- "Built by @handle" footer

---

## Pages

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Landing - hero, value prop, pricing, frameworks | No |
| `/start` | Input form - collect business context | No |
| `/checkout` | Order summary, coupon input, Stripe redirect | No |
| `/processing/[runId]` | Progress indicator while AI works | No |
| `/results/[runId]` | Strategy display, export options | Owner or share link |
| `/free-results/[id]` | Mini-audit results with upsell CTAs | No |
| `/share/[slug]` | Public read-only view of results | No |
| `/dashboard` | User's past runs, credits remaining | Yes (magic link) |

---

## Input Form Fields

### Required
- **Product description** - What does it do? (1-2 sentences)
- **Current traction** - Users, revenue, traffic, whatever matters
- **What you've tried** - Channels, tactics, experiments
- **What's working/not** - Current wins and failures

### Optional
- Competitor URLs (up to 3)
- Your website URL
- Analytics summary (paste from GA/PostHog)
- Constraints (budget, time, skills)

### Focus Area (radio)
- Growth & Acquisition (default)
- Monetization & Conversion
- Competitive Positioning

**Total character limit**: ~10,000 (keeps API costs predictable)

---

## Data Schema

### users
- `id`, `email` (unique), `created_at`
- No passwords - auth via magic link

### runs
- `id`, `user_id` (nullable), `status` (pending/processing/complete/failed)
- `input` (JSONB - form data), `output` (TEXT - markdown strategy)
- `share_slug` (unique, for public sharing)
- `stripe_payment_intent_id`, `created_at`, `completed_at`

### run_credits
- `id`, `user_id`, `credits` (integer), `source` (stripe/code/manual)
- `stripe_checkout_session_id`, `created_at`
- **Why a table?** Audit trail for purchases. Sum credits to get balance.

### codes
- `id`, `code` (unique), `credits`, `max_uses`, `used_count`, `expires_at`
- Launch codes: REDDIT20, INDIEHACKERS, PRODUCTHUNT, LAUNCH, FRIEND

### free_audits
- `id`, `email` (unique - enforces 1 per email), `input` (JSONB), `output` (TEXT)
- `status` (pending/processing/complete/failed), `created_at`, `completed_at`
- Email normalized for rate limiting (Gmail aliases stripped)

---

## Pricing

| Product | Price | Credits |
|---------|-------|---------|
| Single | $7.99 | 1 |
| 3-Pack | $19.99 | 3 |

**Per-run cost**: ~$1.50-3.00 (Opus + research + Stripe fees)
**Margin**: ~80%

---

## Output Format

### Full Strategy (8 sections - $7.99)
- Executive Summary
- Your Current Situation
- Competitive Landscape
- Stop Doing (with reasoning)
- Start Doing (prioritized by ICE)
- Quick Wins (This Week)
- 30-Day Roadmap
- Metrics to Track

### Mini-Audit (5 sections - Free)
- Executive Summary (full)
- Your Current Situation (full)
- Competitive Landscape (condensed)
- Stop Doing (condensed, 2-3 items)
- Start Doing (condensed, 3 items max)
- ❌ Quick Wins, Roadmap, Metrics (upsell hooks)

---

## Not Building (MVP)

- User accounts beyond magic link
- Subscriptions
- Team features
- Strategy editing/revision
- Integrations
- Mobile app
