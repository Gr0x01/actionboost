# Reddit Posts

## Brief (Use for All Future Posts)

**Voice:** Write like a founder typing into the Reddit post box at 11pm, not a content marketer polishing a blog post.

- No literary closers or quotable one-liners. No "Sometimes the feature isn't what you add" stuff.
- Imperfect sentence structure is fine. Short fragments. Trailing thoughts.
- No bold section headers unless it's a list of lessons. Reddit posts don't have H2s.
- Don't embellish or exaggerate facts. Stick to what actually happened.
- No "hook + build + payoff" article structure. Just tell the story.
- End naturally — "anyway, hope this helps someone" energy.
- No product name, no URL, no CTA. Ever.
- No marketing language ("game-changer", "revolutionary", "stop guessing").

---

## 1. Feature Flag Disaster

**Target:** r/SaaS or r/startups

**Title:** Killed my own launch with a feature flag I forgot about

Launched my first paid product last week. $29, AI thing, spent months building it. Launch day I'm watching signups come in and nobody's converting. Like zero. Not even the free tier.

I'm thinking my pricing is off or the value prop sucks or something fundamental is broken. Spent an hour refreshing analytics and checking different browsers.

Then I looked at Vercel env vars. NEXT_PUBLIC_PRICING_ENABLED=false. From when I was testing the landing page before launch. The flag was still there. Checkout button literally didn't work. Free tier button didn't work. Nothing worked.

The only thing that worked was promo codes because I'd built that path separately for a pre-launch thing.

So the first 2 actual customers used a promo code I'd shared in a Discord, but then their runs got stuck. Different bug. I was using fire-and-forget background jobs and didn't realize Vercel serverless functions just die when the response finishes. Your code doesn't keep running. I had to switch to their after() API.

Had to manually unstuck their runs in the database and gave them both free credits. They were cool about it but man.

Flipped the flag, deployed, fixed the serverless thing. Everything's working now. But I burned like 6 hours of launch day momentum being an idiot.

I tested checkout flow in dev like 50 times. I tested it in preview deploys. I just never tested it in production because I assumed the deploy would work the same. And I completely forgot about that feature flag because I set it weeks ago.

Now I have a checklist. Sounds obvious but I didn't have one before.

Anyway if you're solo and doing your first launch, check your env vars before you tweet about it. And test in actual production even if you feel dumb doing it.

---

## 2. Wall of Text Feedback

**Target:** r/SaaS or r/solopreneur

**Title:** I was giving users 3000 words of strategy. They said "too much to read." Fixed it with a 6 cent summary layer.

Launched my AI thing last week. Generates marketing strategy for founders, and it works pretty well. Tells you your competitors, channels to try, positioning stuff.

But 3 different people in the first 48 hours said basically the same thing, "this is a lot to read through". They were right, the output was like 3000 words of markdown. Comprehensive, but nobody knew where to start.

I spent the next few days trying different things to figure out the best way to fix it. Thought I'd need to rewrite the whole generation prompt, add user preferences, or let people pick what sections they want.

Then I just tried something dumb. What if I throw more AI at it to read the report and pull out the actionable stuff? So now I have AI in my AI.
Extra cost per run: $0.06.

Put the key insights and action items at the top. Collapsed the analysis sections into accordions below. Same content, just reordered.
First person to use the new version, "oh this is perfect, I know exactly what to do",

Even though I'm a product designer, I'd been too focused on making the analysis better. More thorough, more accurate. Which matters, but what people actually needed was just to tell me what to do first. They can read the why later if they want.

Not really a groundbreaking insight, but a good reason to really make sure to think of the right "why".

---

## 3. n8n Reddit Automation

**Target:** r/SaaS or r/solopreneur

**Title:** turned reddit monitoring into a 15min/day thing with n8n + claude

been lurking here for months trying to find conversations where i could actually help people. problem is i was spending 2+ hours a day scrolling through r/SaaS, r/solopreneur, r/startups, r/Entrepreneur, r/ecommerce looking for relevant threads.

got tired of it and built a workflow in n8n that does it for me now.

here's what it does:

pulls RSS feeds from those subs every few hours. sends each post to Claude API with a scoring prompt - basically "rate this 0-10 for how relevant it is to [my specific domain]". anything under 7 gets filtered out.

for posts that score 7+, it sends another Claude prompt to draft a comment. the key instruction is "do not sell anything, just try to add value - if you can't genuinely help, return SKIP"

then it posts everything to a slack channel - the post link, the relevance score, and the draft comment.

i check slack a couple times a day. honestly the comments are pretty good - i use maybe 1 in 5 completely as-is, tweak most of the rest, and skip about 20% where claude couldn't figure out how to add value without being salesy.

whole thing took maybe 3 hours to build and costs like $5/month in API calls.

went from 2+ hours of scrolling to 15 minutes of reviewing. plus i'm not browsing reddit at 11pm anymore which is probably good for my mental health.

