export type FocusArea = "growth" | "monetization" | "positioning";

export interface FormInput {
  // Required fields
  productDescription: string;
  currentTraction: string;
  triedTactics: string;
  workingOrNot: string;

  // Focus area
  focusArea: FocusArea;

  // Optional fields
  competitors: string[]; // Up to 3 URLs
  websiteUrl: string;
  analyticsSummary: string;
  constraints: string;
}

export const FOCUS_AREA_OPTIONS: {
  value: FocusArea;
  label: string;
  description: string;
}[] = [
  {
    value: "growth",
    label: "Growth & Acquisition",
    description: "Focus on getting more users and expanding reach",
  },
  {
    value: "monetization",
    label: "Monetization & Conversion",
    description: "Focus on converting users and increasing revenue",
  },
  {
    value: "positioning",
    label: "Competitive Positioning",
    description: "Focus on differentiation and market position",
  },
];

export const INITIAL_FORM_STATE: FormInput = {
  productDescription: "",
  currentTraction: "",
  triedTactics: "",
  workingOrNot: "",
  focusArea: "growth",
  competitors: ["", "", ""],
  websiteUrl: "",
  analyticsSummary: "",
  constraints: "",
};

export const MAX_TOTAL_CHARS = 10000;

/**
 * Calculate total character count across all text fields
 */
export function getTotalCharCount(form: FormInput): number {
  return (
    form.productDescription.length +
    form.currentTraction.length +
    form.triedTactics.length +
    form.workingOrNot.length +
    form.competitors.join("").length +
    form.websiteUrl.length +
    form.analyticsSummary.length +
    form.constraints.length
  );
}

/**
 * Validate the form and return errors
 */
export function validateForm(form: FormInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.productDescription.trim()) {
    errors.productDescription = "Product description is required";
  }
  if (!form.currentTraction.trim()) {
    errors.currentTraction = "Current traction is required";
  }
  if (!form.triedTactics.trim()) {
    errors.triedTactics = "What you've tried is required";
  }
  if (!form.workingOrNot.trim()) {
    errors.workingOrNot = "What's working/not is required";
  }

  const totalChars = getTotalCharCount(form);
  if (totalChars > MAX_TOTAL_CHARS) {
    errors.total = `Total content exceeds ${MAX_TOTAL_CHARS.toLocaleString()} characters`;
  }

  return errors;
}
