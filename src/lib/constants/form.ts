/**
 * Shared form constants used across form hooks
 */

// Map question IDs to funnel step names for analytics
export const STEP_NAMES: Record<string, string> = {
  currentTraction: 'traction',
  focusArea: 'focus',
  productDescription: 'product',
  alternatives: 'alternatives',
  websiteUrl: 'url',
  competitors: 'competitors',
  email: 'email',
}

// Duration for acknowledgment animation between questions (ms)
export const ACKNOWLEDGMENT_DURATION_MS = 600
