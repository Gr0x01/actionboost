import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { setSessionCookie } from "@/lib/auth/session-cookie";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { error: "Invalid session ID" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Look up run by stripe_session_id
  const { data: run, error } = await supabase
    .from("runs")
    .select("id, user_id")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error || !run) {
    // Webhook may not have processed yet, frontend will retry
    return NextResponse.json(
      { error: "Run not found" },
      { status: 404 }
    );
  }

  // Set session cookie for the user (webhook created user, now we set cookie for browser)
  if (run.user_id) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", run.user_id)
      .single();

    if (user?.email) {
      await setSessionCookie(run.user_id, user.email);
    }
  }

  return NextResponse.json({ runId: run.id });
}
