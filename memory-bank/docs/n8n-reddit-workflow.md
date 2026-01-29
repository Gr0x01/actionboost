# n8n Reddit Outreach Workflow

Automated Reddit monitoring that finds founders asking marketing questions and generates helpful comments.

## Overview
```
Every 30 Min (trigger)
    ↓
Subreddits (20 subs)
    ↓
Fetch Reddit (via ScrapingDog)
    ↓
Parse & Filter (posts < 2hrs old)
    ↓
Deduplicate (check Supabase)
    ↓
AI Score + Archetype (Claude Haiku)
    ↓
Generate Comment (Claude Haiku)
    ↓
Filter & Batch (score >= 7, save to Supabase)
    ↓
Send to Discord
```

## Files
```
n8n-reddit-v13.json                    # Workflow export
memory-bank/_archive/reddit-comment-prompt.md   # Comment generation prompt
memory-bank/n8n-supabase-dedup.js      # Dedup node code
```

## Database Table
```sql
CREATE TABLE reddit_sent_posts (
  post_id TEXT PRIMARY KEY,
  subreddit TEXT,
  title TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```
Auto-cleanup removes posts older than 7 days.

## Scoring (Claude Haiku)
- **9-10**: Founder with product asking for marketing help
- **6-8**: Good fit, has product but less urgent
- **3-5**: Weak fit, no product context
- **0-2**: Filter out (pitching, job seeking, pricing questions)

Also matches to one of 7 archetypes (pre-generated Boosts at `/in-action/[slug]`).

## Comment Generation Prompt
Voice: Direct, specific, peer energy. Mention Boost if naturally relevant. MAX 70 words, two short paragraphs. Never recommend competitor tools by name.

## 7 Archetypes
| Slug | Persona |
|------|---------|
| `pre-revenue-saas-first-100-users` | Zero users, just built |
| `side-project-to-business-marketing-plan` | Has MRR but stuck |
| `ecommerce-first-sales-marketing-plan` | Shopify, no sales |
| `consultant-freelancer-client-acquisition-plan` | Services, feast/famine |
| `b2b-saas-customer-acquisition-plan` | B2B tools, longer cycles |
| `local-business-digital-marketing-plan` | Local services, Google Maps |
| `product-market-fit-marketing-plan` | Low engagement, pivot question |

## Costs
| Component | Cost |
|-----------|------|
| Scoring (per post) | ~$0.001 (Haiku) |
| Comment (per post) | ~$0.002 (Haiku) |
| ScrapingDog | Free tier |
| **Per run (20 subs)** | **~$0.10-0.20** |

## Discord Output
Posts scoring 7+ sent with: title, snippet, score, reason, archetype, generated comment, archetype link.
