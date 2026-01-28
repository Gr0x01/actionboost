import { Header, Footer } from "@/components/layout";
import {
  HeroWithExplainer,
  ResearchProof,
  Objections,
  FAQSection,
  Pricing,
  FooterCTA,
} from "@/components/landing";
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  FAQPageSchema,
} from "@/components/seo";

const HOMEPAGE_FAQS = [
  {
    question: "What exactly is Boost?",
    answer:
      "Boost is a marketing plan generator that creates custom 30-day plans for small businesses and solopreneurs. It uses live competitor research—real traffic data, channel analysis, and content performance—to build a specific plan tailored to your business, stage, and market. For a one-time $29 payment, you get a complete marketing plan in under 5 minutes: competitive analysis, prioritized channel strategy, weekly roadmap, and ready-to-use content templates. No subscription. Full refund if it doesn't help.",
  },
  {
    question: "How do I create a marketing plan for my small business?",
    answer:
      "Start with competitive research: find out where your competitors get traffic, what content works for them, and where the gaps are. Then pick 1-2 channels, build a 30-day roadmap, and set measurable goals. Boost automates the research part—you answer a few questions about your business, and it generates a complete plan based on live competitor data.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "ChatGPT gives generic marketing advice based on its training data. Boost pulls live data about your specific competitors—their traffic sources, top-performing content, and channel strategies—then builds recommendations around gaps and opportunities in your actual market.",
  },
  {
    question: "What do I get for $29?",
    answer:
      "A complete 30-day marketing plan including: competitive landscape analysis with real traffic data, prioritized channel strategy ranked by effort and impact, specific tactics to stop and start, a week-by-week roadmap, and metrics dashboard with targets. One-time payment, no subscription.",
  },
  {
    question: "How long does it take?",
    answer:
      "Under 5 minutes from start to finish. You answer a few questions about your business and competitors, we run the research, and your plan is ready. Most of that time is spent waiting for competitor data to load.",
  },
  {
    question: "What if it doesn't work for my business?",
    answer:
      "Full refund, no questions asked. We've generated plans for SaaS, e-commerce, consultants, coaches, agencies, and niche businesses like equestrian products. If your plan isn't useful, just email us.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. $29 one-time payment. You get your marketing plan and it's yours forever. No monthly fees, no recurring charges, no upsells to a 'pro' tier.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <FAQPageSchema faqs={HOMEPAGE_FAQS} />
      <Header />

      <main className="flex-1">
        {/* 1. Hero + chaos → clarity transformation */}
        <HeroWithExplainer />

        {/* 2. Real research vs AI guessing */}
        <ResearchProof />

        {/* 3. Handle objections directly */}
        <Objections />

        {/* 5. Pricing with value stack */}
        <Pricing />

        {/* 6. FAQ section for AI search (after pricing to avoid cooling conversion arc) */}
        <FAQSection faqs={HOMEPAGE_FAQS} />

        {/* 7. Final push */}
        <FooterCTA />
      </main>

      <Footer />
    </div>
  );
}
