import { CalendarCheck, BarChart3, User, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  icon: LucideIcon
  path: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'This Week', icon: CalendarCheck, path: '/dashboard' },
  { label: 'Insights', icon: BarChart3, path: '/dashboard/insights' },
  { label: 'Profile', icon: User, path: '/dashboard/profile' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]
