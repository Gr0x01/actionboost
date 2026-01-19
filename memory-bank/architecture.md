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
2. User clicks "Generate - $7.99"
3. `POST /api/checkout/create-session` → creates Stripe session with form in metadata
4. Redirect to Stripe Checkout
5. Payment success → `checkout.session.completed` webhook fires
6. Webhook: create user, add credits, create run, trigger AI pipeline
7. Redirect to `/processing/[sessionId]` → polls for status
8. AI completes → status = "complete"
9. Redirect to `/results/[runId]`

### Coupon Redemption
1. User enters code on checkout page
2. `POST /api/codes/redeem` → validates, adds credits
3. User can generate without Stripe

### Magic Link Auth
1. User clicks "View Past Runs" or link in email
2. `POST /api/auth/magic-link` → Supabase sends email
3. User clicks link → `/auth/callback` exchanges code for session
4. Callback links `auth.users` to `public.users` via `auth_id` column
5. Redirect to `/dashboard`

### Auth Architecture
```
auth.users (Supabase Auth)     public.users (our table)
    id  ←───── auth_id ─────→  id
    email                       email
                                created_at
```

**Why two tables?**
- `public.users` created via Stripe webhook (before auth)
- `auth.users` created when user logs in
- Linked by email match, stored as `auth_id` FK

**Auth helper** (`src/lib/auth/session.ts`):
- `getAuthUser()` - Get current user or null
- `requireAuth()` - Redirect to /login if not logged in
- `linkAuthToPublicUser()` - Connect auth to public user by email

---

## API Routes

| Route | Method | Purpose | Auth | Status |
|-------|--------|---------|------|--------|
| `/api/checkout/create-session` | POST | Create Stripe session | No | ✅ |
| `/api/webhooks/stripe` | POST | Handle payment → trigger pipeline | Signature | ✅ |
| `/api/runs/[runId]` | GET | Get run data | Owner or share | ✅ |
| `/api/runs/[runId]/status` | GET | Poll run status | Owner or share | ✅ |
| `/api/runs/[runId]/share` | POST | Generate share link | No | ✅ |
| `/api/runs/create-with-code` | POST | Create run using promo code | No | ✅ |
| `/api/codes/validate` | POST | Validate promo code | No | ✅ |
| `/api/upload` | POST | Upload attachments | No | ✅ |
| `/api/auth/magic-link` | POST | Send magic link email | No | ✅ |
| `/api/user/runs` | GET | Get user's runs | Required | ✅ |

**Auth pattern**: Check user's `auth_id` links to `public.users`, then verify `user_id` matches, OR valid `share_slug` for public access.

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
   - DataForSEO endpoints selected by focus area
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
Users select their biggest challenge - each gets tailored guidance AND different DataForSEO depth:

| Focus Area | SEO Depth | Endpoints |
|------------|-----------|-----------|
| `acquisition` | Heavy | domain_metrics, ranked_keywords, competitors, backlinks, referrers |
| `referral` | Medium | domain_metrics, backlinks, referrers |
| `activation` | Light | domain_metrics only |
| `retention` | Light | domain_metrics only |
| `monetization` | Light | domain_metrics only |
| `custom` | Heavy | All endpoints |

This keeps costs proportional to how useful SEO data is for each problem type.

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
- Cost per run: ~$0.30
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

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── start/page.tsx              # Input form
│   ├── login/page.tsx              # Magic link login
│   ├── dashboard/page.tsx          # User's runs + credits
│   ├── processing/[runId]/page.tsx
│   ├── results/[runId]/page.tsx
│   ├── auth/callback/route.ts      # Magic link callback
│   └── api/
│       ├── auth/magic-link/        # Send magic link
│       ├── user/runs/              # Get user's runs
│       ├── runs/                   # Run CRUD
│       ├── checkout/               # Stripe
│       └── codes/                  # Promo codes
├── components/
│   ├── ui/                         # Button, Input, Card, etc.
│   ├── results/                    # Strategy display
│   └── layout/                     # Header (auth-aware), Footer
└── lib/
    ├── supabase/                   # Client utilities
    ├── auth/session.ts             # Auth helpers (DAL pattern)
    ├── ai/                         # Claude + Tavily
    └── types/                      # Shared types
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

**Status**: ✅ Complete

**Pricing**:
- Single: $7.99 (1 credit)
- 3-Pack: $19.99 (3 credits)

**Routes**:
| Route | Purpose |
|-------|---------|
| `POST /api/checkout/create-session` | Creates checkout session, stores form in metadata |
| `POST /api/webhooks/stripe` | Handles `checkout.session.completed` |

**Webhook flow**:
1. Verify signature with `STRIPE_WEBHOOK_SECRET`
2. Parse form data from session metadata
3. Get/create user by email
4. Add credits to `run_credits`
5. Create run with form data
6. Trigger AI pipeline (fire-and-forget)

**Env vars**:
```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_SINGLE
STRIPE_PRICE_3PACK
```
