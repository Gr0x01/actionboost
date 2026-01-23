# Product: Actionboo.st

## Value Prop

> "Your competitors' growth playbook, reverse-engineered. $9.99."

Tell us about your startup. We research your competitors' actual traffic, analyze your traction, and hand you a 30-day playbook. What to stop. What to start. What to try this week.

---

## Brand Voice

### Core Narrative

**"ChatGPT told me Reddit. This said Pinterest. It's working."**

The founder built this to solve their own problem. It worked. Now it's $10.

### The Personality

**Actionboo.st = the founder friend who's three steps ahead.** Takes your call, gives you brutal truth, wants you to win.

**5 traits:**
1. **Blunt Optimist** — believes you can grow, won't pretend your current approach is working
2. **Impatient for Results** — hates busywork, wants you shipping by Tuesday
3. **Research Nerd** — actually pulls data, explains it simply
4. **Allergic to Guru Culture** — no podcast, no course, just a tool that costs $10
5. **Quietly Confident** — doesn't need to yell, lets output speak

### The Enemy

**The Growth Advice Industrial Complex:**
- 47-page strategy decks that never get implemented
- "Build in public" gurus who've never built anything
- $5K consultants who say "focus on SEO"
- AI chatbots giving the same advice to everyone

### Voice Guidelines

| We sound like | We don't sound like |
|---------------|---------------------|
| Founder friend 3 steps ahead | Marketing agency |
| Someone who's done this | LinkedIn influencer |
| Cuts to the chase | Enterprise SaaS |

**Words we use:** stop, start, actually, specific, tactics, real, this week, execute, plan

**Words we avoid:** leverage, optimize, scale, transform, journey, solution, cutting-edge, empower, unlock

### Copy Patterns (Jan 2026)

| Element | Pattern | Example |
|---------|---------|---------|
| Headlines | Light/black weight contrast | "ChatGPT told me Reddit. **This said Pinterest.**" |
| Taglines | Mono, uppercase, tracked | `$10 → competitor research → money back if useless` |
| Subheads | Direct, first person | "I built this to figure out my own marketing." |
| CTAs | Action-oriented | "Get My Action Plan" |
| Guarantees | Bold, near CTA | "Didn't help? Full refund." |
| Trust | Casual, self-aware | "$10 because $5 seemed fake" |

### Copy Rules

1. **Lead with the founder story** — The ChatGPT vs Pinterest discovery is the hook
2. **Be honest about what it is** — Yes, it uses AI. The difference is the real research data.
3. **Price + guarantee together** — Removes risk, makes decision easy
4. **Be specific over vague** — "See where competitors get 40% of their traffic" not "understand your competitive landscape"
5. **Use active voice** — "We pull your competitors' traffic data" not "Traffic data is analyzed"
6. **Short sentences** — Punchy. Direct. Easy to scan.
7. **Acknowledge skepticism** — "You've probably tried 'just post more.' This is different."
8. **Name the pain** — "Stuck at 100 users" not "looking to scale"
9. **Use numbers** — "30-day plan" "5 competitors" "$10"
10. **Sound human** — "Look—" "Here's the thing—" "Honestly,"

### What NOT to do

- Don't mention what AI model powers it (technical flex for wrong audience)
- Don't define by what we're NOT ("Not like ChatGPT...") — defensive positioning
- Don't use exclamation points — tryhard energy
- Don't hedge ("might" "could" "potentially") — commit to what we deliver
- Don't use emojis — doesn't fit brutalist aesthetic
- Don't list features without outcomes — show transformation, not specs

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
- Headline: "Growth hacking for people who hate growth hacks."
- Subhead: We pull your competitors' traffic data, score every tactic by impact, and hand you a 30-day plan. Not vibes. Actual moves, ranked.
- Trust line: "One payment. No subscription. $9.99."
- CTA: URL input → /start

### Pain → Solution Flow
1. **Acknowledge the pain**: "You've read the blogs. You've tried 'just post consistently.' You're still stuck."
2. **Show the difference**: "We actually research your competitors. Real traffic data. Real tactics."
3. **Deliver the outcome**: "What to stop. What to start. What to try this week."

### What You Get
- Your competitors' actual traffic sources
- Channel strategy ranked by effort and impact
- What to STOP wasting time on
- What to START doing (prioritized by ICE)
- This week's quick wins (day-by-day)
- 30-day roadmap built for your stage
- Metrics dashboard with AARRR targets
- Ready-to-use content templates

### How It Works
1. Tell us about your startup (10 min)
2. We research your competitors
3. Get your playbook. Start executing tomorrow.

### Pricing
- $9.99. Once. No subscription. No account needed.
- Free mini-audit to start (see the gaps before you pay)

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
| Single | $9.99 | 1 |

**Per-run cost**: ~$0.50 (Opus + research APIs)
**Margin**: ~90%

---

## Output Format

### Full Strategy (10 sections - $9.99)
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
