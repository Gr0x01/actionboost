"use client"

import { useState } from "react"

interface WeeklyCheckinProps {
  existingCheckin: {
    sentiment: string | null
    notes: string | null
  } | null
}

const SENTIMENTS = [
  { id: "great", label: "Great", emoji: "+" },
  { id: "okay", label: "Okay", emoji: "~" },
  { id: "rough", label: "Rough", emoji: "-" },
]

export function WeeklyCheckin({ existingCheckin }: WeeklyCheckinProps) {
  const [sentiment, setSentiment] = useState<string | null>(existingCheckin?.sentiment || null)
  const [notes, setNotes] = useState(existingCheckin?.notes || "")
  const [saved, setSaved] = useState(!!existingCheckin)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!sentiment) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment, notes: notes || undefined }),
      })

      if (res.ok) {
        setSaved(true)
      } else {
        setError("Failed to save check-in. Try again.")
      }
    } catch {
      setError("Connection error. Check your internet and try again.")
    } finally {
      setSaving(false)
    }
  }

  if (saved && !notes) {
    return (
      <div className="bg-foreground/[0.02] border border-foreground/10 rounded-md p-4 text-center">
        <p className="text-sm text-foreground/50">
          Check-in saved. Your next week&apos;s plan will factor this in.
        </p>
      </div>
    )
  }

  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md p-6"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      <h2 className="text-lg font-bold text-foreground mb-2">How&apos;s it going?</h2>
      <p className="text-sm text-foreground/50 mb-4">
        Your check-in shapes next week&apos;s focus.
      </p>

      {/* Sentiment selector */}
      <div className="flex gap-3 mb-4">
        {SENTIMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSentiment(s.id)}
            className={`flex-1 py-3 rounded-md text-sm font-semibold transition-all ${
              sentiment === s.id
                ? "bg-foreground text-white border-2 border-foreground"
                : "bg-foreground/5 text-foreground/60 border-2 border-transparent hover:border-foreground/20"
            }`}
          >
            <span className="font-mono mr-1">{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Optional notes */}
      <textarea
        placeholder="Anything specific? (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border-2 border-foreground/20 rounded-md text-sm
                   focus:border-cta focus:outline-none transition-colors resize-none mb-4"
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!sentiment || saving}
        className="text-sm font-semibold text-cta hover:text-cta/80 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Update check-in" : "Save check-in"}
      </button>
    </div>
  )
}
