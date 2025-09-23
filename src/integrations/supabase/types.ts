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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_events: {
        Row: {
          admin_id: string
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          location_details: string | null
          preferred_dates: Json | null
          professional_id: string | null
          professional_notes: string | null
          professional_quote: number | null
          selected_items: Json | null
          service_id: string
          special_requirements: string | null
          status: string | null
          title: string
          total_estimated_price: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          location_details?: string | null
          preferred_dates?: Json | null
          professional_id?: string | null
          professional_notes?: string | null
          professional_quote?: number | null
          selected_items?: Json | null
          service_id: string
          special_requirements?: string | null
          status?: string | null
          title: string
          total_estimated_price?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          location_details?: string | null
          preferred_dates?: Json | null
          professional_id?: string | null
          professional_notes?: string | null
          professional_quote?: number | null
          selected_items?: Json | null
          service_id?: string
          special_requirements?: string | null
          status?: string | null
          title?: string
          total_estimated_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          budget_range: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          general_answers: Json | null
          id: string
          micro_q_answers: Json | null
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          general_answers?: Json | null
          id?: string
          micro_q_answers?: Json | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          general_answers?: Json | null
          id?: string
          micro_q_answers?: Json | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          agreed_amount: number
          client_id: string
          created_at: string
          end_at: string | null
          escrow_status: string
          id: string
          job_id: string
          start_at: string | null
          tasker_id: string
          type: string
          updated_at: string
        }
        Insert: {
          agreed_amount: number
          client_id: string
          created_at?: string
          end_at?: string | null
          escrow_status?: string
          id?: string
          job_id: string
          start_at?: string | null
          tasker_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          agreed_amount?: number
          client_id?: string
          created_at?: string
          end_at?: string | null
          escrow_status?: string
          id?: string
          job_id?: string
          start_at?: string | null
          tasker_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversion_analytics: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          session_id: string
          step_number: number | null
          timestamp: string
          user_id: string | null
          variant: string | null
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          session_id: string
          step_number?: number | null
          timestamp?: string
          user_id?: string | null
          variant?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          step_number?: number | null
          timestamp?: string
          user_id?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      escrow_payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          id: string
          milestone_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_payments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      form_sessions: {
        Row: {
          form_type: string
          id: string
          payload: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          form_type: string
          id?: string
          payload?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          form_type?: string
          id?: string
          payload?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      job_matches: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          professional_id: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          professional_id?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          professional_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_favorite: boolean
          last_used_at: string | null
          micro_service: string
          name: string
          subcategory: string
          template_data: Json
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          micro_service: string
          name: string
          subcategory: string
          template_data?: Json
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          micro_service?: string
          name?: string
          subcategory?: string
          template_data?: Json
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          answers: Json
          budget_type: string
          budget_value: number | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          location: Json | null
          micro_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          budget_type?: string
          budget_value?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          micro_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          budget_type?: string
          budget_value?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          micro_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          contract_id: string | null
          created_at: string
          id: string
          job_id: string | null
          message_type: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          contract_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          contract_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          amount: number | null
          booking_id: string | null
          created_at: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["milestone_status"] | null
          title: string
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          title: string
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          amount: number
          created_at: string
          id: string
          job_id: string
          message: string | null
          status: string
          tasker_id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          job_id: string
          message?: string | null
          status?: string
          tasker_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          job_id?: string
          message?: string | null
          status?: string
          tasker_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_hints: {
        Row: {
          avg_price: number
          created_at: string
          id: string
          last_updated: string
          location_type: string
          max_price: number
          micro_service: string
          min_price: number
          sample_size: number
          service_category: string
          service_subcategory: string
        }
        Insert: {
          avg_price: number
          created_at?: string
          id?: string
          last_updated?: string
          location_type?: string
          max_price: number
          micro_service: string
          min_price: number
          sample_size?: number
          service_category: string
          service_subcategory: string
        }
        Update: {
          avg_price?: number
          created_at?: string
          id?: string
          last_updated?: string
          location_type?: string
          max_price?: number
          micro_service?: string
          min_price?: number
          sample_size?: number
          service_category?: string
          service_subcategory?: string
        }
        Relationships: []
      }
      professional_applications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string | null
          professional_id: string | null
          proposed_price: number | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          professional_id?: string | null
          proposed_price?: number | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          professional_id?: string | null
          proposed_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_applications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_applications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_deals: {
        Row: {
          created_at: string
          deal_type: string
          description: string | null
          duration_hours: number | null
          id: string
          includes: Json | null
          is_active: boolean | null
          price: number
          professional_id: string
          service_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_type?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          includes?: Json | null
          is_active?: boolean | null
          price: number
          professional_id: string
          service_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_type?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          includes?: Json | null
          is_active?: boolean | null
          price?: number
          professional_id?: string
          service_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_documents: {
        Row: {
          created_at: string
          document_type: string
          expires_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          professional_id: string
          updated_at: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          expires_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          professional_id: string
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          professional_id?: string
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          languages: Json | null
          portfolio_images: Json | null
          primary_trade: string | null
          skills: Json | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          zones: Json | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          languages?: Json | null
          portfolio_images?: Json | null
          primary_trade?: string | null
          skills?: Json | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          zones?: Json | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          languages?: Json | null
          portfolio_images?: Json | null
          primary_trade?: string | null
          skills?: Json | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          zones?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_service_items: {
        Row: {
          base_price: number
          bulk_discount_price: number | null
          bulk_discount_threshold: number | null
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          display_order: number | null
          estimated_duration_minutes: number | null
          gallery_images: Json | null
          id: string
          image_alt_text: string | null
          is_active: boolean | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          pricing_type: string
          primary_image_url: string | null
          professional_id: string
          service_id: string
          unit_type: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          base_price?: number
          bulk_discount_price?: number | null
          bulk_discount_threshold?: number | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          gallery_images?: Json | null
          id?: string
          image_alt_text?: string | null
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          pricing_type?: string
          primary_image_url?: string | null
          professional_id: string
          service_id: string
          unit_type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          base_price?: number
          bulk_discount_price?: number | null
          bulk_discount_threshold?: number | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          estimated_duration_minutes?: number | null
          gallery_images?: Json | null
          id?: string
          image_alt_text?: string | null
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          pricing_type?: string
          primary_image_url?: string | null
          professional_id?: string
          service_id?: string
          unit_type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_role: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          preferred_language: string | null
          roles: Json | null
          tasker_onboarding_status:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          active_role?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          preferred_language?: string | null
          roles?: Json | null
          tasker_onboarding_status?:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          active_role?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          roles?: Json | null
          tasker_onboarding_status?:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_addons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
          service_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
          service_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          service_id?: string
        }
        Relationships: []
      }
      service_options: {
        Row: {
          base_price: number
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          price_per_unit: number | null
          service_id: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          price_per_unit?: number | null
          service_id: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          price_per_unit?: number | null
          service_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_questions: {
        Row: {
          created_at: string | null
          id: string
          questions: Json
          service_id: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          questions: Json
          service_id?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          questions?: Json
          service_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_questions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          id: string
          micro: string
          subcategory: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          micro: string
          subcategory: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          micro?: string
          subcategory?: string
        }
        Relationships: []
      }
      services_micro: {
        Row: {
          category: string
          created_at: string
          id: string
          micro: string
          questions_logistics: Json
          questions_micro: Json
          subcategory: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          micro: string
          questions_logistics?: Json
          questions_micro?: Json
          subcategory: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          micro?: string
          questions_logistics?: Json
          questions_micro?: Json
          subcategory?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client" | "professional"
      booking_status:
        | "draft"
        | "posted"
        | "matched"
        | "in_progress"
        | "completed"
        | "cancelled"
      milestone_status: "pending" | "completed" | "disputed"
      payment_status: "pending" | "completed" | "refunded" | "disputed"
      tasker_onboarding_status: "not_started" | "in_progress" | "complete"
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
      app_role: ["admin", "client", "professional"],
      booking_status: [
        "draft",
        "posted",
        "matched",
        "in_progress",
        "completed",
        "cancelled",
      ],
      milestone_status: ["pending", "completed", "disputed"],
      payment_status: ["pending", "completed", "refunded", "disputed"],
      tasker_onboarding_status: ["not_started", "in_progress", "complete"],
    },
  },
} as const
