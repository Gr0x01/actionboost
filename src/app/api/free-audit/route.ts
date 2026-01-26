import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { FormInput, validateForm, FOCUS_AREAS } from "@/lib/types/form";
import { Json } from "@/lib/types/database";
import { trackServerEvent } from "@/lib/analytics";
import { isValidEmail, isDisposableEmail } from "@/lib/validation";
import { sendMagicLink } from "@/lib/auth/send-magic-link";
import { signAuditToken } from "@/lib/auth/audit-token";
import { createBusiness } from "@/lib/business";
import { inngest } from "@/lib/inngest";

// No longer need extended timeout - Inngest handles the pipeline

// Field length limits for server-side validation
const MAX_FIELD_LENGTHS: Record<string, number> = {
  productDescription: 5000,
  currentTraction: 2000,
  tacticsAndResults: 3000,
  analyticsSummary: 2000,
  constraints: 1000,
};

// IP rate limiting for free audits
// NOTE: In-memory storage - resets on deploy/restart, doesn't sync across serverless instances.
// Acceptable for MVP. For production scale, move to Redis or database.
const freeAuditCounts = new Map<string, { count: number; resetAt: number }>();
const IP_RATE_LIMIT = 5; // max free audits per IP per window
const IP_RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkIPRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = freeAuditCounts.get(ip);

  if (!record || now > record.resetAt) {
    freeAuditCounts.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW });
    return true;
  }

  if (record.count >= IP_RATE_LIMIT) {
    return false;
  }

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

/**
 * Verify Cloudflare Turnstile token
 * Skips verification in dev if env vars not set
 */
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET;
  if (!secret) {
    // Skip in dev if not configured
    console.log("[FreeAudit] Turnstile secret not configured, skipping verification");
    return true;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("[FreeAudit] Turnstile verification failed:", error);
    // Fail closed - security over convenience
    return false;
  }
}

/**
 * Normalize email for rate limiting - strips plus addressing for all domains
 * e.g., "test+spam@gmail.com" -> "test@gmail.com"
 * e.g., "user+tag@outlook.com" -> "user@outlook.com"
 */
function normalizeEmailForRateLimit(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  // Strip +suffix for all domains (common alias pattern)
  const normalizedLocal = local.split("+")[0];
  // For Gmail specifically, also remove dots (they're ignored by Gmail)
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return normalizedLocal.replace(/\./g, "") + "@gmail.com";
  }
  return normalizedLocal + "@" + domain;
}

