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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accreditation_decisions: {
        Row: {
          application_id: string
          created_at: string
          decided_by: string | null
          decision: string
          id: string
          level_assigned: string | null
          metadata: Json | null
          reason: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          decided_by?: string | null
          decision: string
          id?: string
          level_assigned?: string | null
          metadata?: Json | null
          reason?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          decided_by?: string | null
          decision?: string
          id?: string
          level_assigned?: string | null
          metadata?: Json | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accreditation_decisions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "psychologist_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_history: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_subscriptions: {
        Row: {
          amount_eur: number
          amount_mad: number
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          status?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_meter: {
        Row: {
          id: string
          message_count: number
          usage_date: string
          user_id: string
        }
        Insert: {
          id?: string
          message_count?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          id?: string
          message_count?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      all_access_subscriptions: {
        Row: {
          amount_eur: number
          amount_mad: number
          billing_cycle: string
          created_at: string
          current_period_end: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      anamnesis_reminders: {
        Row: {
          anamnesis_id: string | null
          booking_id: string | null
          channel: string
          client_id: string
          created_at: string
          due_at: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          anamnesis_id?: string | null
          booking_id?: string | null
          channel?: string
          client_id: string
          created_at?: string
          due_at: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          anamnesis_id?: string | null
          booking_id?: string | null
          channel?: string
          client_id?: string
          created_at?: string
          due_at?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      app_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          environment: string
          event: string
          id: number
          level: string
          message: string | null
          metadata: Json
          release: string | null
          request_id: string | null
          route: string | null
          source: string
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          environment?: string
          event: string
          id?: number
          level?: string
          message?: string | null
          metadata?: Json
          release?: string | null
          request_id?: string | null
          route?: string | null
          source?: string
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          environment?: string
          event?: string
          id?: number
          level?: string
          message?: string | null
          metadata?: Json
          release?: string | null
          request_id?: string | null
          route?: string | null
          source?: string
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_premium_reports: {
        Row: {
          amount_eur: number
          amount_mad: number
          created_at: string
          generated_at: string | null
          id: string
          payment_status: string
          pdf_url: string | null
          protocol: Json
          result_id: string
          user_id: string
        }
        Insert: {
          amount_eur?: number
          amount_mad?: number
          created_at?: string
          generated_at?: string | null
          id?: string
          payment_status?: string
          pdf_url?: string | null
          protocol?: Json
          result_id: string
          user_id: string
        }
        Update: {
          amount_eur?: number
          amount_mad?: number
          created_at?: string
          generated_at?: string | null
          id?: string
          payment_status?: string
          pdf_url?: string | null
          protocol?: Json
          result_id?: string
          user_id?: string
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          created_at: string | null
          dimension: string | null
          id: string
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          dimension?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          question_text: string
          question_type?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          dimension?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          answers: Json
          assessment_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          interpretation: string | null
          scores: Json | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          assessment_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          interpretation?: string | null
          scores?: Json | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          assessment_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          interpretation?: string | null
          scores?: Json | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          estimated_minutes: number
          id: string
          is_published: boolean | null
          question_count: number
          title: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_published?: boolean | null
          question_count?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_published?: boolean | null
          question_count?: number
          title?: string
        }
        Relationships: []
      }
      athlete_profiles: {
        Row: {
          coach_id: string | null
          confidence_score: number | null
          created_at: string | null
          focus_score: number | null
          id: string
          mental_readiness_score: number | null
          position: string | null
          resilience_score: number | null
          sport: string | null
          team: string | null
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          focus_score?: number | null
          id: string
          mental_readiness_score?: number | null
          position?: string | null
          resilience_score?: number | null
          sport?: string | null
          team?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          focus_score?: number | null
          id?: string
          mental_readiness_score?: number | null
          position?: string | null
          resilience_score?: number | null
          sport?: string | null
          team?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      athlete_protocols: {
        Row: {
          category: string
          created_at: string
          description: string
          duration_minutes: number
          focus_areas: string[]
          id: string
          is_published: boolean
          slug: string
          steps: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          duration_minutes: number
          focus_areas?: string[]
          id?: string
          is_published?: boolean
          slug: string
          steps?: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          focus_areas?: string[]
          id?: string
          is_published?: boolean
          slug?: string
          steps?: Json
          title?: string
        }
        Relationships: []
      }
      athlete_subscriptions: {
        Row: {
          amount_eur: number
          amount_mad: number
          billing_cycle: string
          created_at: string
          current_period_end: string
          id: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_training_sessions: {
        Row: {
          athlete_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          metrics: Json | null
          notes: string | null
          scheduled_at: string | null
          session_type: string
          title: string
        }
        Insert: {
          athlete_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          scheduled_at?: string | null
          session_type: string
          title: string
        }
        Update: {
          athlete_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          scheduled_at?: string | null
          session_type?: string
          title?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_role: string | null
          changed: Json | null
          created_at: string
          data_class: string
          id: string
          metadata: Json | null
          record_ref: string | null
          request_ip: unknown
          resource_id: string | null
          resource_type: string
          subject_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_role?: string | null
          changed?: Json | null
          created_at?: string
          data_class?: string
          id?: string
          metadata?: Json | null
          record_ref?: string | null
          request_ip?: unknown
          resource_id?: string | null
          resource_type: string
          subject_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_role?: string | null
          changed?: Json | null
          created_at?: string
          data_class?: string
          id?: string
          metadata?: Json | null
          record_ref?: string | null
          request_ip?: unknown
          resource_id?: string | null
          resource_type?: string
          subject_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          is_available: boolean
          psychologist_id: string
          session_duration_minutes: number | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          is_available?: boolean
          psychologist_id: string
          session_duration_minutes?: number | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          is_available?: boolean
          psychologist_id?: string
          session_duration_minutes?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string | null
          icon: string | null
          is_active: boolean
          name: string
          slug: string
          tier: string
        }
        Insert: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          is_active?: boolean
          name: string
          slug: string
          tier?: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          icon?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          tier?: string
        }
        Relationships: []
      }
      booking_reminders_sent: {
        Row: {
          booking_id: string
          channel: string
          id: string
          metadata: Json
          recipient_role: string
          reminder_type: string
          sent_at: string
        }
        Insert: {
          booking_id: string
          channel: string
          id?: string
          metadata?: Json
          recipient_role: string
          reminder_type: string
          sent_at?: string
        }
        Update: {
          booking_id?: string
          channel?: string
          id?: string
          metadata?: Json
          recipient_role?: string
          reminder_type?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_sent_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_reminders_sent_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_mad: number | null
          created_at: string | null
          decline_reason: string | null
          duration_minutes: number
          id: string
          patient_email: string | null
          patient_id: string
          patient_notes: string | null
          patient_phone: string | null
          payment_status: string | null
          proposal_expires_at: string | null
          proposal_token: string | null
          proposed_by: string | null
          psychologist_id: string
          reminder_1h_enabled: boolean
          reminder_24h_enabled: boolean
          reminder_5min_enabled: boolean
          reminder_channels: Json
          scheduled_at: string
          session_type: string
          status: string
          updated_at: string | null
          video_room_id: string | null
        }
        Insert: {
          amount_mad?: number | null
          created_at?: string | null
          decline_reason?: string | null
          duration_minutes?: number
          id?: string
          patient_email?: string | null
          patient_id: string
          patient_notes?: string | null
          patient_phone?: string | null
          payment_status?: string | null
          proposal_expires_at?: string | null
          proposal_token?: string | null
          proposed_by?: string | null
          psychologist_id: string
          reminder_1h_enabled?: boolean
          reminder_24h_enabled?: boolean
          reminder_5min_enabled?: boolean
          reminder_channels?: Json
          scheduled_at: string
          session_type?: string
          status?: string
          updated_at?: string | null
          video_room_id?: string | null
        }
        Update: {
          amount_mad?: number | null
          created_at?: string | null
          decline_reason?: string | null
          duration_minutes?: number
          id?: string
          patient_email?: string | null
          patient_id?: string
          patient_notes?: string | null
          patient_phone?: string | null
          payment_status?: string | null
          proposal_expires_at?: string | null
          proposal_token?: string | null
          proposed_by?: string | null
          psychologist_id?: string
          reminder_1h_enabled?: boolean
          reminder_24h_enabled?: boolean
          reminder_5min_enabled?: boolean
          reminder_channels?: Json
          scheduled_at?: string
          session_type?: string
          status?: string
          updated_at?: string | null
          video_room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_verifications: {
        Row: {
          certificate_id: string
          certificate_number: string
          created_at: string
          id: string
          is_verified: boolean
          issued_at: string
          recipient_name: string
          title: string
        }
        Insert: {
          certificate_id: string
          certificate_number: string
          created_at?: string
          id?: string
          is_verified?: boolean
          issued_at: string
          recipient_name: string
          title: string
        }
        Update: {
          certificate_id?: string
          certificate_number?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          issued_at?: string
          recipient_name?: string
          title?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at: string | null
          description: string | null
          id: string
          is_verified: boolean
          issued_at: string
          metadata: Json | null
          recipient_name: string
          reference_id: string | null
          title: string
          user_id: string
          verification_url: string | null
        }
        Insert: {
          certificate_number?: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean
          issued_at?: string
          metadata?: Json | null
          recipient_name: string
          reference_id?: string | null
          title: string
          user_id: string
          verification_url?: string | null
        }
        Update: {
          certificate_number?: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean
          issued_at?: string
          metadata?: Json | null
          recipient_name?: string
          reference_id?: string | null
          title?: string
          user_id?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      client_anamneses: {
        Row: {
          audit_c_at_risk: boolean | null
          audit_c_score: number | null
          booking_id: string | null
          client_id: string
          clinical_flags: string[] | null
          completed_at: string | null
          completion_pct: number | null
          consent_at: string | null
          consent_given: boolean
          created_at: string
          current_section: number | null
          gad7_score: number | null
          gad7_severity: string | null
          goals: Json
          history_family: Json
          history_personal: Json
          id: string
          identity: Json
          is_minor_intake: boolean | null
          lifestyle: Json
          medical: Json
          objectives_consent: Json | null
          parent_intake_form_id: string | null
          phq9_score: number | null
          phq9_severity: string | null
          presenting_complaint: Json
          pss10_score: number | null
          pss10_severity: string | null
          psychologist_id: string | null
          relationships: Json | null
          reviewed_at: string | null
          risk_screening: Json
          shared_with_psy_at: string | null
          specialized_module: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          audit_c_at_risk?: boolean | null
          audit_c_score?: number | null
          booking_id?: string | null
          client_id: string
          clinical_flags?: string[] | null
          completed_at?: string | null
          completion_pct?: number | null
          consent_at?: string | null
          consent_given?: boolean
          created_at?: string
          current_section?: number | null
          gad7_score?: number | null
          gad7_severity?: string | null
          goals?: Json
          history_family?: Json
          history_personal?: Json
          id?: string
          identity?: Json
          is_minor_intake?: boolean | null
          lifestyle?: Json
          medical?: Json
          objectives_consent?: Json | null
          parent_intake_form_id?: string | null
          phq9_score?: number | null
          phq9_severity?: string | null
          presenting_complaint?: Json
          pss10_score?: number | null
          pss10_severity?: string | null
          psychologist_id?: string | null
          relationships?: Json | null
          reviewed_at?: string | null
          risk_screening?: Json
          shared_with_psy_at?: string | null
          specialized_module?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          audit_c_at_risk?: boolean | null
          audit_c_score?: number | null
          booking_id?: string | null
          client_id?: string
          clinical_flags?: string[] | null
          completed_at?: string | null
          completion_pct?: number | null
          consent_at?: string | null
          consent_given?: boolean
          created_at?: string
          current_section?: number | null
          gad7_score?: number | null
          gad7_severity?: string | null
          goals?: Json
          history_family?: Json
          history_personal?: Json
          id?: string
          identity?: Json
          is_minor_intake?: boolean | null
          lifestyle?: Json
          medical?: Json
          objectives_consent?: Json | null
          parent_intake_form_id?: string | null
          phq9_score?: number | null
          phq9_severity?: string | null
          presenting_complaint?: Json
          pss10_score?: number | null
          pss10_severity?: string | null
          psychologist_id?: string | null
          relationships?: Json | null
          reviewed_at?: string | null
          risk_screening?: Json
          shared_with_psy_at?: string | null
          specialized_module?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_anamneses_parent_intake_form_id_fkey"
            columns: ["parent_intake_form_id"]
            isOneToOne: false
            referencedRelation: "client_anamneses"
            referencedColumns: ["id"]
          },
        ]
      }
      client_matching_requests: {
        Row: {
          budget_max: number | null
          created_at: string | null
          email: string
          id: string
          languages_preferred: string[]
          location_city: string | null
          name: string
          notes: string | null
          phone: string | null
          prefers_online: boolean | null
          specialty_needed: string
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          created_at?: string | null
          email: string
          id?: string
          languages_preferred?: string[]
          location_city?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          prefers_online?: boolean | null
          specialty_needed: string
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          created_at?: string | null
          email?: string
          id?: string
          languages_preferred?: string[]
          location_city?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          prefers_online?: boolean | null
          specialty_needed?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_matching_requests_specialty_needed_fkey"
            columns: ["specialty_needed"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          ai_moderation_score: number | null
          attachments: Json
          author_id: string
          body: string
          comment_count: number
          created_at: string
          hidden_reason: string | null
          id: string
          is_hidden: boolean
          reaction_count: number
          space_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_moderation_score?: number | null
          attachments?: Json
          author_id: string
          body: string
          comment_count?: number
          created_at?: string
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean
          reaction_count?: number
          space_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_moderation_score?: number | null
          attachments?: Json
          author_id?: string
          body?: string
          comment_count?: number
          created_at?: string
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean
          reaction_count?: number
          space_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "community_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      community_spaces: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_published: boolean
          member_count: number
          name: string
          post_count: number
          slug: string
          tier_required: Database["public"]["Enums"]["membership_tier"]
          type: Database["public"]["Enums"]["space_type"]
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          member_count?: number
          name: string
          post_count?: number
          slug: string
          tier_required?: Database["public"]["Enums"]["membership_tier"]
          type?: Database["public"]["Enums"]["space_type"]
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          member_count?: number
          name?: string
          post_count?: number
          slug?: string
          tier_required?: Database["public"]["Enums"]["membership_tier"]
          type?: Database["public"]["Enums"]["space_type"]
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          amount_saved_mad: number
          coupon_id: string
          created_at: string
          id: string
          redeemed_for: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          amount_saved_mad?: number
          coupon_id: string
          created_at?: string
          id?: string
          redeemed_for: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          amount_saved_mad?: number
          coupon_id?: string
          created_at?: string
          id?: string
          redeemed_for?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_redemptions: number | null
          redemption_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemption_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          completed_modules: string[] | null
          course_id: string
          created_at: string | null
          id: string
          progress_percent: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: string[] | null
          course_id: string
          created_at?: string | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: string[] | null
          course_id?: string
          created_at?: string | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          amount_eur: number | null
          amount_mad: number
          bundle_slug: string | null
          coupon_code: string | null
          course_id: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json
          payment_status: string
          user_id: string
        }
        Insert: {
          amount_eur?: number | null
          amount_mad: number
          bundle_slug?: string | null
          coupon_code?: string | null
          course_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          payment_status?: string
          user_id: string
        }
        Update: {
          amount_eur?: number | null
          amount_mad?: number
          bundle_slug?: string | null
          coupon_code?: string | null
          course_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          payment_status?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_hours: number | null
          id: string
          is_paid: boolean
          is_published: boolean | null
          learning_path: string
          price_eur: number | null
          price_mad: number
          slug: string
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          is_paid?: boolean
          is_published?: boolean | null
          learning_path?: string
          price_eur?: number | null
          price_mad?: number
          slug: string
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          is_paid?: boolean
          is_published?: boolean | null
          learning_path?: string
          price_eur?: number | null
          price_mad?: number
          slug?: string
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      crisis_alerts: {
        Row: {
          alert_type: string
          booking_id: string | null
          client_id: string
          created_at: string | null
          id: string
          intake_form_id: string | null
          notes: string | null
          notified_admin: boolean | null
          notified_psy: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_section: string | null
          source_value: string | null
        }
        Insert: {
          alert_type: string
          booking_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          intake_form_id?: string | null
          notes?: string | null
          notified_admin?: boolean | null
          notified_psy?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_section?: string | null
          source_value?: string | null
        }
        Update: {
          alert_type?: string
          booking_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          intake_form_id?: string | null
          notes?: string | null
          notified_admin?: boolean | null
          notified_psy?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_section?: string | null
          source_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crisis_alerts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_alerts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_alerts_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: false
            referencedRelation: "client_anamneses"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          actor_id: string | null
          body: string | null
          contact_id: string
          created_at: string
          deal_id: string | null
          id: string
          kind: string
          metadata: Json
          occurred_at: string
          subject: string | null
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          contact_id: string
          created_at?: string
          deal_id?: string | null
          id?: string
          kind: string
          metadata?: Json
          occurred_at?: string
          subject?: string | null
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          contact_id?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          kind?: string
          metadata?: Json
          occurred_at?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_automation_rules: {
        Row: {
          active: boolean
          created_at: string
          deal_title: string | null
          deal_value_mad: number
          default_owner: string | null
          event_kind: string
          id: string
          name: string
          notify: boolean
          pipeline: string
          position: number
          set_lifecycle: string | null
          source_match: string | null
          stage: string
          subject_match: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deal_title?: string | null
          deal_value_mad?: number
          default_owner?: string | null
          event_kind: string
          id?: string
          name: string
          notify?: boolean
          pipeline: string
          position?: number
          set_lifecycle?: string | null
          source_match?: string | null
          stage: string
          subject_match?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deal_title?: string | null
          deal_value_mad?: number
          default_owner?: string | null
          event_kind?: string
          id?: string
          name?: string
          notify?: boolean
          pipeline?: string
          position?: number
          set_lifecycle?: string | null
          source_match?: string | null
          stage?: string
          subject_match?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_consents: {
        Row: {
          basis: string
          campaign: string | null
          channel: string
          contact_id: string
          evidence: Json
          expires_at: string | null
          granted: boolean
          id: string
          locale: string | null
          notice_version: string | null
          purpose: string
          receipt_ref: string | null
          recorded_at: string
          source_url: string | null
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          basis?: string
          campaign?: string | null
          channel?: string
          contact_id: string
          evidence?: Json
          expires_at?: string | null
          granted: boolean
          id?: string
          locale?: string | null
          notice_version?: string | null
          purpose: string
          receipt_ref?: string | null
          recorded_at?: string
          source_url?: string | null
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          basis?: string
          campaign?: string | null
          channel?: string
          contact_id?: string
          evidence?: Json
          expires_at?: string | null
          granted?: boolean
          id?: string
          locale?: string | null
          notice_version?: string | null
          purpose?: string
          receipt_ref?: string | null
          recorded_at?: string
          source_url?: string | null
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_consents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          city: string | null
          contact_type: string
          country: string | null
          created_at: string
          data_class: string
          email: string
          first_touch: Json
          full_name: string | null
          id: string
          last_activity_at: string | null
          lifecycle: string
          locale: string | null
          organisation_id: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          contact_type?: string
          country?: string | null
          created_at?: string
          data_class?: string
          email: string
          first_touch?: Json
          full_name?: string | null
          id?: string
          last_activity_at?: string | null
          lifecycle?: string
          locale?: string | null
          organisation_id?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          contact_type?: string
          country?: string | null
          created_at?: string
          data_class?: string
          email?: string
          first_touch?: Json
          full_name?: string | null
          id?: string
          last_activity_at?: string | null
          lifecycle?: string
          locale?: string | null
          organisation_id?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "crm_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          contact_id: string | null
          created_at: string
          currency: string
          expected_close: string | null
          id: string
          lost_reason: string | null
          organisation_id: string | null
          owner_id: string | null
          pipeline: string
          stage: string
          title: string | null
          updated_at: string
          value_mad: number
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close?: string | null
          id?: string
          lost_reason?: string | null
          organisation_id?: string | null
          owner_id?: string | null
          pipeline: string
          stage: string
          title?: string | null
          updated_at?: string
          value_mad?: number
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close?: string | null
          id?: string
          lost_reason?: string | null
          organisation_id?: string | null
          owner_id?: string | null
          pipeline?: string
          stage?: string
          title?: string | null
          updated_at?: string
          value_mad?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "crm_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_events: {
        Row: {
          contact_id: string | null
          event_type: string
          id: string
          message_id: string | null
          metadata: Json
          occurred_at: string
        }
        Insert: {
          contact_id?: string | null
          event_type: string
          id?: string
          message_id?: string | null
          metadata?: Json
          occurred_at?: string
        }
        Update: {
          contact_id?: string | null
          event_type?: string
          id?: string
          message_id?: string | null
          metadata?: Json
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_email_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "crm_email_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_email_messages: {
        Row: {
          campaign: string | null
          clicked_at: string | null
          contact_id: string | null
          created_at: string
          direction: string
          email: string
          id: string
          metadata: Json
          opened_at: string | null
          preview: string | null
          provider: string
          provider_message_id: string | null
          sent_at: string
          status: string
          subject: string | null
          template: string | null
        }
        Insert: {
          campaign?: string | null
          clicked_at?: string | null
          contact_id?: string | null
          created_at?: string
          direction?: string
          email: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          preview?: string | null
          provider?: string
          provider_message_id?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
          template?: string | null
        }
        Update: {
          campaign?: string | null
          clicked_at?: string | null
          contact_id?: string | null
          created_at?: string
          direction?: string
          email?: string
          id?: string
          metadata?: Json
          opened_at?: string | null
          preview?: string | null
          provider?: string
          provider_message_id?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
          template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_email_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          body: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          id: string
          owner_id: string | null
          read_at: string | null
          severity: string
          title: string
        }
        Insert: {
          body?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          owner_id?: string | null
          read_at?: string | null
          severity?: string
          title: string
        }
        Update: {
          body?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          owner_id?: string | null
          read_at?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notifications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_organisations: {
        Row: {
          billing_email: string | null
          city: string | null
          contract_state: string
          country: string | null
          created_at: string
          ice: string | null
          id: string
          name: string
          notes: string | null
          rc_number: string | null
          sector: string | null
          size_range: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          billing_email?: string | null
          city?: string | null
          contract_state?: string
          country?: string | null
          created_at?: string
          ice?: string | null
          id?: string
          name: string
          notes?: string | null
          rc_number?: string | null
          sector?: string | null
          size_range?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          billing_email?: string | null
          city?: string | null
          contract_state?: string
          country?: string | null
          created_at?: string
          ice?: string | null
          id?: string
          name?: string
          notes?: string | null
          rc_number?: string | null
          sector?: string | null
          size_range?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      crm_staff: {
        Row: {
          created_at: string
          crm_role: string
          granted_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crm_role?: string
          granted_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crm_role?: string
          granted_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_stages: {
        Row: {
          created_at: string
          id: string
          is_lost: boolean
          is_won: boolean
          key: string
          label: string
          pipeline: string
          position: number
          probability: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          key: string
          label: string
          pipeline: string
          position?: number
          probability?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          key?: string
          label?: string
          pipeline?: string
          position?: number
          probability?: number
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          description: string | null
          description_fr: string | null
          icon: string | null
          id: string
          is_active: boolean
          slug: string
          title: string
          title_fr: string | null
          xp_reward: number
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          slug: string
          title: string
          title_fr?: string | null
          xp_reward?: number
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
          title_fr?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      data_subject_requests: {
        Row: {
          channel: string
          created_at: string
          due_at: string
          email: string
          evidence: Json
          export_bytes: number | null
          exported_at: string | null
          fulfilled_at: string | null
          handled_by: string | null
          id: string
          legal_basis: string | null
          notes: string | null
          reference: string | null
          request_type: string
          requested_changes: Json | null
          resolution: string | null
          status: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          due_at?: string
          email: string
          evidence?: Json
          export_bytes?: number | null
          exported_at?: string | null
          fulfilled_at?: string | null
          handled_by?: string | null
          id?: string
          legal_basis?: string | null
          notes?: string | null
          reference?: string | null
          request_type: string
          requested_changes?: Json | null
          resolution?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          due_at?: string
          email?: string
          evidence?: Json
          export_bytes?: number | null
          exported_at?: string | null
          fulfilled_at?: string | null
          handled_by?: string | null
          id?: string
          legal_basis?: string | null
          notes?: string | null
          reference?: string | null
          request_type?: string
          requested_changes?: Json | null
          resolution?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      discharge_summaries: {
        Row: {
          aftercare_recommendations: string | null
          client_id: string
          created_at: string
          final_scores: Json | null
          id: string
          initial_scores: Json | null
          progress_summary: string | null
          psychologist_id: string
          reason: Database["public"]["Enums"]["discharge_reason"]
          referral_to: string | null
          treatment_plan_id: string | null
        }
        Insert: {
          aftercare_recommendations?: string | null
          client_id: string
          created_at?: string
          final_scores?: Json | null
          id?: string
          initial_scores?: Json | null
          progress_summary?: string | null
          psychologist_id: string
          reason?: Database["public"]["Enums"]["discharge_reason"]
          referral_to?: string | null
          treatment_plan_id?: string | null
        }
        Update: {
          aftercare_recommendations?: string | null
          client_id?: string
          created_at?: string
          final_scores?: Json | null
          id?: string
          initial_scores?: Json | null
          progress_summary?: string | null
          psychologist_id?: string
          reason?: Database["public"]["Enums"]["discharge_reason"]
          referral_to?: string | null
          treatment_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discharge_summaries_referral_to_fkey"
            columns: ["referral_to"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discharge_summaries_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          metadata: Json | null
          mime_type: string | null
          psychologist_id: string | null
          session_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          psychologist_id?: string | null
          session_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          psychologist_id?: string | null
          session_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      edge_rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      experiment_winners: {
        Row: {
          auto: boolean
          confidence: number | null
          control_rate: number | null
          decided_at: string
          experiment_id: string
          id: string
          lift_pct: number | null
          promoted_by: string | null
          traffic_per_arm: number | null
          winner_rate: number | null
          winning_variant: string
        }
        Insert: {
          auto?: boolean
          confidence?: number | null
          control_rate?: number | null
          decided_at?: string
          experiment_id: string
          id?: string
          lift_pct?: number | null
          promoted_by?: string | null
          traffic_per_arm?: number | null
          winner_rate?: number | null
          winning_variant: string
        }
        Update: {
          auto?: boolean
          confidence?: number | null
          control_rate?: number | null
          decided_at?: string
          experiment_id?: string
          id?: string
          lift_pct?: number | null
          promoted_by?: string | null
          traffic_per_arm?: number | null
          winner_rate?: number | null
          winning_variant?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          contact_id: string | null
          created_at: string
          experiment_id: string | null
          id: string
          session_token: string | null
          step: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          variant: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          session_token?: string | null
          step: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          session_token?: string | null
          step?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      gamification_badges: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description: string | null
          description_fr: string | null
          icon: string | null
          name: string
          name_fr: string | null
          rarity: string
          slug: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          description_fr?: string | null
          icon?: string | null
          name: string
          name_fr?: string | null
          rarity?: string
          slug: string
          xp_reward?: number
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          description_fr?: string | null
          icon?: string | null
          name?: string
          name_fr?: string | null
          rarity?: string
          slug?: string
          xp_reward?: number
        }
        Relationships: []
      }
      gamification_levels: {
        Row: {
          color: string
          created_at: string | null
          level: number
          name: string
          name_fr: string | null
          xp_required: number
        }
        Insert: {
          color?: string
          created_at?: string | null
          level: number
          name: string
          name_fr?: string | null
          xp_required?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          level?: number
          name?: string
          name_fr?: string | null
          xp_required?: number
        }
        Relationships: []
      }
      growth_leads: {
        Row: {
          consent_marketing: boolean
          converted_user_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          ip_hash: string | null
          locale: string | null
          nurture_stage: string | null
          phone: string | null
          score_breakdown: Json | null
          score_total: number | null
          source: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          consent_marketing?: boolean
          converted_user_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          ip_hash?: string | null
          locale?: string | null
          nurture_stage?: string | null
          phone?: string | null
          score_breakdown?: Json | null
          score_total?: number | null
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          consent_marketing?: boolean
          converted_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          ip_hash?: string | null
          locale?: string | null
          nurture_stage?: string | null
          phone?: string | null
          score_breakdown?: Json | null
          score_total?: number | null
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      homework_assignments: {
        Row: {
          category: Database["public"]["Enums"]["homework_category"]
          client_id: string
          client_response: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          psychologist_id: string
          session_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["homework_category"]
          client_id: string
          client_response?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          psychologist_id: string
          session_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["homework_category"]
          client_id?: string
          client_response?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          psychologist_id?: string
          session_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_clinical_briefs: {
        Row: {
          ai_model: string | null
          brief_markdown: string
          brief_pdf_path: string | null
          created_at: string | null
          generated_at: string | null
          generation_tokens_used: number | null
          id: string
          intake_form_id: string
          key_history_points: string[] | null
          motif_synthesis: string | null
          notes_by_psy: string | null
          psychologist_id: string
          read_by_psy_at: string | null
          red_flags: string[] | null
          scales_summary: Json | null
          treatment_suggestions: string[] | null
          updated_at: string | null
        }
        Insert: {
          ai_model?: string | null
          brief_markdown?: string
          brief_pdf_path?: string | null
          created_at?: string | null
          generated_at?: string | null
          generation_tokens_used?: number | null
          id?: string
          intake_form_id: string
          key_history_points?: string[] | null
          motif_synthesis?: string | null
          notes_by_psy?: string | null
          psychologist_id: string
          read_by_psy_at?: string | null
          red_flags?: string[] | null
          scales_summary?: Json | null
          treatment_suggestions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          ai_model?: string | null
          brief_markdown?: string
          brief_pdf_path?: string | null
          created_at?: string | null
          generated_at?: string | null
          generation_tokens_used?: number | null
          id?: string
          intake_form_id?: string
          key_history_points?: string[] | null
          motif_synthesis?: string | null
          notes_by_psy?: string | null
          psychologist_id?: string
          read_by_psy_at?: string | null
          red_flags?: string[] | null
          scales_summary?: Json | null
          treatment_suggestions?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_clinical_briefs_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: true
            referencedRelation: "client_anamneses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_counters: {
        Row: {
          last_value: number
          series: string
          year: number
        }
        Insert: {
          last_value?: number
          series: string
          year: number
        }
        Update: {
          last_value?: number
          series?: string
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          booking_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          due_at: string | null
          id: string
          issued_at: string
          kind: string
          legal_mentions: string
          notes: string | null
          number: string
          organisation_id: string | null
          payment_ref: string
          pdf_path: string | null
          series: string
          status: string
          subtotal_mad: number
          total_mad: number
          updated_at: string
          vat_mad: number
        }
        Insert: {
          booking_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          due_at?: string | null
          id?: string
          issued_at?: string
          kind?: string
          legal_mentions?: string
          notes?: string | null
          number: string
          organisation_id?: string | null
          payment_ref: string
          pdf_path?: string | null
          series?: string
          status?: string
          subtotal_mad: number
          total_mad: number
          updated_at?: string
          vat_mad?: number
        }
        Update: {
          booking_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          due_at?: string | null
          id?: string
          issued_at?: string
          kind?: string
          legal_mentions?: string
          notes?: string | null
          number?: string
          organisation_id?: string | null
          payment_ref?: string
          pdf_path?: string | null
          series?: string
          status?: string
          subtotal_mad?: number
          total_mad?: number
          updated_at?: string
          vat_mad?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          ai_summary: string | null
          content: string
          created_at: string | null
          id: string
          mood_tag: string | null
          prompt: string | null
          synthesized_at: string | null
          tags: string[] | null
          themes: string[]
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          content: string
          created_at?: string | null
          id?: string
          mood_tag?: string | null
          prompt?: string | null
          synthesized_at?: string | null
          tags?: string[] | null
          themes?: string[]
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          content?: string
          created_at?: string | null
          id?: string
          mood_tag?: string | null
          prompt?: string | null
          synthesized_at?: string | null
          tags?: string[] | null
          themes?: string[]
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          concerns: string
          created_at: string | null
          id: string
          preferences: string | null
          psychologist_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          concerns: string
          created_at?: string | null
          id?: string
          preferences?: string | null
          psychologist_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          concerns?: string
          created_at?: string | null
          id?: string
          preferences?: string | null
          psychologist_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_acceptances: {
        Row: {
          accepted_at: string
          contact_id: string | null
          document_id: string
          id: string
          ip: unknown
          method: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string
          contact_id?: string | null
          document_id: string
          id?: string
          ip?: unknown
          method?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string
          contact_id?: string | null
          document_id?: string
          id?: string
          ip?: unknown
          method?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_acceptances_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_acceptances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          body_md: string
          created_at: string
          effective_from: string
          id: string
          locale: string
          published: boolean
          slug: string
          title: string
          version: string
        }
        Insert: {
          body_md: string
          created_at?: string
          effective_from?: string
          id?: string
          locale: string
          published?: boolean
          slug: string
          title: string
          version: string
        }
        Update: {
          body_md?: string
          created_at?: string
          effective_from?: string
          id?: string
          locale?: string
          published?: boolean
          slug?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          features: Json
          is_active: boolean
          name: string
          price_annual_mad: number
          price_monthly_mad: number
          sort_order: number
          stripe_price_annual: string | null
          stripe_price_monthly: string | null
          tagline: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          is_active?: boolean
          name: string
          price_annual_mad?: number
          price_monthly_mad?: number
          sort_order?: number
          stripe_price_annual?: string | null
          stripe_price_monthly?: string | null
          tagline?: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          is_active?: boolean
          name?: string
          price_annual_mad?: number
          price_monthly_mad?: number
          sort_order?: number
          stripe_price_annual?: string | null
          stripe_price_monthly?: string | null
          tagline?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string | null
          energy_level: number | null
          id: string
          mood_score: number
          notes: string | null
          recorded_at: string | null
          stress_level: number | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_score: number
          notes?: string | null
          recorded_at?: string | null
          stress_level?: number | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_score?: number
          notes?: string | null
          recorded_at?: string | null
          stress_level?: number | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_bookings: boolean
          email_gamification: boolean
          email_payments: boolean
          email_reminders: boolean
          inapp_all: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_bookings?: boolean
          email_gamification?: boolean
          email_payments?: boolean
          email_reminders?: boolean
          inapp_all?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_bookings?: boolean
          email_gamification?: boolean
          email_payments?: boolean
          email_reminders?: boolean
          inapp_all?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ops_director_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_director_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ops_director_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_director_threads: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          title: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          title?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          title?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_director_threads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ops_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_director_threads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "ops_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_events: {
        Row: {
          created_at: string
          created_by: string
          end_at: string | null
          event_type: string
          id: string
          intake: Json
          start_at: string | null
          status: Database["public"]["Enums"]["ops_event_status"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_at?: string | null
          event_type: string
          id?: string
          intake?: Json
          start_at?: string | null
          status?: Database["public"]["Enums"]["ops_event_status"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_at?: string | null
          event_type?: string
          id?: string
          intake?: Json
          start_at?: string | null
          status?: Database["public"]["Enums"]["ops_event_status"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "ops_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_protocol_phases: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_protocol_phases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ops_events"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_task_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          from_state: Database["public"]["Enums"]["ops_task_state"] | null
          id: string
          note: string | null
          task_id: string
          to_state: Database["public"]["Enums"]["ops_task_state"]
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          from_state?: Database["public"]["Enums"]["ops_task_state"] | null
          id?: string
          note?: string | null
          task_id: string
          to_state: Database["public"]["Enums"]["ops_task_state"]
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          from_state?: Database["public"]["Enums"]["ops_task_state"] | null
          id?: string
          note?: string | null
          task_id?: string
          to_state?: Database["public"]["Enums"]["ops_task_state"]
        }
        Relationships: [
          {
            foreignKeyName: "ops_task_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ops_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_tasks: {
        Row: {
          created_at: string
          deadline: string | null
          dependencies: string[]
          description: string | null
          escalation: Json
          event_id: string
          id: string
          owner_role: string | null
          owner_user_id: string | null
          phase_id: string | null
          proof_required: boolean
          proof_url: string | null
          psych_safety_flag: boolean
          state: Database["public"]["Enums"]["ops_task_state"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          dependencies?: string[]
          description?: string | null
          escalation?: Json
          event_id: string
          id?: string
          owner_role?: string | null
          owner_user_id?: string | null
          phase_id?: string | null
          proof_required?: boolean
          proof_url?: string | null
          psych_safety_flag?: boolean
          state?: Database["public"]["Enums"]["ops_task_state"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          dependencies?: string[]
          description?: string | null
          escalation?: Json
          event_id?: string
          id?: string
          owner_role?: string | null
          owner_user_id?: string | null
          phase_id?: string | null
          proof_required?: boolean
          proof_url?: string | null
          psych_safety_flag?: boolean
          state?: Database["public"]["Enums"]["ops_task_state"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "ops_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "ops_protocol_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["ops_member_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["ops_member_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["ops_member_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "ops_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_workspaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kind?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_aggregate_reports: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          org_id: string
          page_count: number | null
          period_end: string | null
          period_start: string | null
          report_type: string
          requested_by: string
          status: string
          storage_path: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id: string
          page_count?: number | null
          period_end?: string | null
          period_start?: string | null
          report_type: string
          requested_by: string
          status?: string
          storage_path?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          page_count?: number | null
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          requested_by?: string
          status?: string
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_aggregate_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      org_pulse_responses: {
        Row: {
          id: string
          mood_score: number
          org_id: string
          sentiment_text: string | null
          stress_level: number
          submission_token: string
          submitted_at: string
          survey_id: string
          workload_level: number
        }
        Insert: {
          id?: string
          mood_score: number
          org_id: string
          sentiment_text?: string | null
          stress_level: number
          submission_token?: string
          submitted_at?: string
          survey_id: string
          workload_level: number
        }
        Update: {
          id?: string
          mood_score?: number
          org_id?: string
          sentiment_text?: string | null
          stress_level?: number
          submission_token?: string
          submitted_at?: string
          survey_id?: string
          workload_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "org_pulse_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "org_pulse_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      org_pulse_surveys: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          org_id: string
          starts_at: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          org_id: string
          starts_at?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          org_id?: string
          starts_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_pulse_surveys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      org_subscription_plans: {
        Row: {
          created_at: string
          display_order: number
          features: Json
          id: string
          is_active: boolean
          max_seats: number | null
          monthly_eur: number | null
          monthly_mad: number
          name: string
          slug: string
          tier: string
          yearly_eur: number | null
          yearly_mad: number | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_seats?: number | null
          monthly_eur?: number | null
          monthly_mad?: number
          name: string
          slug: string
          tier: string
          yearly_eur?: number | null
          yearly_mad?: number | null
        }
        Update: {
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_seats?: number | null
          monthly_eur?: number | null
          monthly_mad?: number
          name?: string
          slug?: string
          tier?: string
          yearly_eur?: number | null
          yearly_mad?: number | null
        }
        Relationships: []
      }
      organization_accounts: {
        Row: {
          billing_address: string | null
          billing_cycle: string | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          country: string | null
          created_at: string | null
          ice: string | null
          id: string
          if_number: string | null
          industry: string | null
          logo_url: string | null
          monthly_price_mad: number | null
          name: string
          owner_id: string
          pdf_logo_url: string | null
          pdf_primary_color: string | null
          pdf_signature_label: string | null
          plan_type: string
          rc_number: string | null
          seats_total: number
          seats_used: number
          size_range: string | null
          subscription_status: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_cycle?: string | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          industry?: string | null
          logo_url?: string | null
          monthly_price_mad?: number | null
          name: string
          owner_id: string
          pdf_logo_url?: string | null
          pdf_primary_color?: string | null
          pdf_signature_label?: string | null
          plan_type?: string
          rc_number?: string | null
          seats_total?: number
          seats_used?: number
          size_range?: string | null
          subscription_status?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_cycle?: string | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          industry?: string | null
          logo_url?: string | null
          monthly_price_mad?: number | null
          name?: string
          owner_id?: string
          pdf_logo_url?: string | null
          pdf_primary_color?: string | null
          pdf_signature_label?: string | null
          plan_type?: string
          rc_number?: string | null
          seats_total?: number
          seats_used?: number
          size_range?: string | null
          subscription_status?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      organization_applications: {
        Row: {
          approved_org_id: string | null
          city: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          country: string | null
          created_at: string
          desired_seats: number | null
          ice: string | null
          id: string
          if_number: string | null
          industry: string | null
          message: string | null
          organization_name: string
          rc_number: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          size_range: string | null
          status: string
          updated_at: string
          use_case: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          approved_org_id?: string | null
          city?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          desired_seats?: number | null
          ice?: string | null
          id?: string
          if_number?: string | null
          industry?: string | null
          message?: string | null
          organization_name: string
          rc_number?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_range?: string | null
          status?: string
          updated_at?: string
          use_case?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          approved_org_id?: string | null
          city?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          desired_seats?: number | null
          ice?: string | null
          id?: string
          if_number?: string | null
          industry?: string | null
          message?: string | null
          organization_name?: string
          rc_number?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_range?: string | null
          status?: string
          updated_at?: string
          use_case?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_applications_approved_org_id_fkey"
            columns: ["approved_org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_diagnostics: {
        Row: {
          completed_at: string | null
          conducted_by: string | null
          created_at: string | null
          diagnostic_type: string
          id: string
          organization_id: string
          recommendations: string | null
          results: Json | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          conducted_by?: string | null
          created_at?: string | null
          diagnostic_type: string
          id?: string
          organization_id: string
          recommendations?: string | null
          results?: Json | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          conducted_by?: string | null
          created_at?: string | null
          diagnostic_type?: string
          id?: string
          organization_id?: string
          recommendations?: string | null
          results?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_diagnostics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invoices: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          org_id: string
          paid_at: string | null
          period_end: string
          period_start: string
          seats_billed: number
          status: string
          subtotal_mad: number
          tax_mad: number | null
          tax_rate: number | null
          total_mad: number | null
          unit_price_mad: number
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          org_id: string
          paid_at?: string | null
          period_end: string
          period_start: string
          seats_billed: number
          status?: string
          subtotal_mad: number
          tax_mad?: number | null
          tax_rate?: number | null
          total_mad?: number | null
          unit_price_mad: number
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          org_id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          seats_billed?: number
          status?: string
          subtotal_mad?: number
          tax_mad?: number | null
          tax_rate?: number | null
          total_mad?: number | null
          unit_price_mad?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          email: string
          full_name: string | null
          id: string
          invite_token: string | null
          invited_at: string | null
          joined_at: string | null
          org_id: string
          role: string
          sessions_limit: number | null
          sessions_used: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          email: string
          full_name?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          joined_at?: string | null
          org_id: string
          role?: string
          sessions_limit?: number | null
          sessions_used?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          joined_at?: string | null
          org_id?: string
          role?: string
          sessions_limit?: number | null
          sessions_used?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_profiles: {
        Row: {
          admin_user_id: string
          burnout_risk_index: number | null
          city: string | null
          created_at: string | null
          employee_count: number | null
          engagement_score: number | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
          wellbeing_score: number | null
        }
        Insert: {
          admin_user_id: string
          burnout_risk_index?: number | null
          city?: string | null
          created_at?: string | null
          employee_count?: number | null
          engagement_score?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          wellbeing_score?: number | null
        }
        Update: {
          admin_user_id?: string
          burnout_risk_index?: number | null
          city?: string | null
          created_at?: string | null
          employee_count?: number | null
          engagement_score?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          wellbeing_score?: number | null
        }
        Relationships: []
      }
      payment_payouts: {
        Row: {
          commission_mad: number
          created_at: string
          gross_mad: number
          id: string
          net_mad: number
          notes: string | null
          paid_at: string | null
          payout_method: string | null
          payout_reference: string | null
          period_end: string
          period_start: string
          psychologist_id: string
          status: string
          transaction_count: number
          updated_at: string
          vat_mad: number
        }
        Insert: {
          commission_mad?: number
          created_at?: string
          gross_mad?: number
          id?: string
          net_mad?: number
          notes?: string | null
          paid_at?: string | null
          payout_method?: string | null
          payout_reference?: string | null
          period_end: string
          period_start: string
          psychologist_id: string
          status?: string
          transaction_count?: number
          updated_at?: string
          vat_mad?: number
        }
        Update: {
          commission_mad?: number
          created_at?: string
          gross_mad?: number
          id?: string
          net_mad?: number
          notes?: string | null
          paid_at?: string | null
          payout_method?: string | null
          payout_reference?: string | null
          period_end?: string
          period_start?: string
          psychologist_id?: string
          status?: string
          transaction_count?: number
          updated_at?: string
          vat_mad?: number
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_mad: number
          booking_id: string
          commission_mad: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          invoice_number: string | null
          invoice_pdf_url: string | null
          net_to_psychologist_mad: number
          paid_at: string | null
          patient_id: string
          provider: string
          provider_metadata: Json | null
          provider_payment_id: string | null
          psychologist_id: string
          refunded_at: string | null
          status: string
          transaction_type: string
          updated_at: string
          vat_mad: number
        }
        Insert: {
          amount_mad: number
          booking_id: string
          commission_mad?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          net_to_psychologist_mad?: number
          paid_at?: string | null
          patient_id: string
          provider?: string
          provider_metadata?: Json | null
          provider_payment_id?: string | null
          psychologist_id: string
          refunded_at?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
          vat_mad?: number
        }
        Update: {
          amount_mad?: number
          booking_id?: string
          commission_mad?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          net_to_psychologist_mad?: number
          paid_at?: string | null
          patient_id?: string
          provider?: string
          provider_metadata?: Json | null
          provider_payment_id?: string | null
          psychologist_id?: string
          refunded_at?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
          vat_mad?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_mad: number
          bank_ref: string | null
          created_at: string
          id: string
          invoice_id: string | null
          matched_at: string
          matched_by: string | null
          method: string
          raw_statement: Json
          received_at: string
        }
        Insert: {
          amount_mad: number
          bank_ref?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          matched_at?: string
          matched_by?: string | null
          method?: string
          raw_statement?: Json
          received_at?: string
        }
        Update: {
          amount_mad?: number
          bank_ref?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          matched_at?: string
          matched_by?: string | null
          method?: string
          raw_statement?: Json
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_event_deliveries: {
        Row: {
          attempts: number
          consumer: string
          created_at: string
          delivered_at: string | null
          event_id: string
          id: string
          last_error: string | null
          next_attempt_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          consumer: string
          created_at?: string
          delivered_at?: string | null
          event_id: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          consumer?: string
          created_at?: string
          delivered_at?: string | null
          event_id?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_event_deliveries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "platform_events"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_events: {
        Row: {
          actor_id: string | null
          correlation_id: string | null
          created_at: string
          event_type: string
          event_version: number
          id: string
          idempotency_key: string | null
          occurred_at: string
          payload: Json
          subject_id: string | null
          subject_type: string
          tenant_id: string | null
        }
        Insert: {
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          event_type: string
          event_version?: number
          id?: string
          idempotency_key?: string | null
          occurred_at?: string
          payload?: Json
          subject_id?: string | null
          subject_type: string
          tenant_id?: string | null
        }
        Update: {
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          event_type?: string
          event_version?: number
          id?: string
          idempotency_key?: string | null
          occurred_at?: string
          payload?: Json
          subject_id?: string | null
          subject_type?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      platform_pricing_config: {
        Row: {
          commission_rate: number
          created_at: string
          currency: string
          deposit_percentage: number
          id: string
          is_active: boolean
          max_session_price_mad: number
          min_session_price_mad: number
          notes: string | null
          updated_at: string
          updated_by: string | null
          vat_rate: number
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          currency?: string
          deposit_percentage?: number
          id?: string
          is_active?: boolean
          max_session_price_mad?: number
          min_session_price_mad?: number
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_rate?: number
        }
        Update: {
          commission_rate?: number
          created_at?: string
          currency?: string
          deposit_percentage?: number
          id?: string
          is_active?: boolean
          max_session_price_mad?: number
          min_session_price_mad?: number
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_rate?: number
        }
        Relationships: []
      }
      platform_pricing_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          commission_rate: number
          config_id: string
          currency: string
          deposit_percentage: number
          id: string
          max_session_price_mad: number
          min_session_price_mad: number
          vat_rate: number
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          commission_rate: number
          config_id: string
          currency: string
          deposit_percentage: number
          id?: string
          max_session_price_mad: number
          min_session_price_mad: number
          vat_rate: number
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          commission_rate?: number
          config_id?: string
          currency?: string
          deposit_percentage?: number
          id?: string
          max_session_price_mad?: number
          min_session_price_mad?: number
          vat_rate?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_hidden: boolean
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_preferences: {
        Row: {
          created_at: string
          marketing_opt_out: boolean
          processing_restricted: boolean
          research_opt_out: boolean
          restriction_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          marketing_opt_out?: boolean
          processing_restricted?: boolean
          research_opt_out?: boolean
          restriction_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          marketing_opt_out?: boolean
          processing_restricted?: boolean
          research_opt_out?: boolean
          restriction_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          currency_preference: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          is_suspended: boolean
          phone: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          currency_preference?: string
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          is_suspended?: boolean
          phone?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          currency_preference?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          phone?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_requests: {
        Row: {
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          organization_name: string
          organization_size: string | null
          phone: string | null
          service_interest: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          organization_name: string
          organization_size?: string | null
          phone?: string | null
          service_interest: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          organization_name?: string
          organization_size?: string | null
          phone?: string | null
          service_interest?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      protocol_completions: {
        Row: {
          completed_at: string
          duration_minutes: number | null
          id: string
          protocol_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          protocol_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          protocol_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_completions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "athlete_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      provisioning_attempts: {
        Row: {
          admin_user_id: string | null
          already_provisioned: boolean
          application_id: string
          created_at: string
          duration_ms: number | null
          error_code: string | null
          error_message: string | null
          id: string
          reused_existing_user: boolean
          status: string
          steps: Json
          user_id: string | null
        }
        Insert: {
          admin_user_id?: string | null
          already_provisioned?: boolean
          application_id: string
          created_at?: string
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          reused_existing_user?: boolean
          status: string
          steps?: Json
          user_id?: string | null
        }
        Update: {
          admin_user_id?: string | null
          already_provisioned?: boolean
          application_id?: string
          created_at?: string
          duration_ms?: number | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          reused_existing_user?: boolean
          status?: string
          steps?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      psychologist_applications: {
        Row: {
          accreditation_level: string
          accreditation_number: string | null
          auto_check_flags: Json | null
          auto_check_status: string | null
          auto_checked_at: string | null
          bio_long: string | null
          bio_short: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          desired_hourly_rate_mad: number | null
          doc_auto_entrepreneur_url: string | null
          doc_cin_url: string | null
          doc_cv_url: string | null
          doc_diploma_url: string | null
          doc_insurance_url: string | null
          doc_license_morocco_url: string | null
          doc_order_registration_url: string | null
          doc_rib_url: string | null
          doc_specialty_certs_urls: string[] | null
          document_urls: string[] | null
          email: string
          full_name: string
          gender: string | null
          id: string
          intro_video_url: string | null
          languages: string[] | null
          notes: string | null
          offers_in_person: boolean | null
          offers_online: boolean | null
          phone: string | null
          photo_url: string | null
          populations_served: string[] | null
          preferred_locale: string
          qualifications: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_notes: string | null
          revision_requested_at: string | null
          specialties_requested: string[] | null
          status: string
          submitted_at: string | null
          suggested_level: string | null
          therapy_approaches_requested: string[] | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          accreditation_level?: string
          accreditation_number?: string | null
          auto_check_flags?: Json | null
          auto_check_status?: string | null
          auto_checked_at?: string | null
          bio_long?: string | null
          bio_short?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          desired_hourly_rate_mad?: number | null
          doc_auto_entrepreneur_url?: string | null
          doc_cin_url?: string | null
          doc_cv_url?: string | null
          doc_diploma_url?: string | null
          doc_insurance_url?: string | null
          doc_license_morocco_url?: string | null
          doc_order_registration_url?: string | null
          doc_rib_url?: string | null
          doc_specialty_certs_urls?: string[] | null
          document_urls?: string[] | null
          email: string
          full_name: string
          gender?: string | null
          id?: string
          intro_video_url?: string | null
          languages?: string[] | null
          notes?: string | null
          offers_in_person?: boolean | null
          offers_online?: boolean | null
          phone?: string | null
          photo_url?: string | null
          populations_served?: string[] | null
          preferred_locale?: string
          qualifications?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_notes?: string | null
          revision_requested_at?: string | null
          specialties_requested?: string[] | null
          status?: string
          submitted_at?: string | null
          suggested_level?: string | null
          therapy_approaches_requested?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          accreditation_level?: string
          accreditation_number?: string | null
          auto_check_flags?: Json | null
          auto_check_status?: string | null
          auto_checked_at?: string | null
          bio_long?: string | null
          bio_short?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          desired_hourly_rate_mad?: number | null
          doc_auto_entrepreneur_url?: string | null
          doc_cin_url?: string | null
          doc_cv_url?: string | null
          doc_diploma_url?: string | null
          doc_insurance_url?: string | null
          doc_license_morocco_url?: string | null
          doc_order_registration_url?: string | null
          doc_rib_url?: string | null
          doc_specialty_certs_urls?: string[] | null
          document_urls?: string[] | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          intro_video_url?: string | null
          languages?: string[] | null
          notes?: string | null
          offers_in_person?: boolean | null
          offers_online?: boolean | null
          phone?: string | null
          photo_url?: string | null
          populations_served?: string[] | null
          preferred_locale?: string
          qualifications?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_notes?: string | null
          revision_requested_at?: string | null
          specialties_requested?: string[] | null
          status?: string
          submitted_at?: string | null
          suggested_level?: string | null
          therapy_approaches_requested?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      psychologist_encryption_keys: {
        Row: {
          created_at: string
          id: string
          psychologist_id: string
          rotated_at: string | null
          vault_secret_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          psychologist_id: string
          rotated_at?: string | null
          vault_secret_id: string
        }
        Update: {
          created_at?: string
          id?: string
          psychologist_id?: string
          rotated_at?: string | null
          vault_secret_id?: string
        }
        Relationships: []
      }
      psychologist_languages: {
        Row: {
          language_id: string
          psychologist_id: string
        }
        Insert: {
          language_id: string
          psychologist_id: string
        }
        Update: {
          language_id?: string
          psychologist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_languages_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_profiles: {
        Row: {
          accreditation_level: string | null
          bio: string | null
          boost_type: string | null
          boosted_until: string | null
          calendly_url: string | null
          city: string | null
          created_at: string | null
          deposit_percentage: number
          full_name: string
          gender: string | null
          hourly_rate_mad: number | null
          id: string
          is_accredited: boolean | null
          is_published: boolean | null
          offers_in_person: boolean | null
          offers_online: boolean | null
          photo_url: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          accreditation_level?: string | null
          bio?: string | null
          boost_type?: string | null
          boosted_until?: string | null
          calendly_url?: string | null
          city?: string | null
          created_at?: string | null
          deposit_percentage?: number
          full_name: string
          gender?: string | null
          hourly_rate_mad?: number | null
          id: string
          is_accredited?: boolean | null
          is_published?: boolean | null
          offers_in_person?: boolean | null
          offers_online?: boolean | null
          photo_url?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          accreditation_level?: string | null
          bio?: string | null
          boost_type?: string | null
          boosted_until?: string | null
          calendly_url?: string | null
          city?: string | null
          created_at?: string | null
          deposit_percentage?: number
          full_name?: string
          gender?: string | null
          hourly_rate_mad?: number | null
          id?: string
          is_accredited?: boolean | null
          is_published?: boolean | null
          offers_in_person?: boolean | null
          offers_online?: boolean | null
          photo_url?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      psychologist_specialties: {
        Row: {
          psychologist_id: string
          specialty_id: string
        }
        Insert: {
          psychologist_id: string
          specialty_id: string
        }
        Update: {
          psychologist_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_specialties_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      psychologist_therapy_approaches: {
        Row: {
          psychologist_id: string
          therapy_approach_id: string
        }
        Insert: {
          psychologist_id: string
          therapy_approach_id: string
        }
        Update: {
          psychologist_id?: string
          therapy_approach_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_therapy_approaches_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychologist_therapy_approaches_therapy_approach_id_fkey"
            columns: ["therapy_approach_id"]
            isOneToOne: false
            referencedRelation: "therapy_approaches"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          badge_slug: string | null
          category: string
          created_at: string
          description: string | null
          is_active: boolean
          slug: string
          steps: Json
          tier_required: Database["public"]["Enums"]["membership_tier"]
          title: string
          xp_reward: number
        }
        Insert: {
          badge_slug?: string | null
          category?: string
          created_at?: string
          description?: string | null
          is_active?: boolean
          slug: string
          steps?: Json
          tier_required?: Database["public"]["Enums"]["membership_tier"]
          title: string
          xp_reward?: number
        }
        Update: {
          badge_slug?: string | null
          category?: string
          created_at?: string
          description?: string | null
          is_active?: boolean
          slug?: string
          steps?: Json
          tier_required?: Database["public"]["Enums"]["membership_tier"]
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quests_badge_slug_fkey"
            columns: ["badge_slug"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["slug"]
          },
        ]
      }
      readiness_checkins: {
        Row: {
          cognitive_load: number
          created_at: string
          energy: number
          id: string
          mood: number
          note: string | null
          score: number
          sleep: number
          stress: number
          user_id: string
        }
        Insert: {
          cognitive_load: number
          created_at?: string
          energy: number
          id?: string
          mood: number
          note?: string | null
          score: number
          sleep: number
          stress: number
          user_id: string
        }
        Update: {
          cognitive_load?: number
          created_at?: string
          energy?: number
          id?: string
          mood?: number
          note?: string | null
          score?: number
          sleep?: number
          stress?: number
          user_id?: string
        }
        Relationships: []
      }
      referral_credits: {
        Row: {
          created_at: string
          delta_mad: number
          id: string
          metadata: Json
          reason: string
          referral_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta_mad: number
          id?: string
          metadata?: Json
          reason: string
          referral_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta_mad?: number
          id?: string
          metadata?: Json
          reason?: string
          referral_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referee_email: string | null
          referee_user_id: string | null
          referrer_id: string
          reward_granted_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referee_email?: string | null
          referee_user_id?: string | null
          referrer_id: string
          reward_granted_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referee_email?: string | null
          referee_user_id?: string | null
          referrer_id?: string
          reward_granted_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      resource_completions: {
        Row: {
          action: string
          created_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_completions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_topics: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          name_ar: string | null
          name_fr: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          name_ar?: string | null
          name_fr?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          name_fr?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          content_md: string | null
          content_url: string | null
          created_at: string
          download_url: string | null
          format: string
          id: string
          image_url: string | null
          is_featured: boolean
          is_premium: boolean
          is_published: boolean
          locale: string
          rating: number | null
          read_minutes: number | null
          slug: string
          summary: string | null
          summary_ar: string | null
          summary_fr: string | null
          title: string
          title_ar: string | null
          title_fr: string | null
          topic_slug: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          category?: string | null
          content_md?: string | null
          content_url?: string | null
          created_at?: string
          download_url?: string | null
          format: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_premium?: boolean
          is_published?: boolean
          locale?: string
          rating?: number | null
          read_minutes?: number | null
          slug: string
          summary?: string | null
          summary_ar?: string | null
          summary_fr?: string | null
          title: string
          title_ar?: string | null
          title_fr?: string | null
          topic_slug?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          category?: string | null
          content_md?: string | null
          content_url?: string | null
          created_at?: string
          download_url?: string | null
          format?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_premium?: boolean
          is_published?: boolean
          locale?: string
          rating?: number | null
          read_minutes?: number | null
          slug?: string
          summary?: string | null
          summary_ar?: string | null
          summary_fr?: string | null
          title?: string
          title_ar?: string | null
          title_fr?: string | null
          topic_slug?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string | null
          id: string
          psychologist_id: string
          rating: number
          session_id: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          psychologist_id: string
          rating: number
          session_id: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          psychologist_id?: string
          rating?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_reports: {
        Row: {
          amount_eur: number
          amount_mad: number
          billing_cycle: string
          created_at: string
          current_period_end: string
          id: string
          org_id: string | null
          sector: string
          status: string
          user_id: string
        }
        Insert: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          id?: string
          org_id?: string | null
          sector: string
          status?: string
          user_id: string
        }
        Update: {
          amount_eur?: number
          amount_mad?: number
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          id?: string
          org_id?: string | null
          sector?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      session_credit_packs: {
        Row: {
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean
          name: string
          price_eur: number | null
          price_mad: number
          session_count: number
          slug: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          name: string
          price_eur?: number | null
          price_mad: number
          session_count: number
          slug: string
        }
        Update: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          name?: string
          price_eur?: number | null
          price_mad?: number
          session_count?: number
          slug?: string
        }
        Relationships: []
      }
      session_credits_ledger: {
        Row: {
          amount_mad: number | null
          booking_id: string | null
          created_at: string
          delta: number
          id: string
          metadata: Json
          pack_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount_mad?: number | null
          booking_id?: string | null
          created_at?: string
          delta: number
          id?: string
          metadata?: Json
          pack_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount_mad?: number | null
          booking_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          metadata?: Json
          pack_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      session_events: {
        Row: {
          booking_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          content: string
          created_at: string | null
          encrypted_content: string | null
          encryption_key_id: string | null
          id: string
          is_private: boolean | null
          note_type: string | null
          psychologist_id: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          encrypted_content?: string | null
          encryption_key_id?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          psychologist_id: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          encrypted_content?: string | null
          encryption_key_id?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string | null
          psychologist_id?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_id: string
          created_at: string | null
          date_time: string
          duration_minutes: number
          id: string
          notes: string | null
          psychologist_id: string
          session_type: string
          status: string
          updated_at: string | null
          video_room_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date_time: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          psychologist_id: string
          session_type?: string
          status?: string
          updated_at?: string | null
          video_room_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date_time?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          psychologist_id?: string
          session_type?: string
          status?: string
          updated_at?: string | null
          video_room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_trees: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          is_active: boolean
          name: string
          slug: string
          tree: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          is_active?: boolean
          name: string
          slug: string
          tree?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          is_active?: boolean
          name?: string
          slug?: string
          tree?: Json
        }
        Relationships: []
      }
      space_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          space_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          space_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "community_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_boosts: {
        Row: {
          amount_eur: number | null
          amount_mad: number
          boost_type: string
          created_at: string
          ends_at: string
          id: string
          metadata: Json
          payment_status: string
          psychologist_id: string
          starts_at: string
        }
        Insert: {
          amount_eur?: number | null
          amount_mad?: number
          boost_type: string
          created_at?: string
          ends_at: string
          id?: string
          metadata?: Json
          payment_status?: string
          psychologist_id: string
          starts_at?: string
        }
        Update: {
          amount_eur?: number | null
          amount_mad?: number
          boost_type?: string
          created_at?: string
          ends_at?: string
          id?: string
          metadata?: Json
          payment_status?: string
          psychologist_id?: string
          starts_at?: string
        }
        Relationships: []
      }
      specialist_payouts: {
        Row: {
          created_at: string
          gross_mad: number
          id: string
          net_mad: number
          notes: string | null
          paid_at: string | null
          payout_method: string | null
          period_end: string
          period_start: string
          platform_fee_mad: number
          psychologist_id: string
          reference: string | null
          status: string
          transaction_ids: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_mad?: number
          id?: string
          net_mad?: number
          notes?: string | null
          paid_at?: string | null
          payout_method?: string | null
          period_end: string
          period_start: string
          platform_fee_mad?: number
          psychologist_id: string
          reference?: string | null
          status?: string
          transaction_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_mad?: number
          id?: string
          net_mad?: number
          notes?: string | null
          paid_at?: string | null
          payout_method?: string | null
          period_end?: string
          period_start?: string
          platform_fee_mad?: number
          psychologist_id?: string
          reference?: string | null
          status?: string
          transaction_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      specialist_plans: {
        Row: {
          commission_rate: number
          created_at: string
          features: Json
          id: string
          is_active: boolean
          monthly_price_mad: number
          name: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          features?: Json
          id: string
          is_active?: boolean
          monthly_price_mad?: number
          name: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price_mad?: number
          name?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      subscription_invoices: {
        Row: {
          amount_mad: number
          created_at: string
          id: string
          invoice_number: string | null
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          period_end: string
          period_start: string
          plan_type: string
          psychologist_id: string
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_mad?: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          period_end: string
          period_start: string
          plan_type: string
          psychologist_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_mad?: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          period_end?: string
          period_start?: string
          plan_type?: string
          psychologist_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          plan_type: string
          psychologist_id: string
          starts_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_type?: string
          psychologist_id: string
          starts_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_type?: string
          psychologist_id?: string
          starts_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          attachments: Json
          author_id: string
          author_role: string
          body: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json
          author_id: string
          author_role: string
          body: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          attachments?: Json
          author_id?: string
          author_role?: string
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          closed_at: string | null
          created_at: string
          id: string
          last_message_at: string
          metadata: Json | null
          priority: string
          resolution: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          metadata?: Json | null
          priority?: string
          resolution?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          metadata?: Json | null
          priority?: string
          resolution?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          ambassador_code: string | null
          answers: Json
          completed: boolean
          completed_at: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          id: string
          language: string
          last_step: number
          referral_source: string | null
          session_token: string
          total_steps: number
          track: string
          vw_coherent: boolean | null
        }
        Insert: {
          ambassador_code?: string | null
          answers?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string
          last_step?: number
          referral_source?: string | null
          session_token?: string
          total_steps?: number
          track: string
          vw_coherent?: boolean | null
        }
        Update: {
          ambassador_code?: string | null
          answers?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string
          last_step?: number
          referral_source?: string | null
          session_token?: string
          total_steps?: number
          track?: string
          vw_coherent?: boolean | null
        }
        Relationships: []
      }
      therapy_approaches: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      translation_overrides: {
        Row: {
          id: string
          locale: string
          translation_key: string
          translation_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          locale: string
          translation_key: string
          translation_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          locale?: string
          translation_key?: string
          translation_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          client_id: string
          created_at: string
          estimated_sessions: number | null
          goals: Json
          id: string
          interventions: string[]
          notes: string | null
          presenting_problems: Json
          psychologist_id: string
          review_at: string | null
          status: Database["public"]["Enums"]["treatment_plan_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          estimated_sessions?: number | null
          goals?: Json
          id?: string
          interventions?: string[]
          notes?: string | null
          presenting_problems?: Json
          psychologist_id: string
          review_at?: string | null
          status?: Database["public"]["Enums"]["treatment_plan_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          estimated_sessions?: number | null
          goals?: Json
          id?: string
          interventions?: string[]
          notes?: string | null
          presenting_problems?: Json
          psychologist_id?: string
          review_at?: string | null
          status?: Database["public"]["Enums"]["treatment_plan_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_slug: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_slug: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_slug?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_slug_fkey"
            columns: ["badge_slug"]
            isOneToOne: false
            referencedRelation: "gamification_badges"
            referencedColumns: ["slug"]
          },
        ]
      }
      user_daily_challenges: {
        Row: {
          assigned_for_date: string
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_for_date?: string
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_for_date?: string
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memberships: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string | null
          last_activity_at: string | null
          streak_best: number
          streak_days: number
          updated_at: string | null
          user_id: string
          xp_this_week: number
          xp_total: number
        }
        Insert: {
          created_at?: string | null
          last_activity_at?: string | null
          streak_best?: number
          streak_days?: number
          updated_at?: string | null
          user_id: string
          xp_this_week?: number
          xp_total?: number
        }
        Update: {
          created_at?: string | null
          last_activity_at?: string | null
          streak_best?: number
          streak_days?: number
          updated_at?: string | null
          user_id?: string
          xp_this_week?: number
          xp_total?: number
        }
        Relationships: []
      }
      user_quest_progress: {
        Row: {
          completed_at: string | null
          id: string
          quest_slug: string
          started_at: string
          state: Json
          step_idx: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quest_slug: string
          started_at?: string
          state?: Json
          step_idx?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          quest_slug?: string
          started_at?: string
          state?: Json
          step_idx?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_quest_slug_fkey"
            columns: ["quest_slug"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["slug"]
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
      user_skill_nodes: {
        Row: {
          id: string
          node_id: string
          tree_slug: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          node_id: string
          tree_slug: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          node_id?: string
          tree_slug?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_nodes_tree_slug_fkey"
            columns: ["tree_slug"]
            isOneToOne: false
            referencedRelation: "skill_trees"
            referencedColumns: ["slug"]
          },
        ]
      }
      user_streaks: {
        Row: {
          best_days: number
          current_days: number
          freezes_available: number
          id: string
          kind: Database["public"]["Enums"]["streak_kind"]
          last_activity_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_days?: number
          current_days?: number
          freezes_available?: number
          id?: string
          kind: Database["public"]["Enums"]["streak_kind"]
          last_activity_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_days?: number
          current_days?: number
          freezes_available?: number
          id?: string
          kind?: Database["public"]["Enums"]["streak_kind"]
          last_activity_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          is_active: boolean | null
          org_id: string
          program_type: string
          psychologist_id: string | null
          sessions_included: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          org_id: string
          program_type?: string
          psychologist_id?: string | null
          sessions_included?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          program_type?: string
          psychologist_id?: string | null
          sessions_included?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellness_programs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_programs_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          source_id: string | null
          source_type: string | null
          user_id: string
          xp: number
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          source_id?: string | null
          source_type?: string | null
          user_id: string
          xp: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          source_id?: string | null
          source_type?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      active_boosts_public: {
        Row: {
          boost_type: string | null
          ends_at: string | null
          psychologist_id: string | null
        }
        Insert: {
          boost_type?: string | null
          ends_at?: string | null
          psychologist_id?: string | null
        }
        Update: {
          boost_type?: string | null
          ends_at?: string | null
          psychologist_id?: string | null
        }
        Relationships: []
      }
      admin_platform_stats: {
        Row: {
          accredited_psychologists: number | null
          active_psychologists: number | null
          bookings_last_30d: number | null
          completed_sessions: number | null
          new_users_last_30d: number | null
          pending_bookings: number | null
          total_bookings: number | null
          total_gross_revenue_mad: number | null
          total_platform_revenue_mad: number | null
          total_users: number | null
          upcoming_sessions: number | null
        }
        Relationships: []
      }
      bookings_with_details: {
        Row: {
          amount_mad: number | null
          created_at: string | null
          duration_minutes: number | null
          id: string | null
          patient_id: string | null
          patient_name: string | null
          patient_notes: string | null
          payment_status: string | null
          psychologist_id: string | null
          psychologist_name: string | null
          scheduled_at: string | null
          session_type: string | null
          status: string | null
          updated_at: string | null
          video_room_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_leaderboard: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          rank: number | null
          streak_days: number | null
          user_id: string | null
          xp_this_week: number | null
          xp_total: number | null
        }
        Relationships: []
      }
      org_usage_summary: {
        Row: {
          active_members: number | null
          avg_sessions_per_member: number | null
          org_id: string | null
          pending_invites: number | null
          sessions_completed: number | null
          sessions_this_month: number | null
          total_sessions_booked: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organization_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      public_review_ratings: {
        Row: {
          created_at: string | null
          psychologist_id: string | null
          rating: number | null
        }
        Insert: {
          created_at?: string | null
          psychologist_id?: string | null
          rating?: number | null
        }
        Update: {
          created_at?: string | null
          psychologist_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "psychologist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialist_plans_public: {
        Row: {
          features: Json | null
          id: string | null
          is_active: boolean | null
          monthly_price_mad: number | null
          name: string | null
          sort_order: number | null
          tagline: string | null
        }
        Insert: {
          features?: Json | null
          id?: string | null
          is_active?: boolean | null
          monthly_price_mad?: number | null
          name?: string | null
          sort_order?: number | null
          tagline?: string | null
        }
        Update: {
          features?: Json | null
          id?: string | null
          is_active?: boolean | null
          monthly_price_mad?: number | null
          name?: string | null
          sort_order?: number | null
          tagline?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_assign_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      admin_cancel_booking: {
        Args: { _booking_id: string; _reason?: string }
        Returns: Json
      }
      admin_delete_profile: { Args: { _user_id: string }; Returns: Json }
      admin_force_signout: { Args: { _user_id: string }; Returns: Json }
      admin_hide_review: {
        Args: { _reason?: string; _review_id: string }
        Returns: Json
      }
      admin_list_users: {
        Args: { _limit?: number; _search?: string }
        Returns: {
          avatar_url: string
          city: string
          created_at: string
          full_name: string
          id: string
          is_suspended: boolean
          phone: string
          roles: string[]
        }[]
      }
      admin_list_users_rich: {
        Args: { _limit?: number; _search?: string }
        Returns: {
          avatar_url: string
          city: string
          created_at: string
          email: string
          email_confirmed_at: string
          full_name: string
          id: string
          is_suspended: boolean
          last_sign_in_at: string
          phone: string
          roles: string[]
          suspended_reason: string
        }[]
      }
      admin_log_password_reset: {
        Args: { _email: string; _user_id: string }
        Returns: Json
      }
      admin_refund_booking: {
        Args: { _booking_id: string; _reason?: string }
        Returns: Json
      }
      admin_revoke_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      admin_set_user_suspended: {
        Args: { _reason?: string; _suspended: boolean; _user_id: string }
        Returns: Json
      }
      admin_update_booking_status: {
        Args: { _booking_id: string; _new_status: string }
        Returns: Json
      }
      admin_user_activity: { Args: { _user_id: string }; Returns: Json }
      app_logs_search: {
        Args: {
          _env?: string
          _from?: string
          _level?: string
          _limit?: number
          _search?: string
          _source?: string
          _to?: string
        }
        Returns: {
          created_at: string
          duration_ms: number
          environment: string
          event: string
          id: number
          level: string
          message: string
          metadata: Json
          release: string
          request_id: string
          route: string
          source: string
          status_code: number
        }[]
      }
      app_logs_stats: { Args: { _hours?: number }; Returns: Json }
      audit_search: {
        Args: {
          _action?: string
          _actor?: string
          _class?: string
          _from?: string
          _limit?: number
          _resource?: string
          _subject?: string
          _to?: string
        }
        Returns: {
          action: string
          actor_email: string
          actor_role: string
          changed: Json
          created_at: string
          data_class: string
          id: string
          metadata: Json
          record_ref: string
          request_ip: unknown
          resource_type: string
          subject_email: string
          subject_id: string
          user_id: string
        }[]
      }
      audit_stats: { Args: { _days?: number }; Returns: Json }
      award_xp: {
        Args: { p_action: string; p_metadata?: Json; p_xp?: number }
        Returns: Json
      }
      check_and_increment_rate_limit: {
        Args: { _key: string; _max: number; _window_seconds: number }
        Returns: boolean
      }
      check_proposal_slot: {
        Args: { _duration: number; _psy: string; _start: string }
        Returns: Json
      }
      complete_daily_challenge: {
        Args: { p_user_challenge_id: string }
        Returns: Json
      }
      compute_mps: { Args: { _user_id: string }; Returns: Json }
      create_admin_user: {
        Args: { _email: string; _password: string }
        Returns: Json
      }
      crm_consent_evidence: {
        Args: never
        Returns: {
          basis: string
          campaign: string
          channel: string
          contact_created_at: string
          contact_type: string
          email: string
          evidence: Json
          first_touch: Json
          full_name: string
          granted: boolean
          lifecycle: string
          locale: string
          notice_version: string
          purpose: string
          receipt_ref: string
          recorded_at: string
          source: string
          source_url: string
          withdrawn_at: string
        }[]
      }
      crm_log_email: {
        Args: {
          _campaign?: string
          _direction?: string
          _email: string
          _metadata?: Json
          _preview?: string
          _provider?: string
          _provider_message_id?: string
          _status?: string
          _subject: string
          _template?: string
        }
        Returns: string
      }
      crm_next_best_actions: {
        Args: { _limit?: number }
        Returns: {
          action: string
          contact_email: string
          contact_id: string
          contact_name: string
          days_idle: number
          deal_id: string
          pipeline: string
          probability: number
          stage: string
          value_mad: number
          weighted_mad: number
        }[]
      }
      crm_pick_owner: { Args: never; Returns: string }
      crm_pipeline_forecast: {
        Args: never
        Returns: {
          deal_count: number
          is_lost: boolean
          is_won: boolean
          label: string
          pipeline: string
          probability: number
          stage: string
          stage_position: number
          value_mad: number
          weighted_mad: number
        }[]
      }
      crm_record_consent: {
        Args: {
          _basis?: string
          _campaign?: string
          _channel?: string
          _email: string
          _evidence?: Json
          _full_name?: string
          _granted: boolean
          _locale?: string
          _notice_version?: string
          _purpose: string
          _source_url?: string
          _user_agent?: string
        }
        Returns: string
      }
      crm_record_email_event: {
        Args: {
          _email?: string
          _event_type: string
          _metadata?: Json
          _provider?: string
          _provider_message_id?: string
        }
        Returns: string
      }
      crm_role: { Args: { _user_id: string }; Returns: string }
      crm_upsert_contact: {
        Args: {
          _activity_kind?: string
          _activity_metadata?: Json
          _activity_subject?: string
          _consent_evidence?: Json
          _consent_granted?: boolean
          _consent_purpose?: string
          _contact_type?: string
          _country?: string
          _email: string
          _first_touch?: Json
          _full_name?: string
          _locale?: string
          _phone?: string
          _source?: string
        }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      dsr_admin_list: {
        Args: { _limit?: number; _status?: string }
        Returns: {
          created_at: string
          due_at: string
          email: string
          evidence: Json
          exported_at: string
          id: string
          notes: string
          overdue: boolean
          reference: string
          request_type: string
          requested_changes: Json
          resolution: string
          status: string
          user_id: string
        }[]
      }
      dsr_admin_update: {
        Args: { _id: string; _resolution?: string; _status: string }
        Returns: undefined
      }
      dsr_export_my_data: { Args: { _user_agent?: string }; Returns: Json }
      dsr_submit: {
        Args: {
          _changes?: Json
          _locale?: string
          _notes?: string
          _request_type: string
          _user_agent?: string
        }
        Returns: {
          channel: string
          created_at: string
          due_at: string
          email: string
          evidence: Json
          export_bytes: number | null
          exported_at: string | null
          fulfilled_at: string | null
          handled_by: string | null
          id: string
          legal_basis: string | null
          notes: string | null
          reference: string | null
          request_type: string
          requested_changes: Json | null
          resolution: string | null
          status: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "data_subject_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      funnel_metrics: { Args: { _from?: string; _to?: string }; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      generate_slug: { Args: { id: string; name: string }; Returns: string }
      get_ai_tier: { Args: { _user_id: string }; Returns: string }
      get_available_slots: {
        Args: { p_date: string; p_psychologist_id: string }
        Returns: {
          is_available: boolean
          slot_start: string
        }[]
      }
      get_booking_by_token: {
        Args: { _token: string }
        Returns: {
          duration_minutes: number
          id: string
          patient_notes: string
          proposal_expires_at: string
          psychologist_id: string
          scheduled_at: string
          session_type: string
          status: string
        }[]
      }
      get_or_assign_daily_challenge: { Args: never; Returns: Json }
      get_referral_credit_balance: {
        Args: { _user_id: string }
        Returns: number
      }
      get_session_credit_balance: {
        Args: { _user_id: string }
        Returns: number
      }
      get_specialist_earnings_summary: { Args: never; Returns: Json }
      get_specialist_plan: { Args: { _user_id: string }; Returns: Json }
      has_all_access: { Args: { _user_id: string }; Returns: boolean }
      has_athlete_plus: { Args: { _user_id: string }; Returns: boolean }
      has_crm_access: {
        Args: { _min?: string; _user_id: string }
        Returns: boolean
      }
      has_plan_feature: {
        Args: { _feature: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tier: {
        Args: {
          _tier: Database["public"]["Enums"]["membership_tier"]
          _user_id: string
        }
        Returns: boolean
      }
      home_hero_forced_variant: { Args: never; Returns: string }
      home_hero_winner: { Args: never; Returns: Json }
      increment_ai_usage: { Args: never; Returns: number }
      inspect_provisioning_state: {
        Args: { _application_id: string }
        Returns: Json
      }
      invite_org_member: {
        Args: {
          p_email: string
          p_name?: string
          p_org_id: string
          p_role?: string
          p_sessions_limit?: number
        }
        Returns: string
      }
      issue_invoice: {
        Args: {
          _booking_id?: string
          _contact_id: string
          _due_days?: number
          _kind?: string
          _legal_mentions?: string
          _notes?: string
          _organisation_id?: string
          _subtotal_mad: number
        }
        Returns: {
          booking_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          due_at: string | null
          id: string
          issued_at: string
          kind: string
          legal_mentions: string
          notes: string | null
          number: string
          organisation_id: string | null
          payment_ref: string
          pdf_path: string | null
          series: string
          status: string
          subtotal_mad: number
          total_mad: number
          updated_at: string
          vat_mad: number
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      log_app_event: {
        Args: {
          _duration_ms?: number
          _environment?: string
          _event: string
          _level?: string
          _message?: string
          _metadata?: Json
          _release?: string
          _request_id?: string
          _route?: string
          _source?: string
          _status_code?: number
        }
        Returns: number
      }
      log_sensitive_access: {
        Args: {
          _context?: Json
          _data_class?: string
          _record_ref: string
          _resource_type: string
          _subject_id?: string
          _user_agent?: string
        }
        Returns: undefined
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      observatoire_answer_stats: { Args: { _track: string }; Returns: Json }
      observatoire_funnel_report: { Args: { _days?: number }; Returns: Json }
      observatoire_summary: { Args: never; Returns: Json }
      ops_has_workspace_access: {
        Args: { _user: string; _workspace: string }
        Returns: boolean
      }
      ops_workspace_role: {
        Args: { _user: string; _workspace: string }
        Returns: Database["public"]["Enums"]["ops_member_role"]
      }
      org_pulse_aggregate: {
        Args: { _org_id: string; _survey_id?: string }
        Returns: Json
      }
      promote_home_hero_winner: { Args: { _auto?: boolean }; Returns: Json }
      publish_event: {
        Args: {
          p_actor_id?: string
          p_consumers?: string[]
          p_correlation_id?: string
          p_event_type: string
          p_idempotency_key?: string
          p_payload?: Json
          p_subject_id?: string
          p_subject_type: string
          p_tenant_id?: string
        }
        Returns: string
      }
      purge_app_logs: { Args: never; Returns: number }
      purge_expired_audit_log: { Args: never; Returns: number }
      quest_increment: {
        Args: { _delta?: number; _quest_slug: string; _step_id: string }
        Returns: {
          completed_at: string | null
          id: string
          quest_slug: string
          started_at: string
          state: Json
          step_idx: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_quest_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      quest_start: { Args: { _quest_slug: string }; Returns: Json }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_payment: {
        Args: {
          _amount_mad: number
          _bank_ref?: string
          _invoice_id: string
          _method?: string
          _received_at?: string
        }
        Returns: {
          booking_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          due_at: string | null
          id: string
          issued_at: string
          kind: string
          legal_mentions: string
          notes: string | null
          number: string
          organisation_id: string | null
          payment_ref: string
          pdf_path: string | null
          series: string
          status: string
          subtotal_mad: number
          total_mad: number
          updated_at: string
          vat_mad: number
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_xp: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_source_id?: string
          p_source_type?: string
          p_streak?: Database["public"]["Enums"]["streak_kind"]
          p_xp?: number
        }
        Returns: Json
      }
      replace_availability_for_day: {
        Args: { _day: number; _ranges: Json }
        Returns: undefined
      }
      resolve_referral_code: {
        Args: { _code: string }
        Returns: {
          code: string
          referrer_id: string
          status: string
        }[]
      }
      respond_to_proposal: {
        Args: { _action: string; _reason?: string; _token: string }
        Returns: Json
      }
      revenue_ytd_mad: {
        Args: never
        Returns: {
          collected_mad: number
          issued_mad: number
          year: number
        }[]
      }
      search_psychologists:
        | {
            Args: {
              p_city?: string
              p_in_person?: boolean
              p_languages?: string[]
              p_max_price?: number
              p_min_price?: number
              p_online?: boolean
              p_page?: number
              p_page_size?: number
              p_specialties?: string[]
            }
            Returns: {
              bio: string
              calendly_url: string
              city: string
              created_at: string
              full_name: string
              hourly_rate_mad: number
              id: string
              is_accredited: boolean
              is_published: boolean
              offers_in_person: boolean
              offers_online: boolean
              photo_url: string
              slug: string
              total_count: number
              updated_at: string
            }[]
          }
        | {
            Args: {
              p_availability?: string
              p_city?: string
              p_gender?: string
              p_in_person?: boolean
              p_languages?: string[]
              p_max_price?: number
              p_min_price?: number
              p_online?: boolean
              p_page?: number
              p_page_size?: number
              p_specialties?: string[]
              p_therapy_approaches?: string[]
            }
            Returns: {
              bio: string
              calendly_url: string
              city: string
              created_at: string
              full_name: string
              gender: string
              hourly_rate_mad: number
              id: string
              is_accredited: boolean
              is_published: boolean
              offers_in_person: boolean
              offers_online: boolean
              photo_url: string
              slug: string
              total_count: number
              updated_at: string
            }[]
          }
      skill_unlock: {
        Args: { _node_id: string; _tree_slug: string }
        Returns: {
          id: string
          node_id: string
          tree_slug: string
          unlocked_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_skill_nodes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_daily_challenge: {
        Args: { p_challenge_id: string }
        Returns: {
          assigned_for_date: string
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_daily_challenges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      survey_save: {
        Args: {
          _ambassador_code?: string
          _answers: Json
          _completed?: boolean
          _device_type?: string
          _duration_seconds?: number
          _language: string
          _last_step: number
          _referral_source?: string
          _session_token: string
          _total_steps: number
          _track: string
          _vw_coherent?: boolean
        }
        Returns: undefined
      }
      validate_coupon: {
        Args: { _amount_mad: number; _applies_to: string; _code: string }
        Returns: {
          coupon_id: string
          discount_mad: number
          final_mad: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "psychologist"
        | "user"
        | "athlete"
        | "coach"
        | "organization"
      certificate_type:
        | "course_completion"
        | "assessment_completion"
        | "psychologist_accreditation"
        | "mooc_training"
      discharge_reason:
        | "goals_met"
        | "client_request"
        | "referral"
        | "dropout"
        | "other"
      homework_category:
        | "worksheet"
        | "exercise"
        | "reading"
        | "reflection"
        | "other"
      membership_tier:
        | "discover"
        | "student"
        | "athlete"
        | "practitioner"
        | "elite"
        | "coach"
        | "organization"
      ops_event_status:
        | "draft"
        | "planning"
        | "active"
        | "completed"
        | "archived"
      ops_member_role: "director" | "operator" | "viewer"
      ops_task_state:
        | "pending"
        | "active"
        | "blocked"
        | "delayed"
        | "escalated"
        | "validated"
        | "completed"
        | "archived"
      space_type: "topic" | "cohort" | "region" | "ama" | "private"
      streak_kind: "learn" | "train" | "reflect"
      treatment_plan_status: "draft" | "active" | "revised" | "completed"
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
      app_role: [
        "admin",
        "psychologist",
        "user",
        "athlete",
        "coach",
        "organization",
      ],
      certificate_type: [
        "course_completion",
        "assessment_completion",
        "psychologist_accreditation",
        "mooc_training",
      ],
      discharge_reason: [
        "goals_met",
        "client_request",
        "referral",
        "dropout",
        "other",
      ],
      homework_category: [
        "worksheet",
        "exercise",
        "reading",
        "reflection",
        "other",
      ],
      membership_tier: [
        "discover",
        "student",
        "athlete",
        "practitioner",
        "elite",
        "coach",
        "organization",
      ],
      ops_event_status: [
        "draft",
        "planning",
        "active",
        "completed",
        "archived",
      ],
      ops_member_role: ["director", "operator", "viewer"],
      ops_task_state: [
        "pending",
        "active",
        "blocked",
        "delayed",
        "escalated",
        "validated",
        "completed",
        "archived",
      ],
      space_type: ["topic", "cohort", "region", "ama", "private"],
      streak_kind: ["learn", "train", "reflect"],
      treatment_plan_status: ["draft", "active", "revised", "completed"],
    },
  },
} as const
