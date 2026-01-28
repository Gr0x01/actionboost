import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidEmail, isDisposableEmail } from "@/lib/validation";
import { inngest } from "@/lib/inngest";

// IP rate limiting (in-memory, acceptable for MVP)
const auditCounts = new Map<string, { count: number; resetAt: number }>();
const IP_RATE_LIMIT = 5;
const IP_RATE_WINDOW = 24 * 60 * 60 * 1000; // 24h

function checkIPRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = auditCounts.get(ip);
  if (!record || now > record.resetAt) {
    auditCounts.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW });
    return true;
  }
  if (record.count >= IP_RATE_LIMIT) return false;
  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function verifyTurnstile(token: string): Promise<boolean> {
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

function normalizeEmailForRateLimit(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  const normalizedLocal = local.split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return normalizedLocal.replace(/\./g, "") + "@gmail.com";
  }
  return normalizedLocal + "@" + domain;
}

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { url, businessDescription, email, turnstileToken, website } = (await request.json()) as {
      url: string;
      businessDescription: string;
      email: string;
      turnstileToken?: string;
      website?: string; // Honeypot
    };

    // 1. Honeypot
    if (website) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ slug: "fake" + generateSlug() });
    }

    // 2. IP rate limit
    const clientIP = getClientIP(request);
    if (!checkIPRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again tomorrow." },
        { status: 429 }
      );
    }

    // 3. Turnstile
    if (turnstileToken) {
      if (!(await verifyTurnstile(turnstileToken))) {
        return NextResponse.json({ error: "Bot verification failed." }, { status: 400 });
      }
    } else if (process.env.CLOUDFLARE_TURNSTILE_SECRET && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Bot verification required." }, { status: 400 });
    }

    // 4. Validate inputs
    if (!url || typeof url !== "string" || url.length < 4 || url.length > 500) {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    // URL validation — require valid format with real domain
    try {
      const urlToTest = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
      const parsed = new URL(urlToTest);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
      if (!parsed.hostname.includes(".")) {
        return NextResponse.json({ error: "Please enter a full website URL" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (!businessDescription || typeof businessDescription !== "string" || businessDescription.length < 10 || businessDescription.length > 500) {
      return NextResponse.json({ error: "Business description must be 10-500 characters" }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Please use a permanent email address." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedEmail = normalizeEmailForRateLimit(email);

    // Check 1-per-email limit
    const { data: existing } = await supabase
      .from("marketing_audits")
      .select("slug")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You've already received a marketing audit.", existingSlug: existing.slug },
        { status: 409 }
      );
    }

    // Normalize URL
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    // Create record (insert + select in one query)
    const slug = generateSlug();
    const { data: created, error: insertError } = await supabase
      .from("marketing_audits")
      .insert({
        slug,
        url: normalizedUrl,
        email: normalizedEmail,
        business_description: businessDescription,
        status: "pending",
      })
      .select("id, slug")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You've already received a marketing audit." },
          { status: 409 }
        );
      }
      console.error("[MarketingAudit] Insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create audit" }, { status: 500 });
    }

    // Trigger Inngest pipeline
    try {
      await inngest.send({
        name: "marketing-audit/created",
        data: { auditId: created.id },
      });
    } catch (err) {
      console.error("[MarketingAudit] Failed to trigger Inngest:", err);
    }

    return NextResponse.json({ slug: created.slug });
  } catch (error) {
    console.error("[MarketingAudit] Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
