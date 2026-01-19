# Decisions

Key architectural and product decisions. Reference this when you need to understand "why".

---

## Results Page: Document Style

**Decision**: Clean document layout over SaaS dashboard aesthetic.

**Why**:
- Users are reading long-form strategy content (thousands of words)
- Serif font (Tienne) + optimal line width (65ch) improves reading comfort
- Cards, glows, and decorative elements distract from content
- Strategy output should feel like a professional report, not a dashboard

**Implementation**:
- Typography: Tienne serif at 18px with 1.7 line-height
- Measure: `max-w-prose` (65ch ≈ 680px)
- Sections: Simple divider lines, no cards
- MarkdownContent: Lightweight renderer instead of react-markdown dependency

**Component**: `src/components/results/MarkdownContent.tsx` handles `###`, `**bold**`, `*italic*`, lists, `---`

---

## LLM Model: Claude Opus 4.5

**Decision**: Use `claude-opus-4-5-20251101` for strategy generation.

**Why**: Best reasoning capabilities for complex strategic analysis. Cost ~$0.12-0.15 per run, well within margin at $9.99 pricing.

**Constraint**: Do NOT change the model name without explicit user approval. This is documented in CLAUDE.md as a critical rule.

---

## Credit System: Separate Table

**Decision**: Track credits in `run_credits` table, not a counter on users.

**Why**:
- Audit trail for every credit purchase/redemption
- Can trace back to Stripe session or coupon code
- Easier to debug billing issues
- Sum credits to get balance: `SELECT SUM(credits) FROM run_credits WHERE user_id = ?`

**Alternative rejected**: Simple `credits INTEGER` on users table. Simpler but no history.

---

## Auth: Magic Links Only

**Decision**: No passwords. Magic link via Supabase Auth.

**Why**:
- Simpler implementation
- No password reset flow needed
- Email is already required for receipts
- Users don't want another password

**Implementation**:
- `auth_id` column on `public.users` links to `auth.users.id`
- Users created via Stripe before auth (by email)
- Linked when they first log in (by email match)
- DAL pattern: auth checks in Server Components, not middleware

**Protected routes**:
- `/dashboard` - requires login
- `/results/[runId]` - requires login OR share slug

---

## Research APIs: Tavily + DataForSEO

**Decision**: Use both for competitive intelligence.

**Why**:
- Tavily: Real-time web search, good for recent content and trends
- DataForSEO: SEO metrics, traffic estimates, keyword data
- Together: More comprehensive competitive picture

**Fallback**: If one fails, proceed with other. Strategy still valuable with partial research.

---

## URL Routes: Clean Paths

**Decision**: Use `/start`, `/results/[id]`, `/share/[slug]` instead of `/run/new`, `/run/[id]`, `/r/[slug]`.

**Why**: More descriptive, easier to remember, looks better in browser.

---

## Form Before Payment

**Decision**: User fills entire form before seeing checkout.

**Why**: Psychological investment. After spending 5-10 minutes on detailed input, users are less likely to bounce at payment.

---

## No User Accounts (Beyond Email)

**Decision**: Email is the only identifier. No usernames, profiles, settings.

**Why**: MVP scope. Magic link + email is sufficient for:
- Associating runs with users
- Sending results
- Accessing past runs

Can add more account features later if needed.

---

## Processing: Inline (No Queue)

**Decision**: Run AI pipeline directly in API route/webhook handler.

**Why**:
- Simpler architecture
- Vercel functions support up to 300s on Pro plan
- Expected processing time: 30-90 seconds
- Can add queue later if needed

**Risk**: If processing exceeds timeout, run fails. Acceptable for MVP.

---

## Share Links: Random Slugs

**Decision**: Share links use random UUIDs, not sequential IDs or predictable patterns.

**Why**: Security. Can't enumerate or guess other users' strategies.

---

## AI Prompts: Inlined in Code

**Decision**: Growth hacker prompts are inlined in `src/lib/ai/generate.ts`, not loaded from external files.

**Why**:
- No file system dependencies at runtime
- Prompts are code, should be versioned with code
- Focus-area-specific sections live alongside the logic
- Easier to test and modify

**Previous approach**: Loading from `.claude/agents/growth-hacker.md`. Removed.

---

## AARRR Focus Areas

**Decision**: User selects one of 6 focus areas before generation.

**Options**:
- `acquisition` - "How do I get more users?"
- `activation` - "Users sign up but don't stick"
- `retention` - "Users leave after a few weeks"
- `referral` - "How do I get users to spread the word?"
- `monetization` - "I have users but no revenue"
- `custom` - Free-form challenge input

**Why**:
- Multi-run value: User can come back for different challenges
- Focused output: 20k chars on their specific problem, not generic advice
- AARRR is a known framework, builds credibility

---

## Research Timeouts: Promise.race

**Decision**: Use `Promise.race` for Tavily timeouts, not AbortController.

**Why**: Tavily SDK doesn't support AbortSignal. Promise.race ensures we don't hang forever if API is slow.

**Implementation**: 15s timeout per Tavily search, 10s per DataForSEO endpoint.

---

## DataForSEO: Focus-Area Routing

**Decision**: Different AARRR focus areas trigger different DataForSEO endpoints.

**Mapping**:
| Focus Area | Endpoints | Cost |
|------------|-----------|------|
| acquisition | domain_metrics, ranked_keywords, competitors, backlinks, referrers | ~$0.50 |
| referral | domain_metrics, backlinks, referrers | ~$0.20 |
| activation/retention/monetization | domain_metrics only | ~$0.05 |
| custom | All endpoints | ~$0.50 |