export async function POST(request: NextRequest) {
  try {
    const { email, input, posthogDistinctId, turnstileToken, website } = (await request.json()) as {
      email: string;
      input: FormInput;
      posthogDistinctId?: string;
      turnstileToken?: string;
      website?: string; // Honeypot field
    };

    // 1. Honeypot check - if filled, return fake success (don't tip off bots)
    if (website) {
      console.log("[FreeAudit] Honeypot triggered, returning fake success");
      trackServerEvent("bot-trap", "honeypot_triggered", { ip: getClientIP(request) });
      // Return fake success with random-looking IDs to avoid detection
      await new Promise((resolve) => setTimeout(resolve, 500));
      const fakeId = `fa_${crypto.randomUUID().slice(0, 8)}`;
      const fakeToken = crypto.randomUUID();
      return NextResponse.json({ freeAuditId: fakeId, token: fakeToken });
    }

    // 2. IP rate limit check
    const clientIP = getClientIP(request);
    if (!checkIPRateLimit(clientIP)) {
      console.log(`[FreeAudit] IP rate limit exceeded for ${clientIP}`);
      trackServerEvent("rate-limit", "free_audit_ip_limit", { ip: clientIP });
      return NextResponse.json(
        { error: "Too many free audit requests. Please try again tomorrow." },
        { status: 429 }
      );
    }

    // 3. Turnstile verification (bot protection)
    if (turnstileToken) {
      const turnstileValid = await verifyTurnstile(turnstileToken);
      if (!turnstileValid) {
        console.log("[FreeAudit] Turnstile verification failed");
        trackServerEvent("bot-trap", "turnstile_failed", { ip: clientIP });
        return NextResponse.json(
          { error: "Bot verification failed. Please try again." },
          { status: 400 }
        );
      }
    } else if (process.env.CLOUDFLARE_TURNSTILE_SECRET) {
      // Turnstile is configured but no token provided
      console.log("[FreeAudit] No Turnstile token provided");
      return NextResponse.json(
        { error: "Bot verification required. Please try again." },
        { status: 400 }
      );
    }

    // 4. Validate email format
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // 5. Check for disposable email
    const disposableDomain = isDisposableEmail(email);
    if (disposableDomain) {
      console.log(`[FreeAudit] Disposable email blocked: ${disposableDomain}`);
      trackServerEvent("abuse-prevention", "disposable_email_blocked", { domain: disposableDomain });
      return NextResponse.json(
        { error: "Please use a permanent email address. Temporary email services are not accepted." },
        { status: 400 }
      );
    }

    // Validate form input
    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    // Validate focusArea is a valid enum value
    if (!FOCUS_AREAS.includes(input.focusArea)) {
      return NextResponse.json(
        { error: "Invalid focus area" },
        { status: 400 }
      );
    }

    // Validate individual field lengths (prevent API credit waste)
    for (const [field, maxLen] of Object.entries(MAX_FIELD_LENGTHS)) {
      const value = input[field as keyof FormInput];
      if (typeof value === "string" && value.length > maxLen) {
        return NextResponse.json(
          { error: `${field} exceeds maximum length of ${maxLen} characters` },
          { status: 400 }
        );
      }
    }

    // Validate form content
    const formErrors = validateForm(input);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(formErrors)[0] },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedEmail = normalizeEmailForRateLimit(email);
    const displayEmail = email.toLowerCase().trim(); // Keep original for storage

    // Check if email already has a free audit (rate limiting: 1 per normalized email)
    const { data: existingAudit } = await supabase
      .from("free_audits")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existingAudit) {
      return NextResponse.json(
        { error: "You've already received a free audit. Get the full version for deeper insights!" },
        { status: 409 }
      );
    }

    // Get or create user by email (for dashboard access)
    let userId: string | null = null;
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", displayEmail)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ email: displayEmail })
        .select("id")
        .single();

      if (!userError && newUser) {
        userId = newUser.id;
      }
      // If user creation fails, continue without linking - audit still works
    }

    // Transform FormInput to RunInput format for AI pipeline
    const runInput = {
      productDescription: input.productDescription,
      currentTraction: input.currentTraction,
      tacticsAndResults: input.tacticsAndResults,
      focusArea: input.focusArea,
      competitorUrls: input.competitors?.filter(Boolean) || [],
      websiteUrl: input.websiteUrl || "",
      analyticsSummary: input.analyticsSummary || "",
      constraints: input.constraints || "",
    };

    // Create a new business for this free audit (each audit is a different business)
    let businessId: string | null = null;
    if (userId) {
      try {
        businessId = await createBusiness(userId, runInput);
        console.log(`[FreeAudit] Created business ${businessId} for user ${userId}`);
      } catch (err) {
        console.error("[FreeAudit] Failed to create business:", err);
        // Continue without business - audit still works
      }
    }

    // Create free_audits record (store normalized email for rate limiting)
    const { data: freeAudit, error: insertError } = await supabase
      .from("free_audits")
      .insert({
        email: normalizedEmail,
        user_id: userId,
        business_id: businessId,
        input: runInput as unknown as Json,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !freeAudit) {
      // Check if it's a unique constraint violation (race condition)
      if (insertError?.code === "23505") {
        return NextResponse.json(
          { error: "You've already received a free audit. Get the full version for deeper insights!" },
          { status: 409 }
        );
      }
      console.error("Failed to create free audit:", insertError);
      return NextResponse.json(
        { error: "Failed to create free audit" },
        { status: 500 }
      );
    }

    // Track free audit started (don't log full email for privacy - only domain)
    const distinctId = posthogDistinctId || freeAudit.id;
    trackServerEvent(distinctId, "free_audit_started", {
      free_audit_id: freeAudit.id,
      email_domain: displayEmail.split("@")[1],
      focus_area: input.focusArea,
    });

    // Trigger free pipeline via Inngest
    try {
      await inngest.send({
        name: "free-audit/created",
        data: { freeAuditId: freeAudit.id, input: runInput },
      });
    } catch (err) {
      console.error(`[API] Failed to trigger Inngest for free audit ${freeAudit.id}:`, err);
    }

    // Send magic link for dashboard access (fire and forget)
    sendMagicLink(displayEmail, "/dashboard").catch((err) => {
      console.error("Magic link failed for free audit:", freeAudit.id, err);
    });

    // Generate access token for viewing results
    const token = signAuditToken(freeAudit.id);

    return NextResponse.json({ freeAuditId: freeAudit.id, token });
  } catch (error) {
    console.error("Free audit error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
