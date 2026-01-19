# Current: Phase 3 - Landing + Input Form

## Goal
Build the user-facing form to collect context for strategy generation.

---

## Previous Phase: AI Pipeline ✅

**Completed Jan 2025** - Core pipeline working with real data.

### What Was Built
```
src/lib/ai/
├── types.ts      # RunInput, ResearchContext, FocusArea types
├── research.ts   # Tavily web search + DataForSEO competitor metrics
├── generate.ts   # Claude Opus 4.5 with inlined prompts
└── pipeline.ts   # Orchestrator with DB integration
```

### Key Decisions
- **Inlined prompts** - No external file dependency, prompts live in `generate.ts`
- **AARRR focus areas** - Users pick their biggest challenge:
  - `acquisition` - "How do I get more users?"
  - `activation` - "Users sign up but don't stick"
  - `retention` - "Users leave after a few weeks"
  - `referral` - "How do I get users to spread the word?"
  - `monetization` - "I have users but no revenue"
  - `custom` - Free-form input
- **Graceful degradation** - Research fails → proceed with limited context
- **Promise.race timeouts** - Proper abort handling for Tavily

### Performance
- Research: ~6-20s (parallel Tavily + DataForSEO)
- Generation: ~100-120s
- Total: ~2 minutes
- Cost: ~$0.12-0.15 per run
- Output: ~20k chars, 400+ lines, 8 structured sections

### Test Scripts
```bash
npx tsx scripts/test-pipeline.ts   # ActionBoost example
npx tsx scripts/test-inkdex.ts     # Real project test
```

---

## Phase 3 Scope

### Pages to Build

**`/` - Landing Page**
- Hero: "One-shot AI growth strategist for stuck founders"
- Value prop: Live research + Claude Opus 4.5 → personalized strategy
- Social proof (when available)
- CTA → `/start`

**`/start` - Input Form**
- Multi-step or single-page form
- Fields from RunInput type:
  - Product description (required)
  - Current traction (required)
  - What you've tried (required)
  - What's working (required)
  - Focus area (AARRR selector, required)
  - Competitor URLs (optional, multi-input)
  - Your website URL (optional)
  - Constraints (optional)
- localStorage persistence (user can leave and return)
- Preview/confirm before checkout
- CTA → checkout flow (Phase 5)

### Components Needed
```
src/components/
├── forms/
│   ├── StrategyForm.tsx      # Main form wrapper
│   ├── FocusAreaPicker.tsx   # AARRR radio/cards
│   └── CompetitorInput.tsx   # Multi-URL input
└── ui/
    └── (use shadcn/ui components)
```

### Form Field Details

| Field | Type | Required | Placeholder/Help |
|-------|------|----------|------------------|
| productDescription | textarea | Yes | "What does your product do? Who is it for?" |
| currentTraction | textarea | Yes | "Users, revenue, traffic - whatever you've got" |
| whatYouTried | textarea | Yes | "What marketing/growth tactics have you attempted?" |
| whatsWorking | textarea | Yes | "What's showing promise, even small wins" |
| focusArea | select | Yes | AARRR options |
| customFocusArea | text | If custom | "What's your biggest challenge?" |
| competitorUrls | multi-text | No | "tattoodo.com, inkstinct.co" |
| websiteUrl | url | No | "https://yourproduct.com" |
| constraints | textarea | No | "Budget, time, team size, technical limits" |

---

## Tasks

- [ ] Set up shadcn/ui components (Button, Input, Textarea, Card, etc.)
- [ ] Create landing page with hero and CTA
- [ ] Build FocusAreaPicker component with AARRR options
- [ ] Build main StrategyForm with all fields
- [ ] Add localStorage persistence for form state
- [ ] Add form validation (Zod schema)
- [ ] Create /start page with form
- [ ] Mobile-responsive layout

---

## Done When

- [ ] User can fill out complete form on `/start`
- [ ] Form persists to localStorage on change
- [ ] Focus area selection works with custom option
- [ ] Form validates before allowing submit
- [ ] Mobile experience is solid
