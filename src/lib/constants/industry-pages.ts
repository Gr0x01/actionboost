/**
 * Industry page content for /marketing-plan/[industry]
 * Each page targets "[industry] marketing plan" keywords
 */

export interface IndustryPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubhead: string;
  painPoints: string[];
  whatToInclude: {
    title: string;
    description: string;
  }[];
  exampleSlug: string | null;
  exampleTeaser: string;
}

export const INDUSTRY_PAGES: Record<string, IndustryPage> = {
  saas: {
    slug: "saas",
    title: "SaaS",
    metaTitle: "SaaS Marketing Plan Template | 30-Day Growth Strategy",
    metaDescription:
      "Get a marketing plan built for SaaS. Competitor analysis, channel strategy, and a 30-day roadmap based on what's actually working in your market.",
    heroHeadline: "SaaS Marketing Plan",
    heroSubhead:
      "You're building features, not funnels. Your marketing plan shouldn't take a month.",
    painPoints: [
      "You're spending more to acquire customers than they'll ever pay you, and your CAC keeps climbing with every ad campaign.",
      "Free trials convert at 2% while competitors with worse products somehow dominate the search results you should own.",
      "Your content strategy is 'post something on LinkedIn when we remember' and it shows in your pipeline.",
      "Churn is eating your growth because you're acquiring the wrong customers who never needed your product.",
      "You know product-led growth works but can't figure out how to balance self-serve with your sales team's quota.",
    ],
    whatToInclude: [
      {
        title: "Positioning Against Alternatives",
        description:
          "SaaS buyers compare 5+ tools before deciding—your plan needs to define exactly why you win against specific competitors.",
      },
      {
        title: "Channel-CAC Economics",
        description:
          "Map each acquisition channel to its true cost so you stop burning budget on channels that don't pay back within your runway.",
      },
      {
        title: "Trial-to-Paid Conversion Strategy",
        description:
          "Your free tier is either a growth engine or a cost center—plan the activation triggers that turn freeloaders into customers.",
      },
      {
        title: "Content Moat Building",
        description:
          "SEO compounds over time, making it the only channel where your marketing gets cheaper as you grow.",
      },
      {
        title: "Expansion Revenue Plays",
        description:
          "The cheapest customer to acquire is one you already have—plan upsells and cross-sells before you need them.",
      },
    ],
    exampleSlug: "saas-email-productivity",
    exampleTeaser:
      "See how a B2B email productivity tool plans to compete with Lavender's 14K monthly organic visits by targeting underserved segments they ignore.",
  },
  ecommerce: {
    slug: "ecommerce",
    title: "E-commerce",
    metaTitle: "E-commerce Marketing Plan Template | Shopify & DTC Strategy",
    metaDescription:
      "Marketing plan built for e-commerce brands. SEO gaps, paid strategy, and a 30-day roadmap based on competitor research in your niche.",
    heroHeadline: "E-commerce Marketing Plan",
    heroSubhead:
      "Rising ad costs and fierce competition make profitable growth feel impossible.",
    painPoints: [
      "Your Facebook and Google ad costs keep climbing while ROAS keeps shrinking, eating into already thin margins.",
      "You're competing against Amazon listings and massive retailers with unlimited marketing budgets and SEO authority.",
      "Product pages sit buried on page 5 of Google while competitors rank for every keyword you should own.",
      "You've tried influencer campaigns, email flows, and TikTok trends but nothing seems to compound into lasting growth.",
      "Every marketing guru sells a different playbook, leaving you scattered across channels without a cohesive strategy.",
    ],
    whatToInclude: [
      {
        title: "Product SEO Strategy",
        description:
          "Rank your product and collection pages for buyer-intent keywords that actually convert to sales.",
      },
      {
        title: "Paid Ads Roadmap",
        description:
          "Know exactly which products to push, which audiences to target, and when to scale versus cut spend.",
      },
      {
        title: "Competitor Gap Analysis",
        description:
          "Find the keywords, content angles, and channels your competitors are ignoring or underserving.",
      },
      {
        title: "Email & Retention Flows",
        description:
          "Turn one-time buyers into repeat customers with strategic post-purchase sequences that increase LTV.",
      },
      {
        title: "Content Calendar",
        description:
          "Plan seasonal campaigns, product launches, and evergreen content that builds organic traffic month over month.",
      },
    ],
    exampleSlug: "shopify-candles-growth",
    exampleTeaser:
      "See how we analyzed an artisan candle brand and uncovered the SEO gaps Brooklyn Candle Studio left wide open.",
  },
  consulting: {
    slug: "consulting",
    title: "Consulting",
    metaTitle: "Consultant Marketing Plan Template | Build Your Pipeline",
    metaDescription:
      "Marketing plan for consultants and coaches. LinkedIn strategy, lead magnets, and a 30-day roadmap to fill your pipeline without cold outreach.",
    heroHeadline: "Consultant Marketing Plan",
    heroSubhead:
      "Your expertise is clear. Your pipeline to clients? Not so much.",
    painPoints: [
      "You've built your practice on referrals, but they're unpredictable and you can't scale what you can't control.",
      "LinkedIn feels like shouting into a void—you post consistently but it rarely converts to actual discovery calls.",
      "You know you should 'build your personal brand' but have no idea what that means in terms of actual revenue.",
      "Feast-or-famine cycles drain you—one month you're overbooked, the next you're anxious about where clients will come from.",
      "You've tried webinars, lead magnets, and content strategies that work for product businesses but fall flat for services.",
    ],
    whatToInclude: [
      {
        title: "Your Ideal Client Profile",
        description:
          "Generic 'mid-level managers' won't cut it—you need specifics like industry, company size, and the exact moment they realize they need help.",
      },
      {
        title: "Your Authority Platform",
        description:
          "Pick one channel to own completely—whether it's LinkedIn, a podcast, or speaking—instead of spreading yourself thin across five.",
      },
      {
        title: "Referral System That Scales",
        description:
          "Turn happy clients into a predictable source of intros with specific asks, timing, and incentives that make referring you easy.",
      },
      {
        title: "Content-to-Conversation Path",
        description:
          "Map exactly how a stranger goes from seeing your post to booking a discovery call—most consultants skip this entirely.",
      },
      {
        title: "Pricing and Packaging Strategy",
        description:
          "Structure your offers so prospects can say yes at different commitment levels, from a workshop to a retainer.",
      },
    ],
    exampleSlug: "leadership-coaching-pipeline",
    exampleTeaser:
      "See how a leadership coach mapped out a plan to fill a $96K pipeline targeting tech managers—without competing with BetterUp's marketing budget.",
  },
  agency: {
    slug: "agency",
    title: "Agency",
    metaTitle: "Agency Marketing Plan Template | Win More Clients",
    metaDescription:
      "Marketing plan for digital agencies. Positioning, inbound strategy, and a 30-day roadmap to stop relying on referrals alone.",
    heroHeadline: "Agency Marketing Plan",
    heroSubhead:
      "You build marketing plans for clients daily. When did you last make one for yourself?",
    painPoints: [
      "You're so busy delivering client work that marketing your own agency keeps getting pushed to next month.",
      "You compete on price because you haven't clearly defined what makes your agency different from the hundreds of others.",
      "Your website and case studies are outdated, but updating them never feels as urgent as client deadlines.",
      "You rely heavily on referrals and panic when they slow down because you have no predictable lead generation system.",
      "You know exactly what your clients should do but struggle to apply that same strategic thinking to your own business.",
    ],
    whatToInclude: [
      {
        title: "Positioning Statement",
        description:
          "Define your niche and ideal client so you stop competing with every other generalist agency on price.",
      },
      {
        title: "Service Packaging Strategy",
        description:
          "Structure your offerings to attract better clients and escape the endless cycle of custom quotes.",
      },
      {
        title: "Lead Generation Channels",
        description:
          "Build predictable inbound pipelines so you're not dependent on referrals drying up or flooding in.",
      },
      {
        title: "Case Study Development",
        description:
          "Turn your best client wins into compelling proof that sells your expertise before the first call.",
      },
      {
        title: "Thought Leadership Plan",
        description:
          "Position your team as experts through content that attracts clients who value expertise over low prices.",
      },
      {
        title: "Capacity-Based Goals",
        description:
          "Set realistic growth targets that match your team size and prevent the feast-or-famine revenue swings.",
      },
    ],
    exampleSlug: "digital-agency-growth",
    exampleTeaser:
      "See how a $600K agency with zero marketing pipeline plans to escape referral dependency and build predictable inbound.",
  },
  newsletter: {
    slug: "newsletter",
    title: "Newsletter",
    metaTitle: "Newsletter Marketing Plan Template | Grow Your Subscribers",
    metaDescription:
      "Marketing plan for newsletter creators. Growth tactics, monetization strategy, and a 30-day roadmap based on what top newsletters actually do.",
    heroHeadline: "Newsletter Marketing Plan",
    heroSubhead:
      "Growing a newsletter without a plan means slow subscriber growth and burnout.",
    painPoints: [
      "You're writing great content but subscriber growth has flatlined for months, and you don't know what's broken.",
      "Monetization feels like a guessing game—you're not sure when to launch paid tiers or how to price them.",
      "Platform algorithms change constantly, making you nervous about building on rented land instead of owned audience.",
      "Cross-promotion and referral programs sound great, but you have no system to track what actually drives signups.",
      "You spend hours on each issue but have no strategy for turning one-time readers into long-term subscribers.",
    ],
    whatToInclude: [
      {
        title: "Subscriber Acquisition Channels",
        description:
          "Map out exactly where your ideal readers hang out and how you'll reach them consistently.",
      },
      {
        title: "Content Pillar Strategy",
        description:
          "Define 3-4 core topics that keep subscribers engaged and make your newsletter indispensable.",
      },
      {
        title: "Monetization Timeline",
        description:
          "Plan when to introduce paid offerings based on subscriber milestones, not arbitrary dates.",
      },
      {
        title: "Referral and Growth Loops",
        description:
          "Design systems where existing readers actively bring you new subscribers without constant promotion.",
      },
      {
        title: "Retention and Engagement Metrics",
        description:
          "Track the numbers that actually predict long-term growth, not just vanity open rates.",
      },
    ],
    exampleSlug: "newsletter-growth-strategy",
    exampleTeaser:
      "See how a 2,500-subscriber AI newsletter plans to hit 10K and escape the shadow of giants like The Rundown AI.",
  },
};

export const INDUSTRY_SLUGS = Object.keys(INDUSTRY_PAGES);
