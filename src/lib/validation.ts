/**
 * Validates an email address
 * - Trims and lowercases input
 * - Rejects empty parts, consecutive dots, leading/trailing dots
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();

  // Basic syntax check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;

  const [localPart, domain] = trimmed.split("@");

  // Reject edge cases
  if (!localPart || !domain) return false;
  if (localPart.includes("..") || domain.includes("..")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".")) return false;

  return true;
}
