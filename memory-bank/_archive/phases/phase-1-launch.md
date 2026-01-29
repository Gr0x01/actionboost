# Phase 1 Launch History (Archived)

Detailed changelog from Jan 2025 – Jan 27, 2026. Moved from `phases/current.md` on Jan 29, 2026.

---

## Facebook Ads Test Launched (Jan 27, 2026)

**Facebook Pixel + Conversion API**: Client-side pixel + server-side Conversion API for purchase tracking. GDPR-compliant (non-EU only). Event dedup via shared eventID. CSP updated for Facebook domains.

**Env vars**: `NEXT_PUBLIC_FB_PIXEL_ID`, `FB_ACCESS_TOKEN`

**Purchase tracking**: Fires on `/results/[runId]?new=1`, cleared after tracking.

**Ad Campaign**: $100 test, $10/day. Real dashboard screenshot creative. Targeting: SMB founders via Advantage+.

---

## SEO Infrastructure Complete (Jan 26, 2026)

- Pillar page: `/marketing-plan-guide` (~2500 words)
- 5 industry pages: `/marketing-plan/[saas|ecommerce|consulting|agency|newsletter]`
- 5 examples, internal linking, sitemap
- SEO plan: `memory-bank/docs/seo-plan.md`

---

## Target Audience Pivot (Jan 24, 2026)

Pivoted from SMBs to tech-adjacent entrepreneurs. See `decisions.md` for full rationale.

---

## Brand Voice Pivot - Direct Strategist (Jan 24, 2026)

Shifted from "friendly hand-holding expert" to "direct strategist who respects your intelligence." See `decisions.md` and `product.md`.

---

## Dashboard Overhaul - Soft SaaS Aesthetic (Jan 23, 2026)

Full visual and copy overhaul. Light Skeuomorphism → Soft Brutalist. Sentence case labels, soft elevation, warm empty states. Files: dashboard components, results dashboard components.

---

## Positioning Framework + Form Simplification (Jan 23, 2026)

Added Dunford/Gerhardt positioning to pipeline. Form simplified 8→7 steps. New AlternativesInput component. Attachments removed.

---

## Boost in Action Page (Jan 23, 2026)

`/in-action` gallery of curated examples. Raw output showcase, not case studies. Admin at `/in-action/admin`. Sunset first_impressions feature.

---

## Homepage Copy Refinements (Jan 23, 2026)

Hero: "Money back if it doesn't help. Seriously." CTA: "Get my 30-day plan". Trust badges updated.

---

## SMB Repositioning + Homepage Rewrite (Jan 23, 2026)

Pivot from indie hackers to SMBs. $9.99→$49. Brand voice: snarky→friendly. Design: brutalist→light skeuomorphism.

---

## Results Page Dashboard Redesign (Jan 22, 2026)

Output formatter (Haiku post-processor) extracts structured JSON. Dashboard components: CommandCenter, PriorityCards, MetricsSnapshot, CompetitorSnapshot, DeepDivesAccordion. Graceful degradation with lazy backfill.

---

## Agentic Pipeline + Dynamic Processing UI (Jan 22, 2026)

Replaced pre-fetch with agentic tool-calling. 6 tools, max 8 calls, parallel batches of 3. Typewriter + bursty data counter UI. ~40-60s total.

---

## Testing Infrastructure (Jan 22, 2026)

Vitest (46 tests), Playwright E2E, GitHub Actions CI. Fixed credit race condition.

---

## Cart Abandonment Recovery (Jan 21, 2026)

Email before checkout → cart abandonment webhook → free audit + recovery email.

---

## Free Mini-Audit Extended (Jan 21, 2026)

4 sections (added Channel Strategy). Cost: ~$0.07/run.

---

## Relaxed AI Context Limits (Jan 21, 2026)

Increased truncation limits. MAX_TOKENS 8K→12K. Cost ~$0.50→$0.60/run.

---

## Refinement Feature (Jan 21, 2026)

"Tell Us More" - 1-2 free refinements per purchase. Subtle placement, over-delivery strategy.

---

## Bug Fix: Context Delta Ignored (Jan 21, 2026)

Returning user updates weren't merged into context. Fixed in all 3 run creation routes.

---

## Hero Flow + Checkout Fix (Jan 21, 2026)

Hero prefill fix, removed stale `pricingEnabled` feature flag.

---

## Share Page (Jan 2025)

`/share/[slug]` public links. OG tags, social sharing, conversion CTAs.

---

## Brutalist + Tactile Redesign (Jan 2025)

Initial visual direction. Harsh offset shadows, tactile buttons.

---

## Resend Email Integration (Jan 2025)

Receipt emails + branded magic link template. Sender: `team@actionboo.st`.

---

## Form Refactor (Jan 2025)

Extracted 12 components. WelcomeBack flow for returning users. AARRR focus areas.

---

## Legal Pages (Jan 2025)

Privacy policy + terms of service.

---

## Earlier (Jan 2025)

- Results page redesign (document style, Tienne serif)
- RAG integration (pgvector)
- Magic link auth
