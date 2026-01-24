import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { getSessionUserId } from "@/lib/auth/session-cookie";
import { extractStructuredOutput } from "@/lib/ai/formatter";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const { searchParams } = new URL(request.url);
  const shareSlug = searchParams.get("share");

  if (!runId || !UUID_REGEX.test(runId)) {
    return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch the run (include structured_output, research_data for lazy backfill, and plan_start_date for calendar)
  const { data: run, error } = await supabase
    .from("runs")
    .select("id, status, input, output, share_slug, completed_at, created_at, user_id, refinements_used, parent_run_id, structured_output, research_data, plan_start_date")
    .eq("id", runId)
    .single();

  if (error || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  // Check access: either via share link OR authenticated owner
  const isShareAccess = shareSlug && run.share_slug === shareSlug;

  if (!isShareAccess) {
    // Accept Supabase Auth session OR custom session cookie
    const userId =
      (await getAuthenticatedUserId()) ?? (await getSessionUserId());

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userId !== run.user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // If this is a refinement, find the ROOT run's refinements_used
  // Includes depth limit and cycle detection for safety
  const MAX_CHAIN_DEPTH = 10;
  const visitedIds = new Set<string>([runId]);
  let rootRefinementsUsed = run.refinements_used;
  let nextParentId: string | null = run.parent_run_id;
  let depth = 0;

  while (nextParentId && depth < MAX_CHAIN_DEPTH) {
    if (visitedIds.has(nextParentId)) {
      console.error("[RunAPI] Circular parent chain detected:", nextParentId);
      break;
    }
    visitedIds.add(nextParentId);
    depth++;

    const { data } = await supabase
      .from("runs")
      .select("refinements_used, parent_run_id")
      .eq("id", nextParentId)
      .single();

    if (!data) break;
    rootRefinementsUsed = data.refinements_used;
    nextParentId = data.parent_run_id;
  }

  // Lazy backfill: If run is complete but lacks structured_output, extract async
  const structuredOutput = run.structured_output;
  if (run.status === "complete" && run.output && !structuredOutput) {
    // Fire-and-forget async extraction for lazy backfill
    // Capture values in consts to satisfy TypeScript
    const outputToProcess = run.output;
    const researchDataToUse = run.research_data as import('@/lib/ai/pipeline-agentic').ResearchData | null;
    (async () => {
      try {
        console.log(`[RunAPI] Lazy backfill: extracting structured_output for run ${runId} (has research_data: ${!!researchDataToUse})`);
        // Pass stored research_data if available for better extraction
        const extracted = await extractStructuredOutput(outputToProcess, researchDataToUse || undefined);
        if (extracted) {
          await supabase
            .from("runs")
            .update({ structured_output: extracted })
            .eq("id", runId);
          console.log(`[RunAPI] Lazy backfill complete for run ${runId}`);
        }
      } catch (err) {
        console.warn(`[RunAPI] Lazy backfill failed for run ${runId}:`, err);
      }
    })();
  }

  // Return run without user_id (internal field), include root's refinement count
  const { user_id: _, ...runData } = run;
  return NextResponse.json({
    run: {
      ...runData,
      structured_output: structuredOutput,
      root_refinements_used: rootRefinementsUsed,
    }
  });
}
