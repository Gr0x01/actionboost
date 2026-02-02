# Current Phase

## Latest Update: Dashboard Phases 0-2.5 Complete + Bot Protection Fix (Feb 2, 2026)

**Phases 0, 1, 2, 2.5 shipped.** Dashboard has layout shell, project switcher, Brand page, and Business page — both with AI-powered fill.

**What shipped this session:**

- **Phase 2.5**: Business page (`/dashboard/business`) with 2 editable sections: Business Basics (website, description, industry) and Goals (primary goal, budget). "Fill with AI" button uses Sonnet to infer fields from existing context. Same edit/save/cancel pattern as Brand.
  - Renamed from "Settings" → "Business" (brand guardian: "Settings" implies account management, not business profile)
  - Nav icon: `Building2`. Route: `/dashboard/business`
  - `industry` added to `ALLOWED_PROFILE_KEYS`
  - New API: `POST /api/business/[id]/business/suggest` (Sonnet, `?save=true`)
  - "What You've Tried" section removed — static snapshot doesn't belong here; marketing history will be a living log in Phase 4
  - `triedBefore` removed from `ALLOWED_PROFILE_KEYS` and `ONBOARDING_STEPS` (not collected in any active flow — baked into `productDescription` in `/start`). Field kept in type + schema for backward compat (brand suggest + inngest read it).
  - `/subscribe` page is orphaned — nothing links to it. Noted for future cleanup.

- **Bot protection fix**: Cloudflare "verifying your browser" was breaking the landing page roaster and marketing audit screenshots + content extraction.
  - Screenshot service (Vultr): now detects CF challenge and waits up to 15s for it to resolve before capturing
  - Landing page roaster + marketing audit: if Tavily returns challenge content, falls back to ScrapingDog with `dynamic=true` (JS rendering)
  - Screenshot service redeployed to Vultr

**Dashboard nav (4 tabs):**
1. This Week (CalendarCheck) — task list
2. Insights (BarChart3) — placeholder
3. Brand (Fingerprint) — ICP, voice, competitors + AI fill
4. Business (Building2) — basics, goals + AI fill

**Next: Phase 3 (Task View Redesign)** — Replace current `WeeklyFocus` + `TaskCheckbox` with expandable task cards (collapsed: checkbox + title + track; expanded: WHY + HOW + notes). Week theme card. Week navigator.

Full dashboard spec and phase plan in `projects/ws2-subscription-platform.md`.

---

## Previous: Dashboard Redesign Spec (Feb 2, 2026)

**Designed the subscriber dashboard architecture.** Full spec in `projects/ws2-subscription-platform.md` → "Dashboard Design" section.

**Key decisions:**
- **Task-centric** — Dashboard IS a task list, not panels. Tasks are the primary interaction.
- **No sidebar** — Top nav (desktop) + bottom nav (mobile/tablet). 4 items: This Week, Insights, Profile, Settings.
- **Multi-project** — Project switcher in top bar. Founders run 2-3 projects. Switcher is also the upsell surface ($15-20/mo per additional).
- **Time-navigable** — Week navigator (←/→) on main view. Peek at next week's plan, look back at past weeks with notes + retros.
- **Mobile-first** — Primary actions (check tasks, mark done, add notes) on phone. Deeper work (profile editing) on desktop.
- **ICPs (2+)** — Multiple ICPs per project. Each with own pain points, triggers, channels. Future "Draft this" uses ICP selection for targeting.
- **Do's & Don'ts** — Explicit brand rules on Profile page. Feed into future content drafting.
- **Original strategy absorbed** — 10-section Opus output decomposed into tasks, theme, competitive context. User never reads a document.
- **"Draft this" deferred** — Not tied into task system. Can bolt on later.
- **Business profiles as separate table** — `business_profiles` (one per project, not JSONB on users). Multi-project requires own table.

**4 views:**
1. **This Week** — Week theme + task cards (expandable: WHY + HOW) + What's Moving (analytics signals) + Weekly check-in
2. **Insights** — Placeholder for now. Future: analytics trends, landing page monitoring, SEO, competitive alerts
3. **Profile** — Business basics, ICPs, brand voice, do's/don'ts, competitors, goals
4. **Settings** — Account, subscription, integrations, notifications

**Next: Implementation.** Fire up ui-designer + frontend-design skill to build the new dashboard layout.

---

## Previous: Landing Page Roaster Shipped (Feb 2, 2026)

**Built and shipped `/tools/landing-page-roaster`** — sixth free tool. User enters URL + optional context, gets a brutally honest roast of their landing page with actionable fixes.

