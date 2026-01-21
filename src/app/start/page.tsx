"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft } from "lucide-react";
import { Header } from "@/components/layout";
import {
  ProgressBar,
  Acknowledgment,
  UrlInput,
  TextareaInput,
  TractionInput,
  FocusInput,
  CompetitorInput,
  UploadInput,
  CheckoutSection,
  WelcomeBack,
  ContextUpdateForm,
} from "@/components/forms";
import {
  FormInput,
  FocusArea,
  INITIAL_FORM_STATE,
  getTotalCharCount,
  validateForm,
  MAX_TOTAL_CHARS,
} from "@/lib/types/form";
import { useUserContext } from "@/lib/hooks/useUserContext";

const STORAGE_KEY = "actionboost-form-v3";
const PREFILL_KEY = "actionboost-prefill";
const HERO_PREFILL_KEY = "actionboost-hero-prefill";
const PREFILL_TTL = 5 * 60 * 1000; // 5 minutes
const HERO_PREFILL_TTL = 10 * 60 * 1000; // 10 minutes

// View states for the form flow
type ViewState = "loading" | "welcome_back" | "context_update" | "questions" | "checkout";

// Question definitions
const QUESTIONS = [
  {
    id: "websiteUrl",
    question: "What's your website?",
    acknowledgment: "Got it, I'll analyze this",
    type: "url" as const,
    optional: true,
  },
  {
    id: "productDescription",
    question: "Tell me about your product in a sentence or two",
    acknowledgment: "Interesting product",
    type: "textarea" as const,
  },
  {
    id: "currentTraction",
    question: "What traction do you have so far?",
    acknowledgment: "Good baseline",
    type: "traction" as const,
  },
  {
    id: "tacticsAndResults",
    question: "What have you tried, and how's it going?",
    acknowledgment: "This helps a lot",
    type: "textarea" as const,
  },
  {
    id: "attachments",
    question: "Got any screenshots or data to share?",
    acknowledgment: null,
    type: "upload" as const,
    optional: true,
  },
  {
    id: "focusArea",
    question: "Where should we focus?",
    acknowledgment: null,
    type: "focus" as const,
  },
  {
    id: "competitors",
    question: "Any competitors I should study?",
    acknowledgment: null,
    type: "competitors" as const,
    optional: true,
  },
];

// Suggested questions for returning users
const SUGGESTED_UPDATE_QUESTIONS = [
  "What traction have you gained?",
  "Any new competitors?",
  "What tactics worked?",
];

// Map question IDs to funnel step names
const STEP_NAMES: Record<string, string> = {
  websiteUrl: "url",
  productDescription: "product",
  currentTraction: "traction",
  tacticsAndResults: "tactics",
  attachments: "uploads",
  focusArea: "focus",
  competitors: "competitors",
};

