/**
 * Migration script: Migrate existing user data to business-scoped model
 *
 * This script:
 * 1. For each user with runs, creates a business from their users.context
 * 2. Links all their runs to this business
 * 3. Links all their user_context_chunks to this business
 *
 * Run with: npx tsx scripts/migrate-to-businesses.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function migrateToBusinesses() {
  console.log("Starting migration to business-scoped model...\n");

  // Get all users who have runs (indicating they've actually used the product)
  const { data: usersWithRuns, error: usersError } = await supabase
    .from("runs")
    .select("user_id")
    .not("user_id", "is", null);

  if (usersError) {
    console.error("Failed to fetch users with runs:", usersError);
    process.exit(1);
  }

  // Get unique user IDs
  const userIds = [...new Set(usersWithRuns.map(r => r.user_id).filter(Boolean))];
  console.log(`Found ${userIds.length} users with runs to migrate\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const userId of userIds) {
    if (!userId) continue;

    try {
      // Idempotency check: skip if all runs for this user already have business_id
      const { count: unlinkedRunsCount } = await supabase
        .from("runs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("business_id", null);

      if (unlinkedRunsCount === 0) {
        console.log(`User ${userId} already fully migrated (no unlinked runs), skipping...`);
        skippedCount++;
        continue;
      }

      // Check if user already has a business (partial migration case)
      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (existingBusiness) {
        // User has business but some runs are unlinked - link them
        console.log(`User ${userId} has business ${existingBusiness.id} but ${unlinkedRunsCount} unlinked runs, fixing...`);

        const { error: runsError, count: runsCount } = await supabase
          .from("runs")
          .update({ business_id: existingBusiness.id })
          .eq("user_id", userId)
          .is("business_id", null);

        if (runsError) {
          console.error(`Failed to link runs for user ${userId}:`, runsError);
          errorCount++;
        } else {
          console.log(`  Linked ${runsCount || 0} runs to existing business`);
          migratedCount++;
        }
        continue;
      }

      // Get user's context and runs for naming
      const { data: user } = await supabase
        .from("users")
        .select("context, context_updated_at")
        .eq("id", userId)
        .single();

      // Get the most recent run's product description for business name
      const { data: recentRun } = await supabase
        .from("runs")
        .select("input")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Extract product description for business name
      const runInput = recentRun?.input as { productDescription?: string } | null;
      let businessName = "My Business";
      if (runInput?.productDescription) {
        // Truncate to reasonable length for business name
        businessName = runInput.productDescription.slice(0, 100);
        if (runInput.productDescription.length > 100) {
          businessName += "...";
        }
      }

      // Create business with user's existing context
      const { data: newBusiness, error: businessError } = await supabase
        .from("businesses")
        .insert({
          user_id: userId,
          name: businessName,
          context: user?.context || {},
          context_updated_at: user?.context_updated_at || null,
        })
        .select("id")
        .single();

      if (businessError || !newBusiness) {
        console.error(`Failed to create business for user ${userId}:`, businessError);
        errorCount++;
        continue;
      }

      console.log(`Created business ${newBusiness.id} for user ${userId}`);

      // Update all runs for this user to link to the business
      const { error: runsError, count: runsCount } = await supabase
        .from("runs")
        .update({ business_id: newBusiness.id })
        .eq("user_id", userId)
        .is("business_id", null);

      if (runsError) {
        console.error(`Failed to update runs for user ${userId}:`, runsError);
      } else {
        console.log(`  Updated ${runsCount || 0} runs`);
      }

      // Update all context chunks for this user to link to the business
      const { error: chunksError, count: chunksCount } = await supabase
        .from("user_context_chunks")
        .update({ business_id: newBusiness.id })
        .eq("user_id", userId)
        .is("business_id", null);

      if (chunksError) {
        console.error(`Failed to update context chunks for user ${userId}:`, chunksError);
      } else {
        console.log(`  Updated ${chunksCount || 0} context chunks`);
      }

      // Update free_audits for this user to link to the business
      const { error: auditsError, count: auditsCount } = await supabase
        .from("free_audits")
        .update({ business_id: newBusiness.id })
        .eq("user_id", userId)
        .is("business_id", null);

      if (auditsError) {
        console.error(`Failed to update free audits for user ${userId}:`, auditsError);
      } else if (auditsCount && auditsCount > 0) {
        console.log(`  Updated ${auditsCount} free audits`);
      }

      migratedCount++;
    } catch (err) {
      console.error(`Error migrating user ${userId}:`, err);
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log("Migration complete!");
  console.log(`  Migrated: ${migratedCount} users`);
  console.log(`  Skipped (already had business): ${skippedCount} users`);
  console.log(`  Errors: ${errorCount} users`);
  console.log("========================================\n");
}

migrateToBusinesses().catch(console.error);
