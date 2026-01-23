import { requireAuth } from "@/lib/auth/session"
import { createServiceClient } from "@/lib/supabase/server"
import { Header, Footer } from "@/components/layout"
import {
  ArrowRight,
  Clock,
  AlertCircle,
  Loader2,
  Zap,
  FileText,
  ChevronDown,
} from "lucide-react"
import { SignOutButton } from "./SignOutButton"
import { DashboardTracker } from "./DashboardTracker"
import { TrackedStrategyLink, TrackedFreeAuditLink, TrackedCTAButton, TrackedHeroCard } from "./TrackedComponents"

type RunStatus = "pending" | "processing" | "complete" | "failed"

// Only show badges for non-complete states
function StatusBadge({ status }: { status: string | null }) {
  const s = status as RunStatus

  // Don't show badge for complete items - it's the default state
  if (s === "complete") return null

  const config = {
    pending: { icon: Clock, label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-300" },
    processing: { icon: Loader2, label: "Building your plan...", className: "bg-blue-50 text-blue-700 border-blue-300" },
    failed: { icon: AlertCircle, label: "Failed", className: "bg-red-50 text-red-700 border-red-300" },
  }[s] ?? { icon: Clock, label: "Unknown", className: "bg-gray-50 text-gray-700 border-gray-300" }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 border text-xs font-medium ${config.className}`}>
      <Icon className={`h-3 w-3 ${s === "processing" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  )
}

function FreeBadge() {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 border border-violet-300 bg-violet-50 text-violet-700 text-xs font-medium">
      Free preview
    </span>
  )
}

// Human-friendly relative dates
function formatRelativeDate(dateString: string | null) {
  if (!dateString) return "—"

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Same calendar day
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return "Today"

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  // Within last week
  if (diffDays < 7) return `${diffDays} days ago`

  // Within last month
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  }

  // Older - show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

function getProductName(input: Record<string, unknown>): string {
  const desc = input?.productDescription as string | undefined
  if (!desc) return "Marketing plan"
  // Get first 100 chars - show more context
  const firstLine = desc.split(/[\n]/)[0]
  return firstLine.length > 100 ? firstLine.slice(0, 100) + "..." : firstLine
}

// Types for organized plan data
type StrategyItem = {
  id: string
  status: string | null
  input: Record<string, unknown>
  created_at: string | null
  parent_run_id: string | null
  type: "run" | "free_audit"
}

type PlanChain = {
  root: StrategyItem
  refinements: StrategyItem[]
  latest: StrategyItem // The most recent in the chain (either root or latest refinement)
}

