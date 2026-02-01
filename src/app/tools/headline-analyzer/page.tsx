"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
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
  ToolEducationalSection,
  ToolCrossLinks,
} from "@/components/free-tools";

// --- Data ---

const FAQ_ITEMS = [
  {
    question: "Is this actually free?",
    answer: "Yes. No credit card, no trial, no sales calls. You get a real analysis with scores and rewrite suggestions. We built this so you can see what Boost does before you ever spend a dollar.",
  },
  {
    question: "What counts as a 'headline'?",
    answer: "Anything that's the first thing people read on your site — your homepage H1, your tagline, your value proposition, even your LinkedIn headline. If it's meant to grab attention and explain what you do, paste it in.",
  },
  {
    question: "How is this different from asking ChatGPT?",
    answer: "ChatGPT will tell you your headline is 'great!' and suggest minor tweaks. We score it against specific criteria (clarity, specificity, differentiation, customer focus) with evidence. Most headlines score 30-55. We won't sugarcoat it.",
  },
  {
    question: "What if I add my business context?",
    answer: "The rewrites get dramatically better. Without context, we can only fix structure. With context (what you sell, who it's for), we write headlines that are specific to your business, your market, and your customers.",
  },
  {
    question: "Is my information safe?",
    answer: "We don't share your data, sell your email, or send spam. We use your headline to generate the analysis and your email to send results. That's it.",
  },
];

const FEATURES = [
  {
    title: "Clarity Score",
    description: "Can a stranger understand what you do in 3 seconds?",
  },
  {
    title: "Specificity Score",
    description: "Concrete details or just buzzwords?",
  },
  {
    title: "Differentiation Score",
    description: "Could a competitor use this exact headline?",
  },
  {
    title: "3 Rewrites",
    description: "Better headlines written for your specific business.",
  },
];

const EDUCATIONAL_BLOCKS = [
  {
    title: "Most headlines fail the same way",
    content: (
      <>
        <p>
          <strong className="text-foreground">They describe the product instead of the customer&apos;s problem.</strong>{" "}
          &quot;AI-powered marketing platform&quot; tells me what you built. It doesn&apos;t tell me why I should care. The best headlines make the reader think &quot;that&apos;s exactly my problem&quot; before they even know what you sell.
        </p>
        <p>
          The fix is almost always the same: replace the feature with the outcome. &quot;AI-powered marketing platform&quot; becomes &quot;Stop guessing what&apos;s working.&quot;
        </p>
      </>
    ),
  },
  {
    title: "Why 'clear' beats 'clever' every time",
    content: (
      <>
        <p>
          <strong className="text-foreground">Clever headlines win awards. Clear headlines win customers.</strong>{" "}
          Your visitor gives you about 3 seconds. If they have to decode a pun or figure out what you mean, they&apos;re gone. Save the wit for your Twitter bio.
        </p>
        <p>
          The test is simple: show your headline to someone who knows nothing about your business. If they can&apos;t tell you what you sell and who it&apos;s for, it&apos;s not clear enough.
        </p>
      </>
    ),
  },
  {
    title: "The 'could a competitor use this?' test",
    content: (
      <>
        <p>
          <strong className="text-foreground">If you swap in a competitor&apos;s name and the headline still works, it&apos;s not differentiated.</strong>{" "}
          &quot;The best project management tool&quot; could be said by literally anyone. &quot;Project management for teams that ship daily&quot; could not.
        </p>
        <p>
          Differentiation doesn&apos;t mean being different for the sake of it. It means being specific about who you serve and what makes your approach unique. The narrower, the better.
        </p>
      </>
    ),
  },
  {
    title: "Headlines that actually convert",
    content: (
      <>
        <p>
          <strong className="text-foreground">The highest-converting headlines share three traits:</strong>
        </p>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">1.</span>
            They name the audience (&quot;for freelance designers&quot; not &quot;for everyone&quot;)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">2.</span>
            They state the outcome (&quot;get clients without cold pitching&quot; not &quot;grow your business&quot;)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">3.</span>
            They imply a mechanism (&quot;using your existing content&quot; not just &quot;easily&quot;)
          </li>
        </ul>
        <p>
          You don&apos;t need all three in one headline. But the more specific you are on each, the harder your headline works.
        </p>
      </>
    ),
  },
];

// --- Form Steps ---

