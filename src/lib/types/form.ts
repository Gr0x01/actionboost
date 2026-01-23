export type FocusArea = "acquisition" | "activation" | "retention" | "referral" | "monetization" | "custom";

// Array of valid focus areas for runtime validation
export const FOCUS_AREAS: FocusArea[] = ["acquisition", "activation", "retention", "referral", "monetization", "custom"];

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

export interface FormInput {
  // Required fields
  productDescription: string;
  currentTraction: string;
  tacticsAndResults: string; // Merged: what tactics tried + how they're going

  // Focus area
  focusArea: FocusArea;

  // Optional fields
  competitors: string[]; // Up to 3 URLs
  websiteUrl: string;
  analyticsSummary: string;
  constraints: string;
  attachments: FileAttachment[];
  email: string; // Collected before checkout for cart abandonment
}

export const FOCUS_AREA_OPTIONS: {
  value: FocusArea;
  label: string;
  description: string;
}[] = [
  {
    value: "acquisition",
    label: "Acquisition",
    description: "How do I get more users?",
  },
  {
    value: "activation",
    label: "Activation",
    description: "Users sign up but don't stick",
  },
  {
    value: "retention",
    label: "Retention",
    description: "Users leave after a few weeks",
  },
  {
    value: "referral",
    label: "Referral",
    description: "How do I get users to spread the word?",
  },
  {
    value: "monetization",
    label: "Monetization",
    description: "I have users but no revenue",
  },
  {
    value: "custom",
    label: "Other",
    description: "I have a specific challenge",
  },
];

export const INITIAL_FORM_STATE: FormInput = {
  productDescription: "",
  currentTraction: "",
  tacticsAndResults: "",
  focusArea: "acquisition",
  competitors: ["", "", ""],
  websiteUrl: "",
  analyticsSummary: "",
  constraints: "",
  attachments: [],
  email: "",
};

export const MAX_TOTAL_CHARS = 25000;

/**
 * Calculate total character count across all text fields
 */
export function getTotalCharCount(form: FormInput): number {
  return (
    form.productDescription.length +
    form.currentTraction.length +
    form.tacticsAndResults.length +
    form.competitors.join("").length +
    form.websiteUrl.length +
    form.analyticsSummary.length +
    form.constraints.length
  );
}

/**
 * Validate the form and return errors
 * @param form - The form data to validate
 * @param isReturningUser - If true, relaxes validation for fields the user has already provided in previous runs
 */
export function validateForm(form: FormInput, isReturningUser = false): Record<string, string> {
  const errors: Record<string, string> = {};

  // currentTraction and focusArea are required (button selections)
  if (!form.currentTraction.trim()) {
    errors.currentTraction = "Current traction is required";
  }

  // productDescription is required
  if (!form.productDescription.trim()) {
    errors.productDescription = "Product description is required";
  }

  // tacticsAndResults is optional (can be skipped)

  const totalChars = getTotalCharCount(form);
  if (totalChars > MAX_TOTAL_CHARS) {
    errors.total = `Total content exceeds ${MAX_TOTAL_CHARS.toLocaleString()} characters`;
  }

  return errors;
}
