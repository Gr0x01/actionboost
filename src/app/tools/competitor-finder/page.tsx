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
    answer: "Yes. No credit card, no trial, no catch. You get real competitor intel with positioning analysis, weaknesses, and opportunities. We built this so you can see what Boost does before you ever spend a dollar.",
  },
  {
    question: "How does it find my competitors?",
    answer: "We search the web for businesses competing in your space — direct competitors, alternatives, and adjacent players. Then we analyze each one's positioning, identify their weaknesses, and show you where you can win.",
  },
  {
    question: "How is this different from Googling my competitors?",
    answer: "Google gives you a list of links. We give you strategic intel — how each competitor positions themselves, where they're vulnerable, and specific opportunities for your business. It's the difference between a phone book and a scouting report.",
  },
  {
    question: "What if I already know my competitors?",
    answer: "You probably know 2-3. Most businesses miss competitors that are adjacent to their space — the ones stealing customers without you realizing it. We surface those too, plus the strategic analysis you'd need hours to do yourself.",
  },
  {
    question: "Is my information safe?",
    answer: "We don't share your data, sell your email, or send spam. We use your URL and description to find competitors and your email to send results. That's it.",
  },
];

const FEATURES = [
  {
    title: "5 Real Competitors",
    description: "Actual companies in your space — not generic lists or made-up names.",
  },
  {
    title: "Positioning Analysis",
    description: "How each competitor positions themselves and who they target.",
  },
  {
    title: "Key Weaknesses",
    description: "Where each competitor is vulnerable — gaps you can exploit.",
  },
  {
    title: "Your Opportunities",
    description: "Specific ways to differentiate against each competitor.",
  },
];

const EDUCATIONAL_BLOCKS = [
  {
    title: "Most founders only know half their competitors",
    content: (
      <>
        <p>
          <strong className="text-foreground">You know the obvious ones. The ones stealing your customers quietly? Those are the ones that matter.</strong>{" "}
          Direct competitors are easy to spot. But the alternatives your customers actually consider — a spreadsheet, a freelancer, doing nothing — those are the real competition. And most founders never map them.
        </p>
        <p>
          Understanding the full competitive landscape changes how you position, price, and sell.
        </p>
      </>
    ),
  },
  {
    title: "Competitor weaknesses are your best positioning tool",
    content: (
      <>
        <p>
          <strong className="text-foreground">You don&apos;t need to be better at everything. You need to be better at the thing they&apos;re worst at.</strong>{" "}
          Every competitor has gaps — features they lack, audiences they ignore, pain points they create. Your job is to find those gaps and make them your headline.
        </p>
        <p>
          The best positioning comes from studying what competitors do poorly, not what they do well.
        </p>
      </>
    ),
  },
  {
    title: "Why 'we're different because we're better' doesn't work",
    content: (
      <>
        <p>
          <strong className="text-foreground">Everyone says they&apos;re better. Nobody believes it.</strong>{" "}
          Real differentiation is specific: &quot;We&apos;re the only X that does Y&quot; or &quot;Built specifically for Z.&quot; It comes from understanding the competitive landscape well enough to carve out a position no one else occupies.
        </p>
        <p>
          That&apos;s why competitive research isn&apos;t optional — it&apos;s the foundation of positioning.
        </p>
      </>
    ),
  },
  {
    title: "How to actually use competitive intel",
    content: (
      <>
        <p>
          <strong className="text-foreground">Competitive research is useless if it stays in a spreadsheet.</strong>
        </p>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">1.</span>
            Update your homepage headline to address a gap competitors miss
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">2.</span>
            Build comparison pages that honestly show where you win (and where you don&apos;t)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold mt-0.5">3.</span>
            Target the audience segments your competitors underserve
          </li>
        </ul>
        <p>
          The goal isn&apos;t to copy competitors. It&apos;s to find the space between them where you fit best.
        </p>
      </>
    ),
  },
];

// --- Form Steps ---

function WizardUrlStep({
  url,
  onUrlChange,
  onSubmit,
}: {
  url: string;
  onUrlChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canSubmit = url.trim().length >= 5;

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-3 block">
        What&apos;s your website URL?
      </label>

      <input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="yourcompany.com"
        className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors"
      />
      <p className="text-xs text-foreground/40 mt-2">
        We&apos;ll use this to find businesses competing in your space.
      </p>

      <button
        onClick={canSubmit ? onSubmit : undefined}
        disabled={!canSubmit}
        className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white text-lg font-bold rounded-xl border-2 border-cta shadow-[4px_4px_0_rgba(44,62,80,0.3)] hover:shadow-[5px_5px_0_rgba(44,62,80,0.35)] hover:-translate-y-0.5 active:shadow-[2px_2px_0_rgba(44,62,80,0.3)] active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_rgba(44,62,80,0.3)] transition-all duration-100"
      >
        Find my competitors
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-4 text-sm text-foreground/50 text-center">
        30 seconds · No signup · Always free
      </p>
    </div>
  );
}

