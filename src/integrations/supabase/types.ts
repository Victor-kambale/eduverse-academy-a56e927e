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
      admin_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean
          totp_secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          totp_secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          totp_secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_revenue: {
        Row: {
          commission_amount: number
          commission_percentage: number
          course_id: string | null
          course_level: string | null
          created_at: string
          currency: string | null
          id: string
          source_id: string | null
          source_type: string
          student_id: string | null
          teacher_amount: number | null
          teacher_id: string | null
          total_amount: number
        }
        Insert: {
          commission_amount: number
          commission_percentage: number
          course_id?: string | null
          course_level?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          source_id?: string | null
          source_type: string
          student_id?: string | null
          teacher_amount?: number | null
          teacher_id?: string | null
          total_amount: number
        }
        Update: {
          commission_amount?: number
          commission_percentage?: number
          course_id?: string | null
          course_level?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          source_id?: string | null
          source_type?: string
          student_id?: string | null
          teacher_amount?: number | null
          teacher_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_revenue_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_approved: boolean | null
          rejection_reason: string | null
          teacher_id: string
          template_name: string
          template_url: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean | null
          rejection_reason?: string | null
          teacher_id: string
          template_name: string
          template_url?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean | null
          rejection_reason?: string | null
          teacher_id?: string
          template_name?: string
          template_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_appointments: {
        Row: {
          appointment_type: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          id: string
          rejection_reason: string | null
          scheduled_at: string | null
          status: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rejection_reason?: string | null
          scheduled_at?: string | null
          status?: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rejection_reason?: string | null
          scheduled_at?: string | null
          status?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          appointment_id: string
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          deleted_by: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          message: string | null
          message_type: string
          sender_id: string
        }
        Insert: {
          appointment_id: string
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message?: string | null
          message_type?: string
          sender_id: string
        }
        Update: {
          appointment_id?: string
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message?: string | null
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "chat_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      code_snippets: {
        Row: {
          code: string
          course_id: string
          created_at: string
          description: string | null
          id: string
          language: string
          lesson_id: string | null
          sort_order: number | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          lesson_id?: string | null
          sort_order?: number | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          lesson_id?: string | null
          sort_order?: number | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_snippets_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_snippets_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_creation_fees: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          currency: string | null
          id: string
          paid_at: string | null
          payment_id: string | null
          payment_method: string | null
          teacher_id: string
        }
        Insert: {
          amount?: number
          course_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          teacher_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          payment_method?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_creation_fees_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          course_id: string
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_approved: boolean | null
          is_downloadable: boolean | null
          lesson_id: string | null
          rejection_reason: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_approved?: boolean | null
          is_downloadable?: boolean | null
          lesson_id?: string | null
          rejection_reason?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_approved?: boolean | null
          is_downloadable?: boolean | null
          lesson_id?: string | null
          rejection_reason?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          instructor_id: string | null
          instructor_name: string | null
          is_published: boolean | null
          level: string | null
          price: number
          short_description: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_published?: boolean | null
          level?: string | null
          price?: number
          short_description?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_published?: boolean | null
          level?: string | null
          price?: number
          short_description?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      earnings_summary: {
        Row: {
          available_balance: number | null
          currency: string | null
          id: string
          total_appointments: number | null
          total_course_fees: number | null
          total_course_sales: number | null
          total_other: number | null
          total_withdrawn: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          currency?: string | null
          id?: string
          total_appointments?: number | null
          total_course_fees?: number | null
          total_course_sales?: number | null
          total_other?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number | null
          currency?: string | null
          id?: string
          total_appointments?: number | null
          total_course_fees?: number | null
          total_course_sales?: number | null
          total_other?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_links: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_external: boolean | null
          section: string
          sort_order: number | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          section: string
          sort_order?: number | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_external?: boolean | null
          section?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      language_settings: {
        Row: {
          code: string
          created_at: string
          flag: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_rtl: boolean | null
          name: string
          native_name: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          flag?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_rtl?: boolean | null
          name: string
          native_name?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          flag?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_rtl?: boolean | null
          name?: string
          native_name?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          course_id: string
          id: string
          last_watched_at: string | null
          lesson_id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          id?: string
          last_watched_at?: string | null
          lesson_id: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          id?: string
          last_watched_at?: string | null
          lesson_id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean | null
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_accounts: {
        Row: {
          account_details: Json
          account_name: string
          account_type: string
          created_at: string
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_details?: Json
          account_name: string
          account_type: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_details?: Json
          account_name?: string
          account_type?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_archived: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          sender_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          sender_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          sender_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          course_id: string
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          can_edit_profile: boolean | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          profile_disabled_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          can_edit_profile?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          profile_disabled_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          can_edit_profile?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          profile_disabled_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          media_type: string
          media_url: string | null
          sort_order: number | null
          start_date: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          media_type?: string
          media_url?: string | null
          sort_order?: number | null
          start_date?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          media_type?: string
          media_url?: string | null
          sort_order?: number | null
          start_date?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_text: string
          id: string
          is_correct: boolean | null
          question_id: string
          sort_order: number | null
        }
        Insert: {
          answer_text: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          sort_order?: number | null
        }
        Update: {
          answer_text?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          started_at: string
          total_points: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          started_at?: string
          total_points?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          total_points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          points: number | null
          question_text: string
          question_type: string | null
          quiz_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number | null
          question_text: string
          question_type?: string | null
          quiz_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          points?: number | null
          question_text?: string
          question_type?: string | null
          quiz_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_final_exam: boolean | null
          lesson_id: string | null
          passing_score: number | null
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_final_exam?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_final_exam?: boolean | null
          lesson_id?: string | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_certificates: {
        Row: {
          certificate_id: string
          certificate_url: string | null
          course_id: string
          credential_id: string
          id: string
          issued_at: string
          student_id: string
        }
        Insert: {
          certificate_id: string
          certificate_url?: string | null
          course_id: string
          credential_id: string
          id?: string
          issued_at?: string
          student_id: string
        }
        Update: {
          certificate_id?: string
          certificate_url?: string | null
          course_id?: string
          credential_id?: string
          id?: string
          issued_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_certificates_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_applications: {
        Row: {
          academic_reference_contact: string | null
          account_holder_name: string | null
          account_number: string | null
          approved_at: string | null
          approved_by: string | null
          bank_country: string | null
          bank_name: string | null
          bio: string | null
          contract_document_url: string | null
          contract_signed: boolean | null
          contract_signed_at: string | null
          country: string
          created_at: string
          cv_url: string | null
          date_of_birth: string | null
          degree_type: string | null
          email: string
          experience_years: number | null
          full_name: string
          graduation_degree_url: string | null
          graduation_year: number | null
          has_external_card_link: boolean | null
          iban: string | null
          id: string
          id_document_url: string | null
          linkedin_url: string | null
          passport_url: string | null
          phone: string | null
          photo_url: string | null
          registration_fee_paid: boolean | null
          registration_payment_date: string | null
          registration_payment_id: string | null
          rejection_reason: string | null
          routing_number: string | null
          specializations: string[] | null
          status:
            | Database["public"]["Enums"]["teacher_application_status"]
            | null
          swift_code: string | null
          university_country: string | null
          university_name: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          academic_reference_contact?: string | null
          account_holder_name?: string | null
          account_number?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_country?: string | null
          bank_name?: string | null
          bio?: string | null
          contract_document_url?: string | null
          contract_signed?: boolean | null
          contract_signed_at?: string | null
          country: string
          created_at?: string
          cv_url?: string | null
          date_of_birth?: string | null
          degree_type?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          graduation_degree_url?: string | null
          graduation_year?: number | null
          has_external_card_link?: boolean | null
          iban?: string | null
          id?: string
          id_document_url?: string | null
          linkedin_url?: string | null
          passport_url?: string | null
          phone?: string | null
          photo_url?: string | null
          registration_fee_paid?: boolean | null
          registration_payment_date?: string | null
          registration_payment_id?: string | null
          rejection_reason?: string | null
          routing_number?: string | null
          specializations?: string[] | null
          status?:
            | Database["public"]["Enums"]["teacher_application_status"]
            | null
          swift_code?: string | null
          university_country?: string | null
          university_name?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          academic_reference_contact?: string | null
          account_holder_name?: string | null
          account_number?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_country?: string | null
          bank_name?: string | null
          bio?: string | null
          contract_document_url?: string | null
          contract_signed?: boolean | null
          contract_signed_at?: string | null
          country?: string
          created_at?: string
          cv_url?: string | null
          date_of_birth?: string | null
          degree_type?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          graduation_degree_url?: string | null
          graduation_year?: number | null
          has_external_card_link?: boolean | null
          iban?: string | null
          id?: string
          id_document_url?: string | null
          linkedin_url?: string | null
          passport_url?: string | null
          phone?: string | null
          photo_url?: string | null
          registration_fee_paid?: boolean | null
          registration_payment_date?: string | null
          registration_payment_id?: string | null
          rejection_reason?: string | null
          routing_number?: string | null
          specializations?: string[] | null
          status?:
            | Database["public"]["Enums"]["teacher_application_status"]
            | null
          swift_code?: string | null
          university_country?: string | null
          university_name?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      teacher_credits: {
        Row: {
          created_at: string
          free_messages_remaining: number
          id: string
          is_premium: boolean | null
          premium_expires_at: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          free_messages_remaining?: number
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          free_messages_remaining?: number
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          country_code: string
          country_emoji: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          rating: number
          role: string
          sort_order: number
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          country_code?: string
          country_emoji?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          rating?: number
          role?: string
          sort_order?: number
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          country_emoji?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          rating?: number
          role?: string
          sort_order?: number
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_quiz_answers: {
        Row: {
          attempt_id: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_answer_id: string | null
        }
        Insert: {
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_answer_id?: string | null
        }
        Update: {
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_answer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_answers_selected_answer_id_fkey"
            columns: ["selected_answer_id"]
            isOneToOne: false
            referencedRelation: "quiz_answers"
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
      withdrawals: {
        Row: {
          amount: number
          category: string
          contract_url: string | null
          created_at: string
          currency: string
          id: string
          id_document_url: string | null
          payment_details: Json | null
          payment_method: string
          phone_verified: boolean | null
          processed_at: string | null
          processed_by: string | null
          receipt_number: string | null
          receipt_url: string | null
          rejection_reason: string | null
          signature_url: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
          user_type: string
          verification_attempts: number | null
          verification_code: string | null
        }
        Insert: {
          amount: number
          category: string
          contract_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          id_document_url?: string | null
          payment_details?: Json | null
          payment_method: string
          phone_verified?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          signature_url?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          user_type: string
          verification_attempts?: number | null
          verification_code?: string | null
        }
        Update: {
          amount?: number
          category?: string
          contract_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          id_document_url?: string | null
          payment_details?: Json | null
          payment_method?: string
          phone_verified?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          signature_url?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
          verification_attempts?: number | null
          verification_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "user"
      teacher_application_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "instructor", "user"],
      teacher_application_status: ["pending", "approved", "rejected"],
    },
  },
} as const
