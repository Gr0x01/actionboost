"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { TaskCard } from "./TaskCard"
import { TaskDetailPanel } from "./TaskDetailPanel"

interface Task {
  index: number
  title: string
  description: string
  track: "sprint" | "build"
  completed: boolean
  completedAt: string | null
  note: string | null
  why: string | null
  how: string | null
}

interface WeeklyFocusProps {
  runId: string
  onPanelChange?: (open: boolean) => void
}

export interface DraftState {
  mode: "idle" | "picking" | "loading" | "done"
  draft: string | null
  error: string | null
}

export function WeeklyFocus({ runId, onPanelChange }: WeeklyFocusProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null)
  // Per-task draft cache: survives panel close/reopen
  const [drafts, setDrafts] = useState<Record<number, DraftState>>({})

  const getDraft = useCallback((taskIndex: number): DraftState => {
    return drafts[taskIndex] ?? { mode: "idle", draft: null, error: null }
  }, [drafts])

  const setDraft = useCallback((taskIndex: number, update: Partial<DraftState>) => {
    setDrafts((prev) => ({
      ...prev,
      [taskIndex]: { ...prev[taskIndex] ?? { mode: "idle", draft: null, error: null }, ...update },
    }))
  }, [])

  // Notify parent when panel opens/closes
  useEffect(() => {
    onPanelChange?.(selectedTaskIndex !== null)
  }, [selectedTaskIndex, onPanelChange])

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
    let previousTasks: Task[] = []
    setTasks((prev) => {
      previousTasks = prev
      return prev.map((t) =>
        t.index === taskIndex
          ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null }
          : t
      )
    })

    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, taskIndex, completed }),
      })

      if (!res.ok) {
        setTasks(previousTasks)
      }
    } catch {
      setTasks(previousTasks)
    }
  }, [runId])

  const selectedTask = selectedTaskIndex !== null
    ? tasks.find((t) => t.index === selectedTaskIndex) ?? null
    : null

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
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.index}
              task={task}
              onToggle={handleToggle}
              onSelect={(i) => setSelectedTaskIndex(i === selectedTaskIndex ? null : i)}
              isSelected={selectedTaskIndex === task.index}
            />
          ))}
        </div>
      )}

      {/* Task detail panel */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            runId={runId}
            onClose={() => setSelectedTaskIndex(null)}
            onToggle={handleToggle}
            draftState={getDraft(selectedTask.index)}
            onDraftChange={(update) => setDraft(selectedTask.index, update)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
