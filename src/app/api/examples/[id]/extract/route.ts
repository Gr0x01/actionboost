import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { extractStructuredOutput } from "@/lib/ai/formatter";

const ALLOWED_EMAIL = "gr0x01@pm.me";

/**
 * Check if request is from admin (localhost or authenticated admin user)
 */
async function isAdmin(request: NextRequest): Promise<boolean> {
  const host = request.headers.get("host") || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return true;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ALLOWED_EMAIL;
}

/**
 * POST /api/examples/[id]/extract
 * Admin only: Extracts structured output from example markdown content
 * Uses Claude Sonnet to parse the markdown into dashboard-ready JSON
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch the example
    const { data: example, error: fetchError } = await supabase
      .from("examples")
      .select("id, content, structured_output")
      .eq("id", id)
      .single();

    if (fetchError || !example) {
      return NextResponse.json({ error: "Example not found" }, { status: 404 });
    }

    if (!example.content) {
      return NextResponse.json({ error: "Example has no content" }, { status: 400 });
    }

    console.log(`[Extract] Starting extraction for example ${id}...`);

    // Extract structured output from markdown
    const structuredOutput = await extractStructuredOutput(example.content);

    if (!structuredOutput) {
      return NextResponse.json(
        { error: "Failed to extract structured output" },
        { status: 500 }
      );
    }

    // Save to database
    const { error: updateError } = await supabase
      .from("examples")
      .update({ structured_output: structuredOutput })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to save structured output:", updateError);
      return NextResponse.json(
        { error: "Failed to save structured output" },
        { status: 500 }
      );
    }

    console.log(`[Extract] Successfully extracted and saved for example ${id}`);

    return NextResponse.json({
      success: true,
      structured_output: structuredOutput,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract structured output" },
      { status: 500 }
    );
  }
}
