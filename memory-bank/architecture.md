# Architecture: Actionboo.st

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
| `/api/user/context` | GET | Get user's accumulated context | Required | ✅ |
| `/api/user/context` | PATCH | Apply delta updates | Required | ✅ |
| `/api/user/context/search` | POST | Semantic search over context | Required | ✅ |
| `/api/waitlist` | POST | Join waitlist (promo-only mode) | No | ✅ |
| `/api/free-audit` | POST | Create free mini-audit | No | ✅ |
| `/api/free-audit/[id]` | GET | Get free audit status/output | No | ✅ |

**Auth pattern**: Check user's `auth_id` links to `public.users`, then verify `user_id` matches, OR valid `share_slug` for public access.

**Error pattern**: Return `{ success: false, error: string, code: string }`

---

## AI Pipeline

**Status**: ✅ Complete (Phase 2 + RAG)

### Files
```
src/lib/ai/
├── types.ts      # RunInput, ResearchContext, FocusArea, UserHistoryContext
├── research.ts   # Tavily + DataForSEO with Promise.race timeouts
├── generate.ts   # Claude Opus 4.5 with inlined prompts + history support
├── pipeline.ts   # Orchestrator: research → history → generate → accumulate
└── embeddings.ts # OpenAI embeddings + pgvector search

src/lib/context/
└── accumulate.ts # Merge run data into users.context JSONB
```

### Pipeline Flow
```
1. Research (Tavily + DataForSEO) - ~6-20s
   - Parallel Tavily searches (competitor, trends, tactics)
   - DataForSEO endpoints selected by focus area
   - Promise.race for proper timeout handling

2. Retrieve User History (RAG) - ~1-2s [NEW]
   - Fetch users.context JSONB
   - Vector search user_context_chunks for relevant past recommendations/insights
   - Build UserHistoryContext with traction timeline, tactics, past advice

3. Generate (Claude Opus 4.5) - ~100-120s
   - Inlined prompts in generate.ts (no external files)
   - Focus-area-specific guidance (AARRR-based)
   - For returning users: RETURNING_USER_PROMPT + history section in message
   - ~20k char output, 400+ lines

4. Save & Accumulate
   - Markdown to runs.output
   - Status = "complete"
   - accumulateUserContext() → merge input into users.context
   - extractAndEmbedRunContext() → create embeddings (fire-and-forget)
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

### Free Pipeline (Mini-Audit)
Lighter-weight pipeline for lead generation:
- Model: Claude Sonnet (`claude-sonnet-4-20250514`) instead of Opus
- Research: Tavily only (no DataForSEO)
- Output: 5 sections (2 full + 3 condensed)
- No RAG/user history
- Cost: ~$0.04/run
- Rate limit: 1 per email (normalized for Gmail aliases)

Files: `runFreePipeline()` in pipeline.ts, `generateMiniStrategy()` in generate.ts

### Test Scripts
```bash
npx tsx scripts/test-pipeline.ts   # Actionboo.st example
npx tsx scripts/test-inkdex.ts     # Real project test
```

---

## User Context & RAG System

**Status**: ✅ Complete

Multi-run memory system that lets Claude remember returning users and build on past advice.

### Architecture
```
Run Completes
    ↓
accumulateUserContext()
    ├── Merge input → users.context (JSONB)
    │   - product: Replace with latest
    │   - traction.history: Append (max 10 snapshots)
    │   - tactics.tried: Accumulate (max 50)
    │   - tactics.working/notWorking: Accumulate (max 50)
    └── extractAndEmbedRunContext() [fire-and-forget]
        - Extract chunks from input (product, traction, tactics)
        - Extract chunks from output (recommendations, insights)
        - Create OpenAI embeddings (text-embedding-3-small)
        - Store in user_context_chunks with pgvector

Next Run Starts
    ↓
retrieveUserHistory()
    ├── Fetch users.context JSONB
    ├── Vector search for relevant recommendations (top 5)
    ├── Vector search for relevant insights (top 3)
    └── Return UserHistoryContext
            ↓
