# Current: Landing Page Visual Refresh

## Latest Update: Brutalist + Tactile Redesign ✅

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
- Sender: `hello@actionboo.st`
- Magic link template pasted in Supabase Auth dashboard

---

## Previous: Feature Flag + Waitlist ✅

**Completed Jan 2025** - Feature flag to disable pricing for promo-code-only testing, with waitlist fallback.

### What Was Built
- **Feature flag**: `NEXT_PUBLIC_PRICING_ENABLED` env var
  - `true` (default) = normal pricing
  - `false` = promo-code-only mode
- **Waitlist table**: `waitlist` (email, source, created_at) with RLS
- **Waitlist API**: `POST /api/waitlist` with source validation
- **Landing page**: Hides prices and "See pricing" when flag off
- **CheckoutSection**: Shows code input by default, waitlist form on code failure

### User Flow (pricing disabled)
```
Landing (no prices) → /start form → Checkout (code required)
                                        ↓
                        Code valid → email → run executes
                        Code fails → waitlist signup
```

### Waitlist UI
- "We're launching this week! Join the waitlist to get notified."
- Success: "You're on the list! We'll be in touch soon."
- "Try another code" option to retry

### Files
- `src/lib/config.ts` - Feature flag utility
- `src/app/api/waitlist/route.ts` - Waitlist signup endpoint
- `src/components/forms/CheckoutSection.tsx` - Promo-only mode + waitlist
- `src/components/landing/Hero.tsx` - Conditional pricing
- `src/components/landing/Pricing.tsx` - Hide when disabled

### Export Waitlist
```sql
SELECT email, source, created_at FROM waitlist ORDER BY created_at;
```

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
- Share page route `/share/[slug]` (public view without auth)
- Google OAuth (optional)
