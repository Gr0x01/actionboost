# Decisions

Key architectural and product decisions. Reference this when you need to understand "why".

---

## Target Audience: SMBs, Not Founders (Jan 23 2026)

**Decision**: Pivot from indie hackers/startup founders to small business owners (SMBs).

**Why the change**:
- "Cheap, just try it" ($9.99) messaging attracted tire-kickers, not buyers
- Build-in-public content reached founders who could build this themselves
- Reddit validation: A salon owner and niche e-commerce seller (lip balm for equestrians) both found real value in the output
- These SMBs can't build their own AI tools — they just want the answer

**New target audience**:
- Salon owners, local service businesses
- Niche e-commerce (Etsy sellers, specialty products)
- Small business owners who are stuck on marketing
- NOT tech-savvy, NOT on founder Twitter

**What changed**:
- Price: $9.99 → $49 (serious business expense, not impulse buy)
- Voice: Snarky founder → Friendly expert ("Let's figure it out together")
- Frameworks: Keep AARRR/ICE but explain in plain English
- Design: Brutalist harsh → Light skeuomorphism (softer shadows, warmer)
- Copy: No jargon, no startup references, SMB examples (salons, not SaaS)

**Homepage copy shift**:

| Element | Before | After |
|---------|--------|-------|
| Headline | "ChatGPT told me Reddit" | "Stuck on marketing? Let's figure it out." |
| Tagline | "$10 → competitor research" | "Money back if it doesn't help. Seriously." |
| Trust | "Built by @rbaten \| Side project" | "Plan ready in 5 minutes · No jargon · Salons, e-commerce, consultants" |
| Examples | Indie Hackers, Twitter threads | Pinterest for salons, referral programs |
| Hero CTA | "Get My Action Plan" | "Get my 30-day plan" |
| Pricing CTA | "Tell me about your business" | "Get my plan for $49" |
| Footer | "Your plan ready in about an hour" | "Your plan ready in 5 minutes" |

**Files changed**:
- `src/components/landing/Hero.tsx`
- `src/components/landing/HeroForm.tsx`
- `src/components/landing/FrameworksSection.tsx`
- `src/components/landing/Pricing.tsx`
- `src/components/landing/PricingButtons.tsx`
- `src/components/landing/FooterCTA.tsx`
- `src/components/landing/FooterCTAForm.tsx`
- `src/lib/config.ts` (price)
- `src/app/layout.tsx` (meta tags)

**What to preserve**:
- AARRR/ICE frameworks (shows expertise)
- Refinements as core value (SMBs start vague, refine as they see value)
- Money-back guarantee
- Real competitor research (the differentiator)

**What to avoid**:
- Startup jargon (AARRR without explanation, "growth hacking")
- Build-in-public references
- Founder Twitter vibes
- Emojis (absolutely never)

---

## Visual Style: Light Skeuomorphism (Jan 2026)

**Decision**: Warm, tactile design with soft shadows and friendly interactions.

**Brand vibe**: Friendly expert helping SMBs figure out marketing. Approachable, not intimidating. Professional but warm. NOT cold SaaS. NOT harsh brutalist.

**Why the change from Brutalist**: Brutalist worked for snarky founder voice targeting indie hackers. SMB audience (salon owners, local services) needs warmer, more approachable design. Hard edges felt intimidating.

**The approach**:
- **Soft shadows**: Warm-tinted shadows, not harsh black offsets
- **Rounded corners**: `rounded-xl`, `rounded-2xl` - friendly, approachable
- **Tactile feedback**: Buttons lift on hover, squish on press. Fast 100ms transitions.
- **Warm color palette**: Cream backgrounds, soft borders

**Implementation patterns**:
```css
/* Soft card */
.soft-card {
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--background);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Tactile button */
.tactile-button {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 150ms;
}
.tactile-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.tactile-button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

**Typography**:
- Headlines: Light/black weight contrast ("Stuck on marketing? **Let's figure it out.**")
- Taglines: Mono, uppercase, tracked out
- Body: Source Sans 3, readable

**Colors**:
- Warm cream background (`--background: #FDFCFB`)
- Soft beige surface (`--surface: #F8F6F3`)
- Orange CTA (`--cta: #E67E22`)
- Navy foreground (`--foreground: #2C3E50`)
- Warm-tinted shadows (`rgba(44, 62, 80, 0.04)`)

