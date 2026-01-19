"use client";

import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/layout";
import { Button, Textarea, Input, RadioGroup } from "@/components/ui";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateField = <K extends keyof FormInput>(
    field: K,
    value: FormInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsSubmitting(true);

    // TODO: Navigate to checkout with form data
    // For now, just log
    console.log("Form submitted:", form);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
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
                </div>
              )}
            </section>

            {/* Character count and submit */}
            <div className="sticky bottom-0 bg-background py-4 border-t border-border -mx-6 px-6">
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
                  className="flex-shrink-0"
                >
                  {isSubmitting ? "Processing..." : "Generate Strategy — $15"}
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
