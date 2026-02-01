import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { config } from "@/lib/config";
import {
  ArticleSchema,
  BreadcrumbSchema,
  FAQPageSchema,
} from "@/components/seo";
import { FAQSection } from "@/components/landing";

export const metadata: Metadata = {
  title:
    "Boost vs Clawdbot (OpenClaw) for Marketing | Strategy vs Toolkit",
  description:
    "Clawdbot gives you 23 marketing skills to configure. Boost gives you one clear plan based on real competitor data. $29, no setup required.",
  alternates: {
    canonical: "https://aboo.st/boost-vs-alternatives/clawdbot",
  },
  openGraph: {
    title: "Boost vs Clawdbot (OpenClaw) for Marketing",
    description:
      "Clawdbot gives you marketing capabilities. Boost gives you marketing answers. $29, no setup required.",
    type: "article",
    url: "https://aboo.st/boost-vs-alternatives/clawdbot",
  },
};

const PAGE_FAQS = [
  {
    question: "Is Clawdbot really free?",
    answer:
      "The source code is free. Running it costs roughly $30/month for hosting and API fees, and it requires meaningful technical setup — Docker, server management, API key configuration. Boost is a one-time $29 payment with nothing to host or maintain.",
  },
  {
    question: "Can Clawdbot create a marketing plan like Boost does?",
    answer:
      "Clawdbot can generate marketing suggestions if you prompt it well. But it doesn't automatically research your competitors, pull real keyword and traffic data, or structure a prioritized 30-day action plan. You'd need to orchestrate that yourself — connect the right APIs, write the right prompts, and synthesize the output. Boost does all of that in one step.",
  },
  {
    question: "I'm not technical. Can I still use Clawdbot?",
    answer:
      "Clawdbot requires self-hosting on a server, managing Docker containers, configuring API keys, and handling updates and security. If those terms don't mean anything to you, Clawdbot isn't the right fit today. Boost requires no technical knowledge at all.",
  },
  {
    question: "What if I already have Clawdbot set up?",
    answer:
      "Use Boost to get your strategic foundation — the competitor research, keyword data, and prioritized plan. Then use Clawdbot to help execute it. They solve different problems and work well together.",
  },
];

const BREADCRUMB_ITEMS = [
  { name: "Home", url: "https://aboo.st" },
  {
    name: "Boost vs Alternatives",
    url: "https://aboo.st/boost-vs-alternatives",
  },
  {
    name: "vs Clawdbot",
    url: "https://aboo.st/boost-vs-alternatives/clawdbot",
  },
];