**What this affects**:
- All landing page components
- Forms: Soft inputs with rounded corners
- Results page: Dashboard components with soft cards

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

**Why**: Best reasoning capabilities for complex strategic analysis. The nuance in competitive analysis and unexpected/creative recommendations is the key differentiator.

**Sonnet vs Opus Comparison** (tested Jan 2025):

| Aspect | Sonnet 4 | Opus 4.5 |
|--------|----------|----------|
| Competitive analysis | Solid but surface-level | Deeper, more nuanced |
| Recommendations | "By the book" | More creative/unexpected |
| Speed | Faster | Slower |

**Conclusion**: Opus's nuanced analysis justifies the marginal cost increase. The depth of insight is the product's core value.

**Update (Jan 21, 2026)**: Upgraded ALL pipelines to Opus 4.5 - paid runs, free mini-audits, and First Impressions. Cost difference is minimal (~$0.01 more for free runs) but quality improvement is noticeable.

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

## Pricing: Funnel to Subscription (SUPERSEDED)

**Note**: This section is outdated. See "Pricing: $29 One-Shot + $49/mo Subscription" above for current pricing.

**Original plan** (never shipped):
```
FREE MINI → SINGLE RUN ($9.99) → SUBSCRIPTION (~$30/mo)
```

**What actually happened**:
- $9.99 got zero traction (felt like GPT wrapper)
- Repositioned to SMBs at $49
- Further refined to $29 one-shot + $49/mo subscription
- Dashboard sells subscription via integration upsells, not pricing page

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

## Serverless Pipeline: Use after() Not Fire-and-Forget (Jan 21 2026)

**Bug**: Runs stuck at "pending" status, pipeline never executed.

**Root cause**: Fire-and-forget pattern doesn't work in Vercel serverless:
```typescript
// BROKEN - Vercel kills function after response sent
runPipeline(run.id).catch(console.error);
return NextResponse.json({ runId });
```

**Why it failed**: Vercel terminates serverless functions immediately after HTTP response is sent. The unawaited `runPipeline()` promise never gets a chance to execute.

**Fix**: Use Next.js 15+ `after()` API to keep function alive:
```typescript
import { after } from "next/server";

after(async () => {
  await runPipeline(run.id).catch(console.error);
});
return NextResponse.json({ runId });
```

**Files changed**:
- `src/app/api/runs/create-with-code/route.ts`
- `src/app/api/runs/create-with-credits/route.ts`
- `src/app/api/webhooks/stripe/route.ts`

**Manual retry script**: `scripts/retry-run.ts` for recovering stuck runs:
```bash
npx tsx scripts/retry-run.ts <runId>
```

**Lesson**: Never use fire-and-forget in serverless. Always use `after()` for background work that must complete.

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

---

## AI Context Limits: Relaxed for Quality (Jan 21 2026)

**Decision**: Increase truncation limits and output tokens to prioritize quality over minimal cost savings.

**Context**: At $9.99/run with ~$0.50 cost (~90% margin), aggressive truncation was degrading output quality to save pennies.

**Changes made**:

| Setting | Old | New | File |
|---------|-----|-----|------|
| MAX_TOKENS | 8000 | 12000 | generate.ts |
| Traction snapshots | 200 chars | 500 chars | generate.ts |
| Tactics tried | 150 chars | 400 chars | generate.ts |
| Past recommendations | 300 chars | 600 chars | generate.ts |
| Past insights | 300 chars | 600 chars | generate.ts |
| Competitor insights | 300 chars | 500 chars | generate.ts |
| Market/growth trends | 200 chars | 400 chars | generate.ts |
| Previous output summary | 400 chars | 800 chars | generate.ts |
| Tavily maxResults | 5 | 7 | research.ts |
| Ranked keywords | 10 | 15 | research.ts |
| Past insights RAG | 3 | 5 | pipeline.ts |
| Tactics displayed | 10 | 15 | pipeline.ts |