**Key design decisions:**
- **No email required** — URL + optional context only (2-step wizard). Dedup is per-URL, not per-email.
- **Roast tone** — Gordon Ramsay energy, not polite consultancy. Prompt quotes the page against itself, uses analogies that sting, scores consistently with tone.
- **Results page** — 2-col grid of `RoastCard` components grouped by severity (Fix these first / Should fix / Nice to fix), collapsible fix blocks, color-coded left borders (red/amber/blue).
- **Live feed** — Homepage shows last 10 completed roasts (domain, verdict, score, time ago). Feed cards link to results pages.
- **Shareable** — Share buttons (X + LinkedIn) + copy link on results page. Feed cards are clickable links.

**Cost:** ~$0.05-0.10 per roast (Tavily extract + Vultr screenshot + GPT-4.1-mini vision).

**Files created/modified:**
- `src/app/tools/landing-page-roaster/page.tsx` — full page rewrite (hero, 2-step form, live feed, dark upsell card)
- `src/app/api/landing-page-roaster/feed/route.ts` — NEW, GET endpoint for recent roasts
- `src/app/tools/landing-page-roaster/[slug]/results-client.tsx` — card redesign + share buttons
- `src/lib/ai/landing-page-roaster.ts` — prompt rewrite with roast energy
- `src/app/api/landing-page-roaster/route.ts` — email made optional, per-URL dedup
- `src/components/ui/SocialShareButtons.tsx` — added "roaster" source type

---

## Previous: Homepage Hero Redesign — Option B (Feb 2, 2026)

**Complete hero rewrite. Old animated chaos→clarity hero replaced with static two-column layout.**

**Problem**: Old hero had scroll-takeover animation (23 floating logos + 12 noise cards converging on scroll) + interactive 3-tab demo card. Session replays showed confusion: scroll down, get caught in animation, scroll back up, fiddle with card, bounce. 0.6% conversion rate (155 views → 1 click to /start in 30 days).

**New hero (Option B)**:
- **Headline**: "Everyone has marketing advice. **None of it** is about your business." (light/black weight contrast, thick orange underline on "None of it")
- **Subheadline**: "Boost researches your actual market — **real traffic data**, **real competitor strategies**, **real gaps** — and tells you exactly where to focus."
- **CTA**: "Show me my market" → `/start?free=true`
- **Trust line**: "Free · No signup · Takes 2 minutes"
- **Right column (desktop)**: Static visual — 12 scattered data fragment cards (GA, Semrush, Reddit, Instagram, Ahrefs, Google, YouTube, LinkedIn, Shopify, Facebook, Mailchimp + keyword pills) with convergence lines pointing to a clean Boost output card showing priorities + market opportunity score
- **Mobile**: Simplified 3-fragment + arrow + output card vertical stack
- **No scroll takeover, no animation hijacking, no floating chaos**

**PostHog tracking**: `hero_cta_clicked` with `variant: "option-b"` for comparison.

**Old hero archived**: `src/components/landing/_archive/HeroWithExplainer.tsx` + `HeroSummaryCard.tsx`

**Files changed**: `HeroWithExplainer.tsx` (full rewrite), `index.ts` (removed HeroSummaryCard export)

**Watch**: Homepage → /start conversion rate. Baseline is 0.6%. Any improvement on cold FB traffic is a win.

---

## Previous: /upgrade Conversion Page (Feb 1, 2026)

**Single conversion landing page at `/upgrade` — all free tools funnel here.**

All 5 free tool result pages now CTA to `/upgrade?from=<tool>` with personalized copy per source:
- Snapshot → `/upgrade?from=snapshot`
- Headline Analyzer → `/upgrade?from=headline`
- Target Audience Generator → `/upgrade?from=target-audience`
- Email Subject Scorer → `/upgrade?from=email-subject`
- Competitor Finder → `/upgrade?from=competitor-finder`

**Brief flow unchanged** — `LockedSections`/`FreePreviewPaywall` stay direct-to-Stripe (user already saw the pitch).

**Page layout:** Personalized hero → free vs paid feature comparison → testimonial → dark CTA block. If `audit` + `token` params present (Brief upgrade path), calls Stripe checkout inline. Otherwise links to `/start` with prefill.

**Files:**
- NEW: `src/app/upgrade/page.tsx`, `src/app/upgrade/UpgradeContent.tsx`
- EDITED: All 5 free tool `results-client.tsx` files + `ToolBoostPitch.tsx`

**Free tools status (6 built, 1 remaining):**
| Tool | Status |
|------|--------|
| Marketing Audit (Snapshot) | ✅ Shipped |
| Target Audience Generator | ✅ Shipped |
| Headline Analyzer | ✅ Shipped |
| Email Subject Scorer | ✅ Shipped |
| Competitor Finder | ✅ Shipped |
| /upgrade conversion page | ✅ Shipped |
| Landing Page Roaster | ✅ Shipped |

