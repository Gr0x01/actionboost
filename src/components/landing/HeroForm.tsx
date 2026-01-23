"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import {
  TractionInput,
  FocusInput,
  TextareaInput,
  UrlInput,
  CompetitorInput,
  UploadInput,
  EmailInput,
  CheckoutSection,
} from "@/components/forms";
import {
  FormInput,
  FocusArea,
  INITIAL_FORM_STATE,
  getTotalCharCount,
  MAX_TOTAL_CHARS,
} from "@/lib/types/form";
import { usePromoCode } from "@/lib/hooks/usePromoCode";

const STORAGE_KEY = "actionboost-form-v3";

type Step =
  | "traction"
  | "focus"
  | "product"
  | "tactics"
  | "website"
  | "competitors"
  | "attachments"
  | "email"
  | "checkout";

const STEPS: Step[] = [
  "traction",
  "focus",
  "product",
  "tactics",
  "website",
  "competitors",
  "attachments",
  "email",
  "checkout",
];

const STEP_CONFIG: Record<Step, { question: string; optional?: boolean }> = {
  traction: { question: "What traction do you have so far?" },
  focus: { question: "Where should we focus?" },
  product: { question: "Tell me about your product" },
  tactics: { question: "What have you tried, and how's it going?", optional: true },
  website: { question: "What's your website?", optional: true },
  competitors: { question: "Any competitors I should study?", optional: true },
  attachments: { question: "Got any screenshots or data to share?", optional: true },
  email: { question: "Where should we send your strategy?", optional: true },
  checkout: { question: "" },
};

export function HeroForm() {
  const router = useRouter();
  const posthog = usePostHog();

  const [currentStep, setCurrentStep] = useState<Step>("traction");
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [userCredits, setUserCredits] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Promo code handling
  const {
    promoCode,
    setPromoCode,
    codeStatus,
    isValidatingCode,
    validateCode,
    clearCode,
    hasValidCode,
  } = usePromoCode();

  // Fetch user credits on mount
  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/user/credits");
        const data = await res.json();
        setUserCredits(data.credits || 0);
        setIsLoggedIn(data.loggedIn || false);
        if (data.email) {
          setEmail(data.email);
        }
      } catch {
        // Silently fail
      }
    }
    fetchCredits();
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (!Array.isArray(parsed.attachments)) parsed.attachments = [];
          setForm({ ...INITIAL_FORM_STATE, ...parsed });
        }
      } catch {
        // Invalid JSON
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form]);

  const currentIndex = STEPS.indexOf(currentStep);

  const goNext = useCallback((skip = false) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      posthog?.capture("hero_step_completed", {
        step: currentStep,
        skipped: skip,
      });
      setCurrentStep(STEPS[nextIndex]);
    }
  }, [currentIndex, currentStep, posthog]);

  const goBack = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  }, [currentIndex]);

  const updateField = useCallback(<K extends keyof FormInput>(field: K, value: FormInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (userCredits > 0) {
        const res = await fetch("/api/runs/create-with-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: form,
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create run");
          setIsSubmitting(false);
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/processing/${data.runId}?new=1`);
      } else if (hasValidCode) {
        const res = await fetch("/api/runs/create-with-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCode,
            email,
            input: form,
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create run");
          setIsSubmitting(false);
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/processing/${data.runId}?new=1`);
      } else {
        const res = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: form,
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create checkout");
          setIsSubmitting(false);
          return;
        }
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong");
      setIsSubmitting(false);
    }
  };

  const stepConfig = STEP_CONFIG[currentStep];
  const progress = ((currentIndex) / (STEPS.length - 1)) * 100;

  return (
    <div>
      {/* Card */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-xl overflow-hidden">
        {/* Progress bar */}
        {currentStep !== "checkout" && (
          <div className="h-1 bg-border/30">
            <motion.div
              className="h-full bg-cta"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* Traction step */}
            {currentStep === "traction" && (
              <motion.div
                key="traction"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <TractionInput
                  value={form.currentTraction}
                  onChange={(v) => updateField("currentTraction", v)}
                  onSubmit={() => goNext()}
                />
              </motion.div>
            )}

            {/* Focus step */}
            {currentStep === "focus" && (
              <motion.div
                key="focus"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <FocusInput
                  value={form.focusArea}
                  onChange={(v) => updateField("focusArea", v)}
                  onSubmit={() => goNext()}
                  onBack={goBack}
                  customChallenge={form.constraints}
                  onCustomChallengeChange={(v) => updateField("constraints", v)}
                />
              </motion.div>
            )}

            {/* Product description step */}
            {currentStep === "product" && (
              <motion.div
                key="product"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <TextareaInput
                  value={form.productDescription}
                  onChange={(v) => updateField("productDescription", v)}
                  onSubmit={() => goNext()}
                  onBack={goBack}
                  placeholder="We help [who] do [what] by [how]..."
                  currentTotal={getTotalCharCount(form)}
                  maxTotal={MAX_TOTAL_CHARS}
                />
              </motion.div>
            )}

            {/* Tactics step */}
            {currentStep === "tactics" && (
              <motion.div
                key="tactics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <TextareaInput
                  value={form.tacticsAndResults}
                  onChange={(v) => updateField("tacticsAndResults", v)}
                  onSubmit={() => goNext()}
                  onBack={goBack}
                  onSkip={() => goNext(true)}
                  placeholder="SEO, content marketing, paid ads... and what's working or not"
                  currentTotal={getTotalCharCount(form)}
                  maxTotal={MAX_TOTAL_CHARS}
                />
              </motion.div>
            )}

            {/* Website step */}
            {currentStep === "website" && (
              <motion.div
                key="website"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <UrlInput
                  value={form.websiteUrl}
                  onChange={(v) => updateField("websiteUrl", v)}
                  onSubmit={() => goNext()}
                  onSkip={() => goNext(true)}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {/* Competitors step */}
            {currentStep === "competitors" && (
              <motion.div
                key="competitors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <CompetitorInput
                  value={form.competitors.filter(Boolean)}
                  onChange={(v) => {
                    const padded = [...v, "", "", ""].slice(0, 3);
                    updateField("competitors", padded);
                  }}
                  onSubmit={() => goNext()}
                  onSkip={() => goNext(true)}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {/* Attachments step */}
            {currentStep === "attachments" && (
              <motion.div
                key="attachments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <UploadInput
                  value={form.attachments}
                  onChange={(v) => updateField("attachments", v)}
                  onSubmit={() => goNext()}
                  onSkip={() => goNext(true)}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {/* Email step */}
            {currentStep === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-foreground text-center mb-6">
                  {stepConfig.question}
                </h3>
                <EmailInput
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  onSubmit={() => goNext()}
                  onSkip={() => goNext(true)}
                  onBack={goBack}
                />
              </motion.div>
            )}

            {/* Checkout step */}
            {currentStep === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CheckoutSection
                  onSubmit={handleSubmit}
                  onBack={goBack}
                  isSubmitting={isSubmitting}
                  hasValidCode={hasValidCode}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  codeStatus={codeStatus}
                  validateCode={validateCode}
                  isValidatingCode={isValidatingCode}
                  clearCode={clearCode}
                  email={email}
                  setEmail={setEmail}
                  formData={form}
                  userCredits={userCredits}
                  isLoggedIn={isLoggedIn}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