**Cost impact**:
- Current: ~$0.50/run
- After changes: ~$0.60/run (typical), ~$0.96/run (worst case)
- Margin remains 85-94%

**Why these limits**:
- 500 char traction = can describe "100 users, $500 MRR, 20% WoW growth, launched ProductHunt..."
- 400 char tactics = multi-step efforts like "LinkedIn ads ($2k), cold outreach (500 emails)..."
- 600 char recommendations = preserves the "why" behind past advice
- 800 char output summary = Claude understands previous strategy for refinements
- 12k output tokens = room for complex strategies without truncation

**What stayed the same**:
- Competitor limit: 3 (appropriate for most users)
- Historical storage: 10 traction snapshots, 50 tactics (already generous)
- Stripe metadata truncation: 500 chars (just backup, full data in DB)

---

## Brand Voice: Friendly Expert (Jan 2026)

**Decision**: Warm, hand-holding voice like a smart friend who knows marketing.

**Core narrative**: "Stuck on marketing? Let's figure it out."

**Why this works**:
- Acknowledges the user's pain directly (they ARE stuck)
- Non-intimidating, collaborative tone
- No jargon, no posturing
- Money-back guarantee removes risk

**Voice framework**:
- **Tone**: Friendly, helpful, like a smart friend explaining something
- **Perspective**: First person ("Tell me about your business... I'll research...")
- **Audience**: SMBs who are stuck, not tech-savvy founders
- **Value**: Real research on YOUR competitors, not generic advice

**Copy patterns established**:

| Element | Pattern | Example |
|---------|---------|---------|
| Headlines | Light/black weight contrast | "Stuck on marketing? **Let's figure it out.**" |
| Taglines | Single value prop, conversational | "Money back if it doesn't help. Seriously." |
| Subheads | Direct, first person, warm | "Tell me about your business... I'll build you a 30-day plan." |
| CTAs | Action + outcome | "Get my 30-day plan" |
| Guarantees | Bold, casual | "Didn't help? Full refund. No questions asked." |
| Trust | Practical, specific | "Plan ready in 5 minutes · No jargon" |

**What to preserve**:
- First-person voice ("Tell me...", "I'll research...")
- Money-back guarantee prominent
- SMB examples (salons, e-commerce, consultants)
- Speed promise (5 minutes)

**What to avoid**:
- Startup jargon (without plain-English explanation)
- Founder/indie hacker references
- Snarky or irreverent tone
- Emojis (absolutely never)
- Tech-savvy assumptions

**Testimonial style**:
- Italic quote text
- Small orange bar before attribution
- Name format (not Twitter handles)

---

## Pricing: $29 One-Shot + $49/mo Subscription (Jan 23 2026)

**Decision**: Two separate products at different price points.

| Product | Price | What You Get |
|---------|-------|--------------|
| One-shot | $29 | 1 strategy + 2 refinements + dashboard (static) |
| Subscription | $49/mo | Integrations + fresh data + weekly check-ins |
| Annual | ~$400/yr | ~$33/mo equivalent |

**Why $29 one-shot** (down from $49):
- $10 got zero traction - felt like GPT wrapper
- $25 = instant buy for solo devs
- $40 = think about it
- $50+ = hesitation/research mode
- $29 is the floor where it still feels like "real product"

**Why $49/mo subscription**:
- Subscription is MORE expensive because it's MORE product
- No "subscribe and cancel after one month" gaming
- Clear value separation: one-shot = "I need a plan", subscription = "I need ongoing help"
- If you subscribe, first strategy included - no separate purchase needed

**The conversion funnel**:
```
$29 one-shot → dashboard access (forever, static)
                    ↓
        User sees grayed-out integrations
        "Connect Google Analytics for weekly insights"
                    ↓
              $49/mo subscription
```

**Key insight**: Dashboard sells the subscription, not a pricing page. User experiences value first, then sees what else is possible.

**Competitive landscape**:
- Jasper: $70/mo (content generation, not strategy)
- Copy.ai: $29/mo (content generation)
- Agencies: $2000+/mo (out of reach)
- ChatGPT: Free but generic, no research

