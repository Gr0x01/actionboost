# Product: Actionboo.st

## Value Prop

> "Your 30-day marketing plan. Real research, not generic advice. $49."

Tell us about your business. We research your competitors, analyze what's working in your space, and hand you a 30-day plan. What to stop. What to start. What to try this week.

---

## Brand Voice

### Core Narrative

**"Stuck on marketing? Let's figure it out together."**

The friendly marketing expert who does the research for you. Real competitor data, practical recommendations, no jargon.

### Target Audience

**Small business owners** — salons, local services, niche e-commerce. People who are stuck on marketing and don't have time to become marketing experts.

### The Personality

**Actionboo.st = the friendly expert who simplifies marketing.** Hand-holding, patient, explains things in plain English.

**5 traits:**
1. **Encouraging** — believes you can grow, meets you where you are
2. **Practical** — focused on what you can actually do this week
3. **Research-backed** — pulls real data, explains it simply
4. **No jargon** — explains frameworks in plain English (AARRR → "Finding you, Trying you, Coming back, Telling friends, Paying you")
5. **Trustworthy** — honest about what works and what doesn't

### Competitive Alternatives (Dunford Positioning)

**What would customers do without us?**
- Wing it (trial and error, hoping something works)
- Google it (DIY research, overwhelming)
- Ask ChatGPT (generic advice, not tailored)
- Hire an agency ($2K-10K/month, overkill)
- Ask a friend (limited to their experience)

**Our differentiation:** Real research on YOUR business + structured 30-day plan. Not generic. Not expensive. Not overwhelming.

### Voice Guidelines

| We sound like | We don't sound like |
|---------------|---------------------|
| Friendly marketing expert | Startup bro |
| Smart friend who knows marketing | LinkedIn influencer |
| "Let's figure this out together" | "Here's what you're doing wrong" |
| Hand-holding, patient | Impatient, condescending |

**Words we use:** plan, together, your business, this week, simple, practical, real, competitors, let's

**Words we avoid:** leverage, optimize, scale, transform, journey, solution, cutting-edge, empower, unlock, hack, growth hacking

### Copy Patterns (Jan 2026)

| Element | Pattern | Example |
|---------|---------|---------|
| Headlines | Warm, direct | "Stuck on marketing? Let's figure it out." |
| Subheads | Reassuring | "We'll research your competitors and build a plan just for you." |
| CTAs | Collaborative | "Get my 30-day plan", "Let's get started" |
| Guarantees | Clear, near CTA | "Money back if it doesn't help. Seriously." |
| Trust | Specific examples | "Salons, e-commerce, consultants" |
| Labels | Sentence case, friendly | "Your marketing plans" not "YOUR ACTION PLANS" |

### Copy Rules

1. **Lead with empathy** — Acknowledge they're stuck, not failing
2. **Be specific over vague** — "See where competitors get their traffic" not "understand your competitive landscape"
3. **Use active voice** — "We research your competitors" not "Competitor analysis is performed"
4. **Use "we" and "together"** — Collaborative, not transactional
5. **Explain jargon** — If you must use a term, define it immediately
6. **Price + guarantee together** — Removes risk, makes decision easy
7. **Use sentence case** — Friendly, not shouty
8. **Sound human** — "Here's what we found" not "Analysis complete"
9. **Show the outcome** — "A plan you can start tomorrow" not "Comprehensive strategy document"
10. **Be encouraging** — "Ready to grow?" not "Stop wasting time"

### What NOT to do

- Don't mention what AI model powers it (technical flex, wrong audience)
- Don't use ALL CAPS labels (shouty, unfriendly)
- Don't use jargon without explanation (ICE scores, AARRR without context)
- Don't use exclamation points (tryhard energy)
- Don't hedge ("might" "could" "potentially") — commit to what we deliver
- Don't use emojis
- Don't sound like a startup bro ("crush it", "10x", "hack")
- Don't be condescending about their current efforts

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
Subtle "Just want a taste?" option at checkout → 4-section condensed audit → upsell to full version.
- Model: Claude Opus 4.5 (same quality as paid)
- Research: Tavily only (no DataForSEO)
- Cost: ~$0.07/run
- Rate limit: 1 per email (Gmail aliases normalized)

---

