import { redirect } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui"
import {
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  FileText,
} from "lucide-react"
import { SignOutButton } from "./SignOutButton"

type RunStatus = "pending" | "processing" | "complete" | "failed"

function StatusBadge({ status }: { status: string | null }) {
  const s = status as RunStatus
  const config = {
    pending: { icon: Clock, label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    processing: { icon: Loader2, label: "Processing", className: "bg-blue-100 text-blue-700" },
    complete: { icon: CheckCircle, label: "Complete", className: "bg-green-100 text-green-700" },
    failed: { icon: AlertCircle, label: "Failed", className: "bg-red-100 text-red-700" },
  }[s] ?? { icon: Clock, label: "Unknown", className: "bg-gray-100 text-gray-700" }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className={`h-3 w-3 ${s === "processing" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  )
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getProductName(input: Record<string, unknown>): string {
  const desc = input?.productDescription as string | undefined
  if (!desc) return "Strategy"
  // Get first 50 chars or first sentence
  const firstLine = desc.split(/[.\n]/)[0]
  return firstLine.length > 50 ? firstLine.slice(0, 50) + "..." : firstLine
}

export default async function DashboardPage() {
  const authUser = await requireAuth()

  const supabase = createServiceClient()

  // Find public user
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single()

  let runs: Array<{
    id: string
    status: string | null
    input: Record<string, unknown>
    created_at: string | null
    completed_at: string | null
    share_slug: string | null
  }> = []
  let remainingCredits = 0

  if (publicUser) {
    // Get runs
    const { data: runsData } = await supabase
      .from("runs")
      .select("id, status, input, created_at, completed_at, share_slug")
      .eq("user_id", publicUser.id)
      .order("created_at", { ascending: false })

    runs = (runsData ?? []) as typeof runs

    // Get credits
    const { data: credits } = await supabase
      .from("run_credits")
      .select("credits")
      .eq("user_id", publicUser.id)

    const totalCredits = credits?.reduce((sum, c) => sum + c.credits, 0) ?? 0
    remainingCredits = Math.max(0, totalCredits - runs.length)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-muted mt-1 text-sm">
                {authUser.email}
              </p>
            </div>
            <SignOutButton />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-background rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{runs.length}</p>
                  <p className="text-sm text-muted">
                    {runs.length === 1 ? "Strategy" : "Strategies"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{remainingCredits}</p>
                  <p className="text-sm text-muted">
                    {remainingCredits === 1 ? "Credit" : "Credits"} remaining
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Runs list */}
          <div className="bg-background rounded-xl shadow-lg shadow-foreground/5 border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">Your Strategies</h2>
            </div>

            {runs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-muted" />
                </div>
                <p className="text-muted mb-4">No strategies yet</p>
                <Link href="/start">
                  <Button size="lg">
                    Get your first strategy
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {runs.map((run) => (
                  <Link
                    key={run.id}
                    href={`/results/${run.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {getProductName(run.input)}
                      </p>
                      <p className="text-sm text-muted mt-0.5">
                        {formatDate(run.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <StatusBadge status={run.status} />
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          {runs.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/start">
                <Button variant="secondary" size="lg">
                  Generate another strategy
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
