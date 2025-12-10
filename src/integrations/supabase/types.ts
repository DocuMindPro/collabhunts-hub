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
      backup_history: {
        Row: {
          backup_type: string
          backup_version: string | null
          components_backed_up: Json | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          file_name: string | null
          file_size: number | null
          function_count: number | null
          id: string
          migration_count: number | null
          s3_url: string | null
          status: string
          tables_backed_up: string[] | null
          triggered_by: string | null
        }
        Insert: {
          backup_type?: string
          backup_version?: string | null
          components_backed_up?: Json | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          file_name?: string | null
          file_size?: number | null
          function_count?: number | null
          id?: string
          migration_count?: number | null
          s3_url?: string | null
          status: string
          tables_backed_up?: string[] | null
          triggered_by?: string | null
        }
        Update: {
          backup_type?: string
          backup_version?: string | null
          components_backed_up?: Json | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          file_name?: string | null
          file_size?: number | null
          function_count?: number | null
          id?: string
          migration_count?: number | null
          s3_url?: string | null
          status?: string
          tables_backed_up?: string[] | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      booking_deliverables: {
        Row: {
          booking_id: string
          created_at: string | null
          creator_profile_id: string
          description: string | null
          file_name: string
          file_size_bytes: number
          file_type: string
          id: string
          mime_type: string
          r2_key: string
          thumbnail_r2_key: string | null
          version: number | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          creator_profile_id: string
          description?: string | null
          file_name: string
          file_size_bytes: number
          file_type: string
          id?: string
          mime_type: string
          r2_key: string
          thumbnail_r2_key?: string | null
          version?: number | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          creator_profile_id?: string
          description?: string | null
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          mime_type?: string
          r2_key?: string
          thumbnail_r2_key?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_deliverables_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_deliverables_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_disputes: {
        Row: {
          admin_decision_reason: string | null
          admin_notes: string | null
          booking_id: string
          created_at: string
          escalated_to_admin: boolean | null
          evidence_description: string | null
          id: string
          opened_by_role: string
          opened_by_user_id: string
          reason: string
          refund_percentage: number | null
          reminder_sent_day2: boolean | null
          reminder_sent_day3: boolean | null
          resolution_deadline: string | null
          resolved_at: string | null
          resolved_by_user_id: string | null
          response_deadline: string
          response_submitted_at: string | null
          response_text: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_decision_reason?: string | null
          admin_notes?: string | null
          booking_id: string
          created_at?: string
          escalated_to_admin?: boolean | null
          evidence_description?: string | null
          id?: string
          opened_by_role: string
          opened_by_user_id: string
          reason: string
          refund_percentage?: number | null
          reminder_sent_day2?: boolean | null
          reminder_sent_day3?: boolean | null
          resolution_deadline?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          response_deadline: string
          response_submitted_at?: string | null
          response_text?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_decision_reason?: string | null
          admin_notes?: string | null
          booking_id?: string
          created_at?: string
          escalated_to_admin?: boolean | null
          evidence_description?: string | null
          id?: string
          opened_by_role?: string
          opened_by_user_id?: string
          reason?: string
          refund_percentage?: number | null
          reminder_sent_day2?: boolean | null
          reminder_sent_day3?: boolean | null
          resolution_deadline?: string | null
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          response_deadline?: string
          response_submitted_at?: string | null
          response_text?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string | null
          brand_profile_id: string
          confirmed_at: string | null
          created_at: string | null
          creator_profile_id: string
          delivery_deadline: string | null
          delivery_status: string | null
          id: string
          message: string | null
          payment_status: string
          platform_fee_cents: number | null
          revision_count: number | null
          revision_notes: string | null
          service_id: string | null
          status: string | null
          total_price_cents: number
          updated_at: string | null
        }
        Insert: {
          booking_date?: string | null
          brand_profile_id: string
          confirmed_at?: string | null
          created_at?: string | null
          creator_profile_id: string
          delivery_deadline?: string | null
          delivery_status?: string | null
          id?: string
          message?: string | null
          payment_status?: string
          platform_fee_cents?: number | null
          revision_count?: number | null
          revision_notes?: string | null
          service_id?: string | null
          status?: string | null
          total_price_cents: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string | null
          brand_profile_id?: string
          confirmed_at?: string | null
          created_at?: string | null
          creator_profile_id?: string
          delivery_deadline?: string | null
          delivery_status?: string | null
          id?: string
          message?: string | null
          payment_status?: string
          platform_fee_cents?: number | null
          revision_count?: number | null
          revision_notes?: string | null
          service_id?: string | null
          status?: string | null
          total_price_cents?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "creator_services"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          marketing_intent: string | null
          monthly_budget_range: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          preferred_categories: string[] | null
          preferred_platforms: string[] | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          marketing_intent?: string | null
          monthly_budget_range?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_categories?: string[] | null
          preferred_platforms?: string[] | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          marketing_intent?: string | null
          monthly_budget_range?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_categories?: string[] | null
          preferred_platforms?: string[] | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      brand_storage_usage: {
        Row: {
          brand_profile_id: string
          created_at: string
          extra_storage_bytes: number
          id: string
          storage_limit_bytes: number
          storage_used_bytes: number
          updated_at: string
        }
        Insert: {
          brand_profile_id: string
          created_at?: string
          extra_storage_bytes?: number
          id?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
        }
        Update: {
          brand_profile_id?: string
          created_at?: string
          extra_storage_bytes?: number
          id?: string
          storage_limit_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_storage_usage_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: true
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_subscriptions: {
        Row: {
          brand_profile_id: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          brand_profile_id: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          brand_profile_id?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_subscriptions_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_applications: {
        Row: {
          campaign_id: string
          created_at: string
          creator_profile_id: string
          id: string
          message: string | null
          proposed_price_cents: number
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_profile_id: string
          id?: string
          message?: string | null
          proposed_price_cents: number
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_profile_id?: string
          id?: string
          message?: string | null
          proposed_price_cents?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_applications_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_profile_id: string
          budget_cents: number
          campaign_type: string
          created_at: string
          deadline: string
          description: string
          id: string
          requirements: string | null
          spots_available: number
          spots_filled: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          brand_profile_id: string
          budget_cents: number
          campaign_type: string
          created_at?: string
          deadline: string
          description: string
          id?: string
          requirements?: string | null
          spots_available?: number
          spots_filled?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brand_profile_id?: string
          budget_cents?: number
          campaign_type?: string
          created_at?: string
          deadline?: string
          description?: string
          id?: string
          requirements?: string | null
          spots_available?: number
          spots_filled?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_folders: {
        Row: {
          brand_profile_id: string
          color: string | null
          created_at: string | null
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_profile_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_profile_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_folders_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "content_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          booking_id: string | null
          brand_profile_id: string
          created_at: string
          creator_profile_id: string | null
          description: string | null
          file_name: string
          file_size_bytes: number
          file_type: string
          folder_id: string | null
          id: string
          last_expiry_notification_sent: string | null
          mime_type: string
          r2_key: string
          rights_type: string | null
          tags: string[] | null
          thumbnail_r2_key: string | null
          title: string | null
          updated_at: string
          usage_rights_end: string | null
          usage_rights_start: string | null
        }
        Insert: {
          booking_id?: string | null
          brand_profile_id: string
          created_at?: string
          creator_profile_id?: string | null
          description?: string | null
          file_name: string
          file_size_bytes: number
          file_type: string
          folder_id?: string | null
          id?: string
          last_expiry_notification_sent?: string | null
          mime_type: string
          r2_key: string
          rights_type?: string | null
          tags?: string[] | null
          thumbnail_r2_key?: string | null
          title?: string | null
          updated_at?: string
          usage_rights_end?: string | null
          usage_rights_start?: string | null
        }
        Update: {
          booking_id?: string | null
          brand_profile_id?: string
          created_at?: string
          creator_profile_id?: string | null
          description?: string | null
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          last_expiry_notification_sent?: string | null
          mime_type?: string
          r2_key?: string
          rights_type?: string | null
          tags?: string[] | null
          thumbnail_r2_key?: string | null
          title?: string | null
          updated_at?: string
          usage_rights_end?: string | null
          usage_rights_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_library_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "content_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          brand_profile_id: string
          created_at: string | null
          creator_profile_id: string
          id: string
          last_message_at: string | null
        }
        Insert: {
          brand_profile_id: string
          created_at?: string | null
          creator_profile_id: string
          id?: string
          last_message_at?: string | null
        }
        Update: {
          brand_profile_id?: string
          created_at?: string | null
          creator_profile_id?: string
          id?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_notes: {
        Row: {
          brand_profile_id: string
          created_at: string | null
          creator_profile_id: string
          id: string
          note_content: string
          updated_at: string | null
        }
        Insert: {
          brand_profile_id: string
          created_at?: string | null
          creator_profile_id: string
          id?: string
          note_content: string
          updated_at?: string | null
        }
        Update: {
          brand_profile_id?: string
          created_at?: string | null
          creator_profile_id?: string
          id?: string
          note_content?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_notes_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_notes_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payout_settings: {
        Row: {
          account_status: string
          created_at: string | null
          creator_profile_id: string
          id: string
          payout_enabled: boolean
          stripe_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string
          created_at?: string | null
          creator_profile_id: string
          id?: string
          payout_enabled?: boolean
          stripe_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string
          created_at?: string | null
          creator_profile_id?: string
          id?: string
          payout_enabled?: boolean
          stripe_account_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_payout_settings_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: true
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_portfolio_media: {
        Row: {
          created_at: string | null
          creator_profile_id: string
          display_order: number | null
          id: string
          media_type: string
          thumbnail_url: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          display_order?: number | null
          id?: string
          media_type: string
          thumbnail_url?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          display_order?: number | null
          id?: string
          media_type?: string
          thumbnail_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_portfolio_media_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          categories: string[] | null
          cover_image_url: string | null
          cover_image_url_2: string | null
          cover_image_url_3: string | null
          created_at: string | null
          display_name: string
          ethnicity: string | null
          gender: string | null
          id: string
          location_city: string | null
          location_country: string | null
          location_state: string | null
          phone_number: string | null
          phone_verified: boolean | null
          primary_language: string | null
          profile_image_url: string | null
          rejection_reason: string | null
          secondary_languages: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          categories?: string[] | null
          cover_image_url?: string | null
          cover_image_url_2?: string | null
          cover_image_url_3?: string | null
          created_at?: string | null
          display_name: string
          ethnicity?: string | null
          gender?: string | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          primary_language?: string | null
          profile_image_url?: string | null
          rejection_reason?: string | null
          secondary_languages?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          categories?: string[] | null
          cover_image_url?: string | null
          cover_image_url_2?: string | null
          cover_image_url_3?: string | null
          created_at?: string | null
          display_name?: string
          ethnicity?: string | null
          gender?: string | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          primary_language?: string | null
          profile_image_url?: string | null
          rejection_reason?: string | null
          secondary_languages?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_services: {
        Row: {
          created_at: string | null
          creator_profile_id: string
          delivery_days: number | null
          description: string | null
          id: string
          is_active: boolean | null
          price_cents: number
          service_type: string
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_cents: number
          service_type: string
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_cents?: number
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_services_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_social_accounts: {
        Row: {
          created_at: string | null
          creator_profile_id: string
          follower_count: number | null
          id: string
          platform: string
          profile_url: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          follower_count?: number | null
          id?: string
          platform: string
          profile_url?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          follower_count?: number | null
          id?: string
          platform?: string
          profile_url?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_social_accounts_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
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
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount_cents: number
          booking_ids: string[]
          created_at: string | null
          creator_profile_id: string
          id: string
          payout_date: string | null
          status: string
          stripe_payout_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          booking_ids?: string[]
          created_at?: string | null
          creator_profile_id: string
          id?: string
          payout_date?: string | null
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          booking_ids?: string[]
          created_at?: string | null
          creator_profile_id?: string
          id?: string
          payout_date?: string | null
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string | null
          creator_profile_id: string
          id: string
          view_date: string | null
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          id?: string
          view_date?: string | null
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          id?: string
          view_date?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          brand_profile_id: string
          created_at: string
          creator_profile_id: string
          id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          brand_profile_id: string
          created_at?: string
          creator_profile_id: string
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          brand_profile_id?: string
          created_at?: string
          creator_profile_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_creators: {
        Row: {
          brand_profile_id: string
          created_at: string | null
          creator_profile_id: string
          folder_name: string | null
          id: string
        }
        Insert: {
          brand_profile_id: string
          created_at?: string | null
          creator_profile_id: string
          folder_name?: string | null
          id?: string
        }
        Update: {
          brand_profile_id?: string
          created_at?: string | null
          creator_profile_id?: string
          folder_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_creators_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_creators_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_purchases: {
        Row: {
          brand_profile_id: string
          created_at: string
          expires_at: string | null
          id: string
          price_cents: number
          purchased_at: string
          status: string
          storage_amount_bytes: number
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          brand_profile_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          price_cents: number
          purchased_at?: string
          status?: string
          storage_amount_bytes: number
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          brand_profile_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          price_cents?: number
          purchased_at?: string
          status?: string
          storage_amount_bytes?: number
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_purchases_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
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
      record_profile_view: {
        Args: { p_creator_profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "brand" | "creator"
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
      app_role: ["admin", "brand", "creator"],
    },
  },
} as const
