import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ab_session";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Validate SECRET at module load
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters. Generate with: openssl rand -base64 32"
    );
  }
  return secret;
}
const SECRET = getSecret();

interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

export function signPayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyPayload(token: string): SessionPayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  // Use constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString()
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  userId: string,
  email: string
): Promise<void> {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Date.now() + MAX_AGE * 1000,
  };
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signPayload(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const payload = verifyPayload(cookie.value);
  return payload?.userId ?? null;
}
