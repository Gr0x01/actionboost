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
    pending: { icon: Clock, label: "Pending", className: "bg-amber-50 text-amber-800 border-amber-800" },
    processing: { icon: Loader2, label: "Processing", className: "bg-blue-50 text-blue-800 border-blue-800" },
    complete: { icon: CheckCircle, label: "Complete", className: "bg-emerald-50 text-emerald-800 border-emerald-800" },
    failed: { icon: AlertCircle, label: "Failed", className: "bg-red-50 text-red-800 border-red-800" },
  }[s] ?? { icon: Clock, label: "Unknown", className: "bg-gray-50 text-gray-800 border-gray-800" }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 font-mono text-xs font-bold uppercase tracking-wide ${config.className}`}>
      <Icon className={`h-3 w-3 ${s === "processing" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  )
}

function FreeBadge() {
  return (
    <span className="inline-flex items-center px-2 py-1 border-2 border-violet-800 bg-violet-50 text-violet-800 font-mono text-xs font-bold uppercase tracking-wide">
      Free
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
              <p className="font-mono text-xs tracking-[0.15em] text-foreground/50 uppercase mb-1">
                Your Account
              </p>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-foreground/60 mt-1 text-sm font-mono">
                {authUser.email}
              </p>
            </div>
            <SignOutButton />
          </div>

          {/* Stats cards - brutalist boxes */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-foreground bg-surface flex items-center justify-center">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">{strategies.length}</p>
                  <p className="text-sm text-foreground/60 font-mono uppercase tracking-wide">
                    {strategies.length === 1 ? "Plan" : "Plans"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-[3px] border-foreground bg-background p-5 shadow-[4px_4px_0_0_rgba(44,62,80,1)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-foreground bg-cta/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-cta" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">{remainingCredits}</p>
                  <p className="text-sm text-foreground/60 font-mono uppercase tracking-wide">
                    {remainingCredits === 1 ? "Credit" : "Credits"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategies list - brutalist container */}
          <div className="border-[3px] border-foreground bg-background shadow-[6px_6px_0_0_rgba(44,62,80,1)] overflow-hidden">
            <div className="px-6 py-4 border-b-[3px] border-foreground bg-surface">
              <h2 className="font-bold text-foreground uppercase tracking-wide">Your Action Plans</h2>
            </div>

            {strategies.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 border-[3px] border-foreground bg-surface flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-7 w-7 text-foreground/50" />
                </div>
                <p className="text-foreground/60 mb-6 font-medium">No action plans yet</p>
                <TrackedCTAButton button="get_first_strategy" />
              </div>
            ) : (
              <div className="divide-y-[2px] divide-foreground/20">
                {strategies.map((item) =>
                  item.type === "free_audit" ? (
                    <TrackedFreeAuditLink key={item.id} auditId={item.id} status={item.status}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-foreground truncate">
                            {getProductName(item.input)}
                          </p>
                          <FreeBadge />
                        </div>
                        <p className="text-sm text-foreground/50 mt-1 font-mono">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <StatusBadge status={item.status} />
                        <ArrowRight className="h-5 w-5 text-foreground/40" />
                      </div>
                    </TrackedFreeAuditLink>
                  ) : (
                    <TrackedStrategyLink key={item.id} runId={item.id} status={item.status}>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {getProductName(item.input)}
                        </p>
                        <p className="text-sm text-foreground/50 mt-1 font-mono">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <StatusBadge status={item.status} />
                        <ArrowRight className="h-5 w-5 text-foreground/40" />
                      </div>
                    </TrackedStrategyLink>
                  )
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          {strategies.length > 0 && (
            <div className="mt-8 text-center">
              <TrackedCTAButton button="generate_another" variant="secondary" />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
