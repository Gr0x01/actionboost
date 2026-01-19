# Architecture: ActionBoost

## System Overview

```
Client (Next.js pages)
    ↓
API Routes (Next.js /api)
    ↓
Services (business logic)
    ↓
External: Supabase | Stripe | Claude | Tavily
```

Simple serverless architecture. No queues, no workers - just API routes.

---

## Core Flows

### New Run (happy path)
1. User fills form on `/start`, stored in localStorage
2. User enters email, clicks "Generate - $15"
3. `POST /api/stripe/checkout` → creates Stripe session + pending run in DB
4. Redirect to Stripe Checkout
5. Payment success → Stripe webhook fires
6. Webhook: add credits, update run to "processing", trigger AI pipeline
7. Redirect to `/processing/[runId]` → polls for status
8. AI completes → status = "complete"
9. Redirect to `/results/[runId]`

### Coupon Redemption
1. User enters code on checkout page
2. `POST /api/codes/redeem` → validates, adds credits
3. User can generate without Stripe

### Magic Link Auth
1. User clicks "View Past Runs" or link in email
2. `POST /api/auth/magic-link` → Supabase sends email
3. User clicks link → `/auth/callback` sets session
4. Redirect to `/dashboard`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/runs` | POST | Create new run |
| `/api/runs/[id]` | GET | Get run status/results |
| `/api/stripe/checkout` | POST | Create Stripe session |
| `/api/stripe/webhook` | POST | Handle payment events |
| `/api/codes/redeem` | POST | Redeem coupon code |
| `/api/share/create` | POST | Generate share link |
| `/api/export/pdf` | GET | Generate PDF |

**Auth pattern**: Check `auth.uid()` matches `run.user_id`, OR valid `share_slug` for public access.

**Error pattern**: Return `{ success: false, error: string, code: string }`

---

## AI Pipeline

**Status**: ✅ Complete (Phase 2)

### Files
```
src/lib/ai/
├── types.ts      # RunInput, ResearchContext, FocusArea types
├── research.ts   # Tavily + DataForSEO with Promise.race timeouts
├── generate.ts   # Claude Opus 4.5 with inlined prompts
└── pipeline.ts   # Orchestrator with env validation
```

### Pipeline Flow
```
1. Research (Tavily + DataForSEO) - ~6-20s
   - Parallel Tavily searches (competitor, trends, tactics)
   - Sequential DataForSEO for competitor domains
   - Promise.race for proper timeout handling

2. Generate (Claude Opus 4.5) - ~100-120s
   - Inlined prompts in generate.ts (no external files)
   - Focus-area-specific guidance (AARRR-based)
   - ~20k char output, 400+ lines

3. Save
   - Markdown to runs.output
   - Status = "complete"
```

### AARRR Focus Areas
Users select their biggest challenge - each gets tailored guidance:
- `acquisition` - "How do I get more users?"
- `activation` - "Users sign up but don't stick"
- `retention` - "Users leave after a few weeks"
- `referral` - "How do I get users to spread the word?"
- `monetization` - "I have users but no revenue"
- `custom` - Free-form challenge input

### Output Structure (8 sections)
1. Executive Summary
2. Your Current Situation
3. Competitive Landscape
4. Stop Doing (with reasoning)
5. Start Doing (prioritized by ICE)
6. Quick Wins (this week)
7. 30-Day Roadmap
8. Metrics to Track

### Cost & Performance
- Cost per run: ~$0.12-0.15
- Total time: ~2 minutes
- Graceful degradation: Research fails → proceed with limited context

### Test Scripts
```bash
npx tsx scripts/test-pipeline.ts   # ActionBoost example
npx tsx scripts/test-inkdex.ts     # Real project test
```

---

## Supabase Setup

**Project ID**: `qomiwimfekvfjbjjhzkz`
**Region**: us-west-2

### Tables (all RLS enabled)
| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | Email-based accounts | Owner read only |
| `runs` | Strategy generation runs | Owner read, public via share_slug |
| `run_credits` | Credit tracking (sum for balance) | Owner read only |
| `codes` | Promo/redemption codes | Service role only |

### Storage
| Bucket | Purpose | Limits |
|--------|---------|--------|
| `uploads` | Screenshots, PDFs | 10MB, private, user folder structure |

Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `application/pdf`

### RLS Patterns
- Users read own data: `auth.uid() = user_id`
- Public shared runs: `share_slug IS NOT NULL`
- Storage: `auth.uid()::text = (storage.foldername(name))[1]`
- Service role for admin operations (codes table, background jobs)

### Client Files
```
src/lib/supabase/server.ts   # createClient() + createServiceClient()
src/lib/supabase/client.ts   # createClient() for browser
src/lib/types/database.ts    # Generated types + Attachment type
```

---

## File Structure (target)

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── start/page.tsx              # Input form
│   ├── checkout/page.tsx
│   ├── processing/[runId]/page.tsx
│   ├── results/[runId]/page.tsx
│   ├── share/[slug]/page.tsx
│   ├── dashboard/page.tsx
│   └── api/
│       ├── runs/
│       ├── stripe/
│       ├── codes/
│       └── ...
├── components/
│   ├── ui/                         # Button, Input, Card, etc.
│   ├── forms/                      # StrategyForm
│   └── layout/                     # Header, Footer
├── lib/
│   ├── supabase/                   # Client utilities
│   ├── stripe/                     # Stripe helpers
│   ├── ai/                         # Claude + Tavily
│   └── types/                      # Shared types
└── middleware.ts                   # Auth middleware
```

---

## Tech Reference

### Claude Opus 4.5
- Model: `claude-opus-4-5-20251101`
- Pricing: $15/1M input, $75/1M output
- **Do not change model without approval**

### Tavily
- Web search API for competitive research
- Free tier: 1,000 searches/month
- Use `search_depth: 'advanced'` for better results

### Stripe
- Checkout Sessions for payment
- Webhook for `checkout.session.completed`
- Always verify webhook signature
