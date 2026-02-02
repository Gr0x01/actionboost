"use client"

import { useState, useCallback } from "react"
import { X, Plus, Sparkles, Loader2 } from "lucide-react"
import type { BusinessProfile } from "@/lib/types/business-profile"
import {
  ProfileSection,
  FieldLabel,
  FieldValue,
  FieldGroup,
} from "../profile/ProfileSection"

type SectionKey = "icp" | "voice" | "competitors"

interface BrandClientProps {
  businessId: string
  businessName: string
  profile: BusinessProfile
}

export function BrandClient({
  businessId,
  businessName,
  profile: initialProfile,
}: BrandClientProps) {
  const [profile, setProfile] = useState<BusinessProfile>(initialProfile)
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState<Partial<BusinessProfile>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSuggesting, setIsSuggesting] = useState(false)

  const suggestAll = useCallback(async () => {
    setIsSuggesting(true)
    setError(null)
    try {
      const res = await fetch(`/api/business/${businessId}/brand/suggest?save=true`, {
        method: "POST",
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg || "Failed to generate suggestions")
      }
      const { suggestion } = await res.json()

      // Re-fetch fresh profile from server (save already happened via ?save=true)
      const profileRes = await fetch(`/api/business/${businessId}/profile`)
      if (profileRes.ok) {
        const { profile: fresh } = await profileRes.json()
        setProfile(fresh)
      } else {
        // Fallback: apply suggestion locally
        setProfile((prev) => ({
          ...prev,
          ...(suggestion.icp ? { icp: suggestion.icp } : {}),
          ...(suggestion.voice ? { voice: suggestion.voice } : {}),
          ...(suggestion.competitors?.length ? { competitors: suggestion.competitors } : {}),
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSuggesting(false)
    }
  }, [businessId])

  const startEditing = useCallback(
    (section: SectionKey) => {
      setEditingSection(section)
      switch (section) {
        case "icp":
          setDraft({
            icp: {
              who: profile.icp?.who || "",
              problem: profile.icp?.problem || "",
              alternatives: profile.icp?.alternatives || "",
            },
          })
          break
        case "voice":
          setDraft({
            voice: {
              tone: profile.voice?.tone || "",
              examples: profile.voice?.examples || "",
              dos: profile.voice?.dos || [],
              donts: profile.voice?.donts || [],
            },
          })
          break
        case "competitors":
          setDraft({
            competitors: profile.competitors?.length
              ? [...profile.competitors]
              : [""],
          })
          break
      }
    },
    [profile]
  )

  const cancelEditing = useCallback(() => {
    setEditingSection(null)
    setDraft({})
  }, [])

  const saveSection = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    const prev = { ...profile }

    const cleanedDraft = { ...draft }
    if (cleanedDraft.competitors) {
      cleanedDraft.competitors = cleanedDraft.competitors.filter((u) => u.trim() !== "")
    }
    if (cleanedDraft.voice?.dos) {
      cleanedDraft.voice = { ...cleanedDraft.voice, dos: cleanedDraft.voice.dos.filter((d) => d.trim() !== "") }
    }
    if (cleanedDraft.voice?.donts) {
      cleanedDraft.voice = { ...cleanedDraft.voice, donts: cleanedDraft.voice.donts.filter((d) => d.trim() !== "") }
    }

    const merged = { ...profile, ...cleanedDraft }
    setProfile(merged)

    try {
      const res = await fetch(`/api/business/${businessId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedDraft),
      })
      if (!res.ok) throw new Error("Save failed")
      const { profile: saved } = await res.json()
      setProfile(saved)
      setEditingSection(null)
      setDraft({})
    } catch {
      setProfile(prev)
      setError("Failed to save. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [profile, draft, businessId])

  const isEditing = (s: SectionKey) => editingSection === s
  const isDisabled = (s: SectionKey) =>
    editingSection !== null && editingSection !== s

  const inputClass =
    "w-full px-3 py-2 text-sm border-2 border-foreground/10 rounded bg-foreground/[0.02] focus:border-foreground/30 focus:outline-none transition-colors"
  const textareaClass = `${inputClass} min-h-[80px] resize-y`

  const sectionProps = (key: SectionKey) => ({
    isEditing: isEditing(key),
    onEdit: () => startEditing(key),
    onSave: saveSection,
    onCancel: cancelEditing,
    isSaving,
    disabled: isDisabled(key),
    isFilled: key === "icp"
      ? !!(profile.icp?.who || profile.icp?.problem)
      : key === "voice"
        ? !!(profile.voice?.tone)
        : !!(profile.competitors?.length),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Who you serve, how you sound, and who you&apos;re up against.
          </p>
        </div>
        <button
          onClick={suggestAll}
          disabled={isSuggesting || editingSection !== null}
          className="text-xs font-mono uppercase tracking-wide text-foreground/50 hover:text-foreground border-2 border-foreground/15 hover:border-foreground/30 rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isSuggesting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isSuggesting ? "Thinking..." : "Fill with AI"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ICP */}
      <ProfileSection
        title="Your Customers"
        emptyPrompt="Who are you trying to reach?"
        {...sectionProps("icp")}
      >
        {isEditing("icp") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Who is your ideal customer?</FieldLabel>
              <textarea className={textareaClass} placeholder="Describe your ideal customer..."
                value={draft.icp?.who || ""}
                onChange={(e) => setDraft((d) => ({ ...d, icp: { ...d.icp!, who: e.target.value } }))}
              />
            </div>
            <div>
              <FieldLabel>What problem do you solve?</FieldLabel>
              <textarea className={textareaClass} placeholder="The main problem you solve for them..."
                value={draft.icp?.problem || ""}
                onChange={(e) => setDraft((d) => ({ ...d, icp: { ...d.icp!, problem: e.target.value } }))}
              />
            </div>
            <div>
              <FieldLabel>What do they do instead?</FieldLabel>
              <textarea className={textareaClass} placeholder="What alternatives exist?"
                value={draft.icp?.alternatives || ""}
                onChange={(e) => setDraft((d) => ({ ...d, icp: { ...d.icp!, alternatives: e.target.value } }))}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FieldGroup><FieldLabel>Ideal Customer</FieldLabel><FieldValue empty={!profile.icp?.who}>{profile.icp?.who}</FieldValue></FieldGroup>
            <FieldGroup><FieldLabel>Problem You Solve</FieldLabel><FieldValue empty={!profile.icp?.problem}>{profile.icp?.problem}</FieldValue></FieldGroup>
            <FieldGroup><FieldLabel>Alternatives</FieldLabel><FieldValue empty={!profile.icp?.alternatives}>{profile.icp?.alternatives}</FieldValue></FieldGroup>
          </div>
        )}
      </ProfileSection>

      {/* Brand Voice */}
      <ProfileSection
        title="Brand Voice"
        emptyPrompt="How should we sound when writing for you?"
        {...sectionProps("voice")}
      >
        {isEditing("voice") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Tone</FieldLabel>
              <input className={inputClass} placeholder="e.g., direct and confident, friendly and approachable"
                value={draft.voice?.tone || ""}
                onChange={(e) => setDraft((d) => ({ ...d, voice: { ...d.voice!, tone: e.target.value } }))}
              />
            </div>
            <div>
              <FieldLabel>Examples of your copy</FieldLabel>
              <textarea className={textareaClass} placeholder="Paste some existing copy that represents your voice..."
                value={draft.voice?.examples || ""}
                onChange={(e) => setDraft((d) => ({ ...d, voice: { ...d.voice!, examples: e.target.value } }))}
              />
            </div>
            <ListEditor label="Do's — always do this" items={draft.voice?.dos || []}
              placeholder="e.g., Always mention the free tier"
              onChange={(dos) => setDraft((d) => ({ ...d, voice: { ...d.voice!, dos } }))}
            />
            <ListEditor label="Don'ts — never do this" items={draft.voice?.donts || []}
              placeholder="e.g., Never compare to X by name"
              onChange={(donts) => setDraft((d) => ({ ...d, voice: { ...d.voice!, donts } }))}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <FieldGroup><FieldLabel>Tone</FieldLabel><FieldValue empty={!profile.voice?.tone}>{profile.voice?.tone}</FieldValue></FieldGroup>
            <FieldGroup><FieldLabel>Examples</FieldLabel><FieldValue empty={!profile.voice?.examples}>{profile.voice?.examples}</FieldValue></FieldGroup>
            <FieldGroup>
              <FieldLabel>Do&apos;s</FieldLabel>
              {profile.voice?.dos?.length ? (
                <ul className="text-sm text-foreground space-y-1 mt-0.5">
                  {profile.voice.dos.map((d, i) => (
                    <li key={i} className="flex gap-2"><span className="text-foreground/30">✓</span> {d}</li>
                  ))}
                </ul>
              ) : (<FieldValue empty />)}
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Don&apos;ts</FieldLabel>
              {profile.voice?.donts?.length ? (
                <ul className="text-sm text-foreground space-y-1 mt-0.5">
                  {profile.voice.donts.map((d, i) => (
                    <li key={i} className="flex gap-2"><span className="text-foreground/30">✗</span> {d}</li>
                  ))}
                </ul>
              ) : (<FieldValue empty />)}
            </FieldGroup>
          </div>
        )}
      </ProfileSection>

      {/* Competitors */}
      <ProfileSection
        title="Competitors"
        emptyPrompt="Who else is fighting for their attention?"
        {...sectionProps("competitors")}
      >
        {isEditing("competitors") ? (
          <div className="space-y-3">
            {(draft.competitors || [""]).map((url, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className={inputClass} type="url" placeholder="https://competitor.com" value={url}
                  onChange={(e) => {
                    const updated = [...(draft.competitors || [""])]
                    updated[i] = e.target.value
                    setDraft((d) => ({ ...d, competitors: updated }))
                  }}
                />
                {(draft.competitors || []).length > 1 && (
                  <button onClick={() => setDraft((d) => ({ ...d, competitors: (d.competitors || []).filter((_, j) => j !== i) }))}
                    className="text-foreground/30 hover:text-foreground transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {(draft.competitors || []).length < 5 && (
              <button onClick={() => setDraft((d) => ({ ...d, competitors: [...(d.competitors || []), ""] }))}
                className="text-xs font-mono uppercase tracking-wide text-foreground/40 hover:text-foreground flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add competitor
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {profile.competitors?.length ? (
              profile.competitors.map((url, i) => (
                <p key={i} className="text-sm font-medium text-foreground">{url}</p>
              ))
            ) : (<FieldValue empty />)}
          </div>
        )}
      </ProfileSection>
    </div>
  )
}

function ListEditor({ label, items, placeholder, onChange }: {
  label: string; items: string[]; placeholder: string; onChange: (items: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="w-full px-3 py-2 text-sm border-2 border-foreground/10 rounded bg-foreground/[0.02] focus:border-foreground/30 focus:outline-none transition-colors"
            placeholder={placeholder} value={item}
            onChange={(e) => { const u = [...items]; u[i] = e.target.value; onChange(u) }}
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-foreground/30 hover:text-foreground transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])}
        className="text-xs font-mono uppercase tracking-wide text-foreground/40 hover:text-foreground flex items-center gap-1 transition-colors">
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
  )
}
