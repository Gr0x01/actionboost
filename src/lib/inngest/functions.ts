import { inngest } from "./client";
import { runPipeline, runFreePipeline, runRefinementPipeline } from "@/lib/ai/pipeline";
import { runMarketingAuditPipeline } from "@/lib/ai/marketing-audit";
import { createServiceClient } from "@/lib/supabase/server";
import type { RunInput } from "@/lib/ai/types";

/**
 * Main pipeline function - triggered when a paid run is created
 *
 * Runs the full agentic research + strategy generation pipeline.
 * Can take up to 10+ minutes, which exceeds Vercel's 300s limit.
 * Inngest allows up to 2 hours per step.
 */
export const generateStrategy = inngest.createFunction(
  {
    id: "generate-strategy",
    retries: 2, // Retry twice for transient failures (total 3 attempts)
  },
  { event: "run/created" },
  async ({ event, step }) => {
    const { runId } = event.data;

    console.log(`[Inngest] Starting pipeline for run ${runId}`);

    // Run the entire pipeline as a single step
    // This can take up to 2 hours (Inngest limit)
    const result = await step.run("agentic-pipeline", async () => {
      try {
        return await runPipeline(runId);
      } catch (err) {
        // Mark run as failed in DB before throwing
        const supabase = createServiceClient();
        await supabase
          .from("runs")
          .update({ status: "failed", stage: "Pipeline error - please try again" })
          .eq("id", runId);
        throw err;
      }
    });

    // If pipeline failed, it already marked the run as failed in DB
    if (!result.success) {
      console.error(`[Inngest] Pipeline failed for run ${runId}:`, result.error);
      return { success: false, error: result.error };
    }

    console.log(`[Inngest] Pipeline completed for run ${runId}`);
    return { success: true, runId };
  }
);

/**
 * Refinement pipeline function - triggered when user requests a refinement
 *
 * Lighter than full pipeline, but can still take several minutes.
 */
export const refineStrategy = inngest.createFunction(
  {
    id: "refine-strategy",
    retries: 2,
  },
  { event: "run/refinement.requested" },
  async ({ event, step }) => {
    const { runId } = event.data;

    console.log(`[Inngest] Starting refinement for run ${runId}`);

    const result = await step.run("refinement-pipeline", async () => {
      try {
        return await runRefinementPipeline(runId);
      } catch (err) {
        const supabase = createServiceClient();
        await supabase
          .from("runs")
          .update({ status: "failed", stage: "Refinement error - please try again" })
          .eq("id", runId);
        throw err;
      }
    });

    if (!result.success) {
      console.error(`[Inngest] Refinement failed for run ${runId}:`, result.error);
      return { success: false, error: result.error };
    }

    console.log(`[Inngest] Refinement completed for run ${runId}`);
    return { success: true, runId };
  }
);

/**
 * Free audit pipeline function - triggered for free mini-audits
 *
 * Shorter pipeline but still benefits from Inngest's longer timeout.
 */
export const generateFreeAudit = inngest.createFunction(
  {
    id: "generate-free-audit",
    retries: 2,
  },
  { event: "free-audit/created" },
  async ({ event, step }) => {
    const { freeAuditId, input } = event.data;

    console.log(`[Inngest] Starting free audit ${freeAuditId}`);

    // Basic validation - input comes from our own routes which already validate
    if (!input || !input.productDescription) {
      console.error(`[Inngest] Invalid input for free audit ${freeAuditId}: missing required fields`);

      const supabase = createServiceClient();
      await supabase
        .from("free_audits")
        .update({ status: "failed" })
        .eq("id", freeAuditId);

      return { success: false, error: "Invalid input data" };
    }

    const result = await step.run("free-audit-pipeline", async () => {
      try {
        return await runFreePipeline(freeAuditId, input as RunInput);
      } catch (err) {
        const supabase = createServiceClient();
        await supabase
          .from("free_audits")
          .update({ status: "failed" })
          .eq("id", freeAuditId);
        throw err;
      }
    });

    if (!result.success) {
      console.error(`[Inngest] Free audit failed for ${freeAuditId}:`, result.error);
      return { success: false, error: result.error };
    }

    console.log(`[Inngest] Free audit completed for ${freeAuditId}`);
    return { success: true, freeAuditId };
  }
);

/**
 * Marketing audit pipeline - triggered for free marketing audit tool
 *
 * Tavily extract + GPT-4.1-mini analysis. Fast and cheap (~$0.02).
 */
export const generateMarketingAudit = inngest.createFunction(
  {
    id: "generate-marketing-audit",
    retries: 2,
  },
  { event: "marketing-audit/created" },
  async ({ event, step }) => {
    const { auditId } = event.data;

    console.log(`[Inngest] Starting marketing audit ${auditId}`);

    const result = await step.run("marketing-audit-pipeline", async () => {
      try {
        return await runMarketingAuditPipeline(auditId);
      } catch (err) {
        const supabase = createServiceClient();
        await supabase
          .from("marketing_audits")
          .update({ status: "failed" })
          .eq("id", auditId);
        throw err;
      }
    });

    if (!result.success) {
      console.error(`[Inngest] Marketing audit failed for ${auditId}:`, result.error);
      return { success: false, error: result.error };
    }

    console.log(`[Inngest] Marketing audit completed for ${auditId}`);
    return { success: true, auditId };
  }
);

// Export all functions for the serve handler
export const functions = [generateStrategy, refineStrategy, generateFreeAudit, generateMarketingAudit];
