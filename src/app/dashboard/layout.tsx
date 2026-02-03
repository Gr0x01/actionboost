import { getSessionContext } from "@/lib/auth/session"
import { getUserBusinesses } from "@/lib/business"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { authUser, publicUserId } = await getSessionContext()

  let businesses: Awaited<ReturnType<typeof getUserBusinesses>>
  try {
    businesses = await getUserBusinesses(publicUserId)
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
