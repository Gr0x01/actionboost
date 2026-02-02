import { CalendarCheck, BarChart3, Fingerprint, Building2 } from 'lucide-react'
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
  { label: 'Business', icon: Building2, path: '/dashboard/business' },
]
