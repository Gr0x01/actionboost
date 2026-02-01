# WS4: Integrations (GSC, GA4, Future)

*Parent: v2-master-plan.md*

---

## Goal

Connect real performance data so the strategy loop adapts based on actual metrics, not just self-reported outcomes.

## Why

- Landkit already has GA4 + Search Console integration — table stakes for a marketing co-pilot
- Self-reported task outcomes are noisy. Actual traffic/ranking/conversion data is signal.
- "Connect your data, get smarter recommendations" is a natural retention hook
- Grayed-out integration slots in the dashboard already tease this (current design)

## Priority Order

### 1. Google Search Console (First)

**Why first**: Most directly actionable for the ICP. Shows keyword rankings, impressions, clicks. Tells the strategy engine "your SEO articles are ranking for X but not Y" — concrete input for re-vectoring.

**Scope**:
- OAuth2 with Google (read-only `webmasters.readonly` scope)
- Pull: top queries, page performance, click-through rates, impressions
- Feed into weekly re-vectoring context
- Surface in dashboard: "Your top keywords this week" widget

**Technical**:
- Google OAuth2 flow (consent screen, callback, token storage)
- `googleapis` npm package for Search Console API
- Refresh token stored encrypted in Supabase
- Inngest scheduled job to pull data (daily or weekly)

### 2. Google Analytics 4

**Why second**: Broader picture — traffic sources, user behavior, conversions. Complements GSC.

**Scope**:
- Same OAuth2 flow (add `analytics.readonly` scope)
- Pull: traffic by source, top pages, conversion events, user demographics
- Feed into re-vectoring: "Reddit is driving 40% of your traffic this week"

### 3. Future (Post-Launch)

In order of likely value:
- **PostHog / Mixpanel**: Product analytics for SaaS users (activation, retention funnels)
- **Stripe**: Revenue data correlation with marketing efforts
- **Social platform APIs**: Engagement metrics from where they're posting
- **Email platforms**: Open rates, click rates for email campaigns

## Architecture

```
User connects integration
    ↓
OAuth flow → store refresh token (encrypted)
    ↓
Inngest scheduled job pulls data → stores in integration_data JSONB
    ↓
Weekly re-vectoring: orchestrator receives integration summary
    ↓
Dashboard: widgets show key metrics
```

**Data storage**: JSONB column on a new `integration_data` table or on the subscription record. Don't over-normalize — the data is a snapshot for context, not a full analytics warehouse.

**Privacy**: Read-only access. Clear consent screen. Users can disconnect anytime. Data deleted on account deletion.

## Depends On

- **WS2**: Subscription must exist (integrations are a subscriber feature)
- **WS5**: Supabase branching for schema changes

## Open Questions

- Do we need a separate Supabase table for integration credentials, or JSONB on users?
- How much historical data to pull on first connect? (30 days? 90 days?)
- Rate limiting on Google API calls per user

## Definition of Done

- [ ] Google OAuth2 flow working
- [ ] GSC data pulling and displaying in dashboard
- [ ] Integration data feeding into weekly re-vectoring context
- [ ] GA4 integration working
- [ ] Users can connect/disconnect integrations
