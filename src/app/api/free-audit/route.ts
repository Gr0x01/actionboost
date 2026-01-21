import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { FormInput, validateForm, FOCUS_AREAS } from "@/lib/types/form";
import { Json } from "@/lib/types/database";
import { runFreePipeline } from "@/lib/ai/pipeline";
import { trackServerEvent } from "@/lib/analytics";
import { isValidEmail } from "@/lib/validation";
import { sendMagicLink } from "@/lib/auth/send-magic-link";
import { signAuditToken } from "@/lib/auth/audit-token";

// Field length limits for server-side validation
const MAX_FIELD_LENGTHS: Record<string, number> = {
  productDescription: 5000,
  currentTraction: 2000,
  tacticsAndResults: 3000,
  analyticsSummary: 2000,
  constraints: 1000,
};

/**
 * Normalize email for rate limiting - strips Gmail plus addressing
 * e.g., "test+spam@gmail.com" -> "test@gmail.com"
 */
function normalizeEmailForRateLimit(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Strip +suffix and dots for Gmail
    return local.split("+")[0].replace(/\./g, "") + "@gmail.com";
  }
  return email.toLowerCase().trim();
}

export async function POST(request: NextRequest) {
  try {
    const { email, input, posthogDistinctId } = (await request.json()) as {
      email: string;
      input: FormInput;
      posthogDistinctId?: string;
    };

    // Validate email
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
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

    // Create free_audits record (store normalized email for rate limiting)
    const { data: freeAudit, error: insertError } = await supabase
      .from("free_audits")
      .insert({
        email: normalizedEmail,
        user_id: userId,
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

    // Trigger free pipeline (fire and forget, but track failures)
    runFreePipeline(freeAudit.id, runInput).catch((err) => {
      console.error("Free pipeline failed for audit:", freeAudit.id, err);
      trackServerEvent(distinctId, "free_audit_pipeline_failed", {
        free_audit_id: freeAudit.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

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
