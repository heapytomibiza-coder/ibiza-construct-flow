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
      activity_feed: {
        Row: {
          action_url: string | null
          actor_id: string | null
          created_at: string | null
          description: string | null
          dismissed_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          notification_type: string | null
          priority: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          notification_type?: string | null
          priority?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          notification_type?: string | null
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      ai_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      ai_automation_rules: {
        Row: {
          actions: Json
          created_at: string
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean
          name: string
          rule_type: string
          success_rate: number | null
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          name: string
          rule_type: string
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean
          name?: string
          rule_type?: string
          success_rate?: number | null
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context: Json | null
          conversation_type: string
          created_at: string
          id: string
          session_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          conversation_type?: string
          created_at?: string
          id?: string
          session_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          conversation_type?: string
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          parameters: Json | null
          template: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          parameters?: Json | null
          template: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parameters?: Json | null
          template?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          actioned_at: string | null
          confidence_score: number
          created_at: string
          data: Json | null
          description: string | null
          entity_id: string | null
          entity_type: string
          expires_at: string | null
          id: string
          priority: string
          recommendation_type: string
          status: string
          title: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          actioned_at?: string | null
          confidence_score?: number
          created_at?: string
          data?: Json | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          expires_at?: string | null
          id?: string
          priority?: string
          recommendation_type: string
          status?: string
          title: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          actioned_at?: string | null
          confidence_score?: number
          created_at?: string
          data?: Json | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          expires_at?: string | null
          id?: string
          priority?: string
          recommendation_type?: string
          status?: string
          title?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      ai_risk_flags: {
        Row: {
          created_at: string
          flag_type: string
          id: string
          job_id: string
          message: string
          resolved_at: string | null
          severity: string
          suggested_action: string | null
        }
        Insert: {
          created_at?: string
          flag_type: string
          id?: string
          job_id: string
          message: string
          resolved_at?: string | null
          severity: string
          suggested_action?: string | null
        }
        Update: {
          created_at?: string
          flag_type?: string
          id?: string
          job_id?: string
          message?: string
          resolved_at?: string | null
          severity?: string
          suggested_action?: string | null
        }
        Relationships: []
      }
      ai_runs: {
        Row: {
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json
          metadata: Json | null
          operation_type: string
          output_data: Json | null
          prompt_template_id: string | null
          status: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json
          metadata?: Json | null
          operation_type: string
          output_data?: Json | null
          prompt_template_id?: string | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json
          metadata?: Json | null
          operation_type?: string
          output_data?: Json | null
          prompt_template_id?: string | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          comparison_operator: string
          condition_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          metric_name: string
          name: string
          notification_channels: Json | null
          threshold_value: number
          updated_at: string
        }
        Insert: {
          comparison_operator: string
          condition_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          metric_name: string
          name: string
          notification_channels?: Json | null
          threshold_value: number
          updated_at?: string
        }
        Update: {
          comparison_operator?: string
          condition_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          metric_name?: string
          name?: string
          notification_channels?: Json | null
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      analytics_dashboards: {
        Row: {
          created_at: string
          dashboard_type: string
          id: string
          is_public: boolean
          layout_config: Json
          name: string
          updated_at: string
          user_id: string | null
          widget_configs: Json
        }
        Insert: {
          created_at?: string
          dashboard_type: string
          id?: string
          is_public?: boolean
          layout_config?: Json
          name: string
          updated_at?: string
          user_id?: string | null
          widget_configs?: Json
        }
        Update: {
          created_at?: string
          dashboard_type?: string
          id?: string
          is_public?: boolean
          layout_config?: Json
          name?: string
          updated_at?: string
          user_id?: string | null
          widget_configs?: Json
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
          catalogue_version_used: number | null
          client_id: string | null
          created_at: string | null
          description: string | null
          general_answers: Json | null
          id: string
          locale: string | null
          micro_q_answers: Json | null
          micro_slug: string | null
          origin: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          catalogue_version_used?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          general_answers?: Json | null
          id?: string
          locale?: string | null
          micro_q_answers?: Json | null
          micro_slug?: string | null
          origin?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          catalogue_version_used?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          general_answers?: Json | null
          id?: string
          locale?: string | null
          micro_q_answers?: Json | null
          micro_slug?: string | null
          origin?: string | null
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
      business_metrics: {
        Row: {
          change_percentage: number | null
          created_at: string
          dimensions: Json | null
          id: string
          metadata: Json | null
          metric_category: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          previous_value: number | null
          updated_at: string
        }
        Insert: {
          change_percentage?: number | null
          created_at?: string
          dimensions?: Json | null
          id?: string
          metadata?: Json | null
          metric_category: string
          metric_name: string
          metric_value?: number
          period_end: string
          period_start: string
          previous_value?: number | null
          updated_at?: string
        }
        Update: {
          change_percentage?: number | null
          created_at?: string
          dimensions?: Json | null
          id?: string
          metadata?: Json | null
          metric_category?: string
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          previous_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          event_type: string | null
          external_calendar_id: string | null
          id: string
          job_id: string | null
          location: Json | null
          metadata: Json | null
          notes: string | null
          recurrence_rule: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          external_calendar_id?: string | null
          id?: string
          job_id?: string | null
          location?: Json | null
          metadata?: Json | null
          notes?: string | null
          recurrence_rule?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          external_calendar_id?: string | null
          id?: string
          job_id?: string | null
          location?: Json | null
          metadata?: Json | null
          notes?: string | null
          recurrence_rule?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          delta_amount: number | null
          description: string
          id: string
          job_id: string
          proposer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          delta_amount?: number | null
          description: string
          id?: string
          job_id: string
          proposer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          delta_amount?: number | null
          description?: string
          id?: string
          job_id?: string
          proposer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_favorites: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          professional_id: string
          tags: string[] | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          professional_id: string
          tags?: string[] | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          professional_id?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      client_files: {
        Row: {
          client_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          job_id: string | null
          tags: string[] | null
          uploaded_at: string
        }
        Insert: {
          client_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          job_id?: string | null
          tags?: string[] | null
          uploaded_at?: string
        }
        Update: {
          client_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          job_id?: string | null
          tags?: string[] | null
          uploaded_at?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          created_at: string
          default_property_id: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_property_id?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_property_id?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      conversations: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          last_message_at: string | null
          metadata: Json | null
          participants: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          metadata?: Json | null
          participants: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          metadata?: Json | null
          participants?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      dispute_evidence: {
        Row: {
          created_at: string
          description: string | null
          dispute_id: string
          evidence_type: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dispute_id: string
          evidence_type: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dispute_id?: string
          evidence_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          amount_disputed: number | null
          contract_id: string | null
          created_at: string
          created_by: string
          description: string
          dispute_number: string
          disputed_against: string
          due_date: string | null
          escalated_at: string | null
          id: string
          invoice_id: string | null
          job_id: string
          priority: string
          resolution_amount: number | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amount_disputed?: number | null
          contract_id?: string | null
          created_at?: string
          created_by: string
          description: string
          dispute_number: string
          disputed_against: string
          due_date?: string | null
          escalated_at?: string | null
          id?: string
          invoice_id?: string | null
          job_id: string
          priority?: string
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          amount_disputed?: number | null
          contract_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          dispute_number?: string
          disputed_against?: string
          due_date?: string | null
          escalated_at?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string
          priority?: string
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_collaborators: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          last_viewed_at: string | null
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          last_viewed_at?: string | null
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          last_viewed_at?: string | null
          permission?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborators_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "shared_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_edits: {
        Row: {
          change_data: Json | null
          change_type: string
          created_at: string | null
          document_id: string
          id: string
          user_id: string
        }
        Insert: {
          change_data?: Json | null
          change_type: string
          created_at?: string | null
          document_id: string
          id?: string
          user_id: string
        }
        Update: {
          change_data?: Json | null
          change_type?: string
          created_at?: string | null
          document_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_edits_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "shared_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_edits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_milestones: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          completed_date: string | null
          contract_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          milestone_number: number
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_date?: string | null
          contract_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_number: number
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_date?: string | null
          contract_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_number?: number
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      escrow_payments: {
        Row: {
          amount: number
          booking_id: string | null
          contract_id: string | null
          created_at: string | null
          escrow_status: string | null
          id: string
          milestone_id: string | null
          released_at: string | null
          released_by: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          escrow_status?: string | null
          id?: string
          milestone_id?: string | null
          released_at?: string | null
          released_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          escrow_status?: string | null
          id?: string
          milestone_id?: string | null
          released_at?: string | null
          released_by?: string | null
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
            foreignKeyName: "escrow_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
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
      escrow_release_overrides: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          milestone_id: string
          reason: string
          released_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          milestone_id: string
          reason: string
          released_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          milestone_id?: string
          reason?: string
          released_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_release_overrides_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_release_overrides_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_releases: {
        Row: {
          amount: number
          created_at: string
          id: string
          milestone_id: string
          notes: string | null
          payment_id: string
          released_at: string | null
          released_by: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          milestone_id: string
          notes?: string | null
          payment_id: string
          released_at?: string | null
          released_by: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          milestone_id?: string
          notes?: string | null
          payment_id?: string
          released_at?: string | null
          released_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_releases_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_releases_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          initiated_by: string
          metadata: Json | null
          milestone_id: string
          payment_id: string | null
          status: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by: string
          metadata?: Json | null
          milestone_id: string
          payment_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_by?: string
          metadata?: Json | null
          milestone_id?: string
          payment_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "escrow_payments"
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
      financial_reports: {
        Row: {
          created_at: string
          file_url: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          report_data: Json
          report_name: string
          report_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          report_data?: Json
          report_name: string
          report_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          report_data?: Json
          report_name?: string
          report_type?: string
          status?: string
          updated_at?: string
          user_id?: string
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
      generated_reports: {
        Row: {
          file_url: string | null
          generated_at: string
          generated_by: string | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          report_data: Json
          report_name: string
          status: string
          template_id: string | null
        }
        Insert: {
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          report_data?: Json
          report_name: string
          status?: string
          template_id?: string | null
        }
        Update: {
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          report_data?: Json
          report_name?: string
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          item_order: number | null
          metadata: Json | null
          quantity: number
          tax_amount: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          item_order?: number | null
          metadata?: Json | null
          quantity?: number
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          item_order?: number | null
          metadata?: Json | null
          quantity?: number
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_transaction_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: Json | null
          client_email: string | null
          client_name: string | null
          contract_id: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          discount_percentage: number | null
          due_date: string | null
          footer_notes: string | null
          id: string
          invoice_number: string
          invoice_template: string | null
          invoice_type: string | null
          job_id: string | null
          line_items: Json
          notes: string | null
          paid_date: string | null
          payment_method_id: string | null
          professional_address: Json | null
          professional_email: string | null
          professional_name: string | null
          reminder_sent_at: string | null
          sent_at: string | null
          split_payment: Json | null
          status: string
          subtotal: number
          tax_id: string | null
          terms: string | null
          total_amount: number
          updated_at: string
          user_id: string
          vat_amount: number | null
          vat_rate: number | null
          viewed_at: string | null
        }
        Insert: {
          client_address?: Json | null
          client_email?: string | null
          client_name?: string | null
          contract_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          due_date?: string | null
          footer_notes?: string | null
          id?: string
          invoice_number: string
          invoice_template?: string | null
          invoice_type?: string | null
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          paid_date?: string | null
          payment_method_id?: string | null
          professional_address?: Json | null
          professional_email?: string | null
          professional_name?: string | null
          reminder_sent_at?: string | null
          sent_at?: string | null
          split_payment?: Json | null
          status?: string
          subtotal?: number
          tax_id?: string | null
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
          vat_amount?: number | null
          vat_rate?: number | null
          viewed_at?: string | null
        }
        Update: {
          client_address?: Json | null
          client_email?: string | null
          client_name?: string | null
          contract_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          due_date?: string | null
          footer_notes?: string | null
          id?: string
          invoice_number?: string
          invoice_template?: string | null
          invoice_type?: string | null
          job_id?: string | null
          line_items?: Json
          notes?: string | null
          paid_date?: string | null
          payment_method_id?: string | null
          professional_address?: Json | null
          professional_email?: string | null
          professional_name?: string | null
          reminder_sent_at?: string | null
          sent_at?: string | null
          split_payment?: Json | null
          status?: string
          subtotal?: number
          tax_id?: string | null
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          vat_amount?: number | null
          vat_rate?: number | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      job_applicants: {
        Row: {
          applied_at: string | null
          availability_status: string | null
          id: string
          interview_notes: string | null
          interview_scheduled_at: string | null
          job_id: string
          notes: string | null
          professional_id: string
          rating: number | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          applied_at?: string | null
          availability_status?: string | null
          id?: string
          interview_notes?: string | null
          interview_scheduled_at?: string | null
          job_id: string
          notes?: string | null
          professional_id: string
          rating?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          applied_at?: string | null
          availability_status?: string | null
          id?: string
          interview_notes?: string | null
          interview_scheduled_at?: string | null
          job_id?: string
          notes?: string | null
          professional_id?: string
          rating?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applicants_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applicants_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_broadcasts: {
        Row: {
          broadcast_type: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          job_id: string
          professionals_applied: number | null
          professionals_notified: number | null
          professionals_viewed: number | null
          target_criteria: Json
        }
        Insert: {
          broadcast_type: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          job_id: string
          professionals_applied?: number | null
          professionals_notified?: number | null
          professionals_viewed?: number | null
          target_criteria: Json
        }
        Update: {
          broadcast_type?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string
          professionals_applied?: number | null
          professionals_notified?: number | null
          professionals_viewed?: number | null
          target_criteria?: Json
        }
        Relationships: []
      }
      job_lifecycle_events: {
        Row: {
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          job_id: string
          metadata: Json | null
          reason: string | null
          to_status: string | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          job_id: string
          metadata?: Json | null
          reason?: string | null
          to_status?: string | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          job_id?: string
          metadata?: Json | null
          reason?: string | null
          to_status?: string | null
          triggered_by?: string | null
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
      job_presets: {
        Row: {
          created_at: string | null
          id: string
          last_used_at: string | null
          preset_data: Json | null
          preset_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          preset_data?: Json | null
          preset_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          preset_data?: Json | null
          preset_type?: string
          user_id?: string
        }
        Relationships: []
      }
      job_question_snapshot: {
        Row: {
          created_at: string
          job_id: string
          pack_id: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          job_id: string
          pack_id: string
          snapshot: Json
        }
        Update: {
          created_at?: string
          job_id?: string
          pack_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "job_question_snapshot_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_question_snapshot_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "question_packs"
            referencedColumns: ["pack_id"]
          },
        ]
      }
      job_status_updates: {
        Row: {
          created_at: string
          id: string
          job_id: string
          location: Json | null
          notes: string | null
          professional_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          location?: Json | null
          notes?: string | null
          professional_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          location?: Json | null
          notes?: string | null
          professional_id?: string
          status?: string
        }
        Relationships: []
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
          attachments: Json | null
          content: string
          contract_id: string | null
          conversation_id: string | null
          created_at: string
          edited_at: string | null
          id: string
          is_edited: boolean | null
          job_id: string | null
          message_type: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          thread_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          contract_id?: string | null
          conversation_id?: string | null
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          job_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          thread_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          contract_id?: string | null
          conversation_id?: string | null
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          job_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_questions_ai_runs: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          micro_category_id: string
          model: string
          prompt_hash: string
          raw_response: Json | null
          status: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          micro_category_id: string
          model: string
          prompt_hash: string
          raw_response?: Json | null
          status: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          micro_category_id?: string
          model?: string
          prompt_hash?: string
          raw_response?: Json | null
          status?: string
        }
        Relationships: []
      }
      micro_questions_snapshot: {
        Row: {
          created_at: string | null
          id: string
          micro_category_id: string
          questions_json: Json
          schema_rev: number
          updated_at: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          micro_category_id: string
          questions_json: Json
          schema_rev?: number
          updated_at?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          micro_category_id?: string
          questions_json?: Json
          schema_rev?: number
          updated_at?: string | null
          version?: number
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
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          notification_types: Json | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notification_types?: Json | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notification_types?: Json | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          subject: string | null
          template_key: string
          template_name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_template: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject?: string | null
          template_key: string
          template_name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject?: string | null
          template_key?: string
          template_name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_negotiations: {
        Row: {
          attachments: Json | null
          counter_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string | null
          offer_id: string
          proposed_amount: number | null
          proposed_terms: Json | null
          sender_id: string
          status: string | null
        }
        Insert: {
          attachments?: Json | null
          counter_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          offer_id: string
          proposed_amount?: number | null
          proposed_terms?: Json | null
          sender_id: string
          status?: string | null
        }
        Update: {
          attachments?: Json | null
          counter_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          offer_id?: string
          proposed_amount?: number | null
          proposed_terms?: Json | null
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_negotiations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_negotiations_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      onboarding_checklist: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          professional_id: string
          skipped: boolean
          started_at: string | null
          step: Database["public"]["Enums"]["app_onboarding_step"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          professional_id: string
          skipped?: boolean
          started_at?: string | null
          step: Database["public"]["Enums"]["app_onboarding_step"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          professional_id?: string
          skipped?: boolean
          started_at?: string | null
          step?: Database["public"]["Enums"]["app_onboarding_step"]
        }
        Relationships: []
      }
      onboarding_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          professional_id: string
          step: Database["public"]["Enums"]["app_onboarding_step"] | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          professional_id: string
          step?: Database["public"]["Enums"]["app_onboarding_step"] | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          professional_id?: string
          step?: Database["public"]["Enums"]["app_onboarding_step"] | null
        }
        Relationships: []
      }
      pack_performance: {
        Row: {
          completion_rate: number
          created_at: string
          id: string
          median_duration_s: number
          pack_id: string
          slug: string
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          id?: string
          median_duration_s?: number
          pack_id: string
          slug: string
        }
        Update: {
          completion_rate?: number
          created_at?: string
          id?: string
          median_duration_s?: number
          pack_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_performance_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: true
            referencedRelation: "question_packs"
            referencedColumns: ["pack_id"]
          },
        ]
      }
      payment_alerts: {
        Row: {
          action_required: boolean | null
          action_url: string | null
          affected_users: string[] | null
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          action_required?: boolean | null
          action_url?: string | null
          affected_users?: string[] | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_required?: boolean | null
          action_url?: string | null
          affected_users?: string[] | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_analytics: {
        Row: {
          average_transaction: number
          created_at: string
          id: string
          metadata: Json | null
          payment_method_breakdown: Json | null
          period_end: string
          period_start: string
          period_type: string
          status_breakdown: Json | null
          total_escrow: number
          total_expenses: number
          total_refunds: number
          total_revenue: number
          transaction_count: number
          unique_clients: number
          unique_professionals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_transaction?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_method_breakdown?: Json | null
          period_end: string
          period_start: string
          period_type: string
          status_breakdown?: Json | null
          total_escrow?: number
          total_expenses?: number
          total_refunds?: number
          total_revenue?: number
          transaction_count?: number
          unique_clients?: number
          unique_professionals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_transaction?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_method_breakdown?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          status_breakdown?: Json | null
          total_escrow?: number
          total_expenses?: number
          total_refunds?: number
          total_revenue?: number
          transaction_count?: number
          unique_clients?: number
          unique_professionals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          billing_address: Json | null
          brand: string | null
          created_at: string
          expires_month: number | null
          expires_year: number | null
          id: string
          is_default: boolean
          last_four: string | null
          stripe_payment_method_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          brand?: string | null
          created_at?: string
          expires_month?: number | null
          expires_year?: number | null
          id?: string
          is_default?: boolean
          last_four?: string | null
          stripe_payment_method_id: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          brand?: string | null
          created_at?: string
          expires_month?: number | null
          expires_year?: number | null
          id?: string
          is_default?: boolean
          last_four?: string | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_notifications: {
        Row: {
          channel: string
          created_at: string
          failed_reason: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          failed_reason?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          failed_reason?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          issued_at: string
          payment_id: string
          receipt_data: Json
          receipt_number: string
          receipt_url: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          issued_at?: string
          payment_id: string
          receipt_data?: Json
          receipt_number: string
          receipt_url?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          issued_at?: string
          payment_id?: string
          receipt_data?: Json
          receipt_number?: string
          receipt_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_reconciliations: {
        Row: {
          actual_amount: number
          created_at: string
          difference: number
          expected_amount: number
          id: string
          metadata: Json | null
          notes: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount: number
          created_at?: string
          difference: number
          expected_amount: number
          id?: string
          metadata?: Json | null
          notes?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number
          created_at?: string
          difference?: number
          expected_amount?: number
          id?: string
          metadata?: Json | null
          notes?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          job_id: string | null
          metadata: Json | null
          payment_method_id: string | null
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          metadata?: Json | null
          payment_method_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          metadata?: Json | null
          payment_method_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          id: string
          job_id: string | null
          net_amount: number
          payment_method: string | null
          platform_fee: number
          professional_id: string | null
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          currency?: string
          id?: string
          job_id?: string | null
          net_amount: number
          payment_method?: string | null
          platform_fee?: number
          professional_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          id?: string
          job_id?: string | null
          net_amount?: number
          payment_method?: string | null
          platform_fee?: number
          professional_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_items: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          payout_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          payout_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          payout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_items_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          arrival_date: string | null
          created_at: string
          currency: string
          id: string
          method: string
          professional_id: string
          status: string
          stripe_account_id: string | null
          stripe_payout_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          arrival_date?: string | null
          created_at?: string
          currency?: string
          id?: string
          method?: string
          professional_id: string
          status?: string
          stripe_account_id?: string | null
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          arrival_date?: string | null
          created_at?: string
          currency?: string
          id?: string
          method?: string
          professional_id?: string
          status?: string
          stripe_account_id?: string | null
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          dimensions: Json | null
          id: string
          metric_name: string
          metric_value: number | null
          recorded_at: string
        }
        Insert: {
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_value?: number | null
          recorded_at?: string
        }
        Update: {
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string
        }
        Relationships: []
      }
      predictive_insights: {
        Row: {
          confidence_level: number
          created_at: string
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          factors: Json | null
          id: string
          insight_type: string
          predicted_value: number | null
          prediction_description: string | null
          prediction_title: string
          recommendations: Json | null
          status: string
          time_horizon: string | null
        }
        Insert: {
          confidence_level?: number
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          factors?: Json | null
          id?: string
          insight_type: string
          predicted_value?: number | null
          prediction_description?: string | null
          prediction_title: string
          recommendations?: Json | null
          status?: string
          time_horizon?: string | null
        }
        Update: {
          confidence_level?: number
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          factors?: Json | null
          id?: string
          insight_type?: string
          predicted_value?: number | null
          prediction_description?: string | null
          prediction_title?: string
          recommendations?: Json | null
          status?: string
          time_horizon?: string | null
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
      pro_badges: {
        Row: {
          awarded_at: string
          id: string
          key: string
          meta: Json | null
          pro_id: string
        }
        Insert: {
          awarded_at?: string
          id?: string
          key: string
          meta?: Json | null
          pro_id: string
        }
        Update: {
          awarded_at?: string
          id?: string
          key?: string
          meta?: Json | null
          pro_id?: string
        }
        Relationships: []
      }
      pro_targets: {
        Row: {
          created_at: string
          id: string
          jobs_target: number | null
          period: string
          pro_id: string
          revenue_target: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jobs_target?: number | null
          period: string
          pro_id: string
          revenue_target?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jobs_target?: number | null
          period?: string
          pro_id?: string
          revenue_target?: number | null
          updated_at?: string
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
      professional_availability: {
        Row: {
          available_until: string | null
          buffer_time_minutes: number | null
          created_at: string | null
          custom_message: string | null
          id: string
          max_bookings_per_day: number | null
          professional_id: string
          status: string
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          available_until?: string | null
          buffer_time_minutes?: number | null
          created_at?: string | null
          custom_message?: string | null
          id?: string
          max_bookings_per_day?: number | null
          professional_id: string
          status: string
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          available_until?: string | null
          buffer_time_minutes?: number | null
          created_at?: string | null
          custom_message?: string | null
          id?: string
          max_bookings_per_day?: number | null
          professional_id?: string
          status?: string
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_professional_id_fkey"
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
      professional_earnings: {
        Row: {
          amount: number
          booking_id: string | null
          contract_id: string | null
          created_at: string
          earned_at: string
          fee_amount: number
          id: string
          net_amount: number
          professional_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          contract_id?: string | null
          created_at?: string
          earned_at?: string
          fee_amount?: number
          id?: string
          net_amount?: number
          professional_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          contract_id?: string | null
          created_at?: string
          earned_at?: string
          fee_amount?: number
          id?: string
          net_amount?: number
          professional_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_earnings_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_earnings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_portfolio: {
        Row: {
          category: string | null
          client_name: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean
          professional_id: string
          project_date: string | null
          skills_used: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          professional_id: string
          project_date?: string | null
          skills_used?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          professional_id?: string
          project_date?: string | null
          skills_used?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          availability: Json | null
          bank_details: Json | null
          bio: string | null
          business_name: string | null
          created_at: string | null
          experience_years: number | null
          hourly_rate: number | null
          insurance_details: Json | null
          is_active: boolean | null
          languages: Json | null
          portfolio_images: Json | null
          primary_trade: string | null
          response_time_hours: number | null
          skills: Json | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
          verification_status: string | null
          zones: Json | null
        }
        Insert: {
          availability?: Json | null
          bank_details?: Json | null
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          insurance_details?: Json | null
          is_active?: boolean | null
          languages?: Json | null
          portfolio_images?: Json | null
          primary_trade?: string | null
          response_time_hours?: number | null
          skills?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
          verification_status?: string | null
          zones?: Json | null
        }
        Update: {
          availability?: Json | null
          bank_details?: Json | null
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          insurance_details?: Json | null
          is_active?: boolean | null
          languages?: Json | null
          portfolio_images?: Json | null
          primary_trade?: string | null
          response_time_hours?: number | null
          skills?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
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
      professional_reviews: {
        Row: {
          booking_id: string | null
          client_id: string
          comment: string | null
          contract_id: string | null
          created_at: string
          id: string
          is_featured: boolean
          is_verified: boolean
          job_id: string | null
          milestone_id: string | null
          professional_id: string
          rating: number
          responded_at: string | null
          response: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          comment?: string | null
          contract_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          job_id?: string | null
          milestone_id?: string | null
          professional_id: string
          rating: number
          responded_at?: string | null
          response?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          comment?: string | null
          contract_id?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          job_id?: string | null
          milestone_id?: string | null
          professional_id?: string
          rating?: number
          responded_at?: string | null
          response?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
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
          micro: string | null
          min_quantity: number | null
          name: string
          pricing_type: string
          primary_image_url: string | null
          professional_id: string
          service_id: string
          subcategory: string | null
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
          micro?: string | null
          min_quantity?: number | null
          name: string
          pricing_type?: string
          primary_image_url?: string | null
          professional_id: string
          service_id: string
          subcategory?: string | null
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
          micro?: string | null
          min_quantity?: number | null
          name?: string
          pricing_type?: string
          primary_image_url?: string | null
          professional_id?: string
          service_id?: string
          subcategory?: string | null
          unit_type?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_service_items_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_services: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          micro_service_id: string
          portfolio_urls: string[] | null
          pricing_structure: Json | null
          professional_id: string
          service_areas: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          micro_service_id: string
          portfolio_urls?: string[] | null
          pricing_structure?: Json | null
          professional_id: string
          service_areas?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          micro_service_id?: string
          portfolio_urls?: string[] | null
          pricing_structure?: Json | null
          professional_id?: string
          service_areas?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      professional_stats: {
        Row: {
          average_rating: number
          completed_bookings: number
          completion_rate: number
          created_at: string
          id: string
          last_active_at: string | null
          professional_id: string
          repeat_client_rate: number
          response_rate: number
          total_bookings: number
          total_earnings: number
          total_reviews: number
          updated_at: string
        }
        Insert: {
          average_rating?: number
          completed_bookings?: number
          completion_rate?: number
          created_at?: string
          id?: string
          last_active_at?: string | null
          professional_id: string
          repeat_client_rate?: number
          response_rate?: number
          total_bookings?: number
          total_earnings?: number
          total_reviews?: number
          updated_at?: string
        }
        Update: {
          average_rating?: number
          completed_bookings?: number
          completion_rate?: number
          created_at?: string
          id?: string
          last_active_at?: string | null
          professional_id?: string
          repeat_client_rate?: number
          response_rate?: number
          total_bookings?: number
          total_earnings?: number
          total_reviews?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_stats_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_verifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          professional_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string
          updated_at: string
          verification_method: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          professional_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          verification_method: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          professional_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          verification_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_verifications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_role: string | null
          avatar_url: string | null
          bio: string | null
          coverage_area: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          location: string | null
          notification_preferences: Json | null
          phone: string | null
          preferences: Json | null
          preferred_language: string | null
          service_radius: number | null
          simple_mode: boolean | null
          tasker_onboarding_status:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          tour_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          active_role?: string | null
          avatar_url?: string | null
          bio?: string | null
          coverage_area?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          preferences?: Json | null
          preferred_language?: string | null
          service_radius?: number | null
          simple_mode?: boolean | null
          tasker_onboarding_status?:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          active_role?: string | null
          avatar_url?: string | null
          bio?: string | null
          coverage_area?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          preferences?: Json | null
          preferred_language?: string | null
          service_radius?: number | null
          simple_mode?: boolean | null
          tasker_onboarding_status?:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          tour_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          access_notes: string | null
          address: string
          client_id: string
          created_at: string
          id: string
          name: string
          parking_details: Json | null
          updated_at: string
        }
        Insert: {
          access_notes?: string | null
          address: string
          client_id: string
          created_at?: string
          id?: string
          name: string
          parking_details?: Json | null
          updated_at?: string
        }
        Update: {
          access_notes?: string | null
          address?: string
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          parking_details?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      question_metrics: {
        Row: {
          answers: number
          avg_time_ms: number
          dropoffs: number
          id: string
          pack_id: string
          question_key: string
          slug: string
          updated_at: string
          views: number
        }
        Insert: {
          answers?: number
          avg_time_ms?: number
          dropoffs?: number
          id?: string
          pack_id: string
          question_key: string
          slug: string
          updated_at?: string
          views?: number
        }
        Update: {
          answers?: number
          avg_time_ms?: number
          dropoffs?: number
          id?: string
          pack_id?: string
          question_key?: string
          slug?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_metrics_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "question_packs"
            referencedColumns: ["pack_id"]
          },
        ]
      }
      question_pack_audit: {
        Row: {
          actor: string | null
          at: string
          event: string
          id: string
          meta: Json | null
          pack_id: string
        }
        Insert: {
          actor?: string | null
          at?: string
          event: string
          id?: string
          meta?: Json | null
          pack_id: string
        }
        Update: {
          actor?: string | null
          at?: string
          event?: string
          id?: string
          meta?: Json | null
          pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_pack_audit_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_pack_audit_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "question_packs"
            referencedColumns: ["pack_id"]
          },
        ]
      }
      question_packs: {
        Row: {
          ab_test_id: string | null
          approved_at: string | null
          approved_by: string | null
          content: Json
          created_at: string
          created_by: string | null
          is_active: boolean
          micro_slug: string
          pack_id: string
          prompt_hash: string | null
          source: Database["public"]["Enums"]["pack_source"]
          status: Database["public"]["Enums"]["pack_status"]
          version: number
        }
        Insert: {
          ab_test_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          content: Json
          created_at?: string
          created_by?: string | null
          is_active?: boolean
          micro_slug: string
          pack_id?: string
          prompt_hash?: string | null
          source: Database["public"]["Enums"]["pack_source"]
          status?: Database["public"]["Enums"]["pack_status"]
          version: number
        }
        Update: {
          ab_test_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          is_active?: boolean
          micro_slug?: string
          pack_id?: string
          prompt_hash?: string | null
          source?: Database["public"]["Enums"]["pack_source"]
          status?: Database["public"]["Enums"]["pack_status"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_packs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_packs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          job_id: string
          message: string | null
          professional_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          job_id: string
          message?: string | null
          professional_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          job_id?: string
          message?: string | null
          professional_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          breakdown: Json | null
          created_at: string
          exclusions: string[] | null
          id: string
          inclusions: string[] | null
          notes: string | null
          quote_request_id: string
          updated_at: string
          valid_until: string | null
          warranty_info: string | null
        }
        Insert: {
          amount: number
          breakdown?: Json | null
          created_at?: string
          exclusions?: string[] | null
          id?: string
          inclusions?: string[] | null
          notes?: string | null
          quote_request_id: string
          updated_at?: string
          valid_until?: string | null
          warranty_info?: string | null
        }
        Update: {
          amount?: number
          breakdown?: Json | null
          created_at?: string
          exclusions?: string[] | null
          id?: string
          inclusions?: string[] | null
          notes?: string | null
          quote_request_id?: string
          updated_at?: string
          valid_until?: string | null
          warranty_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          payment_id: string
          processed_at: string | null
          reason: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          stripe_refund_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_id: string
          processed_at?: string | null
          reason: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          stripe_refund_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_id?: string
          processed_at?: string | null
          reason?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          stripe_refund_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          processed_at: string | null
          reason: string | null
          requested_by: string
          status: string
          stripe_refund_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          processed_at?: string | null
          reason?: string | null
          requested_by: string
          status?: string
          stripe_refund_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          processed_at?: string | null
          reason?: string | null
          requested_by?: string
          status?: string
          stripe_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          report_type: string
          template_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          report_type: string
          template_config?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          report_type?: string
          template_config?: Json
          updated_at?: string
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
      service_name_map: {
        Row: {
          norm_category: string
          raw_category: string
          source: string
        }
        Insert: {
          norm_category: string
          raw_category: string
          source: string
        }
        Update: {
          norm_category?: string
          raw_category?: string
          source?: string
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
          is_featured: boolean | null
          micro: string
          subcategory: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          micro: string
          subcategory: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          micro?: string
          subcategory?: string
        }
        Relationships: []
      }
      services_micro: {
        Row: {
          category: string
          category_type: string | null
          created_at: string
          ibiza_specific: boolean | null
          id: string
          micro: string
          priority_level: string | null
          question_source: string | null
          questions_logistics: Json
          questions_micro: Json
          subcategory: string
          updated_at: string
        }
        Insert: {
          category: string
          category_type?: string | null
          created_at?: string
          ibiza_specific?: boolean | null
          id?: string
          micro: string
          priority_level?: string | null
          question_source?: string | null
          questions_logistics?: Json
          questions_micro?: Json
          subcategory: string
          updated_at?: string
        }
        Update: {
          category?: string
          category_type?: string | null
          created_at?: string
          ibiza_specific?: boolean | null
          id?: string
          micro?: string
          priority_level?: string | null
          question_source?: string | null
          questions_logistics?: Json
          questions_micro?: Json
          subcategory?: string
          updated_at?: string
        }
        Relationships: []
      }
      services_unified_v1: {
        Row: {
          category: string
          created_at: string | null
          id: string
          micro: string
          subcategory: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          micro: string
          subcategory: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          micro?: string
          subcategory?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shared_documents: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string | null
          document_type: string
          id: string
          job_id: string | null
          last_edited_at: string | null
          last_edited_by: string | null
          title: string
          version: number | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          document_type: string
          id?: string
          job_id?: string | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          title: string
          version?: number | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          id?: string
          job_id?: string | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          title?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_documents_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          section: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          section: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          section?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      smart_matches: {
        Row: {
          availability_score: number | null
          created_at: string
          id: string
          job_id: string
          location_score: number | null
          match_reasons: Json | null
          match_score: number
          price_score: number | null
          professional_id: string
          reputation_score: number | null
          skill_score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          availability_score?: number | null
          created_at?: string
          id?: string
          job_id: string
          location_score?: number | null
          match_reasons?: Json | null
          match_score?: number
          price_score?: number | null
          professional_id: string
          reputation_score?: number | null
          skill_score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          availability_score?: number | null
          created_at?: string
          id?: string
          job_id?: string
          location_score?: number | null
          match_reasons?: Json | null
          match_score?: number
          price_score?: number | null
          professional_id?: string
          reputation_score?: number | null
          skill_score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      system_activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          error_rate: number | null
          id: string
          metadata: Json | null
          metric_type: string
          recorded_at: string
          response_time_ms: number | null
          service_name: string
          status: string
          value: number
        }
        Insert: {
          error_rate?: number | null
          id?: string
          metadata?: Json | null
          metric_type: string
          recorded_at?: string
          response_time_ms?: number | null
          service_name: string
          status?: string
          value: number
        }
        Update: {
          error_rate?: number | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          recorded_at?: string
          response_time_ms?: number | null
          service_name?: string
          status?: string
          value?: number
        }
        Relationships: []
      }
      transaction_notes: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          note: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_notes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_automations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          execution_history: Json | null
          id: string
          is_active: boolean
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_history?: Json | null
          id?: string
          is_active?: boolean
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          workflow_steps?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_history?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_professional_view_job: {
        Args: { _job_id: string; _user_id: string }
        Returns: boolean
      }
      check_availability: {
        Args: {
          p_end_time: string
          p_professional_id: string
          p_start_time: string
        }
        Returns: boolean
      }
      generate_payment_receipt: {
        Args: { p_payment_id: string }
        Returns: Json
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_slots: {
        Args: {
          p_date: string
          p_duration_minutes?: number
          p_professional_id: string
        }
        Returns: {
          slot_end: string
          slot_start: string
        }[]
      }
      get_online_professionals: {
        Args: { professional_ids?: string[] }
        Returns: {
          available_until: string
          custom_message: string
          professional_id: string
          status: string
          updated_at: string
        }[]
      }
      get_payment_statistics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_professional_earnings_summary: {
        Args: { p_professional_id: string }
        Returns: Json
      }
      get_unread_message_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_changes?: Json
          p_entity_id?: string
          p_entity_type?: string
        }
        Returns: string
      }
      mark_overdue_invoices: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_onboarding_step:
        | "profile_basic"
        | "verification"
        | "services"
        | "availability"
        | "portfolio"
        | "payment_setup"
      app_role: "admin" | "client" | "professional"
      booking_status:
        | "draft"
        | "posted"
        | "matched"
        | "in_progress"
        | "completed"
        | "cancelled"
      milestone_status: "pending" | "completed" | "disputed"
      pack_source: "manual" | "ai" | "hybrid"
      pack_status: "draft" | "approved" | "retired"
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
      app_onboarding_step: [
        "profile_basic",
        "verification",
        "services",
        "availability",
        "portfolio",
        "payment_setup",
      ],
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
      pack_source: ["manual", "ai", "hybrid"],
      pack_status: ["draft", "approved", "retired"],
      payment_status: ["pending", "completed", "refunded", "disputed"],
      tasker_onboarding_status: ["not_started", "in_progress", "complete"],
    },
  },
} as const
