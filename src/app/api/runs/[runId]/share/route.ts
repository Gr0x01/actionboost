import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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

  const supabase = createServiceClient();

  // Check if already has a slug
  const { data: existing } = await supabase
    .from("runs")
    .select("share_slug")
    .eq("id", runId)
    .single();

  if (existing?.share_slug) {
    return NextResponse.json({ share_slug: existing.share_slug });
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
