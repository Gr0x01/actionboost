import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { getSessionUserId } from "@/lib/auth/session-cookie";

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

  // Fetch the run
  const { data: run, error } = await supabase
    .from("runs")
    .select("id, status, input, output, share_slug, completed_at, created_at, user_id, refinements_used, parent_run_id")
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

  // Return run without user_id (internal field), include root's refinement count
  const { user_id: _, ...runData } = run;
  return NextResponse.json({
    run: {
      ...runData,
      root_refinements_used: rootRefinementsUsed,
    }
  });
}
