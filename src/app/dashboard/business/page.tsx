import { redirect } from "next/navigation"
import { getSessionContext } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import type { BusinessProfile } from "@/lib/types/business-profile"
import { BusinessClient } from "@/components/dashboard/business/BusinessClient"

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>
}) {
  const { publicUserId } = await getSessionContext()
  const supabase = createServiceClient()

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, context")
    .eq("user_id", publicUserId)
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
