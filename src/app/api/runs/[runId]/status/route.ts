import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  if (!runId) {
    return NextResponse.json({ error: "Run ID required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: run, error } = await supabase
    .from("runs")
    .select("status")
    .eq("id", runId)
    .single();

  if (error || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: run.status || "pending",
  });
}
