export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_archived: boolean
          name: string
          opening_balance: number
          space_id: string
          type: Database["public"]["Enums"]["AccountType"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          name: string
          opening_balance?: number
          space_id: string
          type: Database["public"]["Enums"]["AccountType"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          name?: string
          opening_balance?: number
          space_id?: string
          type?: Database["public"]["Enums"]["AccountType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_action_drafts: {
        Row: {
          action_type: string
          confirmed_at: string | null
          created_at: string
          created_by: string
          executed_at: string | null
          id: string
          input: string
          payload: Json
          space_id: string
          status: Database["public"]["Enums"]["AiDraftStatus"]
          updated_at: string
        }
        Insert: {
          action_type: string
          confirmed_at?: string | null
          created_at?: string
          created_by: string
          executed_at?: string | null
          id?: string
          input: string
          payload: Json
          space_id: string
          status?: Database["public"]["Enums"]["AiDraftStatus"]
          updated_at?: string
        }
        Update: {
          action_type?: string
          confirmed_at?: string | null
          created_at?: string
          created_by?: string
          executed_at?: string | null
          id?: string
          input?: string
          payload?: Json
          space_id?: string
          status?: Database["public"]["Enums"]["AiDraftStatus"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_action_drafts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          id: string
          month: string
          space_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          id?: string
          month: string
          space_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          id?: string
          month?: string
          space_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          account_id: string
          created_at: string
          credit_limit: number
          id: string
          repayment_day: number
          space_id: string
          statement_day: number
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_limit: number
          id?: string
          repayment_day: number
          space_id: string
          statement_day: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_limit?: number
          id?: string
          repayment_day?: number
          space_id?: string
          statement_day?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_cards_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy: number
          id: string
          mood: number
          note: string | null
          space_id: string
          steps: number | null
          stress: number
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          date: string
          energy: number
          id?: string
          mood: number
          note?: string | null
          space_id: string
          steps?: number | null
          stress: number
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy?: number
          id?: string
          mood?: number
          note?: string | null
          space_id?: string
          steps?: number | null
          stress?: number
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_payments: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          from_account_id: string
          id: string
          kind: Database["public"]["Enums"]["DebtPaymentKind"]
          note: string | null
          paid_at: string
          space_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          from_account_id: string
          id?: string
          kind: Database["public"]["Enums"]["DebtPaymentKind"]
          note?: string | null
          paid_at?: string
          space_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          from_account_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["DebtPaymentKind"]
          note?: string | null
          paid_at?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["TransactionType"]
          name: string
          space_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["TransactionType"]
          name: string
          space_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["TransactionType"]
          name?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_categories_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          cadence: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          space_id: string
          target_value: number
          type: Database["public"]["Enums"]["HealthGoalType"]
          unit: string
          updated_at: string
        }
        Insert: {
          cadence: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          space_id: string
          target_value: number
          type: Database["public"]["Enums"]["HealthGoalType"]
          unit: string
          updated_at?: string
        }
        Update: {
          cadence?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          space_id?: string
          target_value?: number
          type?: Database["public"]["Enums"]["HealthGoalType"]
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_goals_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_notes: {
        Row: {
          content: string | null
          created_at: string
          external_ref: string | null
          id: string
          is_favorite: boolean
          source: string
          space_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          external_ref?: string | null
          id?: string
          is_favorite?: boolean
          source?: string
          space_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          external_ref?: string | null
          id?: string
          is_favorite?: boolean
          source?: string
          space_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_notes_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          space_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          space_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_tags_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          account_id: string
          annual_rate: number
          created_at: string
          id: string
          monthly_payment: number
          next_payment_at: string
          outstanding: number
          principal: number
          space_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          annual_rate: number
          created_at?: string
          id?: string
          monthly_payment: number
          next_payment_at: string
          outstanding: number
          principal: number
          space_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          annual_rate?: number
          created_at?: string
          id?: string
          monthly_payment?: number
          next_payment_at?: string
          outstanding?: number
          principal?: number
          space_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          note_id: string
          space_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          space_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          space_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tags_space_id_note_id_fkey"
            columns: ["space_id", "note_id"]
            isOneToOne: false
            referencedRelation: "knowledge_notes"
            referencedColumns: ["space_id", "id"]
          },
          {
            foreignKeyName: "note_tags_space_id_tag_id_fkey"
            columns: ["space_id", "tag_id"]
            isOneToOne: false
            referencedRelation: "knowledge_tags"
            referencedColumns: ["space_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          space_id: string
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          space_id: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          space_id?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_plans: {
        Row: {
          created_at: string
          id: string
          name: string
          planned_at: string | null
          priority: number
          space_id: string
          status: string
          target_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          planned_at?: string | null
          priority?: number
          space_id: string
          status?: string
          target_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          planned_at?: string | null
          priority?: number
          space_id?: string
          status?: string
          target_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_plans_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_expenses: {
        Row: {
          amount: number
          cadence: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          next_due_at: string
          space_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          cadence: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          next_due_at: string
          space_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          cadence?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          next_due_at?: string
          space_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_settings: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          id: string
          is_active: boolean
          last_received_at: string | null
          last_received_month: string | null
          pay_day: number
          space_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_received_at?: string | null
          last_received_month?: string | null
          pay_day: number
          space_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_received_at?: string | null
          last_received_month?: string | null
          pay_day?: number
          space_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_settings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: true
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          id: string
          name: string
          saved_amount: number
          space_id: string
          target_amount: number
          target_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          saved_amount?: number
          space_id: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          saved_amount?: number
          space_id?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_logs: {
        Row: {
          created_at: string
          id: string
          note: string | null
          quality: number | null
          sleep_at: string
          space_id: string
          wake_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          quality?: number | null
          sleep_at: string
          space_id: string
          wake_at: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          quality?: number | null
          sleep_at?: string
          space_id?: string
          wake_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_logs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["SpaceRole"]
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["SpaceRole"]
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["SpaceRole"]
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["SpaceKind"]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kind?: Database["public"]["Enums"]["SpaceKind"]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["SpaceKind"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          cadence: string
          created_at: string
          id: string
          name: string
          next_due_at: string
          space_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          cadence: string
          created_at?: string
          id?: string
          name: string
          next_due_at: string
          space_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          cadence?: string
          created_at?: string
          id?: string
          name?: string
          next_due_at?: string
          space_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_minutes: number | null
          area: Database["public"]["Enums"]["TaskArea"]
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          ended_at: string | null
          estimate_minutes: number | null
          id: string
          next_follow_up_at: string | null
          parent_id: string | null
          priority: Database["public"]["Enums"]["TaskPriority"]
          project_id: string | null
          recurrence_rule: Json | null
          scheduled_at: string | null
          space_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["TaskStatus"]
          tags: string[]
          title: string
          updated_at: string
          waiting_for: string | null
        }
        Insert: {
          actual_minutes?: number | null
          area?: Database["public"]["Enums"]["TaskArea"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          ended_at?: string | null
          estimate_minutes?: number | null
          id?: string
          next_follow_up_at?: string | null
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          project_id?: string | null
          recurrence_rule?: Json | null
          scheduled_at?: string | null
          space_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["TaskStatus"]
          tags?: string[]
          title: string
          updated_at?: string
          waiting_for?: string | null
        }
        Update: {
          actual_minutes?: number | null
          area?: Database["public"]["Enums"]["TaskArea"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          ended_at?: string | null
          estimate_minutes?: number | null
          id?: string
          next_follow_up_at?: string | null
          parent_id?: string | null
          priority?: Database["public"]["Enums"]["TaskPriority"]
          project_id?: string | null
          recurrence_rule?: Json | null
          scheduled_at?: string | null
          space_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["TaskStatus"]
          tags?: string[]
          title?: string
          updated_at?: string
          waiting_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          created_at: string
          id: string
          merchant: string | null
          note: string | null
          occurred_at: string
          space_id: string
          transfer_ref: string | null
          type: Database["public"]["Enums"]["TransactionType"]
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          merchant?: string | null
          note?: string | null
          occurred_at: string
          space_id: string
          transfer_ref?: string | null
          type: Database["public"]["Enums"]["TransactionType"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          merchant?: string | null
          note?: string | null
          occurred_at?: string
          space_id?: string
          transfer_ref?: string | null
          type?: Database["public"]["Enums"]["TransactionType"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          recorded_at: string
          space_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          recorded_at?: string
          space_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          recorded_at?: string
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          activity: string
          calories: number | null
          created_at: string
          duration_minutes: number
          feeling: number | null
          id: string
          intensity: number | null
          note: string | null
          space_id: string
          started_at: string
          steps: number | null
        }
        Insert: {
          activity: string
          calories?: number | null
          created_at?: string
          duration_minutes: number
          feeling?: number | null
          id?: string
          intensity?: number | null
          note?: string | null
          space_id: string
          started_at: string
          steps?: number | null
        }
        Update: {
          activity?: string
          calories?: number | null
          created_at?: string
          duration_minutes?: number
          feeling?: number | null
          id?: string
          intensity?: number | null
          note?: string | null
          space_id?: string
          started_at?: string
          steps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AccountType:
        | "CASH"
        | "CHECKING"
        | "SAVINGS"
        | "WECHAT"
        | "ALIPAY"
        | "CREDIT_CARD"
        | "LOAN"
        | "INVESTMENT"
        | "CUSTOM"
        | "OTHER"
      AiDraftStatus: "DRAFT" | "CONFIRMED" | "REJECTED" | "EXECUTED" | "FAILED"
      DebtPaymentKind: "CREDIT_CARD" | "LOAN"
      HealthGoalType:
        | "SLEEP"
        | "WATER"
        | "WORKOUT"
        | "ENERGY"
        | "MOOD"
        | "STRESS"
        | "CUSTOM"
      SpaceKind: "PERSONAL" | "FAMILY"
      SpaceRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
      TaskArea: "WORK" | "LIFE"
      TaskPriority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      TaskStatus:
        | "INBOX"
        | "PLANNED"
        | "TODO"
        | "IN_PROGRESS"
        | "WAITING"
        | "COMPLETED"
        | "CANCELLED"
      TransactionType: "INCOME" | "EXPENSE" | "TRANSFER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AccountType: [
        "CASH",
        "CHECKING",
        "SAVINGS",
        "WECHAT",
        "ALIPAY",
        "CREDIT_CARD",
        "LOAN",
        "INVESTMENT",
        "CUSTOM",
        "OTHER",
      ],
      AiDraftStatus: ["DRAFT", "CONFIRMED", "REJECTED", "EXECUTED", "FAILED"],
      DebtPaymentKind: ["CREDIT_CARD", "LOAN"],
      HealthGoalType: [
        "SLEEP",
        "WATER",
        "WORKOUT",
        "ENERGY",
        "MOOD",
        "STRESS",
        "CUSTOM",
      ],
      SpaceKind: ["PERSONAL", "FAMILY"],
      SpaceRole: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      TaskArea: ["WORK", "LIFE"],
      TaskPriority: ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"],
      TaskStatus: [
        "INBOX",
        "PLANNED",
        "TODO",
        "IN_PROGRESS",
        "WAITING",
        "COMPLETED",
        "CANCELLED",
      ],
      TransactionType: ["INCOME", "EXPENSE", "TRANSFER"],
    },
  },
} as const