**What's NOT done yet:**
- ~~Landing Page Roaster~~ ✅ Shipped
- ~~Brief locks tactical sections behind Weekly upgrade~~ ✅ Shipped
- ICP (separate, comes with dashboard)

---

## Previous: Unified Scoring Across All 3 Tiers (Feb 1, 2026)

**All 3 product tiers now use the same 4-category scoring framework: Clarity / Visibility / Proof / Advantage.**

**Scoring framework** (from brand guardian research):
| Category | Weight | Grounded In |
|----------|--------|-------------|
| Clarity | 35% | Dunford positioning, Ries/Trout |
| Visibility | 25% | Sharp's mental/physical availability |
| Proof | 20% | Cialdini social proof, Keller brand equity |
| Advantage | 20% | Ritson competitive strategy |

**Files changed:** pipeline-agentic.ts, generate.ts, formatter-types.ts, marketing-audit.ts, BriefScoreGauge.tsx, InsightsView.tsx, LockedSections.tsx, results-client.tsx (snapshot)

---

## Previous: Headline Analyzer Free Tool + Dead Code Cleanup (Feb 1, 2026)

**Built `/tools/headline-analyzer`** — third free tool. User enters headline + optional business context + email, gets scored on clarity/specificity/differentiation/customer focus (0-100 each) + 3 rewrite suggestions.

**Key design decision: inline GPT, no Inngest.** Single GPT-4.1-mini call completes in 5-15s — Inngest overhead was adding 60s+ of unnecessary latency. API route runs GPT inline, saves result as `complete`, redirects to SSR results page. No polling needed.

**Cost:** ~$0.01-0.02 per run. No external APIs (no Tavily, no screenshots, no DataForSEO).

**Files created:**
- `src/lib/ai/headline-analyzer.ts` — GPT pipeline + output types
- `src/app/api/headline-analyzer/route.ts` — POST (inline GPT)
- `src/app/api/headline-analyzer/[slug]/route.ts` — GET (fetch by slug)
- `src/app/tools/headline-analyzer/page.tsx` — landing page (3-step wizard)
- `src/app/tools/headline-analyzer/layout.tsx` — SEO metadata
- `src/app/tools/headline-analyzer/[slug]/page.tsx` — results SSR
- `src/app/tools/headline-analyzer/[slug]/results-client.tsx` — results display

**Also done:**
- Dead code cleanup: removed `generatePositioningPreview`, `buildPositioningPreviewPrompt`, `buildPositioningPreviewUserMessage`, `FREE_AUDIT_MODEL`, `PREVIEW_MODEL`, `PREVIEW_MAX_TOKENS` from `generate.ts`; removed `runTavilyOnlyResearch` from `research.ts`; deleted `scripts/test-free-models.ts`
- Added headline-analyzer + target-audience-generator to sitemap.ts
- Cross-links updated on all 3 free tool pages

---

## Previous: Free Brief Results Page Redesign (Feb 1, 2026)

**Complete UI overhaul of the free Brief results page.** Went from single narrow column to a 5-zone wide layout with proper visual hierarchy, typography consistency, and conversion flow.

