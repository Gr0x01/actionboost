---
Last-Updated: YYYY-MM-DD
Maintainer: RB
Status: Setup
---

# Technology Stack: [PROJECT_NAME] Directory

## Core Technologies

Modern web stack optimized for rapid development and minimal operational overhead.

### Backend
- **Runtime**: Node.js 18+ (via Next.js API routes)
- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase (PostgreSQL with PostGIS for geographic queries)
- **Geo Extensions**: PostGIS for location-based queries (if needed)
- **LLM**: OpenAI API (gpt-4o-mini for enrichment)

### Frontend
- **Framework**: Next.js 15+ with React 19+
- **State Management**: React Context + useState/useReducer
- **Styling**: Tailwind CSS 4
- **Maps**: MapLibre GL JS (free, open-source) - if needed
- **UI Components**: Custom components + Lucide React icons

### Infrastructure
- **Hosting**: Vercel (seamless Next.js integration)
- **Database Hosting**: Supabase (managed Postgres)
- **CDN**: Vercel Edge Network (included)
- **Analytics**: PostHog (product analytics)

## Environment Configuration

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM & Search (Required for enrichment)
OPENAI_API_KEY=your_openai_key

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## LLM Model Reference

**Structured Extraction**: OpenAI gpt-4o-mini
- **Purpose**: Extract structured data from search results
- **Use Case**: Convert raw text to structured JSON
- **Cost**: ~$0.15/1M input tokens, ~$0.60/1M output tokens

## Cost Summary

### One-Time (Enrichment)

| Component | Estimated Cost |
|-----------|----------------|
| [Source 1] | $X |
| [Source 2] | $X |
| **Total** | **$X** |

### Ongoing (Monthly)
- Supabase: ~$25/mo (micro tier)
- Vercel: Free tier or ~$20/mo (Pro)
- **Total: ~$25-45/month**
