/**
 * Business profile types for Boost Weekly onboarding.
 *
 * Stored in businesses.context JSONB — no new table needed.
 * Progressive collection during /subscribe onboarding flow.
 */

export interface BusinessProfile {
  // Basics (from URL analysis + user input)
  websiteUrl?: string
  description?: string
  industry?: string

  // ICP
  icp?: {
    who: string       // "Who is your ideal customer?"
    problem: string   // "What problem do you solve for them?"
    alternatives: string  // "What do they do instead of using you?"
  }

  // Brand voice
  voice?: {
    tone: string      // "How do you want to sound?" (e.g., "direct and confident", "friendly and approachable")
    examples?: string // Paste of existing copy or description
    dos?: string[]    // "Always mention free tier"
    donts?: string[]  // "Never compare to X by name"
  }

  // Competition
  competitors?: string[]  // Up to 5 URLs

  // What they've tried
  triedBefore?: string  // Free text: what marketing they've done

  // Goals
  goals?: {
    primary: string     // "What's your #1 marketing goal right now?"
    timeline?: string   // "What's your timeline?"
    budget?: string     // "Monthly marketing budget?" (optional)
  }

  // Metadata
  onboardingCompleted?: boolean
  onboardingCompletedAt?: string
}

/**
 * Steps in the onboarding wizard.
 * Each step maps to a section of BusinessProfile.
 */
export const ONBOARDING_STEPS = [
  { id: "url", label: "Your website", field: "websiteUrl" },
  { id: "description", label: "About your business", field: "description" },
  { id: "icp", label: "Your customers", field: "icp" },
  { id: "voice", label: "Your voice", field: "voice" },
  { id: "competitors", label: "Competitors", field: "competitors" },
  { id: "tried", label: "What you've tried", field: "triedBefore" },
  { id: "goals", label: "Your goals", field: "goals" },
] as const

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"]
