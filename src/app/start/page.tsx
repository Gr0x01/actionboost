"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout";
import { Check, Loader2, ArrowRight, Globe, ChevronRight } from "lucide-react";
import {
  FormInput,
  FocusArea,
  INITIAL_FORM_STATE,
} from "@/lib/types/form";

const STORAGE_KEY = "actionboost-form-v3";

// Question definitions
const QUESTIONS = [
  {
    id: "websiteUrl",
    question: "What's your website?",
    acknowledgment: "Got it, I'll analyze this",
    type: "url" as const,
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
    id: "focusArea",
    question: "Where should we focus?",
    acknowledgment: null, // No acknowledgment, goes to competitors
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


// Progress bar component
function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = ((current) / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-1 bg-border/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
}

// URL input with favicon
function UrlInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (value && value.includes(".")) {
      try {
        const url = value.startsWith("http") ? value : `https://${value}`;
        const domain = new URL(url).hostname;
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
      } catch {
        setFavicon(null);
      }
    } else {
      setFavicon(null);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 bg-surface/50 border border-border/60 rounded-xl px-4 py-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        {favicon ? (
          <img src={favicon} alt="" className="w-5 h-5 rounded" />
        ) : (
          <Globe className="w-5 h-5 text-muted" />
        )}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://yourproduct.com"
          className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none"
        />
        {value.trim() && (
          <button
            onClick={onSubmit}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-muted mt-2 text-center">Press Enter to continue</p>
    </div>
  );
}

// Textarea input
function TextareaInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className="relative">
      <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-4 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your answer..."}
          rows={2}
          className="w-full bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none resize-none min-h-[60px]"
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted">Press Enter to continue (Shift+Enter for new line)</p>
        {value.trim() && (
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Traction input with chips
function TractionInput({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chips = ["Pre-launch", "< 100 users", "100-1K users", "1K-10K users", "10K+ users"];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChipClick = (chip: string) => {
    onChange(chip);
    setTimeout(onSubmit, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              value === chip
                ? "bg-primary text-white border-primary"
                : "bg-surface/50 border-border/60 text-foreground hover:border-primary/50 hover:bg-surface"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="text-center text-muted text-sm">or type specifics</div>
      <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 500 users, $2k MRR, 10k monthly visitors"
          className="w-full bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none"
        />
      </div>
      {value.trim() && !chips.includes(value) && (
        <div className="flex justify-center">
          <button
            onClick={onSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Focus area cards
function FocusInput({
  value,
  onChange,
  onSubmit,
}: {
  value: FocusArea;
  onChange: (v: FocusArea) => void;
  onSubmit: () => void;
}) {
  const options: { value: FocusArea; label: string; description: string }[] = [
    {
      value: "growth",
      label: "Growth & Acquisition",
      description: "Get more users and expand reach",
    },
    {
      value: "monetization",
      label: "Monetization",
      description: "Convert users and increase revenue",
    },
    {
      value: "positioning",
      label: "Positioning",
      description: "Differentiate and own your market",
    },
  ];

  const handleSelect = (v: FocusArea) => {
    onChange(v);
    setTimeout(onSubmit, 200);
  };

  return (
    <div className="grid gap-3 max-w-lg mx-auto">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={`p-5 rounded-xl border text-left transition-all ${
            value === option.value
              ? "bg-primary/10 border-primary shadow-sm"
              : "bg-surface/50 border-border/60 hover:border-primary/50 hover:bg-surface"
          }`}
        >
          <div className="font-semibold text-foreground">{option.label}</div>
          <div className="text-sm text-muted mt-1">{option.description}</div>
        </button>
      ))}
    </div>
  );
}

// Competitor URLs input
function CompetitorInput({
  value,
  onChange,
  onSubmit,
  onSkip,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const [current, setCurrent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addCompetitor = () => {
    if (current.trim() && value.length < 3) {
      onChange([...value, current.trim()]);
      setCurrent("");
    }
  };

  const removeCompetitor = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (current.trim()) {
        addCompetitor();
      } else if (value.length > 0) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm"
            >
              {url}
              <button
                onClick={() => removeCompetitor(i)}
                className="text-muted hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {value.length < 3 && (
        <div className="bg-surface/50 border border-border/60 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            ref={inputRef}
            type="url"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://competitor.com"
            className="w-full bg-transparent text-lg text-foreground placeholder:text-muted/50 outline-none"
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          {value.length > 0 ? "Done" : "Skip"}
        </button>
        {current.trim() && (
          <button
            onClick={addCompetitor}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface/80 transition-colors"
          >
            Add
            <span className="text-muted">({value.length}/3)</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Acknowledgment display
function Acknowledgment({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-center gap-2 text-primary"
    >
      <Check className="w-5 h-5" />
      <span className="text-lg font-medium">{text}</span>
    </motion.div>
  );
}

// Checkout/Submit section
function CheckoutSection({
  onSubmit,
  isSubmitting,
  hasValidCode,
  promoCode,
  setPromoCode,
  codeStatus,
  validateCode,
  isValidatingCode,
  clearCode,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
  hasValidCode: boolean;
  promoCode: string;
  setPromoCode: (v: string) => void;
  codeStatus: { valid: boolean; credits?: number; error?: string } | null;
  validateCode: () => void;
  isValidatingCode: boolean;
  clearCode: () => void;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Ready to generate your strategy</h2>
        <p className="text-muted">Our AI will analyze your inputs and create a custom growth playbook</p>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all ${
          hasValidCode
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </span>
        ) : hasValidCode ? (
          "Generate Strategy — Free"
        ) : (
          "Generate Strategy — $15"
        )}
      </button>

      {/* Promo code */}
      <div>
        {!showCode && !hasValidCode && (
          <button
            onClick={() => setShowCode(true)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Have a promo code?
          </button>
        )}

        {showCode && !hasValidCode && (
          <div className="max-w-xs mx-auto mt-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-surface/50 text-sm text-foreground placeholder:text-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={validateCode}
                disabled={!promoCode.trim() || isValidatingCode}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-surface/80 transition-colors disabled:opacity-50"
              >
                {isValidatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            {codeStatus && !codeStatus.valid && (
              <p className="text-sm text-red-500">{codeStatus.error || "Invalid code"}</p>
            )}
          </div>
        )}

        {hasValidCode && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">
              Code applied: {codeStatus?.credits} free {codeStatus?.credits === 1 ? "strategy" : "strategies"}
            </span>
            <button onClick={clearCode} className="text-muted hover:text-foreground ml-2">
              ×
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Main component
export default function StartPage() {
  const router = useRouter();
  const posthog = usePostHog();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [form, setForm] = useState<FormInput>(INITIAL_FORM_STATE);
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
  const isComplete = currentQuestion >= QUESTIONS.length;

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
        setCurrentQuestion((c) => c + 1);
      }, 600);
    } else {
      setCurrentQuestion((c) => c + 1);
    }

    posthog?.capture("question_answered", {
      question_id: QUESTIONS[currentQuestion]?.id,
      question_index: currentQuestion,
    });
  }, [currentQuestion, posthog]);

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
          body: JSON.stringify({ code: promoCode, input: form }),
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-12">
            <ProgressBar current={currentQuestion} total={QUESTIONS.length} />
          </div>

          <AnimatePresence mode="wait">
            {showAcknowledgment ? (
              <motion.div
                key="ack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[300px] flex items-center justify-center"
              >
                <Acknowledgment text={QUESTIONS[currentQuestion]?.acknowledgment || ""} />
              </motion.div>
            ) : isComplete ? (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[300px] flex items-center justify-center"
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
              </motion.div>
            ) : (
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
                      />
                    )}

                    {question.type === "textarea" && (
                      <TextareaInput
                        value={getValue(question.id) as string}
                        onChange={(v) => updateField(question.id as keyof FormInput, v as never)}
                        onSubmit={goToNext}
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
                      />
                    )}

                    {question.type === "focus" && (
                      <FocusInput
                        value={form.focusArea}
                        onChange={(v) => updateField("focusArea", v)}
                        onSubmit={goToNext}
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
                      />
                    )}
                  </motion.div>
                )}
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
