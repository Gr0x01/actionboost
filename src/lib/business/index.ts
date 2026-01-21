/**
 * Business management functions
 *
 * Handles creating, fetching, and managing businesses.
 * Each user can have multiple businesses, and context accumulates per-business.
 */

import { createServiceClient } from "@/lib/supabase/server"
import type { RunInput } from "@/lib/ai/types"
import type { BusinessSummary, UserContext } from "@/lib/types/context"

/**
 * Generate a business name from product description
 * Extracts first sentence or truncates to 50 chars
 */
function generateBusinessName(productDescription: string): string {
  // Extract first sentence
  const firstSentence = productDescription.split(/[.!?]/)[0]?.trim()
  if (firstSentence && firstSentence.length <= 50) {
    return firstSentence
  }
  // Fallback to truncation
  if (productDescription.length <= 50) {
    return productDescription
  }
  return productDescription.slice(0, 47) + "..."
}

/**
 * Create a new business for a user
 * Used when "Start fresh" is clicked or for free audits
 */
export async function createBusiness(
  userId: string,
  input?: RunInput
): Promise<string> {
  const supabase = createServiceClient()

  const name = input?.productDescription
    ? generateBusinessName(input.productDescription)
    : "My Business"

  const { data: newBusiness, error } = await supabase
    .from("businesses")
    .insert({
      user_id: userId,
      name,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[Business] Failed to create business:", error)
    throw new Error(`Failed to create business: ${error.message}`)
  }

  console.log(`[Business] Created business ${newBusiness.id} for user ${userId}: "${name}"`)
  return newBusiness.id
}

/**
 * Get or create a default business for a user
 * Used for backwards compatibility when no business is specified
 */
export async function getOrCreateDefaultBusiness(
  userId: string,
  input?: RunInput
): Promise<string> {
  const supabase = createServiceClient()

  // Check if user has any businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)

  if (businesses && businesses.length > 0) {
    return businesses[0].id
  }

  // No businesses exist, create first one
  return createBusiness(userId, input)
}

/**
 * Get all businesses for a user with summary info
 * Used for business selector in UI
 *
 * Note: This uses 2 queries (businesses + runs) because Supabase doesn't support
 * aggregate functions (COUNT, MAX) in the same select as regular columns.
 * For MVP scale (<100 businesses per user, <1000 runs per business), this is
 * acceptable. If we need to optimize later, we could:
 * - Add a database view with aggregated stats
 * - Denormalize run_count/last_run_date onto the businesses table
 * - Use a raw SQL query via supabase.rpc()
 */
export async function getUserBusinesses(userId: string): Promise<BusinessSummary[]> {
  const supabase = createServiceClient()

  // Fetch businesses with their run counts
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      context,
      created_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[Business] Failed to fetch businesses:", error)
    return []
  }

  if (!businesses || businesses.length === 0) {
    return []
  }

  // Get run counts and last run dates for each business in a single query
  // This fetches all runs for the user's businesses, which we then aggregate in JS
  const businessIds = businesses.map((b) => b.id)
  const { data: runStats } = await supabase
    .from("runs")
    .select("business_id, created_at")
    .in("business_id", businessIds)
    .order("created_at", { ascending: false })

  // Build summaries
  return businesses.map((b) => {
    const context = b.context as UserContext | null
    const businessRuns = runStats?.filter((r) => r.business_id === b.id) || []
    const latestRun = businessRuns[0]

    return {
      id: b.id,
      name: b.name,
      totalRuns: context?.totalRuns || businessRuns.length,
      lastRunDate: latestRun?.created_at || null,
      productDescription: context?.product?.description || null,
    }
  })
}

/**
 * Verify a business belongs to a user
 * Returns the business ID if valid, null if not
 */
export async function verifyBusinessOwnership(
  businessId: string,
  userId: string
): Promise<boolean> {
  const supabase = createServiceClient()

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", userId)
    .single()

  return !!business
}

/**
 * Update a business name
 * Called after run completion to update name from product description if still default
 * @internal Only call from trusted server-side code (pipeline)
 */
export async function updateBusinessName(
  businessId: string,
  productDescription: string
): Promise<void> {
  const supabase = createServiceClient()

  // Only update if current name is default
  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .single()

  if (business?.name === "My Business") {
    const newName = generateBusinessName(productDescription)
    await supabase
      .from("businesses")
      .update({ name: newName })
      .eq("id", businessId)

    console.log(`[Business] Updated business ${businessId} name to: "${newName}"`)
  }
}
