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
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          last_activity_at: string
          location: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_activity_at?: string
          location?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_activity_at?: string
          location?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      admin_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
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
      admin_ip_whitelist: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          admin_id: string
          granted_at: string
          granted_by: string | null
          id: string
          permission: string
          scope: string | null
        }
        Insert: {
          admin_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission: string
          scope?: string | null
        }
        Update: {
          admin_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission?: string
          scope?: string | null
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
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_name: string
          event_properties: Json | null
          id: string
          ip_address: unknown
          os: string | null
          page_url: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          os?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          os?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          snapshot_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value?: number
          snapshot_date: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          snapshot_date?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          executed_at: string
          execution_data: Json | null
          id: string
          result_data: Json | null
          status: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          execution_data?: Json | null
          id?: string
          result_data?: Json | null
          status?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string
          execution_data?: Json | null
          id?: string
          result_data?: Json | null
          status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          execution_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          name: string
          success_rate: number | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name: string
          success_rate?: number | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          name?: string
          success_rate?: number | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_presets: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          working_hours: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          working_hours: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          working_hours?: Json
        }
        Relationships: [
          {
            foreignKeyName: "availability_presets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      background_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          max_retries: number | null
          payload: Json | null
          priority: number | null
          retry_count: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          max_retries?: number | null
          payload?: Json | null
          priority?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          max_retries?: number | null
          payload?: Json | null
          priority?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          rarity: string
          requirement_type: string
          requirement_value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          rarity?: string
          requirement_type: string
          requirement_value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rarity?: string
          requirement_type?: string
          requirement_value?: number | null
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          professional_id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          professional_id: string
          reason?: string | null
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          professional_id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_reminders: {
        Row: {
          booking_id: string
          created_at: string | null
          delivery_method: string
          error_message: string | null
          id: string
          metadata: Json | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          delivery_method?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          delivery_method?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          client_id: string
          created_at: string
          deprecated_at: string | null
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
          deprecated_at?: string | null
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
          deprecated_at?: string | null
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
      booking_risk_flags: {
        Row: {
          booking_id: string
          detected_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          risk_type: string
          severity: string
        }
        Insert: {
          booking_id: string
          detected_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_type: string
          severity: string
        }
        Update: {
          booking_id?: string
          detected_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_type?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_risk_flags_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          auto_complete_eligible_at: string | null
          budget_range: string | null
          catalogue_version_used: number | null
          checkin_window_end: string | null
          checkin_window_start: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          escrow_funded_at: string | null
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
          auto_complete_eligible_at?: string | null
          budget_range?: string | null
          catalogue_version_used?: number | null
          checkin_window_end?: string | null
          checkin_window_start?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          escrow_funded_at?: string | null
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
          auto_complete_eligible_at?: string | null
          budget_range?: string | null
          catalogue_version_used?: number | null
          checkin_window_end?: string | null
          checkin_window_start?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          escrow_funded_at?: string | null
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
      business_insights: {
        Row: {
          action_items: Json | null
          created_at: string
          id: string
          impact_score: number | null
          insight_description: string | null
          insight_title: string
          insight_type: string
          is_read: boolean
          priority: string
          priority_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          id?: string
          impact_score?: number | null
          insight_description?: string | null
          insight_title: string
          insight_type: string
          is_read?: boolean
          priority?: string
          priority_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          id?: string
          impact_score?: number | null
          insight_description?: string | null
          insight_title?: string
          insight_type?: string
          is_read?: boolean
          priority?: string
          priority_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      calculator_saved_configs: {
        Row: {
          config_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          pricing_snapshot: Json | null
          project_type: string
          selections: Json
          session_id: string | null
          share_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          pricing_snapshot?: Json | null
          project_type: string
          selections: Json
          session_id?: string | null
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          pricing_snapshot?: Json | null
          project_type?: string
          selections?: Json
          session_id?: string | null
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calculator_share_events: {
        Row: {
          accessed_at: string | null
          config_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          recipient_email: string | null
          share_method: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string | null
          config_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          recipient_email?: string | null
          share_method: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string | null
          config_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          recipient_email?: string | null
          share_method?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculator_share_events_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "calculator_saved_configs"
            referencedColumns: ["id"]
          },
        ]
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
      calendar_sync: {
        Row: {
          calendar_id: string
          created_at: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          provider: string
          sync_status: string | null
          sync_token: string | null
          user_id: string
        }
        Insert: {
          calendar_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          sync_status?: string | null
          sync_token?: string | null
          user_id: string
        }
        Update: {
          calendar_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          sync_status?: string | null
          sync_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      category_suggestions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          parent_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_name: string
          suggestion_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          parent_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_name: string
          suggestion_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          parent_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_name?: string
          suggestion_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      churn_predictions: {
        Row: {
          churn_probability: number
          created_at: string | null
          id: string
          is_prevented: boolean | null
          predicted_churn_date: string | null
          prevention_actions: Json | null
          risk_factors: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          churn_probability: number
          created_at?: string | null
          id?: string
          is_prevented?: boolean | null
          predicted_churn_date?: string | null
          prevention_actions?: Json | null
          risk_factors?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          churn_probability?: number
          created_at?: string | null
          id?: string
          is_prevented?: boolean | null
          predicted_churn_date?: string | null
          prevention_actions?: Json | null
          risk_factors?: Json | null
          updated_at?: string | null
          user_id?: string
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
      client_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          level: string
          message: string
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          level: string
          message: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      collaborative_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          host_id: string
          id: string
          job_id: string | null
          participants: string[]
          room_id: string
          session_data: Json | null
          session_type: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          host_id: string
          id?: string
          job_id?: string | null
          participants?: string[]
          room_id: string
          session_data?: Json | null
          session_type: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          host_id?: string
          id?: string
          job_id?: string | null
          participants?: string[]
          room_id?: string
          session_data?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_sessions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_frameworks: {
        Row: {
          created_at: string
          description: string | null
          framework_code: string
          framework_name: string
          id: string
          is_active: boolean
          requirements: Json
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework_code: string
          framework_name: string
          id?: string
          is_active?: boolean
          requirements?: Json
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          framework_code?: string
          framework_name?: string
          id?: string
          is_active?: boolean
          requirements?: Json
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      compliance_reports: {
        Row: {
          created_at: string
          findings: Json
          framework_id: string | null
          generated_by: string | null
          id: string
          overall_score: number | null
          published_at: string | null
          recommendations: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          status: string
        }
        Insert: {
          created_at?: string
          findings?: Json
          framework_id?: string | null
          generated_by?: string | null
          id?: string
          overall_score?: number | null
          published_at?: string | null
          recommendations?: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          status?: string
        }
        Update: {
          created_at?: string
          findings?: Json
          framework_id?: string | null
          generated_by?: string | null
          id?: string
          overall_score?: number | null
          published_at?: string | null
          recommendations?: Json | null
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          agreed_amount: number
          client_id: string
          created_at: string
          end_at: string | null
          escrow_hold_period: number | null
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
          escrow_hold_period?: number | null
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
          escrow_hold_period?: number | null
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
          contract_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
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
      data_breach_incidents: {
        Row: {
          affected_data_types: Json | null
          affected_users: number
          assigned_to: string | null
          created_at: string
          description: string
          detected_at: string
          id: string
          impact_assessment: string | null
          incident_type: string
          remediation_steps: Json | null
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          affected_data_types?: Json | null
          affected_users?: number
          assigned_to?: string | null
          created_at?: string
          description: string
          detected_at?: string
          id?: string
          impact_assessment?: string | null
          incident_type: string
          remediation_steps?: Json | null
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          affected_data_types?: Json | null
          affected_users?: number
          assigned_to?: string | null
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          impact_assessment?: string | null
          incident_type?: string
          remediation_steps?: Json | null
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          id: string
          notes: string | null
          processed_at: string | null
          requested_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          file_url: string | null
          id: string
          request_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          request_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          request_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          export_format: string
          export_type: string
          file_size_bytes: number | null
          file_url: string | null
          filters: Json | null
          id: string
          row_count: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_format: string
          export_type: string
          file_size_bytes?: number | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          row_count?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_format?: string
          export_type?: string
          file_size_bytes?: number | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          row_count?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_privacy_controls: {
        Row: {
          allow_analytics: boolean | null
          allow_marketing: boolean | null
          allow_third_party_sharing: boolean | null
          consent_given_at: string | null
          consent_version: string | null
          created_at: string
          data_retention_days: number | null
          encryption_enabled: boolean | null
          id: string
          ip_whitelist: Json | null
          preferences: Json | null
          session_timeout_minutes: number | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_analytics?: boolean | null
          allow_marketing?: boolean | null
          allow_third_party_sharing?: boolean | null
          consent_given_at?: string | null
          consent_version?: string | null
          created_at?: string
          data_retention_days?: number | null
          encryption_enabled?: boolean | null
          id?: string
          ip_whitelist?: Json | null
          preferences?: Json | null
          session_timeout_minutes?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_analytics?: boolean | null
          allow_marketing?: boolean | null
          allow_third_party_sharing?: boolean | null
          consent_given_at?: string | null
          consent_version?: string | null
          created_at?: string
          data_retention_days?: number | null
          encryption_enabled?: boolean | null
          id?: string
          ip_whitelist?: Json | null
          preferences?: Json | null
          session_timeout_minutes?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dispute_counter_proposals: {
        Row: {
          created_at: string | null
          dispute_id: string
          id: string
          note: string | null
          parent_resolution_id: string | null
          proposer_id: string
          status: string | null
          terms: Json
        }
        Insert: {
          created_at?: string | null
          dispute_id: string
          id?: string
          note?: string | null
          parent_resolution_id?: string | null
          proposer_id: string
          status?: string | null
          terms?: Json
        }
        Update: {
          created_at?: string | null
          dispute_id?: string
          id?: string
          note?: string | null
          parent_resolution_id?: string | null
          proposer_id?: string
          status?: string | null
          terms?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dispute_counter_proposals_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_counter_proposals_parent_resolution_id_fkey"
            columns: ["parent_resolution_id"]
            isOneToOne: false
            referencedRelation: "dispute_resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          created_at: string
          description: string | null
          dispute_id: string
          evidence_category: string | null
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
          evidence_category?: string | null
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
          evidence_category?: string | null
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
      dispute_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          dispute_id: string
          id: string
          is_admin_note: boolean | null
          is_internal: boolean | null
          message: string
          read_at: string | null
          response_time_seconds: number | null
          sender_id: string
          template_used: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          dispute_id: string
          id?: string
          is_admin_note?: boolean | null
          is_internal?: boolean | null
          message: string
          read_at?: string | null
          response_time_seconds?: number | null
          sender_id: string
          template_used?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          dispute_id?: string
          id?: string
          is_admin_note?: boolean | null
          is_internal?: boolean | null
          message?: string
          read_at?: string | null
          response_time_seconds?: number | null
          sender_id?: string
          template_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_resolutions: {
        Row: {
          agreement_finalized_at: string | null
          amount: number | null
          appeal_deadline: string | null
          auto_execute_date: string | null
          awarded_to: string | null
          created_at: string | null
          details: string | null
          dispute_id: string
          fault_percentage_client: number | null
          fault_percentage_professional: number | null
          finalized_at: string | null
          id: string
          mediator_decision_reasoning: string | null
          party_client_agreed: boolean | null
          party_professional_agreed: boolean | null
          resolution_type: string
          status: string | null
          terms: Json | null
        }
        Insert: {
          agreement_finalized_at?: string | null
          amount?: number | null
          appeal_deadline?: string | null
          auto_execute_date?: string | null
          awarded_to?: string | null
          created_at?: string | null
          details?: string | null
          dispute_id: string
          fault_percentage_client?: number | null
          fault_percentage_professional?: number | null
          finalized_at?: string | null
          id?: string
          mediator_decision_reasoning?: string | null
          party_client_agreed?: boolean | null
          party_professional_agreed?: boolean | null
          resolution_type: string
          status?: string | null
          terms?: Json | null
        }
        Update: {
          agreement_finalized_at?: string | null
          amount?: number | null
          appeal_deadline?: string | null
          auto_execute_date?: string | null
          awarded_to?: string | null
          created_at?: string | null
          details?: string | null
          dispute_id?: string
          fault_percentage_client?: number | null
          fault_percentage_professional?: number | null
          finalized_at?: string | null
          id?: string
          mediator_decision_reasoning?: string | null
          party_client_agreed?: boolean | null
          party_professional_agreed?: boolean | null
          resolution_type?: string
          status?: string | null
          terms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_resolutions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_timeline: {
        Row: {
          actor_id: string | null
          created_at: string | null
          description: string
          dispute_id: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          description: string
          dispute_id: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          description?: string
          dispute_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_timeline_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          amount_disputed: number | null
          auto_close_date: string | null
          contract_id: string | null
          created_at: string
          created_by: string
          description: string
          dispute_category: string | null
          dispute_number: string
          disputed_against: string
          due_date: string | null
          escalated_at: string | null
          escalation_level: number | null
          escalation_reasons: Json | null
          id: string
          invoice_id: string | null
          job_id: string
          last_activity_at: string | null
          mediator_id: string | null
          mediator_notes: string | null
          pre_dispute_contact_attempted: boolean | null
          priority: string
          required_evidence_types: Json | null
          resolution_amount: number | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          response_deadline: string | null
          status: string
          title: string
          type: string
          updated_at: string
          workflow_state: string | null
        }
        Insert: {
          amount_disputed?: number | null
          auto_close_date?: string | null
          contract_id?: string | null
          created_at?: string
          created_by: string
          description: string
          dispute_category?: string | null
          dispute_number: string
          disputed_against: string
          due_date?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          escalation_reasons?: Json | null
          id?: string
          invoice_id?: string | null
          job_id: string
          last_activity_at?: string | null
          mediator_id?: string | null
          mediator_notes?: string | null
          pre_dispute_contact_attempted?: boolean | null
          priority?: string
          required_evidence_types?: Json | null
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_deadline?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          workflow_state?: string | null
        }
        Update: {
          amount_disputed?: number | null
          auto_close_date?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          dispute_category?: string | null
          dispute_number?: string
          disputed_against?: string
          due_date?: string | null
          escalated_at?: string | null
          escalation_level?: number | null
          escalation_reasons?: Json | null
          id?: string
          invoice_id?: string | null
          job_id?: string
          last_activity_at?: string | null
          mediator_id?: string | null
          mediator_notes?: string | null
          pre_dispute_contact_attempted?: boolean | null
          priority?: string
          required_evidence_types?: Json | null
          resolution_amount?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_deadline?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          workflow_state?: string | null
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
      dual_control_approvals: {
        Row: {
          action_type: string
          approved_by: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string
          id: string
          payload: Json
          reason: string
          requested_by: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_type: string
          approved_by?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string
          id?: string
          payload: Json
          reason: string
          requested_by: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          approved_by?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string
          id?: string
          payload?: Json
          reason?: string
          requested_by?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      escrow_milestones: {
        Row: {
          amount: number
          approval_deadline: string | null
          approved_at: string | null
          approved_by: string | null
          auto_release_date: string | null
          completed_date: string | null
          contract_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          milestone_number: number
          partial_release_enabled: boolean | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          released_amount: number | null
          status: string
          submission_notes: string | null
          submitted_at: string | null
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approval_deadline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_release_date?: string | null
          completed_date?: string | null
          contract_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_number: number
          partial_release_enabled?: boolean | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          released_amount?: number | null
          status?: string
          submission_notes?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_deadline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_release_date?: string | null
          completed_date?: string | null
          contract_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_number?: number
          partial_release_enabled?: boolean | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          released_amount?: number | null
          status?: string
          submission_notes?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
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
      escrow_transfer_logs: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          milestone_id: string
          professional_account_id: string | null
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          milestone_id: string
          professional_account_id?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          milestone_id?: string
          professional_account_id?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transfer_logs_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transfer_logs_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_stripe_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_flag_exposures: {
        Row: {
          exposed_at: string | null
          flag_key: string
          id: string
          metadata: Json | null
          user_id: string
          user_segment: Json | null
        }
        Insert: {
          exposed_at?: string | null
          flag_key: string
          id?: string
          metadata?: Json | null
          user_id: string
          user_segment?: Json | null
        }
        Update: {
          exposed_at?: string | null
          flag_key?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          user_segment?: Json | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          error_budget_threshold: number | null
          key: string
          kill_switch_active: boolean | null
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          error_budget_threshold?: number | null
          key: string
          kill_switch_active?: boolean | null
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          error_budget_threshold?: number | null
          key?: string
          kill_switch_active?: boolean | null
          rollout_percentage?: number | null
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
      fraud_patterns: {
        Row: {
          created_at: string | null
          detection_count: number | null
          id: string
          is_active: boolean | null
          last_detected_at: string | null
          pattern_data: Json
          pattern_type: string
          severity: string
        }
        Insert: {
          created_at?: string | null
          detection_count?: number | null
          id?: string
          is_active?: boolean | null
          last_detected_at?: string | null
          pattern_data: Json
          pattern_type: string
          severity: string
        }
        Update: {
          created_at?: string | null
          detection_count?: number | null
          id?: string
          is_active?: boolean | null
          last_detected_at?: string | null
          pattern_data?: Json
          pattern_type?: string
          severity?: string
        }
        Relationships: []
      }
      funnel_analytics: {
        Row: {
          analysis_date: string
          average_time_seconds: number | null
          conversion_rate: number | null
          created_at: string | null
          drop_off_count: number | null
          funnel_name: string
          id: string
          step_name: string
          step_number: number
          users_completed: number | null
          users_entered: number | null
        }
        Insert: {
          analysis_date: string
          average_time_seconds?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          drop_off_count?: number | null
          funnel_name: string
          id?: string
          step_name: string
          step_number: number
          users_completed?: number | null
          users_entered?: number | null
        }
        Update: {
          analysis_date?: string
          average_time_seconds?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          drop_off_count?: number | null
          funnel_name?: string
          id?: string
          step_name?: string
          step_number?: number
          users_completed?: number | null
          users_entered?: number | null
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
      integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          credentials: Json | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          job_id: string
          photo_type: string
          taken_at: string | null
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          job_id: string
          photo_type: string
          taken_at?: string | null
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          job_id?: string
          photo_type?: string
          taken_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
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
      job_quotes: {
        Row: {
          accepted_at: string | null
          attachments: Json | null
          created_at: string
          currency: string
          estimated_duration_hours: number | null
          estimated_start_date: string | null
          id: string
          job_id: string
          professional_id: string
          proposal_message: string
          quote_amount: number
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          attachments?: Json | null
          created_at?: string
          currency?: string
          estimated_duration_hours?: number | null
          estimated_start_date?: string | null
          id?: string
          job_id: string
          professional_id: string
          proposal_message: string
          quote_amount: number
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          attachments?: Json | null
          created_at?: string
          currency?: string
          estimated_duration_hours?: number | null
          estimated_start_date?: string | null
          id?: string
          job_id?: string
          professional_id?: string
          proposal_message?: string
          quote_amount?: number
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_state_transitions: {
        Row: {
          created_at: string | null
          from_state: string
          id: string
          job_id: string
          metadata: Json | null
          reason: string | null
          to_state: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          from_state: string
          id?: string
          job_id: string
          metadata?: Json | null
          reason?: string | null
          to_state: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          from_state?: string
          id?: string
          job_id?: string
          metadata?: Json | null
          reason?: string | null
          to_state?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_state_transitions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
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
      job_versions: {
        Row: {
          change_reason: string | null
          changes: Json
          created_at: string | null
          created_by: string
          id: string
          invalidated_offers: boolean | null
          job_id: string
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          changes: Json
          created_at?: string | null
          created_by: string
          id?: string
          invalidated_offers?: boolean | null
          job_id: string
          version_number: number
        }
        Update: {
          change_reason?: string | null
          changes?: Json
          created_at?: string | null
          created_by?: string
          id?: string
          invalidated_offers?: boolean | null
          job_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_versions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          answers: Json
          budget_type: string
          budget_value: number | null
          client_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          location: Json | null
          micro_id: string
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
          workflow_state: string | null
        }
        Insert: {
          answers?: Json
          budget_type?: string
          budget_value?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: Json | null
          micro_id: string
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
          workflow_state?: string | null
        }
        Update: {
          answers?: Json
          budget_type?: string
          budget_value?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: Json | null
          micro_id?: string
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          workflow_state?: string | null
        }
        Relationships: []
      }
      kpi_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          created_at: string
          id: string
          leaderboard_id: string
          metadata: Json | null
          period_end: string
          period_start: string
          rank: number
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leaderboard_id: string
          metadata?: Json | null
          period_end: string
          period_start: string
          rank: number
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leaderboard_id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          rank?: number
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          leaderboard_type: string
          name: string
          period: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          leaderboard_type: string
          name: string
          period: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          leaderboard_type?: string
          name?: string
          period?: string
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          level: number
          name: string
          perks: Json
          points_required: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level: number
          name: string
          perks?: Json
          points_required: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          level?: number
          name?: string
          perks?: Json
          points_required?: number
        }
        Relationships: []
      }
      message_attachment_metadata: {
        Row: {
          created_at: string | null
          expires_at: string | null
          file_name: string
          file_size: number
          id: string
          message_id: string | null
          mime_type: string
          storage_path: string
          thumbnail_path: string | null
          virus_scan_date: string | null
          virus_scan_status: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          file_name: string
          file_size: number
          id?: string
          message_id?: string | null
          mime_type: string
          storage_path: string
          thumbnail_path?: string | null
          virus_scan_date?: string | null
          virus_scan_status?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          file_name?: string
          file_size?: number
          id?: string
          message_id?: string | null
          mime_type?: string
          storage_path?: string
          thumbnail_path?: string | null
          virus_scan_date?: string | null
          virus_scan_status?: string | null
        }
        Relationships: []
      }
      message_rate_limits: {
        Row: {
          is_throttled: boolean | null
          messages_sent: number | null
          throttled_until: string | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          is_throttled?: boolean | null
          messages_sent?: number | null
          throttled_until?: string | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          is_throttled?: boolean | null
          messages_sent?: number | null
          throttled_until?: string | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          message_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          message_id: string
          parent_message_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          parent_message_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          parent_message_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
      micro_service_questions: {
        Row: {
          category: string
          created_at: string
          id: string
          micro_id: string
          micro_name: string
          questions: Json
          subcategory: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          micro_id: string
          micro_name: string
          questions?: Json
          subcategory: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          micro_id?: string
          micro_name?: string
          questions?: Json
          subcategory?: string
          updated_at?: string
        }
        Relationships: []
      }
      micro_services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          matchers: string[] | null
          name: string
          slug: string
          trade: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          matchers?: string[] | null
          name: string
          slug: string
          trade?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          matchers?: string[] | null
          name?: string
          slug?: string
          trade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      milestone_approvals: {
        Row: {
          action: string
          approver_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          milestone_id: string
          notes: string | null
        }
        Insert: {
          action: string
          approver_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_id: string
          notes?: string | null
        }
        Update: {
          action?: string
          approver_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_approvals_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "escrow_milestones"
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
      notification_digest_queue: {
        Row: {
          created_at: string | null
          id: string
          notification_id: string
          scheduled_for: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_id: string
          scheduled_for: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_id?: string
          scheduled_for?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_digest_queue_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "activity_feed"
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
      notification_queue: {
        Row: {
          created_at: string | null
          data: Json | null
          error_message: string | null
          id: string
          notification_type: string
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
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
      payment_analytics_summary: {
        Row: {
          average_transaction_value: number
          conversion_rate: number
          created_at: string
          currency: string
          failed_payments: number
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          refund_rate: number
          successful_payments: number
          total_payments: number
          total_revenue: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          average_transaction_value?: number
          conversion_rate?: number
          created_at?: string
          currency?: string
          failed_payments?: number
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          refund_rate?: number
          successful_payments?: number
          total_payments?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          average_transaction_value?: number
          conversion_rate?: number
          created_at?: string
          currency?: string
          failed_payments?: number
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          refund_rate?: number
          successful_payments?: number
          total_payments?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string | null
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
      payment_reminders: {
        Row: {
          channel: string
          created_at: string
          id: string
          metadata: Json | null
          reminder_type: string
          scheduled_payment_id: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reminder_type: string
          scheduled_payment_id: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reminder_type?: string
          scheduled_payment_id?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_scheduled_payment_id_fkey"
            columns: ["scheduled_payment_id"]
            isOneToOne: false
            referencedRelation: "scheduled_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          created_at: string
          currency: string
          frequency: string
          id: string
          installment_count: number
          job_id: string
          metadata: Json | null
          next_payment_date: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          frequency: string
          id?: string
          installment_count: number
          job_id: string
          metadata?: Json | null
          next_payment_date?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          frequency?: string
          id?: string
          installment_count?: number
          job_id?: string
          metadata?: Json | null
          next_payment_date?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      platform_metrics: {
        Row: {
          active_users: number | null
          average_booking_value: number | null
          average_rating: number | null
          cancelled_bookings: number | null
          completed_bookings: number | null
          created_at: string | null
          disputes_opened: number | null
          disputes_resolved: number | null
          id: string
          metric_date: string
          metric_hour: number | null
          new_users: number | null
          total_bookings: number | null
          total_messages: number | null
          total_revenue: number | null
          total_reviews: number | null
          total_users: number | null
          updated_at: string | null
        }
        Insert: {
          active_users?: number | null
          average_booking_value?: number | null
          average_rating?: number | null
          cancelled_bookings?: number | null
          completed_bookings?: number | null
          created_at?: string | null
          disputes_opened?: number | null
          disputes_resolved?: number | null
          id?: string
          metric_date: string
          metric_hour?: number | null
          new_users?: number | null
          total_bookings?: number | null
          total_messages?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Update: {
          active_users?: number | null
          average_booking_value?: number | null
          average_rating?: number | null
          cancelled_bookings?: number | null
          completed_bookings?: number | null
          created_at?: string | null
          disputes_opened?: number | null
          disputes_resolved?: number | null
          id?: string
          metric_date?: string
          metric_hour?: number | null
          new_users?: number | null
          total_bookings?: number | null
          total_messages?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          points: number
          source: string
          source_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points: number
          source: string
          source_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          source?: string
          source_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      popular_searches: {
        Row: {
          id: string
          period: string
          period_start: string
          popularity_score: number | null
          search_term: string
          search_type: string
          updated_at: string
        }
        Insert: {
          id?: string
          period: string
          period_start: string
          popularity_score?: number | null
          search_term: string
          search_type: string
          updated_at?: string
        }
        Update: {
          id?: string
          period?: string
          period_start?: string
          popularity_score?: number | null
          search_term?: string
          search_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          professional_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          professional_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          professional_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      professional_badges: {
        Row: {
          badge_icon: string | null
          badge_name: string
          badge_type: string
          created_at: string | null
          earned_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          professional_user_id: string
        }
        Insert: {
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          professional_user_id: string
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          professional_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_badges_professional_user_id_fkey"
            columns: ["professional_user_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "professional_badges_professional_user_id_fkey"
            columns: ["professional_user_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles_public"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "professional_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "legacy_booking_requests"
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
          contact_email: string | null
          contact_phone: string | null
          cover_image_url: string | null
          created_at: string | null
          experience_years: string | null
          hourly_rate: number | null
          instant_booking_enabled: boolean | null
          insurance_details: Json | null
          intro_categories: Json | null
          is_active: boolean | null
          languages: Json | null
          onboarding_phase: string | null
          portfolio_images: Json | null
          primary_trade: string | null
          rejection_reason: string | null
          response_guarantee_hours: number | null
          response_time_hours: number | null
          service_regions: Json | null
          skills: Json | null
          subscription_tier: string | null
          tagline: string | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
          verification_status: string | null
          video_intro_url: string | null
          work_philosophy: string | null
          work_process_steps: Json | null
          zones: Json | null
        }
        Insert: {
          availability?: Json | null
          bank_details?: Json | null
          bio?: string | null
          business_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          experience_years?: string | null
          hourly_rate?: number | null
          instant_booking_enabled?: boolean | null
          insurance_details?: Json | null
          intro_categories?: Json | null
          is_active?: boolean | null
          languages?: Json | null
          onboarding_phase?: string | null
          portfolio_images?: Json | null
          primary_trade?: string | null
          rejection_reason?: string | null
          response_guarantee_hours?: number | null
          response_time_hours?: number | null
          service_regions?: Json | null
          skills?: Json | null
          subscription_tier?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
          verification_status?: string | null
          video_intro_url?: string | null
          work_philosophy?: string | null
          work_process_steps?: Json | null
          zones?: Json | null
        }
        Update: {
          availability?: Json | null
          bank_details?: Json | null
          bio?: string | null
          business_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          experience_years?: string | null
          hourly_rate?: number | null
          instant_booking_enabled?: boolean | null
          insurance_details?: Json | null
          intro_categories?: Json | null
          is_active?: boolean | null
          languages?: Json | null
          onboarding_phase?: string | null
          portfolio_images?: Json | null
          primary_trade?: string | null
          rejection_reason?: string | null
          response_guarantee_hours?: number | null
          response_time_hours?: number | null
          service_regions?: Json | null
          skills?: Json | null
          subscription_tier?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
          verification_status?: string | null
          video_intro_url?: string | null
          work_philosophy?: string | null
          work_process_steps?: Json | null
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
            foreignKeyName: "professional_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "legacy_booking_requests"
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
      professional_scores: {
        Row: {
          calculated_at: string | null
          communication_score: number | null
          id: string
          metadata: Json | null
          overall_score: number | null
          professional_id: string
          quality_score: number | null
          rank_percentile: number | null
          reliability_score: number | null
        }
        Insert: {
          calculated_at?: string | null
          communication_score?: number | null
          id?: string
          metadata?: Json | null
          overall_score?: number | null
          professional_id: string
          quality_score?: number | null
          rank_percentile?: number | null
          reliability_score?: number | null
        }
        Update: {
          calculated_at?: string | null
          communication_score?: number | null
          id?: string
          metadata?: Json | null
          overall_score?: number | null
          professional_id?: string
          quality_score?: number | null
          rank_percentile?: number | null
          reliability_score?: number | null
        }
        Relationships: []
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
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles_public"
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
      professional_stripe_accounts: {
        Row: {
          account_status: string
          balance_available: number | null
          balance_pending: number | null
          charges_enabled: boolean | null
          country: string | null
          created_at: string | null
          currency: string | null
          details_submitted: boolean | null
          id: string
          metadata: Json | null
          payouts_enabled: boolean | null
          professional_id: string
          stripe_account_id: string
          updated_at: string | null
        }
        Insert: {
          account_status?: string
          balance_available?: number | null
          balance_pending?: number | null
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          details_submitted?: boolean | null
          id?: string
          metadata?: Json | null
          payouts_enabled?: boolean | null
          professional_id: string
          stripe_account_id: string
          updated_at?: string | null
        }
        Update: {
          account_status?: string
          balance_available?: number | null
          balance_pending?: number | null
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          details_submitted?: boolean | null
          id?: string
          metadata?: Json | null
          payouts_enabled?: boolean | null
          professional_id?: string
          stripe_account_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_verifications: {
        Row: {
          created_at: string
          document_urls: string[] | null
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
          document_urls?: string[] | null
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
          document_urls?: string[] | null
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
          {
            foreignKeyName: "professional_verifications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown
          professional_id: string
          session_id: string
          user_agent: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown
          professional_id: string
          session_id: string
          user_agent?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown
          professional_id?: string
          session_id?: string
          user_agent?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: []
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
          preferred_currency: string | null
          preferred_language: string | null
          service_radius: number | null
          simple_mode: boolean | null
          tasker_onboarding_status:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          tour_completed: boolean | null
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
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
          preferred_currency?: string | null
          preferred_language?: string | null
          service_radius?: number | null
          simple_mode?: boolean | null
          tasker_onboarding_status?:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          tour_completed?: boolean | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
          preferred_currency?: string | null
          preferred_language?: string | null
          service_radius?: number | null
          simple_mode?: boolean | null
          tasker_onboarding_status?:
            | Database["public"]["Enums"]["tasker_onboarding_status"]
            | null
          tour_completed?: boolean | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      project_completions: {
        Row: {
          actual_cost: number | null
          completion_date: string | null
          created_at: string | null
          estimated_cost: number
          id: string
          notes: string | null
          project_type: string
          session_id: string
          updated_at: string | null
          user_id: string | null
          variance_percentage: number | null
        }
        Insert: {
          actual_cost?: number | null
          completion_date?: string | null
          created_at?: string | null
          estimated_cost: number
          id?: string
          notes?: string | null
          project_type: string
          session_id: string
          updated_at?: string | null
          user_id?: string | null
          variance_percentage?: number | null
        }
        Update: {
          actual_cost?: number | null
          completion_date?: string | null
          created_at?: string | null
          estimated_cost?: number
          id?: string
          notes?: string | null
          project_type?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
          variance_percentage?: number | null
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
      query_performance_log: {
        Row: {
          created_at: string
          execution_time_ms: number
          id: string
          query_name: string
          table_name: string | null
        }
        Insert: {
          created_at?: string
          execution_time_ms: number
          id?: string
          query_name: string
          table_name?: string | null
        }
        Update: {
          created_at?: string
          execution_time_ms?: number
          id?: string
          query_name?: string
          table_name?: string | null
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
          ui_config: Json | null
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
          ui_config?: Json | null
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
          ui_config?: Json | null
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
      rate_limit_tracking: {
        Row: {
          action: string
          created_at: string | null
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      rating_summary: {
        Row: {
          average_rating: number | null
          category_averages: Json | null
          created_at: string | null
          id: string
          rating_distribution: Json | null
          response_rate: number | null
          role: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_rating?: number | null
          category_averages?: Json | null
          created_at?: string | null
          id?: string
          rating_distribution?: Json | null
          response_rate?: number | null
          role: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_rating?: number | null
          category_averages?: Json | null
          created_at?: string | null
          id?: string
          rating_distribution?: Json | null
          response_rate?: number | null
          role?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redirect_analytics: {
        Row: {
          created_at: string
          from_path: string
          hit_count: number
          id: string
          last_hit_at: string | null
          redirect_reason: string | null
          to_path: string
        }
        Insert: {
          created_at?: string
          from_path: string
          hit_count?: number
          id?: string
          last_hit_at?: string | null
          redirect_reason?: string | null
          to_path: string
        }
        Update: {
          created_at?: string
          from_path?: string
          hit_count?: number
          id?: string
          last_hit_at?: string | null
          redirect_reason?: string | null
          to_path?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code_id: string
          referred_id: string
          referred_reward_points: number | null
          referrer_id: string
          referrer_reward_points: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code_id: string
          referred_id: string
          referred_reward_points?: number | null
          referrer_id: string
          referrer_reward_points?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_id?: string
          referred_reward_points?: number | null
          referrer_id?: string
          referrer_reward_points?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
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
      report_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          export_format: string
          file_path: string | null
          file_size: number | null
          filters: Json | null
          id: string
          include_pii: boolean | null
          report_type: string
          requested_by: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          export_format: string
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          id?: string
          include_pii?: boolean | null
          report_type: string
          requested_by: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          export_format?: string
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          id?: string
          include_pii?: boolean | null
          report_type?: string
          requested_by?: string
          status?: string | null
        }
        Relationships: []
      }
      report_schedules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipients: string[]
          report_config: Json | null
          report_name: string
          report_type: string
          schedule_day: number | null
          schedule_frequency: string
          schedule_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients: string[]
          report_config?: Json | null
          report_name: string
          report_type: string
          schedule_day?: number | null
          schedule_frequency: string
          schedule_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[]
          report_config?: Json | null
          report_name?: string
          report_type?: string
          schedule_day?: number | null
          schedule_frequency?: string
          schedule_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      resolution_enforcement_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          dispute_id: string
          executed_by: string | null
          id: string
          resolution_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          dispute_id: string
          executed_by?: string | null
          id?: string
          resolution_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          dispute_id?: string
          executed_by?: string | null
          id?: string
          resolution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolution_enforcement_log_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolution_enforcement_log_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "dispute_resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_analytics: {
        Row: {
          analysis_date: string
          average_transaction: number | null
          created_at: string | null
          currency: string | null
          id: string
          net_revenue: number | null
          refund_amount: number | null
          revenue_type: string
          total_amount: number | null
          transaction_count: number | null
          updated_at: string | null
        }
        Insert: {
          analysis_date: string
          average_transaction?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          net_revenue?: number | null
          refund_amount?: number | null
          revenue_type: string
          total_amount?: number | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string
          average_transaction?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          net_revenue?: number | null
          refund_amount?: number | null
          revenue_type?: string
          total_amount?: number | null
          transaction_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_forecasts: {
        Row: {
          actual_revenue: number | null
          confidence_level: number | null
          created_at: string | null
          forecast_period: string
          id: string
          model_version: string | null
          period_end: string
          period_start: string
          predicted_revenue: number
          variance: number | null
        }
        Insert: {
          actual_revenue?: number | null
          confidence_level?: number | null
          created_at?: string | null
          forecast_period: string
          id?: string
          model_version?: string | null
          period_end: string
          period_start: string
          predicted_revenue: number
          variance?: number | null
        }
        Update: {
          actual_revenue?: number | null
          confidence_level?: number | null
          created_at?: string | null
          forecast_period?: string
          id?: string
          model_version?: string | null
          period_end?: string
          period_start?: string
          predicted_revenue?: number
          variance?: number | null
        }
        Relationships: []
      }
      review_flags: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          flag_reason: string
          flagged_by: string
          id: string
          moderation_action: string | null
          review_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          flag_reason: string
          flagged_by: string
          id?: string
          moderation_action?: string | null
          review_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          flag_reason?: string
          flagged_by?: string
          id?: string
          moderation_action?: string | null
          review_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_media: {
        Row: {
          created_at: string | null
          display_order: number | null
          file_name: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_media_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reports: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reason: string
          reported_by: string
          review_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reason: string
          reported_by: string
          review_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string
          reported_by?: string
          review_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          responder_id: string
          response_text: string
          review_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          responder_id: string
          response_text: string
          review_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          responder_id?: string
          response_text?: string
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          category_ratings: Json | null
          comment: string | null
          contract_id: string | null
          created_at: string | null
          flag_reason: string | null
          flagged_at: string | null
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          job_id: string
          metadata: Json | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          rating: number
          response_at: string | null
          response_text: string | null
          reviewee_id: string
          reviewer_id: string
          title: string | null
          unhelpful_count: number | null
          updated_at: string | null
        }
        Insert: {
          category_ratings?: Json | null
          comment?: string | null
          contract_id?: string | null
          created_at?: string | null
          flag_reason?: string | null
          flagged_at?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          job_id: string
          metadata?: Json | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          rating: number
          response_at?: string | null
          response_text?: string | null
          reviewee_id: string
          reviewer_id: string
          title?: string | null
          unhelpful_count?: number | null
          updated_at?: string | null
        }
        Update: {
          category_ratings?: Json | null
          comment?: string | null
          contract_id?: string | null
          created_at?: string | null
          flag_reason?: string | null
          flagged_at?: string | null
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          job_id?: string
          metadata?: Json | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          rating?: number
          response_at?: string | null
          response_text?: string | null
          reviewee_id?: string
          reviewer_id?: string
          title?: string | null
          unhelpful_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          is_public: boolean | null
          report_config: Json
          report_data: Json | null
          report_name: string
          report_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          is_public?: boolean | null
          report_config: Json
          report_data?: Json | null
          report_name: string
          report_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          is_public?: boolean | null
          report_config?: Json
          report_data?: Json | null
          report_name?: string
          report_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          last_checked_at: string | null
          name: string
          notification_enabled: boolean | null
          search_query: string | null
          search_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_checked_at?: string | null
          name: string
          notification_enabled?: boolean | null
          search_query?: string | null
          search_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_checked_at?: string | null
          name?: string
          notification_enabled?: boolean | null
          search_query?: string | null
          search_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          failure_reason: string | null
          id: string
          installment_number: number
          metadata: Json | null
          paid_at: string | null
          payment_transaction_id: string | null
          reminder_sent_at: string | null
          schedule_id: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          failure_reason?: string | null
          id?: string
          installment_number: number
          metadata?: Json | null
          paid_at?: string | null
          payment_transaction_id?: string | null
          reminder_sent_at?: string | null
          schedule_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          failure_reason?: string | null
          id?: string
          installment_number?: number
          metadata?: Json | null
          paid_at?: string | null
          payment_transaction_id?: string | null
          reminder_sent_at?: string | null
          schedule_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_payments_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_payments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "payment_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          avg_results: number | null
          created_at: string
          date: string
          id: string
          search_count: number | null
          search_term: string
          search_type: string
          zero_results_count: number | null
        }
        Insert: {
          avg_results?: number | null
          created_at?: string
          date: string
          id?: string
          search_count?: number | null
          search_term: string
          search_type: string
          zero_results_count?: number | null
        }
        Update: {
          avg_results?: number | null
          created_at?: string
          date?: string
          id?: string
          search_count?: number | null
          search_term?: string
          search_type?: string
          zero_results_count?: number | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          clicked_result_id: string | null
          created_at: string
          filters: Json | null
          id: string
          results_count: number | null
          search_query: string
          search_type: string
          user_id: string
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query: string
          search_type: string
          user_id: string
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          failure_reason: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          result: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          result: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          result?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          detected_at: string
          event_category: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          location: Json | null
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          detected_at?: string
          event_category: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          location?: Json | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          detected_at?: string
          event_category?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          location?: Json | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
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
      service_categories: {
        Row: {
          category_group: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          examples: string[] | null
          icon_emoji: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_group?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          examples?: string[] | null
          icon_emoji?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_group?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          examples?: string[] | null
          icon_emoji?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_micro_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subcategory_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subcategory_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subcategory_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_micro_categories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_subcategories"
            referencedColumns: ["id"]
          },
        ]
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
      service_subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_emoji: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_emoji?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_emoji?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
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
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          micro: string
          name_es: string | null
          priority_level: string | null
          question_source: string | null
          questions_logistics: Json
          questions_micro: Json
          sort_index: number | null
          subcategory: string
          typical_duration_hours: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          category_type?: string | null
          created_at?: string
          ibiza_specific?: boolean | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          micro: string
          name_es?: string | null
          priority_level?: string | null
          question_source?: string | null
          questions_logistics?: Json
          questions_micro?: Json
          sort_index?: number | null
          subcategory: string
          typical_duration_hours?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          category_type?: string | null
          created_at?: string
          ibiza_specific?: boolean | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          micro?: string
          name_es?: string | null
          priority_level?: string | null
          question_source?: string | null
          questions_logistics?: Json
          questions_micro?: Json
          sort_index?: number | null
          subcategory?: string
          typical_duration_hours?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      services_micro_versions: {
        Row: {
          actor: string
          change_summary: string | null
          created_at: string | null
          services_micro_id: string
          snapshot: Json
          version_id: number
        }
        Insert: {
          actor: string
          change_summary?: string | null
          created_at?: string | null
          services_micro_id: string
          snapshot: Json
          version_id?: never
        }
        Update: {
          actor?: string
          change_summary?: string | null
          created_at?: string | null
          services_micro_id?: string
          snapshot?: Json
          version_id?: never
        }
        Relationships: []
      }
      services_unified: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          micro: string
          price_range: string | null
          subcategory: string
          typical_duration: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          micro: string
          price_range?: string | null
          subcategory: string
          typical_duration?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          micro?: string
          price_range?: string | null
          subcategory?: string
          typical_duration?: string | null
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
      spam_keywords: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          keyword: string
          severity: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
          severity?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spam_keywords_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          closed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          sla_deadline: string | null
          status: string | null
          subject: string
          ticket_number: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string | null
          subject: string
          ticket_number?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string | null
          subject?: string
          ticket_number?: number
          updated_at?: string | null
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metric_metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          message_id: string | null
          mime_type: string | null
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          message_id?: string | null
          mime_type?: string | null
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ticket_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal_note: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          expires_at: string
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          expires_at?: string
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          expires_at?: string
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          claimed_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          achievement_id: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          achievement_id?: string
          claimed_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_metrics: {
        Row: {
          actions_count: number | null
          bookings_made: number | null
          created_at: string | null
          id: string
          last_active_at: string | null
          messages_sent: number | null
          metric_date: string
          page_views: number | null
          searches_performed: number | null
          sessions_count: number | null
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions_count?: number | null
          bookings_made?: number | null
          created_at?: string | null
          id?: string
          last_active_at?: string | null
          messages_sent?: number | null
          metric_date: string
          page_views?: number | null
          searches_performed?: number | null
          sessions_count?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions_count?: number | null
          bookings_made?: number | null
          created_at?: string | null
          id?: string
          last_active_at?: string | null
          messages_sent?: number | null
          metric_date?: string
          page_views?: number | null
          searches_performed?: number | null
          sessions_count?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          is_displayed: boolean
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          is_displayed?: boolean
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          is_displayed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cohorts: {
        Row: {
          cohort_date: string
          cohort_size: number | null
          created_at: string | null
          id: string
          retention_day_1: number | null
          retention_day_30: number | null
          retention_day_60: number | null
          retention_day_7: number | null
          retention_day_90: number | null
          total_bookings: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          cohort_date: string
          cohort_size?: number | null
          created_at?: string | null
          id?: string
          retention_day_1?: number | null
          retention_day_30?: number | null
          retention_day_60?: number | null
          retention_day_7?: number | null
          retention_day_90?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          cohort_date?: string
          cohort_size?: number | null
          created_at?: string | null
          id?: string
          retention_day_1?: number | null
          retention_day_30?: number | null
          retention_day_60?: number | null
          retention_day_7?: number | null
          retention_day_90?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_compliance_status: {
        Row: {
          compliance_score: number
          created_at: string
          framework_id: string
          id: string
          last_checked_at: string
          requirements_met: Json | null
          requirements_pending: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          compliance_score?: number
          created_at?: string
          framework_id: string
          id?: string
          last_checked_at?: string
          requirements_met?: Json | null
          requirements_pending?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          compliance_score?: number
          created_at?: string
          framework_id?: string
          id?: string
          last_checked_at?: string
          requirements_met?: Json | null
          requirements_pending?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_seen_at: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_seen_at?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_seen_at?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string | null
          feedback_type: string | null
          id: string
          message: string
          page_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          message: string
          page_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          message?: string
          page_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          current_balance: number
          tier_id: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          tier_id?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          tier_id?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          custom_status: string | null
          device_info: Json | null
          last_seen: string
          status: string
          status_emoji: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          custom_status?: string | null
          device_info?: Json | null
          last_seen?: string
          status?: string
          status_emoji?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          custom_status?: string | null
          device_info?: Json | null
          last_seen?: string
          status?: string
          status_emoji?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_roles_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          new_row: Json | null
          old_row: Json | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          new_row?: Json | null
          old_row?: Json | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          new_row?: Json | null
          old_row?: Json | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          location: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          location?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          location?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      uuid_migration_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          job_id: string
          micro_slug: string
          micro_uuid: string | null
          migrated_at: string | null
          migration_status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          micro_slug: string
          micro_uuid?: string | null
          migrated_at?: string | null
          migration_status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          micro_slug?: string
          micro_uuid?: string | null
          migrated_at?: string | null
          migration_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "uuid_migration_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ux_health_checks: {
        Row: {
          check_type: string
          created_at: string
          detected_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          metadata: Json | null
          priority_weight: number | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          check_type: string
          created_at?: string
          detected_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority_weight?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          check_type?: string
          created_at?: string
          detected_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority_weight?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_calls: {
        Row: {
          conversation_id: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          initiated_by: string
          metadata: Json | null
          participants: string[]
          recording_url: string | null
          room_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          initiated_by: string
          metadata?: Json | null
          participants?: string[]
          recording_url?: string | null
          room_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          initiated_by?: string
          metadata?: Json | null
          participants?: string[]
          recording_url?: string | null
          room_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          response_body: string | null
          status_code: number | null
          subscription_id: string | null
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          subscription_id?: string | null
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          status_code?: number | null
          subscription_id?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          secret: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          secret?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_subscriptions: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          is_active: boolean | null
          secret_key: string
          updated_at: string | null
          user_id: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          secret_key: string
          updated_at?: string | null
          user_id?: string | null
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          secret_key?: string
          updated_at?: string | null
          user_id?: string | null
          webhook_url?: string
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
      analytics_live_kpis: {
        Row: {
          abandonments: number | null
          active_sessions: number | null
          events_last_5min: number | null
          events_last_hour: number | null
          field_focuses: number | null
          validation_errors: number | null
          wizard_starts: number | null
        }
        Relationships: []
      }
      currency_exchange_pairs: {
        Row: {
          from_currency: string | null
          rate: number | null
          to_currency: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      legacy_booking_requests: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          id: string | null
          professional_id: string | null
          professional_name: string | null
          professional_quote: number | null
          service_id: string | null
          status: string | null
          title: string | null
          total_estimated_price: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      pricing_variance_summary: {
        Row: {
          avg_actual: number | null
          avg_estimated: number | null
          avg_variance: number | null
          earliest_completion: string | null
          latest_completion: string | null
          project_type: string | null
          total_projects: number | null
        }
        Relationships: []
      }
      professional_profiles_public: {
        Row: {
          bio: string | null
          business_name: string | null
          created_at: string | null
          experience_years: string | null
          hourly_rate: number | null
          instant_booking_enabled: boolean | null
          is_active: boolean | null
          primary_trade: string | null
          response_time_hours: number | null
          service_regions: Json | null
          skills: Json | null
          tagline: string | null
          user_id: string | null
          verification_status: string | null
          work_philosophy: string | null
          zones: Json | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          experience_years?: string | null
          hourly_rate?: number | null
          instant_booking_enabled?: boolean | null
          is_active?: boolean | null
          primary_trade?: string | null
          response_time_hours?: number | null
          service_regions?: Json | null
          skills?: Json | null
          tagline?: string | null
          user_id?: string | null
          verification_status?: string | null
          work_philosophy?: string | null
          zones?: Json | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          experience_years?: string | null
          hourly_rate?: number | null
          instant_booking_enabled?: boolean | null
          is_active?: boolean | null
          primary_trade?: string | null
          response_time_hours?: number | null
          service_regions?: Json | null
          skills?: Json | null
          tagline?: string | null
          user_id?: string | null
          verification_status?: string | null
          work_philosophy?: string | null
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
      services_catalog: {
        Row: {
          category: string | null
          created_at: string | null
          id: string | null
          micro: string | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string | null
          micro?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string | null
          micro?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_assign_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_target_user_id: string
        }
        Returns: undefined
      }
      admin_revoke_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_target_user_id: string
        }
        Returns: undefined
      }
      aggregate_platform_metrics: {
        Args: { p_metric_date: string }
        Returns: undefined
      }
      bulk_user_suspend: {
        Args: { reason: string; suspended_by: string; user_ids: string[] }
        Returns: undefined
      }
      bulk_verification_action: {
        Args: {
          action: string
          actioned_by: string
          reason: string
          verification_ids: string[]
        }
        Returns: undefined
      }
      calculate_professional_earnings: {
        Args: {
          p_end_date?: string
          p_professional_id: string
          p_start_date?: string
        }
        Returns: {
          average_per_job: number
          completed_jobs: number
          currency: string
          total_earnings: number
        }[]
      }
      calculate_professional_score: {
        Args: { p_professional_id: string }
        Returns: undefined
      }
      calculate_sla_deadline: {
        Args: { p_created_at?: string; p_priority: string }
        Returns: string
      }
      calculate_user_payment_analytics: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: {
          average_transaction_value: number
          conversion_rate: number
          failed_payments: number
          refund_rate: number
          successful_payments: number
          total_payments: number
          total_revenue: number
        }[]
      }
      calculate_user_retention: {
        Args: { p_cohort_date: string }
        Returns: undefined
      }
      can_access_document: { Args: { doc_id: string }; Returns: boolean }
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
      check_compliance_status: {
        Args: { p_framework_id: string; p_user_id: string }
        Returns: Json
      }
      check_milestone_auto_release: {
        Args: never
        Returns: {
          amount: number
          auto_release_date: string
          contract_id: string
          milestone_id: string
        }[]
      }
      check_rate_limit: { Args: { p_user_id: string }; Returns: Json }
      check_spam_content: { Args: { p_content: string }; Returns: Json }
      check_user_blocked: {
        Args: { p_recipient_id: string; p_sender_id: string }
        Returns: boolean
      }
      cleanup_expired_typing_indicators: { Args: never; Returns: number }
      convert_currency: {
        Args: {
          p_amount: number
          p_from_currency: string
          p_to_currency: string
        }
        Returns: number
      }
      create_booking_reminders: {
        Args: { p_booking_id: string; p_event_start: string; p_user_id: string }
        Returns: undefined
      }
      create_job_version: {
        Args: {
          p_change_reason: string
          p_changed_by: string
          p_job_id: string
          p_new_data: Json
        }
        Returns: string
      }
      create_payment_schedule: {
        Args: {
          p_currency: string
          p_frequency: string
          p_installment_count: number
          p_job_id: string
          p_start_date?: string
          p_total_amount: number
        }
        Returns: string
      }
      detect_fraud_pattern: {
        Args: { p_pattern_type: string; p_severity: string; p_user_id: string }
        Returns: boolean
      }
      escalation_reasons_updater: {
        Args: { p_dispute_id: string }
        Returns: undefined
      }
      execute_resolution: {
        Args: { p_resolution_id: string }
        Returns: undefined
      }
      generate_payment_receipt: {
        Args: { p_payment_id: string }
        Returns: Json
      }
      generate_receipt_number: { Args: never; Returns: string }
      get_active_impersonation_session: {
        Args: never
        Returns: {
          actions_taken: number
          admin_id: string
          expires_at: string
          id: string
          reason: string
          target_user_id: string
        }[]
      }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_auto_closeable_disputes: {
        Args: never
        Returns: {
          days_open: number
          dispute_id: string
        }[]
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
      get_cached_kpi: { Args: { p_cache_key: string }; Returns: Json }
      get_dashboard_kpis:
        | {
            Args: { p_end_date?: string; p_start_date?: string }
            Returns: Json
          }
        | { Args: never; Returns: Json }
      get_exchange_rate: {
        Args: { p_from_currency: string; p_to_currency: string }
        Returns: number
      }
      get_milestone_progress: {
        Args: { p_contract_id: string }
        Returns: {
          completed_milestones: number
          pending_amount: number
          pending_milestones: number
          progress_percentage: number
          released_amount: number
          total_amount: number
          total_milestones: number
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
      get_online_users_count: { Args: never; Returns: number }
      get_payment_method_distribution: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: {
          count: number
          payment_method: string
          percentage: number
          total_amount: number
        }[]
      }
      get_payment_statistics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_payments_needing_reminders: {
        Args: never
        Returns: {
          amount: number
          currency: string
          due_date: string
          installment_number: number
          job_id: string
          payment_id: string
          reminder_days: number
          schedule_id: string
          user_id: string
        }[]
      }
      get_pending_reminders: {
        Args: never
        Returns: {
          booking_id: string
          delivery_method: string
          event_location: Json
          event_start: string
          event_title: string
          reminder_id: string
          reminder_type: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_popular_searches: {
        Args: { p_limit?: number; p_period?: string; p_search_type?: string }
        Returns: {
          popularity_score: number
          search_term: string
          search_type: string
        }[]
      }
      get_professional_earnings_summary: {
        Args: { p_professional_id: string }
        Returns: Json
      }
      get_profile_view_count: {
        Args: { p_professional_id: string }
        Returns: number
      }
      get_recent_profile_views: {
        Args: { p_professional_id: string }
        Returns: number
      }
      get_revenue_trend: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          date: string
          payment_count: number
          revenue: number
        }[]
      }
      get_reviews_for_user: {
        Args: {
          p_limit?: number
          p_min_rating?: number
          p_offset?: number
          p_user_id: string
        }
        Returns: {
          category_ratings: Json
          comment: string
          created_at: string
          helpful_count: number
          id: string
          is_verified: boolean
          job_id: string
          rating: number
          response_at: string
          response_text: string
          reviewer_avatar: string
          reviewer_id: string
          reviewer_name: string
          title: string
        }[]
      }
      get_sla_breach_tickets: {
        Args: never
        Returns: {
          assigned_to: string
          minutes_until_breach: number
          priority: string
          sla_deadline: string
          subject: string
          ticket_id: string
          ticket_number: number
          user_id: string
        }[]
      }
      get_top_performing_professionals: {
        Args: { p_end_date?: string; p_limit?: number; p_start_date?: string }
        Returns: {
          average_rating: number
          jobs_completed: number
          professional_id: string
          professional_name: string
          success_rate: number
          total_earnings: number
        }[]
      }
      get_top_revenue_sources: {
        Args: {
          p_end_date: string
          p_limit?: number
          p_start_date: string
          p_user_id: string
        }
        Returns: {
          job_id: string
          job_title: string
          payment_count: number
          total_revenue: number
        }[]
      }
      get_unread_message_count: { Args: { p_user_id: string }; Returns: number }
      get_upcoming_payments: {
        Args: { p_days_ahead?: number; p_user_id?: string }
        Returns: {
          amount: number
          currency: string
          due_date: string
          installment_number: number
          job_id: string
          payment_id: string
          schedule_id: string
          status: string
        }[]
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      get_uuid_migration_stats: {
        Args: never
        Returns: {
          completion_percentage: number
          failed_migrations: number
          jobs_with_uuid: number
          jobs_without_uuid: number
          skipped_migrations: number
          successful_migrations: number
          total_jobs: number
        }[]
      }
      has_admin_scope: {
        Args: { p_scope: string; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: boolean
      }
      increment_message_count: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_feature_on: { Args: { p_key: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_changes?: Json
          p_entity_id?: string
          p_entity_type?: string
        }
        Returns: string
      }
      log_admin_action:
        | {
            Args: {
              p_action: string
              p_entity_id: string
              p_entity_type: string
              p_meta?: Json
            }
            Returns: string
          }
        | {
            Args: {
              p_action: string
              p_changes?: Json
              p_entity_id?: string
              p_entity_type?: string
            }
            Returns: string
          }
      log_security_event: {
        Args: {
          p_event_category: string
          p_event_data?: Json
          p_event_type: string
          p_severity?: string
          p_user_id: string
        }
        Returns: string
      }
      mark_overdue_invoices: { Args: never; Returns: number }
      mark_party_agreement: {
        Args: { p_dispute_id: string; p_field: string }
        Returns: undefined
      }
      mark_reminder_sent: {
        Args: {
          p_error_message?: string
          p_reminder_id: string
          p_success: boolean
        }
        Returns: undefined
      }
      mark_user_online: {
        Args: {
          p_custom_status?: string
          p_device_info?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      migrate_job_uuids: {
        Args: never
        Returns: {
          found_uuid: string
          job_id: string
          micro_slug: string
          status: string
        }[]
      }
      should_expose_feature: {
        Args: { p_flag_key: string; p_user_id: string }
        Returns: boolean
      }
      split_milestone_into_phases: {
        Args: { p_contract_id: string; p_phases: Json }
        Returns: undefined
      }
      track_analytics_event: {
        Args: {
          p_event_category?: string
          p_event_name?: string
          p_event_properties?: Json
          p_page_url?: string
          p_referrer?: string
          p_session_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      track_search_analytics: {
        Args: {
          p_results_count: number
          p_search_term: string
          p_search_type: string
        }
        Returns: undefined
      }
      update_rating_summary: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
      validate_impersonation_session: {
        Args: { p_session_id: string }
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
