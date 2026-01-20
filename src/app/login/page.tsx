"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { Header, Footer } from "@/components/layout"
import { Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

function LoginForm() {
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const next = searchParams.get("next") || "/dashboard"
  const hasTrackedView = useRef(false)

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [error, setError] = useState("")

  // Track login page viewed
  useEffect(() => {
    if (!hasTrackedView.current) {
      posthog?.capture("login_page_viewed", { redirect_to: next })
      hasTrackedView.current = true
    }
  }, [posthog, next])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    posthog?.capture("login_submitted")
    setStatus("loading")
    setError("")

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      })

      const data = await res.json()

      if (!res.ok) {
        posthog?.capture("login_error", { error: data.error || "api_error" })
        setError(data.error || "Failed to send magic link")
        setStatus("error")
        return
      }

      posthog?.capture("login_magic_link_sent")
      setStatus("sent")
    } catch {
      posthog?.capture("login_error", { error: "network_error" })
      setError("Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1 py-10 sm:py-14 flex items-center justify-center">
        <div className="mx-auto max-w-lg w-full px-4 sm:px-6">
          {/* Brutalist card */}
          <div className="border-[3px] border-foreground bg-background p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(44,62,80,1)]">
            {status === "sent" ? (
              /* Success state */
              <div className="text-center py-4">
                <h1 className="text-xl font-black text-foreground mb-2">
                  Check your email
                </h1>
                <p className="text-foreground/60 text-base mb-6">
                  We sent a login link to{" "}
                  <strong className="text-foreground font-bold">{email}</strong>
                </p>
                <p className="text-foreground/50 text-sm">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-cta hover:text-cta/80 font-bold underline underline-offset-2"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-black text-foreground">
                    Sign in to Actionboo.st
                  </h1>
                  <p className="text-foreground/60 text-base mt-2">
                    View your past action plans and credit balance
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-foreground mb-2"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      className="w-full bg-surface border-2 border-foreground/20 px-4 py-3 text-foreground placeholder:text-foreground/30 text-base focus:outline-none focus:border-foreground transition-colors"
                      required
                    />
                    {error && (
                      <p className="mt-2 text-sm font-medium text-red-600">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Tactile button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cta text-white font-bold text-lg border-2 border-cta shadow-[4px_4px_0_0_rgba(44,62,80,1)] hover:shadow-[6px_6px_0_0_rgba(44,62,80,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_0_rgba(44,62,80,1)] disabled:hover:translate-y-0 transition-all duration-100"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send magic link
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t-2 border-foreground/10 text-center">
                  <p className="text-foreground/60 text-sm">
                    New to Actionboo.st?{" "}
                    <Link
                      href="/start"
                      className="text-cta hover:text-cta/80 font-bold underline underline-offset-2"
                    >
                      Get your first action plan
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Trust footer */}
          <p className="mt-6 text-center text-sm text-foreground/40 font-mono">
            No password needed · Magic link expires in 1 hour
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-surface/30">
          <Header />
          <main className="flex-1 py-10 sm:py-14 flex items-center justify-center">
            <div className="font-mono text-foreground/50">Loading...</div>
          </main>
          <Footer />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
