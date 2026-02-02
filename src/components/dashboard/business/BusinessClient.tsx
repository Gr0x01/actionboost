"use client"

import { useState, useCallback } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import type { BusinessProfile } from "@/lib/types/business-profile"
import {
  ProfileSection,
  FieldLabel,
  FieldValue,
  FieldGroup,
} from "../profile/ProfileSection"

type SectionKey = "basics" | "goals"

interface BusinessClientProps {
  businessId: string
  businessName: string
  profile: BusinessProfile
}

export function BusinessClient({
  businessId,
  businessName,
  profile: initialProfile,
}: BusinessClientProps) {
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
      const res = await fetch(`/api/business/${businessId}/business/suggest?save=true`, {
        method: "POST",
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg || "Failed to generate suggestions")
      }

      // Re-fetch fresh profile from server
      const profileRes = await fetch(`/api/business/${businessId}/profile`)
      if (profileRes.ok) {
        const { profile: fresh } = await profileRes.json()
        setProfile(fresh)
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
        case "basics":
          setDraft({
            websiteUrl: profile.websiteUrl || "",
            description: profile.description || "",
            industry: profile.industry || "",
          })
          break
        case "goals":
          setDraft({
            goals: {
              primary: profile.goals?.primary || "",
              budget: profile.goals?.budget || "",
            },
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
    const merged = { ...profile, ...draft }
    setProfile(merged)

    try {
      const res = await fetch(`/api/business/${businessId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
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
    isFilled:
      key === "basics"
        ? !!(profile.websiteUrl || profile.description || profile.industry)
        : !!(profile.goals?.primary),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{businessName}</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Your company, your industry, and what you&apos;re working toward.
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

      {/* Business Basics */}
      <ProfileSection
        title="Business Basics"
        emptyPrompt="Add your website, description, and industry."
        {...sectionProps("basics")}
      >
        {isEditing("basics") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Website URL</FieldLabel>
              <input
                className={inputClass}
                type="url"
                placeholder="https://yourbusiness.com"
                value={draft.websiteUrl || ""}
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
                value={draft.description || ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Industry</FieldLabel>
              <input
                className={inputClass}
                type="text"
                placeholder="e.g., SaaS, E-commerce, Consulting"
                value={draft.industry || ""}
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

      {/* Goals */}
      <ProfileSection
        title="Goals"
        emptyPrompt="What are you trying to achieve?"
        {...sectionProps("goals")}
      >
        {isEditing("goals") ? (
          <div className="space-y-4">
            <div>
              <FieldLabel>Primary goal</FieldLabel>
              <input
                className={inputClass}
                type="text"
                placeholder="e.g., Get more leads, Increase brand awareness"
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
              <FieldLabel>Budget</FieldLabel>
              <input
                className={inputClass}
                type="text"
                placeholder="e.g., $500/month, bootstrapped"
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
              <FieldLabel>Budget</FieldLabel>
              <FieldValue empty={!profile.goals?.budget}>
                {profile.goals?.budget}
              </FieldValue>
            </FieldGroup>
          </div>
        )}
      </ProfileSection>

    </div>
  )
}
