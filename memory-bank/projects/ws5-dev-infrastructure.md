# WS5: Dev Infrastructure ✅ COMPLETE

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

**Cost**: $0.01344/hr (~$0.32/day, ~$9.70/mo if left running). Create when needed, delete when done.

**How to use it**:
- Create a Supabase branch when starting schema work
- Write migrations on the branch, test them
- Merge branch → migrations apply to production
- Branch DB is disposable — seed with test data as needed

**What this means for development**:
- Schema changes are safe to experiment with
- No risk of breaking production data
- Migrations are validated before hitting prod

**Migration fix applied**: Patched `fix_rls_and_security_advisors` migration to use `DROP POLICY IF EXISTS` and `DROP FUNCTION IF EXISTS` — original had `DROP POLICY` without `IF EXISTS` for policies that were manually created on prod, causing branch creation to fail.

### 3. Vercel Preview Deployments + GitHub Integration

Already configured. Each git branch gets a preview URL. GitHub connected to Supabase — PRs auto-create preview branches with isolated databases.

**Env var strategy**:
- Production: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` point to production
- Preview: Supabase + Vercel integration auto-injects branch DB credentials into preview deployments

### 4. Stripe Test Mode

- All subscription development uses Stripe test mode
- Production `.env.local` has `sk_live_` keys — swap to `sk_test_` for branch work
- `.env.example` updated with guidance comment
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

- [x] Verify Supabase project has branching enabled (Pro plan confirmed)
- [x] Test creating + merging a Supabase branch (created, verified 12 tables + all migrations, deleted)
- [x] Confirm Vercel preview deployments can connect to Supabase branch DBs (already configured)
- [x] Set up Stripe test mode keys in `.env.local` (live keys in prod, guidance added to .env.example)
- [x] Document branch naming convention for team of one (ws1/, ws2/, etc.)
- [x] Fix migration compatibility for branching (patched DROP POLICY IF EXISTS)
