# Current: Cart Abandonment Recovery

## Latest Update: Auto Free Audit for Abandoned Checkouts

**Completed Jan 21, 2026** - Capture email before checkout, send free audit when they abandon.

### The Problem
Users who clicked $9.99 but didn't complete Stripe checkout were lost. We had no way to follow up because we only collected email at Stripe (after they left).

### Solution
1. **Email question before checkout** - New form step (optional, skippable) asks "Where should we send your strategy?"
2. **Pre-fill Stripe checkout** - Email passes to Stripe via `customer_email`
3. **Cart abandonment webhook** - When `checkout.session.expired` fires:
   - Check if user already has free audit (send recovery email if so)
   - Create free audit with `source: 'abandoned_checkout'`
   - Run free pipeline (Opus + Tavily)
   - Send "We saved something for you" email with free results

### Technical Details
- New `EmailInput` component (brutalist styling, validation feedback)
- Email stored in Stripe metadata as `form_email`
- `free_audits.source` column: `'organic'` vs `'abandoned_checkout'`
- Pipeline checks source to send appropriate email template
- Duplicate prevention via normalized email check

### Files Changed
- `src/lib/types/form.ts` - added email field
- `src/components/forms/EmailInput.tsx` - new component
- `src/app/start/page.tsx` - email question (step 7 of 8)
- `src/app/api/checkout/create-session/route.ts` - customer_email + metadata
- `src/app/api/webhooks/stripe/route.ts` - expired session handler
- `src/lib/email/resend.ts` - `sendAbandonedCheckoutEmail()`
- `src/lib/ai/pipeline.ts` - conditional email based on source

### Cost Impact
- ~$0.07 per abandoned checkout (Opus + Tavily)
- Potential $9.99 recovery per user

---

## Previous: Free Mini-Audit Extended ✅

**Completed Jan 21, 2026** - Extended free mini-audit to prove value before paywall.

### The Change
Free mini-audit now shows 4 sections instead of 3:
1. Executive Summary
2. Your Situation
3. Competitive Landscape
4. **Channel Strategy** (new)

This gives users enough to see we know their specific business/channels - the proof point - without giving away the implementation playbook (Stop/Start Doing, This Week, Roadmap, etc.).

### Technical Details
- `MINI_MAX_TOKENS`: 2000 → 3000
- Added Channel Strategy section to `buildMiniSystemPrompt()`
- Updated upsell text to exclude Channel Strategy from "what you'll get"

### Cost Impact
- Free run: ~$0.07 (Opus + Tavily)
- Still acceptable for lead generation

---

## Previous: Relaxed AI Context Limits ✅

**Completed Jan 21, 2026** - Increased context sent to Claude to improve output quality.

### The Problem
At $9.99/run with ~$0.50 cost, we were aggressively truncating context (150-300 chars) to save pennies. This degraded output quality unnecessarily.

### Changes Made

| Setting | Old | New | File |
|---------|-----|-----|------|
| MAX_TOKENS | 8000 | 12000 | generate.ts |
| Traction snapshots | 200 | 500 chars | generate.ts |
| Tactics tried | 150 | 400 chars | generate.ts |
| Past recommendations | 300 | 600 chars | generate.ts |
| Past insights | 300 | 600 chars | generate.ts |
| Competitor insights | 300 | 500 chars | generate.ts |
| Market/growth trends | 200 | 400 chars | generate.ts |
| Previous output summary | 400 | 800 chars | generate.ts |
| Tavily maxResults | 5 | 7 | research.ts |
| Ranked keywords | 10 | 15 | research.ts |
| Past insights RAG | 3 | 5 | pipeline.ts |
| Tactics displayed | 10 | 15 | pipeline.ts |

### Cost Impact
- Typical run: ~$0.50 → ~$0.60
- Margin remains 85-94%

### What Stayed the Same
- Competitor limit: 3 (appropriate)
- Historical storage: 10 traction snapshots, 50 tactics
- Stripe metadata: 500 chars (just backup)

---

## Previous: "Tell Us More" Refinement Feature

**Completed Jan 21, 2026** - Users can now refine their strategy with additional context.

### The Problem (from dogfooding)
Users get their strategy, read through it, and realize "No, we already tried that" or "We have that feature." The AI made assumptions based on limited info, making the output feel less tailored.

### Solution
1-2 free refinements per $9.99 purchase. User provides additional context, we re-generate the full strategy with that info incorporated.

### Strategic Decisions (from growth-hacker)
- **Naming**: "Tell Us More" - frames as information gap, not AI error
- **Placement**: Subtle, end of results page - safety net, not headline feature
- **Pre-purchase**: Don't advertise refinements - let it be discovered as over-delivery
- **Narrative**: "More context = better output" not "fix our mistakes"
- **Subscription bridge**: Track refiners as PQLs for $29/mo upsell

### What Was Built

**Database Changes**:
- `runs.refinements_used` (INTEGER DEFAULT 0) - count per original run
- `runs.additional_context` (TEXT) - user's refinement input
- `runs.parent_run_id` (UUID) - links refinement to original run

