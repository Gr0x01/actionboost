---
Last-Updated: 2026-01-19
Maintainer: RB
Status: Setup
---

# Quickstart: Actionboo.st

## Current State

- **Status**: Setup - Initial project scaffolding complete
- **Goal**: One-off growth hacker mini app

---

## What's Happening

Initial project setup complete. Next.js 16 with React 19, TypeScript, Tailwind CSS 4, and Supabase integration ready.

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
npm run test:e2e:debug   # Debug mode
```

---

## Phase Checklist

- [x] Project setup (Next.js, Supabase, etc.)
- [ ] Define app features and data schema
- [ ] Database schema design
- [ ] Core pages implementation
- [ ] Data pipeline setup (if needed)
- [ ] Launch MVP

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# External APIs (as needed)
OPENAI_API_KEY=...

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

---

## Repository

GitHub: https://github.com/Gr0x01/actionboost
