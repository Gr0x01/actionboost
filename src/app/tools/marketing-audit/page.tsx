"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Globe, Loader2 } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { FAQSection } from "@/components/landing/FAQSection";
import {
  ToolFormCard,
  ToolEmailStep,
  ToolHeroSection,
  ToolWhatsYouGet,
  ToolMidCTA,
  ToolEducationalSection,
  ToolCrossLinks,
} from "@/components/free-tools";

// --- Data ---

const FAQ_ITEMS = [
  {
    question: "Is this actually free?",
    answer: "Yes. No credit card, no trial, no 'free but actually we'll call you 47 times.' You get a real audit with real findings. We built this so you can see what Boost does before you ever spend a dollar.",
  },
  {
    question: "How does the audit work?",
    answer: "We screenshot your homepage and analyze what visitors actually see in the first 3 seconds — layout, visual hierarchy, copy clarity, and conversion path. A short description of your business helps us give more relevant advice. No logins or access needed.",
  },
  {
    question: "How long does it take?",
    answer: "About 60 seconds. You'll get a prioritized list of what's hurting your site most — with specific observations and the fix that'll make the biggest difference.",
  },
  {
    question: "What happens after I get my audit?",
    answer: "You see your results immediately. No waiting for an email, no scheduling a call. If you want a plan to fix what we found, Boost builds you one for $29. But the audit is yours either way.",
  },
  {
    question: "Is my information safe?",
    answer: "We don't share your data, sell your email, or send spam. We use your URL to run the audit and your email to send the report. That's it.",
  },
];

const FEATURES = [
  {
    title: "Biggest Silent Killer",
    description: "The one thing costing you the most customers, named plainly.",
  },
  {
    title: "Clarity",
    description: "Can someone tell what makes you the only choice — not just a better choice?",
  },
  {
    title: "Customer Focus",
    description: "Is your site talking about you or about your customer's problem?",
  },
  {
    title: "Proof",
    description: "Do you show what customers become — or just what you do?",
  },
  {
    title: "Friction",
    description: "What's stopping visitors from taking the next step?",
  },
];

const EDUCATIONAL_BLOCKS = [
  {
    title: "The 3 silent sales killers on most small business websites",
    content: (
      <>
        <p>
          <strong className="text-foreground">1. It talks about you, not them.</strong>{" "}
          Visitors don&apos;t care about your story yet. They care whether you solve
          their problem. Most sites lead with &quot;About Us&quot; when they should lead
          with &quot;Here&apos;s what you get.&quot;
        </p>
        <p>
          <strong className="text-foreground">2. Google can&apos;t find it.</strong> No
          meta descriptions, no local keywords, no Google Business connection.
          You&apos;re invisible to people actively searching for what you sell.
        </p>
        <p>
          <strong className="text-foreground">3. There&apos;s no obvious next step.</strong>{" "}
          No clear button. No phone number above the fold. No booking link. Visitors
          who can&apos;t figure out how to buy in 10 seconds just leave.
        </p>
      </>
    ),
  },
  {
    title: "You look at your website like an owner. Your customers don't.",
    content: (
      <>
        <p>
          You know where the booking page is. You know what you offer. You know your
          prices are fair.
        </p>
        <p>
          But a first-time visitor doesn&apos;t know any of that. They landed 3 seconds
          ago. They&apos;re already deciding whether to stay or hit the back button.
        </p>
        <p>
          This audit shows you what that stranger actually experiences — the confusing
          bits, the missing bits, the parts that make them leave. Things you can&apos;t
          see because you know too much about your own business.
        </p>
      </>
    ),
  },
  {
    title: "Why your positioning matters more than your tactics",
    content: (
      <>
        <p>
          Most marketing advice jumps straight to tactics — post on Instagram, run
          Google Ads, start a blog. But tactics don&apos;t work if you haven&apos;t
          answered the basic question: why should anyone pick you?
        </p>
        <p>
          <strong className="text-foreground">Positioning</strong> is the answer to that
          question. It&apos;s what makes you different, who you serve best, and why your
          offer matters to them specifically. Without it, every tactic is a coin flip.
        </p>
        <p>
          The audit checks whether your positioning is visible to a stranger landing on
          your site. Can they tell what makes you different? Do they know who this is
          for? If not, no amount of ad spend will fix it.
        </p>
      </>
    ),
  },
  {
    title: "How to do a marketing audit yourself",
    content: (
      <>
        <p>
          Even without our tool, you can catch the big issues. Open your website in an
          incognito browser. Pretend you&apos;ve never seen it. Then ask:
        </p>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">1.</span>
            Can I tell what this business does in 5 seconds?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">2.</span>
            Is there an obvious button or action to take?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">3.</span>
            Do I trust this business? Is there proof other people use it?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">4.</span>
            If I Google what this business sells + my city, does it show up?
          </li>
        </ul>
        <p>
          If you said no to any of those, you&apos;ve found your starting point.
          Our audit automates this — and goes deeper on each one.
        </p>
      </>
    ),
  },
];

