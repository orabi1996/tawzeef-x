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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
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
          email: string
          experience: string | null
          id: string
          job_id: string
          name: string
          phone: string
          resume_url: string | null
          skills: string[] | null
          specialty: string | null
          status: string
        }
        Insert: {
          company_id?: string | null
          cover_letter?: string | null
          created_at?: string
          email: string
          experience?: string | null
          id?: string
          job_id: string
          name: string
          phone: string
          resume_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          status?: string
        }
        Update: {
          company_id?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          id?: string
          job_id?: string
          name?: string
          phone?: string
          resume_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          status?: string
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
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      candidates: {
        Row: {
          agency_id: string | null
          ai_evaluation: string | null
          ai_score: number | null
          company_id: string | null
          created_at: string
          education: string | null
          email: string | null
          embedding: Json | null
          embedding_text: string | null
          experience: string | null
          id: string
          job_id: string | null
          location: string | null
          name: string
          phone: string | null
          rating: number | null
          resume_url: string | null
          role: string | null
          skills: string[] | null
          source: string | null
          stage: string | null
          status: string
          summary: string | null
          tracking_code: string | null
          updated_at: string
          user_id: string
          expected_salary: string | null
          notes: string | null
        }
        Insert: {
          agency_id?: string | null
          ai_evaluation?: string | null
          ai_score?: number | null
          company_id?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          embedding?: Json | null
          embedding_text?: string | null
          experience?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          role?: string | null
          skills?: string[] | null
          source?: string | null
          stage?: string | null
          status?: string
          summary?: string | null
          tracking_code?: string | null
          updated_at?: string
          user_id: string
          expected_salary?: string | null
          notes?: string | null
        }
        Update: {
          agency_id?: string | null
          ai_evaluation?: string | null
          ai_score?: number | null
          company_id?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          embedding?: Json | null
          embedding_text?: string | null
          experience?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          role?: string | null
          skills?: string[] | null
          source?: string | null
          stage?: string | null
          status?: string
          summary?: string | null
          tracking_code?: string | null
          updated_at?: string
          user_id?: string
          expected_salary?: string | null
          notes?: string | null
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
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          name_en: string | null
          notes: string | null
          owner_user_id: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          name_en?: string | null
          notes?: string | null
          owner_user_id?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          name_en?: string | null
          notes?: string | null
          owner_user_id?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          accepted_at: string | null
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
        Relationships: []
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
            foreignKeyName: "company_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
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
          access_token: string | null
          expires_at: string | null
          linkedin_urn: string | null
          linkedin_name: string | null
          linkedin_avatar: string | null
          custom_client_id: string | null
          custom_client_secret: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          zapier_webhook_url?: string
          access_token?: string | null
          expires_at?: string | null
          linkedin_urn?: string | null
          linkedin_name?: string | null
          linkedin_avatar?: string | null
          custom_client_id?: string | null
          custom_client_secret?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          zapier_webhook_url?: string
          access_token?: string | null
          expires_at?: string | null
          linkedin_urn?: string | null
          linkedin_name?: string | null
          linkedin_avatar?: string | null
          custom_client_id?: string | null
          custom_client_secret?: string | null
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
      pipeline_stages: {
        Row: {
          assessment_id: string | null
          assigned_user_ids: string[] | null
          automation_rules: Json
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
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
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
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
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
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
        ]
      }
      pipeline_sub_stages: {
        Row: {
          assignee_type: string | null
          checklist: Json | null
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
            foreignKeyName: "pipeline_sub_stages_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
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
      talent_pool: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          notes: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          candidate_id?: string
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
          events: string[]
          id: string
          is_active: boolean
          name: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
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
      accept_company_invitation: { Args: { _token: string }; Returns: Json }
      apply_ai_evaluations: {
        Args: { _evaluations: Json; _response_id: string }
        Returns: Json
      }
      candidate_has_agency_access: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
      decline_company_invitation: { Args: { _token: string }; Returns: Json }
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
      get_user_agencies: { Args: never; Returns: string[] }
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
      respond_to_offer: {
        Args: {
          _response_notes?: string
          _signature_url?: string
          _status: string
          _token: string
        }
        Returns: boolean
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