function WizardHeadlineStep({
  headline,
  onHeadlineChange,
  onSubmit,
}: {
  headline: string;
  onHeadlineChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = headline.trim().length >= 3;

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        What&apos;s your headline or tagline?
      </label>

      <input
        ref={inputRef}
        type="text"
        value={headline}
        onChange={(e) => onHeadlineChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Innovative solutions for modern businesses"
        className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors"
      />
      <p className="text-xs text-foreground/40 mt-2">
        Your homepage H1, tagline, value prop — whatever people see first.
      </p>

      <button
        onClick={canSubmit ? onSubmit : undefined}
        disabled={!canSubmit}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Analyze my headline
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        30 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardContextStep({
  whatTheySell,
  onWhatTheySellChange,
  whoItsFor,
  onWhoItsForChange,
  onSubmit,
  onBack,
}: {
  whatTheySell: string;
  onWhatTheySellChange: (v: string) => void;
  whoItsFor: string;
  onWhoItsForChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-sm font-bold text-foreground mb-1">Tell us about your business</p>
      <p className="text-xs text-foreground/50 mb-3">
        Optional — makes the rewrites specific to your business instead of generic
      </p>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">What do you sell?</p>
          <textarea
            ref={textareaRef}
            value={whatTheySell}
            onChange={(e) => onWhatTheySellChange(e.target.value)}
            placeholder="Online courses for freelance designers who want to get clients"
            rows={2}
            className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors resize-none min-h-[56px]"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground mb-1">Who is it for?</p>
          <input
            type="text"
            value={whoItsFor}
            onChange={(e) => onWhoItsForChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Freelance designers making $50-100K"
            className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
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

function HeadlineAnalyzerContent() {
  const router = useRouter();
  const posthog = usePostHog();
  const hasTrackedStart = useRef(false);

  const [step, setStep] = useState(0);
  const [headline, setHeadline] = useState("");
  const [whatTheySell, setWhatTheySell] = useState("");
  const [whoItsFor, setWhoItsFor] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      posthog?.capture("headline_analyzer_started");
      hasTrackedStart.current = true;
    }
  }, [posthog]);

  const handleStepChange = useCallback((newStep: number, stepName: string) => {
    posthog?.capture("headline_analyzer_step", { step: newStep, step_name: stepName });
    setStep(newStep);
  }, [posthog]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    posthog?.capture("headline_analyzer_submitted", {
      email_domain: email.split("@")[1],
    });

    try {
      const res = await fetch("/api/headline-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headline.trim(),
          whatTheySell: whatTheySell.trim() || undefined,
          whoItsFor: whoItsFor.trim() || undefined,
          email: email.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          posthog?.capture("headline_analyzer_duplicate");
          router.push(`/tools/headline-analyzer/${data.existingSlug}`);
          return;
        }
        posthog?.capture("headline_analyzer_error", { error: data.error });
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      posthog?.capture("headline_analyzer_success", { slug: data.slug });
      router.push(`/tools/headline-analyzer/${data.slug}`);
    } catch {
      posthog?.capture("headline_analyzer_error", { error: "network_error" });
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, headline, whatTheySell, whoItsFor, email, turnstileToken, router, posthog]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        <ToolHeroSection
          headline={
            <>
              Your headline gets<br />
              <span className="font-black">3 seconds.</span>{" "}
              <span className="text-foreground/50 font-medium">Is it</span><br />
              <span className="font-black">earning its keep?</span>
            </>
          }
          subheadline="Get a brutally honest score on your headline's clarity, specificity, and differentiation — plus 3 rewrites. Free in 30 seconds."
        >
          <ToolFormCard id="headline-form" step={step} totalSteps={3} error={error}>
            {step === 0 && (
              <motion.div key="headline" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardHeadlineStep
                  headline={headline}
                  onHeadlineChange={setHeadline}
                  onSubmit={() => handleStepChange(1, "context")}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="context" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardContextStep
                  whatTheySell={whatTheySell}
                  onWhatTheySellChange={setWhatTheySell}
                  whoItsFor={whoItsFor}
                  onWhoItsForChange={setWhoItsFor}
                  onSubmit={() => handleStepChange(2, "email")}
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
                  sendLabel="Where should we send your analysis?"
                  submitLabel="Analyze my headline"
                  loadingLabel="Analyzing..."
                />
              </motion.div>
            )}
          </ToolFormCard>
        </ToolHeroSection>

        <ToolWhatsYouGet
          headline={<>A <span className="font-black">real score</span> — not &ldquo;looks great!&rdquo;</>}
          intro={
            <p>
              Most feedback on your headline is polite or generic. Ours scores it against <span className="text-foreground font-semibold">4 specific criteria</span> with evidence, then writes 3 alternatives that fix what&apos;s broken.
            </p>
          }
          features={FEATURES}
        />

        <ToolMidCTA
          text="Ready to find out if your headline is actually working?"
          buttonLabel="Analyze my headline"
          href="#headline-form"
        />

        <ToolEducationalSection
          blocks={EDUCATIONAL_BLOCKS}
          boostPitch={{
            headline: "Your headline is one piece. Boost shows the full picture.",
            description: "The headline score shows what strangers see first. A Boost Brief shows your full competitive landscape — who you're up against, where they're weak, and where you should attack. Free, no signup.",
          }}
          boostAfterIndex={1}
        />

        <ToolCrossLinks
          tools={[
            {
              label: "Free Marketing Audit",
              href: "/tools/marketing-audit",
              description: "See what's costing you customers with a 3-second test of your website.",
            },
            {
              label: "Target Audience Generator",
              href: "/tools/target-audience-generator",
              description: "Get a detailed profile of who you should be selling to.",
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

export default function HeadlineAnalyzerPage() {
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
      <HeadlineAnalyzerContent />
    </Suspense>
  );
}
