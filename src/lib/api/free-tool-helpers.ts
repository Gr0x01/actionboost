import { NextRequest, NextResponse } from "next/server";

/**
 * Shared utilities for free tool API routes (marketing audit, target audience, etc.)
 * Single rate limit map shared across all tools.
 */

// --- IP Rate Limiting ---
// Shared map: one IP gets 5 free tool submissions total per 24h (across all tools).
// Periodic cleanup prevents unbounded growth (#8).
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const IP_RATE_LIMIT = 5;
const IP_RATE_WINDOW = 24 * 60 * 60 * 1000; // 24h
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1h

// Periodic cleanup of expired entries to prevent memory leak (#8)
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, record] of ipCounts) {
    if (now > record.resetAt) ipCounts.delete(ip);
  }
}

export function checkIPRateLimit(ip: string): boolean {
  cleanupExpired();
  const now = Date.now();
  const record = ipCounts.get(ip);
  if (!record || now > record.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW });
    return true;
  }
  if (record.count >= IP_RATE_LIMIT) return false;
  record.count++;
  return true;
}

// --- Client IP ---
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// --- Turnstile ---
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET;
  if (!secret) return true; // Skip in dev

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    return false; // Fail closed
  }
}

// --- Turnstile guard (returns error response or null if OK) ---
export async function guardTurnstile(turnstileToken?: string): Promise<NextResponse | null> {
  // Validate token if provided; skip gracefully if missing (ad blockers, network issues)
  if (turnstileToken) {
    if (!(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json({ error: "Bot verification failed." }, { status: 400 });
    }
  }
  return null;
}

// --- Email normalization ---
export function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  const normalizedLocal = local.split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return normalizedLocal.replace(/\./g, "") + "@gmail.com";
  }
  return normalizedLocal + "@" + domain;
}

// --- Slug generation ---
export function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

// --- Honeypot check (returns fake response or null) ---
export async function checkHoneypot(honeypotValue?: string): Promise<NextResponse | null> {
  if (honeypotValue) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ slug: "fake" + generateSlug() });
  }
  return null;
}