function organizePlans(strategies: StrategyItem[]): { chains: PlanChain[]; freeAudits: StrategyItem[] } {
  // Separate free audits (they don't have refinements)
  const freeAudits = strategies.filter(s => s.type === "free_audit")
  const runs = strategies.filter(s => s.type === "run")

  // Build a map of run_id -> run
  const runMap = new Map<string, StrategyItem>()
  runs.forEach(r => runMap.set(r.id, r))

  // Find root runs (no parent_run_id) and their refinement chains
  const rootRuns = runs.filter(r => !r.parent_run_id)
  const refinements = runs.filter(r => r.parent_run_id)

  // Build chains
  const chains: PlanChain[] = rootRuns.map(root => {
    // Find all refinements that trace back to this root
    const chainRefinements: StrategyItem[] = []

    // Simple approach: find direct children, then their children, etc.
    const findChildren = (parentId: string) => {
      const children = refinements.filter(r => r.parent_run_id === parentId)
      children.forEach(child => {
        chainRefinements.push(child)
        findChildren(child.id)
      })
    }
    findChildren(root.id)

    // Sort refinements by date (newest first)
    chainRefinements.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    // Latest is the most recent refinement, or the root if no refinements
    const latest = chainRefinements.length > 0 ? chainRefinements[0] : root

    return { root, refinements: chainRefinements, latest }
  })

  // Sort chains by the latest item's date (newest first)
  chains.sort((a, b) => {
    const dateA = a.latest.created_at ? new Date(a.latest.created_at).getTime() : 0
    const dateB = b.latest.created_at ? new Date(b.latest.created_at).getTime() : 0
    return dateB - dateA
  })

  return { chains, freeAudits }
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

  let strategies: StrategyItem[] = []
  let remainingCredits = 0

  if (publicUser) {
    // Get runs with parent_run_id for refinement grouping
    const { data: runsData } = await supabase
      .from("runs")
      .select("id, status, input, created_at, parent_run_id")
      .eq("user_id", publicUser.id)

    // Get free audits
    const { data: freeAuditsData } = await supabase
      .from("free_audits")
      .select("id, status, input, created_at")
      .eq("user_id", publicUser.id)

    // Combine
    const runs = (runsData ?? []).map(r => ({ ...r, type: "run" as const }))
    const freeAudits = (freeAuditsData ?? []).map(a => ({ ...a, parent_run_id: null, type: "free_audit" as const }))
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
    // Only count non-refinement runs against credits
    const paidRuns = runs.filter(r => !r.parent_run_id).length
    remainingCredits = Math.max(0, totalCredits - paidRuns)
  }

  // Organize into chains
  const { chains, freeAudits } = organizePlans(strategies)

  // Count root plans (not refinements) for display logic
  const rootPlanCount = chains.length
  const hasPlans = rootPlanCount > 0 || freeAudits.length > 0
  const isTypicalUser = rootPlanCount <= 3 && freeAudits.length <= 2

  return (
    <div className="min-h-screen flex flex-col bg-surface/30">
      <DashboardTracker stats={{ runs: strategies.length, credits: remainingCredits }} />
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Welcome back
              </h1>
              <p className="text-foreground/60 mt-1 text-sm">
                Signed in as {authUser.email}
              </p>
            </div>
            <SignOutButton />
          </div>

          {/* Stats cards - only show credits if user has some, hide plans count for small users */}
          {(remainingCredits > 0 || rootPlanCount >= 5) && (
            <div className={`grid gap-4 mb-8 ${remainingCredits > 0 && rootPlanCount >= 5 ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
              {rootPlanCount >= 5 && (
                <div className="rounded-md border-2 border-foreground/20 bg-background p-5" style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md border-2 border-foreground/20 bg-surface flex items-center justify-center">
                      <FileText className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-foreground">{rootPlanCount}</p>
                      <p className="text-sm text-foreground/60">
                        {rootPlanCount === 1 ? "plan created" : "plans created"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {remainingCredits > 0 && (
                <div className="rounded-md border-2 border-foreground/20 bg-background p-5" style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md border-2 border-cta/30 bg-cta/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-cta" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-foreground">{remainingCredits}</p>
                      <p className="text-sm text-foreground/60">
                        {remainingCredits === 1 ? "credit remaining" : "credits remaining"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!hasPlans && (
            <div className="rounded-md border-2 border-foreground/20 bg-background p-12 text-center" style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}>
              <div className="w-16 h-16 rounded-md border-2 border-foreground/20 bg-surface flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-foreground/40" />
              </div>
              <p className="text-foreground/80 mb-2 font-semibold text-lg">Ready to grow your business?</p>
              <p className="text-foreground/50 text-sm mb-6 max-w-sm mx-auto">
                Get your personalized 30-day marketing plan with real competitive research.
              </p>
              <TrackedCTAButton button="get_first_strategy" />
            </div>
          )}

          {/* Hero card for typical users - show their latest plan prominently */}
          {hasPlans && isTypicalUser && chains.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-foreground/60 mb-3">Your latest plan</h2>
              <TrackedHeroCard
                runId={chains[0].latest.id}
                title={getProductName(chains[0].latest.input)}
                date={formatRelativeDate(chains[0].latest.created_at)}
                status={chains[0].latest.status}
                hasRefinements={chains[0].refinements.length > 0}
              />
            </div>
          )}

          {/* Previous plans for typical users OR full list for power users */}
          {hasPlans && (
            <div className="rounded-md border-2 border-foreground/20 bg-background overflow-hidden" style={{ boxShadow: '4px 4px 0 rgba(44, 62, 80, 0.15)' }}>
              <div className="px-6 py-4 border-b-2 border-foreground/10 bg-surface/50">
                <h2 className="font-bold text-foreground">
                  {isTypicalUser && chains.length > 0 ? "Previous plans" : "Your marketing plans"}
                </h2>
              </div>

              <div className="divide-y divide-foreground/10">
                {/* Render plan chains */}
                {chains.map((chain, index) => {
                  // For typical users, skip the first chain (it's the hero)
                  if (isTypicalUser && index === 0) return null

                  const hasRefinements = chain.refinements.length > 0

                  return (
                    <div key={chain.root.id}>
                      {/* Latest version of this plan */}
                      <TrackedStrategyLink runId={chain.latest.id} status={chain.latest.status}>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            {getProductName(chain.latest.input)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-foreground/50">
                              {formatRelativeDate(chain.latest.created_at)}
                            </span>
                            {hasRefinements && (
                              <span className="text-xs text-foreground/40">
                                (refined {chain.refinements.length}x)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <StatusBadge status={chain.latest.status} />
                          <ArrowRight className="h-5 w-5 text-foreground/30 group-hover:text-cta transition-colors" />
                        </div>
                      </TrackedStrategyLink>

                      {/* Collapsible refinement history - shown muted */}
                      {hasRefinements && (
                        <details className="group/history">
                          <summary className="px-6 py-2 bg-surface/30 text-xs text-foreground/50 cursor-pointer hover:text-foreground/70 flex items-center gap-1 list-none">
                            <ChevronDown className="h-3 w-3 transition-transform group-open/history:rotate-180" />
                            View version history
                          </summary>
                          <div className="bg-surface/20 divide-y divide-foreground/5">
                            {/* Show older refinements (skip index 0 which is the latest shown above) */}
                            {chain.refinements.slice(1).map((ref) => (
                              <TrackedStrategyLink key={ref.id} runId={ref.id} status={ref.status} muted>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground/60">
                                    Refinement
                                  </p>
                                  <span className="text-xs text-foreground/40">
                                    {formatRelativeDate(ref.created_at)}
                                  </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-foreground/20 group-hover:text-foreground/40 transition-colors ml-4" />
                              </TrackedStrategyLink>
                            ))}
                            {/* Original plan */}
                            <TrackedStrategyLink runId={chain.root.id} status={chain.root.status} muted>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground/60">
                                  Original plan
                                </p>
                                <span className="text-xs text-foreground/40">
                                  {formatRelativeDate(chain.root.created_at)}
                                </span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-foreground/20 group-hover:text-foreground/40 transition-colors ml-4" />
                            </TrackedStrategyLink>
                          </div>
                        </details>
                      )}
                    </div>
                  )
                })}

                {/* Free audits - shown separately */}
                {freeAudits.map((audit) => (
                  <TrackedFreeAuditLink key={audit.id} auditId={audit.id} status={audit.status}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">
                          {getProductName(audit.input)}
                        </p>
                        <FreeBadge />
                      </div>
                      <p className="text-sm text-foreground/50 mt-1">
                        {formatRelativeDate(audit.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <StatusBadge status={audit.status} />
                      <ArrowRight className="h-5 w-5 text-foreground/30 group-hover:text-cta transition-colors" />
                    </div>
                  </TrackedFreeAuditLink>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {hasPlans && (
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
