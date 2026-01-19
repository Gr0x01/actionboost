"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResultsContent, ExportBar, TableOfContents } from "@/components/results";
import { parseStrategy } from "@/lib/markdown/parser";

// Real strategy output for Inkdex
const DEMO_STRATEGY = `# Growth Strategy Analysis: Inkdex

## Executive Summary

You've built something genuinely valuable—a visual search engine that solves a real problem in a massive market ($3B+ tattoo industry). Your technology is solid, your database is substantial (20K+ artists, 100K images), and you've proven the concept works. But you're facing a classic early-stage challenge: **you're fishing in the wrong ponds with the wrong bait.**

Your data tells a clear story: organic traffic converts 10-20x better than paid because organic users have *intent*. Someone searching "blackwork tattoo artist Seattle" is ready to book. Someone scrolling Reddit is collecting inspiration they'll never act on. Your biggest opportunity isn't spending more money—it's capturing the massive long-tail search demand from people actively looking for tattoo artists right now.

The strategic direction is clear: **double down on SEO as your primary acquisition engine, build viral loops into the artist discovery experience, and ignore paid channels until you've exhausted free/organic opportunities.** With 4,000+ pages and 154 cities, you're sitting on an SEO goldmine that's barely been tapped. The next 90 days should focus ruthlessly on capturing search intent and converting it into artist profile views.

---

## Your Current Situation

### What You're Doing Right

First, let's acknowledge the strong foundation you've built:

1. **Differentiated product**: Visual search for tattoos is genuinely novel. Most competitors are directories—you're building a discovery engine. The CLIP embeddings approach gives you a technical moat.

2. **Substantial database**: 20K artists across 154 cities is meaningful coverage. This isn't a landing page with a waitlist—it's a real product with real inventory.

3. **Smart instrumentation**: PostHog, UTM tracking, referral params—you're set up to learn from your users. Most founders at this stage are flying blind.

4. **Content infrastructure**: 4,000+ static pages is excellent. You've done the hard work of building crawlable, indexable content. Now it needs to rank.

5. **You paused paid ads**: This shows discipline. Most founders would keep throwing money at broken channels. You correctly identified the signal in your data.

### Where the Gaps Are

1. **Zero claimed profiles**: This is your most urgent problem. Unclaimed profiles mean artists aren't invested, users can't contact them directly, and you have no path to revenue. A two-sided marketplace with zero supply-side engagement is just a directory.

2. **Reddit ad failure reveals intent mismatch**: 24 users, 0 profile views isn't a creative problem—it's a targeting problem. Reddit r/tattoos users are browsing, not booking.

3. **SEO pages aren't ranking yet**: 4,000 pages but only 54 organic users/day suggests your content isn't indexed well or isn't ranking for valuable terms. The sitemap bug you fixed may take weeks to propagate.

4. **Mobile experience gap**: 80% mobile traffic but desktop-first design is leaving conversion on the table. The sticky search bar helps, but the entire journey needs mobile optimization.

5. **No activation loop**: Users find the site, maybe view a profile, then... nothing. No email capture, no saved searches, no "alert me when an artist in this style opens up in my city."

### How You Compare

At this stage (pre-revenue, ~100 DAU), successful two-sided marketplaces typically have:
- 5-10% of supply claiming/verifying profiles within 30 days of launch
- At least one organic acquisition channel showing 100+ users/week
- Some form of user retention (email, app, saved content)

You're behind on supply-side engagement but ahead on content infrastructure. The path forward is clear: fix the supply side while SEO compounds.

---

## Competitive Landscape

### How Competitors Approach This

**Tattoodo** (the dominant player) built their traffic through:
- Heavy content marketing (tattoo ideas, style guides, artist interviews)
- Instagram aggregation (became the "discover" tab for tattoo content)
- Artist-first features (portfolio hosting, booking tools)
- Community building (forums, user-generated content)

Their weakness: generic search. Finding a specific style in a specific city is still painful on Tattoodo. They're a content site that added a marketplace, not a search engine.

**Inkstinct** focuses on:
- Artist portfolios and booking
- More premium positioning
- European market strength

Their weakness: discovery. You have to already know what you want.

### Market Trends Affecting Your Strategy

1. **"Vibecoding" is mainstream**: Users increasingly want to search by vibe/aesthetic, not keywords. Your visual search is positioned perfectly for this trend.

2. **Local SEO is table stakes**: Google Business Profiles, local citations, and city-specific pages are how tattoo studios get found. You can be the aggregator layer.

3. **Pinterest is underexploited**: Multiple research sources highlight Pinterest as a "hidden gem" for tattoo discovery. High-intent visual search users who are planning, not just browsing.

4. **Mobile booking expectations**: Users expect to go from discovery to booked appointment in 2-3 taps. Your path to artist contact needs to be frictionless.

### Opportunities Competitors Are Missing

1. **AI-powered style matching**: No one is doing "upload your idea, find artists who do that exact thing" well. You are.

2. **International coverage**: Tattoodo is US/EU heavy. You're in India, Pakistan, ANZ. Underserved markets with growing demand.

3. **Instagram-native discovery**: Your IG URL detection is unique. Imagine: paste any tattoo IG post, find similar artists near you.

4. **Comparison shopping**: No platform makes it easy to compare 3-5 artists side-by-side for a specific style in a specific city.

---

## Stop Doing

### 1. Stop Running Paid Ads (For Now)
**Why**: $98.45 spent, 3 meaningful profile views from paid. That's $32.82 per profile view with no path to conversion. Your organic traffic converts at 55% to profile views—for free. Until you've saturated organic opportunities, paid is burning money you don't have.

### 2. Stop Treating Reddit as an Acquisition Channel
**Why**: Reddit users are in browse/inspiration mode. Your user feedback confirmed it: "people don't wait till they have a full idea before finding an artist." Reddit is top-of-funnel awareness at best. Stop optimizing for a channel that can't convert.

### 3. Stop Building Features Without Validation
**Why**: You built an ambassador program, share buttons, referral tracking—all before you have a single claimed profile or paying customer. These are optimization features for channels that don't exist yet. Focus ruthlessly on the one thing that matters: getting artist profiles claimed.

### 4. Stop Expanding Cities Before Proving Activation
**Why**: 154 cities across 56 countries sounds impressive, but it's spreading thin. One city with 50 claimed profiles teaching you about activation is worth more than 154 cities with zero. Depth beats breadth at this stage.

### 5. Stop Writing Content Without Keyword Research
**Why**: Your city guides are 1,500-2,000 words, but are they targeting terms people actually search? "Best blackwork tattoo artist Seattle" probably gets more searches than "Seattle tattoo scene guide." Every piece of content should have a target keyword with search volume.

---

## Start Doing (Prioritized by ICE)

### 1. Launch Aggressive Artist Outreach Campaign
- **Impact**: 10/10 - Without claimed profiles, you have no marketplace, no social proof, and no revenue path
- **Confidence**: 9/10 - Direct outreach to artists works; they want more clients
- **Ease**: 7/10 - You have their IG handles; outreach is manual but straightforward
- **ICE Score**: 26

This is your highest-leverage activity and should consume 50% of your time for the next 30 days.

**Implementation:**
1. Write a compelling DM script: "Hey [Name], I found your work through [source] and added your portfolio to Inkdex—a visual search engine that helps people find artists by style. Your [style] work is getting discovered by people searching in [city]. Claim your profile (takes 2 min) to control how you appear and connect directly with potential clients: [link]"

2. Start with your highest-quality artist profiles in 3-5 focus cities (pick cities where you have 100+ artists). Reach out to 20 artists/day via Instagram DM.

3. Track response rates, claim rates, and feedback. Iterate on messaging weekly.

4. Create a "Featured Artist" slot on your homepage for early claimers—social proof begets more claims.

The goal: 50 claimed profiles in 30 days. This proves supply-side activation and gives you testimonials.

---

### 2. Optimize Existing Pages for Long-Tail SEO
- **Impact**: 9/10 - You already have 4,000 pages; optimization can unlock massive organic traffic
- **Confidence**: 8/10 - Long-tail SEO is proven; you just need to execute
- **Ease**: 8/10 - It's content and meta tag optimization, not new builds
- **ICE Score**: 25

Your static city/style pages are assets waiting to be activated.

**Implementation:**
1. Use Ahrefs free tier, Ubersuggest, or Google Search Console to identify which pages are getting impressions but not clicks (position 10-30 = striking distance).

2. For each city page, target: "[style] tattoo artist [city]" (e.g., "Japanese tattoo artist Austin"). These are high-intent, commercial keywords.

3. Optimize title tags: "Best [Style] Tattoo Artists in [City] | Inkdex"
   - Current: Probably generic
   - Target: Keyword-rich, compelling

4. Add FAQ schema to city pages answering questions like:
   - "How much does a [style] tattoo cost in [city]?"
   - "How do I find a good [style] tattoo artist in [city]?"

5. Internal link aggressively: every artist profile should link to their city and style pages; every city page should link to popular styles.

---

### 3. Create Programmatic SEO Content at Scale
- **Impact**: 9/10 - Can 10x your organic traffic with right execution
- **Confidence**: 7/10 - Programmatic SEO is competitive but you have unique data
- **Ease**: 7/10 - You're technical; this is automatable
- **ICE Score**: 23

You have data competitors don't: style distribution by city, artist density, visual examples.

**Implementation:**
1. Create template-based pages for every [style] + [city] combination where you have 5+ artists. That's potentially thousands of pages.

2. Structure: "Find the best [Style] tattoo artists in [City]. Browse [X] artists specializing in [style] work, see their portfolios, and connect directly."

3. Include:
   - Top 5-10 artists in that style/city with images
   - Average style characteristics (color vs B&W ratio, typical piece size)
   - Related styles users also search
   - FAQ section

4. Auto-generate unique content using your ML style data: "Seattle has a strong [Style] scene with artists known for [characteristics your ML can detect]."

5. Submit to IndexNow immediately on creation; manually request indexing for top 100 pages in GSC.

---

### 4. Build an Email Capture Loop
- **Impact**: 8/10 - Email is the only reliable owned channel; critical for retention
- **Confidence**: 9/10 - Email capture is proven at every stage
- **Ease**: 7/10 - Exit intent popups and value exchange are straightforward
- **ICE Score**: 24

Users visit, view profiles, leave forever. You need to capture them for follow-up.

**Implementation:**
1. Create a "Save Your Search" feature: "Get notified when new [style] artists are added in [city]." Capture email + city + style preferences.

2. Exit-intent popup (mobile: scroll-up trigger): "Planning a tattoo? Get our free guide: 10 Questions to Ask Your Tattoo Artist Before Booking" — capture email.

3. After profile view: "Like this artist's work? Save them to your list and get alerts if they open up flash spots." — capture email.

4. Start with simple Mailchimp or ConvertKit automation:
   - Welcome email with top artists in their searched city
   - Week 2: "New artists added in [city]" digest
   - Week 4: "Trending styles in [city]" content

5. Track email-to-profile-view conversion as your key retention metric.

---

### 5. Launch Pinterest Strategy
- **Impact**: 8/10 - High-intent visual search platform; perfect fit for your product
- **Confidence**: 7/10 - Multiple research sources confirm Pinterest as underexploited for tattoos
- **Ease**: 7/10 - You have 100K images; automation is possible
- **ICE Score**: 22

Pinterest is where people *plan* tattoos. Reddit is where people *browse* tattoos. Huge difference.

**Implementation:**
1. Create a Pinterest Business account for Inkdex.

2. Create boards for each of your 11 styles: "Blackwork Tattoo Ideas," "Japanese Tattoo Inspiration," etc.

3. Pin your best artist images (3-5 per artist) with descriptions:
   - "[Style] tattoo by [Artist Name] in [City]. Find more [style] artists on Inkdex."
   - Link each pin to the artist profile or style/city search page.

4. Use a tool like Tailwind to schedule 10-20 pins/day across different boards.

5. Rich Pin your artist profile pages so they auto-update.

6. Target: 1,000 pins in first month, tracking click-through to Inkdex via UTM params.

Pinterest SEO also helps your pages rank on Google Image Search—double benefit.

---

### 6. Implement "Similar Artists" Feature
- **Impact**: 7/10 - Increases pages per session and keeps users in discovery loop
- **Confidence**: 9/10 - You literally have CLIP embeddings; this is cosine similarity
- **Ease**: 8/10 - Technical implementation is straightforward for you
- **ICE Score**: 24

You have the infrastructure for this and it's low-hanging fruit for engagement.

**Implementation:**
1. On every artist profile, add "Artists with similar style" section showing 4-6 visually similar artists.

2. Calculate similarity using your existing CLIP embeddings—find nearest neighbors in embedding space.

3. Filter by geographic proximity optionally: "Similar artists near [City]"

4. This creates natural internal linking (SEO benefit) and extends session duration.

5. Track "similar artist click rate" as a product engagement metric.

---

### 7. Create Shareable "Style Match" Results
- **Impact**: 7/10 - Viral potential if executed well
- **Confidence**: 6/10 - Depends on hitting the right psychological trigger
- **Ease**: 7/10 - You have dynamic OG images; extend the concept
- **ICE Score**: 20

Turn your search into a shareable personality-quiz-style experience.

**Implementation:**
1. Create a "Find Your Tattoo Style" quiz or instant result:
   - User uploads reference image or describes their idea
   - Your ML classifies the style
   - Generate shareable result: "Your tattoo style is: Traditional. You're drawn to bold lines, limited color palettes, and timeless designs. Find Traditional artists near you →"

2. Make the result card visually stunning and sized for Instagram Stories (9:16).

3. Include Inkdex branding and a CTA: "Find your style at inkdex.io"

4. One-tap sharing to Instagram, Twitter, Pinterest.

5. Track viral coefficient: (shared results × new users per share) / total results generated.

---

### 8. Partner with Tattoo-Adjacent Communities
- **Impact**: 6/10 - Slower burn but builds sustainable awareness
- **Confidence**: 7/10 - Partnership distribution is proven
- **Ease**: 6/10 - Requires outreach and relationship building
- **ICE Score**: 19

Go where your users already congregate but aren't being marketed to.

**Implementation:**
1. Identify tattoo-adjacent communities:
   - Aftercare product brands (Mad Rabbit, Hustle Butter)
   - Tattoo-themed clothing/jewelry brands
   - Tattoo convention organizers
   - Tattoo supply companies
   - Tattoo removal clinics (ironic but high-intent audience)

2. Offer value exchange:
   - "Feature your products/brand on our style guide pages"
   - "We'll link to you as 'recommended aftercare' on artist profiles"
   - "Co-create content: 'Best [Style] Tattoos of 2025' featuring your community"

3. Start with one partnership, prove the model, scale.

---

## Quick Wins

### 1. DM 50 Artists Today and Tomorrow (4 hours total)
Pick your best 50 artist profiles (highest image quality, active IG accounts). Send personalized DMs using the script in recommendation #1. Track responses in a simple spreadsheet.
*Links to: Artist Outreach Campaign*

### 2. Optimize Title Tags on Top 20 City Pages (2 hours)
Go to Google Search Console → Performance. Find your city pages with impressions but low CTR. Rewrite title tags to include "[Style] Tattoo Artists in [City]" format.
*Links to: Long-Tail SEO Optimization*

### 3. Add Exit-Intent Email Capture (3 hours)
Use a tool like Sumo, OptinMonster, or build a simple modal. Trigger on exit intent (desktop) or scroll up (mobile). Offer the "10 Questions to Ask" guide. Connect to Mailchimp/ConvertKit.
*Links to: Email Capture Loop*

### 4. Pin 50 Images to Pinterest (2 hours)
Create account, create 11 style boards, pin your 5 best images from each style with keyword-rich descriptions and links back to Inkdex.
*Links to: Pinterest Strategy*

### 5. Add "Similar Artists" to 3 Profile Pages (3 hours)
Prototype the similar artists feature on 3 high-traffic profiles. Use your CLIP embeddings to find 5 nearest neighbors. Deploy and measure engagement.
*Links to: Similar Artists Feature*

---

## 30-Day Roadmap

### Week 1: Artist Outreach Blitz
- [ ] DM 100 artists (20/day Mon-Fri)
- [ ] Create "Artist FAQ" page for common claim questions
- [ ] Set up tracking: outreach → response → claim → pro conversion
- [ ] Optimize title tags on top 50 city pages
- [ ] Submit re-crawl request in GSC for updated pages

### Week 2: Email + Pinterest Foundation
- [ ] Launch email capture modal (target: 50 subscribers)
- [ ] Create first welcome email automation
- [ ] Set up Pinterest business account
- [ ] Pin 200 images across all style boards
- [ ] DM another 100 artists

### Week 3: Product Engagement Loop
- [ ] Ship "Similar Artists" feature sitewide
- [ ] Add "Save Artist" functionality (requires email)
- [ ] Create first "New Artists This Week" email digest
- [ ] Write 5 new [style] + [city] SEO pages based on search data
- [ ] Follow up with non-responding artists from Week 1

### Week 4: Measure + Iterate
- [ ] Analyze: Which artist outreach messages got best response rate?
- [ ] Analyze: Which city pages driving most traffic? Double down.
- [ ] Analyze: Email capture rate—is the offer compelling enough?
- [ ] Plan "Style Quiz" feature based on learnings
- [ ] Set targets for Month 2 based on Month 1 baselines

---

## Metrics to Track

### 1. Claimed Artist Profiles
- **Target**: 50 by end of Month 1
- **How to measure**: Count of artists who completed IG OAuth
- **Why it matters**: Zero claimed profiles = no marketplace, no revenue. This is your #1 priority metric.

### 2. Organic Search Traffic
- **Target**: 200 users/week by end of Month 1 (up from ~50-100/week)
- **How to measure**: Google Search Console + PostHog
- **Why it matters**: Your only scalable, sustainable acquisition channel at your budget.

### 3. Profile View Rate
- **Target**: 50% of sessions include at least one profile view
- **How to measure**: PostHog funnel: session start → profile view
- **Why it matters**: Users who don't view profiles aren't getting value. This is your activation metric.

### 4. Email Subscribers
- **Target**: 200 by end of Month 1
- **How to measure**: Mailchimp/ConvertKit subscriber count
- **Why it matters**: Your only owned channel for retention and reactivation.

### 5. Pinterest Referral Traffic
- **Target**: 50 users/week from Pinterest by end of Month 1
- **How to measure**: UTM tracking on pin links
- **Why it matters**: Validates Pinterest as a high-intent channel worth investing in.

### 6. Pages Indexed
- **Target**: 4,000+ pages indexed in Google
- **How to measure**: GSC → Coverage report
- **Why it matters**: Pages that aren't indexed can't rank. Your sitemap bug may have caused de-indexing.

### 7. Artist Outreach Response Rate
- **Target**: 20% response rate, 10% claim rate
- **How to measure**: Spreadsheet tracking: DMs sent → responses → claims
- **Why it matters**: Understanding this funnel tells you if you need better messaging or better targeting.

### 8. Session Duration / Pages per Session
- **Target**: 3+ minutes, 4+ pages per session
- **How to measure**: PostHog session analytics
- **Why it matters**: Longer sessions = users finding value = higher likelihood of conversion.

---

## Final Thoughts

You're not failing—you're learning. The data from your paid ad experiment is worth far more than the $100 it cost. You now know definitively: **intent-based organic traffic is your unlock.**

The next 30 days should feel uncomfortable because you'll be doing things that don't scale: manually DMing artists, manually optimizing pages, manually building Pinterest presence. But these activities will teach you what messages resonate, what content ranks, and what converts.

Once you have 50 claimed profiles and 500 organic users/week, you'll have the foundation to experiment with viral features, referral programs, and eventually paid acquisition. But not before.

Stop spreading thin. Go deep. Own one channel first.
`;

const strategy = parseStrategy(DEMO_STRATEGY);

const mockInput = {
  productDescription: "Inkdex - Visual search engine for finding tattoo artists by style. Uses AI/ML (CLIP embeddings) to match tattoo inspiration images to artists who work in that style.",
};

export default function DemoResultsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Demo banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2">
        <p className="text-center text-sm text-amber-600">
          Demo preview — This is sample output for Inkdex
        </p>
      </div>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6">
          {/* Export bar - full width */}
          <div className="max-w-4xl mx-auto lg:max-w-none lg:ml-[220px]">
            <ExportBar
              markdown={DEMO_STRATEGY}
              runId="demo"
              shareSlug={null}
              productName={mockInput.productDescription?.slice(0, 50)}
            />
          </div>

          {/* Mobile TOC - horizontal tabs */}
          <TableOfContents strategy={strategy} />

          {/* Desktop layout: sidebar + content */}
          <div className="lg:flex lg:gap-8 py-8">
            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden lg:block lg:w-[200px] lg:flex-shrink-0">
              <TableOfContents strategy={strategy} />
            </div>

            {/* Main content */}
            <div className="flex-1 max-w-4xl">
              <ResultsContent strategy={strategy} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
