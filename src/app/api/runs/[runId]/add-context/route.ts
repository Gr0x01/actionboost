import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { trackServerEvent } from "@/lib/analytics";
import {
  MAX_FREE_REFINEMENTS,
  MIN_CONTEXT_LENGTH,
  MAX_CONTEXT_LENGTH,
} from "@/lib/types/database";
import { inngest } from "@/lib/inngest";

// No longer need extended timeout - Inngest handles the refinement pipeline

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

  // Get the current run and verify ownership
  const { data: run, error: fetchError } = await supabase
    .from("runs")
    .select("id, user_id, status, input, parent_run_id")
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

  // Find the ROOT run (original) - traverse up parent chain
  const MAX_CHAIN_DEPTH = 10;
  const visitedIds = new Set<string>([runId]);
  let rootRunId = runId;
  let currentParentId = run.parent_run_id;
  let depth = 0;

  while (currentParentId && depth < MAX_CHAIN_DEPTH) {
    if (visitedIds.has(currentParentId)) {
      console.error("[AddContext] Circular parent chain detected:", currentParentId);
      break;
    }
    visitedIds.add(currentParentId);
    depth++;

    const { data: parentRun, error: parentError } = await supabase
      .from("runs")
      .select("id, parent_run_id")
      .eq("id", currentParentId)
      .single();

    if (parentError || !parentRun) {
      console.error("[AddContext] Failed to find parent run:", currentParentId);
      break;
    }

    rootRunId = parentRun.id;
    currentParentId = parentRun.parent_run_id;
  }

  // Count completed refinements and in-flight ones (all flattened under root)
  const { count: completedCount, error: countError } = await supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("parent_run_id", rootRunId)
    .eq("source", "refinement")
    .eq("status", "complete");

  if (countError) {
    console.error("[AddContext] Failed to count refinements:", countError);
    return NextResponse.json(
      { error: "Failed to check refinement limit" },
      { status: 500 }
    );
  }

  const completedRefinements = completedCount ?? 0;

  // Check refinement limit based on completed count
  if (completedRefinements >= MAX_FREE_REFINEMENTS) {
    trackServerEvent(userId, "refinement_limit_reached", {
      run_id: runId,
      refinements_used: completedRefinements,
    });

    return NextResponse.json(
      {
        error: `You've used all ${MAX_FREE_REFINEMENTS} free refinements for this strategy`,
        refinementsRemaining: 0,
      },
      { status: 429 }
    );
  }

  // Also block if a refinement is already in-flight
  const { count: inflightCount } = await supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("parent_run_id", rootRunId)
    .eq("source", "refinement")
    .in("status", ["pending", "processing"]);

  if ((inflightCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "A refinement is already in progress. Please wait for it to complete." },
      { status: 429 }
    );
  }

  // ATOMIC GATE: Increment refinements_used on root with optimistic locking
  // to prevent two concurrent requests from both passing the count check.
  // The counter is a concurrency gate only — the *limit* is based on completed count above.
  const { data: rootRun } = await supabase
    .from("runs")
    .select("refinements_used")
    .eq("id", rootRunId)
    .single();

  const currentCounter = rootRun?.refinements_used ?? 0;

  const { data: lockedRun, error: lockError } = await supabase
    .from("runs")
    .update({ refinements_used: currentCounter + 1 })
    .eq("id", rootRunId)
    .eq("refinements_used", currentCounter)
    .select("refinements_used")
    .single();

  if (lockError || !lockedRun) {
    return NextResponse.json(
      { error: "Another refinement request is being processed. Please try again." },
      { status: 429 }
    );
  }

  // Create the refinement run — parent_run_id always points to root for flat counting
  const { data: newRun, error: insertError } = await supabase
    .from("runs")
    .insert({
      input: run.input,
      additional_context: additionalContext,
      parent_run_id: rootRunId,
      status: "pending",
      user_id: userId,
      source: "refinement",
    })
    .select("id")
    .single();

  if (insertError || !newRun) {
    console.error("Failed to create refinement run:", insertError);
    // Rollback the counter since we couldn't create the run
    await supabase
      .from("runs")
      .update({ refinements_used: currentCounter })
      .eq("id", rootRunId);

    return NextResponse.json(
      { error: "Failed to create refinement" },
      { status: 500 }
    );
  }

  // Track refinement submission
  trackServerEvent(userId, "refinement_submitted", {
    run_id: newRun.id,
    parent_run_id: rootRunId,
    refinement_number: completedRefinements + 1,
    context_length: additionalContext.length,
  });

  // Trigger refinement pipeline via Inngest
  try {
    await inngest.send({
      name: "run/refinement.requested",
      data: { runId: newRun.id },
    });
  } catch (err) {
    console.error(`[API] Failed to trigger Inngest for refinement ${newRun.id}:`, err);
  }

  return NextResponse.json({
    runId: newRun.id,
    refinementsRemaining: MAX_FREE_REFINEMENTS - completedRefinements - 1,
  });
}
