"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Check } from "lucide-react"

const CONTENT_TYPES = [
  { id: "tweet", label: "Tweet" },
  { id: "reddit_post", label: "Reddit" },
  { id: "linkedin_post", label: "LinkedIn" },
  { id: "email", label: "Email" },
  { id: "dm", label: "DM" },
  { id: "blog_outline", label: "Blog outline" },
]

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

import type { DraftState } from "./WeeklyFocus"

interface TaskDetailPanelProps {
  task: Task
  runId: string
  onClose: () => void
  onToggle: (taskIndex: number, completed: boolean) => void
  draftState: DraftState
  onDraftChange: (update: Partial<DraftState>) => void
}

export function TaskDetailPanel({ task, runId, onClose, onToggle, draftState, onDraftChange }: TaskDetailPanelProps) {
  const [notes, setNotes] = useState(task.note || "")
  const [notesSaveStatus, setNotesSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [copied, setCopied] = useState(false)

  const draftMode = draftState.mode
  const draft = draftState.draft
  const draftError = draftState.error

  // Reset notes when task changes
  useEffect(() => {
    setNotes(task.note || "")
    setNotesSaveStatus("idle")
  }, [task.index, task.note])

  const handleNotesBlur = async () => {
    if (notes === (task.note || "")) return
    setNotesSaveStatus("saving")
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, taskIndex: task.index, note: notes, completed: task.completed }),
      })
      if (res.ok) {
        setNotesSaveStatus("saved")
        setTimeout(() => setNotesSaveStatus("idle"), 2000)
      } else {
        setNotesSaveStatus("idle")
      }
    } catch {
      setNotesSaveStatus("idle")
    }
  }

  const handleDraft = async (contentType: string) => {
    onDraftChange({ mode: "loading", draft: null, error: null })
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, taskIndex: task.index, contentType }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate draft")
      }
      const data = await res.json()
      onDraftChange({ mode: "done", draft: data.draft, error: null })
    } catch (err) {
      onDraftChange({ mode: "idle", error: err instanceof Error ? err.message : "Something went wrong" })
    }
  }

  const handleCopy = () => {
    if (!draft) return
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const completedDate = task.completedAt ? (() => {
    const d = new Date(task.completedAt)
    return isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })() : null

  const panelContent = (
    <>
      {/* Header: checkbox + title + close */}
      <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-foreground/10">
        <div className="flex items-start gap-3">
          {/* Completion checkbox */}
          <button
            onClick={() => onToggle(task.index, !task.completed)}
            className={`
              mt-0.5 w-6 h-6 rounded-md border-2 flex-shrink-0
              flex items-center justify-center
              transition-all duration-150
              ${task.completed
                ? "bg-cta border-cta"
                : "border-foreground/25 hover:border-cta/60 active:scale-90"
              }
            `}
          >
            {task.completed && (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
          </button>

          {/* Title + track */}
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-bold leading-tight ${task.completed ? "text-foreground/40 line-through decoration-2" : "text-foreground"}`}>
              {task.title}
            </h2>
            {task.completed && completedDate && (
              <span className="text-xs text-foreground/40 mt-0.5 block">
                Done {completedDate}
              </span>
            )}
            {!task.completed && (
              <span className={`text-[10px] font-semibold uppercase tracking-widest mt-1 inline-block ${
                task.track === "sprint" ? "text-cta/60" : "text-foreground/30"
              }`}>
                {task.track === "sprint" ? "Sprint" : "Build"}
              </span>
            )}
          </div>

          {/* Close - ghost button, no border */}
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-md hover:bg-foreground/5 active:bg-foreground/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-foreground/40" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">
        {/* WHY section */}
        {task.why && (
          <div className="bg-amber-50/60 rounded-lg px-4 py-3 border border-amber-200/40">
            <label className="text-[11px] font-bold uppercase tracking-wide text-amber-700/60 mb-1.5 block">
              Why
            </label>
            <p className="text-sm text-foreground/75 leading-relaxed">
              {task.why}
            </p>
          </div>
        )}

        {/* HOW section */}
        {task.how && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-foreground/40 mb-1.5 block">
              How
            </label>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {task.how}
            </p>
          </div>
        )}

        {/* Success metric */}
        {task.description && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-foreground/40 mb-1.5 block">
              Success looks like
            </label>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-foreground/40 mb-1.5 block">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Jot down anything helpful..."
            maxLength={1000}
            rows={3}
            className="
              w-full px-3 py-2.5
              text-sm
              border-2 border-foreground/12 rounded-lg
              bg-foreground/[0.02]
              placeholder:text-foreground/30
              focus:outline-none focus:border-cta focus:bg-white
              resize-none
              transition-all
            "
          />
          <div className="mt-1 flex items-center justify-between h-4">
            <div className="text-xs font-medium">
              {notesSaveStatus === "saving" && (
                <span className="text-foreground/40">Saving...</span>
              )}
              {notesSaveStatus === "saved" && (
                <span className="text-cta font-semibold">Saved</span>
              )}
            </div>
            {notes.length > 0 && (
              <span className="text-[10px] text-foreground/30">
                {notes.length}/1000
              </span>
            )}
          </div>
        </div>

        {/* Quick draft - chips always visible */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-foreground/40 mb-2 block">
            Quick draft
          </label>

          {(draftMode === "idle" || draftMode === "picking") && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleDraft(type.id)}
                    className="
                      text-xs font-medium px-3 py-1.5
                      border-2 border-foreground/12 rounded-lg
                      text-foreground/50
                      hover:border-foreground/25 hover:text-foreground/80 hover:bg-foreground/[0.02]
                      active:scale-95
                      transition-all
                    "
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {draftError && (
                <p className="text-xs text-red-600 mt-1.5">{draftError}</p>
              )}
            </>
          )}

          {draftMode === "loading" && (
            <div className="flex items-center gap-2 py-3">
              <div className="w-4 h-4 border-2 border-cta/30 border-t-cta rounded-full animate-spin" />
              <span className="text-xs text-foreground/40">Drafting...</span>
            </div>
          )}

          {draftMode === "done" && draft && (
            <div className="mt-1">
              <div className="p-3 bg-foreground/[0.03] border-2 border-foreground/8 rounded-lg">
                <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {draft}
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-cta hover:text-cta/80 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => onDraftChange({ mode: "idle", draft: null, error: null })}
                  className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  Try another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom safe area for mobile */}
        <div className="h-4 lg:h-0" />
      </div>
    </>
  )

  return (
    <>
      {/* Mobile: light backdrop (below lg) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 top-14 bg-black/10 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Desktop: slide-over from right, below navbar, no backdrop */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="
          hidden lg:block
          fixed top-14 right-0 bottom-0
          w-full max-w-md
          bg-white border-l-2 border-foreground/20
          z-40
          overflow-y-auto
        "
        style={{ boxShadow: "-4px 0 16px rgba(44, 62, 80, 0.08)" }}
      >
        {panelContent}
      </motion.div>

      {/* Mobile: bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="
          lg:hidden
          fixed bottom-0 left-0 right-0
          bg-white
          rounded-t-2xl
          z-50
          max-h-[85vh]
          overflow-y-auto
        "
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.1)" }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 bg-white pt-2 pb-1 z-10">
          <div className="w-12 h-1 bg-foreground/20 rounded-full mx-auto" />
        </div>
        {panelContent}
      </motion.div>
    </>
  )
}
