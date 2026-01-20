"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { LogOut, Loader2 } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-foreground/70 border-2 border-foreground/30 bg-background hover:border-foreground hover:text-foreground shadow-[2px_2px_0_0_rgba(44,62,80,0.3)] hover:shadow-[3px_3px_0_0_rgba(44,62,80,0.5)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0.5 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0_0_rgba(44,62,80,0.3)] disabled:hover:translate-y-0"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Sign out
        </>
      )}
    </button>
  )
}