**Nobody does what Boost does**: Personalized marketing strategy with live competitive research for SMBs. Content tools exist. Strategy tools for SMBs at this price point don't.

**Previous pricing**:
- v0: $9.99 → zero traction, felt like garbage
- v1: $49 → repositioning for SMBs
- v1.5: $29 → optimized for conversion funnel to subscription

---

## Example Pages: Raw Output, Not Case Studies (Jan 23 2026)

**Decision**: `/in-action` shows raw Boost outputs, not case-study format with before/after tracking.

**Original plan had**:
- "What Changed" boxes showing was_doing/now_doing/result
- Week 1 vs Week 4 outcome markers
- Case-study framing ("Here's what happened")

**What we built instead**:
- Simple gallery cards: Industry badge, stage, insight hook, "See full plan →"
- Detail pages: Just the full Boost output via MarkdownContent
- No metadata tracking (column exists but unused)

**Why the simplification**:
1. **Purpose clarity**: We're showing what Boost produces, not tracking ROI
2. **No consent needed**: Founder creates these from Twitter outreach, not user-submitted
3. **Quality speaks**: Real Boost outputs are impressive enough without framing
4. **Simpler admin**: Just paste output + add hook text, no metadata to fill

**How it works**:
1. Founder finds Twitter users seeking marketing help
2. Runs Boost on their business (anonymized)
3. Pastes full output into admin panel
4. Adds industry, stage, and insight (hook text for cards)
5. Toggles live when ready

**Database**:
- `examples` table with: slug, industry, stage, insight, content
- `metadata` JSONB column exists but unused
- `is_live` toggle for draft/publish flow

**Files**:
- `/in-action` - Gallery (SSR, brutalist cards)
- `/in-action/[slug]` - Detail (SSR, MarkdownContent)
- `/in-action/admin` - Management (client, localhost or admin email)

---

## Positioning Frameworks: Dunford + Gerhardt (Jan 23 2026)

**Decision**: Add April Dunford and Dave Gerhardt positioning expertise to both the AI pipeline and the growth-hacker subagent.

**Why**:
- The pipeline was jumping straight to tactics without assessing positioning clarity
- Unclear positioning makes all tactics less effective
- SMBs often don't know what their real competitive alternatives are

**What was added**:

### April Dunford's "Obviously Awesome" Framework
1. **Competitive alternatives** - What would customers do if this didn't exist?
2. **Unique attributes** - What does this have that alternatives don't?
3. **Value** - What capability do those attributes enable?
4. **Target segments** - Who cares most about that value?
5. **Market category** - What's the best context to frame this value?

