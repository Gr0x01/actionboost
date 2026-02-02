"use client"

import { Pencil, Loader2 } from "lucide-react"

interface ProfileSectionProps {
  title: string
  children: React.ReactNode
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  disabled?: boolean // another section is being edited
}

export function ProfileSection({
  title,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  disabled,
}: ProfileSectionProps) {
  return (
    <div
      className="bg-white border-2 border-foreground/20 rounded-md p-6"
      style={{ boxShadow: "4px 4px 0 rgba(44, 62, 80, 0.1)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {!isEditing && (
          <button
            onClick={onEdit}
            disabled={disabled}
            className="text-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {children}

      {isEditing && (
        <div className="flex gap-3 mt-6 pt-4 border-t border-foreground/10">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="bg-cta text-white font-bold px-4 py-2 rounded-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 transition-all duration-100 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="text-foreground/50 hover:text-foreground font-medium px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// Helpers for consistent field rendering
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-mono uppercase tracking-wide text-foreground/40">
      {children}
    </span>
  )
}

export function FieldValue({ children, empty }: { children?: React.ReactNode; empty?: boolean }) {
  if (empty || !children) {
    return <span className="text-foreground/30 italic text-sm">Not set</span>
  }
  return <span className="text-sm text-foreground">{children}</span>
}

export function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>
}
