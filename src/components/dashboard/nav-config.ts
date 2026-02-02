import { CalendarCheck, BarChart3, Fingerprint, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  icon: LucideIcon
  path: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'This Week', icon: CalendarCheck, path: '/dashboard' },
  { label: 'Insights', icon: BarChart3, path: '/dashboard/insights' },
  { label: 'Brand', icon: Fingerprint, path: '/dashboard/brand' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]
