"use client"

interface WeekThemeProps {
  weekNumber: number
  thesis: string | undefined
}

export function WeekTheme({ weekNumber, thesis }: WeekThemeProps) {
  if (!thesis) return null

  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md p-6"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      <span className="font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase block mb-2">
        Week {weekNumber} Theme
      </span>
      <p className="text-base font-semibold text-foreground leading-snug">
        {thesis}
      </p>
    </div>
  )
}
