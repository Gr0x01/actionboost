# WS3: Execution Engine ("Draft This")

*Parent: v2-master-plan.md | Detailed design: subscription-brainstorm.md §11*

---

## Goal

When the strategy says "do X," the user clicks a button and gets a ready-to-use draft. Content is aligned to their ICP, thesis, and brand voice — not generic.

## Why This Matters

The founder's own behavior revealed this: gets the plan, sees "Post on r/SaaS," then uses a separate AI to draft it. The product should close that loop. This is also the key differentiator vs Landkit — their "Growth Engines" generate generic content from scraped pages. Boost generates content from deep business context + real market research.

## Content Types (Flexible by Design)

The strategy engine (Opus) recommends tactics. Each tactic maps to a content type. The execution engine handles whatever Opus recommends:

| Content Type | Examples | Complexity |
|---|---|---|
| **Social posts** | Reddit, Twitter/X, LinkedIn, Facebook | Low — short-form, high volume |
| **Direct messages** | Cold DMs, partnership outreach, community engagement | Low-medium — personalized |
| **Email** | Cold outreach, nurture sequences, newsletters | Medium |
| **Ad copy** | Facebook/Instagram ads, Google ads, LinkedIn ads | Medium |
| **Long-form** | Blog posts, SEO articles, case studies | Higher — outlines + sections |
| **Scripts** | Video/reel scripts, podcast outlines | Medium — structure + talking points |

### How It Works

```
Strategy says: "Post in r/SaaS about your launch"
    ↓
Task card shows: [Draft this] button
    ↓
Sonnet receives:
  - Task goal + strategic intent (from Opus plan)
  - Business profile (ICP, product, stage)
  - Brand voice guidelines
  - Target platform conventions (Reddit = conversational, LinkedIn = professional)
  - Past performance on this platform (if any)
    ↓
User gets: ready-to-post draft
    ↓
User edits, posts, marks done + optional outcome note
    ↓
Outcome feeds back into weekly re-vectoring
```

### Architecture

**Not a separate pipeline.** It's a Sonnet call with good context:

```
POST /api/drafts/generate
Body: {
  taskId: string,
  contentType: "reddit_post" | "dm" | "email" | "ad_copy" | "blog_outline" | ...,
  // Context pulled server-side from business profile + task + plan
}
Response: {
  draft: string,
  metadata: { wordCount, platform, tone }
}
```

**Prompt structure per content type:**
- System prompt: brand voice + platform conventions + output format
- User message: business context + task goal + ICP details + any past performance data
- Each content type gets a focused prompt template (not one giant prompt)

**Regeneration**: User can click "Try again" with optional feedback ("shorter", "more casual", "focus on the pain point"). Feedback appended to next generation.

### Model Choice

**Sonnet for all drafts.** Opus stays in the strategist seat. Sonnet with good context gets 80% there at ~$0.01-0.03 per draft. The user always edits before posting — perfection isn't the goal, useful first drafts are.

### Content Type Registry

Build this as a flexible registry, not hardcoded switch statements:

```typescript
// Conceptual — each content type is a config object
const contentTypes = {
  reddit_post: {
    label: "Reddit Post",
    promptTemplate: "...",
    platformGuidelines: "conversational, value-first, no self-promotion...",
    outputFormat: "title + body",
    maxLength: 2000,
  },
  cold_dm: {
    label: "Direct Message",
    promptTemplate: "...",
    platformGuidelines: "personal, specific, short...",
    outputFormat: "message",
    maxLength: 500,
  },
  // ... extensible
}
```

New content types = new config objects. No code changes needed for the generation pipeline itself.

### Task Type Classification

When Opus generates the weekly plan, each task gets tagged:
- **fully_draftable**: "Draft this" button → full content
- **partially_draftable**: "Get outline" button → structure + talking points
- **advisory**: Expanded guidance inline, no generation

The orchestrator (or Sprint Planner sub-agent) handles this classification. The execution engine only needs to know the content type.

## Depends On

- **WS2 Phase 1**: Business profiles (ICP, voice, context) must exist before drafts are useful
- **WS2 Phase 3**: Task tracking (tasks need to exist before "Draft this" buttons can appear)

## Cost

~$0.01-0.03 per draft (Sonnet). Even heavy users (10 drafts/week) = ~$1.60/mo. See subscription-brainstorm.md for full breakdown.

Unlimited drafts with basic rate limiting (10 regenerations per task per day). No credit system — adds friction for no margin protection.

## Definition of Done

- [ ] "Draft this" button on fully_draftable tasks
- [ ] At least 5 content types working (Reddit, Twitter, email, DM, ad copy)
- [ ] Context pulls from business profile + plan + task
- [ ] Regeneration with feedback
- [ ] Outcome tracking (draft generated → posted → result noted)

---

## Phase 2: Browser Extension (Post-WS3 Launch)

**Subscribers only.** A lightweight Chrome extension that acts as a task helper — not a standalone product.

### UX Flow

```
User is on Reddit/Twitter/LinkedIn/etc
    ↓
Sees a thread they want to respond to (or want to post)
    ↓
Copies the relevant text from the page
    ↓
Pastes into extension popup
    ↓
Extension sends: pasted text + user's ICP/voice from business profile
    ↓
Sonnet generates a contextual response
    ↓
User copies the draft, pastes it back, edits, posts
```

No page scraping, no content injection, no platform-specific DOM manipulation. Just a clipboard-in, clipboard-out helper with business context.

### Why This Is Cheap to Build

- Hits the same `/api/drafts/generate` endpoint from WS3
- Business profile (ICP, voice, product) already exists from WS2
- Auth via Supabase session token (user is already logged in)
- No complex permissions — extension doesn't read page content automatically
- Thin UI: text input, generate button, output area, copy button

### What the Extension Adds Over Dashboard

The pasted text IS the context. The extension auto-detects platform tone from the input (Reddit = conversational, LinkedIn = professional) and combines with the user's ICP/voice. No need to navigate back to dashboard, find the task, click "Draft this."

### Build Scope

- Chrome extension (Manifest V3)
- Popup UI: paste input → generate → copy output
- Optional: tone/platform selector if auto-detect isn't enough
- Auth: check active subscription via Supabase
- Single API call to existing drafts endpoint

### Definition of Done

- [ ] Chrome extension published (unlisted or public)
- [ ] Paste → generate → copy flow working
- [ ] Pulls ICP + voice from business profile
- [ ] Subscriber-only gate
- [ ] Works for any platform (no platform-specific code)
