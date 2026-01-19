import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Code is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Look up the code
    const { data: codeRecord, error } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single();

    if (error || !codeRecord) {
      return NextResponse.json(
        { valid: false, error: "Invalid code" },
        { status: 200 }
      );
    }

    // Check if expired
    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Code has expired" },
        { status: 200 }
      );
    }

    // Check if max uses reached
    if (
      codeRecord.max_uses !== null &&
      (codeRecord.used_count ?? 0) >= codeRecord.max_uses
    ) {
      return NextResponse.json(
        { valid: false, error: "Code has reached maximum uses" },
        { status: 200 }
      );
    }

    // Code is valid
    return NextResponse.json({
      valid: true,
      credits: codeRecord.credits ?? 1,
    });
  } catch (error) {
    console.error("Code validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
