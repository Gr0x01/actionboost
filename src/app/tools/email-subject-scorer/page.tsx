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
    question: "What counts as a 'subject line'?",
    answer: "Any email subject line you're about to send or have sent — newsletters, cold outreach, product announcements, drip sequences, promotional emails. If it shows up in someone's inbox preview, paste it in.",
  },
  {
    question: "How is this different from asking ChatGPT?",
    answer: "ChatGPT will tell you your subject line is 'great!' and suggest minor tweaks. We score it against specific criteria (clarity, urgency, curiosity, relevance) with evidence. Most subject lines score 30-55. We won't sugarcoat it.",
  },
  {
    question: "What if I add context about my email?",
    answer: "The rewrites get dramatically better. Without context, we can only fix structure. With context (what the email is about, who's receiving it), we write subject lines that are specific to your audience and your message.",
  },
  {
    question: "Is my information safe?",
    answer: "We don't share your data, sell your email, or send spam. We use your subject line to generate the analysis and your email to send results. That's it.",
  },
];

const FEATURES = [
  {
    title: "Clarity Score",
    description: "Is it immediately clear what the email is about?",
  },
  {
    title: "Urgency Score",
    description: "Does it create a reason to open now?",
  },
  {
    title: "Curiosity Score",
    description: "Does it create an information gap that demands a click?",
  },
  {
    title: "3 Rewrites",
    description: "Better subject lines written for your specific email.",
  },
];

const EDUCATIONAL_BLOCKS = [
  {
    title: "Most subject lines fail the same way",
    content: (
      <>
        <p>
          <strong className="text-foreground">They describe the email instead of selling the open.</strong>{" "}
          &quot;March Newsletter&quot; tells me what it is. It doesn&apos;t give me a reason to open it. The best subject lines make the reader think &quot;I need to know what&apos;s inside&quot; before they even click.
        </p>
        <p>
          The fix is almost always the same: replace the label with the payoff. &quot;March Newsletter&quot; becomes &quot;The pricing mistake that cost us $12K.&quot;
        </p>
      </>
    ),
  },
  {
    title: "Why shorter almost always wins",
    content: (
      <>
        <p>
          <strong className="text-foreground">Mobile shows ~40 characters. Desktop shows ~60.</strong>{" "}
          If your subject line gets cut off at the most important part, it&apos;s not working. Front-load the interesting part. Save the details for the preview text.
        </p>
        <p>
          The test is simple: read just the first 5 words of your subject line. If those 5 words aren&apos;t compelling on their own, rewrite it.
        </p>
      </>
    ),
  },
  {
    title: "Curiosity without clickbait",
    content: (
      <>
        <p>
          <strong className="text-foreground">The best subject lines open a loop that the email closes.</strong>{" "}
          &quot;You won&apos;t believe what happened!&quot; is clickbait — it promises vaguely and usually disappoints. &quot;We tested 3 pricing pages. One converted 4x better.&quot; is curiosity — it&apos;s specific, honest, and the email delivers.
        </p>
        <p>
          The difference is specificity. Clickbait is vague. Curiosity is specific enough to be believable but incomplete enough to demand the click.
        </p>
      </>
    ),
  },
  {
    title: "Subject lines that actually get opens",
    content: (
      <>
        <p>
          <strong className="text-foreground">The highest-performing subject lines share three traits:</strong>
        </p>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">1.</span>
            They create urgency (&quot;ends Friday&quot; not &quot;check this out&quot;)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">2.</span>
            They&apos;re specific (&quot;3 mistakes killing your cold emails&quot; not &quot;improve your emails&quot;)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">3.</span>
            They feel personal (&quot;quick question about your pricing page&quot; not &quot;important update&quot;)
          </li>
        </ul>
        <p>
          You don&apos;t need all three. But the more you stack, the harder it is to skip your email.
        </p>
      </>
    ),
  },
];

// --- Form Steps ---

