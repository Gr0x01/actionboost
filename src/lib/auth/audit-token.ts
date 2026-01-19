import { createHmac, timingSafeEqual } from "crypto";

/**
 * Audit token for securing free audit result access.
 * Uses HMAC-SHA256 with SESSION_SECRET to sign audit IDs.
 * Tokens don't expire - the audit data is the value, not the token.
 */

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters"
    );
  }
  return secret;
}

const SECRET = getSecret();

/**
 * Generate a signed token for an audit ID.
 * Format: base64url(auditId).base64url(hmac)
 */
export function signAuditToken(auditId: string): string {
  const data = Buffer.from(auditId).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

/**
 * Verify a token matches the audit ID.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyAuditToken(auditId: string, token: string): boolean {
  if (!token || !auditId) return false;

  const [data, sig] = token.split(".");
  if (!data || !sig) return false;

  // Verify the audit ID in the token matches
  try {
    const tokenAuditId = Buffer.from(data, "base64url").toString();
    if (tokenAuditId !== auditId) return false;
  } catch {
    return false;
  }

  // Verify the signature
  const expected = createHmac("sha256", SECRET).update(data).digest("base64url");

  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(sigBuffer, expectedBuffer);
}
