# Current Phase

## Latest Update: V2 Master Plan Created (Feb 1, 2026)

**Strategic pivot to subscription model.** Competitor analysis (Landkit, LandingBoost, Enji) confirmed market exists for AI marketing co-pilot at $29-50/mo. Landkit doing same thing with worse data but better distribution. We have depth, they have reach.

**Product ladder decided** — two tiers, one decision point:
- **Boost Snapshot** (free) — "Here's what a stranger sees"
- **Boost Brief** (free) — "Here's where you stand" (leads with competitive landscape)
- **Boost Weekly** ($29/mo founder, $49/mo later) — "Here's what to do this week" + execution drafts + live data

**$29 one-shot killed.** The Opus pipeline becomes week 1 of the subscription. Eliminates "multiple runs" confusion, removes middle-tier decision point, simplifies everything. The Brief does the one-shot's old job as conversion tool.

**Key decisions**: $29/mo at launch (experience goods need people in the door), $49/mo after proof + integrations. Urgency through specificity, not fear. Dashboard = 3 panels (this week / what's working / draft it), not 12 modules. Founder pricing locked for life.

**Master plan**: `projects/v2-master-plan.md` — 5 workstreams:
1. **WS1**: Free tool funnel — Snapshot + Brief with urgency, single conversion page, more entry points
2. **WS2**: Boost Weekly — business profiles, $29/mo Stripe billing, focused dashboard, weekly loop
3. **WS3**: Execution engine — "Draft this" for any tactic, aligned to ICP/thesis
4. **WS4**: Integrations — GSC first, GA4 second
5. **WS5**: Dev infrastructure — Supabase branching + feature branches

**Build order**: Phase 0 (concierge validation — HARD GATE) → WS5 → WS1 → WS2 (includes basic Draft This) → WS3+WS4 in parallel.

**Phase 0 is next**: Email existing customers, manually deliver "week 2" adjustments, test if the weekly loop has pull before building infrastructure. 3 paying subscribers = green light.

**Product philosophy**: If someone leaves after 3 months because they figured it out, the product worked. No dark-pattern retention. Success = graduation.

**Existing $29 one-shot stays live** until Boost Weekly is ready to launch. Then sunset it.

**Detailed project docs**: `projects/ws1-*.md` through `projects/ws5-*.md`

---

## Previous: /start Funnel Tracking Shipped (Feb 1, 2026)

**Step-level tracking deployed.** Clean funnel data flowing going forward.

**New events:**
- `step_viewed` — fires per question (step, step_name, step_id, total_steps, time_since_start)
- `step_completed` — fires on advance (step, step_name, step_id, skipped, time_on_step_seconds)
- `checkout_viewed` — fires when checkout renders
- `form_abandoned` — now uses `sendBeacon` + `visibilitychange` for mobile reliability (was ~27% capture rate with `beforeunload` alone)

**Funnel to build in PostHog:** `form_started` → `step_viewed (step=1)` → `step_completed (step=1)` → ... → `checkout_viewed`

**Old data (pre-tracking, last 30 days):**
- 207 `form_started` → 56 `form_abandoned` (tracked) → 8 `run_created`
- Biggest drop-off: Q1 traction (37.5%), checkout (28.6%)
- Step names were inconsistent — fixed now

**Next steps:**
- Let data collect 1-2 weeks for clean funnel picture
- Then tackle Q1 drop-off (reorder questions or change opener)
- Progress bar label also shipped ("Step X of 6 · Building your growth plan")

**Key files**: `src/app/start/page.tsx`, `src/lib/hooks/useFormAnalytics.ts`, `src/lib/hooks/useFormWizard.ts`

---

## Previous: Free-Primary Homepage (Shipped)

**Jan 31, 2026** — Switched homepage to lead with free instead of $29. No A/B test — traffic too low (~200/week) for statistical significance. Just shipping it and watching numbers.

**What changed:**
- **Hero**: Primary CTA is now "See what we find — free" → `/start?free=true`. Paid demoted to secondary text link ("or get the full plan for $29"). Subheadline emphasizes free/no signup/no payment. Trust line: "No signup. No payment. Results in 2 minutes."
- **Pricing section**: Headline is "Start free. Go deeper for **$29.**" Centered testimonial below headline. Two-tier side-by-side cards (Free $0 left, Full Boost $29 right). Free card shows 3 included + 3 locked features with lock icons. In-Action card replaced with inline text links below tiers.

**PostHog experiment 326332 stopped early** — archive it manually. Feature flag `free-hero-cta` disabled/removed from code.

**Why**: 297 visitors/week, only 3.9% CTR to /start. 67% mobile, mostly Facebook. $29 too high for cold social traffic. Free run costs $0.07 — can afford 385 free runs per paid conversion. Watch free start rate over next 1-2 weeks to evaluate.

**Key files**: `HeroWithExplainer.tsx`, `Pricing.tsx` (no more feature flag logic — hardcoded free-primary).

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
