"use client"

import { useState, useCallback } from "react"
import { X, Plus } from "lucide-react"
import type { BusinessProfile } from "@/lib/types/business-profile"
import {
  ProfileSection,
  FieldLabel,
  FieldValue,
  FieldGroup,
} from "./ProfileSection"

type SectionKey =
  | "basics"
  | "icp"
  | "voice"
  | "competitors"
  | "goals"
  | "tried"

interface ProfileClientProps {
  businessId: string
  businessName: string
  profile: BusinessProfile
}

export function ProfileClient({
  businessId,
  businessName,
  profile: initialProfile,
}: ProfileClientProps) {
  const [profile, setProfile] = useState<BusinessProfile>(initialProfile)
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState<Partial<BusinessProfile>>({})
  const [error, setError] = useState<string | null>(null)

  const startEditing = useCallback(
    (section: SectionKey) => {
      setEditingSection(section)
      // Populate draft with current values
      switch (section) {
        case "basics":
          setDraft({
            websiteUrl: profile.websiteUrl || "",
            description: profile.description || "",
            industry: profile.industry || "",
          })
          break
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
        case "goals":
          setDraft({
            goals: {
              primary: profile.goals?.primary || "",
              timeline: profile.goals?.timeline || "",
              budget: profile.goals?.budget || "",
            },
          })
          break
        case "tried":
          setDraft({ triedBefore: profile.triedBefore || "" })
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

    // Clean up empty list entries before saving
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

    // Optimistic update
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
    "w-full border-2 border-foreground/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
  const textareaClass = `${inputClass} min-h-[80px] resize-y`

  const isEmpty =
    !profile.websiteUrl &&
    !profile.description &&
    !profile.icp?.who &&
    !profile.voice?.tone &&
    !profile.competitors?.length &&
    !profile.goals?.primary &&
    !profile.triedBefore

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{businessName}</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Your business profile helps us create better recommendations.
        </p>
      </div>

      {isEmpty && (
        <div className="bg-cta/5 border-2 border-cta/20 rounded-md px-4 py-3 text-sm text-foreground/70">
          Tell us about your business to get better recommendations. Click the
          pencil icon on any section to get started.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Business Basics */}
      <ProfileSection
        title="Business Basics"
        isEditing={isEditing("basics")}
        onEdit={() => startEditing("basics")}
        onSave={saveSection}
        onCancel={cancelEditing}
        isSaving={isSaving}
        disabled={isDisabled("basics")}
      >
        {isEditing("basics") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Website URL</FieldLabel>
              <input
                className={inputClass}
                type="url"
                placeholder="https://example.com"
                value={(draft.websiteUrl as string) || ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, websiteUrl: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                className={textareaClass}
                placeholder="What does your business do?"
                value={(draft.description as string) || ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Industry</FieldLabel>
              <input
                className={inputClass}
                placeholder="e.g., SaaS, E-commerce, Agency"
                value={(draft.industry as string) || ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, industry: e.target.value }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FieldGroup>
              <FieldLabel>Website</FieldLabel>
              <FieldValue empty={!profile.websiteUrl}>
                {profile.websiteUrl}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Description</FieldLabel>
              <FieldValue empty={!profile.description}>
                {profile.description}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Industry</FieldLabel>
              <FieldValue empty={!profile.industry}>
                {profile.industry}
              </FieldValue>
            </FieldGroup>
          </div>
        )}
      </ProfileSection>

      {/* ICP */}
      <ProfileSection
        title="Your Customers"
        isEditing={isEditing("icp")}
        onEdit={() => startEditing("icp")}
        onSave={saveSection}
        onCancel={cancelEditing}
        isSaving={isSaving}
        disabled={isDisabled("icp")}
      >
        {isEditing("icp") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Who is your ideal customer?</FieldLabel>
              <textarea
                className={textareaClass}
                placeholder="Describe your ideal customer..."
                value={draft.icp?.who || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    icp: { ...d.icp!, who: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>What problem do you solve?</FieldLabel>
              <textarea
                className={textareaClass}
                placeholder="The main problem you solve for them..."
                value={draft.icp?.problem || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    icp: { ...d.icp!, problem: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>What do they do instead?</FieldLabel>
              <textarea
                className={textareaClass}
                placeholder="What alternatives exist?"
                value={draft.icp?.alternatives || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    icp: { ...d.icp!, alternatives: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FieldGroup>
              <FieldLabel>Ideal Customer</FieldLabel>
              <FieldValue empty={!profile.icp?.who}>
                {profile.icp?.who}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Problem You Solve</FieldLabel>
              <FieldValue empty={!profile.icp?.problem}>
                {profile.icp?.problem}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Alternatives</FieldLabel>
              <FieldValue empty={!profile.icp?.alternatives}>
                {profile.icp?.alternatives}
              </FieldValue>
            </FieldGroup>
          </div>
        )}
      </ProfileSection>

      {/* Brand Voice */}
      <ProfileSection
        title="Brand Voice"
        isEditing={isEditing("voice")}
        onEdit={() => startEditing("voice")}
        onSave={saveSection}
        onCancel={cancelEditing}
        isSaving={isSaving}
        disabled={isDisabled("voice")}
      >
        {isEditing("voice") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Tone</FieldLabel>
              <input
                className={inputClass}
                placeholder="e.g., direct and confident, friendly and approachable"
                value={draft.voice?.tone || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    voice: { ...d.voice!, tone: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>Examples of your copy</FieldLabel>
              <textarea
                className={textareaClass}
                placeholder="Paste some existing copy that represents your voice..."
                value={draft.voice?.examples || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    voice: { ...d.voice!, examples: e.target.value },
                  }))
                }
              />
            </div>
            <ListEditor
              label="Do's — always do this"
              items={draft.voice?.dos || []}
              placeholder="e.g., Always mention the free tier"
              onChange={(dos) =>
                setDraft((d) => ({ ...d, voice: { ...d.voice!, dos } }))
              }
            />
            <ListEditor
              label="Don'ts — never do this"
              items={draft.voice?.donts || []}
              placeholder="e.g., Never compare to X by name"
              onChange={(donts) =>
                setDraft((d) => ({ ...d, voice: { ...d.voice!, donts } }))
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            <FieldGroup>
              <FieldLabel>Tone</FieldLabel>
              <FieldValue empty={!profile.voice?.tone}>
                {profile.voice?.tone}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Examples</FieldLabel>
              <FieldValue empty={!profile.voice?.examples}>
                {profile.voice?.examples}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Do&apos;s</FieldLabel>
              {profile.voice?.dos?.length ? (
                <ul className="text-sm text-foreground space-y-1">
                  {profile.voice.dos.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-600">✓</span> {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <FieldValue empty />
              )}
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Don&apos;ts</FieldLabel>
              {profile.voice?.donts?.length ? (
                <ul className="text-sm text-foreground space-y-1">
                  {profile.voice.donts.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">✗</span> {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <FieldValue empty />
              )}
            </FieldGroup>
          </div>
        )}
      </ProfileSection>

      {/* Competitors */}
      <ProfileSection
        title="Competitors"
        isEditing={isEditing("competitors")}
        onEdit={() => startEditing("competitors")}
        onSave={saveSection}
        onCancel={cancelEditing}
        isSaving={isSaving}
        disabled={isDisabled("competitors")}
      >
        {isEditing("competitors") ? (
          <div className="space-y-3">
            {(draft.competitors || [""]).map((url, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className={inputClass}
                  type="url"
                  placeholder="https://competitor.com"
                  value={url}
                  onChange={(e) => {
                    const updated = [...(draft.competitors || [""])]
                    updated[i] = e.target.value
                    setDraft((d) => ({ ...d, competitors: updated }))
                  }}
                />
                {(draft.competitors || []).length > 1 && (
                  <button
                    onClick={() => {
                      const updated = (draft.competitors || []).filter(
                        (_, j) => j !== i
                      )
                      setDraft((d) => ({ ...d, competitors: updated }))
                    }}
                    className="text-foreground/30 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {(draft.competitors || []).length < 5 && (
              <button
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    competitors: [...(d.competitors || []), ""],
                  }))
                }
                className="text-sm text-foreground/50 hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add competitor
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {profile.competitors?.length ? (
              profile.competitors.map((url, i) => (
                <div key={i} className="text-sm text-foreground">
                  {url}
                </div>
              ))
            ) : (
              <FieldValue empty />
            )}
          </div>
        )}
      </ProfileSection>

      {/* Goals */}
      <ProfileSection
        title="Goals"
        isEditing={isEditing("goals")}
        onEdit={() => startEditing("goals")}
        onSave={saveSection}
        onCancel={cancelEditing}
        isSaving={isSaving}
        disabled={isDisabled("goals")}
      >
        {isEditing("goals") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Primary goal</FieldLabel>
              <input
                className={inputClass}
                placeholder="What's your #1 marketing goal right now?"
                value={draft.goals?.primary || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    goals: { ...d.goals!, primary: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>Timeline</FieldLabel>
              <input
                className={inputClass}
                placeholder="e.g., Next 3 months"
                value={draft.goals?.timeline || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    goals: { ...d.goals!, timeline: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>Budget</FieldLabel>
              <input
                className={inputClass}
                placeholder="Monthly marketing budget (optional)"
                value={draft.goals?.budget || ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    goals: { ...d.goals!, budget: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <FieldGroup>
              <FieldLabel>Primary Goal</FieldLabel>
              <FieldValue empty={!profile.goals?.primary}>
                {profile.goals?.primary}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Timeline</FieldLabel>
              <FieldValue empty={!profile.goals?.timeline}>
                {profile.goals?.timeline}
              </FieldValue>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Budget</FieldLabel>
              <FieldValue empty={!profile.goals?.budget}>
                {profile.goals?.budget}
              </FieldValue>
            </FieldGroup>
          </div>
        )}
      </ProfileSection>

      {/* What You've Tried */}
      <ProfileSection
        title="What You've Tried"
        isEditing={isEditing("tried")}
        onEdit={() => startEditing("tried")}
        onSave={saveSection}
        onCancel={cancelEditing}
        isSaving={isSaving}
        disabled={isDisabled("tried")}
      >
        {isEditing("tried") ? (
          <textarea
            className={textareaClass}
            placeholder="What marketing have you done so far? What worked, what didn't?"
            value={(draft.triedBefore as string) || ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, triedBefore: e.target.value }))
            }
          />
        ) : (
          <FieldGroup>
            <FieldValue empty={!profile.triedBefore}>
              {profile.triedBefore}
            </FieldValue>
          </FieldGroup>
        )}
      </ProfileSection>
    </div>
  )
}

// Reusable list editor for do's/don'ts
function ListEditor({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string
  items: string[]
  placeholder: string
  onChange: (items: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="w-full border-2 border-foreground/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-foreground/40 transition-colors"
            placeholder={placeholder}
            value={item}
            onChange={(e) => {
              const updated = [...items]
              updated[i] = e.target.value
              onChange(updated)
            }}
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-foreground/30 hover:text-red-500 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="text-sm text-foreground/50 hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
  )
}
