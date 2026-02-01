"use client"

interface TaskCheckboxProps {
  task: {
    index: number
    title: string
    description: string
    completed: boolean
  }
  onToggle: (taskIndex: number, completed: boolean) => void
}

export function TaskCheckbox({ task, onToggle }: TaskCheckboxProps) {
  return (
    <button
      onClick={() => onToggle(task.index, !task.completed)}
      className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-foreground/[0.02] transition-colors text-left group"
    >
      {/* Checkbox */}
      <div
        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed
            ? "bg-cta border-cta"
            : "border-foreground/20 group-hover:border-foreground/40"
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-snug transition-colors ${
            task.completed ? "text-foreground/40 line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </button>
  )
}
