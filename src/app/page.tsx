import Link from "next/link";
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
      "Boost researches your competitors and your market — real traffic data, channel analysis, content performance — and tells you exactly what to do next. For a one-time $29 payment, you get a full competitive diagnosis in under 10 minutes: where your competitors get traffic, the gaps they're missing, what channels to focus on, and what to do first. No subscription. Full refund if it doesn't help.",
  },
  {
    question: "How do I figure out what marketing to focus on?",
    answer:
      "Boost pulls live data on your competitors — traffic sources, content performance, gaps — and tells you where to focus. You answer a few questions about your business, we do the research and show you which 1-2 channels are actually worth your time.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "ChatGPT gives generic marketing advice based on its training data. Boost pulls live data about your specific competitors—their traffic sources, top-performing content, and channel strategies—then builds recommendations around gaps and opportunities in your actual market.",
  },
  {
    question: "What do I get for $29?",
    answer:
      "A full competitive diagnosis: where your competitors get traffic, the channels worth your time (ranked by effort and impact), what to stop doing, what to start, and exactly what to do next — in what order and why. One-time payment, no subscription.",
  },
  {
    question: "How long does it take?",
    answer:
      "Under 10 minutes from start to finish. You answer a few questions about your business and competitors, we run the research, and your results are ready. Most of that time is spent pulling live market data.",
  },
  {
    question: "What if it doesn't work for my business?",
    answer:
      "Full refund, no questions asked. We've done this for SaaS, e-commerce, consultants, coaches, agencies, and niche products in markets you'd never expect. If your competitors have websites, Boost can research them. Not useful? Full refund.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. $29 one-time payment. You get your Boost and it's yours forever. No monthly fees, no recurring charges, no upsells to a 'pro' tier.",
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

        {/* Boost-lite free CTA bridge */}
        <div className="w-full border-y-2 border-foreground/10 bg-[#FDF8F3] py-5">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-base sm:text-lg text-foreground/70">
              Want to see what Boost finds for your business?{" "}
              <Link
                href="/start?free=true"
                className="font-semibold text-cta underline decoration-cta/40 decoration-2 underline-offset-[3px] transition-all hover:decoration-cta"
              >
                Try a free preview
              </Link>
              . No payment, no&nbsp;signup.
            </p>
          </div>
        </div>

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
