"use client"

interface TaskCardProps {
  task: {
    index: number
    title: string
    description: string
    track: "sprint" | "build"
    completed: boolean
    completedAt: string | null
  }
  onToggle: (taskIndex: number, completed: boolean) => void
  onSelect: (taskIndex: number) => void
  isSelected?: boolean
}

export function TaskCard({ task, onToggle, onSelect, isSelected }: TaskCardProps) {
  return (
    <div
      className={`rounded-md border-2 transition-colors ${
        isSelected
          ? "border-cta/40 bg-cta/[0.03]"
          : task.completed
          ? "border-foreground/10 bg-foreground/[0.02]"
          : "border-foreground/15 bg-white hover:border-foreground/25"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox */}
        <button
          role="checkbox"
          aria-checked={task.completed}
          onClick={(e) => {
            e.stopPropagation()
            onToggle(task.index, !task.completed)
          }}
          className="mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer"
          style={{
            backgroundColor: task.completed ? "var(--cta)" : "transparent",
            borderColor: task.completed ? "var(--cta)" : "rgba(44,62,80,0.2)",
          }}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Title + track pill — clickable to open panel */}
        <button
          onClick={() => onSelect(task.index)}
          className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer"
        >
          <span
            className={`text-sm font-semibold leading-snug transition-colors ${
              task.completed ? "text-foreground/40 line-through" : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          <span
            className={`flex-shrink-0 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
              task.track === "sprint"
                ? "bg-cta/10 text-cta"
                : "bg-foreground/5 text-foreground/40"
            }`}
          >
            {task.track === "sprint" ? "Sprint" : "Build"}
          </span>
        </button>
      </div>
    </div>
  )
}