**Why**:
- SEO data is highly relevant for acquisition, less so for retention/activation
- Keeps costs proportional to value delivered
- Parallel fetching within each domain for speed

**Available DataForSEO endpoints**:
- `domain_metrics_by_categories` - traffic, keyword count
- `ranked_keywords` - top keywords with positions/volumes
- `competitors_domain` - competitor overlap
- `backlinks/summary` - backlink count, referring domains, domain rank
- `backlinks/referring_domains` - top link sources

---

## Pricing: Funnel to Subscription

**Decision**: Three-tier funnel for v2.

```
FREE MINI → SINGLE RUN ($X) → SUBSCRIPTION (~$30/mo)
```

**v1 (current)**: $9.99 single run only. 3-pack removed.

**v2 (planned)**:
- **Free mini** - Teaser audit, no competitor research. Captures email, shows value.
- **Single run** - Full experience at ~$9.99. Proves quality.
- **Subscription** - ~$30/mo for Growth Board, integrations, periodic analysis, weekly digest.
- **Credit window** - Subscribe within X days of single run, get credited toward first month.

**Why kill the 3-pack**:
- Simpler mental model (no pack math)
- People buying 3 are proto-subscribers anyway
- Subscription is the real upsell, not bulk credits

**Why credit window**:
- Removes "I just paid $8" objection to subscribing
- Makes single run feel lower risk
- Stripe can handle via coupons or manual credits

**Economics**:
- Cost per run: ~$0.50 (Claude Opus + research APIs)
- $30/mo subscription with 2-3x/day analysis = healthy margin at low volume

---

## RAG: User Context in JSONB + Vector Chunks

**Decision**: Store accumulated user context in two places:
1. `users.context` JSONB - Structured data for form pre-fill and quick access
2. `user_context_chunks` - Vector embeddings for semantic search

**Why**:
- JSONB for structured access: Pre-fill forms, show "Welcome back" summary
- Vector chunks for semantic retrieval: Find *relevant* past advice, not just recent
- Best of both worlds without over-normalizing

**Alternative rejected**: Separate tables for each context type (tactics, traction, etc.). Would add 4+ tables for minimal benefit.

---

## Embeddings: OpenAI text-embedding-3-small

**Decision**: Use OpenAI for embeddings, not Claude or local models.

**Why**:
- 1536 dimensions, good quality-to-cost ratio
- $0.02/1M tokens = ~$0.00002 per run (negligible)
- Well-supported by pgvector
- Graceful degradation: If OPENAI_API_KEY missing, falls back to text search

**Alternative rejected**: Claude embeddings (no native offering), local models (deployment complexity).

---

## Context Accumulation: Fire-and-Forget

**Decision**: After run completes, context accumulation and embedding extraction run as fire-and-forget async calls.

**Why**:
- User sees results immediately, doesn't wait for embeddings
- If embedding fails, run still succeeds
- Context still accumulated synchronously (critical path)
- Embeddings are enhancement, not requirement

**Risk**: Embedding creation could fail silently. Acceptable - text search fallback exists.

---

## RAG Retrieval: Hybrid Approach

**Decision**: Retrieve user history using both structured context and vector search.

**What Claude receives for returning users**:
1. Traction timeline (last 5 snapshots from JSONB)
2. Tactics tried (up to 10 from JSONB)
3. Past recommendations (top 5 via vector search)
4. Past insights (top 3 via vector search)

**Why**:
- Structured data gives consistent context (traction over time)
- Vector search finds *relevant* past advice (not just recent)
- Avoids repeating the same recommendations

**Prompt enhancement**: `RETURNING_USER_PROMPT` tells Claude to build on past advice, track progress, celebrate wins.

---

## Vector Search: pgvector in Supabase

**Decision**: Use pgvector extension directly in Supabase, not external vector DB.

**Why**:
- Already using Supabase - no new service to manage
- pgvector is mature and well-supported
- RLS policies work with vector tables
- Can join with other tables if needed
- Free with Supabase (no Pinecone/Weaviate costs)

**Implementation**:
- `user_context_chunks` table with `embedding vector(1536)` column
- `match_user_context_chunks` RPC function for similarity search
- Cosine similarity with 0.5 threshold

---

## Chunk Types: 5 Categories

**Decision**: Categorize context chunks into 5 types for filtered retrieval.

| Type | Source | Search Use Case |
|------|--------|-----------------|
| `product` | run_input | Understanding their product |
| `traction` | run_input | Progress over time |
| `tactic` | run_input | What they've tried |
| `insight` | run_output | Past analysis |
| `recommendation` | run_output | Past advice (avoid repeating) |

**Why**: Enables filtered searches. When generating, we specifically search for past `recommendation` chunks to avoid repetition.

---

## Context Limits: Bounded Arrays

**Decision**: Apply max limits to all accumulated arrays.

| Array | Limit | Rationale |
|-------|-------|-----------|
| traction.history | 10 | ~6 months of snapshots |
| tactics.tried | 50 | Comprehensive history |
| tactics.working | 50 | Same |
| tactics.notWorking | 50 | Same |
| competitors | 10 | More than enough |

**Why**: Prevents unbounded growth. JSONB columns with huge arrays hurt performance.

**Implementation**: `.slice(-MAX)` on all array operations in `accumulate.ts`.
