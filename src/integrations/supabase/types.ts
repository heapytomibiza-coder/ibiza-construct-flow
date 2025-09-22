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
      professional_profiles: {
        Row: {
          created_at: string | null
          languages: Json | null
          primary_trade: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          zones: Json | null
        }
        Insert: {
          created_at?: string | null
          languages?: Json | null
          primary_trade?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          zones?: Json | null
        }
        Update: {
          created_at?: string | null
          languages?: Json | null
          primary_trade?: string | null
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
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          preferred_language: string | null
          roles: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          preferred_language?: string | null
          roles?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          roles?: Json | null
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    },
  },
} as const
