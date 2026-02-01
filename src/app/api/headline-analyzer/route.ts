import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidEmail, isDisposableEmail } from "@/lib/validation";
import { checkHoneypot, getClientIP, checkIPRateLimit, guardTurnstile, normalizeEmail, generateSlug } from "@/lib/api/free-tool-helpers";
import { runHeadlineAnalysisInline } from "@/lib/ai/headline-analyzer";
import type { Json } from "@/lib/types/database";

export async function POST(request: NextRequest) {
  try {
    const { headline, whatTheySell, whoItsFor, email, turnstileToken, website } = (await request.json()) as {
      headline: string;
      whatTheySell?: string;
      whoItsFor?: string;
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
    if (!headline || typeof headline !== "string" || headline.length < 3 || headline.length > 300) {
      return NextResponse.json({ error: "Headline must be 3-300 characters" }, { status: 400 });
    }

    if (whatTheySell && (typeof whatTheySell !== "string" || whatTheySell.length > 500)) {
      return NextResponse.json({ error: "Description must be under 500 characters" }, { status: 400 });
    }

    if (whoItsFor && (typeof whoItsFor !== "string" || whoItsFor.length > 300)) {
      return NextResponse.json({ error: "Audience description must be under 300 characters" }, { status: 400 });
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
      .eq("tool_type", "headline-analyzer")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You've already analyzed a headline.", existingSlug: existing.slug },
        { status: 409 }
      );
    }

    const slug = generateSlug();
    const inputData = {
      headline: headline.trim(),
      ...(whatTheySell?.trim() ? { whatTheySell: whatTheySell.trim() } : {}),
      ...(whoItsFor?.trim() ? { whoItsFor: whoItsFor.trim() } : {}),
    };

    // Run GPT inline — fast enough (~5-15s) to skip Inngest
    const output = await runHeadlineAnalysisInline(inputData);

    const { data: created, error: insertError } = await supabase
      .from("free_tool_results")
      .insert({
        slug,
        email: normalizedEmail,
        tool_type: "headline-analyzer",
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
          { error: "You've already analyzed a headline." },
          { status: 409 }
        );
      }
      console.error("[HeadlineAnalyzer] Insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 });
    }

    return NextResponse.json({ slug: created.slug });
  } catch (error) {
    console.error("[HeadlineAnalyzer] Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
