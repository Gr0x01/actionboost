import type { ReactNode } from 'react'

export interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span className={`font-mono text-xs font-bold uppercase tracking-wider text-foreground/50 ${className}`}>
      {children}
    </span>
  )
}
