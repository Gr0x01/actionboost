import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { getUserBusinesses } from "@/lib/business"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authUser = await requireAuth()

  const supabase = createServiceClient()
  const { data: publicUser, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  if (userError || !publicUser) {
    if (userError) {
      console.error("[Dashboard Layout] Failed to fetch user:", userError)
    }
    redirect("/start")
  }

  let businesses: Awaited<ReturnType<typeof getUserBusinesses>>
  try {
    businesses = await getUserBusinesses(publicUser.id)
  } catch (error) {
    console.error("[Dashboard Layout] Failed to load businesses:", error)
    businesses = []
  }

  return (
    <DashboardShell
      businesses={businesses}
      userEmail={authUser.email || ""}
    >
      {children}
    </DashboardShell>
  )
}
