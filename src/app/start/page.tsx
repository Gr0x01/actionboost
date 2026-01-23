"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout";
import {
  ProgressBar,
  Acknowledgment,
  UrlInput,
  TextareaInput,
  TractionInput,
  AlternativesInput,
  FocusInput,
  EmailInput,
  CompetitorInput,
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
import { useBusinesses } from "@/lib/hooks/useBusinesses";
import { useFormWizard, Question } from "@/lib/hooks/useFormWizard";
import { usePromoCode } from "@/lib/hooks/usePromoCode";
import { useFormPrefill, PrefillResult } from "@/lib/hooks/useFormPrefill";
import { useFormAnalytics } from "@/lib/hooks/useFormAnalytics";

const STORAGE_KEY = "actionboost-form-v4"; // v4: added alternatives, removed attachments

// View states for the form flow
type ViewState = "loading" | "welcome_back" | "context_update" | "questions" | "checkout";

// Question definitions - chips first for easier entry, then context
const QUESTIONS: Question[] = [
  {
    id: "currentTraction",
    question: "What traction do you have so far?",
    acknowledgment: "Good baseline",
    type: "traction",
  },
  {
    id: "focusArea",
    question: "Where should we focus?",
    acknowledgment: null,
    type: "focus",
  },
  {
    id: "productDescription",
    question: "Tell me about your business and what you've tried for marketing",
    acknowledgment: "Got it",
    type: "textarea",
  },
  {
    id: "alternatives",
    question: "If they didn't use you, what would they do instead?",
    acknowledgment: "Helpful context",
    type: "alternatives",
    optional: false, // Required for positioning analysis
  },
  {
    id: "websiteUrl",
    question: "What's your website?",
    acknowledgment: "Got it, I'll analyze this",
    type: "url",
    optional: true,
  },
  {
    id: "competitors",
    question: "Any competitors I should study?",
    acknowledgment: null,
    type: "competitors",
    optional: true,
  },
  {
    id: "email",
    question: "Where should we send your strategy?",
    acknowledgment: null,
    type: "email",
    optional: true,
  },
];

// Suggested questions for returning users
const SUGGESTED_UPDATE_QUESTIONS = [
  "What traction have you gained?",
  "Any new competitors?",
  "What tactics worked?",
];

function StartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Entry source for analytics (hero, footer, or direct)
  const entrySource = searchParams.get("source") || "direct";

  // Business selection for multi-business users
  const { businesses, selectedBusinessId, setSelectedBusinessId, hasBusinesses, isLoading: isLoadingBusinesses } = useBusinesses();

  // Track if user wants to start fresh (new business)
  const [startFresh, setStartFresh] = useState(false);

  // User context for returning users - fetch for selected business
  const { context, isLoading: isLoadingContext, hasContext, prefillForm, refetch: refetchContext } = useUserContext(
    startFresh ? null : selectedBusinessId
  );

  // View state machine
  const [viewState, setViewState] = useState<ViewState>("loading");

  // Form state
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
  const [contextDelta, setContextDelta] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  // User credits state
  const [userCredits, setUserCredits] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Track where checkout was entered from for back navigation
  const [checkoutSource, setCheckoutSource] = useState<"questions" | "context_update">("questions");

  // Form wizard navigation
  const {
    currentQuestion,
    setCurrentQuestion,
    showAcknowledgment,
    goToNext,
    goBack,
    question,
    isComplete: isQuestionsComplete,
  } = useFormWizard({
    questions: QUESTIONS,
    posthog,
    onComplete: () => {
      setCheckoutSource("questions");
      setViewState("checkout");
    },
  });

  // Form analytics tracking - handles form start and abandonment tracking
  const { trackFormStart } = useFormAnalytics({
    posthog,
    entrySource,
    viewState,
    currentQuestion,
    questionId: question?.id,
  });

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

  // Form prefill from homepage
  const handlePrefillApplied = useCallback((result: PrefillResult) => {
    setForm((prev) => ({ ...prev, ...result.formUpdates }));
    setCurrentQuestion(result.startQuestion);
  }, [setCurrentQuestion]);

  const { prefillMetadata, clearPrefillMetadata } = useFormPrefill({
    posthog,
    isActive: viewState === "questions",
    onPrefillApplied: handlePrefillApplied,
  });

  // Determine initial view state once context and businesses are loaded
  useEffect(() => {
    if (!isLoadingContext && !isLoadingBusinesses && viewState === "loading") {
      setViewState((hasContext || hasBusinesses) ? "welcome_back" : "questions");
    }
  }, [isLoadingContext, isLoadingBusinesses, hasContext, hasBusinesses, viewState]);

  // Auto-skip email step for logged-in users (we already have their email)
  const emailStepIndex = QUESTIONS.findIndex(q => q.id === "email");
  const [hasAutoSkippedEmail, setHasAutoSkippedEmail] = useState(false);
  useEffect(() => {
    if (
      viewState === "questions" &&
      currentQuestion === emailStepIndex &&
      isLoggedIn &&
      email &&
      !hasAutoSkippedEmail &&
      !showAcknowledgment
    ) {
      setHasAutoSkippedEmail(true);
      goToNext(true); // Skip this step (true = mark as skipped for analytics)
    }
  }, [currentQuestion, viewState, isLoggedIn, email, emailStepIndex, goToNext, hasAutoSkippedEmail, showAcknowledgment]);

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

  // Load from localStorage and track form start on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && typeof parsed.productDescription === "string") {
          if (!Array.isArray(parsed.alternatives)) parsed.alternatives = [];
          setForm({ ...INITIAL_FORM_STATE, ...parsed });
        }
      } catch {
        // Invalid JSON - use defaults
      }
    }
    trackFormStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form]);

  // Handle "Continue with updates" - show conversational update form
  const handleContinueWithUpdates = useCallback(() => {
    const prefilled = prefillForm();
    if (prefilled) {
      setForm(prefilled);
    }
    setViewState("context_update");
    posthog?.capture("returning_user_continue", { has_context: true });
  }, [prefillForm, posthog]);

  // Handle "Start fresh" - go to questions with clean form and create new business
  const handleStartFresh = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setStartFresh(true);
    setViewState("questions");
    posthog?.capture("returning_user_start_fresh", { has_context: true, has_businesses: hasBusinesses });
  }, [posthog, hasBusinesses]);

  // Handle business selection change
  const handleSelectBusiness = useCallback((businessId: string) => {
    setSelectedBusinessId(businessId);
    setStartFresh(false);
    refetchContext(businessId);
    posthog?.capture("business_selected", { business_id: businessId });
  }, [setSelectedBusinessId, refetchContext, posthog]);

  // Handle context update submission - merge delta and go to checkout
  const handleContextUpdateSubmit = useCallback((delta: string, focusArea: string) => {
    setContextDelta(delta);
    setForm((prev) => ({
      ...prev,
      focusArea: focusArea as FocusArea,
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

  const updateField = useCallback(<K extends keyof FormInput>(field: K, value: FormInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

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
      if (userCredits > 0) {
        const res = await fetch("/api/runs/create-with-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: form,
            contextDelta: contextDelta || undefined,
            posthogDistinctId: posthog?.get_distinct_id(),
            businessId: startFresh ? undefined : selectedBusinessId,
            startFresh,
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
            businessId: startFresh ? undefined : selectedBusinessId,
            startFresh,
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
            businessId: startFresh ? undefined : selectedBusinessId,
            startFresh,
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

  // Get current value for the question with proper type handling
  const getValue = (id: keyof FormInput): string | string[] => {
    const value = form[id];
    if (id === "competitors") {
      return (value as string[]).filter(Boolean);
    }
    if (id === "alternatives") {
      return value as string[];
    }
    return value as string;
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
            {viewState === "welcome_back" && (context || hasBusinesses) && (
              <motion.div
                key="welcome-back"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[300px] flex items-center justify-center"
              >
                <WelcomeBack
                  context={context || {}}
                  onContinueWithUpdates={handleContinueWithUpdates}
                  onStartFresh={handleStartFresh}
                  businesses={businesses}
                  selectedBusinessId={selectedBusinessId}
                  onSelectBusiness={handleSelectBusiness}
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
                      onClick={clearPrefillMetadata}
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
                      value={getValue(question.id as keyof FormInput) as string}
                      onChange={(v) => updateField(question.id as keyof FormInput, v as never)}
                      onSubmit={() => goToNext(false)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                      placeholder="We help [who] do [what]... We've tried SEO, social media, etc."
                      currentTotal={getTotalCharCount(form)}
                      maxTotal={MAX_TOTAL_CHARS}
                    />
                  )}

                  {question.type === "alternatives" && (
                    <AlternativesInput
                      value={form.alternatives}
                      onChange={(v) => updateField("alternatives", v)}
                      onSubmit={() => goToNext(false)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}

                  {question.type === "traction" && (
                    <TractionInput
                      value={getValue("currentTraction") as string}
                      onChange={(v) => updateField("currentTraction", v)}
                      onSubmit={() => goToNext(false)}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                      autoFocus
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

                  {question.type === "email" && (
                    <EmailInput
                      value={form.email}
                      onChange={(v) => updateField("email", v)}
                      onSubmit={() => goToNext(false)}
                      onSkip={question.optional ? () => goToNext(true) : undefined}
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

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-surface/30">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
          </main>
        </div>
      }
    >
      <StartPageContent />
    </Suspense>
  );
}
