# Architecture: Boost

## System Overview

```
Client (Next.js pages)
    ↓
API Routes (Next.js /api)
    ↓
Inngest (background jobs)
    ↓
Services (business logic)
    ↓
External: Supabase | Stripe | Claude | Tavily | Resend | Screenshot Service
```

Serverless architecture with Inngest for long-running AI pipelines (up to 2 hours per step).

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
| `/api/marketing-audit` | POST | Create marketing audit | No | ✅ |
| `/api/marketing-audit/[slug]` | GET | Get audit results | No | ✅ |
| `/api/headline-analyzer` | POST | Create headline analysis (inline GPT) | No | ✅ |
| `/api/headline-analyzer/[slug]` | GET | Get analysis results | No | ✅ |
| `/api/landing-page-roaster` | POST | Create landing page roast | No | ✅ |
| `/api/landing-page-roaster/feed` | GET | Recent roasts feed (cached 60s) | No | ✅ |

**Auth pattern**: Check user's `auth_id` links to `public.users`, then verify `user_id` matches, OR valid `share_slug` for public access.

**Error pattern**: Return `{ success: false, error: string, code: string }`

---

## Analytics & Privacy

**Geo-based tracking** (in `layout.tsx`):
- EU/EEA/UK visitors (`x-vercel-ip-country` header) get cookieless PostHog
- Non-EU visitors get full PostHog + Facebook Pixel

**Cookie banner** (`src/components/CookieBanner.tsx`):
- Informational notice, not consent mechanics (tracking already geo-gated)
- Shows once after 1s delay, dismisses forever via localStorage
- Framer Motion animations, respects `prefers-reduced-motion`
- Storage key: `boost_cookie_notice_dismissed`

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

### Free Pipeline (Agentic Brief)
Agentic Sonnet pipeline — "landing page as lens into strategy":
- Model: Claude Sonnet 4 with tool calling
- Tools: `search` (Tavily), `seo` (DataForSEO domain_rank_overview)
- Limits: 5 tool calls, 3 iterations, 4000 max output tokens
- Screenshot captured upfront via Vultr Puppeteer (vision input to Sonnet)
- Tavily extract runs in parallel as fallback for bot-protected sites
- System prompt detects Cloudflare/CAPTCHA screenshots, falls back to page text
- Output sections: 3-Second Test, Positioning Gap, Quick Wins, Competitive Landscape, Scores
- Dedicated `FreeBriefOutputSchema` + `extractFreeBriefOutput()` — separate from paid `StructuredOutputSchema`
- Only required field: `briefScores`; everything else optional
- `stripNulls()` preprocessor handles LLM returning null for optional fields
- Formatter extracts: `threeSecondTest`, `positioningGap`, `quickWins`, `briefScores`, `competitiveComparison`, `positioning`, `competitors`, `discoveries`
- Locked sections shown as upsell: Full competitive deep-dive, 30-day roadmap, weekly execution, channel strategy
- No RAG/user history
- Rate limit: 1 per email (normalized for Gmail aliases)
- Polling: Recursive setTimeout every 2s until complete

**Free Run Cost (Sonnet 4 Agentic) - Updated Feb 1 2026:**
| Component | Calculation | Cost |
|-----------|-------------|------|
| Sonnet agentic (2-4 API calls) | ~8K input, ~3K output | $0.04-0.07 |
| Tavily search | 2-3 searches | $0.02-0.03 |
| DataForSEO domain_rank_overview | 1-2 lookups × $0.01 | $0.01-0.02 |
| Tavily extract (page content) | 1 call | ~$0.01 |
| Formatter (Sonnet) | ~3,500 in, ~500 out | $0.02 |
| **Total** | | **~$0.10-0.15** |

**Upgrade Flow**: When user upgrades from free audit, the free preview output is passed as context to the paid pipeline. Claude is instructed to "build on it, don't repeat the same insights, go deeper."

