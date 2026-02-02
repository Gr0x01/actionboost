import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("free_tool_results")
    .select("slug, url, output, completed_at")
    .eq("tool_type", "landing-page-roaster")
    .eq("status", "complete")
    .not("output", "is", null)
    .order("completed_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ feed: [], total: 0 });
  }

  const feed = (data ?? []).map((row) => {
    let domain = "";
    try {
      const u = row.url?.startsWith("http") ? row.url : `https://${row.url}`;
      domain = new URL(u).hostname.replace(/^www\./, "");
    } catch {
      domain = row.url ?? "unknown";
    }

    const output = row.output as Record<string, unknown> | null;
    const verdict = (output?.verdict as string) ?? "";
    const scores = output?.scores as Record<string, unknown> | undefined;
    const overallScore = (scores?.overall as number) ?? null;

    return {
      slug: row.slug,
      domain,
      verdict,
      overallScore,
      completedAt: row.completed_at,
    };
  });

  // Get total count
  const { count } = await supabase
    .from("free_tool_results")
    .select("id", { count: "exact", head: true })
    .eq("tool_type", "landing-page-roaster")
    .eq("status", "complete");

  return NextResponse.json(
    { feed, total: count ?? feed.length },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    }
  );
}
