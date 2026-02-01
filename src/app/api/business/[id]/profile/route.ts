import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUserId } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { verifyBusinessOwnership } from "@/lib/business"
import type { BusinessProfile } from "@/lib/types/business-profile"

/**
 * GET /api/business/[id]/profile
 * Returns the business profile (from businesses.context JSONB).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id: businessId } = await params

  const isOwner = await verifyBusinessOwnership(businessId, userId)
  if (!isOwner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("businesses")
    .select("context")
    .eq("id", businessId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  // Extract business profile from context JSONB
  const context = (data.context as Record<string, unknown>) || {}
  const profile: BusinessProfile = (context.profile as BusinessProfile) || {}

  return NextResponse.json({ profile })
}

/**
 * PATCH /api/business/[id]/profile
 * Merges partial profile updates into businesses.context.profile JSONB.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId()
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id: businessId } = await params

  const isOwner = await verifyBusinessOwnership(businessId, userId)
  if (!isOwner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updates = await request.json() as Partial<BusinessProfile>

  const supabase = createServiceClient()

  // Fetch current context
  const { data: current } = await supabase
    .from("businesses")
    .select("context")
    .eq("id", businessId)
    .single()

  const context = (current?.context as Record<string, unknown>) || {}
  const existingProfile = (context.profile as BusinessProfile) || {}

  // Merge updates into profile
  const mergedProfile: BusinessProfile = { ...existingProfile, ...updates }

  // If ICP provided, merge sub-fields
  if (updates.icp) {
    mergedProfile.icp = { ...(existingProfile.icp || { who: "", problem: "", alternatives: "" }), ...updates.icp }
  }
  if (updates.voice) {
    mergedProfile.voice = { ...(existingProfile.voice || { tone: "" }), ...updates.voice }
  }
  if (updates.goals) {
    mergedProfile.goals = { ...(existingProfile.goals || { primary: "" }), ...updates.goals }
  }

  // Save back to context JSONB
  const updatedContext = { ...context, profile: mergedProfile as unknown as Record<string, unknown> }

  const { error } = await supabase
    .from("businesses")
    .update({
      context: updatedContext as unknown as import("@/lib/types/database").Json,
      context_updated_at: new Date().toISOString(),
    })
    .eq("id", businessId)

  if (error) {
    console.error("[Business Profile] Update failed:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }

  return NextResponse.json({ profile: mergedProfile })
}