Files: `runFreePipeline()` in pipeline.ts, `generateFreeAgenticStrategy()` in pipeline-agentic.ts
Routes: `POST /api/free-audit`, `GET /api/free-audit/[id]`
Page: `/free-results/[id]` with auto-polling and upsell UI

### First Impressions Pipeline (REMOVED)
**Sunset Jan 23, 2026** - Replaced by `/in-action` curated examples page. All code removed. Table `first_impressions` remains in database (data archived).

### Test Scripts
```bash
npx tsx scripts/test-pipeline.ts   # Boost example
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
| `dataforseo_labs/domain_rank_overview/live` | $0.01 |
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

### PostHog Analytics

**Status**: ✅ Complete

Product analytics + API usage tracking.

**API Call Tracking** (Jan 24, 2026):
All external API calls are tracked to PostHog with latency, success/failure, and cost estimates.

| Service | Endpoints Tracked | Cost Constants |
|---------|------------------|----------------|
| Anthropic | messages.create | $15/1M input, $75/1M output |
| Tavily | search, extract | $0.01, $0.05 |
| DataForSEO | domain_rank_overview, domain_intersection | $0.02, $0.05 |
| ScrapingDog | scrape | $0.001 |

**Event**: `api_call` with service, endpoint, run_id, latency_ms, success, estimated_cost_usd (+ Anthropic token fields).

**Files**: `src/lib/analytics.ts` (`trackApiCall()`, `calculateApiCost()`), tracking in `pipeline-agentic.ts`.

**Dashboard**: "API Usage & Costs" — calls by service, cost breakdown, error rate, latency, token usage.

### Inngest

**Status**: ✅ Complete

Background job orchestration for long-running AI pipelines.

**Why Inngest**:
- Vercel Pro has 300s function timeout limit
- AI pipelines take 5-10 minutes
- Inngest allows up to 2 hours per step
- Free tier: 50K-100K executions/month

**Functions** (`src/lib/inngest/functions.ts`):
| Function | Event | Purpose |
|----------|-------|---------|
| `generate-strategy` | `run/created` | Full paid pipeline |
| `refine-strategy` | `run/refinement.requested` | Refinement pipeline |
| `generate-free-audit` | `free-audit/created` | Free mini-audit pipeline |
| `generate-marketing-audit` | `marketing-audit/created` | Free marketing audit (Tavily + GPT-4.1-mini) |
| `generate-target-audience` | `target-audience/created` | Free target audience generator (GPT-4.1-mini) |
| `generate-landing-page-roast` | `landing-page-roaster/created` | Free landing page roaster (Tavily + screenshot + GPT-4.1-mini vision) |

**Files**:
```
src/lib/inngest/
├── client.ts      # Inngest client with typed events
├── functions.ts   # Pipeline wrapper functions (6)
├── subscription.ts # Subscription-related functions
└── index.ts       # Barrel export

src/app/api/inngest/route.ts  # Serve handler
```

**Flow**:
1. API route creates run in DB
2. `inngest.send({ name: "run/created", data: { runId } })`
3. Inngest calls `/api/inngest` to execute `generate-strategy`
4. Function wraps entire pipeline in single `step.run()` (up to 2 hours)
5. Pipeline updates run status in DB as it progresses

**Env vars**:
```
INNGEST_EVENT_KEY      # For sending events to Inngest Cloud
INNGEST_SIGNING_KEY    # For verifying requests from Inngest
SCREENSHOT_SERVICE_URL # Vultr Puppeteer service (http://45.63.3.155:3333)
SCREENSHOT_API_KEY     # Shared secret for screenshot service
```

**Setup gotcha**: If using Vercel integration, keys may rotate. Ensure keys in Vercel env vars match Inngest dashboard. Manual sync at `https://app.inngest.com` → Apps → add `https://aboo.st/api/inngest`.

---

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

## n8n Reddit Outreach

**Status**: ✅ Active — Automated Reddit monitoring + comment generation. See `docs/n8n-reddit-workflow.md` for full details.

---
