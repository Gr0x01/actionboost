import { NextRequest, NextResponse, after } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { runRefinementPipeline } from "@/lib/ai/pipeline";
import { trackServerEvent } from "@/lib/analytics";
import {
  MAX_FREE_REFINEMENTS,
  MIN_CONTEXT_LENGTH,
  MAX_CONTEXT_LENGTH,
} from "@/lib/types/database";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/runs/[runId]/add-context
 *
 * Creates a refinement run based on user's additional context.
 * Users get up to 2 free refinements per original run.
 *
 * Request body: { additionalContext: string }
 * Response: { runId: string } (the new refinement run ID)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  // Validate run ID format
  if (!runId || !UUID_REGEX.test(runId)) {
    return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
  }

  // Require authentication
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate request body
  let additionalContext: string;
  try {
    const body = await request.json();
    additionalContext = body.additionalContext?.trim() || "";
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Validate context length
  if (additionalContext.length < MIN_CONTEXT_LENGTH) {
    return NextResponse.json(
      { error: `Please provide at least ${MIN_CONTEXT_LENGTH} characters of context` },
      { status: 400 }
    );
  }

  if (additionalContext.length > MAX_CONTEXT_LENGTH) {
    return NextResponse.json(
      { error: `Context must be ${MAX_CONTEXT_LENGTH} characters or less` },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Get the original run and verify ownership
  const { data: run, error: fetchError } = await supabase
    .from("runs")
    .select("id, user_id, status, input, refinements_used")
    .eq("id", runId)
    .single();

  if (fetchError || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  // Verify user owns this run
  if (run.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check run is complete
  if (run.status !== "complete") {
    return NextResponse.json(
      { error: "Can only refine completed runs" },
      { status: 400 }
    );
  }

  // Check refinement limit (pre-check for fast failure)
  const currentRefinements = run.refinements_used || 0;
  if (currentRefinements >= MAX_FREE_REFINEMENTS) {
    trackServerEvent(userId, "refinement_limit_reached", {
      run_id: runId,
      refinements_used: currentRefinements,
    });

    return NextResponse.json(
      {
        error: `You've used all ${MAX_FREE_REFINEMENTS} free refinements for this strategy`,
        refinementsRemaining: 0,
      },
      { status: 429 }
    );
  }

  // ATOMIC: Increment refinements_used with condition check to prevent race condition
  // This ensures only one concurrent request can succeed
  const { data: updatedRun, error: incrementError } = await supabase
    .from("runs")
    .update({ refinements_used: currentRefinements + 1 })
    .eq("id", runId)
    .eq("refinements_used", currentRefinements) // Optimistic locking - only update if value unchanged
    .select("refinements_used")
    .single();

  if (incrementError || !updatedRun) {
    // Either another request won the race, or the limit was reached
    console.log("Refinement increment failed (likely race condition):", incrementError);

    // Re-fetch to get accurate count for error message
    const { data: freshRun } = await supabase
      .from("runs")
      .select("refinements_used")
      .eq("id", runId)
      .single();

    const actualUsed = freshRun?.refinements_used || MAX_FREE_REFINEMENTS;

    if (actualUsed >= MAX_FREE_REFINEMENTS) {
      trackServerEvent(userId, "refinement_limit_reached", {
        run_id: runId,
        refinements_used: actualUsed,
      });
      return NextResponse.json(
        {
          error: `You've used all ${MAX_FREE_REFINEMENTS} free refinements for this strategy`,
          refinementsRemaining: 0,
        },
        { status: 429 }
      );
    }

    // Some other error
    return NextResponse.json(
      { error: "Failed to process refinement. Please try again." },
      { status: 500 }
    );
  }

  const newRefinementCount = updatedRun.refinements_used || 1;

  // Create the refinement run (only after successful atomic increment)
  const { data: newRun, error: insertError } = await supabase
    .from("runs")
    .insert({
      input: run.input,
      additional_context: additionalContext,
      parent_run_id: runId,
      status: "pending",
      user_id: userId,
      refinements_used: 0, // New run starts fresh (parent tracks count)
    })
    .select("id")
    .single();

  if (insertError || !newRun) {
    console.error("Failed to create refinement run:", insertError);
    // Rollback the increment since we couldn't create the run
    await supabase
      .from("runs")
      .update({ refinements_used: currentRefinements })
      .eq("id", runId);

    return NextResponse.json(
      { error: "Failed to create refinement" },
      { status: 500 }
    );
  }

  // Track refinement submission
  trackServerEvent(userId, "refinement_submitted", {
    run_id: newRun.id,
    parent_run_id: runId,
    refinement_number: newRefinementCount,
    context_length: additionalContext.length,
  });

  // Trigger refinement pipeline in background
  after(async () => {
    try {
      await runRefinementPipeline(newRun.id);
    } catch (err) {
      console.error("Refinement pipeline failed for run:", newRun.id, err);
    }
  });

  return NextResponse.json({
    runId: newRun.id,
    refinementsRemaining: MAX_FREE_REFINEMENTS - newRefinementCount,
  });
}
