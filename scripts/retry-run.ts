// Usage: npx tsx scripts/retry-run.ts <runId>
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const runId = process.argv[2];
if (!runId) {
  console.error("Usage: npx tsx scripts/retry-run.ts <runId>");
  process.exit(1);
}

// Dynamic import to get the pipeline after env is loaded
async function main() {
  const { runPipeline } = await import("../src/lib/ai/pipeline");

  console.log(`Retrying run: ${runId}`);
  const result = await runPipeline(runId);

  if (result.success) {
    console.log(`Success! Output: ${result.output?.length} chars`);
  } else {
    console.error(`Failed: ${result.error}`);
  }
}

main().catch(console.error);
