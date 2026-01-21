import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/first-impressions/[id]
 * Fetches a first impression record by ID (public - for shareable links)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: impression, error } = await supabase
      .from("first_impressions")
      .select("id, url, output, status, created_at, completed_at")
      .eq("id", id)
      .single();

    if (error || !impression) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(impression);
  } catch (error) {
    console.error("First impressions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch first impression" },
      { status: 500 }
    );
  }
}
