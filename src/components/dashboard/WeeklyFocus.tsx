"use client"

import { useState, useEffect, useCallback } from "react"
import { TaskCheckbox } from "./TaskCheckbox"

interface Task {
  index: number
  title: string
  description: string
  track: "sprint" | "build"
  completed: boolean
  completedAt: string | null
}

interface WeeklyFocusProps {
  runId: string
}

export function WeeklyFocus({ runId }: WeeklyFocusProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tasks?runId=${runId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tasks")
        return res.json()
      })
      .then((data) => {
        setTasks(data.tasks || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [runId])

  const handleToggle = useCallback(async (taskIndex: number, completed: boolean) => {
    // Capture previous state inside updater to avoid stale closure
    let previousTasks: Task[] = []
    setTasks((prev) => {
      previousTasks = prev
      return prev.map((t) =>
        t.index === taskIndex
          ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null }
          : t
      )
    })

    const res = await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, taskIndex, completed }),
    })

    if (!res.ok) {
      setTasks(previousTasks)
    }
  }, [runId])

  const sprintTasks = tasks.filter((t) => t.track === "sprint")
  const buildTasks = tasks.filter((t) => t.track === "build")
  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md p-6"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">This week&apos;s focus</h2>
        {tasks.length > 0 && (
          <span className="font-mono text-xs text-foreground/40">
            {completedCount}/{tasks.length} done
          </span>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-foreground/5 rounded" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-foreground/50">
          No tasks extracted yet. Your strategy may still be processing.
        </p>
      ) : (
        <div className="space-y-6">
          {sprintTasks.length > 0 && (
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-cta uppercase mb-3 block">
                Sprint
              </span>
              <div className="space-y-2">
                {sprintTasks.map((task) => (
                  <TaskCheckbox
                    key={task.index}
                    task={task}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {buildTasks.length > 0 && (
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase mb-3 block">
                Build
              </span>
              <div className="space-y-2">
                {buildTasks.map((task) => (
                  <TaskCheckbox
                    key={task.index}
                    task={task}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
