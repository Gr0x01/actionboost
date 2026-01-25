# Boost SEO Plan

**Created**: Jan 26, 2026
**Status**: Active
**Goal**: Drive organic traffic from tech-adjacent entrepreneurs (SaaS founders, solopreneurs, e-commerce)

---

## The Core Insight

Enji.co (closest competitor) has 4 years, 12 people, polished marketing, tons of features — and only **1,537 monthly organic visits**. Features don't win this market. Distribution does.

Your `/in-action` pages are your unfair advantage: real outputs, specific to industries, can rank for exact-match searches that template-based competitors can't serve.

---

## Strategy Overview

### Three Pillars

1. **Weaponize /in-action pages** — Each example = potential keyword rank
2. **Build programmatic SEO** — Industry-specific landing pages at scale
3. **Establish topical authority** — Problem-focused content your audience searches for

### The Flywheel

```
More examples → More keywords → More traffic → More customers → More examples
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Navigation & Discoverability [DONE]

- [x] Add "See the Output" to main nav (between How It Works and Pricing)
- [x] Update gallery page metadata for SEO
- [x] Update detail page metadata pattern: "[Industry] Marketing Plan Example | Boost"

### 1.2 Sitemap Optimization

- [x] Bump /in-action example priority from 0.6 → 0.8
- [x] Add `generateStaticParams` to /in-action/[slug] with ISR (revalidate hourly)

### 1.3 Create Initial Examples

Target industries with search volume:

| Industry | Target Keyword | Priority |
|----------|---------------|----------|
| SaaS (B2B) | "saas marketing plan example" | High |
| Shopify/E-commerce | "shopify store marketing plan" | High |
| Consulting/Coaching | "consultant marketing plan example" | High |
| Digital Agency | "agency marketing plan template" | Medium |
| Newsletter/Creator | "newsletter marketing strategy" | Medium |

**Goal**: 5-7 live examples by end of Phase 1

### 1.4 Example Card Enhancement

Make examples feel discovered, not prescribed:

- Add business type specificity (not just "SaaS" but "B2B email productivity tool")
- Add "key finding" field that sounds researched ("Competitor's #1 traffic source? A 2-year-old blog post")
- Consider "challenge" field ("Pre-launch SaaS struggling to find first 100 users")

---

## Phase 2: Content Infrastructure (Week 3-4)

### 2.1 Pillar Page: Marketing Plan Guide

**URL**: `/marketing-plan-guide` or `/guide`

**Structure**:
1. What a marketing plan should include
2. Why most templates fail (they're generic)
3. How to research competitors (what Boost does)
4. Framework: Stop/Start/Continue
5. CTA: "See real examples" → /in-action

This becomes the main SEO landing page, linking to all examples.

### 2.2 Programmatic Industry Pages

**Pattern**: `/marketing-plan/[industry]`

```
/marketing-plan/saas
/marketing-plan/ecommerce
/marketing-plan/consulting
/marketing-plan/agency
/marketing-plan/newsletter
```

**Each page includes**:
- Industry-specific pain points
- What a good marketing plan includes for this industry
- Link to relevant /in-action example
- CTA to get their own

### 2.3 Stage-Based Pages (Optional)

```
/marketing-plan/pre-launch
/marketing-plan/under-1000-users
/marketing-plan/growth-stage
```

---

## Phase 3: Content Marketing (Week 5-8)

### 3.1 Problem-Focused Blog Posts

Topics that work as written content (no video required):

| Topic | Target Keyword | Intent |
|-------|---------------|--------|
| "What Marketing Should I Focus On? A Framework" | "what marketing to focus on" | Informational |
| "Stop Wasting Time on These 5 Marketing Tactics" | "marketing tactics that don't work" | Informational |
| "How to Research Your Competitors (Without Expensive Tools)" | "competitor research for startups" | Informational |
| "The 30-Day Marketing Plan That Actually Gets Done" | "30 day marketing plan" | Commercial |
| "Marketing Plan vs Marketing Strategy: What You Actually Need" | "marketing plan vs strategy" | Informational |

Each post links to relevant /in-action examples.

### 3.2 Comparison Content

- "Boost vs Hiring a Marketing Consultant"
- "AI Marketing Plan Generators Compared" (own the category)
- "Marketing Plan Templates vs Custom Strategy"

### 3.3 Original Research (Later)

"We analyzed 100 marketing plans. Here's what actually works."
(Anonymize and aggregate data from runs)

---

## Phase 4: Distribution (Ongoing)

### 4.1 Reddit Strategy

**Target Subreddits**:
- r/SaaS (41K) — High intent
- r/solopreneur — Direct audience
- r/startups (1.2M) — Scale
- r/Entrepreneur (2.8M) — Scale
- r/ecommerce — E-commerce segment
- r/smallbusiness (1.5M) — Broader reach

**The Play**:
1. Find posts asking "how do I market my [business type]"
2. Write genuinely helpful comments with specific advice
3. After providing value: "I built a tool that does competitive research — here's an example of what it produces"
4. Link to specific /in-action page (not homepage)

**Content That Works on Reddit**:
- "I analyzed my competitor's marketing. Here's what I found." (share Boost output)
- "The marketing plan I wish I had when I started my SaaS"
- "Stop doing these 5 marketing things" (excerpt from output)

### 4.2 Twitter/X Strategy

- Share insights from Boost outputs (anonymized)
- "Here's what we found analyzing [industry] businesses this week"
- Threads breaking down marketing strategies
- Link to /in-action as "proof"
- Build in public: share milestones, learnings

### 4.3 Product Hunt / Indie Hackers

- Launch when you have 10+ solid examples
- Share on Indie Hackers with real output screenshots

---

## Keyword Strategy

### Tier 1: High-Intent, Low-Volume (Money Keywords)

| Keyword | Intent | Competition | Priority |
|---------|--------|-------------|----------|
| "[industry] marketing plan example" | Commercial | Low | High |
| "30-day marketing plan [industry]" | Commercial | Low | High |
| "marketing plan template [niche]" | Commercial | Medium | High |
| "AI marketing plan generator" | Commercial | Medium | Medium |

**Specific targets**:
- "saas marketing plan example"
- "shopify store marketing plan"
- "solopreneur marketing plan template"
- "consultant marketing plan example"
- "ecommerce marketing plan 30 days"

### Tier 2: Informational (Traffic Builders)

| Keyword | Volume | Content Type |
|---------|--------|--------------|
| "how to market a [business type]" | Medium | Blog/Guide |
| "what marketing should I focus on" | Medium | Blog |
| "[industry] marketing ideas" | High | Listicle |
| "marketing for small business owner" | High | Guide |
| "where to find first customers" | Medium | Blog |

### Tier 3: Long-Tail Programmatic

- "marketing plan for [city] [business type]"
- "[industry] marketing strategy [stage]"
- "how to market [specific product type]"

---

## Technical SEO Checklist

### Metadata

- [x] Gallery: "Marketing Plan Examples | Boost in Action"
- [x] Details: "[Industry] Marketing Plan Example | Boost"
- [ ] Add structured data (HowTo schema for guide, Product schema on homepage)
- [ ] FAQ schema for common questions

### Sitemap

- [ ] Bump example priority to 0.8
- [ ] Add blog/content section when created
- [ ] Ensure all programmatic pages are included

### Performance

- [ ] Consider removing `force-dynamic` from /in-action pages for caching
- [ ] Add `generateStaticParams` for static generation where possible

---

## Success Metrics

### 90-Day Targets

| Metric | Target |
|--------|--------|
| /in-action pages live | 10+ |
| Keywords ranking (top 20) | 5+ |
| Monthly organic visitors to /in-action | 500+ |
| CTR from /in-action to /start | 5% |

### Tracking

- Google Search Console for keyword rankings
- Analytics for /in-action → /start conversion
- Track which examples drive most traffic

---

## The Math

You don't need to win the market. You need 200-500 customers/month.

| Customers/mo | Revenue | Cost (~$2.50/run) | Profit |
|--------------|---------|-------------------|--------|
| 200 | $5,800 | $500 | **$5,300** |
| 500 | $14,500 | $1,250 | **$13,250** |

---

## Quick Reference: Priority Actions

### This Week
1. ~~Add /in-action to nav~~ [DONE]
2. ~~Update metadata~~ [DONE]
3. Create 3 examples: SaaS, e-commerce, consulting
4. Update sitemap priorities

### Next 2 Weeks
5. Write pillar page (/marketing-plan-guide)
6. Start Reddit engagement (genuine, value-first)
7. Create first programmatic industry page

### Next Month
8. Build out remaining industry pages
9. Write 3 problem-focused blog posts
10. Set up Search Console tracking

---

## Related Files

- `/src/app/in-action/page.tsx` — Gallery page
- `/src/app/in-action/[slug]/page.tsx` — Detail pages
- `/src/app/sitemap.ts` — Sitemap config
- `/src/components/layout/Header.tsx` — Navigation
