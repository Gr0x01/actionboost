import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAuditToken } from "@/lib/auth/audit-token";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Verify access token
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !verifyAuditToken(id, token)) {
    return NextResponse.json({ error: "Invalid or missing access token" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data: freeAudit, error } = await supabase
    .from("free_audits")
    .select("id, email, input, output, structured_output, status, created_at, completed_at")
    .eq("id", id)
    .single();

  if (error || !freeAudit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mask email for privacy
  const email = freeAudit.email;
  const maskedEmail = email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_match: string, start: string, _middle: string, domain: string) => `${start}***${domain}`
  );

  // Don't expose full input - only return what's needed for display
  return NextResponse.json({
    freeAudit: {
      id: freeAudit.id,
      email: maskedEmail,
      output: freeAudit.output,
      status: freeAudit.status,
      created_at: freeAudit.created_at,
      completed_at: freeAudit.completed_at,
      structured_output: freeAudit.structured_output,
    },
  });
}
