"use client";

/**
 * FAQSection - Accordion FAQ for homepage
 *
 * Soft brutalist styling with plus/minus toggle icons.
 * Open state has orange-tinted border and shadow.
 */

import { useState } from "react";
import { Plus } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
}

export function FAQSection({
  faqs,
  title = "Common questions.",
  subtitle = "Straight answers",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-[0.15em] text-foreground/60 uppercase mb-4">
            {subtitle}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-foreground tracking-tight">
            {title.split(".")[0]}
            {title.includes(".") && <span className="font-black">.</span>}
          </h2>
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`
                  bg-white rounded-md overflow-hidden transition-all duration-200
                  ${
                    isOpen
                      ? "border-2 border-cta/40"
                      : "border-2 border-foreground/15"
                  }
                `}
                style={{
                  boxShadow: isOpen
                    ? "4px 4px 0 rgba(230, 126, 34, 0.15)"
                    : "3px 3px 0 rgba(44, 62, 80, 0.08)",
                }}
              >
                <button
                  id={`faq-question-${index}`}
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-base sm:text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <Plus
                    className={`w-5 h-5 shrink-0 text-foreground/50 transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-[1000px]" : "max-h-0"
                  }`}
                >
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-foreground/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
