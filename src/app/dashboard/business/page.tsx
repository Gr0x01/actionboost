import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import type { BusinessProfile } from "@/lib/types/business-profile"
import { BusinessClient } from "@/components/dashboard/business/BusinessClient"

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>
}) {
  const authUser = await requireAuth()
  const supabase = createServiceClient()

  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (!publicUser) {
    redirect("/start")
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, context")
    .eq("user_id", publicUser.id)
    .order("created_at", { ascending: false })

  if (!businesses || businesses.length === 0) {
    redirect("/start")
  }

  const { biz } = await searchParams
  const activeBiz = businesses.find((b) => b.id === biz) || businesses[0]

  const context = (activeBiz.context as Record<string, unknown>) || {}
  const profile: BusinessProfile = (context.profile as BusinessProfile) || {}

  return (
    <BusinessClient
      businessId={activeBiz.id}
      businessName={activeBiz.name}
      profile={profile}
    />
  )
}