## Landing Page Content

### Hero
- Headline: "Stuck on marketing? Let's figure it out."
- Subhead: We research your competitors and build a 30-day plan just for your business. Real data, practical steps.
- Trust line: "Money back if it doesn't help. Seriously."
- Trust badges: "Plan ready in 5 minutes. No jargon. Salons, e-commerce, consultants."
- CTA: "Get my 30-day plan"

### Pain → Solution Flow
1. **Acknowledge the pain**: "Marketing feels overwhelming. You've tried different things but nothing seems to stick."
2. **Show the difference**: "We research what's actually working for businesses like yours."
3. **Deliver the outcome**: "A clear plan you can start tomorrow. What to focus on, what to skip."

### What You Get
- Your competitors' actual traffic sources
- Channel strategy ranked by effort and impact
- What to stop wasting time on
- What to start doing (prioritized by impact)
- This week's quick wins (day-by-day)
- 30-day roadmap built for your stage
- Key metrics to track your progress
- Ready-to-use content templates

### How It Works
1. Tell us about your business
2. We research your competitors
3. Get your plan and start tomorrow

### Pricing
- $49. Once. No subscription.
- Free preview to start (see the value before you pay)

### Social Proof
- Sample output snippet (let quality speak)
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
| `/in-action` | Curated examples gallery | No |
| `/in-action/[slug]` | Example detail page (full Boost output) | No |
| `/in-action/admin` | Add/edit/toggle examples | Localhost or admin email |

---

## Input Form Fields

### Form Flow (7 steps)

1. **Current traction** (chips) - Pre-launch, <100 users, 100-1K, 1K-10K, 10K+
2. **Focus area** (chips) - Acquisition, Activation, Retention, Referral, Monetization, Other
3. **About your business** (textarea) - Combined: What you do + what marketing you've tried
4. **Competitive alternatives** (multi-select chips + custom) - What do people do instead of using you?
   - Wing it, Google it, Ask ChatGPT, Hire an agency, Ask a friend, + custom
5. **Website URL** (optional)
6. **Competitor URLs** (optional, up to 3)
7. **Email** (optional, auto-skipped if logged in)

### Required
- Traction (step 1)
- Focus area (step 2)
- Business description (step 3)
- Competitive alternatives (step 4) - Required for positioning analysis

### Optional
- Website URL
- Competitor URLs (up to 3)
- Email (for cart abandonment, skipped if logged in)

**Total character limit**: ~25,000 (keeps API costs predictable)

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
- Launch codes: REDDIT, PRODUCTHUNT, LAUNCH, FRIEND

### free_audits
- `id`, `email` (unique - enforces 1 per email), `input` (JSONB), `output` (TEXT)
- `status` (pending/processing/complete/failed), `created_at`, `completed_at`
- Email normalized for rate limiting (Gmail aliases stripped)

---

## Pricing

| Product | Price | Credits |
|---------|-------|---------|
| Single | $49 | 1 |

**Per-run cost**: ~$1.50-2.50 (Opus + research APIs)
**Margin**: ~95%

---

## Output Format

### Full Strategy (10 sections - $49)
1. **Executive Summary** - Core insight + Growth Flywheel (ASCII diagram)
2. **Your Situation** - AARRR stage analysis, gaps, what's working
3. **Competitive Landscape** - Tables with competitor data
4. **Channel Strategy** - Prioritized channel table (effort/week, time to results, priority)
5. **Stop Doing** - 3-5 items with reasoning
6. **Start Doing** - 5-8 recommendations with ICE scores
7. **This Week** - Day-by-day quick wins table
8. **30-Day Roadmap** - Week-by-week with themes and checkboxes
9. **Metrics Dashboard** - AARRR table with targets
10. **Content Templates** - 2-3 ready-to-use templates (code blocks)

### Mini-Audit (3 sections - Free)
- Executive Summary with Flywheel (full)
- Your Situation (full)
- Competitive Landscape (condensed)
- ❌ Channel Strategy, Stop Doing, Start Doing, This Week, Roadmap, Metrics Dashboard, Content Templates (upsell hooks)

---

## Not Building (MVP)

- User accounts beyond magic link
- Subscriptions
- Team features
- Strategy editing/revision
- Integrations
- Mobile app
