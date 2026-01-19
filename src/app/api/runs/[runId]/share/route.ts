import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateSlug(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  if (!runId || !UUID_REGEX.test(runId)) {
    return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
  }

  // Require authentication
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get run and verify ownership
  const { data: run } = await supabase
    .from("runs")
    .select("share_slug, user_id")
    .eq("id", runId)
    .single();

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (userId !== run.user_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return existing slug if already shared
  if (run.share_slug) {
    return NextResponse.json({ share_slug: run.share_slug });
  }

  // Generate new slug
  const shareSlug = generateSlug(10);

  const { error } = await supabase
    .from("runs")
    .update({ share_slug: shareSlug })
    .eq("id", runId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to generate link" },
      { status: 500 }
    );
  }

  return NextResponse.json({ share_slug: shareSlug });
}
