"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { FAQSection } from "@/components/landing/FAQSection";
import {
  ToolFormCard,
  ToolEmailStep,
  ToolHeroSection,
  ToolWhatsYouGet,
  ToolMidCTA,
  ToolBoostPitch,
  ToolEducationalSection,
} from "@/components/free-tools";

// --- Data ---

const FAQ_ITEMS = [
  {
    question: "Is this actually free?",
    answer: "Yes. No credit card, no trial, no sales calls. You get a real audience profile with actionable detail. We built this so you can see what Boost does before you ever spend a dollar.",
  },
  {
    question: "How is this different from a generic persona template?",
    answer: "Templates give you blanks to fill in. We analyze your specific business and generate a profile grounded in your market — pain points your customers actually have, platforms they actually use, language that actually resonates.",
  },
  {
    question: "How long does it take?",
    answer: "About 60 seconds. You'll get demographics, psychographics, pain points, buying triggers, objections, where to find them, and a messaging guide.",
  },
  {
    question: "What if I already know my target audience?",
    answer: "Great — tell us who you think they are in step 2 (optional). We'll either confirm your instinct or show you angles you haven't considered. Most founders are partially right but missing a key segment or messaging angle.",
  },
  {
    question: "Is my information safe?",
    answer: "We don't share your data, sell your email, or send spam. We use your business info to generate the profile and your email to send results. That's it.",
  },
];

const FEATURES = [
  {
    title: "Demographics & Psychographics",
    description: "Age, income, values, interests, lifestyle — the full picture.",
  },
  {
    title: "Pain Points & Buying Triggers",
    description: "What keeps them up at night and what makes them ready to buy NOW.",
  },
  {
    title: "Where to Find Them",
    description: "Specific platforms, communities, groups — not just \"social media.\"",
  },
  {
    title: "Messaging Guide",
    description: "Hook examples, tone advice, words to use and avoid.",
  },
];

const EDUCATIONAL_BLOCKS = [
  {
    title: "Why \"everyone\" is the worst target audience",
    accent: "cta" as const,
    content: (
      <>
        <p>
          <strong className="text-foreground">The narrower your audience, the louder your message.</strong>{" "}
          When you try to appeal to everyone, your copy becomes generic. Your ads become expensive. Your conversion rate drops. You end up competing on price because nothing else differentiates you.
        </p>
        <p>
          A specific audience lets you write copy that feels personal, choose channels that actually reach them, and build a product they tell their friends about.
        </p>
      </>
    ),
  },
  {
    title: "The difference between demographics and psychographics",
    accent: "muted" as const,
    content: (
      <>
        <p>
          <strong className="text-foreground">Demographics</strong> tell you who your customer is on paper — age, gender, income, location. Useful for ad targeting, but not enough.
        </p>
        <p>
          <strong className="text-foreground">Psychographics</strong> tell you what drives them — their values, fears, aspirations, daily frustrations. This is what makes your copy convert. Two people with identical demographics can have completely different buying motivations.
        </p>
        <p>
          Our profile gives you both — because you need demographics for targeting and psychographics for messaging.
        </p>
      </>
    ),
  },
  {
    title: "How to use your audience profile",
    accent: "cta" as const,
    content: (
      <>
        <p>
          <strong className="text-foreground">1. Rewrite your homepage.</strong>{" "}
          Use the pain points as your headline. Use the messaging guide for tone. If your site doesn&apos;t sound like it was written for your target customer, nothing else matters.
        </p>
        <p>
          <strong className="text-foreground">2. Pick 2 channels.</strong>{" "}
          The &quot;Where to Find Them&quot; section tells you where your customers actually hang out. Don&apos;t try to be everywhere — pick the top 2 and go deep.
        </p>
        <p>
          <strong className="text-foreground">3. Test the hooks.</strong>{" "}
          Use the hook examples in your next ad, email subject line, or social post. See what resonates. The words that work for your audience might surprise you.
        </p>
      </>
    ),
  },
  {
    title: "Signs you don't know your target audience well enough",
    accent: "muted" as const,
    content: (
      <>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">1.</span>
            Your website says &quot;for everyone&quot; or &quot;for businesses of all sizes&quot;
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">2.</span>
            You can&apos;t describe your ideal customer&apos;s daily routine
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">3.</span>
            Your ads target broad demographics like &quot;25-54, interested in business&quot;
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">4.</span>
            You&apos;re competing on price because nothing else sets you apart
          </li>
        </ul>
        <p>
          If any of these sound familiar, you&apos;re leaving money on the table. A clear audience profile fixes all four.
        </p>
      </>
    ),
  },
];

// --- Hero Preview Mock ---

