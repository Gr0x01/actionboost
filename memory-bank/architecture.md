# Architecture: Actionboo.st

## System Overview

```
Client (Next.js pages)
    ↓
API Routes (Next.js /api)
    ↓
Services (business logic)
    ↓
External: Supabase | Stripe | Claude | Tavily | Resend
```

Simple serverless architecture. No queues, no workers - just API routes.

---

## Core Flows

### New Run (happy path)
1. User fills form on `/start`, stored in localStorage
2. User clicks "Generate - $9.99"
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
| `/api/examples` | GET | List examples (public: live only, admin: all) | Optional | ✅ |
| `/api/examples` | POST | Create example (draft) | Admin | ✅ |
| `/api/examples/[id]` | GET | Get single example by ID or slug | Public/Admin | ✅ |
| `/api/examples/[id]` | PATCH | Update example (toggle live, edit) | Admin | ✅ |
| `/api/examples/[id]` | DELETE | Delete example | Admin | ✅ |

**Auth pattern**: Check user's `auth_id` links to `public.users`, then verify `user_id` matches, OR valid `share_slug` for public access.

**Error pattern**: Return `{ success: false, error: string, code: string }`

---

## AI Pipeline

**Status**: ✅ Complete (Agentic + RAG)

### Files
```
src/lib/ai/
├── types.ts           # RunInput, ResearchContext, FocusArea, ToolDefinition
├── tools.ts           # Tool definitions + executor
├── pipeline-agentic.ts # Agentic generation with tool calling
├── research.ts        # Research functions (used by tools)
├── generate.ts        # System prompts + fallback generation
├── pipeline.ts        # Orchestrator: agentic → accumulate
└── embeddings.ts      # OpenAI embeddings + pgvector search

src/lib/context/
└── accumulate.ts # Merge run data into users.context JSONB
```

### Pipeline Flow (Agentic)
```
1. Agentic Generation (Claude Opus 4.5 + Tools) - ~40-60s
   - Claude receives user input + system prompt with tool definitions
   - Claude decides which tools to call based on user's needs
   - We execute tools in parallel batches (max 3 concurrent)
   - Results returned as tool_result blocks
   - Claude continues reasoning, may call more tools
   - Max 8 tool calls per run (budget enforcement)
   - Final output: markdown strategy

2. Stage Updates (Real-time)
   - Tool calls extracted for UI progress display
   - "Searching Reddit for..." → "Analyzing competitor keywords..."
   - Typewriter effect + bursty data counter

3. Save & Accumulate
   - Markdown to runs.output
   - Status = "complete"
   - accumulateUserContext() → merge input into users.context
   - extractAndEmbedRunContext() → create embeddings (fire-and-forget)
```

### Available Tools
| Tool | Purpose | Data Source |
|------|---------|-------------|
| `web_search` | General web search | Tavily |
| `scrape_url` | Extract page content | Tavily |
| `search_seo_keywords` | User's ranked keywords | DataForSEO |
| `get_domain_seo` | Domain metrics | DataForSEO |
| `analyze_competitor_keywords` | Keyword gap analysis | DataForSEO |
| `search_reddit` | Community discussions | Tavily site:reddit |

### Refinement Pipeline
When users click "Tell Us More" to add context:
- Same agentic approach but lighter: max 3 tool calls
- Previous output summarized in context
- Tools only used if user feedback warrants research
- "We already tried X" → may search alternatives
- "Focus more on Y" → usually no tools needed

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

### Output Structure (10 sections)
1. Executive Summary (with Growth Flywheel diagram)
2. Your Situation (AARRR stage analysis)
3. Competitive Landscape (table format)
4. Channel Strategy (prioritized table with effort/time/priority)
5. Stop Doing (3-5 items with reasoning)
6. Start Doing (5-8 items prioritized by ICE scores)
7. This Week (day-by-day quick wins table)
8. 30-Day Roadmap (week-by-week with themes and checkboxes)
9. Metrics Dashboard (AARRR table with targets)
10. Content Templates (2-3 ready-to-use templates in code blocks)

### Cost & Performance

**Paid Run (Opus 4.5):**
| Component | Calculation | Cost |
|-----------|-------------|------|
| Claude Opus input | ~4,000 tokens × $5/MTok | $0.020 |
| Claude Opus output | ~4,400 tokens × $25/MTok | $0.110 |
| Tavily | 3 searches × 2 credits × $0.008 | $0.048 |
| DataForSEO (if competitors) | varies by focus | $0-0.48 |
| **Total (no competitors)** | | **~$0.18** |
| **Total (3 competitors, acquisition)** | | **~$0.66** |

**DataForSEO by focus area (per competitor):**
| Focus | Endpoints | Cost/Competitor | Max (3) |
|-------|-----------|-----------------|---------|
| acquisition / custom | all 5 | $0.16 | $0.48 |
| referral | 3 | $0.14 | $0.42 |
| activation / retention / monetization | 1 | $0.10 | $0.30 |

