"use client"

import { useState } from "react"

interface DraftItProps {
  runId: string
  structuredOutput: Record<string, unknown> | null
}

const CONTENT_TYPES = [
  { id: "reddit_post", label: "Reddit post" },
  { id: "tweet", label: "Tweet" },
  { id: "linkedin_post", label: "LinkedIn post" },
  { id: "email", label: "Outreach email" },
  { id: "dm", label: "DM" },
  { id: "blog_outline", label: "Blog outline" },
]

export function DraftIt({ runId, structuredOutput }: DraftItProps) {
  const [selectedTask, setSelectedTask] = useState<number>(0)
  const [selectedType, setSelectedType] = useState<string>("tweet")
  const [draft, setDraft] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tasks = (structuredOutput?.tasks as Array<{ title: string; description: string }>) || []

  const handleDraft = async () => {
    setLoading(true)
    setError(null)
    setDraft(null)

    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          taskIndex: selectedTask,
          contentType: selectedType,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate draft")
      }

      const data = await res.json()
      setDraft(data.draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md p-6"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      <h2 className="text-lg font-bold text-foreground mb-4">Draft it</h2>

      {tasks.length === 0 ? (
        <p className="text-sm text-foreground/50">
          Tasks will appear here once your strategy is ready.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Task selector */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase mb-2">
              For this task
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-foreground/20 rounded-md text-sm
                         focus:border-cta focus:outline-none"
            >
              {tasks.map((task, i) => (
                <option key={i} value={i}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Content type chips */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase mb-2">
              Draft a
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedType === type.id
                      ? "bg-foreground text-white"
                      : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleDraft}
            disabled={loading}
            className="bg-cta text-white font-semibold px-5 py-2.5 rounded-md text-sm
                       border-b-3 border-b-[#B85D10]
                       hover:-translate-y-0.5 hover:shadow-lg
                       active:translate-y-0.5 active:border-b-0
                       transition-all duration-100
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Drafting..." : "Draft it"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Draft output */}
          {draft && (
            <div className="mt-4 p-4 bg-foreground/[0.02] border border-foreground/10 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] tracking-[0.25em] text-foreground/40 uppercase">
                  Draft
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(draft)}
                  className="text-xs text-cta hover:text-cta/80 font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {draft}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