function WizardSubjectLineStep({
  subjectLine,
  onSubjectLineChange,
  onSubmit,
}: {
  subjectLine: string;
  onSubjectLineChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = subjectLine.trim().length >= 3;

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        What&apos;s your email subject line?
      </label>

      <input
        ref={inputRef}
        type="text"
        value={subjectLine}
        onChange={(e) => onSubjectLineChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Quick update on your account"
        className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors"
      />
      <p className="text-xs text-foreground/40 mt-2">
        Newsletter, cold outreach, promo, drip — any subject line you want scored.
      </p>

      <button
        onClick={canSubmit ? onSubmit : undefined}
        disabled={!canSubmit}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Score my subject line
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        30 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardContextStep({
  emailAbout,
  onEmailAboutChange,
  audience,
  onAudienceChange,
  onSubmit,
  onBack,
}: {
  emailAbout: string;
  onEmailAboutChange: (v: string) => void;
  audience: string;
  onAudienceChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div>
      <p className="text-sm font-bold text-foreground mb-1">Tell us about this email</p>
      <p className="text-xs text-foreground/50 mb-3">
        Optional — makes the rewrites specific to your email instead of generic
      </p>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">What&apos;s the email about?</p>
          <textarea
            ref={textareaRef}
            value={emailAbout}
            onChange={(e) => onEmailAboutChange(e.target.value)}
            placeholder="Announcing our new pricing tier for small teams"
            rows={2}
            className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors resize-none min-h-[56px]"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground mb-1">Who&apos;s receiving it?</p>
          <input
            type="text"
            value={audience}
            onChange={(e) => onAudienceChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="SaaS founders on our free trial"
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

function EmailSubjectScorerContent() {
  const router = useRouter();
  const posthog = usePostHog();
  const hasTrackedStart = useRef(false);

  const [step, setStep] = useState(0);
  const [subjectLine, setSubjectLine] = useState("");
  const [emailAbout, setEmailAbout] = useState("");
  const [audience, setAudience] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      posthog?.capture("email_subject_scorer_started");
      hasTrackedStart.current = true;
    }
  }, [posthog]);

  const handleStepChange = useCallback((newStep: number, stepName: string) => {
    posthog?.capture("email_subject_scorer_step", { step: newStep, step_name: stepName });
    setStep(newStep);
  }, [posthog]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    posthog?.capture("email_subject_scorer_submitted", {
      email_domain: email.split("@")[1],
    });

    try {
      const res = await fetch("/api/email-subject-scorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectLine: subjectLine.trim(),
          emailAbout: emailAbout.trim() || undefined,
          audience: audience.trim() || undefined,
          email: email.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          posthog?.capture("email_subject_scorer_duplicate");
          router.push(`/tools/email-subject-scorer/${data.existingSlug}`);
          return;
        }
        posthog?.capture("email_subject_scorer_error", { error: data.error });
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      posthog?.capture("email_subject_scorer_success", { slug: data.slug });
      router.push(`/tools/email-subject-scorer/${data.slug}`);
    } catch {
      posthog?.capture("email_subject_scorer_error", { error: "network_error" });
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, subjectLine, emailAbout, audience, email, turnstileToken, router, posthog]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        <ToolHeroSection
          headline={
            <>
              Is your subject line<br />
              <span className="font-black">worth opening?</span>
            </>
          }
          subheadline="Get a brutally honest score on your email subject line's clarity, urgency, and curiosity — plus 3 rewrites. Free in 30 seconds."
        >
          <ToolFormCard id="subject-form" step={step} totalSteps={3} error={error}>
            {step === 0 && (
              <motion.div key="subject" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardSubjectLineStep
                  subjectLine={subjectLine}
                  onSubjectLineChange={setSubjectLine}
                  onSubmit={() => handleStepChange(1, "context")}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="context" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardContextStep
                  emailAbout={emailAbout}
                  onEmailAboutChange={setEmailAbout}
                  audience={audience}
                  onAudienceChange={setAudience}
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
                  submitLabel="Score my subject line"
                  loadingLabel="Scoring..."
                />
              </motion.div>
            )}
          </ToolFormCard>
        </ToolHeroSection>

        <ToolWhatsYouGet
          headline={<>A <span className="font-black">real score</span> — not &ldquo;looks good!&rdquo;</>}
          intro={
            <p>
              Most feedback on your subject line is polite or generic. Ours scores it against <span className="text-foreground font-semibold">4 specific criteria</span> with evidence, then writes 3 alternatives that fix what&apos;s broken.
            </p>
          }
          features={FEATURES}
        />

        <ToolMidCTA
          text="Ready to find out if your subject line is actually working?"
          buttonLabel="Score my subject line"
          href="#subject-form"
        />

        <ToolEducationalSection
          blocks={EDUCATIONAL_BLOCKS}
          boostPitch={{
            headline: "Your subject line is one piece. Boost shows the full picture.",
            description: "The subject line score shows what lands in the inbox. A Boost Brief shows your full competitive landscape — who you're up against, where they're weak, and where you should attack. Free, no signup.",
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
              label: "Headline Analyzer",
              href: "/tools/headline-analyzer",
              description: "Score your headline on clarity, specificity, and differentiation — plus 3 rewrites.",
            },
            {
              label: "Competitor Finder",
              href: "/tools/competitor-finder",
              description: "Find 5 real competitors with positioning analysis, weaknesses, and opportunities.",
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

export default function EmailSubjectScorerPage() {
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
      <EmailSubjectScorerContent />
    </Suspense>
  );
}
