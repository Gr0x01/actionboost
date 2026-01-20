import { NextRequest, NextResponse, after } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { FormInput, validateForm } from "@/lib/types/form";
import { Json } from "@/lib/types/database";
import { runPipeline } from "@/lib/ai/pipeline";
import { setSessionCookie } from "@/lib/auth/session-cookie";
import { sendMagicLink } from "@/lib/auth/send-magic-link";
import { trackServerEvent, identifyUser } from "@/lib/analytics";
import { isValidEmail } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { code, email, input, contextDelta, posthogDistinctId } = (await request.json()) as {
      code: string;
      email: string;
      input: FormInput;
      contextDelta?: string;
      posthogDistinctId?: string;
    };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    // Validate form content (character limits)
    const formErrors = validateForm(input);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(formErrors)[0] },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedCode = code.toUpperCase().trim();

    // Validate and get the code in a single query
    const { data: codeRecord, error: codeError } = await supabase
      .from("codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (codeError || !codeRecord) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Check expiration
    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 });
    }

    // Check max uses
    if (
      codeRecord.max_uses !== null &&
      (codeRecord.used_count ?? 0) >= codeRecord.max_uses
    ) {
      return NextResponse.json(
        { error: "Code has reached maximum uses" },
        { status: 400 }
      );
    }

    // Increment used_count atomically with optimistic locking
    const { data: updateResult, error: updateError } = await supabase
      .from("codes")
      .update({ used_count: (codeRecord.used_count ?? 0) + 1 })
      .eq("id", codeRecord.id)
      .eq("used_count", codeRecord.used_count ?? 0) // Optimistic locking
      .select("id");

    if (updateError) {
      console.error("Failed to update code usage:", updateError);
      return NextResponse.json(
        { error: "Failed to redeem code. Please try again." },
        { status: 500 }
      );
    }

    // Check if optimistic lock failed (another request got there first)
    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json(
        { error: "Code was already redeemed. Please try again." },
        { status: 409 }
      );
    }

    // Get or create user by email (handle race condition with upsert-like pattern)
    let userId: string | null = null;
    const normalizedEmail = email.toLowerCase().trim();

    // Try to insert first, handle unique constraint if user already exists
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ email: normalizedEmail })
      .select("id")
      .single();

    if (insertError) {
      // If unique constraint violation (23505), fetch existing user
      if (insertError.code === "23505") {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", normalizedEmail)
          .single();
        userId = existingUser?.id ?? null;
      } else {
        console.error("Failed to create user:", insertError);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }
    } else if (newUser) {
      userId = newUser.id;
    }

    // Fail if we couldn't resolve a user ID
    if (!userId) {
      console.error("Failed to resolve user ID for email:", normalizedEmail);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create the run linked to the user
    const { data: run, error: runError } = await supabase
      .from("runs")
      .insert({
        input: input as unknown as Json,
        status: "pending",
        user_id: userId,
      })
      .select("id")
      .single();

    if (runError || !run) {
      console.error("Failed to create run:", runError);
      return NextResponse.json(
        { error: "Failed to create run" },
        { status: 500 }
      );
    }

    // Create run_credits record for tracking
    const credits = codeRecord.credits ?? 1;
    const { error: creditError } = await supabase.from("run_credits").insert({
      user_id: userId,
      credits,
      source: "code",
    });

    if (creditError) {
      // Log but don't fail - run was created, don't break user experience
      console.error("Failed to create run_credits for code:", normalizedCode, creditError);
    }

    // Track promo code redemption and identify user
    const distinctId = posthogDistinctId || userId || run.id;
    trackServerEvent(distinctId, "promo_code_redeemed", {
      code: normalizedCode,
      email: normalizedEmail,
      run_id: run.id,
      credits,
      focus_area: input.focusArea,
    });
    identifyUser(distinctId, normalizedEmail, {
      first_code_redeemed_at: new Date().toISOString(),
    });

    // Set session cookie for the user
    if (userId) {
      await setSessionCookie(userId, normalizedEmail);
    }

    // Trigger AI pipeline in background (after() keeps function alive until complete)
    after(async () => {
      try {
        await runPipeline(run.id);
      } catch (err) {
        console.error("Pipeline failed for run:", run.id, err);
      }
    });

    // Send magic link for dashboard access (fire and forget)
    sendMagicLink(normalizedEmail, "/dashboard").catch((err) => {
      console.error("Magic link failed for run:", run.id, err);
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("Create run with code error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
