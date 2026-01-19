# Decisions

Key architectural and product decisions. Reference this when you need to understand "why".

---

## LLM Model: Claude Opus 4.5

**Decision**: Use `claude-opus-4-5-20251101` for strategy generation.

**Why**: Best reasoning capabilities for complex strategic analysis. Cost ~$0.12-0.15 per run, well within margin at $7.99 pricing.

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
- Solo founders don't want another password

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

## Pricing: $7.99 Single, $19.99 3-Pack

**Decision**: Two price points, no subscription for v1.

**Why**:
- $7.99 single is impulse-buy range
- 3-pack ($6.66/run) rewards commitment without subscription complexity
- Cost per run ~$0.30 (Claude + DataForSEO), healthy margin

**v2 consideration**: Subscription model for "Connected Growth Advisor" after validating output quality.
