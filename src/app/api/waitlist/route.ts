import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/validation";

const ALLOWED_SOURCES = ["checkout", "landing"] as const;
type WaitlistSource = (typeof ALLOWED_SOURCES)[number];

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    // Validate source against whitelist
    const validSource: WaitlistSource = ALLOWED_SOURCES.includes(source)
      ? source
      : "checkout";

    const supabase = createServiceClient();

    // Insert with ON CONFLICT DO NOTHING for idempotency
    const { error } = await supabase.from("waitlist").upsert(
      {
        email: normalizedEmail,
        source: validSource,
      },
      { onConflict: "email", ignoreDuplicates: true }
    );

    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
