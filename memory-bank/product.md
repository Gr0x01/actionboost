# Product: Boost

## Value Prop

> "Your 30-day marketing plan. Real research, not generic advice. $49."

Tell us about your business. We research your competitors, analyze what's working in your space, and hand you a 30-day plan. What to stop. What to start. What to try this week.

---

## Brand Voice

### Core Narrative

**"Stop guessing. Get a marketing plan that actually fits your business."**

The direct strategist who does the research and tells you exactly what to do. Real competitor data, specific recommendations, no fluff.

### Target Audience

**Tech-adjacent entrepreneurs** — people who can find and buy tools, but won't build their own.

**Primary segments (in order):**
1. **SaaS founders / solopreneurs** — active in r/SaaS, r/solopreneur, Twitter. Know they need marketing help, won't build this themselves
2. **E-commerce / Shopify** — r/ecommerce, r/shopify. Tech-savvy, comfortable buying tools
3. **Service businesses** — consultants, agencies, freelancers who find us (self-selecting for tech comfort)

**Why this audience (Jan 24 2026 pivot):**
- SMBs (salons, local services) are hard to reach — Enji.co tried for 4+ years with 12 people, still only 1.5K monthly visits
- SaaS/solopreneur subreddits are FULL of marketing questions — proven demand
- These audiences can actually FIND tools online (unlike traditional SMBs)
- They won't build their own version (unlike pure indie hackers)
- Current design already appeals to them
- **Founder personality fit**: Blunt, direct, helpful — matches this audience better than warm hand-holding

### The Personality

**Boost = the direct strategist who respects your intelligence.** Blunt, practical, tells you exactly what to do.

**5 traits:**
1. **Direct** — gets to the point, respects your time
2. **Practical** — focused on what you can actually do this week
3. **Research-backed** — pulls real data, shows the receipts
4. **Honest** — tells you what's working AND what's not (even if it stings)
5. **Helpful** — genuinely wants you to succeed, not just sell you something

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
| Smart peer who cuts through the noise | Startup bro |
| Direct strategist with receipts | LinkedIn influencer |
| "Here's exactly what to do" | "It depends..." |
| Confident, helpful | Condescending, preachy |

**Words we use:** plan, specific, your business, this week, here's what, stop, start, data, competitors, exactly

**Words we avoid:** leverage, optimize, scale, transform, journey, solution, cutting-edge, empower, unlock, hack, growth hacking, "let's figure it out together" (too hand-holdy)

### Copy Patterns (Jan 2026)

| Element | Pattern | Example |
|---------|---------|---------|
| Headlines | Direct, confident | "Stop guessing. Get a plan that works." |
| Subheads | Specific, outcome-focused | "Real competitor research. Specific tactics. Ready to execute." |
| CTAs | Action-oriented | "Get my 30-day plan", "See what's working" |
| Guarantees | Clear, near CTA | "Money back if it doesn't help. Seriously." |
| Trust | Specific audiences | "SaaS, e-commerce, consultants" |
| Labels | Sentence case, clean | "Your marketing plans" not "YOUR ACTION PLANS" |

### Copy Rules

1. **Lead with the problem** — They know they're stuck, get to the solution
2. **Be specific over vague** — "See where competitors get their traffic" not "understand your competitive landscape"
3. **Use active voice** — "We research your competitors" not "Competitor analysis is performed"
4. **Respect their intelligence** — They know marketing matters, don't over-explain
5. **Industry terms are fine** — This audience knows AARRR, CAC, etc. (but still avoid jargon for jargon's sake)
6. **Price + guarantee together** — Removes risk, makes decision easy
7. **Use sentence case** — Clean, not shouty
8. **Sound confident** — "Here's what to do" not "Here's what you might consider"
9. **Show the outcome** — "A plan you can start tomorrow" not "Comprehensive strategy document"
10. **Be direct** — "Stop doing X" not "You might want to reconsider X"

### What NOT to do

- Don't mention what AI model powers it (irrelevant to outcome)
- Don't use ALL CAPS labels (shouty)
- Don't over-explain basics (this audience gets it)
- Don't use exclamation points (tryhard energy)
- Don't hedge ("might" "could" "potentially") — commit to what we deliver
- Don't use emojis
- Don't sound like a startup bro ("crush it", "10x", "hack")
- Don't be warm/hand-holdy ("let's figure it out together", "don't worry")
- Don't be preachy or condescending

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
- Headline: "Stop guessing. Get a marketing plan that works."
- Subhead: Real competitor research. Specific tactics. A 30-day plan you can actually execute.
- Trust line: "Money back if it doesn't help. Seriously."
- Trust badges: "Plan ready in 5 minutes. SaaS, e-commerce, consultants."
- CTA: "Get my 30-day plan"

### Homepage Examples (priority order)
1. **Tech/SaaS** — first, catches the most reachable audience
2. **E-commerce/Shopify** — second, tech-savvy buyers
3. **Service business** — third, consultants/agencies who found us

### Pain → Solution Flow
1. **Name the problem**: "You know marketing matters. You just don't know what to do next."
2. **Show the difference**: "We research your competitors and tell you exactly what's working."
3. **Deliver the outcome**: "A specific plan. What to stop. What to start. What to do this week."

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
