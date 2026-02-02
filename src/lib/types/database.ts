export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      examples: {
        Row: {
          id: string
          slug: string
          industry: string
          stage: string
          insight: string
          content: string
          metadata: Json | null
          structured_output: Json | null
          is_live: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          industry: string
          stage: string
          insight: string
          content: string
          metadata?: Json | null
          structured_output?: Json | null
          is_live?: boolean
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          industry?: string
          stage?: string
          insight?: string
          content?: string
          metadata?: Json | null
          structured_output?: Json | null
          is_live?: boolean
          published_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          context: Json | null
          context_updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          context?: Json | null
          context_updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          context?: Json | null
          context_updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      free_audits: {
        Row: {
          id: string
          email: string
          user_id: string | null
          business_id: string | null
          input: Json
          output: string | null
          structured_output: Json | null
          status: string
          source: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          user_id?: string | null
          business_id?: string | null
          input: Json
          output?: string | null
          structured_output?: Json | null
          status?: string
          source?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          user_id?: string | null
          business_id?: string | null
          input?: Json
          output?: string | null
          structured_output?: Json | null
          status?: string
          source?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "free_audits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "free_audits_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      codes: {
        Row: {
          code: string
          created_at: string | null
          credits: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          credits?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      run_credits: {
        Row: {
          created_at: string | null
          credits: number
          id: string
          source: string | null
          stripe_checkout_session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits: number
          id?: string
          source?: string | null
          stripe_checkout_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          id?: string
          source?: string | null
          stripe_checkout_session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          additional_context: string | null
          attachments: Json | null
          business_id: string | null
          completed_at: string | null
          created_at: string | null
          feedback_email_sent: string | null
          id: string
          input: Json
          output: string | null
          parent_run_id: string | null
          plan_start_date: string | null
          refinements_used: number | null
          research_data: Json | null
          share_slug: string | null
          source: string | null
          stage: string | null
          status: string | null
          stripe_session_id: string | null
          structured_output: Json | null
          subscription_id: string | null
          task_schedule: Json | null
          thesis: string | null
          user_id: string | null
          week_number: number | null
          parent_plan_id: string | null
        }
        Insert: {
          additional_context?: string | null
          attachments?: Json | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          feedback_email_sent?: string | null
          id?: string
          input: Json
          output?: string | null
          parent_run_id?: string | null
          plan_start_date?: string | null
          refinements_used?: number | null
          research_data?: Json | null
          share_slug?: string | null
          source?: string | null
          stage?: string | null
          status?: string | null
          stripe_session_id?: string | null
          structured_output?: Json | null
          subscription_id?: string | null
          task_schedule?: Json | null
          thesis?: string | null
          user_id?: string | null
          week_number?: number | null
          parent_plan_id?: string | null
        }
        Update: {
          additional_context?: string | null
          attachments?: Json | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          feedback_email_sent?: string | null
          id?: string
          input?: Json
          output?: string | null
          parent_run_id?: string | null
          parent_plan_id?: string | null
          plan_start_date?: string | null
          refinements_used?: number | null
          research_data?: Json | null
          share_slug?: string | null
          source?: string | null
          stage?: string | null
          status?: string | null
          stripe_session_id?: string | null
          structured_output?: Json | null
          subscription_id?: string | null
          task_schedule?: Json | null
          thesis?: string | null
          user_id?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_context_chunks: {
        Row: {
          business_id: string | null
          chunk_type: string
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          chunk_type: string
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          chunk_type?: string
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_context_chunks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_context_chunks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          context: Json | null
          context_updated_at: string | null
          created_at: string | null
          credits_used: number
          email: string
          id: string
        }
        Insert: {
          auth_id?: string | null
          context?: Json | null
          context_updated_at?: string | null
          created_at?: string | null
          credits_used?: number
          email: string
          id?: string
        }
        Update: {
          auth_id?: string | null
          context?: Json | null
          context_updated_at?: string | null
          created_at?: string | null
          credits_used?: number
          email?: string
          id?: string
        }
        Relationships: []
      }
      free_tool_results: {
        Row: {
          id: string
          slug: string
          url: string | null
          email: string
          business_description: string | null
          output: Json | null
          status: string
          created_at: string
          completed_at: string | null
          tool_type: string
          input: Json | null
        }
        Insert: {
          id?: string
          slug: string
          url?: string | null
          email: string
          business_description?: string | null
          output?: Json | null
          status?: string
          created_at?: string
          completed_at?: string | null
          tool_type: string
          input?: Json | null
        }
        Update: {
          id?: string
          slug?: string
          url?: string | null
          email?: string
          business_description?: string | null
          output?: Json | null
          status?: string
          created_at?: string
          completed_at?: string | null
          tool_type?: string
          input?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          business_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          current_week: number
          original_run_id: string | null
          cancel_at_period_end: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          current_week?: number
          original_run_id?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          current_week?: number
          original_run_id?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_original_run_id_fkey"
            columns: ["original_run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          id: string
          run_id: string
          task_index: number
          track: string
          completed: boolean
          completed_at: string | null
          note: string | null
          outcome: string | null
          created_at: string
        }
        Insert: {
          id?: string
          run_id: string
          task_index: number
          track?: string
          completed?: boolean
          completed_at?: string | null
          note?: string | null
          outcome?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          run_id?: string
          task_index?: number
          track?: string
          completed?: boolean
          completed_at?: string | null
          note?: string | null
          outcome?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_checkins: {
        Row: {
          id: string
          subscription_id: string
          week_number: number
          sentiment: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          week_number: number
          sentiment?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          week_number?: number
          sentiment?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checkins_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

// Convenience aliases
export type User = Tables<"users">
export type Business = Tables<"businesses">
export type Run = Tables<"runs">
export type RunCredit = Tables<"run_credits">
export type Code = Tables<"codes">
export type UserContextChunk = Tables<"user_context_chunks">
export type Waitlist = Tables<"waitlist">
export type FreeAudit = Tables<"free_audits">

// Example type for /in-action curated showcases
export type Example = Tables<"examples">
export type SubscriptionRow = Tables<"subscriptions">
export type TaskCompletion = Tables<"task_completions">
export type WeeklyCheckin = Tables<"weekly_checkins">

export type RunStatus = "pending" | "processing" | "complete" | "failed"
export type PipelineStage = "researching" | "loading_history" | "generating" | "finalizing"
export type CreditSource = "stripe" | "code" | "manual"
export type RunSource = "stripe" | "credits" | "promo" | "refinement"
export type ChunkType = "product" | "traction" | "tactic" | "insight" | "recommendation"
export type SourceType = "run_input" | "run_output" | "delta_update"

// File attachment metadata (stored in runs.attachments JSONB)
export type Attachment = {
  path: string      // Storage path: user_id/run_id/filename
  type: string      // MIME type: image/png, application/pdf, etc.
  name: string      // Original filename
  size?: number     // File size in bytes
}

// Refinement constants
export const MAX_FREE_REFINEMENTS = 2
export const MIN_CONTEXT_LENGTH = 10
export const MAX_CONTEXT_LENGTH = 10000 // ~2000 words - enough for real updates, discourages AI dumps
