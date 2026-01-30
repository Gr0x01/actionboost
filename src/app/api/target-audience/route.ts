import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidEmail, isDisposableEmail } from "@/lib/validation";
import { inngest } from "@/lib/inngest";
import { checkHoneypot, getClientIP, checkIPRateLimit, guardTurnstile, normalizeEmail, generateSlug } from "@/lib/api/free-tool-helpers";
import type { Json } from "@/lib/types/database";

export async function POST(request: NextRequest) {
  try {
    const { businessName, whatTheySell, targetCustomer, email, turnstileToken, website } = (await request.json()) as {
      businessName: string;
      whatTheySell: string;
      targetCustomer?: string;
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
    if (!businessName || typeof businessName !== "string" || businessName.length < 2 || businessName.length > 100) {
      return NextResponse.json({ error: "Business name must be 2-100 characters" }, { status: 400 });
    }

    if (!whatTheySell || typeof whatTheySell !== "string" || whatTheySell.length < 10 || whatTheySell.length > 500) {
      return NextResponse.json({ error: "Description must be 10-500 characters" }, { status: 400 });
    }

    if (targetCustomer && (typeof targetCustomer !== "string" || targetCustomer.length > 500)) {
      return NextResponse.json({ error: "Customer description must be under 500 characters" }, { status: 400 });
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
      .eq("tool_type", "target-audience")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You've already generated a target audience profile.", existingSlug: existing.slug },
        { status: 409 }
      );
    }

    const slug = generateSlug();
    const inputData = {
      businessName: businessName.trim(),
      whatTheySell: whatTheySell.trim(),
      ...(targetCustomer?.trim() ? { targetCustomer: targetCustomer.trim() } : {}),
    };

    const { data: created, error: insertError } = await supabase
      .from("free_tool_results")
      .insert({
        slug,
        email: normalizedEmail,
        tool_type: "target-audience",
        input: inputData as unknown as Json,
        status: "pending",
      })
      .select("id, slug")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "You've already generated a target audience profile." },
          { status: 409 }
        );
      }
      console.error("[TargetAudience] Insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    // Trigger Inngest pipeline
    try {
      await inngest.send({
        name: "target-audience/created",
        data: { resultId: created.id },
      });
    } catch (err) {
      console.error("[TargetAudience] Failed to trigger Inngest:", err);
    }

    return NextResponse.json({ slug: created.slug });
  } catch (error) {
    console.error("[TargetAudience] Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
