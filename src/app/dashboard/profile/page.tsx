import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import type { BusinessProfile } from "@/lib/types/business-profile"
import { ProfileClient } from "@/components/dashboard/profile/ProfileClient"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>
}) {
  const authUser = await requireAuth()
  const supabase = createServiceClient()

  // Get public user
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (!publicUser) {
    redirect("/start")
  }

  // Get user's businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, context")
    .eq("user_id", publicUser.id)
    .order("created_at", { ascending: false })

  if (!businesses || businesses.length === 0) {
    redirect("/start")
  }

  // Determine active business
  const { biz } = await searchParams
  const activeBiz =
    businesses.find((b) => b.id === biz) || businesses[0]

  // Extract profile from context JSONB
  const context = (activeBiz.context as Record<string, unknown>) || {}
  const profile: BusinessProfile = (context.profile as BusinessProfile) || {}

  return (
    <ProfileClient
      businessId={activeBiz.id}
      businessName={activeBiz.name}
      profile={profile}
    />
  )
}
