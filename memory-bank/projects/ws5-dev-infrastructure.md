# WS5: Dev Infrastructure

*Parent: v2-master-plan.md*

---

## Goal

Ship subscription features safely. Feature branches + Supabase branching. No separate staging project.

## Why

The subscription platform (WS2) involves significant schema changes, new tables, and new Stripe flows. Developing all of this on main against production DB is risky. But a full staging environment is overkill for a solo dev.

**The middle ground**: Git feature branches + Supabase branching + Vercel preview deployments.

## Setup

### 1. Git Feature Branches

```
main (production)
  ├── ws1/free-tool-funnel
  ├── ws2/subscription-platform
  ├── ws2/business-profiles
  ├── ws3/execution-engine
  └── ws4/integrations
```

- All WS work happens on feature branches
- PR to main when ready to ship
- Vercel auto-deploys preview URLs per branch (already configured with Vercel)

### 2. Supabase Branching

Supabase branching creates an isolated database for each branch. Migrations from production are applied, but production data doesn't carry over.

**How to use it**:
- Create a Supabase branch when starting schema work
- Write migrations on the branch, test them
- Merge branch → migrations apply to production
- Branch DB is disposable — seed with test data as needed

**What this means for development**:
- Schema changes are safe to experiment with
- No risk of breaking production data
- Migrations are validated before hitting prod

**Cost**: Check via `get_cost` MCP tool before creating branches. Branches are billed hourly.

### 3. Vercel Preview Deployments

Already configured. Each git branch gets a preview URL. Connect preview URLs to Supabase branch databases using branch-specific env vars.

**Env var strategy**:
- Production: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` point to production
- Preview: Override with Supabase branch credentials (set in Vercel branch env vars or via Supabase GitHub integration)

### 4. Stripe Test Mode

- All subscription development uses Stripe test mode
- Test API keys in `.env.local` and preview deployments
- Production Stripe keys only on `main` deployment
- Use Stripe test clocks for subscription lifecycle testing

## Process

```
Start feature work:
  1. git checkout -b ws2/business-profiles
  2. Create Supabase branch (if schema changes needed)
  3. Write code + migrations on branch
  4. Test on localhost against Supabase branch DB
  5. Push → Vercel preview deployment
  6. Test preview deployment
  7. PR to main → review → merge
  8. Supabase branch auto-merges migrations to production
  9. Delete branch
```

## What NOT to Set Up

- No separate Supabase staging project (branching covers it)
- No separate Vercel project for staging
- No CI/CD pipeline beyond what Vercel already does
- No Docker or containerization

## Action Items

- [ ] Verify Supabase project has branching enabled (requires Pro plan)
- [ ] Test creating + merging a Supabase branch
- [ ] Confirm Vercel preview deployments can connect to Supabase branch DBs
- [ ] Set up Stripe test mode keys in `.env.local`
- [ ] Document branch naming convention for team of one (keep it simple)
