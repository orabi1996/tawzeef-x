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
      platform_contact_settings: {
        Row: {
          id: boolean
          contact_email: string
          support_email: string
          contact_phone: string
          location_ar: string
          location_en: string
          hours_ar: string
          hours_en: string
        }
        Insert: {
          id?: boolean
          contact_email: string
          support_email: string
          contact_phone?: string
          location_ar?: string
          location_en?: string
          hours_ar?: string
          hours_en?: string
        }
        Update: {
          id?: boolean
          contact_email?: string
          support_email?: string
          contact_phone?: string
          location_ar?: string
          location_en?: string
          hours_ar?: string
          hours_en?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          license_number: string | null
          logo_url: string | null
          name: string
          name_en: string | null
          notes: string | null
          owner_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name: string
          name_en?: string | null
          notes?: string | null
          owner_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          license_number?: string | null
          logo_url?: string | null
          name?: string
          name_en?: string | null
          notes?: string | null
          owner_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agency_assignments: {
        Row: {
          agency_id: string
          assigned_by: string | null
          candidate_id: string | null
          company_id: string
          created_at: string
          id: string
          notes: string | null
          scope: string
          status: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          assigned_by?: string | null
          candidate_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          scope?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          assigned_by?: string | null
          candidate_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          scope?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_assignments_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_members: {
        Row: {
          agency_id: string
          id: string
          invited_by: string | null
          joined_at: string
          member_role: string
          user_id: string
        }
        Insert: {
          agency_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          member_role?: string
          user_id: string
        }
        Update: {
          agency_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          company_id: string | null
          cover_letter: string | null
          created_at: string
          demo_video_url: string | null
          email: string
          experience: string | null
          id: string
          job_id: string
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string
          resume_url: string | null
          skills: string[] | null
          specialty: string | null
          status: string
          tracking_code: string | null
          university_degree: string | null
        }
        Insert: {
          company_id?: string | null
          cover_letter?: string | null
          created_at?: string
          demo_video_url?: string | null
          email: string
          experience?: string | null
          id?: string
          job_id: string
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone: string
          resume_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          status?: string
          tracking_code?: string | null
          university_degree?: string | null
        }
        Update: {
          company_id?: string | null
          cover_letter?: string | null
          created_at?: string
          demo_video_url?: string | null
          email?: string
          experience?: string | null
          id?: string
          job_id?: string
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string
          resume_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          status?: string
          tracking_code?: string | null
          university_degree?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          points_override: number | null
          question_id: string
          sort_order: number
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          points_override?: number | null
          question_id: string
          sort_order?: number
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          points_override?: number | null
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          answers: Json
          assessment_id: string
          candidate_email: string
          candidate_id: string | null
          candidate_name: string
          completed_at: string | null
          created_at: string
          id: string
          max_score: number | null
          percentage: number | null
          started_at: string
          status: string
          tab_switch_log: Json | null
          tab_switches: number | null
          total_score: number | null
        }
        Insert: {
          answers?: Json
          assessment_id: string
          candidate_email: string
          candidate_id?: string | null
          candidate_name: string
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          percentage?: number | null
          started_at?: string
          status?: string
          tab_switch_log?: Json | null
          tab_switches?: number | null
          total_score?: number | null
        }
        Update: {
          answers?: Json
          assessment_id?: string
          candidate_email?: string
          candidate_id?: string | null
          candidate_name?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          percentage?: number | null
          started_at?: string
          status?: string
          tab_switch_log?: Json | null
          tab_switches?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          is_randomized: boolean
          job_id: string | null
          passing_score: number | null
          title: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_randomized?: boolean
          job_id?: string | null
          passing_score?: number | null
          title: string
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_randomized?: boolean
          job_id?: string | null
          passing_score?: number | null
          title?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          company_id: string | null
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          company_id: string
          entity_id: string | null
          event_id: string | null
          executed_at: string
          execution_details: Json
          id: string
          rule_id: string | null
          status: string
          trigger_event: string
        }
        Insert: {
          company_id: string
          entity_id?: string | null
          event_id?: string | null
          executed_at?: string
          execution_details?: Json
          id?: string
          rule_id?: string | null
          status?: string
          trigger_event: string
        }
        Update: {
          company_id?: string
          entity_id?: string | null
          event_id?: string | null
          executed_at?: string
          execution_details?: Json
          id?: string
          rule_id?: string | null
          status?: string
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_rule_scope_fkey"
            columns: ["company_id", "rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          activated_at: string | null
          actions: Json
          company_id: string
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          title: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          actions?: Json
          company_id: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          actions?: Json
          company_id?: string
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          trigger_event?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string | null
          content_ar: string
          content_en: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          excerpt_ar: string | null
          excerpt_en: string | null
          id: string
          published: boolean
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string
          category?: string | null
          content_ar: string
          content_en: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          category?: string | null
          content_ar?: string
          content_en?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidate_checklist_items: {
        Row: {
          agency_id: string | null
          assigned_to_type: string | null
          assigned_to_user_id: string | null
          attachments: Json
          checklist_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          assigned_to_type?: string | null
          assigned_to_user_id?: string | null
          attachments?: Json
          checklist_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          assigned_to_type?: string | null
          assigned_to_user_id?: string | null
          attachments?: Json
          checklist_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_checklist_items_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "candidate_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_checklists: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          sort_order: number
          status: string
          template_key: string | null
          title: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          sort_order?: number
          status?: string
          template_key?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sort_order?: number
          status?: string
          template_key?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_portal_recovery_limits: {
        Row: {
          attempts: number
          request_hash: string
          reset_at: string
        }
        Insert: {
          attempts: number
          request_hash: string
          reset_at: string
        }
        Update: {
          attempts?: number
          request_hash?: string
          reset_at?: string
        }
        Relationships: []
      }
      candidate_reviewer_assignments: {
        Row: {
          assigned_at: string
          candidate_id: string
          company_id: string
          reviewer_id: string
          rule_id: string | null
        }
        Insert: {
          assigned_at?: string
          candidate_id: string
          company_id: string
          reviewer_id: string
          rule_id?: string | null
        }
        Update: {
          assigned_at?: string
          candidate_id?: string
          company_id?: string
          reviewer_id?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_reviewer_assignments_company_id_candidate_id_fkey"
            columns: ["company_id", "candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["company_id", "id"]
          },
          {
            foreignKeyName: "candidate_reviewer_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_reviewer_assignments_company_id_reviewer_id_fkey"
            columns: ["company_id", "reviewer_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["company_id", "user_id"]
          },
          {
            foreignKeyName: "candidate_reviewer_assignments_company_id_rule_id_fkey"
            columns: ["company_id", "rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      candidate_scorecards: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          notes: string | null
          rating: number
          reviewer_id: string
          reviewer_name: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          rating: number
          reviewer_id: string
          reviewer_name: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          rating?: number
          reviewer_id?: string
          reviewer_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_scorecards_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          agency_id: string | null
          ai_evaluation: string | null
          ai_score: number | null
          company_id: string | null
          created_at: string
          demo_video_url: string | null
          education: string | null
          email: string | null
          embedding: Json | null
          embedding_text: string | null
          expected_salary: string | null
          experience: string | null
          id: string
          is_deferred: boolean | null
          job_id: string | null
          license_expiry: string | null
          license_number: string | null
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          rejection_reason: string | null
          resume_url: string | null
          role: string | null
          skills: string[] | null
          source: string | null
          stage: string | null
          stage_entered_at: string | null
          status: string
          summary: string | null
          tracking_code: string | null
          university_degree: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          ai_evaluation?: string | null
          ai_score?: number | null
          company_id?: string | null
          created_at?: string
          demo_video_url?: string | null
          education?: string | null
          email?: string | null
          embedding?: Json | null
          embedding_text?: string | null
          expected_salary?: string | null
          experience?: string | null
          id?: string
          is_deferred?: boolean | null
          job_id?: string | null
          license_expiry?: string | null
          license_number?: string | null
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          resume_url?: string | null
          role?: string | null
          skills?: string[] | null
          source?: string | null
          stage?: string | null
          stage_entered_at?: string | null
          status?: string
          summary?: string | null
          tracking_code?: string | null
          university_degree?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          ai_evaluation?: string | null
          ai_score?: number | null
          company_id?: string | null
          created_at?: string
          demo_video_url?: string | null
          education?: string | null
          email?: string | null
          embedding?: Json | null
          embedding_text?: string | null
          expected_salary?: string | null
          experience?: string | null
          id?: string
          is_deferred?: boolean | null
          job_id?: string | null
          license_expiry?: string | null
          license_number?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          rejection_reason?: string | null
          resume_url?: string | null
          role?: string | null
          skills?: string[] | null
          source?: string | null
          stage?: string | null
          stage_entered_at?: string | null
          status?: string
          summary?: string | null
          tracking_code?: string | null
          university_degree?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          items: Json
          key: string
          name_ar: string
          name_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          items?: Json
          key: string
          name_ar: string
          name_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          items?: Json
          key?: string
          name_ar?: string
          name_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          brand_settings: Json | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          e2e_encryption: boolean | null
          id: string
          industry: string | null
          is_platform_company: boolean | null
          logo_url: string | null
          manager_user_id: string | null
          name: string
          name_en: string | null
          notes: string | null
          owner_user_id: string | null
          parent_company_id: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          brand_settings?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          e2e_encryption?: boolean | null
          id?: string
          industry?: string | null
          is_platform_company?: boolean | null
          logo_url?: string | null
          manager_user_id?: string | null
          name: string
          name_en?: string | null
          notes?: string | null
          owner_user_id?: string | null
          parent_company_id?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          brand_settings?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          e2e_encryption?: boolean | null
          id?: string
          industry?: string | null
          is_platform_company?: boolean | null
          logo_url?: string | null
          manager_user_id?: string | null
          name?: string
          name_en?: string | null
          notes?: string | null
          owner_user_id?: string | null
          parent_company_id?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invitations: {
        Row: {
          accepted_at: string | null
          branch_id: string | null
          company_id: string
          created_at: string
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          member_role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          branch_id?: string | null
          company_id: string
          created_at?: string
          declined_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          member_role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          branch_id?: string | null
          company_id?: string
          created_at?: string
          declined_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          member_role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          invoice_number: string
          issued_by_user_id: string | null
          job_posts_limit: number
          plan_id: string
          plan_name_ar: string
          starts_at: string
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          invoice_number: string
          issued_by_user_id?: string | null
          job_posts_limit?: number
          plan_id: string
          plan_name_ar: string
          starts_at?: string
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          invoice_number?: string
          issued_by_user_id?: string | null
          job_posts_limit?: number
          plan_id?: string
          plan_name_ar?: string
          starts_at?: string
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          invited_by: string | null
          joined_at: string
          member_role: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          member_role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          company_id: string
          created_at: string
          expires_at: string | null
          id: string
          job_posts_limit: number
          job_posts_used: number
          plan_id: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          job_posts_limit?: number
          job_posts_used?: number
          plan_id: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          job_posts_limit?: number
          job_posts_used?: number
          plan_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          name_en: string | null
          permissions: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          name_en?: string | null
          permissions?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          name_en?: string | null
          permissions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          config_type: string
          created_at: string
          id: string
          is_active: boolean
          sender_name: string
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_secure: boolean
          smtp_user: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sender_name?: string
          smtp_host?: string
          smtp_password: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_user: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sender_name?: string
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_user?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          category: string | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string
          user_id: string
          variables: string[] | null
        }
        Insert: {
          body_html: string
          category?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string
          user_id: string
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          category?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          candidate_email: string
          candidate_id: string | null
          created_at: string
          email_type: string
          id: string
          opened_at: string | null
          opened_count: number
          sent_at: string
          subject: string | null
          tracking_id: string
          user_id: string
        }
        Insert: {
          candidate_email: string
          candidate_id?: string | null
          created_at?: string
          email_type?: string
          id?: string
          opened_at?: string | null
          opened_count?: number
          sent_at?: string
          subject?: string | null
          tracking_id?: string
          user_id: string
        }
        Update: {
          candidate_email?: string
          candidate_id?: string | null
          created_at?: string
          email_type?: string
          id?: string
          opened_at?: string | null
          opened_count?: number
          sent_at?: string
          subject?: string | null
          tracking_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      google_indexing_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          error: string | null
          id: string
          job_id: string | null
          response: Json | null
          status: string
          status_code: number | null
          url: string
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string | null
          response?: Json | null
          status: string
          status_code?: number | null
          url: string
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_id?: string | null
          response?: Json | null
          status?: string
          status_code?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_indexing_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_indexing_logs_job_scope_fkey"
            columns: ["company_id", "job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      granular_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_read: boolean
          company_id: string
          id: string
          module_key: string
          role_key: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_read?: boolean
          company_id: string
          id?: string
          module_key: string
          role_key: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_read?: boolean
          company_id?: string
          id?: string
          module_key?: string
          role_key?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "granular_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "granular_permissions_member_fkey"
            columns: ["company_id", "user_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["company_id", "user_id"]
          },
        ]
      }
      hiring_goals: {
        Row: {
          candidates_target: number
          created_at: string
          hire_target: number
          id: string
          interviews_target: number
          month: string
          offers_target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          candidates_target?: number
          created_at?: string
          hire_target?: number
          id?: string
          interviews_target?: number
          month?: string
          offers_target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          candidates_target?: number
          created_at?: string
          hire_target?: number
          id?: string
          interviews_target?: number
          month?: string
          offers_target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          candidate_id: string | null
          candidate_name: string
          company_id: string | null
          created_at: string
          date: string
          id: string
          interviewer: string | null
          meeting_url: string | null
          notes: string | null
          position: string
          rating: number | null
          recording_url: string | null
          status: string
          time: string
          transcript: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_id?: string | null
          candidate_name: string
          company_id?: string | null
          created_at?: string
          date: string
          id?: string
          interviewer?: string | null
          meeting_url?: string | null
          notes?: string | null
          position: string
          rating?: number | null
          recording_url?: string | null
          status?: string
          time: string
          transcript?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_id?: string | null
          candidate_name?: string
          company_id?: string | null
          created_at?: string
          date?: string
          id?: string
          interviewer?: string | null
          meeting_url?: string | null
          notes?: string | null
          position?: string
          rating?: number | null
          recording_url?: string | null
          status?: string
          time?: string
          transcript?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Relationships: []
      }
      job_offers: {
        Row: {
          additional_terms: string | null
          benefits: string[] | null
          candidate_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          department: string | null
          expires_at: string | null
          id: string
          job_id: string | null
          offer_type: string
          position: string
          response_date: string | null
          response_notes: string | null
          salary: number
          sent_at: string | null
          signature_url: string | null
          start_date: string | null
          status: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_terms?: string | null
          benefits?: string[] | null
          candidate_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          department?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          offer_type?: string
          position: string
          response_date?: string | null
          response_notes?: string | null
          salary: number
          sent_at?: string | null
          signature_url?: string | null
          start_date?: string | null
          status?: string
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_terms?: string | null
          benefits?: string[] | null
          candidate_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          department?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          offer_type?: string
          position?: string
          response_date?: string | null
          response_notes?: string | null
          salary?: number
          sent_at?: string | null
          signature_url?: string | null
          start_date?: string | null
          status?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          approval_chain: string | null
          company_id: string | null
          created_at: string
          department: string
          description: string | null
          experience_level: string | null
          id: string
          location: string
          qr_code_url: string | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_chain?: string | null
          company_id?: string | null
          created_at?: string
          department: string
          description?: string | null
          experience_level?: string | null
          id?: string
          location: string
          qr_code_url?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_chain?: string | null
          company_id?: string | null
          created_at?: string
          department?: string
          description?: string | null
          experience_level?: string | null
          id?: string
          location?: string
          qr_code_url?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_deliveries: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          status: string
          status_code: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json
          status?: string
          status_code?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          status?: string
          status_code?: number | null
          user_id?: string
        }
        Relationships: []
      }
      linkedin_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          zapier_webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          zapier_webhook_url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          zapier_webhook_url?: string
        }
        Relationships: []
      }
      login_otp_challenges: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body_html: string
          company_id: string
          created_at: string
          id: string
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          body_html: string
          company_id: string
          created_at?: string
          id?: string
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          company_id?: string
          created_at?: string
          id?: string
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      password_policies: {
        Row: {
          created_at: string
          min_length: number
          require_lowercase: boolean
          require_numbers: boolean
          require_special: boolean
          require_uppercase: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          min_length?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special?: boolean
          require_uppercase?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          min_length?: number
          require_lowercase?: boolean
          require_numbers?: boolean
          require_special?: boolean
          require_uppercase?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          consumed_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          token_hash: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token_hash: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_evaluations: {
        Row: {
          comment: string | null
          communication: number
          created_at: string
          evalee_user_id: string | null
          evalee_name: string
          evalee_name_en: string | null
          evalee_role: string
          evalee_role_en: string | null
          id: string
          leadership: number
          productivity: number
          relationship: string
          reviewer_name: string
          reviewer_name_en: string | null
          teamwork: number
          technical: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          communication: number
          created_at?: string
          evalee_user_id?: string | null
          evalee_name: string
          evalee_name_en?: string | null
          evalee_role: string
          evalee_role_en?: string | null
          id?: string
          leadership: number
          productivity: number
          relationship: string
          reviewer_name: string
          reviewer_name_en?: string | null
          teamwork: number
          technical: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          communication?: number
          created_at?: string
          evalee_user_id?: string | null
          evalee_name?: string
          evalee_name_en?: string | null
          evalee_role?: string
          evalee_role_en?: string | null
          id?: string
          leadership?: number
          productivity?: number
          relationship?: string
          reviewer_name?: string
          reviewer_name_en?: string | null
          teamwork?: number
          technical?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          assessment_id: string | null
          assigned_user_ids: string[] | null
          automation_rules: Json
          color: string
          company_id: string | null
          created_at: string
          icon: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          sla_hours: number | null
          sort_order: number
          transition_rules: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          assigned_user_ids?: string[] | null
          automation_rules?: Json
          color?: string
          company_id?: string | null
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          sla_hours?: number | null
          sort_order?: number
          transition_rules?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          assigned_user_ids?: string[] | null
          automation_rules?: Json
          color?: string
          company_id?: string | null
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          sla_hours?: number | null
          sort_order?: number
          transition_rules?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_sub_stages: {
        Row: {
          assignee_type: string | null
          checklist: Json | null
          company_id: string | null
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          stage_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignee_type?: string | null
          checklist?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          stage_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignee_type?: string | null
          checklist?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          stage_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_sub_stages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_sub_stages_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_logo: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          category: string | null
          code_language: string | null
          company_id: string | null
          correct_answer: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          is_active: boolean
          job_id: string | null
          points: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          time_limit_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          code_language?: string | null
          company_id?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          is_active?: boolean
          job_id?: string | null
          points?: number
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          time_limit_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          code_language?: string | null
          company_id?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          is_active?: boolean
          job_id?: string | null
          points?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          time_limit_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_archive_meta: {
        Row: {
          candidate_email: string | null
          created_at: string
          id: string
          notes: string | null
          resume_url: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_email?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          resume_url: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_email?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          resume_url?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          avatar_url: string | null
          certifications: Json | null
          created_at: string
          education: Json | null
          email: string | null
          experience: Json | null
          full_name: string
          id: string
          job_title: string | null
          languages: Json | null
          links: Json | null
          location: string | null
          phone: string | null
          skills: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string
          id?: string
          job_title?: string | null
          languages?: Json | null
          links?: Json | null
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          certifications?: Json | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experience?: Json | null
          full_name?: string
          id?: string
          job_title?: string | null
          languages?: Json | null
          links?: Json | null
          location?: string | null
          phone?: string | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_tasks: {
        Row: {
          done: boolean
          id: string
          task_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          done?: boolean
          id?: string
          task_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          done?: boolean
          id?: string
          task_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          admin: boolean
          description: string | null
          id: string
          permission_key: string
          recruiter: boolean
          reviewer: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin?: boolean
          description?: string | null
          id?: string
          permission_key: string
          recruiter?: boolean
          reviewer?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin?: boolean
          description?: string | null
          id?: string
          permission_key?: string
          recruiter?: boolean
          reviewer?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_pinned: boolean
          name: string
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_pinned?: boolean
          name: string
          scope?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_pinned?: boolean
          name?: string
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          attachments: Json | null
          body_html: string
          created_at: string
          id: string
          scheduled_at: string
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          to_email: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          body_html: string
          created_at?: string
          id?: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          to_email: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          body_html?: string
          created_at?: string
          id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          to_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string
          result_count: number | null
          scope: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          result_count?: number | null
          scope?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          scope?: string
          user_id?: string
        }
        Relationships: []
      }
      stage_transitions: {
        Row: {
          candidate_id: string
          created_at: string
          from_stage: string | null
          id: string
          moved_by_name: string | null
          notes: string | null
          to_stage: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          from_stage?: string | null
          id?: string
          moved_by_name?: string | null
          notes?: string | null
          to_stage: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          from_stage?: string | null
          id?: string
          moved_by_name?: string | null
          notes?: string | null
          to_stage?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_transitions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          job_posts_limit: number
          name: string
          name_ar: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          billing_period?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          job_posts_limit?: number
          name: string
          name_ar: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          billing_period?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          job_posts_limit?: number
          name?: string
          name_ar?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_upgrade_requests: {
        Row: {
          company_id: string
          created_at: string
          id: string
          notes: string | null
          requested_by_user_id: string | null
          status: string
          target_plan_id: string
          target_plan_name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          requested_by_user_id?: string | null
          status?: string
          target_plan_id: string
          target_plan_name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          requested_by_user_id?: string | null
          status?: string
          target_plan_id?: string
          target_plan_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_upgrade_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_pool: {
        Row: {
          candidate_id: string
          company_id: string | null
          created_at: string
          id: string
          notes: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          candidate_id: string
          company_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          candidate_id?: string
          company_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_pool_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_pool_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          company_id: string | null
          assignee_id: string | null
          reviewer_id: string | null
          expected_outcome: string
          completion_note: string
          blocked_reason: string
          cycle_id: string | null
          archived_at: string | null
          completed_at: string | null
          version: number
          events: Json
          assignee: string
          assignee_en: string | null
          candidate_id: string | null
          column_status: string
          comments: Json | null
          created_at: string
          description: string | null
          description_en: string | null
          due_date: string
          id: string
          job_id: string | null
          priority: string
          subtasks: Json | null
          tags: string[] | null
          title: string
          title_en: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          assignee_id?: string | null
          reviewer_id?: string | null
          expected_outcome?: string
          completion_note?: string
          blocked_reason?: string
          cycle_id?: string | null
          archived_at?: string | null
          completed_at?: string | null
          version?: number
          events?: Json
          assignee: string
          assignee_en?: string | null
          candidate_id?: string | null
          column_status?: string
          comments?: Json | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          due_date: string
          id?: string
          job_id?: string | null
          priority?: string
          subtasks?: Json | null
          tags?: string[] | null
          title: string
          title_en?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          assignee_id?: string | null
          reviewer_id?: string | null
          expected_outcome?: string
          completion_note?: string
          blocked_reason?: string
          cycle_id?: string | null
          archived_at?: string | null
          completed_at?: string | null
          version?: number
          events?: Json
          assignee?: string
          assignee_en?: string | null
          candidate_id?: string | null
          column_status?: string
          comments?: Json | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          due_date?: string
          id?: string
          job_id?: string | null
          priority?: string
          subtasks?: Json | null
          tags?: string[] | null
          title?: string
          title_en?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string
          endpoint_id: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          status: string
          status_code: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint_id: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          status: string
          status_code?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint_id?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          status?: string
          status_code?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: string[] | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      task_workflow: {
        Args: { _company_id: string; _action: string; _payload?: Json }
        Returns: Json
      }
      performance360: {
        Args: { _company_id: string; _action: string; _payload?: Json }
        Returns: Json
      }
      get_public_joined_companies: {
        Args: Record<PropertyKey, never>
        Returns: { name: string; logo_url: string | null }[]
      }
      get_public_job_employer: {
        Args: { _job_id: string }
        Returns: { name: string; logo_url: string | null }[]
      }
      accept_company_invitation: { Args: { _token: string }; Returns: Json }
      allow_candidate_recovery: {
        Args: { p_request_hash: string }
        Returns: boolean
      }
      apply_ai_evaluations: {
        Args: { _evaluations: Json; _response_id: string }
        Returns: Json
      }
      can_manage_notification_templates: {
        Args: { _company_id: string }
        Returns: boolean
      }
      candidate_has_agency_access: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
      decline_company_invitation: { Args: { _token: string }; Returns: Json }
      delete_company_permanently: {
        Args: { calling_user_id?: string; target_company_id: string }
        Returns: Json
      }
      get_assessment_for_candidate: { Args: { _token: string }; Returns: Json }
      get_invitation_by_token: { Args: { _token: string }; Returns: Json }
      get_offer_by_token: {
        Args: { _token: string }
        Returns: {
          additional_terms: string | null
          benefits: string[] | null
          candidate_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          department: string | null
          expires_at: string | null
          id: string
          job_id: string | null
          offer_type: string
          position: string
          response_date: string | null
          response_notes: string | null
          salary: number
          sent_at: string | null
          signature_url: string | null
          start_date: string | null
          status: string
          token: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "job_offers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_platform_role: { Args: { _user_id: string }; Returns: string }
      get_user_agencies: { Args: never; Returns: string[] }
      get_user_by_email_v1: {
        Args: { email_input: string }
        Returns: {
          email: string
          id: string
        }[]
      }
      get_user_companies: { Args: never; Returns: string[] }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_agency_access: { Args: { _agency_id: string }; Returns: boolean }
      has_company_access: { Args: { _company_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_email_open_count: {
        Args: { _tracking_id: string }
        Returns: undefined
      }
      increment_job_posts_used: {
        Args: { _user_id: string }
        Returns: undefined
      }
      is_company_owner: { Args: { _company_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin_user: { Args: never; Returns: boolean }
      respond_to_offer: {
        Args: {
          _response_notes?: string
          _signature_url?: string
          _status: string
          _token: string
        }
        Returns: boolean
      }
      set_automation_rule_active: {
        Args: { _company_id: string; _is_active: boolean; _rule_id: string }
        Returns: {
          actions: Json
          company_id: string
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          title: string
          trigger_event: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "automation_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_assessment_response: {
        Args: { _email: string; _name: string; _token: string }
        Returns: string
      }
      submit_assessment_response: {
        Args: {
          _answers: Json
          _response_id: string
          _tab_switch_log?: Json
          _tab_switches?: number
        }
        Returns: Json
      }
      validate_tenant_status: { Args: { _company_id?: string }; Returns: Json }
    }
    Enums: {
      app_role:
        | "admin"
        | "recruiter"
        | "reviewer"
        | "job_seeker"
        | "company_owner"
        | "company_hr"
        | "agency_manager"
        | "agency_officer"
      difficulty_level: "easy" | "medium" | "hard"
      question_type:
        | "multiple_choice"
        | "open_ended"
        | "code"
        | "true_false"
        | "matching"
        | "ordering"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "recruiter",
        "reviewer",
        "job_seeker",
        "company_owner",
        "company_hr",
        "agency_manager",
        "agency_officer",
      ],
      difficulty_level: ["easy", "medium", "hard"],
      question_type: [
        "multiple_choice",
        "open_ended",
        "code",
        "true_false",
        "matching",
        "ordering",
      ],
    },
  },
} as const
