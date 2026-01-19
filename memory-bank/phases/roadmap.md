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

## v2: Connected Growth Advisor (Future)

**The real product.** Subscription model after v1 validates output quality.

| Feature | Description |
|---------|-------------|
| Integrations | Connect PostHog, Mixpanel, GA4, Stripe |
| Weekly Analysis | Automated email: "Here's what's happening + 3 things to try" |
| Reply to Ask | Email replies trigger follow-up analysis |
| Pricing | $29-49/mo |

**Why it's bigger:**
- Recurring revenue (not one-shot)
- Gets smarter over time (sees what worked)
- Way stickier than single runs
- Natural upsell from v1 users
- "Fractional growth person" positioning

---

## Phase Summaries

### 1. Database
Supabase schema, RLS policies, client utilities.

### 2. AI Pipeline
Tavily research → Claude Opus 4.5 → markdown output. The core value.

### 3. Payments
Stripe checkout ($7.99 single, $19.99 3-pack), webhooks trigger pipeline, credit system.

### 4. Landing + Input
Marketing page, form with all fields, localStorage persistence.

### 5. Results
Display markdown strategy, copy button, share link.

### 6. Dashboard
Past runs, credits remaining. Low priority for one-shot users.

### 7. Launch
Production deploy, domain (actionboo.st), monitoring.
