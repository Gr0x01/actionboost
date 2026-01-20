export interface Tactic {
  number?: number;
  title: string;
  stage?: string;
  description: string;
  implementation: string[];
  ice: {
    impact: number;
    confidence: number;
    ease: number;
  };
  reasoning?: string;
}

interface TacticCardProps {
  tactic: Tactic;
  showStage?: boolean;
}

export function TacticCard({ tactic, showStage = true }: TacticCardProps) {
  const totalScore = tactic.ice.impact + tactic.ice.confidence + tactic.ice.ease;

  return (
    <div className="bg-background rounded-xl border border-border/60 p-6 shadow-md">
      {/* ICE Scores - top right */}
      <div className="float-right ml-4 mb-2 flex gap-4 px-4 py-2 rounded-lg border border-border/50 bg-surface/50">
        <div className="text-center">
          <div className="text-xl font-bold text-navy">{tactic.ice.impact}</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">
            Impact
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-navy">
            {tactic.ice.confidence}
          </div>
          <div className="text-[9px] text-muted uppercase tracking-wider">
            Confidence
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-navy">{tactic.ice.ease}</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">
            Ease
          </div>
        </div>
      </div>

      {/* Stage badge */}
      {showStage && tactic.stage && (
        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md mb-3">
          {tactic.stage}
        </span>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-navy">
        {tactic.number && `${tactic.number}. `}
        {tactic.title}
      </h3>

      {/* Description */}
      <p className="mt-3 text-muted font-serif leading-relaxed clear-none">
        {tactic.description}
      </p>

      {/* Implementation steps */}
      <div className="mt-4 clear-right">
        <p className="font-semibold text-navy mb-2 text-sm">Implementation:</p>
        <ol className="space-y-1.5 text-muted list-decimal list-inside ml-1 text-sm">
          {tactic.implementation.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Reasoning (optional) */}
      {tactic.reasoning && (
        <p className="mt-4 text-xs text-muted/80 italic border-l-2 border-primary/30 pl-3">
          {tactic.reasoning}
        </p>
      )}

      {/* Total score indicator */}
      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
        <span className="text-xs text-muted">Total ICE Score</span>
        <span className="text-sm font-bold text-cta">{totalScore}/30</span>
      </div>
    </div>
  );
}

// Example tactics for landing page sections
export const AARRR_EXAMPLE_TACTIC: Tactic = {
  number: 1,
  title: "Add Progress Indicators to Onboarding",
  stage: "Activation",
  description:
    "Users who complete onboarding are 3x more likely to become paying customers. Right now, they're dropping off because they don't know how close they are to their first win.",
  implementation: [
    "Add a 4-step progress bar to your signup flow",
    "Celebrate each step with micro-animations and encouraging copy",
    "Email users who abandon at step 2 with a nudge about what they'll unlock",
  ],
  ice: {
    impact: 8,
    confidence: 9,
    ease: 7,
  },
  reasoning:
    "Products with visible progress indicators see 32% higher completion rates.",
};

export const ICE_EXAMPLE_TACTIC: Tactic = {
  number: 2,
  title: "Partner with Complementary Products",
  stage: "Acquisition",
  description:
    "Stop competing for cold traffic. Your competitors have already built the audience you need. Find non-competitive products serving the same customer and propose mutual promotion.",
  implementation: [
    "List 10 products your ideal customers also use",
    "Reach out to 5 with a specific cross-promotion pitch",
    "Start with newsletter swaps (lowest friction, 1-day turnaround)",
  ],
  ice: {
    impact: 9,
    confidence: 7,
    ease: 8,
  },
  reasoning:
    "Acquired customers through partnerships have 2.3x higher LTV than paid acquisition.",
};

export const GROWTH_EXAMPLE_TACTIC: Tactic = {
  number: 3,
  title: "Launch a 'State of [Industry]' Report",
  stage: "Acquisition",
  description:
    "Original research gets links and shares that generic content never will. Survey your users or aggregate public data into an annual report that positions you as the authority.",
  implementation: [
    "Identify 5-7 questions your industry debates but lacks data on",
    "Survey 100+ people via your list, social, or paid panel",
    "Design a shareable PDF with key stats and your branding",
    "Pitch it to newsletters and podcasts in your space",
  ],
  ice: {
    impact: 9,
    confidence: 8,
    ease: 5,
  },
  reasoning:
    "Original research content generates 3x more backlinks than how-to guides.",
};
