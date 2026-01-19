---
Last-Updated: YYYY-MM-DD
Maintainer: RB
Status: Setup
---

# Quickstart: [PROJECT_NAME] Directory

## Current State

- **Status**: Setup
- **Goal**: [DESCRIBE THE DIRECTORY'S PURPOSE]

---

## What's Happening

[BRIEF DESCRIPTION OF CURRENT PHASE]

---

## Key Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run type-check       # TypeScript verification

# Testing
npm run test:e2e         # Playwright tests
npm run test:e2e:ui      # Interactive mode
```

---

## Phase Checklist

- [ ] Project setup (Next.js, Supabase, etc.)
- [ ] Database schema design
- [ ] Core pages implementation
- [ ] Data pipeline setup
- [ ] Initial data seeding
- [ ] Launch MVP

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# External APIs (as needed)
# OPENAI_API_KEY=...
# TAVILY_API_KEY=...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| `development/activeContext.md` | Current focus + next steps |
| `development/progress.md` | Work log |
| `architecture/techStack.md` | Technology decisions |
