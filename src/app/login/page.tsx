"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { Header, Footer } from "@/components/layout"
import { Button, Input } from "@/components/ui"
import { Loader2, Mail, ArrowRight, CheckCircle } from "lucide-react"
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
        <div className="mx-auto max-w-md w-full px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="block text-center text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors mb-6">
            Actionboo.st
          </Link>

          <div className="bg-background rounded-xl shadow-lg shadow-foreground/5 border border-border/50 p-6 sm:p-8">
            {status === "sent" ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-foreground mb-2">
                  Check your email
                </h1>
                <p className="text-muted text-sm mb-6">
                  We sent a login link to <strong className="text-foreground">{email}</strong>
                </p>
                <p className="text-muted text-xs">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Sign in to Actionboo.st
                  </h1>
                  <p className="text-muted text-sm mt-1">
                    View your past action plans and credit balance
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    error={error}
                    required
                  />

                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full"
                    size="lg"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send magic link
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <p className="text-muted text-sm">
                    New to Actionboo.st?{" "}
                    <Link
                      href="/start"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Get your first action plan
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
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
            <div className="animate-pulse text-muted">Loading...</div>
          </main>
          <Footer />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
