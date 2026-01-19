"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Header, Footer } from "@/components/layout";
import { Button, Textarea, Input, RadioGroup, FileUpload } from "@/components/ui";
import { ChevronLeft, ChevronRight, Check, X, Loader2, Gift } from "lucide-react";
import {
  FormInput,
  FOCUS_AREA_OPTIONS,
  INITIAL_FORM_STATE,
  MAX_TOTAL_CHARS,
  getTotalCharCount,
  validateForm,
} from "@/lib/types/form";

const STORAGE_KEY = "actionboost-form-v2"; // Versioned to handle schema changes
const TOTAL_STEPS = 4;

const STEPS = [
  { id: 1, label: "Product", title: "Tell us about your product" },
  { id: 2, label: "Traction", title: "What's your current traction?" },
  { id: 3, label: "History", title: "What have you tried?" },
  { id: 4, label: "Focus", title: "Where should we focus?" },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between max-w-md mx-auto">
      {STEPS.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label group */}
            <div className="flex items-center gap-2.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-surface text-muted/70 border border-border"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-sm hidden sm:block transition-colors ${
                  isCurrent ? "text-foreground font-medium" : isCompleted ? "text-primary font-medium" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-3 hidden sm:block">
                <div
                  className={`h-px w-full transition-colors duration-300 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function StartPage() {
  const router = useRouter();
  const posthog = usePostHog();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formStartedTracked = useRef(false);

  // Promo code state
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<{
    valid: boolean;
    credits?: number;
    error?: string;
  } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate schema before merging
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.productDescription === "string"
        ) {
          // Ensure attachments is always an array
          if (!Array.isArray(parsed.attachments)) {
            parsed.attachments = [];
          }
          setForm({ ...INITIAL_FORM_STATE, ...parsed });
          // Track form started with restored data
          if (!formStartedTracked.current) {
            posthog?.capture("form_started", { source: "localStorage" });
            formStartedTracked.current = true;
          }
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    // Track fresh form start if no saved data
    if (!formStartedTracked.current) {
      posthog?.capture("form_started", { source: "fresh" });
      formStartedTracked.current = true;
    }
  }, [posthog]);

  // Save to localStorage on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form]);

  const hasValidCode = codeStatus?.valid === true;

  const updateField = <K extends keyof FormInput>(
    field: K,
    value: FormInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...form.competitors];
    newCompetitors[index] = value;
    updateField("competitors", newCompetitors);
  };

  const validateCode = async () => {
    if (!promoCode.trim()) return;

    posthog?.capture("promo_code_entered", { code_length: promoCode.length });
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
      posthog?.capture("promo_code_validated", {
        valid: data.valid,
        credits: data.credits,
      });
    } catch {
      setCodeStatus({ valid: false, error: "Failed to validate code" });
      posthog?.capture("promo_code_validated", { valid: false });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const clearCode = () => {
    setPromoCode("");
    setCodeStatus(null);
  };

  // Validate current step before proceeding
  const validateStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.productDescription.trim()) {
        stepErrors.productDescription = "Please describe your product";
      }
    } else if (step === 2) {
      if (!form.currentTraction.trim()) {
        stepErrors.currentTraction = "Please describe your current traction";
      }
    } else if (step === 3) {
      if (!form.triedTactics.trim()) {
        stepErrors.triedTactics = "Please describe what you've tried";
      }
      if (!form.workingOrNot.trim()) {
        stepErrors.workingOrNot = "Please describe what's working or not";
      }
    } else if (step === 4) {
      // focusArea has a default, so always valid
      // Optional fields don't need validation
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      posthog?.capture("form_step_completed", {
        step,
        step_name: STEPS[step - 1].label,
      });
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    posthog?.capture("form_step_back", { from_step: step });
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    // Prevent double-submit
    if (isSubmitting) return;

    // Final validation
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    posthog?.capture("checkout_initiated", {
      focus_area: form.focusArea,
      has_promo: hasValidCode,
    });

    setIsSubmitting(true);

    try {
      if (hasValidCode) {
        const res = await fetch("/api/runs/create-with-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: promoCode, input: form }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ submit: data.error || "Failed to create run" });
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
            posthogDistinctId: posthog?.get_distinct_id(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ submit: data.error || "Failed to create checkout" });
          setIsSubmitting(false);
          return;
        }

        window.location.href = data.url;
      }
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
      setIsSubmitting(false);
    }
  };

  const totalChars = getTotalCharCount(form);
  const charPercentage = (totalChars / MAX_TOTAL_CHARS) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          {/* Step indicator */}
          <div className="mb-10">
            <StepIndicator currentStep={step} />
          </div>

          {/* Form card */}
          <div className="bg-background rounded-xl shadow-lg shadow-foreground/5 border border-border/50 p-6 sm:p-8">
            {/* Step title */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {STEPS[step - 1].title}
              </h1>
              <p className="text-muted mt-1.5 text-sm">
                Step {step} of {TOTAL_STEPS}
              </p>
            </div>

            {/* Step content */}
            <div className="space-y-6">
            {step === 1 && (
              <Textarea
                label="What does your product do?"
                hint="Describe your product in 1-2 sentences. What problem does it solve?"
                placeholder="e.g., We're a project management tool for remote teams that focuses on async communication..."
                required
                value={form.productDescription}
                onChange={(e) => updateField("productDescription", e.target.value)}
                error={errors.productDescription}
              />
            )}

            {step === 2 && (
              <Textarea
                label="Current traction"
                hint="Users, revenue, traffic, whatever matters for your business."
                placeholder="e.g., 500 registered users, 50 paying customers, $2k MRR, 10k monthly visitors..."
                required
                value={form.currentTraction}
                onChange={(e) => updateField("currentTraction", e.target.value)}
                error={errors.currentTraction}
              />
            )}

            {step === 3 && (
              <>
                <Textarea
                  label="What have you tried so far?"
                  hint="Channels, tactics, experiments, marketing efforts."
                  placeholder="e.g., SEO content, Twitter/X threads, Product Hunt launch, cold outreach..."
                  required
                  value={form.triedTactics}
                  onChange={(e) => updateField("triedTactics", e.target.value)}
                  error={errors.triedTactics}
                />

                <Textarea
                  label="What's working and what's not?"
                  hint="Be specific about wins and failures."
                  placeholder="e.g., Twitter gets engagement but no conversions. SEO is slow..."
                  required
                  value={form.workingOrNot}
                  onChange={(e) => updateField("workingOrNot", e.target.value)}
                  error={errors.workingOrNot}
                />
              </>
            )}

            {step === 4 && (
              <>
                <RadioGroup
                  name="focusArea"
                  label="What should we focus on?"
                  options={FOCUS_AREA_OPTIONS}
                  value={form.focusArea}
                  onChange={(value) =>
                    updateField("focusArea", value as FormInput["focusArea"])
                  }
                  required
                />

                {/* Optional fields - collapsed by default */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 list-none flex items-center gap-2 py-2">
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-open:rotate-90" />
                    Optional: Add more context
                  </summary>
                  <div className="mt-4 space-y-5 pt-4 border-t border-border/40">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Competitor URLs (up to 3)
                      </label>
                      {form.competitors.map((competitor, index) => (
                        <Input
                          key={index}
                          label=""
                          placeholder={`https://competitor${index + 1}.com`}
                          type="url"
                          value={competitor}
                          onChange={(e) => updateCompetitor(index, e.target.value)}
                        />
                      ))}
                    </div>

                    <Input
                      label="Your website URL"
                      placeholder="https://yoursite.com"
                      type="url"
                      value={form.websiteUrl}
                      onChange={(e) => updateField("websiteUrl", e.target.value)}
                    />

                    <Textarea
                      label="Analytics summary"
                      hint="Paste key metrics from Google Analytics, PostHog, etc."
                      placeholder="e.g., Top traffic sources, bounce rate, conversion funnel..."
                      value={form.analyticsSummary}
                      onChange={(e) => updateField("analyticsSummary", e.target.value)}
                    />

                    <Textarea
                      label="Constraints"
                      hint="Budget, time, skills, or other limitations."
                      placeholder="e.g., $500/month budget, solo founder, limited time..."
                      value={form.constraints}
                      onChange={(e) => updateField("constraints", e.target.value)}
                    />

                    <FileUpload
                      label="Supporting files"
                      hint="Screenshots, PDFs, etc. (max 5 files, 10MB each)"
                      files={form.attachments}
                      onFilesChange={(files) => updateField("attachments", files)}
                      maxFiles={5}
                      maxSizeMB={10}
                    />
                  </div>
                </details>

                {/* Promo code */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(!showCodeInput)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Gift className="h-4 w-4" />
                    <span>Have a promo code?</span>
                  </button>

                  {showCodeInput && (
                    <div className="mt-4 p-4 rounded-lg bg-surface/50 border border-border/60">
                      {hasValidCode ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium">
                              Code applied: {codeStatus.credits} free{" "}
                              {codeStatus.credits === 1 ? "strategy" : "strategies"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={clearCode}
                            className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value.toUpperCase());
                                setCodeStatus(null);
                              }}
                              placeholder="Enter code"
                              className="flex-1 rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="md"
                              onClick={validateCode}
                              disabled={!promoCode.trim() || isValidatingCode}
                            >
                              {isValidatingCode ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </div>

                          {codeStatus && !codeStatus.valid && (
                            <p className="text-sm text-red-500 flex items-center gap-1.5">
                              <X className="h-4 w-4" />
                              {codeStatus.error || "Invalid code"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-border/50">
              {errors.submit && (
                <p className="text-sm text-red-500 mb-4">{errors.submit}</p>
              )}

              <div className="flex items-center justify-between">
                <div>
                  {step > 1 && (
                    <Button variant="ghost" onClick={handleBack}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Character count on final step */}
                  {step === TOTAL_STEPS && (
                    <span
                      className={`text-xs ${
                        charPercentage > 90 ? "text-cta" : "text-muted"
                      }`}
                    >
                      {totalChars.toLocaleString()} / {MAX_TOTAL_CHARS.toLocaleString()}
                    </span>
                  )}

                  {step < TOTAL_STEPS ? (
                    <Button onClick={handleNext} size="lg">
                      Continue
                      <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      size="lg"
                      className={hasValidCode ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : hasValidCode ? (
                        "Generate Strategy — Free"
                      ) : (
                        "Generate Strategy — $15"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