function HeroProfilePreview() {
  return (
    <div
      className="bg-white border-2 border-foreground/15 rounded-md p-8 md:p-10 max-w-2xl mx-auto"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.08)" }}
    >
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">
          Your audience profile is ready
        </p>
        <p className="text-foreground/30 text-sm font-mono">FreshPress Juice Co.</p>
      </div>

      <div className="bg-cta/5 rounded-md px-6 py-5 mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cta mb-3">
          Your Ideal Customer
        </p>
        <p className="text-lg font-bold text-foreground leading-tight">
          Health-conscious millennials (28-38) earning $70-120K who meal-prep on Sundays and feel guilty about their weekday lunch habits.
        </p>
      </div>

      <p className="text-base text-foreground/70 leading-relaxed mb-8">
        They value convenience but won&apos;t compromise on ingredients. They follow wellness influencers and will pay a premium for anything that saves time without feeling processed.
      </p>

      <div className="border-l-4 border-foreground/15 pl-5">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Pain Points</p>
        <p className="text-base text-foreground/80 leading-relaxed">&quot;I know I should eat better but I literally don&apos;t have time to make anything healthy before work.&quot;</p>
      </div>

      <p className="mt-6 text-sm text-foreground/40 font-medium">
        + Where to find them, messaging hooks, buying triggers, tone guide
      </p>
    </div>
  );
}

// --- Form Steps ---

function WizardBusinessStep({
  businessName,
  onBusinessNameChange,
  whatTheySell,
  onWhatTheySellChange,
  onSubmit,
}: {
  businessName: string;
  onBusinessNameChange: (v: string) => void;
  whatTheySell: string;
  onWhatTheySellChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = businessName.trim().length >= 2 && whatTheySell.trim().length >= 10;

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        Tell us about your business
      </label>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1.5">Business name</p>
          <input
            ref={inputRef}
            type="text"
            value={businessName}
            onChange={(e) => onBusinessNameChange(e.target.value)}
            placeholder="Acme Co."
            className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-1.5">What do you sell?</p>
          <textarea
            value={whatTheySell}
            onChange={(e) => onWhatTheySellChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && canSubmit) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="We sell handmade candles to gift shoppers online"
            rows={2}
            className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors resize-none min-h-[60px]"
          />
        </div>
      </div>

      <button
        onClick={canSubmit ? onSubmit : undefined}
        disabled={!canSubmit}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Find my audience
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        60 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardCustomerStep({
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
      <p className="text-sm font-bold text-foreground mb-1">Who do you think your customer is?</p>
      <p className="text-xs text-foreground/50 mb-3">
        Optional — we&apos;ll either confirm your instinct or show you what you&apos;re missing
      </p>
      <div className="rounded-md border-2 border-foreground/20 bg-background px-4 py-3 focus-within:border-foreground transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Small business owners who want to grow but don't know where to start..."
          rows={3}
          className="w-full bg-transparent text-foreground placeholder:text-foreground/30 outline-none resize-none min-h-[72px]"
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
        <div className="flex items-center gap-3">
          <button
            onClick={onSubmit}
            className="text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-100"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

function TargetAudienceContent() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [whatTheySell, setWhatTheySell] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/target-audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          whatTheySell: whatTheySell.trim(),
          targetCustomer: targetCustomer.trim() || undefined,
          email: email.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          router.push(`/tools/target-audience-generator/${data.existingSlug}`);
          return;
        }
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push(`/tools/target-audience-generator/${data.slug}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, businessName, whatTheySell, targetCustomer, email, turnstileToken, router]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        <ToolHeroSection
          headline={
            <>
              Your website is talking to<br />
              <span className="font-black">everyone.</span>{" "}
              <span className="text-foreground/50 font-medium">That means it&apos;s</span><br />
              <span className="font-black">convincing no one.</span>
            </>
          }
          subheadline="Get a detailed target audience profile — demographics, pain points, where to find them, and exactly what to say. Free in 60 seconds."
        >
          <ToolFormCard id="audience-form" step={step} totalSteps={3} error={error}>
            {step === 0 && (
              <motion.div key="business" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardBusinessStep
                  businessName={businessName}
                  onBusinessNameChange={setBusinessName}
                  whatTheySell={whatTheySell}
                  onWhatTheySellChange={setWhatTheySell}
                  onSubmit={() => setStep(1)}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="customer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardCustomerStep
                  value={targetCustomer}
                  onChange={setTargetCustomer}
                  onSubmit={() => setStep(2)}
                  onBack={() => setStep(0)}
                />
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
                  sendLabel="Where should we send your profile?"
                  submitLabel="Generate my profile"
                  loadingLabel="Generating..."
                />
              </motion.div>
            )}
          </ToolFormCard>
        </ToolHeroSection>

        <ToolWhatsYouGet
          headline={<>A <span className="font-black">complete audience profile</span> — not a vague persona</>}
          intro={
            <p>
              Generic personas say <span className="text-foreground font-semibold">&quot;women aged 25-45.&quot;</span> Ours tell you their daily routine, what keeps them up at night, and the exact words that make them stop scrolling.
            </p>
          }
          features={FEATURES}
          preview={<HeroProfilePreview />}
        />

        <ToolMidCTA
          text="Ready to know exactly who you're selling to?"
          buttonLabel="Generate my audience profile"
          href="#audience-form"
        />

        <ToolEducationalSection
          blocks={EDUCATIONAL_BLOCKS}
          boostPitch={
            <ToolBoostPitch
              headline="You know who to talk to. Now get the plan to reach them."
              description="The audience profile shows you who your customer is. Boost builds you a 30-day marketing plan to reach them — specific channels, specific tactics, specific content. Research-backed. No fluff."
            />
          }
          boostAfterIndex={1}
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

export default function TargetAudienceGeneratorPage() {
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
      <TargetAudienceContent />
    </Suspense>
  );
}