**New layout (FreeInsightsView, max-w-6xl):**
- **Zone 1**: Positioning verdict (3/5) + diagnostic score gauge (2/5) — side-by-side
- **Zone 2**: Positioning gap (open typography, 3/5) + 3-second test (card, 2/5)
- **Zone 3**: Quick wins — 3 ranked cards with overlapping rank badges (#1 in CTA orange)
- **Zone 4**: Competitive landscape — thick left border blocks, side-by-side grid
- **Transition**: Dark `bg-foreground` card with h2 + CTA (left) and checkmarks (right)
- **Zone 5**: Locked skeleton sections (priorities, discoveries, market pulse, metrics)
- **Bottom**: Existing paywall as safety net for scrollers

**Key changes:**
- `PositioningSummaryV2` added to free page (was only on paid dashboard)
- `CompetitiveLandscapeFree` — new component replacing traffic bar chart with strategic intelligence (positioning, weakness, opportunity per competitor)
- `UrgencyHook` removed — redundant with competitive landscape section
- `QuickWins` redesigned with PriorityCards-style overlapping rank badges, #1 gets CTA accent
- `ThreeSecondTest` simplified — removed verdict badge and border-l decorations
- `PositioningGap` — no card, open typography with bold disconnect statement
- `LockedSections` — dark transition block with h2, CTA button, checkmark list; now accepts freeAuditId + token for inline checkout
- `MagicLinkBanner` — dismiss persists to localStorage
- `ResultsHeader` — widened to max-w-6xl
- Typography audit: consolidated to consistent system (10px mono labels, 15px body, consistent opacity)
- Accessibility fix: body text changed from text-foreground/70 to text-foreground (WCAG AA compliance)

**Files changed:**
- `src/components/results/free/FreeInsightsView.tsx` — 5-zone layout orchestrator
- `src/components/results/free/CompetitiveLandscapeFree.tsx` — NEW, replaces CompetitiveComparison
- `src/components/results/free/QuickWins.tsx` — rank badges, no impact/time badges
- `src/components/results/free/ThreeSecondTest.tsx` — simplified, no verdict badge
- `src/components/results/free/PositioningGap.tsx` — open typography, no card
- `src/components/results/free/LockedSections.tsx` — dark transition block with CTA
- `src/components/results/free/BriefScoreGauge.tsx` — compact layout in card
- `src/components/results/free/UrgencyHook.tsx` — removed from page (file still exists)
- `src/components/results/MagicLinkBanner.tsx` — localStorage persist
- `src/components/results/ResultsHeader.tsx` — max-w-6xl
- `src/components/results/dashboard/PositioningSummaryV2.tsx` — flattened to single column for 3/5 grid

**Process note:** UI designer provides suggestions only, then implement using frontend-design skill. UI designer should never write code directly.

---

## Previous: Facebook Ad Campaign Live (Feb 1, 2026)

**4 Facebook ad variations running at $20/day** pointing to `/free-audit` landing page. Previous generic traffic ad stopped.

**Landing page (`/free-audit`):**
- Zero-nav, single-purpose conversion page for cold Facebook traffic
- Two-column desktop: headline + CTA (left), mock results page with CSS mask fade (right)
- Mobile: stacked with simplified score card
- CTA sends to `/start?free=true&source=fb-ad` — same existing free Brief flow, no new API
- PostHog tracking: `free_audit_landing_viewed`
- Commit: `554a04d`

**What to watch:** Landing page → /start conversion rate (target: 15-25%), which ad copy wins, cost per completed free Brief. After 100 completed audits, build lookalike audience.

---

## Previous: WS1 Free Brief — Agentic Pipeline Redesign Complete (Feb 1, 2026)

**Free Brief completely redesigned.** Replaced one-shot Sonnet with agentic Sonnet pipeline (search + SEO tools). "Landing page as lens into strategy" positioning.

**Pipeline:** Agentic Sonnet 4 with search + SEO tools, 5 tool calls max, screenshot upfront. Cost ~$0.10-0.15.

**What's NOT done yet:**
- Single conversion page not started

**WS1 doc**: `projects/ws1-free-tool-funnel.md`

---

## Previous: WS5 Dev Infrastructure Complete (Feb 1, 2026)

**Dev infrastructure is ready.**

- Supabase branching verified: created `dev-test` branch, all 31 migrations applied, all 12 tables present, deleted branch
- Branch cost: $0.01344/hr (~$0.32/day). Create when needed, delete when done.
- Fixed migration compatibility: patched `fix_rls_and_security_advisors` to use `IF EXISTS` on DROP statements (policies were manually created on prod, didn't exist on fresh branches)
- Stripe: production uses `sk_live_` keys, swap to `sk_test_` for branch work. `.env.example` updated.
- Vercel preview deployments already configured — no changes needed
- **WS5 doc**: `projects/ws5-dev-infrastructure.md` — all action items checked off

---

## Previous: Scoring Added to Free Marketing Audit (Feb 1, 2026)

**WS1 progress — diagnostic scoring shipped on Boost Snapshot (marketing audit).**

Added 0-100 scores (overall + per-category: Clarity, Customer Focus, Proof, Ease) to the free marketing audit. AI scores each lens alongside findings. Results page shows score gauge (SVG arc) integrated with the silent killer hero card, category breakdown in compact rows. Backward compatible — old audits without scores still render.

**Key design decisions:**
- Score gauge uses semi-circular arc (CSS/SVG, no library) — reads as "score" not "random number"
- "Friction" renamed to "Ease" — high score = good, no confusion
- Score + silent killer combined in one hero card (score left, text right with vertical divider)
- Category scores as compact label/number rows under the gauge
- Branding watermark for screenshot shareability
- 3-Second Test explainer added to processing/pending screen

**Files changed:** `src/lib/ai/marketing-audit.ts` (schema, prompt, validation), `results-client.tsx` (UI), `page.tsx` (type)

**WS1 checklist update:** ✅ Diagnostic scoring on Snapshot. Next: scoring on Brief, then single conversion page.

---

## Previous: V2 Master Plan Created (Feb 1, 2026)

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

**Build order**: WS5 → WS1 → WS2 (includes basic Draft This) → WS3+WS4 in parallel.

**WS5 is next**: Set up dev infrastructure (feature branches, Supabase branching, Stripe test mode), then start building.

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
