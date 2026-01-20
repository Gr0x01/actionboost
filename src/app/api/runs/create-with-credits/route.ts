import { NextRequest, NextResponse, after } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FormInput, validateForm } from "@/lib/types/form";
import { Json } from "@/lib/types/database";
import { runPipeline } from "@/lib/ai/pipeline";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const { input, contextDelta, posthogDistinctId } = (await request.json()) as {
      input: FormInput;
      contextDelta?: string;
      posthogDistinctId?: string;
    };

    if (!input || !input.productDescription) {
      return NextResponse.json(
        { error: "Form input is required" },
        { status: 400 }
      );
    }

    // Validate form content (character limits)
    const formErrors = validateForm(input);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(formErrors)[0] },
        { status: 400 }
      );
    }

    // Check if user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to use credits" },
        { status: 401 }
      );
    }

    const serviceClient = createServiceClient();

    // Get public user
    const { data: publicUser } = await serviceClient
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!publicUser) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Check credits
    const { data: creditRecords } = await serviceClient
      .from("run_credits")
      .select("credits")
      .eq("user_id", publicUser.id);

    const { count: runCount } = await serviceClient
      .from("runs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", publicUser.id);

    const totalCredits = creditRecords?.reduce((sum, c) => sum + c.credits, 0) ?? 0;
    const usedCredits = runCount ?? 0;
    const remainingCredits = totalCredits - usedCredits;

    if (remainingCredits < 1) {
      return NextResponse.json(
        { error: "No credits available" },
        { status: 402 }
      );
    }

    // Create the run (this uses 1 credit by existing)
    const { data: run, error: runError } = await serviceClient
      .from("runs")
      .insert({
        input: input as unknown as Json,
        status: "pending",
        user_id: publicUser.id,
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

    // Track run creation
    const distinctId = posthogDistinctId || user.id || run.id;
    trackServerEvent(distinctId, "run_created_with_credits", {
      run_id: run.id,
      email: user.email,
      credits_remaining: remainingCredits - 1,
      focus_area: input.focusArea,
    });

    // Trigger AI pipeline in background (after() keeps function alive until complete)
    after(async () => {
      try {
        await runPipeline(run.id);
      } catch (err) {
        console.error("Pipeline failed for run:", run.id, err);
      }
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("Create run with credits error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