- Total time: ~2 minutes
- Graceful degradation: Research fails → proceed with limited context

### Free Pipeline (Mini-Audit)
Lighter-weight pipeline for lead generation:
- Model: Claude Opus 4.5 (upgraded from Sonnet for better quality, only +$0.01)
- Research: Tavily only (no DataForSEO)
- Output: 4 sections (Executive Summary, Your Situation, Competitive Landscape, Channel Strategy)
- Locked sections shown as upsell: Stop Doing, Start Doing, This Week, 30-Day Roadmap, Metrics Dashboard, Content Templates
- No RAG/user history
- Rate limit: 1 per email (normalized for Gmail aliases)
- Polling: Recursive setTimeout every 2s until complete

**Free Run Cost (Opus 4.5):**
| Component | Calculation | Cost |
|-----------|-------------|------|
| Claude Opus input | ~1,150 tokens × $5/MTok | $0.006 |
| Claude Opus output | ~630 tokens × $25/MTok | $0.016 |
| Tavily | 3 searches × 2 credits × $0.008 | $0.048 |
| **Total** | | **~$0.07** |

Files: `runFreePipeline()` in pipeline.ts, `generateMiniStrategy()` in generate.ts
Routes: `POST /api/free-audit`, `GET /api/free-audit/[id]`
Page: `/free-results/[id]` with auto-polling and upsell UI

### First Impressions Pipeline (REMOVED)
**Sunset Jan 23, 2026** - Replaced by `/in-action` curated examples page. All code removed. Table `first_impressions` remains in database (data archived).

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
| `examples` | Curated Boost showcases for /in-action | Service role only |

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

### Claude Models
| Model | ID | Input | Output |
|-------|-----|-------|--------|
| Opus 4.5 (all pipelines) | `claude-opus-4-5-20251101` | $5/MTok | $25/MTok |

**Do not change models without approval**

### Tavily
- Web search API for competitive research
- Pricing: $0.008/credit, advanced search = 2 credits
- We run 3 searches per run = 6 credits = $0.048
- Use `search_depth: 'advanced'` for better results

### DataForSEO
Only called when competitor URLs provided. Endpoints by focus area:

| Endpoint | Price |
|----------|-------|
| `dataforseo_labs/domain_metrics_by_categories/live` | $0.10 |
| `dataforseo_labs/ranked_keywords/live` | $0.01 |
| `dataforseo_labs/competitors_domain/live` | $0.01 |
| `backlinks/summary/live` | $0.02 |
| `backlinks/referring_domains/live` | $0.02 |

### OpenAI (Embeddings)
- Model: `text-embedding-3-small` (1536 dimensions)
- Pricing: $0.02 per 1M tokens (~$0.00002 per run)
- Used for: RAG vector search over user context
- Graceful degradation: Falls back to text search if unavailable

### Stripe

**Status**: ✅ Complete

**Pricing**:
- Single: $9.99 (1 credit)

**Routes**:
| Route | Purpose |
|-------|---------|
| `POST /api/checkout/create-session` | Creates checkout session, stores form in metadata |
| `POST /api/checkout/buy-credits` | Buy credits without form data (from pricing page) |
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
```

### Resend

**Status**: ✅ Complete

Transactional email service for receipts and magic links.

**Email types**:
| Email | Trigger | How |
|-------|---------|-----|
| Receipt | After Stripe payment | Resend API |
| Magic link | Auth requests | Supabase SMTP → Resend |

**Files**:
- `src/lib/email/resend.ts` - Client, receipt email, magic link template

**Env vars**:
```
RESEND_API_KEY
```

**Sender**: `team@actionboo.st`

---

## Testing

**Status**: ✅ Complete

### Stack
- **Unit tests**: Vitest (46 tests)
- **E2E tests**: Playwright (Chromium, Firefox, WebKit)
- **CI/CD**: GitHub Actions on every PR

### Commands
```bash
npm run test:run     # Unit tests
npm run test:e2e     # E2E tests (starts dev server)
npm run test:all     # Both
npm run test         # Vitest watch mode
```

### Unit Test Files
```
src/lib/__tests__/
├── validation.test.ts   # Email validation (7 tests)
├── audit-token.test.ts  # Token signing/verification (9 tests)
├── form.test.ts         # Form validation + edge cases (17 tests)
└── credits.test.ts      # Credit calculation patterns (13 tests)
```

### E2E Test Files
```
tests/
├── smoke.spec.ts        # Homepage loads
├── form-wizard.spec.ts  # Multi-step form navigation
└── checkout.spec.ts     # Checkout flow + Stripe mock
```

### CI/CD (`.github/workflows/ci.yml`)
Runs on every PR to `main`:
1. **lint-typecheck-build**: ESLint + TypeScript + `npm run build`
2. **unit-tests**: Vitest
3. **e2e-tests**: Playwright (Chromium only in CI)

### Config Files
- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Environment mocks
- `playwright.config.ts` - E2E configuration

---
