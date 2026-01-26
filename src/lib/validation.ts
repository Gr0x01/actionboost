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

/**
 * Common disposable email domains - O(1) lookup
 * List includes the most common temp email services used for abuse
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Most popular temp mail services
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "maildrop.cc",
  "mailnesia.com",
  "throwaway.email",
  "throwawaymail.com",
  "getairmail.com",
  "getnada.com",
  "nada.email",
  "fakeinbox.com",
  "tempail.com",
  "dispostable.com",
  "mailcatch.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "sharklasers.com",
  "spam4.me",
  "grr.la",
  "pokemail.net",
  "mohmal.com",
  "tempinbox.com",
  "burnermail.io",
  "mytemp.email",
  "tempmailo.com",
  "emailondeck.com",
  "mintemail.com",
  "spamgourmet.com",
  "mailexpire.com",
  "discard.email",
  "discardmail.com",
  "spambog.com",
  "spambog.de",
  "spambog.ru",
  "fakemailgenerator.com",
  "emailfake.com",
  "crazymailing.com",
  "tempsky.com",
  "tempr.email",
  "dropmail.me",
  "harakirimail.com",
  "33mail.com",
  "mailsac.com",
  "anonymbox.com",
  "mail-temp.com",
  "tmpmail.org",
  "tmpmail.net",
  "moakt.com",
  "moakt.ws",
  "mailforspam.com",
  "spam.la",
  "binkmail.com",
  "safetymail.info",
  "spamobox.com",
  "mailnull.com",
  "e4ward.com",
  "spamfree24.org",
  "spamfree24.de",
  "spamfree24.info",
  "jetable.org",
  "kasmail.com",
  "mytrashmail.com",
  "nomail.xl.cx",
  "trash-mail.at",
  "filzmail.com",
  "incognitomail.org",
  "incognitomail.com",
  "receiveee.com",
  "trbvm.com",
  "maildu.de",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "einrot.com",
  "emailisvalid.com",
  "lroid.com",
  "spambox.us",
  "superrito.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.de",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "teleworm.us",
]);

/**
 * Checks if an email uses a known disposable email domain
 * @returns The domain if disposable, null if legitimate
 */
export function isDisposableEmail(email: string): string | null {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return null;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain) ? domain : null;
}
