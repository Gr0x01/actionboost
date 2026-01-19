# Roadmap

## v1: One-Shot Runs

| # | Phase | Status |
|---|-------|--------|
| 0 | Setup & Docs | ✅ Done |
| 1 | Database | ✅ Done |
| 2 | AI Pipeline | ✅ Done |
| 3 | Payments (Stripe) | ✅ Done |
| 4 | Landing + Input | In progress |
| 5 | Results | Display strategy |
| 6 | Dashboard | Past runs (low priority) |
| 7 | Launch | Deploy, monitor |

---

## v2: Growth Board + Subscription (Future)

**The real product.** One-shot validates quality, subscription is the business.

One-shot = advice. Subscription = accountability partner.

### Core Concept: Living Growth System

Strategy output isn't a static doc — it's a **kanban board** of tasks:
- Quick Wins → "This Week" column
- 30-Day Roadmap → "Week 1/2/3/4" columns
- Start Doing → "Backlog" prioritized by ICE

User interacts:
- Mark tasks done, add notes about outcomes
- Upload data (screenshots, analytics exports)
- Connect analytics tools for automatic context
- AI sees all this → adjusts future recommendations

**Training users to feed context**: The more they add (notes, data, connected analytics), the smarter the AI gets about *their* business.

### Features

| Feature | Description |
|---------|-------------|
| Growth Board | Kanban of recommended actions, auto-populated from runs |
| Notes & Uploads | Mark done + add outcome notes + upload supporting data |
| Integrations | Connect PostHog, Mixpanel, GA4 for automatic insights |
| Periodic Analysis | System analyzes progress 2-3x/day |
| Weekly Digest | Email summary: what you did, what changed, what to try next |
| Pricing | ~$30/mo |

### Pricing Funnel

```
FREE MINI          →    SINGLE RUN ($X)    →    SUBSCRIPTION (~$30/mo)
Taste the value         Full experience         Ongoing partner
(no competitor               │
research?)                   └── Subscribe within X days?
                                 Credit toward first month
```

- **Kill the 3-pack** - simpler mental model, subscription is the upsell
- **Free mini** - qualifies leads, shows value (maybe no competitor research)
- **Single run** - full experience, proves quality
- **Credit window** - reduces conversion friction ("I already paid $8" doesn't block)

### Why It Works

- Subscription tied to *usage*, not just time
- Board creates accountability ("you said you'd do X...")
- AI gets smarter per-user (what works for YOUR situation)
- Way stickier than static advice
- "Fractional growth person" positioning
- Clear upgrade path at each tier

---

## Phase Summaries

### 1. Database
Supabase schema, RLS policies, client utilities.

### 2. AI Pipeline
Tavily research → Claude Opus 4.5 → markdown output. The core value.

### 3. Payments
Stripe checkout ($9.99 single run), webhooks trigger pipeline. 3-pack removed — subscription is the upsell path.

### 4. Landing + Input
Marketing page, form with all fields, localStorage persistence.

### 5. Results
Display markdown strategy, copy button, share link.

### 6. Dashboard
Past runs, credits remaining. Low priority for one-shot users.

### 7. Launch
Production deploy, domain (actionboo.st), monitoring.
