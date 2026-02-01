# Competitors & Adjacent Players

Tracked competitors and adjacent tools. Not all are direct — some overlap on audience, some on feature set. Last updated: Feb 1, 2026.

**TL;DR**: Enji is the most established but stalled after 4+ years. LandingBoost and Landkit are newer, scrappier, and getting Reddit/Twitter traction with free audit tools and aggressive pricing — worth watching closely.

---

## Enji.co — Direct Competitor

**What**: All-in-one marketing platform for small businesses. Strategy builder (5-min questionnaire → marketing plan with auto-populated calendar), AI copywriter (trained on brand voice), marketing calendar, social media scheduler (FB, IG, LinkedIn, Pinterest, YouTube Shorts, Threads, TikTok), KPI dashboard (GA4 + Meta), brand asset manager, group coaching calls with founder.

**Price**: Free tier (limited, 8 posts/mo) · Social-only ~$15/mo · Full suite $29/mo · Premium support add-on (2hrs with founder). 14-day trial, no CC required. Team members included free.

**Founder**: Tayler Cusick Hollman (marketing consultant). Bootstrapped, based in Encinitas, CA.
**Founded**: ~2021-2023 · **Traffic**: ~1.5K monthly visits · **Team**: Small (possibly just founder + small team)

**Positioning**: "All-in-One Small Business Marketing Software" — strategy-first, built for non-marketers. "Remove the fear, embarrassment, and stress from the marketing process." Running SEO comparison pages (Enji vs CoSchedule, vs FounderPal, vs Blaze).

**Discovery**: Boost's own pipeline found it — ChatGPT, Claude, and manual searches all missed it. Tavily + DataForSEO surfaced it.

**Strengths**: Strategy-first is genuinely differentiated vs pure schedulers. Simple pricing. Free tier reduces friction. Holistic marketing view (not just social). Good social platform coverage.

