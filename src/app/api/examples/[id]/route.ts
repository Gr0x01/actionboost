import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ALLOWED_EMAIL = "gr0x01@pm.me";

/**
 * Check if request is from admin (localhost or authenticated admin user)
 */
async function isAdmin(request: NextRequest): Promise<boolean> {
  // Allow localhost
  const host = request.headers.get("host") || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return true;
  }

  // Check authenticated user
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
 * GET /api/examples/[id]
 * Public: Fetches a single example by ID or slug
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

    // Try to fetch by ID first, then by slug
    let query = supabase.from("examples").select("*");

    // UUID format check
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data: example, error } = await query.single();

    if (error || !example) {
      return NextResponse.json({ error: "Example not found" }, { status: 404 });
    }

    // For public access, only return live examples
    const admin = await isAdmin(request);
    if (!admin && !example.is_live) {
      return NextResponse.json({ error: "Example not found" }, { status: 404 });
    }

    return NextResponse.json({ example });
  } catch (error) {
    console.error("Example fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch example" }, { status: 500 });
  }
}

/**
 * PATCH /api/examples/[id]
 * Admin only: Updates an example (toggle live, edit content, etc.)
 */
export async function PATCH(
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
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (body.slug !== undefined) {
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
        return NextResponse.json(
          { error: "Slug must be lowercase alphanumeric with hyphens only" },
          { status: 400 }
        );
      }
      updates.slug = body.slug;
    }
    if (body.industry !== undefined) updates.industry = body.industry;
    if (body.stage !== undefined) updates.stage = body.stage;
    if (body.insight !== undefined) updates.insight = body.insight;
    if (body.content !== undefined) updates.content = body.content;
    if (body.metadata !== undefined) updates.metadata = body.metadata;
    if (body.structured_output !== undefined) updates.structured_output = body.structured_output;

    // Handle is_live toggle with published_at timestamp
    if (body.is_live !== undefined) {
      updates.is_live = body.is_live;
      if (body.is_live) {
        updates.published_at = new Date().toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: example, error } = await supabase
      .from("examples")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
      console.error("Failed to update example:", error);
      return NextResponse.json({ error: "Failed to update example" }, { status: 500 });
    }

    if (!example) {
      return NextResponse.json({ error: "Example not found" }, { status: 404 });
    }

    return NextResponse.json({ example });
  } catch (error) {
    console.error("Example update error:", error);
    return NextResponse.json({ error: "Failed to update example" }, { status: 500 });
  }
}

/**
 * DELETE /api/examples/[id]
 * Admin only: Deletes an example
 */
export async function DELETE(
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

    const { error } = await supabase
      .from("examples")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete example:", error);
      return NextResponse.json({ error: "Failed to delete example" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Example deletion error:", error);
    return NextResponse.json({ error: "Failed to delete example" }, { status: 500 });
  }
}
