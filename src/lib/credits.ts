import { createServiceClient } from "@/lib/supabase/server";

/**
 * Calculate remaining credits for a user.
 * Single source of truth — used by /api/user/credits and /api/user/runs.
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const supabase = createServiceClient();

  const [{ data: user }, { data: creditRecords }] = await Promise.all([
    supabase.from("users").select("credits_used").eq("id", userId).single(),
    supabase.from("run_credits").select("credits").eq("user_id", userId),
  ]);

  const totalCredits = creditRecords?.reduce((sum, c) => sum + c.credits, 0) ?? 0;
  const usedCredits = user?.credits_used ?? 0;
  return Math.max(0, totalCredits - usedCredits);
}
