/**
 * Extract a flat task list from structured_output.
 *
 * Tasks live in `weeks[].days[]` (new format) or `thisWeek.days[]` (legacy).
 * This is the single source of truth for task extraction — used by
 * /api/tasks, /api/draft, and DraftIt.tsx so indices stay consistent.
 */

export interface ExtractedTask {
  title: string
  description: string
  track?: "sprint" | "build"
  why?: string
  how?: string
}

interface DayAction {
  day: number
  action: string
  timeEstimate: string
  successMetric: string
  why?: string
  how?: string
}

interface Week {
  week: number
  theme: string
  days: DayAction[]
}

export function extractTasksFromStructuredOutput(
  structuredOutput: Record<string, unknown> | null
): ExtractedTask[] {
  if (!structuredOutput) return []

  const weeks = structuredOutput.weeks as Week[] | undefined
  const thisWeekDays = (
    structuredOutput.thisWeek as { days: DayAction[] } | undefined
  )?.days

  const tasks: ExtractedTask[] = []

  if (Array.isArray(weeks) && weeks.length > 0) {
    for (const week of weeks) {
      for (const day of Array.isArray(week.days) ? week.days : []) {
        tasks.push({
          title: day.action ?? "",
          description: day.successMetric ?? "",
          why: day.why,
          how: day.how,
        })
      }
    }
  } else if (Array.isArray(thisWeekDays) && thisWeekDays.length > 0) {
    for (const day of thisWeekDays) {
      tasks.push({
        title: day.action ?? "",
        description: day.successMetric ?? "",
        why: day.why,
        how: day.how,
      })
    }
  } else if (Array.isArray(structuredOutput.tasks)) {
    // Subscription weekly format: flat tasks array with { title, track, ... }
    for (const t of structuredOutput.tasks as { title?: string; description?: string; track?: string; why?: string; how?: string }[]) {
      tasks.push({
        title: t.title ?? "",
        description: t.description ?? "",
        track: t.track === "build" ? "build" : "sprint",
        why: t.why,
        how: t.how,
      })
    }
  }

  return tasks
}