// --- Form Steps ---

function WizardUrlStep({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const favicon = (() => {
    if (value && value.includes(".")) {
      try {
        const url = value.startsWith("http") ? value : `https://${value}`;
        return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
      } catch {
        return null;
      }
    }
    return null;
  })();

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        What&apos;s your website?
      </label>
      <div className="flex items-center gap-3 rounded-lg border-2 border-foreground/20 bg-background px-4 py-4 focus-within:border-foreground focus-within:ring-2 focus-within:ring-cta/20 transition-all">
        {/* eslint-disable @next/next/no-img-element */}
        {favicon ? (
          <img src={favicon} alt="" className="w-6 h-6" />
        ) : (
          <Globe className="w-6 h-6 text-foreground/30" />
        )}
        {/* eslint-enable @next/next/no-img-element */}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onSubmit();
          }}
          placeholder="yoursite.com"
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-foreground/30 outline-none"
        />
      </div>
      <button
        onClick={value.trim() ? onSubmit : undefined}
        disabled={!value.trim()}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Run my free audit
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        60 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardDescriptionStep({
  value,
  onChange,
  onSubmit,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-sm font-bold text-foreground mb-1">What do you do?</p>
      <p className="text-xs text-foreground/50 mb-3">
        So we can compare you to the right competitors
      </p>
      <div className="rounded-md border-2 border-foreground/20 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && value.trim().length >= 10) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="We sell handmade candles to gift shoppers online"
          rows={2}
          className="w-full bg-transparent text-foreground placeholder:text-foreground/30 outline-none resize-none min-h-[60px]"
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={value.trim().length >= 10 ? onSubmit : undefined}
          disabled={value.trim().length < 10}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---

function MarketingAuditContent() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/marketing-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          businessDescription: businessDescription.trim(),
          email: email.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          router.push(`/tools/marketing-audit/${data.existingSlug}`);
          return;
        }
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push(`/tools/marketing-audit/${data.slug}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, url, businessDescription, email, turnstileToken, router]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        <ToolHeroSection
          headline={<>Your website is<br /><span className="font-black">losing customers.</span></>}
          subheadline="Most small business sites fail the 3-Second Test. Get a free audit that shows you exactly where — and the one fix that'll make the biggest difference."
        >
          <ToolFormCard id="audit-form" step={step} totalSteps={3} error={error}>
            {step === 0 && (
              <motion.div key="url" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardUrlStep value={url} onChange={setUrl} onSubmit={() => setStep(1)} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="description" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardDescriptionStep value={businessDescription} onChange={setBusinessDescription} onSubmit={() => setStep(2)} onBack={() => setStep(0)} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <ToolEmailStep
                  value={email}
                  onChange={setEmail}
                  onSubmit={handleSubmit}
                  onBack={() => setStep(1)}
                  turnstileToken={turnstileToken}
                  setTurnstileToken={setTurnstileToken}
                  submitting={submitting}
                  sendLabel="Where should we send your report?"
                  submitLabel="Run my free audit"
                  loadingLabel="Analyzing..."
                />
              </motion.div>
            )}
          </ToolFormCard>
        </ToolHeroSection>

        <ToolWhatsYouGet
          headline={<>The <span className="font-black">3-Second Test</span> — Can Your Site Pass It?</>}
          intro={
            <p>
              When a stranger lands on your site, can they answer three questions in 3 seconds: <span className="text-foreground font-semibold">What do you sell? Who is it for? Why should I pick you?</span> Most small business sites fail all three. We show you exactly where yours does — and what to fix first.
            </p>
          }
          features={FEATURES}
        />

        <ToolMidCTA
          text="Ready to see what's costing you customers?"
          buttonLabel="Get my free audit"
          href="#audit-form"
        />

        <ToolEducationalSection
          blocks={EDUCATIONAL_BLOCKS}
          boostPitch={{
            headline: "You've seen what's broken. Here's the plan to fix it.",
            description: "The free audit shows you where your site is losing customers. Boost builds you a 30-day action plan to fix it — specific to your business, your market, your budget. Research-backed. No fluff.",
          }}
          boostAfterIndex={1}
        />

        <ToolCrossLinks
          tools={[
            {
              label: "Target Audience Generator",
              href: "/tools/target-audience-generator",
              description: "Find exactly who your ideal customer is — demographics, pain points, and where to reach them.",
            },
          ]}
        />

        <FAQSection
          faqs={FAQ_ITEMS}
          title="Questions you might have."
          subtitle=""
        />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

export default function MarketingAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-mesh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
          </main>
          <Footer />
        </div>
      }
    >
      <MarketingAuditContent />
    </Suspense>
  );
}
