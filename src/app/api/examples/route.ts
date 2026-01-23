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
 * GET /api/examples
 * Public: Returns live examples for the gallery
 * Admin: Returns all examples (with ?all=true query param)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const showAll = request.nextUrl.searchParams.get("all") === "true";

    // If requesting all examples, verify admin access
    if (showAll) {
      const admin = await isAdmin(request);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: examples, error } = await supabase
        .from("examples")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch examples:", error);
        return NextResponse.json({ error: "Failed to fetch examples" }, { status: 500 });
      }

      return NextResponse.json({ examples });
    }

    // Public: only return live examples
    const { data: examples, error } = await supabase
      .from("examples")
      .select("id, slug, industry, stage, insight, metadata, published_at")
      .eq("is_live", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch examples:", error);
      return NextResponse.json({ error: "Failed to fetch examples" }, { status: 500 });
    }

    return NextResponse.json({ examples });
  } catch (error) {
    console.error("Examples fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch examples" }, { status: 500 });
  }
}

/**
 * POST /api/examples
 * Admin only: Creates a new example (as draft)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, industry, stage, insight, content, metadata } = body;

    // Validate required fields
    if (!slug || !industry || !stage || !insight || !content) {
      return NextResponse.json(
        { error: "Missing required fields: slug, industry, stage, insight, content" },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric with hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase alphanumeric with hyphens only" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: example, error } = await supabase
      .from("examples")
      .insert({
        slug,
        industry,
        stage,
        insight,
        content,
        metadata: metadata || {},
        is_live: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
      console.error("Failed to create example:", error);
      return NextResponse.json({ error: "Failed to create example" }, { status: 500 });
    }

    return NextResponse.json({ example }, { status: 201 });
  } catch (error) {
    console.error("Example creation error:", error);
    return NextResponse.json({ error: "Failed to create example" }, { status: 500 });
  }
}