function WizardDescriptionStep({
  description,
  onDescriptionChange,
  onSubmit,
  onBack,
}: {
  description: string;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const canSubmit = description.trim().length >= 10;

  return (
    <div>
      <label className="text-base font-bold text-foreground mb-1 block">
        Describe your business in a sentence or two
      </label>
      <p className="text-xs text-foreground/50 mb-3">
        This helps us find the right competitors — not just companies with similar names.
      </p>

      <textarea
        ref={textareaRef}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="We sell project management software for freelance designers who manage multiple client projects"
        rows={3}
        maxLength={500}
        className="w-full rounded-md border-2 border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/30 outline-none focus:border-foreground transition-colors resize-none min-h-[80px]"
      />
      <p className="text-xs text-foreground/40 mt-1 text-right">
        {description.length}/500
      </p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-foreground/50 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={canSubmit ? onSubmit : undefined}
          disabled={!canSubmit}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-cta text-white text-sm font-bold rounded-md border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100"
        >
          Continue
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// --- Main Page ---

function CompetitorFinderContent() {
  const router = useRouter();
  const posthog = usePostHog();
  const hasTrackedStart = useRef(false);

  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      posthog?.capture("competitor_finder_started");
      hasTrackedStart.current = true;
    }
  }, [posthog]);

  const handleStepChange = useCallback((newStep: number, stepName: string) => {
    posthog?.capture("competitor_finder_step", { step: newStep, step_name: stepName });
    setStep(newStep);
  }, [posthog]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    posthog?.capture("competitor_finder_submitted", {
      email_domain: email.split("@")[1],
    });

    try {
      const res = await fetch("/api/competitor-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          description: description.trim(),
          email: email.trim(),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingSlug) {
          posthog?.capture("competitor_finder_duplicate");
          router.push(`/tools/competitor-finder/${data.existingSlug}`);
          return;
        }
        posthog?.capture("competitor_finder_error", { error: data.error });
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      posthog?.capture("competitor_finder_success", { slug: data.slug });
      router.push(`/tools/competitor-finder/${data.slug}`);
    } catch {
      posthog?.capture("competitor_finder_error", { error: "network_error" });
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [submitting, url, description, email, turnstileToken, router, posthog]);

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-1">
        <ToolHeroSection
          headline={
            <>
              Know who you&apos;re<br />
              <span className="font-black">up against.</span>{" "}
              <span className="text-foreground/50 font-medium">Find</span><br />
              <span className="font-black">their weak spots.</span>
            </>
          }
          subheadline="Get 5 real competitors with positioning analysis, key weaknesses, and specific opportunities for your business. Free in 30 seconds."
        >
          <ToolFormCard id="competitor-form" step={step} totalSteps={3} error={error}>
            {step === 0 && (
              <motion.div key="url" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardUrlStep
                  url={url}
                  onUrlChange={setUrl}
                  onSubmit={() => handleStepChange(1, "description")}
                />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="description" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <WizardDescriptionStep
                  description={description}
                  onDescriptionChange={setDescription}
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
                  sendLabel="Where should we send your competitor report?"
                  submitLabel="Find my competitors"
                  loadingLabel="Searching..."
                />
              </motion.div>
            )}
          </ToolFormCard>
        </ToolHeroSection>

        <ToolWhatsYouGet
          headline={<>A <span className="font-black">scouting report</span> — not a Google search</>}
          intro={
            <p>
              Googling &ldquo;my competitors&rdquo; gives you links. We give you <span className="text-foreground font-semibold">strategic intel</span> — how each competitor positions themselves, where they&apos;re vulnerable, and how you can win.
            </p>
          }
          features={FEATURES}
        />

        <ToolMidCTA
          text="Ready to see who you're really up against?"
          buttonLabel="Find my competitors"
          href="#competitor-form"
        />

        <ToolEducationalSection
          blocks={EDUCATIONAL_BLOCKS}
          boostPitch={{
            headline: "Competitors are one piece. Boost shows the full picture.",
            description: "The competitor report shows who you're up against. A Boost Brief shows your full competitive landscape — positioning gaps, quick wins, and where to attack. Free, no signup.",
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
              label: "Email Subject Line Scorer",
              href: "/tools/email-subject-scorer",
              description: "Score your email subject line on clarity, urgency, and curiosity — plus 3 rewrites.",
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

export default function CompetitorFinderPage() {
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
      <CompetitorFinderContent />
    </Suspense>
  );
}
