"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/lib/types/form";
import { useUserContext } from "@/lib/hooks/useUserContext";

const STORAGE_KEY = "actionboost-form-v3";

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
    id: "triedTactics",
    question: "What growth tactics have you tried?",
    acknowledgment: "Noted",
    type: "textarea" as const,
  },
  {
    id: "workingOrNot",
    question: "What's working? What's falling flat?",
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

  const question = QUESTIONS[currentQuestion];
  const isQuestionsComplete = currentQuestion >= QUESTIONS.length;

  // Determine initial view state once context is loaded
  useEffect(() => {
    if (!isLoadingContext && viewState === "loading") {
      setViewState(hasContext ? "welcome_back" : "questions");
    }
  }, [isLoadingContext, hasContext, viewState]);

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

  // Handle context update submission - merge delta and go to checkout
  const handleContextUpdateSubmit = useCallback((delta: string, focusArea: string) => {
    setContextDelta(delta);
    setForm((prev) => ({
      ...prev,
      focusArea: focusArea as FocusArea,
      // Append delta to working/not working field for AI context
      workingOrNot: delta,
    }));
    setViewState("checkout");
    posthog?.capture("context_update_submitted", { focus_area: focusArea });
  }, [posthog]);

  // Handle back from context update
  const handleBackFromContextUpdate = useCallback(() => {
    setViewState("welcome_back");
  }, []);

  // Load from localStorage
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
    posthog?.capture("form_started", { version: "rapid-fire" });
  }, [posthog]);

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

  const goToNext = useCallback(() => {
    const ack = QUESTIONS[currentQuestion]?.acknowledgment;

    if (ack) {
      setShowAcknowledgment(true);
      setTimeout(() => {
        setShowAcknowledgment(false);
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        // If we've finished all questions, go to checkout
        if (nextQuestion >= QUESTIONS.length) {
          setViewState("checkout");
        }
      }, 600);
    } else {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      // If we've finished all questions, go to checkout
      if (nextQuestion >= QUESTIONS.length) {
        setViewState("checkout");
      }
    }

    posthog?.capture("question_answered", {
      question_id: QUESTIONS[currentQuestion]?.id,
      question_index: currentQuestion,
    });
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
    setIsSubmitting(true);
    setError(null);

    try {
      if (hasValidCode) {
        const res = await fetch("/api/runs/create-with-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCode,
            input: form,
            contextDelta: contextDelta || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create run");
          setIsSubmitting(false);
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/processing/${data.runId}`);
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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
                className="min-h-[300px] flex flex-col items-center justify-center"
              >
                <CheckoutSection
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  hasValidCode={hasValidCode}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  codeStatus={codeStatus}
                  validateCode={validateCode}
                  isValidatingCode={isValidatingCode}
                  clearCode={clearCode}
                />
                <button
                  onClick={() => {
                    setCurrentQuestion(QUESTIONS.length - 1);
                    setViewState("questions");
                  }}
                  className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mt-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
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
                {/* Question */}
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground text-center mb-8">
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
                      onSubmit={goToNext}
                      onSkip={question.optional ? goToNext : undefined}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}

                  {question.type === "textarea" && (
                    <TextareaInput
                      value={getValue(question.id) as string}
                      onChange={(v) => updateField(question.id as keyof FormInput, v as never)}
                      onSubmit={goToNext}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                      placeholder={
                        question.id === "productDescription"
                          ? "We help [who] do [what] by [how]..."
                          : question.id === "triedTactics"
                          ? "SEO, social media, ads, content marketing..."
                          : "What's bringing results? What's not working?"
                      }
                    />
                  )}

                  {question.type === "traction" && (
                    <TractionInput
                      value={getValue("currentTraction") as string}
                      onChange={(v) => updateField("currentTraction", v)}
                      onSubmit={goToNext}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}

                  {question.type === "focus" && (
                    <FocusInput
                      value={form.focusArea}
                      onChange={(v) => updateField("focusArea", v)}
                      onSubmit={goToNext}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                      customChallenge={form.constraints}
                      onCustomChallengeChange={(v) => updateField("constraints", v)}
                    />
                  )}

                  {question.type === "upload" && (
                    <UploadInput
                      value={form.attachments}
                      onChange={(v) => updateField("attachments", v)}
                      onSubmit={goToNext}
                      onSkip={goToNext}
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
                      onSubmit={goToNext}
                      onSkip={goToNext}
                      onBack={currentQuestion > 0 ? goBack : undefined}
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <p className="text-center text-red-500 mt-4">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
