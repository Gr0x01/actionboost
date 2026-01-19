"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button, Textarea, Input, RadioGroup, FileUpload } from "@/components/ui";
import { ChevronDown, ChevronUp, Check, X, Loader2, Gift } from "lucide-react";
import {
  FormInput,
  FOCUS_AREA_OPTIONS,
  INITIAL_FORM_STATE,
  MAX_TOTAL_CHARS,
  getTotalCharCount,
  validateForm,
} from "@/lib/types/form";

const STORAGE_KEY = "actionboost-form";

export default function StartPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setForm({ ...INITIAL_FORM_STATE, ...parsed });
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form]);

  const totalChars = getTotalCharCount(form);
  const charPercentage = (totalChars / MAX_TOTAL_CHARS) * 100;
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
      setCodeStatus({ valid: false, error: "Failed to validate code" });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const clearCode = () => {
    setPromoCode("");
    setCodeStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasValidCode) {
        // Use code - skip Stripe
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

        // Clear localStorage and redirect
        localStorage.removeItem(STORAGE_KEY);
        router.push(`/processing/${data.runId}`);
      } else {
        // No code - go to Stripe
        const res = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: form }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ submit: data.error || "Failed to create checkout" });
          setIsSubmitting(false);
          return;
        }

        // Redirect to Stripe
        window.location.href = data.url;
      }
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-6">
          {/* Page header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground">
              Tell us about your business
            </h1>
            <p className="mt-3 text-muted">
              The more context you provide, the better your strategy will be.
              Takes 5-10 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: About Your Business */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                About Your Business
              </h2>

              <Textarea
                label="What does your product do?"
                hint="Describe your product in 1-2 sentences. What problem does it solve?"
                placeholder="e.g., We're a project management tool for remote teams that focuses on async communication..."
                required
                value={form.productDescription}
                onChange={(e) =>
                  updateField("productDescription", e.target.value)
                }
                error={errors.productDescription}
              />

              <Textarea
                label="What's your current traction?"
                hint="Users, revenue, traffic, whatever matters for your business."
                placeholder="e.g., 500 registered users, 50 paying customers, $2k MRR, 10k monthly visitors..."
                required
                value={form.currentTraction}
                onChange={(e) => updateField("currentTraction", e.target.value)}
                error={errors.currentTraction}
              />
            </section>

            {/* Section 2: Your Growth Story */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                Your Growth Story
              </h2>

              <Textarea
                label="What have you tried so far?"
                hint="Channels, tactics, experiments, marketing efforts."
                placeholder="e.g., We've tried SEO content, Twitter/X threads, Product Hunt launch, cold outreach on LinkedIn..."
                required
                value={form.triedTactics}
                onChange={(e) => updateField("triedTactics", e.target.value)}
                error={errors.triedTactics}
              />

              <Textarea
                label="What's working and what's not?"
                hint="Be specific about wins and failures."
                placeholder="e.g., Twitter gets engagement but no conversions. SEO is slow. Product Hunt brought signups but low activation..."
                required
                value={form.workingOrNot}
                onChange={(e) => updateField("workingOrNot", e.target.value)}
                error={errors.workingOrNot}
              />
            </section>

            {/* Section 3: Focus Area */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                Focus Area
              </h2>

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
            </section>

            {/* Section 4: Optional Details */}
            <section className="space-y-6">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-xl font-semibold text-foreground border-b border-border pb-2 w-full text-left"
              >
                <span>Optional Details</span>
                {showOptional ? (
                  <ChevronUp className="h-5 w-5 text-muted" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted" />
                )}
              </button>

              {showOptional && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-3">
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
                        onChange={(e) =>
                          updateCompetitor(index, e.target.value)
                        }
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
                    placeholder="e.g., Top traffic sources, bounce rate, conversion funnel data..."
                    value={form.analyticsSummary}
                    onChange={(e) =>
                      updateField("analyticsSummary", e.target.value)
                    }
                  />

                  <Textarea
                    label="Constraints"
                    hint="Budget, time, skills, or other limitations."
                    placeholder="e.g., $500/month budget, solo founder, no design skills, limited time..."
                    value={form.constraints}
                    onChange={(e) => updateField("constraints", e.target.value)}
                  />

                  <FileUpload
                    label="Supporting files"
                    hint="Screenshots of analytics, PDFs, competitor pages, etc. (max 5 files, 10MB each)"
                    files={form.attachments}
                    onFilesChange={(files) => updateField("attachments", files)}
                    maxFiles={5}
                    maxSizeMB={10}
                  />
                </div>
              )}
            </section>

            {/* Promo Code Section */}
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Gift className="h-4 w-4" />
                <span>Have a promo code?</span>
                {showCodeInput ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showCodeInput && (
                <div className="p-4 rounded-lg border border-border bg-surface/50 animate-in slide-in-from-top-2 duration-200">
                  {hasValidCode ? (
                    // Valid code applied
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">
                          Code applied: {codeStatus.credits} free{" "}
                          {codeStatus.credits === 1 ? "strategy" : "strategies"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={clearCode}
                        className="text-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Code input
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setCodeStatus(null);
                          }}
                          placeholder="Enter code"
                          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={validateCode}
                          disabled={!promoCode.trim() || isValidatingCode}
                          className="px-4"
                        >
                          {isValidatingCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>

                      {codeStatus && !codeStatus.valid && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          {codeStatus.error || "Invalid code"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Character count and submit */}
            <div className="sticky bottom-0 bg-background py-4 border-t border-border -mx-6 px-6">
              {errors.submit && (
                <p className="text-sm text-red-500 mb-2">{errors.submit}</p>
              )}
              {errors.total && (
                <p className="text-sm text-red-500 mb-2">{errors.total}</p>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted">Content length</span>
                    <span
                      className={
                        charPercentage > 90 ? "text-cta" : "text-muted"
                      }
                    >
                      {totalChars.toLocaleString()} /{" "}
                      {MAX_TOTAL_CHARS.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        charPercentage > 90 ? "bg-cta" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(charPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className={`flex-shrink-0 ${hasValidCode ? "bg-green-600 hover:bg-green-700" : ""}`}
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
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