**API**:
- `POST /api/runs/[runId]/add-context` - creates refinement run, triggers pipeline

**Pipeline**:
- `runRefinementPipeline()` in `pipeline.ts` - similar to main but fetches parent output
- `generateRefinedStrategy()` in `generate.ts` - includes refinement prompt + previous output summary

**UI**:
- `AddContextSection` component - collapsible form at bottom of results page
- Shows remaining count: "1 of 2 remaining"
- Brutalist styling matching existing design system

### Files Changed
- `src/lib/types/database.ts` - new columns + constants
- `src/lib/ai/pipeline.ts` - added `runRefinementPipeline()`
- `src/lib/ai/generate.ts` - added `generateRefinedStrategy()` + refinement prompt
- `src/app/api/runs/[runId]/add-context/route.ts` - new endpoint
- `src/app/api/runs/[runId]/route.ts` - include refinements_used in response
- `src/components/results/AddContextSection.tsx` - new component
- `src/components/results/index.ts` - export new component
- `src/app/results/[runId]/page.tsx` - integrate AddContextSection

### Cost Impact
- Each refinement: ~$0.30-0.50 (full Opus 4.5 + research)
- Max 2 refinements = up to $1.00 additional per $9.99
- Margin: ~80% instead of ~90%
- Trade-off: Higher perceived value, better subscription conversion

---

## Bug Fix: Returning User Context Updates Not Applied

**Fixed Jan 21, 2026** - Context delta from returning users was being ignored.

### The Problem
When a returning user clicked "Continue with updates" in the WelcomeBack flow and provided "what's new" text, that context delta was:
1. Collected by `ContextUpdateForm`
2. Sent to the API in the request body as `contextDelta`
3. **But completely ignored** - only used as a boolean for validation relaxation

The AI was generating strategies without seeing the user's updates.

### Root Cause
In all three run creation routes (`create-with-credits`, `create-with-code`, Stripe webhook), the `contextDelta` was received but never stored or merged into `users.context`.

### The Fix
Before creating the run, merge `contextDelta` into `users.context` using `mergeContextDelta()`:
- Sets `contextDelta` as `tractionDelta` in the delta object
- This adds it to `traction.history` and `traction.latest`
- The pipeline's `retrieveUserHistory()` then sees the updated context

### Files Changed
- `src/app/api/runs/create-with-credits/route.ts` - merge context before run creation
- `src/app/api/runs/create-with-code/route.ts` - merge context before run creation
- `src/app/api/checkout/create-session/route.ts` - pass `context_delta` in Stripe metadata
- `src/app/api/webhooks/stripe/route.ts` - read metadata and merge context before run creation

---

## Previous: Hero Flow + Checkout Fix ✅

**Completed Jan 21, 2025** - Fixed broken form flow and removed stale feature flag.

### Issues Fixed

1. **Hero skipped website URL** - Hero prefill set `currentQuestion(2)`, skipping Q1 (website) entirely. Users from hero never got asked for their URL.
   - Fix: Changed to `currentQuestion(0)` so form starts at website question

2. **Checkout broken on production** - `NEXT_PUBLIC_PRICING_ENABLED=false` was set on Vercel, triggering "promo-code-only" mode. This:
   - Hid the $9.99 payment button
   - Hid the free mini-audit option
   - Showed a confusing disabled "Enter code" button
   - **Lesson learned**: Feature flags left in production after testing will bite you

### What Was Removed
- `pricingEnabled` flag from `src/lib/config.ts`
- All `config.pricingEnabled` conditionals from CheckoutSection
- Entire waitlist fallback UI (was only for promo-code-only mode)
- Feature Flags section from `architecture.md`

### Files Changed
- `src/app/start/page.tsx` - Hero prefill starts at Q1, added `checkoutSource` for back navigation
- `src/components/forms/CheckoutSection.tsx` - Removed feature flag logic, simplified checkout
- `src/lib/config.ts` - Removed `pricingEnabled`
- `src/components/landing/Pricing.tsx` - Removed conditional hide

---

## Previous: Share Page ✅

**Completed Jan 2025** - Public shareable links for action plans.

### What Was Built
- **Route**: `/share/[slug]` - Server-rendered public page
- **API**: `POST /api/runs/[runId]/share` - Generates 10-char slug, stores in `runs.share_slug`
- **UI**: Share button in ExportBar opens ShareModal with copy link + social buttons
- **Social**: OG tags for Twitter/Facebook previews
- **CTAs**: "Get Your Own Plan" banner + bottom CTA

### How It Works
1. User clicks "Share" on results page
2. If no slug exists, API generates one and saves to DB
3. Returns shareable URL: `actionboo.st/share/{slug}`
4. Public visitors see full results + conversion CTAs

### Files
- `src/app/share/[slug]/page.tsx` - Public share page (SSR)
- `src/app/api/runs/[runId]/share/route.ts` - Slug generation endpoint
- `src/components/results/ExportBar.tsx` - Share button trigger
- `src/components/results/ShareModal.tsx` - Copy link + social sharing UI
- `src/components/ui/SocialShareButtons.tsx` - Twitter/LinkedIn/Copy buttons