**Weaknesses**: Strategy generator is shallow (5-min questionnaire). Very low traffic after 4+ years. Founder-dependent (coaching doesn't scale). No API. Reviewers flag scalability concerns and overwhelming checklist UX. No community or network effects.

**How Boost differs**: Enji = "tools to do marketing" (execution suite). Boost = "intelligence that tells you what to do" (clarity/diagnosis). Enji's strategy is a questionnaire; Boost does real research on your specific market. Boost is one-shot with clear deliverable; Enji requires subscription commitment.

---

## Landkit.pro — Adjacent (Same Persona, Getting Traction)

**What**: "Your AI Marketing Co-Founder" — targets dev founders who can build but can't market. Full product suite:
- **Free audit tool** (`/audit`): Paste URL → 30-point behavioral UX audit scored on Clarity, Relevance, Urgency, Credibility, Distraction, Anxiety. Generates V2 headlines and prioritized fix roadmap.
- **Psych Persona Profiler**: Reverse-engineers product value, identifies buyer personas
- **Growth Engines**: Facebook Ads, LinkedIn Authority content, Cold Outreach sequences, Product Hunt launch strategy
- **Live Intelligence**: GA4 + Search Console integration, traffic diagnostics, SEO opportunities
- **Free tools**: AI Ad Creator, GitToTweet, SEO Tool

**Founder**: Nikhil Kumar (@nikhonit) — ex-Seedstars, GrowthSchool, Invact Metaversity. 8+ years growth/engineering. Solo founder, building in public.

**Price** (updated Feb 1 2026 from dashboard screenshots):
- **$9.99/mo** base (launch offer, increases to $29/mo after first 100 founders). 1-day free trial. 30-day refund guarantee (ToS says 7-day — inconsistency).
- **Agency pricing already live**: Quick Add $19.98/mo (+3 projects, 6 total), Agency $39/mo (15 projects, 3 team members, white-label), Agency Pro $99/mo (unlimited projects, 10 team members, white-label). "Quick Add" labeled "Can be availed only once."
- Building for agencies before having 100 solo founders paying. Classic premature scaling.
- Also: GitToTweet standalone at $5/mo.

**Tech**: Vite frontend (not Next.js), Cloudflare hosting, **Google Gemini/Vertex AI** (not OpenAI), Google OAuth, Stripe, Supabase. GA4 + Search Console read-only integrations.

**Data sources (from privacy policy)**: Google OAuth for GA4 + Search Console metrics (read-only), DOM scraping of user's page, Gemini for analysis. **No external data sources** — no Tavily, no DataForSEO, no third-party traffic/keyword data. "Competitor recon" is just a URL input that likely scrapes the page and runs it through Gemini. All "intelligence" comes from the user's own Google data + LLM inference on scraped pages. Breadth of features is real, depth of data is shallow.

**Actual traction (from founder's Reddit post, Jan 31 2026)**: 10,000 unique visitors, 2,400 audits processed in first 30 days. 16K total visitors. Server/API bills hurting. Launched as "tiny side project." BUT: still offering "first 100 founders" launch pricing — meaning he likely hasn't hit 100 paying subscribers despite 2,400 free audits. That's a <4% free-to-paid conversion rate at best. Lots of top-of-funnel, unclear if monetization is working.

**Social proof on site**: "Trusted by 200+ founders." "500+ developers" on GitToTweet. ~10 Reddit testimonials on homepage — all vague positive sentiment, no specific results/metrics, no named companies or logos. Underselling actual traction.

**Lead gen tools**: Free audit (`/audit`), AI Ad Creator (`/ai-ads-creator`), GitToTweet (`/git-to-tweet`), SEO Audit (`/seo-audit-tool`). Public audit directory at `/audits` — clever SEO play (user-generated content indexed).

**Positioning**: "Your code works. Now make it sell." Explicitly anti-ChatGPT: "ChatGPT writes words. Landkit architects desire." Claims to scan Visual DOM hierarchy + apply direct response frameworks. Heavy on fear/urgency language ("Bleeding Neck Detector", "revenue leaks", "your funnel has bugs").

**Strengths**:
- Sharp, aggressive copy targeting exact same persona as Boost
- $9.99 launch price significantly undercuts Boost's $29
- Free audit as lead gen (similar to Boost's marketing audit)
- Reddit traction with real user testimonials
- Broader feature set (ads, email, LinkedIn, outreach)
- GA4/Search Console integration (Boost doesn't have this yet)

**Dashboard (Feb 1 2026 — from screenshots):**
Sidebar has 12 items: Mission Control, Business Context, Growth Command, Magic Ads, YouTube to Blog, Build in Public, Create New Landing Page, SEO Forensics, Hooks & Headlines, Audit Report, Tech SEO Audit, Marketing Modules. Plus "Context Health" progress bar (100% Complete), "Auto-Enrich" button, "Share Idea" button. It *looks* packed. Unknown how many are functional vs shells.

**Business Context page (detailed, Feb 1 2026):**
Structured business profile builder — the best-designed part of the product:
- **Brand Identity**: Name, URL, tagline, elevator pitch, origin story ("Why This Exists"), "The Enemy" (status quo they fight against). "Auto-Enrich" button to AI-fill gaps.
- **Target Persona**: Card with avatar, persona name (e.g. "Solopreneurs"), "Cares about" description, Core Motivations, Buying Triggers, Critical Pains & Fears. Risk Tolerance + Decision Speed fields. "AI Enhance" button. Editable items with "+ Add Item."
- **Product Truths**: Feature/User Benefit pairs (e.g. "Competitor Traffic Analysis" → "Stop guessing what works and see exactly where your competitor..."). Editable list.
- **Strategic Core**: Target Audience description, Problem Solved, Primary Solution ("Your Unlock"), Pricing Model (text field, not enforced).
- **Voice & Tone**: Tone Pattern dropdown ("Professional & Trusted"), Style Guide Notes.
- **Persona Simulation**: Chat interface where AI roleplays as the target persona. User practices their pitch, persona responds with skeptical objections ("I'm listening, but I'm skeptical. Why should I care about this right now?"). Essentially a sales objection practice tool / pitch testing chatbot. Clever feature — low cost (just a chat completion), high perceived value, helps founders pressure-test their messaging against realistic buyer pushback. No screenshots saved (shared inline).
- **Competitor Recon**: Paste URL → "Analyze" button. Shows positioning + weaknesses side-by-side. Found Enji and gave decent analysis. But still just Gemini on a scraped page — no traffic/keyword data.

He ran Boost through it — used our copy verbatim in his elevator pitch field. Studying us like we're studying him.

**Useful for Boost Weekly business profile design**: The section structure (identity → persona → value props → strategy → voice → competitors) is a good skeleton. Our version will be smarter — we can auto-populate from the Brief's real research data instead of just AI inference on scraped pages.

**Post-checkout experience (Feb 1 2026 — paid $9.99 for 1-day trial):**
Console full of 400 errors immediately after checkout. Business Context page loads blank. "Error fetching purchases," "Error fetching jobs," "Failed to load resource" (400s on multiple Supabase endpoints), "Could not establish connection. Receiving end does not exist," disconnected polkadot websocket. The paid dashboard is broken on first load. Screenshot: `31-paid-dashboard-console-errors.png`. This is what shipping 12 features in 30 days looks like.

**Weaknesses**:
- **Paid audit adds fear-based urgency, not depth**: Paid "Audit Report" is the same free audit inside the dashboard. Adds "Projected Monthly Loss: -$240" based on "a standard 4% conversion benchmark vs. your score" — fabricated number with no knowledge of actual traffic. Letter grades (Visuals: C, Copy: C) with no methodology. Message Clarity 5/10 and Conversion Urgency 5/10 with no receipts. Bottom half of the page is empty. Screenshot: `33-paid-audit-report-boost.png`.
- **Not a system — it's a kit**: Each module is a standalone LLM call. Mission Control generates a prompt to paste into Lovable. Magic Ads generates ad copy headlines + visual prompts for "Nano Banana Pro or ChatGPT" (doesn't generate images — generates prompts for other tools). Credit-based (29 credits on free plan). Persona Simulation is a chatbot. Competitor Recon scrapes a page. Nothing builds on anything else — persona doesn't inform ad copy, ad copy doesn't inform landing page, nothing feeds back into weekly priorities. 12 sidebar items, zero strategic thread. The name "LandKit" is literal.
- **Feature sprawl for a solo dev 30 days in**: 12+ sidebar items, many likely shells. The audit is the real product; everything else is dashboard dressing to justify the subscription. Now adding agency tiers ($39-99/mo) before validating the core product works for solo founders.
- Promises a LOT — "entire agency minus the retainer" is hand-wavy at $9.99/mo
- Costs: Likely using Gemini 2.5 Pro ($1.25-2.50/1M input, $10/1M output) given the audit output quality — Flash can't produce that level of structured analysis. Estimated ~$0.05-0.10/audit in LLM costs, plus headless browser compute for DOM scraping (confirmed in HN post). At 2,400 audits/month: $120-240/mo in AI + compute costs with <100 paid subscribers at $9.99 = burning money
- Copyright still says "© 2025" — fresh/rushed
- Name collision with Bootstrap/WordPress themes hurts SEO
- No blog, no demos page, no examples (all 404/empty)
- ToS/refund inconsistency (7-day vs 30-day) signals early-stage rush
- Uses Gemini, not OpenAI — quality differential unknown

**Threat level**: Medium-high. Same persona, active community engagement, aggressive pricing. The audit tool directly competes with Boost's free marketing audit. Watch their Reddit/Twitter activity.

### Landkit Free Audit of aboo.st (Feb 1, 2026)

Screenshots in `landkit/` folder. Ran their free audit on Boost — output is substantial and genuinely useful.

**Score**: 88/100. Clarity 10/10, Trust 9/10, Emotion 8/10, **Urgency 2/10** (major gap).

**Structure**: 3 tabs — Overview, Psychology, Blueprint. Each is deep.

**Overview tab:**
- Quick wins: Add scarcity to $29 price ("Introductory Price"), move testimonial below hero CTA, change final CTA to "Get My $29 Marketing Plan"
- Priority action plan ranked by conversion impact: #1 no urgency (15-25%), #2 scroll fatigue from repetitive examples (5-10%), #3 social proof needs to be more prominent (5-10%)
- Revenue simulator: "-$240/month potential loss" from missing urgency

**Psychology tab:**
- Desire 9/10, Clarity 10/10
- Trust signals detected: reciprocity, commitment & consistency, social proof, liking, authority
- Missed opportunity: **Scarcity** — the one thing Boost completely lacks
- Emotional triggers: Frustration, Hope, Curiosity, Desire for Clarity
- Trust killer: long page with repetitive example sections

**Competitive Edge section** (brutal but accurate):
- Called out Boost's unique differentiators correctly (data-driven, one-time $29, free trial, anti-ChatGPT positioning)
- But flagged "We research your competitors" and "We pull real traffic data" as **generic claims that won't differentiate** — ouch
- Suggested untapped opportunities: lean into "anti-SaaS" model, personal brand around founder, industry-specific packages

**Blueprint tab:**
- Rewrote headline: "Stop Guessing. Get Your Competitors' Marketing Plan in 10 Minutes."
- A/B test ideas with pricing variants (control $29, variant A with price increase urgency, variant B with bonus)
- "Steal This Strategy" CTA pushing to $7 deep dive report

**Upsell**: $7 one-time for 15-page "Deep Dive Report" (save 86% from $40). Claims "347 founders watched this month."

**Takeaway**: This is a well-executed product. The free tier gives genuinely useful, specific feedback — not generic fluff. The output structure (Overview → Psychology → Blueprint) and the $7 upsell are both worth studying closely.

---

## LandingBoost.app — Adjacent (More Traction Than Expected)

**What**: AI landing page audit tool. Paste URL → get conversion score, rewrite suggestions, and layout fixes. Scores on Clarity, Trust, and Action. Generates before/after comparisons and paste-ready copy rewrites.

**Price**:
- **Free**: 2 scans total
- **Pro**: **$7/mo** (launch price, normally $9) — unlimited scans, full history, weekly auto-rescans + email alerts, paste-ready rewrites, leaderboard eligibility (80+ score)
- **Lifetime**: **$35 once** (launch price, normally $49) — everything in Pro, forever

**Social proof**: "641 landing pages analyzed." "+185 trusted by founders building in public." Avatar row with real Twitter handles. Featured section showcasing pro members' products (NerdSip, MiroMiro, ShotSnap, Kanaeru AI, etc.). Testimonial from @therjmurray: "This helped me get my first paid user. I didn't change the product. I fixed the hero section."

**Built with**: Lovable (React + Supabase). Staging at `landing-boost-advanced.lovable.app`. "n8n Verified Creator" badge. Made by someone active on Twitter (@CodeWizard, linked). Contact: landingboost.app@gmail.com (gmail = solo/side project).

**Tech/data sources (from privacy policy)**: Barebones. Stripe for payments, "analytics tools" (unspecified), cookies. **No AI/LLM provider disclosed**. No external data sources mentioned at all. Likely scrapes page + sends to an undisclosed LLM. No Google integrations, no SEO data, no competitive intel. Pure page-level analysis.

**Positioning**: Speed and instant value. "No signup. No credit card. Results in 30 seconds." Anti-CRO-consultant angle: "Can't afford CRO consultants? Get expert-level insights for free." Leaderboard/featured section creates community incentive.

**Strengths**:
- 641 scans is real traction for a new tool
- Smart monetization ladder (free → $7/mo → $35 lifetime)
- Featured section incentivizes Pro upgrades (social proof for paying users' products)
- Weekly monitoring + email alerts creates retention loop
- Testimonial is specific and compelling ("got my first paid user")
- Very polished for a Lovable-built app

**Weaknesses**:
- Narrow scope (landing pages only, not full market clarity)
- Lovable-built = low technical moat
- 641 scans ≠ 641 users (free tier = 2 scans each, so ~320 users max)
- No deep research — LLM wrapper over page scraping
- Competes in crowded space (ConvertAudit, PageAudit, Fibr, etc.)

**Threat level**: Low-medium. Not direct competition to Boost's core (market clarity), but overlaps with Boost's free marketing audit. Their growth tactics (featured section, leaderboard, Twitter community) are worth studying.

### LandingBoost Audit of aboo.st (Feb 1, 2026)

Screenshots in `landingboost/` folder.

**Score**: 48/100 "High Friction" — weighted toward weakest area, not a simple average. Clarity 62, Relevance 68, **Trust 48** (primary bottleneck), Action 71.

**#1 fix**: "Add social proof next to the low-friction CTA" — no third-party validation above the fold.

**AI Insights**: 3 cards — biggest bottleneck (no social proof above fold), fastest win (pair "No signup" with proof), expected impact (reduce CTA hesitation).

**Case study**: Before/after of Flive invoicing tool showing +80% signup increase. Luke @CodeWizard: "I mainly improved the hero section. There were no major changes to the product itself." Real screenshots, real data, named founder.

**Upsell mechanics**: Full Score Breakdown locked ("You've seen 1 insight. Unlock the full report for 4 more detailed fixes."). AI-Suggested First Screen Copy section shows bullet points (rewritten headline, subheadline, CTA, trust line) but locked behind Pro. "Share for feedback & get +1 scan" — viral loop.

**Contrast with Landkit**: Landkit scored Boost 88/100, LandingBoost scored 48/100. Different methodologies. LandingBoost weights toward weakest area (Trust), Landkit uses a more balanced average. Both flagged social proof/urgency as the main gap.

---

## Competitive Landscape Summary

| | Enji | Landkit | LandingBoost | **Boost** |
|---|---|---|---|---|
| **Type** | Execution suite | AI co-founder | Landing page auditor | **Market clarity** |
| **Price** | $29/mo | $9.99/mo | $7/mo or $35 once | **$29 one-shot** |
| **Free tier** | Limited | Free audit | 2 scans | **Free mini-audit** |
| **Target** | Non-marketer SMBs | Dev founders | Founders/makers | **Tech-adjacent entrepreneurs** |
| **Traction** | ~1.5K/mo (stalled) | 10K visitors, 2.4K audits in 30 days | 641 scans | **Has sales, growing** |
| **Moat** | Feature breadth | Aggressive copy/community | Speed/simplicity | **Real market research** |
| **Distribution** | SEO pages | Reddit/Twitter | Twitter/build-in-public | **Reddit + SEO tools** |

## Honest Assessment

**Where Boost is behind:**
- Landkit at $29/mo offers significantly more surface area than Boost's $29 one-shot: ads engine, LinkedIn content, cold outreach, PH launch strategy, GA4 integration, persona profiling, UX audit — ongoing access to all of it
- Both Landkit and LandingBoost have free tool funnels with multiple entry points; Boost has one (marketing audit)
- Both competitors are getting visible Reddit/Twitter traction via build-in-public; Boost's community presence is thinner
- Landkit's subscription model creates more LTV and stickiness than a one-shot

**Where Boost is ahead:**
- Real external data sources (Tavily + DataForSEO + screenshots) vs. LLM prompting against scraped pages
- Depth of research on the user's specific market — competitors, traffic, keywords, not generic advice
- Has actual paying customers

**Open questions:**
- How much of Landkit's feature list actually works vs. marketing promises? Unknown.
- Does Boost's data depth matter to customers, or is "good enough" AI output at lower price sufficient?
- Does the v2 subscription tier need to accelerate given this competitive pressure?
- Should Boost expand its free tool funnel to match Landkit's multiple entry points?

---

## Deep Comparison: Boost vs Landkit

LandingBoost is a page auditor, not a real competitor. Landkit is the one that matters — same persona, same problem, similar funnel shape. This comparison is honest.

### 1. Funnel & Acquisition

| | **Landkit** | **Boost** |
|---|---|---|
| **Top of funnel** | Free audit (paste URL, instant) + AI Ad Creator + GitToTweet + SEO Tool — 4+ entry points | Free marketing audit (paste URL) + target audience generator — 2 entry points |
| **Conversion step** | Free audit → sign up → Business Context onboarding → $9.99/mo subscription | Free audit → /start form (10 min) → $29 checkout |
| **Friction** | Low — paste URL, get value immediately, sign up later | Higher — detailed form before checkout, bigger price commitment upfront |
| **Retention** | Dashboard with ongoing tools, weekly monitoring | One-shot report + dashboard with grayed-out subscription features |
| **Distribution** | Reddit posts, HN launch, Twitter build-in-public, public audit directory (SEO) | Reddit, free tools for programmatic SEO |

**Landkit wins on**: Number of entry points, lower initial commitment, more surfaces for organic discovery (public audit directory is smart SEO).

**Boost wins on**: Nothing obvious here. Boost's funnel is narrower and asks more upfront.

### 2. Product Output Quality

| | **Landkit** | **Boost** |
|---|---|---|
| **Data inputs** | User's Google Analytics + Search Console (read-only) + DOM scraping of user's page + DOM scraping of competitor URL | Tavily web search (real-time) + DataForSEO (traffic, keywords, competitors) + homepage screenshots + user's form inputs |
| **AI model** | Google Gemini/Vertex AI | Claude Opus 4.5 |
| **Output depth** | Broad but shallow — audit scores, persona cards, ad copy, email sequences, headline rewrites. All generated from scraped page + LLM inference. No actual market data. | Narrow but deep — competitive landscape with real traffic numbers, keyword gaps, actual competitor analysis, specific tactical recommendations backed by data |
| **Competitor analysis** | Scrapes competitor homepage, runs through Gemini. No traffic data, no keyword data, no market sizing | Tavily searches for real competitors + DataForSEO for traffic estimates, top keywords, domain metrics. Finds competitors the user didn't know about |
| **Personalization** | Based on what Gemini infers from your page + your Google data | Based on actual external research specific to your market |
| **Breadth of deliverables** | Audit report, persona profile, ad copy, email sequences, LinkedIn posts, PH launch plan, SEO recommendations, headline rewrites | One comprehensive report: Executive Summary → Situation → Competitive Landscape → Stop/Start Doing → Quick Wins → 30-Day Roadmap |

**Landkit wins on**: Breadth. More types of output. More things to click on and use. Feels like you're getting a marketing department.

**Boost wins on**: Depth and data integrity. Boost surfaces real competitors, real traffic numbers, real keyword gaps. Landkit's "intelligence" is Gemini guessing from a scraped page. Boost's research has found competitors that ChatGPT, Claude, and manual searches all missed (Enji.co). Landkit can't do that.

**The uncomfortable truth**: Most users may not know the difference. Landkit's output looks professional and actionable even if the underlying data is LLM inference. "Good enough" at $9.99/mo may beat "genuinely better" at $29 one-shot for many buyers.

### 3. Pricing & Value Perception

| | **Landkit** | **Boost** |
|---|---|---|
| **Entry price** | $0 (free audit) → $9.99/mo (launch) → $29/mo (target) | $0 (free mini-audit) → $29 one-shot |
| **What $29 gets you** | Monthly: ongoing access to all tools, persona profiler, audit, GA4 intelligence, growth engines, 3 projects | Once: one comprehensive research report + dashboard + 2 refinements |
| **Perceived value at $29** | Ongoing marketing department | One report |
| **LTV** | $9.99-29/mo × months retained | $29 once (until subscription tier launches) |

Landkit's pricing makes Boost look expensive for what you get, even though Boost's underlying research is more rigorous. At $29/mo, Landkit offers continuous access to a full toolkit. At $29 once, Boost offers one deliverable.

### 4. Presentation & Polish

| | **Landkit** | **Boost** |
|---|---|---|
| **Free audit output** | 3-tab structure (Overview / Psychology / Blueprint). Scores, revenue simulator, quick wins, priority action plan, competitive edge analysis, headline rewrites, A/B test ideas. Feels comprehensive and premium. | Marketing audit: 3-Second Test framework, clarity/customer focus/proof/friction scoring. Solid but simpler. |
| **Dashboard** | Full workspace: Mission Control hub, Business Context (brand, persona, strategic core), multiple tool modules, "Blueprint Locked" gamification | Run results page with tabs, grayed-out subscription features |
| **Copy & tone** | Aggressive direct-response: "bleeding neck", "revenue leaks", "your funnel has bugs". Creates urgency. | Measured clarity-first: "stop guessing, get clarity." Professional but less urgent. |
| **Gamification** | "Context Health" percentage, "Blueprint Locked until 100%", "Steal This Strategy" CTAs | Progress bar during form, dashboard with locked features |

Landkit's presentation is more aggressive and creates more urgency to engage. Multiple modules and locked features create a "there's so much here" feeling. Boost's presentation is cleaner but gives less sense of ongoing value.

### 5. What to Steal / Adopt from Landkit

**High priority — directly applicable:**
1. **Free audit as primary funnel entry**: Landkit's audit is their #1 growth driver (Reddit traction confirms). Boost's marketing audit exists but isn't as prominently positioned. Make the free audit the hero entry point, not a side tool.
2. **Multiple free tool entry points**: Landkit has 4+ free tools driving organic traffic. Boost has 2 (marketing audit, target audience generator). The free tools SEO expansion plan is already on the roadmap — this confirms it should be prioritized.
3. **Public audit directory**: Landkit's `/audits` page indexes completed audits for SEO. Free user-generated content that drives organic traffic. Boost could do this with anonymized/public marketing audit results.
4. **Revenue simulator / urgency framing**: Landkit's "-$240/month potential loss" from the audit creates urgency to act. Boost's free audit could add a similar "what this is costing you" calculation.
5. **Scarcity on pricing**: Both Landkit and their audit of Boost flagged urgency as Boost's biggest gap. "Introductory price" or "price increases after X founders" is easy to implement.

**Medium priority — worth considering:**
6. **Tiered output with upsell**: Landkit shows a solid free audit, then upsells to $7 deep dive. Boost could add a mid-tier between free audit and $29 full plan.
7. **Business Context onboarding**: Landkit's workspace starts by building a "Business DNA" profile (brand identity, persona, strategic core, voice & tone). This is what Boost's /start form collects, but Landkit makes it feel like you're building something persistent, not just filling out a form.
8. **Psychology/persuasion framing**: Landkit frames everything through behavioral psychology (Cialdini principles, trust signals, emotional triggers). This framing makes generic LLM advice feel more scientific and credible. Boost could adopt similar framing without changing the underlying product.
9. **Build-in-public module**: Landkit has git commit tracking → social posts. Niche but clever for the dev founder audience.

**Low priority / skip:**
10. **Breadth-over-depth feature sprawl**: Landkit has 12+ features but many are shells ("Activate Feature", "coming soon"). The audit is the real product; the rest is dashboard dressing. Solo dev 30 days in can't maintain this — he's already struggling with server costs at 2,400 audits/month. Boost shouldn't copy the sprawl. Do fewer things with real data.
11. **Aggressive fear-based copy**: "Bleeding neck", "your funnel has bugs" works for Landkit's brand but doesn't fit Boost's "clarity, not fear" positioning. Boost can add urgency without going full fear-mode.

### 6. Strategic Implications

**The real competitive threat isn't Landkit's product quality — it's their distribution.** They're in the same subreddits, targeting the same founders, with a lower price point and a free tool that gives instant value. Even if Boost's output is better, Landkit is reaching more people.

**What matters now:**
- Accelerate free tools SEO expansion (already planned)
- Consider a mid-tier price point between free and $29
- Add urgency/scarcity to pricing (Landkit and both audits flagged this)
- Make the free audit more prominent as the primary entry point
- The v2 subscription tier becomes more urgent — one-shot at $29 is hard to defend against $9.99-29/mo ongoing access