export default function StartPage() {
  const router = useRouter();
  const posthog = usePostHog();

  // User context for returning users
  const { context, isLoading: isLoadingContext, hasContext, prefillForm } = useUserContext();

  // View state machine
  const [viewState, setViewState] = useState<ViewState>("loading");

  // Form state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
  const [contextDelta, setContextDelta] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<{
    valid: boolean;
    credits?: number;
    error?: string;
  } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [email, setEmail] = useState("");

  // User credits state
  const [userCredits, setUserCredits] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Prefill from homepage
  const [prefillMetadata, setPrefillMetadata] = useState<{
    title: string | null;
    description: string | null;
    favicon: string | null;
    siteName: string | null;
  } | null>(null);
  const prefillApplied = useRef(false);

  const question = QUESTIONS[currentQuestion];
  const isQuestionsComplete = currentQuestion >= QUESTIONS.length;

  // Tracking refs
  const stepStartTime = useRef<number>(Date.now());
  const formStartTime = useRef<number>(Date.now());
  const hasTrackedStart = useRef(false);

  // Determine initial view state once context is loaded
  useEffect(() => {
    if (!isLoadingContext && viewState === "loading") {
      setViewState(hasContext ? "welcome_back" : "questions");
    }
  }, [isLoadingContext, hasContext, viewState]);

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
        // Silently fail - user just won't see credits
      }
    }
    fetchCredits();
  }, []);

  // Handle prefill from homepage (hero textarea or URL input)
  useEffect(() => {
    if (prefillApplied.current) return;
    if (viewState !== "questions") return;

    // Check for hero description prefill first (new landing page)
    const heroPrefillRaw = localStorage.getItem(HERO_PREFILL_KEY);
    if (heroPrefillRaw) {
      try {
        const heroPrefill = JSON.parse(heroPrefillRaw);

        // Check TTL
        if (Date.now() - heroPrefill.timestamp > HERO_PREFILL_TTL) {
          localStorage.removeItem(HERO_PREFILL_KEY);
        } else {
          // Clear prefill to prevent re-application
          localStorage.removeItem(HERO_PREFILL_KEY);
          prefillApplied.current = true;

          // Update form with product description, start at question 1 (URL)
          setForm((prev) => ({
            ...prev,
            productDescription: heroPrefill.productDescription || "",
          }));
          setCurrentQuestion(0); // Start at URL question so we can collect website

          posthog?.capture("form_prefilled_from_hero", {
            type: "product_description",
            char_count: heroPrefill.productDescription?.length || 0,
          });
          return;
        }
      } catch {
        localStorage.removeItem(HERO_PREFILL_KEY);
      }
    }

    // Check for URL prefill (footer CTA or legacy)
    const prefillRaw = localStorage.getItem(PREFILL_KEY);
    if (!prefillRaw) return;

    try {
      const prefill = JSON.parse(prefillRaw);

      // Check TTL
      if (Date.now() - prefill.timestamp > PREFILL_TTL) {
        localStorage.removeItem(PREFILL_KEY);
        return;
      }

      // Clear prefill to prevent re-application
      localStorage.removeItem(PREFILL_KEY);
      prefillApplied.current = true;

      // Store metadata for context banner
      if (prefill.metadata) {
        setPrefillMetadata(prefill.metadata);
      }

      // Build description from metadata
      let description = "";
      if (prefill.metadata?.title) {
        description = prefill.metadata.title;
      }
      if (prefill.metadata?.description) {
        description += description ? " - " : "";
        description += prefill.metadata.description;
      }

      // Update form and skip to step 2 (product description)
      setForm((prev) => ({
        ...prev,
        websiteUrl: prefill.websiteUrl || "",
        productDescription: description || prev.productDescription,
      }));
      setCurrentQuestion(1); // Skip URL step, go to product description

      posthog?.capture("form_prefilled_from_hero", {
        type: "url_metadata",
        has_title: !!prefill.metadata?.title,
        has_description: !!prefill.metadata?.description,
        url_domain: prefill.websiteUrl ? new URL(prefill.websiteUrl).hostname : null,
      });
    } catch {
      localStorage.removeItem(PREFILL_KEY);
    }
  }, [viewState, posthog]);

  // Handle "Continue with updates" - show conversational update form
  const handleContinueWithUpdates = useCallback(() => {
    const prefilled = prefillForm();
    if (prefilled) {
      setForm(prefilled);
    }
    setViewState("context_update");
    posthog?.capture("returning_user_continue", { has_context: true });
  }, [prefillForm, posthog]);

  // Handle "Start fresh" - go to questions with clean form
  const handleStartFresh = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setViewState("questions");
    posthog?.capture("returning_user_start_fresh", { has_context: true });
  }, [posthog]);

  // Track where checkout was entered from for back navigation
  const [checkoutSource, setCheckoutSource] = useState<"questions" | "context_update">("questions");

  // Handle context update submission - merge delta and go to checkout
  const handleContextUpdateSubmit = useCallback((delta: string, focusArea: string) => {
    setContextDelta(delta);
    setForm((prev) => ({
      ...prev,
      focusArea: focusArea as FocusArea,
      // Append delta to tactics field for AI context
      tacticsAndResults: delta,
    }));
    setCheckoutSource("context_update");
    setViewState("checkout");
    posthog?.capture("context_update_submitted", { focus_area: focusArea });
  }, [posthog]);

  // Handle back from context update
  const handleBackFromContextUpdate = useCallback(() => {
    setViewState("welcome_back");
  }, []);

  // Load from localStorage and track form start
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && typeof parsed.productDescription === "string") {
          if (!Array.isArray(parsed.attachments)) parsed.attachments = [];
          setForm({ ...INITIAL_FORM_STATE, ...parsed });
        }
      } catch {
        // Invalid JSON
      }
    }
    if (!hasTrackedStart.current) {
      posthog?.capture("form_started", { version: "rapid-fire" });
      formStartTime.current = Date.now();
      stepStartTime.current = Date.now();
      hasTrackedStart.current = true;
    }
  }, [posthog]);

  // Form abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (viewState === "questions" || viewState === "checkout") {
        const stepName = viewState === "checkout" ? "checkout" : STEP_NAMES[question?.id || ""] || "unknown";
        const timeSpent = Math.round((Date.now() - formStartTime.current) / 1000);
        posthog?.capture("form_abandoned", {
          last_step: currentQuestion + 1,
          step_name: stepName,
          view_state: viewState,
          time_spent_seconds: timeSpent,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [viewState, currentQuestion, question?.id, posthog]);

  // Save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form]);

  const hasValidCode = codeStatus?.valid === true;

  const updateField = useCallback(<K extends keyof FormInput>(field: K, value: FormInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const goToNext = useCallback((skipped = false) => {
    const currentQ = QUESTIONS[currentQuestion];
    const stepName = STEP_NAMES[currentQ?.id || ""] || "unknown";
    const stepSeconds = Math.round((Date.now() - stepStartTime.current) / 1000);
    const ack = currentQ?.acknowledgment;

    // Track step completion with distinct event name
    posthog?.capture(`form_step_${stepName}`, {
      step: currentQuestion + 1,
      step_name: stepName,
      skipped,
    });

    // Track time spent on step
    posthog?.capture("form_step_time", {
      step: currentQuestion + 1,
      step_name: stepName,
      seconds: stepSeconds,
    });

    // Track skip separately if applicable
    if (skipped) {
      posthog?.capture("form_step_skipped", {
        step: currentQuestion + 1,
        step_name: stepName,
      });
    }

    // Reset step timer for next question
    stepStartTime.current = Date.now();

    if (ack) {
      setShowAcknowledgment(true);
      setTimeout(() => {
        setShowAcknowledgment(false);
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        // If we've finished all questions, go to checkout
        if (nextQuestion >= QUESTIONS.length) {
          setCheckoutSource("questions");
          setViewState("checkout");
          posthog?.capture("form_step_checkout", { step: 9, step_name: "checkout" });
        }
      }, 600);
    } else {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      // If we've finished all questions, go to checkout
      if (nextQuestion >= QUESTIONS.length) {
        setCheckoutSource("questions");
        setViewState("checkout");
        posthog?.capture("form_step_checkout", { step: 9, step_name: "checkout" });
      }
    }
  }, [currentQuestion, posthog]);

  const goBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((c) => c - 1);
    }
  }, [currentQuestion]);

  const validateCode = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingCode(true);
    setCodeStatus(null);

    try {
      const res = await fetch("/api/codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      setCodeStatus(data);
    } catch {
      setCodeStatus({ valid: false, error: "Failed to validate" });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const clearCode = () => {
    setPromoCode("");
    setCodeStatus(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate form before submission
    // Returning users (via context_update flow) have relaxed validation since they've provided info before
    const isReturningUser = checkoutSource === "context_update";
    const errors = validateForm(form, isReturningUser);
    if (Object.keys(errors).length > 0) {
      posthog?.capture("form_validation_error", {
        fields: Object.keys(errors),
        first_error: Object.values(errors)[0],
      });
      setError(Object.values(errors)[0]);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use credits if available
      if (userCredits > 0) {
        const res = await fetch("/api/runs/create-with-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: form,
            contextDelta: contextDelta || undefined,
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          posthog?.capture("form_api_error", {
            type: "create_run_with_credits",
            error: data.error || "Failed to create run",
          });
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
            contextDelta: contextDelta || undefined,
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          posthog?.capture("form_api_error", {
            type: "create_run_with_code",
            error: data.error || "Failed to create run",
          });
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
            contextDelta: contextDelta || undefined,
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          posthog?.capture("form_api_error", {
            type: "create_checkout_session",
            error: data.error || "Failed to create checkout",
          });
          setError(data.error || "Failed to create checkout");
          setIsSubmitting(false);
          return;
        }
        window.location.href = data.url;
      }
    } catch {
      posthog?.capture("form_api_error", {
        type: "network_error",
        error: "Something went wrong",
      });
      setError("Something went wrong");
      setIsSubmitting(false);
    }
  };

  // Get current value for the question
  const getValue = (id: string) => {
    if (id === "competitors") return form.competitors.filter(Boolean);
    return form[id as keyof FormInput] as string;
  };

  // Calculate progress for the progress bar
  const getProgress = () => {
    if (viewState === "loading" || viewState === "welcome_back") return { current: 0, total: 1 };
    if (viewState === "context_update") return { current: 1, total: 2 };
    if (viewState === "checkout") return { current: QUESTIONS.length, total: QUESTIONS.length };
    return { current: currentQuestion, total: QUESTIONS.length };
  };

  const progress = getProgress();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-12">
            <ProgressBar current={progress.current} total={progress.total} />
          </div>

          <AnimatePresence mode="wait">
            {/* Loading state */}
            {viewState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[300px] flex items-center justify-center"
              >
                <Loader2 className="w-8 h-8 text-cta animate-spin" />
              </motion.div>
            )}

            {/* Welcome back for returning users */}
            {viewState === "welcome_back" && context && (
              <motion.div
                key="welcome-back"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[300px] flex items-center justify-center"
              >
                <WelcomeBack
                  context={context}
                  onContinueWithUpdates={handleContinueWithUpdates}
                  onStartFresh={handleStartFresh}
                />
              </motion.div>
            )}

            {/* Conversational update form for returning users */}
            {viewState === "context_update" && context && (
              <motion.div
                key="context-update"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[300px]"
              >
                <ContextUpdateForm
                  context={context}
                  suggestedQuestions={SUGGESTED_UPDATE_QUESTIONS}
                  onSubmit={handleContextUpdateSubmit}
                  onBack={handleBackFromContextUpdate}
                />
              </motion.div>
            )}

            {/* Acknowledgment animation between questions */}
            {viewState === "questions" && showAcknowledgment && (
              <motion.div
                key="ack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[300px] flex items-center justify-center"
              >
                <Acknowledgment text={QUESTIONS[currentQuestion]?.acknowledgment || ""} />
              </motion.div>
            )}

            {/* Checkout section */}
            {viewState === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[300px]"
              >
                <CheckoutSection
                  onSubmit={handleSubmit}
                  onBack={() => {
                    setError(null);
                    if (checkoutSource === "context_update") {
                      setViewState("context_update");
                    } else {
                      setViewState("questions");
                      setCurrentQuestion(QUESTIONS.length - 1);
                    }
                  }}
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

            {/* Question flow */}
            {viewState === "questions" && !showAcknowledgment && !isQuestionsComplete && question && (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                {/* Prefill context banner */}
                {prefillMetadata && form.websiteUrl && (
                  <div className="flex items-center justify-center gap-3 mb-6 mx-auto max-w-md p-3 border-2 border-foreground/20 bg-background">
                    {prefillMetadata.favicon && (
                      <img src={prefillMetadata.favicon} alt="" className="w-5 h-5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {prefillMetadata.siteName || new URL(form.websiteUrl).hostname}
                      </p>
                    </div>
                    <button
                      onClick={() => setPrefillMetadata(null)}
                      className="text-foreground/50 hover:text-foreground transition-colors ml-auto text-lg leading-none font-bold"
                      aria-label="Dismiss"
                    >
                      &times;
                    </button>
                  </div>
                )}

                {/* Question */}
                <h1 className="text-2xl sm:text-3xl font-black text-foreground text-center mb-8">
                  {question.question}
                </h1>

                {/* Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {question.type === "url" && (
                    <UrlInput
                      value={getValue("websiteUrl") as string}
                      onChange={(v) => updateField("websiteUrl", v)}
                      onSubmit={() => goToNext(false)}
                      onSkip={question.optional ? () => goToNext(true) : undefined}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}

                  {question.type === "textarea" && (
                    <TextareaInput
                      value={getValue(question.id) as string}
                      onChange={(v) => updateField(question.id as keyof FormInput, v as never)}
                      onSubmit={() => goToNext(false)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                      placeholder={
                        question.id === "productDescription"
                          ? "We help [who] do [what] by [how]..."
                          : "SEO, content marketing, paid ads... and what's working or not"
                      }
                      currentTotal={getTotalCharCount(form)}
                      maxTotal={MAX_TOTAL_CHARS}
                    />
                  )}

                  {question.type === "traction" && (
                    <TractionInput
                      value={getValue("currentTraction") as string}
                      onChange={(v) => updateField("currentTraction", v)}
                      onSubmit={() => goToNext(false)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}

                  {question.type === "focus" && (
                    <FocusInput
                      value={form.focusArea}
                      onChange={(v) => updateField("focusArea", v)}
                      onSubmit={() => goToNext(false)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                      customChallenge={form.constraints}
                      onCustomChallengeChange={(v) => updateField("constraints", v)}
                    />
                  )}

                  {question.type === "upload" && (
                    <UploadInput
                      value={form.attachments}
                      onChange={(v) => updateField("attachments", v)}
                      onSubmit={() => goToNext(false)}
                      onSkip={() => goToNext(true)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}

                  {question.type === "competitors" && (
                    <CompetitorInput
                      value={form.competitors.filter(Boolean)}
                      onChange={(v) => {
                        const padded = [...v, "", "", ""].slice(0, 3);
                        updateField("competitors", padded);
                      }}
                      onSubmit={() => goToNext(false)}
                      onSkip={() => goToNext(true)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <p className="text-center text-red-500 font-bold mt-4">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
