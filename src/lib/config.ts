// Configuration
export const config = {
  // Pricing display (for consistency across UI)
  singlePrice: "$29",
};

// Internal admin email (for feature flags)
export const ADMIN_EMAIL = 'gr0x01@pm.me';

/**
 * Check if user is an internal tester
 * Used for feature flags like calendar view
 */
export function isInternalUser(email?: string | null): boolean {
  // In development, always show internal features
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return true;
  }
  // Or if user email matches admin
  return email === ADMIN_EMAIL;
}
