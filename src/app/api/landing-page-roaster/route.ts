import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest";
import { checkHoneypot, getClientIP, checkIPRateLimit, guardTurnstile, normalizeEmail, generateSlug } from "@/lib/api/free-tool-helpers";

export async function POST(request: NextRequest) {
  try {
    const { url, businessDescription, email, turnstileToken, website } = (await request.json()) as {
      url: string;
      businessDescription?: string;
      email?: string;
      turnstileToken?: string;
      website?: string; // Honeypot
    };

    // 1. Honeypot
    const honeypotRes = await checkHoneypot(website);
    if (honeypotRes) return honeypotRes;

    // 2. IP rate limit
    const clientIP = getClientIP(request);
    if (!checkIPRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again tomorrow." },
        { status: 429 }
      );
    }

    // 3. Turnstile
    const turnstileRes = await guardTurnstile(turnstileToken);
    if (turnstileRes) return turnstileRes;

    // 4. Validate inputs
    if (!url || typeof url !== "string" || url.length < 4 || url.length > 500) {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    // URL validation
    try {
      const urlToTest = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
      const parsed = new URL(urlToTest);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
      if (!parsed.hostname.includes(".")) {
        return NextResponse.json({ error: "Please enter a full website URL" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const normalizedEmail = email ? normalizeEmail(email) : `anon-${clientIP}@roast.local`;

    // Check 1-per-URL limit (same URL can't be roasted twice)
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const { data: existing } = await supabase
      .from("free_tool_results")
      .select("slug")
      .eq("url", normalizedUrl)
      .eq("tool_type", "landing-page-roaster")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This URL has already been roasted.", existingSlug: existing.slug },
        { status: 409 }
      );
    }

    // Create record
    const slug = generateSlug();
    const { data: created, error: insertError } = await supabase
      .from("free_tool_results")
      .insert({
        slug,
        url: normalizedUrl,
        email: normalizedEmail,
        business_description: businessDescription?.trim() || null,
        tool_type: "landing-page-roaster",
        status: "pending",
      })
      .select("id, slug")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You've already received a landing page roast." },
          { status: 409 }
        );
      }
      console.error("[LandingPageRoaster] Insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create roast" }, { status: 500 });
    }

    // Trigger Inngest pipeline
    try {
      await inngest.send({
        name: "landing-page-roaster/created",
        data: { resultId: created.id },
      });
    } catch (err) {
      console.error("[LandingPageRoaster] Failed to trigger Inngest:", err);
    }

    return NextResponse.json({ slug: created.slug });
  } catch (error) {
    console.error("[LandingPageRoaster] Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
