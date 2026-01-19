---
Last-Updated: 2026-01-19
Maintainer: RB
Status: Active
---

# Technology Stack: Actionboo.st

## Core Technologies

Modern web stack optimized for rapid development and minimal operational overhead.

### Backend
- **Runtime**: Node.js 18+ (via Next.js API routes)
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **LLM**: OpenAI API (gpt-4o-mini for enrichment if needed)

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components + Lucide React icons

### Infrastructure
- **Hosting**: Vercel (seamless Next.js integration)
- **Database Hosting**: Supabase (managed Postgres)
- **CDN**: Vercel Edge Network (included)
- **Analytics**: PostHog (product analytics)

### Testing
- **E2E Testing**: Playwright

## Dependencies

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.90.1",
    "lucide-react": "^0.562.0",
    "next": "16.1.3",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## Environment Configuration

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM (Required for enrichment)
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

### Ongoing (Monthly)
- Supabase: ~$25/mo (micro tier) or free tier
- Vercel: Free tier or ~$20/mo (Pro)
- **Total: ~$0-45/month**