export default function BoostVsClawdbotPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ArticleSchema
        title="Boost vs Clawdbot (OpenClaw) for Marketing"
        description="Clawdbot gives you marketing capabilities. Boost gives you marketing answers."
        url="https://aboo.st/boost-vs-alternatives/clawdbot"
      />
      <BreadcrumbSchema items={BREADCRUMB_ITEMS} />
      <FAQPageSchema faqs={PAGE_FAQS} />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 md:px-12 py-8 md:py-16">
          {/* Hero */}
          <header className="pb-8">
            <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
              Comparison
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              Boost vs Clawdbot for&nbsp;marketing
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed text-pretty">
              Clawdbot gives you marketing capabilities. Boost gives you
              marketing answers. Use Boost for strategy, Clawdbot for
              execution — if you need&nbsp;both.
            </p>
          </header>

          {/* Quick comparison card */}
          <div
            className="rounded-md border-2 border-foreground/20 bg-white p-6 mb-10"
            style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
          >
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div />
              <div className="font-semibold text-center">
                Clawdbot
              </div>
              <div className="font-semibold text-center text-cta">Boost</div>

              <div className="text-foreground/60">What it is</div>
              <div className="text-center">Open-source AI assistant</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                Done-for-you marketing plan
              </div>

              <div className="text-foreground/60">Cost</div>
              <div className="text-center">Free code + ~$30/mo APIs</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                $29 one-time
              </div>

              <div className="text-foreground/60">Setup time</div>
              <div className="text-center">Hours to days</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                10 minutes
              </div>

              <div className="text-foreground/60">Technical skill</div>
              <div className="text-center">Docker, APIs, servers</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                None
              </div>

              <div className="text-foreground/60">Marketing data</div>
              <div className="text-center">Whatever you connect</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                Built-in (live data)
              </div>

              <div className="text-foreground/60">Ongoing cost</div>
              <div className="text-center">~$30/mo</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                $0
              </div>

              <div className="text-foreground/60">Requires strategy</div>
              <div className="text-center">Yes (you direct it)</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                No (that&apos;s the point)
              </div>

              <div className="text-foreground/60">Best for</div>
              <div className="text-center">Technical builders</div>
              <div className="text-center font-semibold bg-cta/5 rounded px-2 py-1">
                Founders who want answers
              </div>
            </div>
          </div>

          {/* Mid-page CTA */}
          <div className="text-center mb-10">
            <Link href="/start">
              <Button size="lg">Get my plan for {config.singlePrice}</Button>
            </Link>
          </div>

          {/* Content */}
          <article className="prose-boost">
            <h2>What Clawdbot (OpenClaw) actually is</h2>

            <p>
              <a href="https://github.com/clawdbot/clawdbot" target="_blank" rel="noopener noreferrer">Clawdbot</a> — now
              called OpenClaw, briefly Moltbot — went viral in January 2026.
              Peter Steinberger built an open-source AI assistant that connects
              to WhatsApp, Telegram, and Slack. It handles scheduling, research,
              writing, and more. The hype is&nbsp;earned.
            </p>

            <p>
              It has marketing plugins too: competitive intel, content writing,
              social media, brand monitoring, Google Ads, HubSpot. But
              Clawdbot is a general-purpose assistant with marketing bolted on.
              It gives you building blocks. You still have to know what
              to&nbsp;build.
            </p>

            <h2>The real cost of free</h2>

            <p>Clawdbot&apos;s code is free. Running it is not.</p>

            <p>
              <strong>Money:</strong> Server ($5-20/mo) plus API keys for LLMs
              and services. All-in for marketing use: ~$30/month ongoing.
              That&apos;s $360/year.
            </p>

            <p>
              <strong>Time:</strong> Setup, configuration, troubleshooting,
              updates. Hours to get running, more to customize marketing plugins.
              If something breaks, that&apos;s on&nbsp;you.
            </p>

            <p>
              <strong>Security:</strong> Exposed instances leaking API keys and
              conversation histories have been{" "}
              <a href="https://www.theregister.com/2026/01/27/clawdbot_moltbot_security_concerns/" target="_blank" rel="noopener noreferrer">documented</a>.
              Self-hosted tools are only as secure as your server&nbsp;config.
            </p>

            <p>
              <strong>Expertise:</strong> Clawdbot gives you raw AI output.
              Turning that into a strategy still requires knowing which questions
              to ask and how to prioritize channels. The tool doesn&apos;t close
              that&nbsp;gap.
            </p>

            <p>
              Boost costs {config.singlePrice} once. No server. No API keys. No
              maintenance. You answer questions about your business, and the
              research and prioritization are done for&nbsp;you.
            </p>

            <h2>When Clawdbot makes sense</h2>

            <ul>
              <li>
                You&apos;re technical and enjoy self-hosting — Docker, API keys,
                server management are familiar&nbsp;territory
              </li>
              <li>
                You already have a marketing strategy and want to automate
                execution (drafting posts, monitoring competitors, managing
                campaigns)
              </li>
              <li>
                You need an always-on assistant across multiple domains, not just
                marketing
              </li>
              <li>
                You want deep integration with your existing stack — HubSpot,
                Google Ads, Slack
              </li>
            </ul>

            <h2>When Boost makes sense</h2>

            <ul>
              <li>
                You need to figure out your marketing strategy in the first place
                — who your competitors are, what&apos;s working in your market,
                where to&nbsp;focus
              </li>
              <li>
                You don&apos;t want to self-host or configure anything — pay
                once, get your&nbsp;plan
              </li>
              <li>
                You want competitive research based on real traffic data, not
                just AI&nbsp;analysis
              </li>
              <li>
                Your time is more valuable than your money — {config.singlePrice}{" "}
                and five minutes of input versus hours of setup and prompt
                engineering
              </li>
            </ul>

            <h2>Use both</h2>

            <p>
              Start with Boost to get clarity: who your real competitors are,
              which keywords are worth targeting, what channels fit your
              business, and what to do in the next 30 days. Use that plan as
              your foundation.
            </p>

            <p>
              Then use Clawdbot to automate execution — drafting content,
              monitoring competitors, managing campaigns. It&apos;s a better
              tool when you know what to point it&nbsp;at.
            </p>
          </article>

          {/* FAQ Section */}
          <div className="mt-16">
            <FAQSection
              faqs={PAGE_FAQS}
              title="Clawdbot vs Boost FAQs."
              subtitle="Quick answers"
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 rounded-lg border-2 border-foreground/20 bg-white p-8 shadow-[4px_4px_0_rgba(44,62,80,0.1)] text-center space-y-4">
            <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">
              Ready?
            </p>
            <h3 className="text-2xl font-bold text-foreground text-balance">
              Get clarity without the&nbsp;setup
            </h3>
            <p className="text-foreground/70 max-w-lg mx-auto text-pretty">
              Live competitor data. 30-day roadmap. Channel-specific tactics.
              One-time {config.singlePrice}. Full refund if it&apos;s
              not&nbsp;useful.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/start">
                <Button size="xl">Get my marketing plan</Button>
              </Link>
              <Link href="/boost-vs-alternatives">
                <Button variant="outline" size="xl">
                  See all comparisons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