### Dave Gerhardt's Brand-First Approach
- Brand before demand gen (people buy from brands they trust)
- Content builds trust (educational > promotional)
- Be human (businesses don't have to be boring)
- Community compounds (build > rent audiences)

**New form question**: "If they didn't use you, what would they do instead?"
- Multi-select chips: Wing it, Google it, Ask ChatGPT, Hire an agency, Ask a friend
- Custom input for specific alternatives
- REQUIRED field (positioning analysis needs this data)

**New output section**: "Positioning Check" in "Your Situation"
- What you're competing against (beyond named competitors)
- What makes you different
- Who cares most
- Verdict: Clear / Needs work / Unclear

**Files changed**:
- `src/lib/ai/generate.ts` - All prompts enhanced with positioning frameworks
- `src/lib/types/form.ts` - Added `alternatives` field + validation
- `src/app/start/page.tsx` - New form flow
- `CLAUDE.md` - Updated growth-hacker subagent

---

## Pipeline V2: Competitive Intelligence Platform (Jan 22 2026)

**Decision**: Expand from 3 Tavily searches to 7+ data sources with Claude tool use.

**Why**: Differentiate from ChatGPT Deep Research. They give information, we give intel + a plan.

**New data sources**:
- DataForSEO for user's domain (not just competitors)
- Keyword gaps (domain_intersection)
- Reddit sentiment (Tavily site:reddit.com)
- G2 reviews (Apify scraper)
- Traffic sources (SimilarWeb)
- ProductHunt launches

**Claude tool use**: Max 5 deep-dive calls for targeted research based on initial findings.

**New output sections**:
- Your SEO Landscape (rankings, quick wins)
- Market Sentiment (Reddit, reviews)
- Keyword Playbook (30-50 keywords)
- Content Ideas (10 blog titles)

**Cost impact**: ~$0.50 → ~$1.50-2.30 per run
**Margin at $39**: 92-94%
**Processing time**: 2 min → 3-4 min (with progress indicators)

**Full plan**: `memory-bank/projects/pipeline-v2-plan.md`

---

## Homepage Flow: Remove FrameworksSection (Jan 23 2026)

**Decision**: Remove FrameworksSection from homepage. Keep component for future use.

**Why**: The narrative was telling the same story twice.

| Section | Emotional Beat | What It Shows |
|---------|---------------|---------------|
| Hero | Pain recognition | "You're drowning in noise" |
| Explainer | Relief / Revelation | Chaos converges into HeroSummaryCard (deliverable preview) |
| ~~FrameworksSection~~ | ~~???~~ | ~~More output previews (AARRR table, ICE tactics)~~ |
| Pricing | Decision point | $49, here's what you get |
| FooterCTA | Final push | Enter your info |

**The problem**: After the scroll animation delivers "chaos becomes clarity" with HeroSummaryCard, FrameworksSection showed... more sample output. The visitor just saw the deliverable. Showing it again in different clothes flattened the emotional arc.

**New flow**: Hero → Explainer → Pricing → FooterCTA

This is tighter. The HeroSummaryCard does the heavy lifting. Visitors who want methodology details can learn it after they buy.

**Component preserved**: `src/components/landing/FrameworksSection.tsx` - Soft Brutalist design with AARRR, ICE, and Action Plan previews. Could be used:
- On a dedicated "/how-it-works" page
- For returning users who want to understand methodology
- As a trust-builder in a different context

**Future option**: If trust-building is needed before pricing, replace with a compact "trust bar" (3 icons, 3 one-liners) rather than a full section with sample outputs.

---

## Visual Style: Soft Brutalist (Jan 23 2026)

**Decision**: Update from Light Skeuomorphism to Soft Brutalist across all components.

**Why the change**: Light Skeuomorphism with rounded-2xl and soft shadows felt too generic SaaS. Needed more visual confidence to match "Confident Friend" brand voice.

**Soft Brutalist formula**:
```css
/* SOFT BRUTALIST */
border: 2px solid rgba(44, 62, 80, 0.2);     /* visible but not harsh */
box-shadow: 4px 4px 0 rgba(44, 62, 80, 0.1); /* offset shadow, soft */
border-radius: 12px;                          /* rounded-xl max, NOT rounded-2xl */
background: white;                            /* solid, no gradients */
```

**What changed from Light Skeuomorphism**:
| Element | Light Skeu | Soft Brutalist |
|---------|------------|----------------|
| Border radius | rounded-2xl (16px) | rounded-xl (12px) max |
| Borders | invisible (border-border/50) | visible (border-foreground/20) |
| Shadows | blur shadows (shadow-lg) | offset shadows (4px 4px 0) |
| Backgrounds | subtle gradients | solid white |

**Token reference**:
- Cards: `border-2 border-foreground/20`, `boxShadow: 4px 4px 0 rgba(44,62,80,0.1)`, `rounded-xl`
- Primary buttons: `shadow-[4px_4px_0_rgba(44,62,80,0.3-0.4)]`
- Secondary buttons: `shadow-[4px_4px_0_rgba(44,62,80,0.15)]`
- On dark backgrounds: `rgba(255,255,255,0.08)` for shadows

**Files updated**:
- Header: `border-b-2 border-foreground/20` (was 3px hard border)
- HeroWithExplainer: Hero CTA shadow reduced from 100% to 40% opacity
- HeroSummaryCard: Full Soft Brutalist treatment
- FrameworksSection: Full Soft Brutalist treatment
- Pricing: Cards use Soft Brutalist (was rounded-2xl, shadow-lg)
- PricingButtons: Offset shadows instead of blur shadows
- FooterCTAForm: Offset shadow on dark background

**Skill updated**: `.claude/skills/frontend-design/SKILL.md` now documents Soft Brutalist as the Boost project standard.
