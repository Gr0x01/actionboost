import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: result, error } = await supabase
    .from("free_tool_results")
    .select("slug, input, output, status, created_at, completed_at")
    .eq("slug", slug)
    .eq("tool_type", "email-subject-scorer")
    .single();

  if (error || !result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers: HeadersInit = result.status === "complete"
    ? { "Cache-Control": "public, max-age=86400, immutable" }
    : { "Cache-Control": "no-cache, must-revalidate" };

  return NextResponse.json({ result }, { headers });
}
