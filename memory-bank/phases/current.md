# Current Phase

## Latest Update: A/B Test — Free-Primary Homepage (50/50)

**Jan 31, 2026** — Running a PostHog experiment to test whether leading with free converts more cold traffic (especially Facebook).

**PostHog experiment**: "Free-First Hero CTA" (ID 326332), feature flag `free-hero-cta`, 50/50 `control`/`test` split.

**What changes in the `test` variant:**
- **Hero**: Primary CTA becomes "See what we find — free" → `/start?free=true`. Paid demoted to secondary text link. Subheadline and trust line updated (no $29 mention, emphasizes no signup/no payment).
- **Pricing section**: Headline changes to "Start free. Go deeper for **$29.**" Centered testimonial below headline. Two-tier side-by-side cards (Free $0 left, Full Boost $29 right). Free card shows 3 included + 3 locked features with lock icons. In-Action card replaced with inline text links.

**Control variant**: Completely unchanged (current production homepage).

**Key files modified**: `HeroWithExplainer.tsx`, `Pricing.tsx` (both read `free-hero-cta` flag via `useMemo` + `posthog.getFeatureFlag`).

**Why**: 297 visitors/week, only 3.9% click through to /start. 67% mobile, mostly Facebook. $29 is too high a commitment for cold social traffic on first visit. Free run costs $0.07 — can afford 385 free runs per paid conversion.

**Metrics**: Hero CTA click rate, hero-to-pageview funnel, paid CTA clicks (secondary).

---

## Previous: Disabled Tab Feedback on Free Results

**Jan 30, 2026** - Added tooltip feedback when users click disabled "Tasks" tab on free result pages. Shows "Available with the full Boost plan" message on click (auto-dismisses after 2.5s). `disabledMessage` prop is customizable per page.

## Previous: Target Audience Generator + Shared Free Tool Components

**Jan 30, 2026** - Built `/tools/target-audience-generator` and extracted shared component library for all free tool pages.

**Target Audience Generator** — user enters business name + what they sell + customer description + email, gets audience profile in ~30s. 102 pre-generated niche example pages at `/tools/target-audience-generator/examples/[niche]` for programmatic SEO. Cost: ~$0.02 (GPT-4.1-mini).

**Shared Free Tool Components** — `src/components/free-tools/` (7 components):
- `ToolFormCard` — wizard wrapper with progress dots, AnimatePresence
- `ToolEmailStep` — reusable email capture step with Turnstile
- `ToolHeroSection` — hero with headline/subheadline/form slot
- `ToolWhatsYouGet` — 2-column features + preview card
- `ToolMidCTA` — mid-page CTA band (tinted bg, uppercase label)
- `ToolBoostPitch` — dark upsell card
- `ToolEducationalSection` — 4 spatial treatments (split-card, big-quote, side-border, tinted-wide) cycling for visual variety at `max-w-6xl`

Both marketing audit and target audience pages rewritten to use shared components. Consistent Soft Brutalist design across all free tools.

---

## Previous: Free Marketing Audit Tool (SEO Lead Gen)

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

### Free Tools SEO Expansion (Priority)
**Full plan:** `memory-bank/projects/free-tools-seo.md`

Build more free tools to replicate M1-Project's 36K/mo organic traffic strategy. Marketing Audit shipped and got good reception. Next up:
1. **Target Audience Generator** — NOW BUILDING. Named for real search behavior ("target audience" not "ICP"). Programmatic SEO: 100+ pre-generated example pages at `/tools/target-audience-generator/examples/[niche]`
2. **Headline / Value Prop Analyzer** — highest volume (20-40K/mo), cheapest ($0.02-0.04)
3. **Email Subject Line Scorer** — cheapest to run ($0.01-0.02), high volume

All fit existing pattern: form → Inngest async → result page with CTA.

### Pipeline V2: Competitive Intelligence Upgrade
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
