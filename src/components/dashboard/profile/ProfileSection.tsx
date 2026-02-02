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
  disabled?: boolean
  isFilled: boolean
  emptyPrompt?: string
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
  isFilled,
  emptyPrompt,
}: ProfileSectionProps) {
  return (
    <div
      className={`
        bg-white rounded-md transition-all
        ${isEditing
          ? "border-2 border-foreground/30 ring-1 ring-foreground/5"
          : "border-2 border-foreground/20"
        }
      `}
      style={{
        boxShadow: isEditing
          ? "5px 5px 0 rgba(44, 62, 80, 0.12)"
          : "4px 4px 0 rgba(44, 62, 80, 0.1)",
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-foreground">{title}</h3>
          {!isEditing && (
            <button
              onClick={onEdit}
              disabled={disabled}
              className="text-xs font-mono uppercase tracking-wide text-foreground/40 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        {/* Empty state */}
        {!isEditing && !isFilled && emptyPrompt && (
          <div className="py-2">
            <p className="text-sm text-foreground/40 italic">{emptyPrompt}</p>
          </div>
        )}

        {/* Content */}
        {(isEditing || isFilled) && children}

        {/* Save / Cancel */}
        {isEditing && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-foreground/10">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-cta text-white text-xs font-bold font-mono uppercase tracking-wide px-4 py-2 rounded border-b-2 border-b-[#B85D10] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0 transition-all duration-100 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="text-foreground/50 hover:text-foreground text-xs font-mono uppercase tracking-wide px-4 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-mono uppercase tracking-wide text-foreground/40">
      {children}
    </span>
  )
}

export function FieldValue({ children, empty }: { children?: React.ReactNode; empty?: boolean }) {
  if (empty || !children) {
    return <span className="text-foreground/30 italic text-sm">—</span>
  }
  return <p className="text-sm font-medium text-foreground mt-0.5">{children}</p>
}

export function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5">{children}</div>
}
