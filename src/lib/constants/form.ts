/**
 * Shared form constants used across form hooks
 */

// Map question IDs to funnel step names for analytics
export const STEP_NAMES: Record<string, string> = {
  websiteUrl: 'url',
  productDescription: 'product',
  currentTraction: 'traction',
  tacticsAndResults: 'tactics',
  attachments: 'uploads',
  focusArea: 'focus',
  email: 'email',
  competitors: 'competitors',
}

// Duration for acknowledgment animation between questions (ms)
export const ACKNOWLEDGMENT_DURATION_MS = 600