not sure if this helps anyone but if you're doing the same thing (manually monitoring reddit for relevant convos), n8n + claude is stupid easy to set up. the scoring step is what makes it work - without that you're just drowning in notifications.

---

## 4. Audience Pivot

**Target:** r/startups or r/Entrepreneur

**Title:** I built for the wrong audience and realized it in a week

Launched my product last week. It's an AI thing that generates marketing plans with actual competitor research, not generic advice.

I thought my customers would be small local businesses. Salons, plumbers, people selling on Etsy. Makes sense right? They need marketing help, they don't have budgets for agencies, perfect fit.

Launched on Product Hunt, posted in a few places. Got some traction but zero conversions from the people I thought I was building for.

The people who actually signed up? SaaS founders. Solopreneurs building tech products. E-commerce operators. Not a single salon owner.

Took me like 3 days to realize the obvious: salon owners aren't hanging out on Product Hunt. They're not scrolling Reddit at midnight looking for AI tools. They don't even know what I'm talking about half the time.

But the people who ARE here, the ones who found me organically, they got it immediately. They have the same problem (marketing is hard) but they speak the language. They understand the value prop in 10 seconds.

So I'm pivoting the messaging. Same product, different audience. Feels weird because the tool works just as well for a local business, but if they can't find me and I can't find them, what's the point?

Also humbling: I found a direct competitor yesterday. They have a 12-person team, been around for 4+ years, and get like 1,500 organic visits a month. I have a better product (I think) but they have distribution.

I've been thinking about features this whole time when I should have been thinking about who can actually discover this thing.

Anyway if you're building something, maybe think about whether your target customer even hangs out where you're planning to launch. Sounds obvious but I completely missed it.

---

## 5. $40 Launch Week

**Target:** r/SaaS or r/solopreneur

**Title:** I spent $40 on launch directories and made ~$400 in a week. Here's what actually happened.

Launched my AI thing last Monday. Generates marketing plans for $29. Solo dev, bootstrapped, the usual.

**Day 0:** Posted to r/sideprojects. Got downvoted to -3 and a bunch of spam DMs offering to "boost" my launch. Cool. Submitted to PeerPush ($25) and Uneed ($15). That's my whole marketing budget.

**Day 1:** Woke up to checkout completely broken. Feature flag misconfiguration. Also serverless functions timing out mid-generation so people paid and got nothing. Spent the morning unfucking everything and giving stuck users free credits. One of them sent a testimonial anyway which was wild. Uneed approved the listing.

**Day 2:** Someone left feedback: "it's a lot of text." They were right. The output was a wall of text. Spent the whole day rebuilding the AI pipeline to be more structured. Added a progress indicator so people aren't staring at a blank screen for 60 seconds. Didn't do any marketing. Just fixed stuff.

**Day 3:** Realized the messaging was off. Redesigned the entire landing page. Rewrote everything. Pushed it live at like 2am.

**Day 4:** Pivot moment. Started targeting tech founders instead of small business owners. Changed the whole brand voice to match. Same day hit #1 App of the Week on PeerPush which actually drove real traffic.

**Day 5:** Built a Reddit automation with n8n to post in relevant threads without being spammy. Added an examples page because people kept asking "what does the output look like." Otherwise pretty light day, watched football.

**Day 6:** SEO stuff. Built out a pillar page, 5 industry-specific pages, sitemap, internal linking. Probably won't matter for months but whatever.

**What I learned:**

**r/sideprojects is useless for B2B.** Just spam and downvotes. Don't bother.

**Fix bugs immediately and over-deliver.** The people who got broken checkouts could've chargebacked. Instead they left testimonials because I gave them extras and actually responded.

**Niche communities > broad audiences.** Posting in BIP groups got more traction than general startup Twitter. People who gather around specific problems actually care.

**Positioning beats features.** The product barely changed between Day 1 and Day 6 but revenue went up because I finally figured out who it was for.

The $40 in directories was worth it. PeerPush especially. Uneed was fine but didn't drive much. Everything else was just fixing what was broken and talking to the 5 people who actually tried it.

anyway hope this is useful to someone

---

## 6. Drop Your URL — Free Competitor Intel

**Target:** r/SaaS (primary), then rotate to r/microsaas, r/startups, r/Entrepreneur
**Type:** Lead gen / case study thread (repeatable)
**Cap:** 10-15 per thread (~$20-30 cost)
**Best timing:** Tuesday-Thursday, mid-morning US time

### Learnings (Jan 28, 2026)

Posted to r/microsaas with builder-focused title: "I built a competitive research script — want me to run it on your product?" Got 2 upvotes, 0 comments.

Same day, another user posted: "Drop your SaaS and I'll give you honest feedback for free" — 11 upvotes, 53 comments.

**What worked for them:**
- Title is about THEM getting something, not about you building something
- "Honest feedback" > "competitive research" — sounds like a conversation, not a report
- No mention of tool/script/AI — just a direct offer
- "Don't tell me what your SaaS is for, I need to know it by looking at your page" — clever constraint that makes it feel more authentic

