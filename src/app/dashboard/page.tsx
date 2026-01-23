import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { Header, Footer } from "@/components/layout"
import {
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { DashboardTracker } from "./DashboardTracker"
import { TrackedStrategyLink, TrackedFreeAuditLink, TrackedCTAButton } from "./TrackedComponents"

type DashboardState = "empty" | "processing" | "ready"

type RunStatus = "pending" | "processing" | "complete" | "failed"

function StatusBadge({ status }: { status: string | null }) {
  const s = status as RunStatus
  const config = {
    pending: {
      icon: Clock,
      label: "Waiting",
      className: "bg-amber-100 text-amber-800 border border-amber-300",
    },
    processing: {
      icon: Loader2,
      label: "Building...",
      className: "bg-blue-100 text-blue-800 border border-blue-300",
    },
    complete: {
      icon: CheckCircle,
      label: "Ready",
      className: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    },
    failed: {
      icon: AlertCircle,
      label: "Failed",
      className: "bg-red-100 text-red-800 border border-red-300",
    },
  }[s] ?? { icon: Clock, label: "Unknown", className: "bg-gray-100 text-gray-800 border border-gray-300" }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className={`h-3 w-3 ${s === "processing" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  )
}

function FreeBadge() {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-violet-100 text-violet-800 border border-violet-200 text-xs font-medium">
      Free preview
    </span>
  )
}

// Plan card with confident styling
function PlanCard({
  productName,
  date,
  status,
  isProcessing,
  isFeatured,
  badge,
}: {
  productName: string
  date: string
  status: string | null
  isProcessing: boolean
  isFeatured: boolean
  badge?: React.ReactNode
}) {
  if (isFeatured) {
    // Featured card - confident, solid, the main event
    return (
      <div
        className="rounded-xl border-2 border-cta bg-white p-6 transition-all group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(230,126,34,0.25)]"
        style={{
          boxShadow: "0 4px 20px rgba(230, 126, 34, 0.15)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Ready badge - solid, not gradient */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white">
                <CheckCircle className="h-3.5 w-3.5" />
                Ready to view
              </span>
              {badge}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-foreground font-serif mb-1 group-hover:text-cta transition-colors">
              {productName}
            </h3>
            <p className="text-sm text-foreground/60">{date}</p>
          </div>

          {/* Action button - solid CTA */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-cta text-white transition-all group-hover:gap-3 hover:bg-cta/90 active:scale-95"
            style={{
              boxShadow: "0 2px 8px rgba(230, 126, 34, 0.3)",
            }}
          >
            View plan
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    )
  }

  // Standard card - solid but secondary
  const isComplete = status === "complete"
  const isFailed = status === "failed"
  const showStatusBadge = !isComplete

  return (
    <div
      className={`
        rounded-xl border bg-white p-5 transition-all group-hover:-translate-y-0.5
        ${isProcessing
          ? "border-blue-200 bg-blue-50/50"
          : isFailed
            ? "border-red-200 bg-red-50/30"
            : "border-border hover:border-foreground/20 hover:shadow-[0_4px_16px_rgba(44,62,80,0.1)]"
        }
      `}
      style={{
        boxShadow: "0 2px 8px rgba(44, 62, 80, 0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-foreground group-hover:text-cta transition-colors">
              {productName}
            </p>
            {badge}
          </div>
          <p className="text-sm text-foreground/50">{date}</p>
        </div>
        <div className="flex items-center gap-3">
          {showStatusBadge && <StatusBadge status={status} />}
          <ArrowRight className="h-5 w-5 text-foreground/40 group-hover:text-cta transition-colors" />
        </div>
      </div>
    </div>
  )
}

function formatRelativeDate(dateString: string | null) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 5) return "Just now"
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`
  if (diffDays < 7) return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getProductName(input: Record<string, unknown>): string {
  const desc = input?.productDescription as string | undefined
  if (!desc) return "Your business"
  // Get first 40 chars or first sentence, clean up
  const firstLine = desc.split(/[.\n]/)[0].trim()
  return firstLine.length > 40 ? firstLine.slice(0, 40) + "..." : firstLine
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

  // Determine dashboard state for conditional UI
  const hasProcessing = strategies.some(s => s.status === "pending" || s.status === "processing")
  const hasComplete = strategies.some(s => s.status === "complete")
  const latestStrategy = strategies[0]

  const dashboardState: DashboardState =
    strategies.length === 0 ? "empty" :
    hasProcessing && !hasComplete ? "processing" :
    "ready"

  // Get contextual header copy
  const getHeaderContent = () => {
    if (dashboardState === "empty") {
      return {
        eyebrow: "Welcome",
        headline: "Let's build your first plan",
        subtext: "Tell us about your business and we'll create a 30-day marketing strategy.",
      }
    }
    if (dashboardState === "processing") {
      const productName = latestStrategy ? getProductName(latestStrategy.input) : "your business"
      return {
        eyebrow: "We're on it",
        headline: `Building your plan for ${productName}`,
        subtext: "We're researching your competitors right now. Most plans are ready in about 5 minutes.",
      }
    }
    // Ready state
    return {
      eyebrow: "Your plan is ready",
      headline: "Here's what we built for you",
      subtext: null,
    }
  }

  const headerContent = getHeaderContent()

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <DashboardTracker stats={{ runs: strategies.length, credits: remainingCredits }} />
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Header section - contextual based on state */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-cta mb-1">
                {headerContent.eyebrow}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-serif">
                {headerContent.headline}
              </h1>
              {headerContent.subtext && (
                <p className="text-foreground/60 mt-2 text-sm max-w-md">
                  {headerContent.subtext}
                </p>
              )}
            </div>
            <SignOutButton />
          </div>

          {/* Plans list */}
          {strategies.length === 0 ? (
            /* Empty state - confident, solid */
            <div className="rounded-xl border-2 border-dashed border-foreground/20 bg-white p-10 text-center">
              <div className="w-16 h-16 rounded-xl bg-cta/10 border border-cta/20 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-cta" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 font-serif">
                Ready to grow your business?
              </h3>
              <p className="text-foreground/60 mb-8 max-w-sm mx-auto">
                We'll research your competitors and build a 30-day marketing plan just for you.
              </p>

              <TrackedCTAButton button="get_first_strategy" />
            </div>
          ) : (
            <div className="space-y-4">
              {strategies.map((item, index) => {
                const isReady = item.status === "complete"
                const isProcessing = item.status === "pending" || item.status === "processing"
                const isFeatured = index === 0 && isReady // First ready plan is featured

                return item.type === "free_audit" ? (
                  <TrackedFreeAuditLink key={item.id} auditId={item.id} status={item.status}>
                    <PlanCard
                      productName={getProductName(item.input)}
                      date={formatRelativeDate(item.created_at)}
                      status={item.status}
                      isProcessing={isProcessing}
                      isFeatured={false}
                      badge={<FreeBadge />}
                    />
                  </TrackedFreeAuditLink>
                ) : (
                  <TrackedStrategyLink key={item.id} runId={item.id} status={item.status}>
                    <PlanCard
                      productName={getProductName(item.input)}
                      date={formatRelativeDate(item.created_at)}
                      status={item.status}
                      isProcessing={isProcessing}
                      isFeatured={isFeatured}
                    />
                  </TrackedStrategyLink>
                )
              })}
            </div>
          )}

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