generateStrategy(input, research, userHistory)
    ├── RETURNING_USER_PROMPT added to system prompt
    └── History section added to user message:
        - Traction timeline (last 5)
        - Tactics tried (up to 10)
        - Past recommendations
        - Past insights
```

### Data Model

**users.context** (JSONB column):
```typescript
{
  product: {
    description: string      // Latest product description
    websiteUrl?: string
    competitors?: string[]   // Max 10, deduplicated by domain
  }
  traction: {
    latest: string           // Most recent
    history: Array<{         // Max 10 snapshots
      date: string           // YYYY-MM-DD
      summary: string
    }>
  }
  tactics: {
    tried: string[]          // Max 50
    working?: string[]       // Max 50
    notWorking?: string[]    // Max 50
  }
  constraints?: string
  lastRunId?: string
  totalRuns?: number
}
```

**user_context_chunks** (pgvector table):
| Column | Type | Purpose |
|--------|------|---------|
| user_id | UUID | FK to users |
| content | TEXT | The chunk text |
| chunk_type | ENUM | product, traction, tactic, insight, recommendation |
| source_type | ENUM | run_input, run_output, delta_update |
| source_id | UUID | Run ID (nullable) |
| embedding | vector(1536) | OpenAI embedding |
| metadata | JSONB | Additional context |

### Chunk Types
| Type | Source | Example |
|------|--------|---------|
| `product` | run_input | "Product: AI growth strategist for startups and entrepreneurs" |
| `traction` | run_input | "Traction (2025-01-19): 500 users, $2k MRR" |
| `tactic` | run_input | "Tactics tried: Twitter threads, cold email" |
| `insight` | run_output | "Advice to stop: Generic content marketing" |
| `recommendation` | run_output | "Recommendations: Focus on warm referrals" |

### Vector Search
- Model: `text-embedding-3-small` (1536 dimensions)
- Cost: ~$0.00002 per run (negligible)
- RPC function: `match_user_context_chunks(embedding, user_id, threshold, limit)`
- Fallback: Text search via `ilike` if OpenAI unavailable

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/context` | GET | Fetch user's accumulated context |
| `/api/user/context` | PATCH | Apply delta updates (conversational) |
| `/api/user/context/search` | POST | Semantic search over context |

---

## Supabase Setup

**Project ID**: `qomiwimfekvfjbjjhzkz`
**Region**: us-west-2

### Tables (all RLS enabled)
| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | Email-based accounts + context JSONB | Owner read only |
| `runs` | Strategy generation runs | Owner read, public via share_slug |
| `run_credits` | Credit tracking (sum for balance) | Owner read only |
| `codes` | Promo/redemption codes | Service role only |
| `user_context_chunks` | Vector embeddings for RAG | Owner read only |
| `waitlist` | Email collection for promo-only mode | Service role only |
| `free_audits` | Free mini-audit runs (1 per email) | Service role only |

### Extensions
| Extension | Purpose |
|-----------|---------|
| `pgvector` | Vector similarity search for RAG |
| `pgcrypto` | UUID generation |

### Functions (RPC)
| Function | Purpose |
|----------|---------|
| `match_user_context_chunks` | pgvector similarity search with user filtering |

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

### OpenAI (Embeddings)
- Model: `text-embedding-3-small` (1536 dimensions)
- Pricing: $0.02 per 1M tokens (~$0.00002 per run)
- Used for: RAG vector search over user context
- Graceful degradation: Falls back to text search if unavailable

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

---

## Feature Flags

| Flag | Purpose | Default |
|------|---------|---------|
| `NEXT_PUBLIC_PRICING_ENABLED` | Show/hide pricing, enable promo-only mode | `true` |

When `false`:
- Hero shows "Get Started" (no price)
- Pricing section hidden
- Checkout requires promo code
- Invalid/maxed codes show waitlist signup
