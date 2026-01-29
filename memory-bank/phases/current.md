# Current Phase

## Latest Update: Free Marketing Audit Tool (SEO Lead Gen)

**Jan 29, 2026** - Built and shipped `/tools/marketing-audit` — free SEO tool that audits small business websites using "The 3-Second Test" framework.

**Free Marketing Audit Tool** — user enters URL + business description + email, gets a diagnostic audit in ~60 seconds. Funnels to $29 Boost. Cost per use: ~$0.04-0.06 (Tavily extract + screenshot + GPT-4.1-mini vision).

**The 3-Second Test Framework**: When a stranger lands on your site, can they answer in 3 seconds: What do you sell? Who is it for? Why should I pick you? Evaluates through 4 lenses: Clarity, Customer Focus, Proof, Friction.

**Screenshot-based visual analysis**: Pipeline captures a 1280x800 homepage screenshot via external Puppeteer service and passes it as vision input to GPT-4.1-mini. Falls back to text-only gracefully.

**Screenshot Service**: Express + Puppeteer on Vultr (45.63.3.155:3333, $10/mo). Hardened: SSRF validation, max 3 concurrent, API key auth. Env: `SCREENSHOT_SERVICE_URL`, `SCREENSHOT_API_KEY`.

### Architecture
- **Landing page**: `/tools/marketing-audit/page.tsx` — wizard form (3 steps), educational content, FAQ structured data
- **Results page**: `/tools/marketing-audit/[slug]/page.tsx` + `results-client.tsx` — SSR if complete, polling if pending
- **API**: `POST /api/marketing-audit/route.ts` (Turnstile, rate limiting, honeypot) + `GET /api/marketing-audit/[slug]/route.ts`
- **Pipeline**: `src/lib/ai/marketing-audit.ts` — Tavily extract → Screenshot → GPT-4.1-mini (vision)
- **Inngest**: `marketing-audit/created` event triggers async pipeline
- **DB**: `marketing_audits` table (slug, url, email, business_description, output JSONB, status)
- **CSP**: Added `challenges.cloudflare.com` for Turnstile

---

## Previous: AI Search Optimization (Jan 29, 2026)

Optimized for Google AI Overviews, Perplexity, ChatGPT Search.

- **llms.txt + robots.txt** — product description, pricing, differentiators
- **JSON-LD Schemas** — FAQPageSchema, BreadcrumbSchema, SoftwareApplicationSchema (removed fake ProductSchema)
- **Homepage FAQ** — 7-question accordion after Pricing. Component: `FAQSection.tsx`
- **5 Comparison Pages** — `/boost-vs-alternatives/[chatgpt|diy|agency|enji]` + hub page. Each with head-to-head card, FAQs, breadcrumbs
- **CSS** — `text-wrap: pretty` (paragraphs) + `text-wrap: balance` (headings) in `.prose-boost`

---

## Previous: Supabase Security Hardening (Jan 29, 2026)

Migration `fix_rls_and_security_advisors`: RLS on `examples`, replaced overly permissive policies on `businesses`/`reddit_sent_posts`, fixed RLS initplan (`(select auth.uid())`), set `search_path = ''` on functions.

Remaining INFO-level: `codes`/`free_audits`/`waitlist` locked (no policies), leaked password protection (dashboard toggle).

---

## Previous: Reddit Growth Loop (Jan 28, 2026)

First runs of "help strangers on Reddit with Boost output" loop. Helped Herderin (tall women's fashion) and Florence walking tour operator. Content plan created for Twitter/Reddit amplification.

---

## Previous: Thesis-Driven Plans (Jan 27, 2026)

Major rewrite of Opus pipeline prompt. Plans now driven by internal thesis (strategic diagnosis). Added "The Opportunity" section. Removed Channel Strategy as standalone. Week themes escalate: build → test → adapt → systematize. See `decisions.md` for rationale.

---

## What's Next

### Pipeline V2: Competitive Intelligence Upgrade (Priority)
**Full plan:** `memory-bank/projects/pipeline-v2-plan.md`

Major upgrade transforming Boost from "AI growth strategist" to "competitive intelligence platform."

**Key changes:**
- Price: $9.99 → $39
- 7+ data sources (DataForSEO for user + competitors, Tavily Reddit, Apify G2, SimilarWeb, ProductHunt)
- Claude tool use for deep dives (max 5 calls)
- New output sections: SEO Landscape, Keyword Playbook (30-50 keywords), Content Ideas, Market Sentiment
- Processing time: 2 min → 3-4 min (with progress indicators)

### Later
- Weekly automated runs (cron job for subscribed users)
- Google OAuth (optional)

---

**Full history**: `_archive/phases/phase-1-launch.md`
