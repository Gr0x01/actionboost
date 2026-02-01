import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidEmail, isDisposableEmail } from "@/lib/validation";
import { checkHoneypot, getClientIP, checkIPRateLimit, guardTurnstile, normalizeEmail, generateSlug } from "@/lib/api/free-tool-helpers";
import { runCompetitorFinderInline } from "@/lib/ai/competitor-finder";
import type { Json } from "@/lib/types/database";

export async function POST(request: NextRequest) {
  try {
    const { url, description, email, turnstileToken, website } = (await request.json()) as {
      url: string;
      description: string;
      email: string;
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
    if (!url || typeof url !== "string" || url.length < 5 || url.length > 500) {
      return NextResponse.json({ error: "A valid URL is required" }, { status: 400 });
    }

    // Ensure URL has protocol
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Please enter a valid URL" }, { status: 400 });
    }

    if (!description || typeof description !== "string" || description.length < 10 || description.length > 500) {
      return NextResponse.json({ error: "Business description must be 10-500 characters" }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Please use a permanent email address." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedEmail = normalizeEmail(email);

    // Check 1-per-email limit
    const { data: existing } = await supabase
      .from("free_tool_results")
      .select("slug")
      .eq("email", normalizedEmail)
      .eq("tool_type", "competitor-finder")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You've already run a competitor analysis.", existingSlug: existing.slug },
        { status: 409 }
      );
    }

    const slug = generateSlug();
    const inputData = {
      url: normalizedUrl,
      description: description.trim(),
    };

    // Run Tavily + GPT inline (~15-30s)
    const output = await runCompetitorFinderInline(inputData);

    const { data: created, error: insertError } = await supabase
      .from("free_tool_results")
      .insert({
        slug,
        email: normalizedEmail,
        tool_type: "competitor-finder",
        input: inputData as unknown as Json,
        output: output as unknown as Json,
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You've already run a competitor analysis." },
          { status: 409 }
        );
      }
      console.error("[CompetitorFinder] Insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 });
    }

    return NextResponse.json({ slug: created.slug });
  } catch (error) {
    console.error("[CompetitorFinder] Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
