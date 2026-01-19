import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { FormInput } from "@/lib/types/form";
import { Json } from "@/lib/types/database";

export async function POST(request: NextRequest) {
  try {
    const { code, input } = (await request.json()) as {
      code: string;
      input: FormInput;
    };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedCode = code.toUpperCase().trim();

    // Validate and get the code in a single query
    const { data: codeRecord, error: codeError } = await supabase
      .from("codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (codeError || !codeRecord) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Check expiration
    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 });
    }

    // Check max uses
    if (
      codeRecord.max_uses !== null &&
      (codeRecord.used_count ?? 0) >= codeRecord.max_uses
    ) {
      return NextResponse.json(
        { error: "Code has reached maximum uses" },
        { status: 400 }
      );
    }

    // Increment used_count atomically
    const { error: updateError } = await supabase
      .from("codes")
      .update({ used_count: (codeRecord.used_count ?? 0) + 1 })
      .eq("id", codeRecord.id)
      .eq("used_count", codeRecord.used_count ?? 0); // Optimistic locking

    if (updateError) {
      console.error("Failed to update code usage:", updateError);
      return NextResponse.json(
        { error: "Failed to redeem code. Please try again." },
        { status: 500 }
      );
    }

    // Create the run
    const { data: run, error: runError } = await supabase
      .from("runs")
      .insert({
        input: input as unknown as Json,
        status: "pending",
        // user_id will be null for now (anonymous run)
      })
      .select("id")
      .single();

    if (runError || !run) {
      console.error("Failed to create run:", runError);
      return NextResponse.json(
        { error: "Failed to create run" },
        { status: 500 }
      );
    }

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("Create run with code error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