**Revised approach:** Lead with what they get, not what you built. Mention the tool only in the body as context for why you can deliver.

---

### r/SaaS version (revised)

**Title:** Drop your URL and I'll tell you what your competitors are doing that you're not

I didn't know what to do for marketing my own product. Every guide and chatgpt output was generic stuff I'd already read. So I built a tool that researches my competitors and tells me what to actually do.

It worked way better than I expected. Now I want to stress-test it on different types of businesses and build up some case studies. So I figured I'd offer some free runs here.

What you'd get:

- Your top competitors
- Traffic estimates
- Keyword gaps
- A positioning observation (where you sit relative to them and what angle might be open)

Each run costs me about $2 so I'm capping this at 10 people. Drop your url, a blurb about what you do, and a little about what you're currently tackling in marketing. I'll run it and share what comes back.

Solo so it might take me a day to get through everyone. Genuinely just want to see how it performs across different niches.

### Reply template (public comment)

Keep to 4-6 bullets. Give enough value that lurkers want one too.

> Took a look at [domain]. Here's what jumped out:
>
> - Top 3 competitors in your space: X, Y, Z
> - [One specific insight — e.g. "Y is running ads against your exact brand name"]
> - [One gap — e.g. "Nobody's targeting [keyword], decent volume there"]
> - [One positioning observation — e.g. "You and X sound identical on your homepages"]
>
> Happy to share the full breakdown if you want — just DM me.

**In the DM:** Send the full output. At the end, one line only: "I built a tool that generates these automatically if you ever want to run one yourself — happy to share the link." Only if they engage. If they don't ask, leave it. Warm lead either way.

### If it blows up (50+ requests)

- Edit post: "Got way more responses than expected. Working through these — will get to as many as I can over the next few days."
- Prioritize most-upvoted replies.
- Do your 10-15. For the rest: "Haven't forgotten about you — I'll DM you when I get to yours." (Gives you a reason to DM 30+ people later.)
- Screenshot the thread. Use for social proof everywhere.

### If it flops (2-3 replies)

- Do NOT delete. Give those 2-3 people maximum effort replies.
- Repost in a different sub 5-7 days later with a different angle.
- Check your timing — Sunday night will underperform vs Tuesday morning.

### Varying by subreddit (don't copy-paste)

**Key learning:** Titles about THEM getting something outperform titles about YOU building something. Lead with the offer, not the tool.

| Sub | Title | Tone |
|---|---|---|
| r/SaaS | "Drop your URL and I'll tell you what your competitors are doing that you're not" | Direct, tactical |
| r/microsaas | "Drop your SaaS — I'll tell you what I'd do differently for marketing" | Conversational, peer feedback |
| r/startups | "Drop your URL — I'll show you the positioning gaps your competitors are missing" | Strategic angle |
| r/Entrepreneur | "Drop your site and I'll tell you who's eating your lunch online" | Plain language, business-focused |

**Spacing:** One sub per week. Never cross-post the same week. Some users subscribe to multiple subs.

### Content flywheel

After 2-3 threads across subs (20-40 analyses), anonymize the best ones and post: "I analyzed 30 SaaS products' competitive positioning. Here's what I found." That meta-post will outperform all the individual threads combined. Also reuse analyses as Twitter content and /in-action examples.

---

## 7. Organic Comment Replies

**Type:** Value-first replies to existing threads asking about competitor tracking / marketing strategy
**Target subs:** r/AskMarketing, r/ecommerce, r/SaaS, r/Entrepreneur, r/digital_marketing

When you see someone asking "how do I track competitors" or "what should I do for marketing" — reply with actual useful info first, soft offer at the end.

### Template: Competitor Tracking Question

Example thread: "Do you track your competitor moves in digital marketing?"

**Reply:**

Honestly most "competitor tracking" tools are overkill for what you actually need.

For ads, the simplest thing is Meta Ad Library (ads.facebook.com/ads/library) — just search your competitors by name and you can see every ad they're currently running. Creative, copy, when it started. Free and updated in real time. Google has a similar thing at adstransparency.google.com.

For email, sign up for their lists with a burner email. Make a folder, let them pile up. Once a month skim through and note what promos they ran and when.

For SEO/keywords, the free tier of Ubersuggest or even just googling "[competitor] vs" and seeing autocomplete will show you what people compare them to.

The stuff that's actually useful vs noise: their ad creative (what angles are they testing?), their pricing/promo cadence (do they discount monthly? quarterly?), and what keywords they're bidding on. Everything else is usually vanity metrics.

I built a tool that does this automatically because I got tired of doing it manually for my own product — happy to run your store through it if you want to see what it finds.

---

**Pattern:**
1. Give genuinely useful free/DIY methods first (3-4 concrete tips)
2. Answer their actual question
3. Soft offer at the end: "I built something that does this — happy to run yours through it"
4. No product name, no URL, no hard CTA

**If they reply interested:** Run Boost, give them a taste in the public reply (2-3 bullets), offer full breakdown via DM. Same conversion path as "drop your URL" threads.
