import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { Header, Footer } from "@/components/layout"
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
import { DashboardTracker } from "./DashboardTracker"
import { TrackedStrategyLink, TrackedFreeAuditLink, TrackedCTAButton } from "./TrackedComponents"

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

function FreeBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
      Free Preview
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
  if (!desc) return "Action Plan"
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

  type StrategyItem = {
    id: string
    status: string | null
    input: Record<string, unknown>
    created_at: string | null
    type: "run" | "free_audit"
  }

  let strategies: StrategyItem[] = []
  let remainingCredits = 0

  if (publicUser) {
    // Get runs
    const { data: runsData } = await supabase
      .from("runs")
      .select("id, status, input, created_at")
      .eq("user_id", publicUser.id)

    // Get free audits
    const { data: freeAuditsData } = await supabase
      .from("free_audits")
      .select("id, status, input, created_at")
      .eq("user_id", publicUser.id)

    // Combine and sort by created_at (newest first)
    const runs = (runsData ?? []).map(r => ({ ...r, type: "run" as const }))
    const freeAudits = (freeAuditsData ?? []).map(a => ({ ...a, type: "free_audit" as const }))
    strategies = [...runs, ...freeAudits].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    }) as StrategyItem[]

    // Get credits (only count runs, not free audits)
    const { data: credits } = await supabase
      .from("run_credits")
      .select("credits")
      .eq("user_id", publicUser.id)

    const totalCredits = credits?.reduce((sum, c) => sum + c.credits, 0) ?? 0
    const paidRuns = runs.length
    remainingCredits = Math.max(0, totalCredits - paidRuns)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <DashboardTracker stats={{ runs: strategies.length, credits: remainingCredits }} />
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
                  <p className="text-2xl font-semibold text-foreground">{strategies.length}</p>
                  <p className="text-sm text-muted">
                    {strategies.length === 1 ? "Action Plan" : "Action Plans"}
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

          {/* Strategies list */}
          <div className="bg-background rounded-xl shadow-lg shadow-foreground/5 border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">Your Action Plans</h2>
            </div>

            {strategies.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-muted" />
                </div>
                <p className="text-muted mb-4">No action plans yet</p>
                <TrackedCTAButton button="get_first_strategy" />
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {strategies.map((item) =>
                  item.type === "free_audit" ? (
                    <TrackedFreeAuditLink key={item.id} auditId={item.id} status={item.status}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {getProductName(item.input)}
                          </p>
                          <FreeBadge />
                        </div>
                        <p className="text-sm text-muted mt-0.5">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <StatusBadge status={item.status} />
                        <ArrowRight className="h-4 w-4 text-muted" />
                      </div>
                    </TrackedFreeAuditLink>
                  ) : (
                    <TrackedStrategyLink key={item.id} runId={item.id} status={item.status}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {getProductName(item.input)}
                        </p>
                        <p className="text-sm text-muted mt-0.5">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <StatusBadge status={item.status} />
                        <ArrowRight className="h-4 w-4 text-muted" />
                      </div>
                    </TrackedStrategyLink>
                  )
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          {strategies.length > 0 && (
            <div className="mt-6 text-center">
              <TrackedCTAButton button="generate_another" variant="secondary" />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
