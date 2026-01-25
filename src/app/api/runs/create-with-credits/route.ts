import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FormInput, validateForm } from "@/lib/types/form";
import { Json, MAX_CONTEXT_LENGTH } from "@/lib/types/database";
import { trackServerEvent } from "@/lib/analytics";
import { applyContextDeltaToBusiness } from "@/lib/context/accumulate";
import { createBusiness, getOrCreateDefaultBusiness, verifyBusinessOwnership } from "@/lib/business";
import { inngest } from "@/lib/inngest";

// No longer need extended timeout - Inngest handles long-running pipeline

export async function POST(request: NextRequest) {
  try {
    const { input, contextDelta, posthogDistinctId, businessId, startFresh } = (await request.json()) as {
      input: FormInput;
      contextDelta?: string;
      posthogDistinctId?: string;
      businessId?: string;
      startFresh?: boolean;
    };

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    // Validate form content (character limits)
    // contextDelta present means this is a returning user update, relax validation
    const isReturningUser = !!contextDelta;
    const formErrors = validateForm(input, isReturningUser);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(formErrors)[0] },
        { status: 400 }
      );
    }

    // Validate contextDelta length
    if (contextDelta && contextDelta.length > MAX_CONTEXT_LENGTH) {
      return NextResponse.json(
        { error: `Context update too long (max ${MAX_CONTEXT_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Check if user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to use credits" },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();

    // Get public user with credits_used for atomic deduction
    const { data: publicUser } = await serviceClient
      .from("users")
      .select("id, credits_used")
      .eq("auth_id", user.id)
      .single();

    if (!publicUser) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Resolve business: startFresh creates new, otherwise use provided or default
    let resolvedBusinessId: string;
    if (startFresh) {
      // "Start fresh" creates a new business
      resolvedBusinessId = await createBusiness(publicUser.id, {
        productDescription: input.productDescription,
        currentTraction: input.currentTraction,
        tacticsAndResults: input.tacticsAndResults,
        focusArea: input.focusArea,
        competitorUrls: input.competitors?.filter(Boolean) || [],
        websiteUrl: input.websiteUrl || "",
      });
      console.log(`[API] Created new business ${resolvedBusinessId} for user ${publicUser.id} (start fresh)`);
    } else if (businessId) {
      // Verify business belongs to user
      const isOwner = await verifyBusinessOwnership(businessId, publicUser.id);
      if (!isOwner) {
        return NextResponse.json(
          { error: "Not authorized to access this business" },
          { status: 403 }
        );
      }
      resolvedBusinessId = businessId;
    } else {
      // Default: get or create first business
      resolvedBusinessId = await getOrCreateDefaultBusiness(publicUser.id, {
        productDescription: input.productDescription,
        currentTraction: input.currentTraction,
        tacticsAndResults: input.tacticsAndResults,
        focusArea: input.focusArea,
        competitorUrls: input.competitors?.filter(Boolean) || [],
        websiteUrl: input.websiteUrl || "",
      });
    }

    // If returning user provided a context update, merge it into their business context
    // This ensures the pipeline sees the latest user information
    if (contextDelta && !startFresh) {
      const result = await applyContextDeltaToBusiness(resolvedBusinessId, contextDelta);
      if (!result.success) {
        console.error(`[API] Failed to merge context delta for business ${resolvedBusinessId}:`, result.error);
        // Continue anyway - run will use stale context but at least it will process
      } else {
        console.log(`[API] Merged context delta for business ${resolvedBusinessId}`);
      }
    }

    // Check credits - fetch total from run_credits
    const { data: creditRecords } = await serviceClient
      .from("run_credits")
      .select("credits")
      .eq("user_id", publicUser.id);

    const totalCredits = creditRecords?.reduce((sum, c) => sum + c.credits, 0) ?? 0;
    const currentUsed = publicUser.credits_used ?? 0;
    const remainingCredits = totalCredits - currentUsed;

    if (remainingCredits < 1) {
      return NextResponse.json(
        { error: "No credits available" },
        { status: 402 }
      );
    }

    // ATOMIC: Increment credits_used with optimistic lock
    // This prevents race conditions where two concurrent requests both pass the check
    const { data: updateResult, error: updateError } = await serviceClient
      .from("users")
      .update({ credits_used: currentUsed + 1 })
      .eq("id", publicUser.id)
      .eq("credits_used", currentUsed) // Optimistic lock - fails if value changed
      .select("id");

    if (updateError || !updateResult || updateResult.length === 0) {
      // Race condition detected - another request used the credit
      console.log(`[API] Credit race condition detected for user ${publicUser.id}`);
      return NextResponse.json(
        { error: "Credit was already used. Please try again." },
        { status: 409 }
      );
    }

    // Credit is now reserved - safe to create run
    const { data: run, error: runError } = await serviceClient
      .from("runs")
      .insert({
        input: input as unknown as Json,
        status: "pending",
        user_id: publicUser.id,
        business_id: resolvedBusinessId,
        source: "credits",
      })
      .select("id")
      .single();

    if (runError || !run) {
      console.error("Failed to create run:", runError);

      // Rollback credit deduction with retry
      const MAX_ROLLBACK_ATTEMPTS = 3;
      let rollbackSuccess = false;

      for (let attempt = 1; attempt <= MAX_ROLLBACK_ATTEMPTS; attempt++) {
        const { error: rollbackError } = await serviceClient
          .from("users")
          .update({ credits_used: currentUsed })
          .eq("id", publicUser.id);

        if (!rollbackError) {
          rollbackSuccess = true;
          console.log(`[API] Rolled back credit for user ${publicUser.id} (attempt ${attempt})`);
          break;
        }

        console.error(`[API] Rollback attempt ${attempt}/${MAX_ROLLBACK_ATTEMPTS} failed:`, rollbackError);

        // Brief delay before retry (except on last attempt)
        if (attempt < MAX_ROLLBACK_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        }
      }

      if (!rollbackSuccess) {
        // All retries failed - log critical error for investigation
        console.error(`[CRITICAL] Failed to rollback credit for user ${publicUser.id} after ${MAX_ROLLBACK_ATTEMPTS} attempts`);
      }

      return NextResponse.json(
        { error: "Failed to create run. Please try again." },
        { status: 500 }
      );
    }

    // Track run creation
    const distinctId = posthogDistinctId || user.id || run.id;
    trackServerEvent(distinctId, "run_created_with_credits", {
      run_id: run.id,
      email: user.email,
      credits_remaining: remainingCredits - 1,
      focus_area: input.focusArea,
    });

    // Trigger AI pipeline via Inngest (handles long-running tasks beyond Vercel's 300s limit)
    try {
      await inngest.send({
        name: "run/created",
        data: { runId: run.id },
      });
    } catch (err) {
      // Run was created - don't fail the request if Inngest is unavailable
      // Pipeline can be triggered manually or via retry mechanism
      console.error(`[API] Failed to trigger Inngest for run ${run.id}:`, err);
    }

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("Create run with credits error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
