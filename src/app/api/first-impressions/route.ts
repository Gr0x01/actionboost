import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runFirstImpressionsPipeline } from "@/lib/ai/pipeline";

/**
 * POST /api/first-impressions
 * Creates a first impression record and triggers the lightweight pipeline
 *
 * This is an admin-only endpoint (access control is on the frontend page)
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = (await request.json()) as { url: string };

    // Validate URL
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL format validation
    let parsedUrl: URL;
    try {
      // Prepend https:// if no protocol specified
      const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
      parsedUrl = new URL(urlWithProtocol);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const normalizedUrl = parsedUrl.href;

    const supabase = createServiceClient();

    // Create first_impressions record
    const { data: impression, error: insertError } = await supabase
      .from("first_impressions")
      .insert({
        url: normalizedUrl,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !impression) {
      console.error("Failed to create first impression:", insertError);
      return NextResponse.json(
        { error: "Failed to create first impression" },
        { status: 500 }
      );
    }

    // Trigger pipeline (fire and forget)
    runFirstImpressionsPipeline(impression.id, normalizedUrl).catch((err) => {
      console.error("First impressions pipeline failed:", impression.id, err);
    });

    return NextResponse.json({ id: impression.id });
  } catch (error) {
    console.error("First impressions error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
