/**
 * User context types for multi-run accumulation
 *
 * Context accumulates across runs, storing:
 * - Product information (description, URL, competitors)
 * - Traction history over time
 * - Tactics tried, what worked, what didn't
 * - Constraints and preferences
 */

// Stored in users.context JSONB column
export interface UserContext {
  product?: {
    description: string
    websiteUrl?: string
    competitors?: string[]
  }
  traction?: {
    latest: string
    history: TractionSnapshot[]
  }
  tactics?: {
    history: string[] // Combined: what user tried + results, one entry per run
    // Legacy fields for backwards compatibility
    tried?: string[]
    working?: string[]
    notWorking?: string[]
  }
  constraints?: string
  lastRunId?: string
  totalRuns?: number
}

export interface TractionSnapshot {
  date: string  // ISO date string (YYYY-MM-DD)
  summary: string
}

// For conversational updates ("What's changed since last time?")
export interface ContextDelta {
  product?: {
    description?: string
    websiteUrl?: string
    competitors?: string[]
  }
  tractionDelta?: string
  tacticsUpdate?: string // New combined field
  // Legacy fields
  newTactics?: string[]
  workingUpdate?: string
  notWorkingUpdate?: string
  constraints?: string
  incrementRuns?: boolean
}

// For vector search results
export interface ContextSearchResult {
  content: string
  source: {
    type: 'run_input' | 'run_output' | 'delta_update'
    runId?: string
    date: string
  }
  similarity: number
}

// API response for GET /api/user/context
export interface UserContextResponse {
  context: UserContext
  lastUpdated: string | null
  suggestedQuestions: string[]
}

// Business summary for UI display (business selector)
export interface BusinessSummary {
  id: string
  name: string
  totalRuns: number
  lastRunDate: string | null
  productDescription: string | null
}

// Helper to check if user has meaningful context
export function hasUserContext(context: UserContext | null | undefined): boolean {
  if (!context) return false
  return !!(
    context.product?.description ||
    context.traction?.latest ||
    context.totalRuns && context.totalRuns > 0
  )
}

// Helper to generate suggested questions based on context
export function getSuggestedQuestions(context: UserContext): string[] {
  const questions: string[] = []

  if (context.traction?.latest) {
    questions.push("Has your traction changed since last time?")
  }

  if (context.tactics?.history && context.tactics.history.length > 0) {
    questions.push("Any updates on what's working or not?")
  } else if (context.tactics?.tried && context.tactics.tried.length > 0) {
    // Legacy support
    questions.push("Any updates on what's working or not?")
  }

  if (context.constraints) {
    questions.push("Have your constraints changed?")
  }

  // Default questions if nothing specific
  if (questions.length === 0) {
    questions.push("What's changed since your last strategy?")
    questions.push("Any new wins or learnings to share?")
  }

  return questions.slice(0, 3) // Max 3 questions
}
