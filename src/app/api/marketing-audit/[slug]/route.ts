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

  const { data: audit, error } = await supabase
    .from("marketing_audits")
    .select("slug, url, business_description, output, status, created_at, completed_at")
    .eq("slug", slug)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ audit });
}
