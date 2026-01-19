# Roadmap

## Phase Order

| # | Phase | Focus |
|---|-------|-------|
| 0 | Setup & Docs | Done |
| 1 | Database | Done |
| 2 | AI Pipeline | **Current** |
| 3 | Landing + Input | Collect user context |
| 4 | Results | Display strategy |
| 5 | Payments | Stripe, credits, coupons |
| 6 | Dashboard | Past runs (low priority) |
| 7 | Launch | Deploy, monitor |

---

## Phase Summaries

### 1. Database
Supabase schema, RLS policies, client utilities. Foundation for everything.

### 2. AI Pipeline
Tavily research → Claude Opus 4.5 → markdown output. **The core value.** Test with hardcoded input before UI exists.

### 3. Landing + Input
Marketing page, form with all fields, localStorage persistence. User can fill out context.

### 4. Results
Display markdown strategy, copy button, share link. User sees the value.

### 5. Payments
Stripe checkout, webhooks, credit system, magic link auth, coupon codes. Monetize.

### 6. Dashboard
Past runs, credits remaining. Most users are one-shot, so low priority.

### 7. Launch
Production deploy, domain (actionboo.st), monitoring, launch codes.
