/**
 * localStorage helpers for tracking run visits and tab preferences
 *
 * Storage key format: actionboost-visit-{runId}
 * Value format: { firstVisit: ISO string, lastTab: 'insights' | 'dashboard' }
 *
 * Used to determine:
 * - First visit → show Insights tab
 * - Return visit (>24h since first) → show Dashboard tab
 * - User preference persists on tab switch
 */

const STORAGE_PREFIX = 'actionboost-visit-'

export type TabType = 'insights' | 'dashboard'

interface VisitInfo {
  firstVisit: string | null
  lastTab: TabType | null
}

interface StoredVisitData {
  firstVisit: string
  lastTab?: TabType
}

/**
 * Get visit info for a run
 */
export function getRunVisitInfo(runId: string): VisitInfo {
  if (typeof window === 'undefined') {
    return { firstVisit: null, lastTab: null }
  }

  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${runId}`)
    if (!stored) {
      return { firstVisit: null, lastTab: null }
    }

    const parsed = JSON.parse(stored) as StoredVisitData

    // Validate the parsed data
    if (typeof parsed !== 'object' || parsed === null) {
      return { firstVisit: null, lastTab: null }
    }

    return {
      firstVisit: typeof parsed.firstVisit === 'string' ? parsed.firstVisit : null,
      lastTab: parsed.lastTab === 'insights' || parsed.lastTab === 'dashboard' ? parsed.lastTab : null,
    }
  } catch {
    return { firstVisit: null, lastTab: null }
  }
}

/**
 * Record a visit to a run (only records first visit)
 */
export function recordRunVisit(runId: string): void {
  if (typeof window === 'undefined') return

  try {
    const current = getRunVisitInfo(runId)

    // Only record first visit if not already recorded
    if (!current.firstVisit) {
      const data: StoredVisitData = {
        firstVisit: new Date().toISOString(),
        lastTab: current.lastTab ?? undefined,
      }
      localStorage.setItem(`${STORAGE_PREFIX}${runId}`, JSON.stringify(data))
    }
  } catch (err) {
    console.warn('[VisitTracking] Failed to record visit:', err)
  }
}

/**
 * Save tab preference for a run
 */
export function saveTabPreference(runId: string, tab: TabType): void {
  if (typeof window === 'undefined') return

  try {
    const current = getRunVisitInfo(runId)

    const data: StoredVisitData = {
      firstVisit: current.firstVisit ?? new Date().toISOString(),
      lastTab: tab,
    }
    localStorage.setItem(`${STORAGE_PREFIX}${runId}`, JSON.stringify(data))
  } catch (err) {
    console.warn('[VisitTracking] Failed to save tab preference:', err)
  }
}

/**
 * Determine the default tab based on visit history and URL params
 *
 * Priority:
 * 1. URL ?view= param overrides all
 * 2. new=1 in URL (from checkout) → Insights
 * 3. First visit (no localStorage record) → Insights
 * 4. Return visit (>24h since first) → Dashboard
 * 5. User preference persisted on tab switch
 */
export function getDefaultTab(
  runId: string,
  urlViewParam: string | null,
  isNewCheckout: boolean
): TabType {
  // 1. URL param overrides all
  if (urlViewParam === 'insights' || urlViewParam === 'dashboard') {
    return urlViewParam
  }

  // 2. New checkout → Insights
  if (isNewCheckout) {
    return 'insights'
  }

  const visitInfo = getRunVisitInfo(runId)

  // 3. First visit → Insights
  if (!visitInfo.firstVisit) {
    return 'insights'
  }

  // 5. User preference if set
  if (visitInfo.lastTab) {
    return visitInfo.lastTab
  }

  // 4. Return visit (>24h since first) → Dashboard
  const firstVisitDate = new Date(visitInfo.firstVisit)
  const hoursSinceFirst = (Date.now() - firstVisitDate.getTime()) / (1000 * 60 * 60)

  if (hoursSinceFirst > 24) {
    return 'dashboard'
  }

  // Default to insights for recent visits without preference
  return 'insights'
}