---

## Previous: Brutalist + Tactile Redesign ✅

**Completed Jan 2025** - New visual direction for landing page.

### What Was Built
- **Hero section**: Brutalist cards with harsh offset shadows, tactile button (lift on hover, squish on press)
- **FrameworksSection**: Same brutalist treatment, scroll-spy sidebar with left-border indicator
- **Visual direction established**: See `decisions.md` for full style guide

### Key Patterns
```
/* Brutalist card */
border-[3px] border-foreground bg-background shadow-[6px_6px_0_0_rgba(44,62,80,1)]

/* Tactile interaction */
hover:shadow-[6px_6px_0_0_...] hover:-translate-y-0.5
active:shadow-none active:translate-y-1
transition-all duration-100
```

### Files Changed
- `src/components/landing/Hero.tsx` - Brutalist form + CTA
- `src/components/landing/FrameworksSection.tsx` - Brutalist content cards, left-border nav

### Next: Apply to Results Page
- Wrap sections in brutalist frames
- Keep content readable (Tienne serif, max-w-prose)
- Tactile action buttons

---

## Previous: Resend Email Integration ✅

**Completed Jan 2025** - Branded transactional emails via Resend.

### What Was Built
- **Receipt emails**: Sent after every Stripe payment (credits-only and full runs)
- **Branded magic link template**: Configured in Supabase SMTP
- **Design**: Orange accent bar, bold typography, Source Sans 3 font

### Email Types
| Email | Trigger | Service |
|-------|---------|---------|
| Receipt | After Stripe payment | Resend API |
| Magic link | Auth requests | Supabase SMTP → Resend |

### Files
- `src/lib/email/resend.ts` - Resend client, receipt email, magic link template generator
- `src/app/api/webhooks/stripe/route.ts` - Sends receipt after payment

### Configuration
- Supabase SMTP configured with Resend credentials
- Sender: `team@actionboo.st`
- Magic link template pasted in Supabase Auth dashboard

---

## Previous: Form Refactor ✅

**Completed Jan 2025** - Extracted form components, added chatbot-like flow for returning users, updated to full AARRR framework.

### What Was Built
```
src/components/forms/
├── index.ts              # Barrel export
├── WelcomeBack.tsx       # Returning user welcome + ContextUpdateForm
├── ProgressBar.tsx       # Animated progress indicator
├── Acknowledgment.tsx    # Brief "Got it" animation between questions
├── UrlInput.tsx          # URL input with favicon preview
├── TextareaInput.tsx     # Auto-resize textarea
├── TractionInput.tsx     # Chip selection + freeform input
├── FocusInput.tsx        # AARRR grid (6 options with icons/hints)
├── UploadInput.tsx       # File upload (images, PDFs, spreadsheets)
├── CompetitorInput.tsx   # Multi-URL collector (up to 3)
├── CheckoutSection.tsx   # Promo code + submit
└── utils.ts              # formatDate helper
```

### Form Flow (8 Steps)
| Step | Question | Skippable |
|------|----------|-----------|
| 1 | What's your website? | ✅ |
| 2 | Tell me about your product... | |
| 3 | What traction do you have? | |
| 4 | What growth tactics have you tried? | |
| 5 | What's working? What's falling flat? | |
| 6 | Got any screenshots or data to share? | ✅ |
| 7 | Where should we focus? (AARRR) | |
| 8 | Any competitors I should study? | ✅ |

### State Machine
```
[loading] → [hasContext?]
              ├─ no → [questions] → [checkout]
              └─ yes → [welcome_back]
                         ├─ "Start fresh" → [questions]
                         └─ "Continue" → [context_update] → [checkout]
```

### AARRR Focus Areas (Updated)
- `acquisition` - "Get more users"
- `activation` - "Users don't stick"
- `retention` - "Users leave"
- `referral` - "Spread the word"
- `monetization` - "No revenue yet"
- `custom` - Free-form challenge input

### Key Changes
- **page.tsx**: 974 → 520 lines (extracted 12 components)
- **Font**: Manrope (was Space Grotesk)
- **Back navigation**: All steps have back button
- **File uploads**: Screenshots, analytics exports, spreadsheets (5 files, 10MB each)
- **Returning users**: See "Welcome back" with last run summary, can update context conversationally

---

## Previous: Legal Pages ✅

**Completed Jan 2025** - Privacy policy and terms of service with GDPR/CCPA compliance.

### Files
- `src/app/privacy/page.tsx` - Privacy policy
- `src/app/terms/page.tsx` - Terms of service

---

## Previous: Results Page Redesign ✅

**Completed Jan 2025** - Clean document style with Tienne serif font, max-w-prose for readability.

---

## Previous: RAG Integration ✅

**Completed Jan 2025** - Claude remembers returning users via pgvector search.

---

## Previous: Magic Link Auth ✅

**Completed Jan 2025** - Email magic links, dashboard, protected routes.

---

## What's Next

- Weekly automated runs (cron job for subscribed users)
- Google OAuth (optional)
