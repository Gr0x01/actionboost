import { redirect } from "next/navigation"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>
}) {
  const { biz } = await searchParams
  redirect(`/dashboard/brand${biz ? `?biz=${biz}` : ""}`)
}
