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
      account_delegates: {
        Row: {
          accepted_at: string | null
          account_type: string
          delegate_email: string
          delegate_user_id: string | null
          id: string
          invited_at: string
          owner_user_id: string
          profile_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          account_type: string
          delegate_email: string
          delegate_user_id?: string | null
          id?: string
          invited_at?: string
          owner_user_id: string
          profile_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          account_type?: string
          delegate_email?: string
          delegate_user_id?: string | null
          id?: string
          invited_at?: string
          owner_user_id?: string
          profile_id?: string
          status?: string
        }
        Relationships: []
      }
      ad_placements: {
        Row: {
          advertiser_name: string | null
          advertiser_type: string | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_type: string | null
          link_url: string | null
          notes: string | null
          page: string
          placement_id: string
          placement_name: string
          position: string
          start_date: string | null
          target_creator_profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          advertiser_name?: string | null
          advertiser_type?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_type?: string | null
          link_url?: string | null
          notes?: string | null
          page: string
          placement_id: string
          placement_name: string
          position: string
          start_date?: string | null
          target_creator_profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          advertiser_name?: string | null
          advertiser_type?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_type?: string | null
          link_url?: string | null
          notes?: string | null
          page?: string
          placement_id?: string
          placement_name?: string
          position?: string
          start_date?: string | null
          target_creator_profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_placements_target_creator_profile_id_fkey"
            columns: ["target_creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_feature_overrides: {
        Row: {
          expires_at: string | null
          feature_key: string
          granted_at: string | null
          granted_by: string | null
          id: string
          is_enabled: boolean
          notes: string | null
          target_profile_id: string
          target_type: string
        }
        Insert: {
          expires_at?: string | null
          feature_key: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_enabled?: boolean
          notes?: string | null
          target_profile_id: string
          target_type: string
        }
        Update: {
          expires_at?: string | null
          feature_key?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_enabled?: boolean
          notes?: string | null
          target_profile_id?: string
          target_type?: string
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          affiliate_amount_cents: number
          affiliate_id: string
          created_at: string
          gross_revenue_cents: number
          id: string
          platform_amount_cents: number
          referral_id: string
          source_id: string
          source_type: string
        }
        Insert: {
          affiliate_amount_cents: number
          affiliate_id: string
          created_at?: string
          gross_revenue_cents: number
          id?: string
          platform_amount_cents: number
          referral_id: string
          source_id: string
          source_type: string
        }
        Update: {
          affiliate_amount_cents?: number
          affiliate_id?: string
          created_at?: string
          gross_revenue_cents?: number
          id?: string
          platform_amount_cents?: number
          referral_id?: string
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earnings_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_earnings_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payout_requests: {
        Row: {
          admin_notes: string | null
          affiliate_id: string
          amount_cents: number
          created_at: string
          id: string
          payout_details: Json | null
          payout_method: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id: string
          amount_cents: number
          created_at?: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string
          amount_cents?: number
          created_at?: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payout_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          available_balance_cents: number
          commission_rate: number
          created_at: string
          display_name: string
          email: string
          id: string
          referral_code: string
          status: string
          total_earnings_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          available_balance_cents?: number
          commission_rate?: number
          created_at?: string
          display_name: string
          email: string
          id?: string
          referral_code: string
          status?: string
          total_earnings_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          available_balance_cents?: number
          commission_rate?: number
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          referral_code?: string
          status?: string
          total_earnings_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      booking_offers: {
        Row: {
          accepted_at: string | null
          booking_id: string | null
          brand_profile_id: string
          conversation_id: string
          created_at: string
          creator_profile_id: string
          declined_at: string | null
          duration_hours: number | null
          event_date: string | null
          event_time_start: string | null
          expires_at: string | null
          id: string
          message_id: string | null
          notes: string | null
          package_type: string
          price_cents: number
          status: string
        }
        Insert: {
          accepted_at?: string | null
          booking_id?: string | null
          brand_profile_id: string
          conversation_id: string
          created_at?: string
          creator_profile_id: string
          declined_at?: string | null
          duration_hours?: number | null
          event_date?: string | null
          event_time_start?: string | null
          expires_at?: string | null
          id?: string
          message_id?: string | null
          notes?: string | null
          package_type: string
          price_cents: number
          status?: string
        }
        Update: {
          accepted_at?: string | null
          booking_id?: string | null
          brand_profile_id?: string
          conversation_id?: string
          created_at?: string
          creator_profile_id?: string
          declined_at?: string | null
          duration_hours?: number | null
          event_date?: string | null
          event_time_start?: string | null
          expires_at?: string | null
          id?: string
          message_id?: string | null
          notes?: string | null
          package_type?: string
          price_cents?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_offers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_offers_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_offers_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_offers_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_offers_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_offers_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          attendance_count: number | null
          booking_date: string | null
          brand_profile_id: string
          confirmed_at: string | null
          created_at: string | null
          creator_profile_id: string
          delivered_at: string | null
          delivery_deadline: string | null
          delivery_status: string | null
          deposit_amount_cents: number | null
          escrow_status: string | null
          event_date: string | null
          event_time_end: string | null
          event_time_start: string | null
          event_type: string | null
          final_amount_cents: number | null
          id: string
          max_capacity: number | null
          message: string | null
          package_type: string | null
          payment_status: string
          platform_fee_cents: number | null
          revision_count: number | null
          revision_notes: string | null
          service_id: string | null
          status: string | null
          total_price_cents: number
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          attendance_count?: number | null
          booking_date?: string | null
          brand_profile_id: string
          confirmed_at?: string | null
          created_at?: string | null
          creator_profile_id: string
          delivered_at?: string | null
          delivery_deadline?: string | null
          delivery_status?: string | null
          deposit_amount_cents?: number | null
          escrow_status?: string | null
          event_date?: string | null
          event_time_end?: string | null
          event_time_start?: string | null
          event_type?: string | null
          final_amount_cents?: number | null
          id?: string
          max_capacity?: number | null
          message?: string | null
          package_type?: string | null
          payment_status?: string
          platform_fee_cents?: number | null
          revision_count?: number | null
          revision_notes?: string | null
          service_id?: string | null
          status?: string | null
          total_price_cents: number
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          attendance_count?: number | null
          booking_date?: string | null
          brand_profile_id?: string
          confirmed_at?: string | null
          created_at?: string | null
          creator_profile_id?: string
          delivered_at?: string | null
          delivery_deadline?: string | null
          delivery_status?: string | null
          deposit_amount_cents?: number | null
          escrow_status?: string | null
          event_date?: string | null
          event_time_end?: string | null
          event_time_start?: string | null
          event_type?: string | null
          final_amount_cents?: number | null
          id?: string
          max_capacity?: number | null
          message?: string | null
          package_type?: string | null
          payment_status?: string
          platform_fee_cents?: number | null
          revision_count?: number | null
          revision_notes?: string | null
          service_id?: string | null
          status?: string | null
          total_price_cents?: number
          updated_at?: string | null
          venue_id?: string | null
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
            foreignKeyName: "bookings_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_opportunities: {
        Row: {
          application_deadline: string | null
          brand_profile_id: string
          budget_cents: number | null
          created_at: string
          description: string | null
          end_time: string | null
          enforce_follower_range: boolean
          event_date: string
          follower_ranges: string[] | null
          id: string
          is_featured: boolean | null
          is_paid: boolean
          location_city: string | null
          location_country: string | null
          min_followers: number | null
          package_type: string | null
          required_categories: string[] | null
          requirements: string | null
          spots_available: number
          spots_filled: number
          start_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          brand_profile_id: string
          budget_cents?: number | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          enforce_follower_range?: boolean
          event_date: string
          follower_ranges?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_paid?: boolean
          location_city?: string | null
          location_country?: string | null
          min_followers?: number | null
          package_type?: string | null
          required_categories?: string[] | null
          requirements?: string | null
          spots_available?: number
          spots_filled?: number
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          brand_profile_id?: string
          budget_cents?: number | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          enforce_follower_range?: boolean
          event_date?: string
          follower_ranges?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_paid?: boolean
          location_city?: string | null
          location_country?: string | null
          min_followers?: number | null
          package_type?: string | null
          required_categories?: string[] | null
          requirements?: string | null
          spots_available?: number
          spots_filled?: number
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_opportunities_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_opportunities_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          accessibility_info: string | null
          ai_drafts_reset_at: string
          ai_drafts_used_this_month: number
          amenities: string[] | null
          brand_plan: string
          company_name: string
          company_size: string | null
          contact_position: string | null
          created_at: string | null
          creators_messaged_reset_at: string
          creators_messaged_this_month: number
          facebook_url: string | null
          first_name: string | null
          free_posts_reset_at: string | null
          free_posts_used_this_month: number
          id: string
          industry: string | null
          instagram_url: string | null
          is_verified: boolean | null
          last_name: string | null
          location_country: string | null
          logo_url: string | null
          marketing_intent: string | null
          monthly_budget_range: string | null
          onboarding_completed: boolean | null
          parking_available: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          preferred_categories: string[] | null
          preferred_platforms: string[] | null
          registration_completed: boolean
          terms_accepted_at: string | null
          terms_version: string | null
          tiktok_url: string | null
          updated_at: string | null
          user_id: string
          venue_address: string | null
          venue_capacity: number | null
          venue_city: string | null
          venue_name: string | null
          venue_type: string | null
          verification_completed_at: string | null
          verification_expires_at: string | null
          verification_notes: string | null
          verification_paid_at: string | null
          verification_payment_id: string | null
          verification_payment_status: string | null
          verification_rejection_reason: string | null
          verification_status: string | null
          verification_submitted_at: string | null
          verified_by_user_id: string | null
          website_url: string | null
        }
        Insert: {
          accessibility_info?: string | null
          ai_drafts_reset_at?: string
          ai_drafts_used_this_month?: number
          amenities?: string[] | null
          brand_plan?: string
          company_name?: string
          company_size?: string | null
          contact_position?: string | null
          created_at?: string | null
          creators_messaged_reset_at?: string
          creators_messaged_this_month?: number
          facebook_url?: string | null
          first_name?: string | null
          free_posts_reset_at?: string | null
          free_posts_used_this_month?: number
          id?: string
          industry?: string | null
          instagram_url?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          location_country?: string | null
          logo_url?: string | null
          marketing_intent?: string | null
          monthly_budget_range?: string | null
          onboarding_completed?: boolean | null
          parking_available?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_categories?: string[] | null
          preferred_platforms?: string[] | null
          registration_completed?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          user_id: string
          venue_address?: string | null
          venue_capacity?: number | null
          venue_city?: string | null
          venue_name?: string | null
          venue_type?: string | null
          verification_completed_at?: string | null
          verification_expires_at?: string | null
          verification_notes?: string | null
          verification_paid_at?: string | null
          verification_payment_id?: string | null
          verification_payment_status?: string | null
          verification_rejection_reason?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          verified_by_user_id?: string | null
          website_url?: string | null
        }
        Update: {
          accessibility_info?: string | null
          ai_drafts_reset_at?: string
          ai_drafts_used_this_month?: number
          amenities?: string[] | null
          brand_plan?: string
          company_name?: string
          company_size?: string | null
          contact_position?: string | null
          created_at?: string | null
          creators_messaged_reset_at?: string
          creators_messaged_this_month?: number
          facebook_url?: string | null
          first_name?: string | null
          free_posts_reset_at?: string | null
          free_posts_used_this_month?: number
          id?: string
          industry?: string | null
          instagram_url?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          location_country?: string | null
          logo_url?: string | null
          marketing_intent?: string | null
          monthly_budget_range?: string | null
          onboarding_completed?: boolean | null
          parking_available?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_categories?: string[] | null
          preferred_platforms?: string[] | null
          registration_completed?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          user_id?: string
          venue_address?: string | null
          venue_capacity?: number | null
          venue_city?: string | null
          venue_name?: string | null
          venue_type?: string | null
          verification_completed_at?: string | null
          verification_expires_at?: string | null
          verification_notes?: string | null
          verification_paid_at?: string | null
          verification_payment_id?: string | null
          verification_payment_status?: string | null
          verification_rejection_reason?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          verified_by_user_id?: string | null
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
          {
            foreignKeyName: "brand_storage_usage_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: true
            referencedRelation: "brand_profiles_public"
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
          {
            foreignKeyName: "brand_subscriptions_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          metadata: Json | null
          reminder_0d_sent: boolean | null
          reminder_1d_sent: boolean | null
          reminder_7d_sent: boolean | null
          source_id: string
          source_table: string
          start_date: string
          start_time: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          reminder_0d_sent?: boolean | null
          reminder_1d_sent?: boolean | null
          reminder_7d_sent?: boolean | null
          source_id: string
          source_table: string
          start_date: string
          start_time?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          reminder_0d_sent?: boolean | null
          reminder_1d_sent?: boolean | null
          reminder_7d_sent?: boolean | null
          source_id?: string
          source_table?: string
          start_date?: string
          start_time?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "campaigns_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      career_applications: {
        Row: {
          admin_notes: string | null
          cover_letter: string | null
          created_at: string
          cv_url: string
          email: string
          full_name: string
          id: string
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          position_id: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_url: string
          email: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          position_id: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          cover_letter?: string | null
          created_at?: string
          cv_url?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          position_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "career_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      career_positions: {
        Row: {
          created_at: string
          department: string | null
          description: string
          employment_type: string
          id: string
          is_active: boolean
          location: string | null
          requirements: string
          responsibilities: string | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          description: string
          employment_type?: string
          id?: string
          is_active?: boolean
          location?: string | null
          requirements: string
          responsibilities?: string | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string
          employment_type?: string
          id?: string
          is_active?: boolean
          location?: string | null
          requirements?: string
          responsibilities?: string | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "content_folders_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
            foreignKeyName: "content_library_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
            foreignKeyName: "conversations_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
      creator_agreements: {
        Row: {
          brand_profile_id: string
          completed_at: string | null
          confirmed_at: string | null
          content: string
          conversation_id: string | null
          created_at: string
          creator_profile_id: string
          declined_at: string | null
          deliverables: Json | null
          duration_hours: number | null
          event_date: string | null
          event_time: string | null
          id: string
          message_id: string | null
          proposed_price_cents: number
          status: string
          template_type: string
          updated_at: string
        }
        Insert: {
          brand_profile_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string
          creator_profile_id: string
          declined_at?: string | null
          deliverables?: Json | null
          duration_hours?: number | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          message_id?: string | null
          proposed_price_cents: number
          status?: string
          template_type: string
          updated_at?: string
        }
        Update: {
          brand_profile_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          creator_profile_id?: string
          declined_at?: string | null
          deliverables?: Json | null
          duration_hours?: number | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          message_id?: string | null
          proposed_price_cents?: number
          status?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_agreements_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_agreements_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_agreements_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_agreements_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_agreements_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_featuring: {
        Row: {
          category: string | null
          created_at: string | null
          creator_profile_id: string
          end_date: string
          feature_type: string
          id: string
          is_active: boolean | null
          price_cents: number
          start_date: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creator_profile_id: string
          end_date: string
          feature_type: string
          id?: string
          is_active?: boolean | null
          price_cents: number
          start_date: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creator_profile_id?: string
          end_date?: string
          feature_type?: string
          id?: string
          is_active?: boolean | null
          price_cents?: number
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_featuring_creator_profile_id_fkey"
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
            foreignKeyName: "creator_notes_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
          file_size_bytes: number | null
          id: string
          media_type: string
          thumbnail_url: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          display_order?: number | null
          file_size_bytes?: number | null
          id?: string
          media_type: string
          thumbnail_url?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          display_order?: number | null
          file_size_bytes?: number | null
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
          allow_mass_messages: boolean | null
          availability_calendar: Json | null
          average_rating: number | null
          avg_response_minutes: number | null
          bio: string | null
          birth_date: string | null
          categories: string[] | null
          cover_image_url: string | null
          cover_image_url_2: string | null
          cover_image_url_3: string | null
          created_at: string | null
          display_name: string
          ethnicity: string | null
          event_experience_description: string | null
          event_portfolio_urls: string[] | null
          featuring_priority: number | null
          gender: string | null
          id: string
          is_featured: boolean | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          max_event_price_cents: number | null
          min_event_price_cents: number | null
          open_to_invitations: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          primary_language: string | null
          profile_image_url: string | null
          rejection_reason: string | null
          secondary_languages: string[] | null
          show_pricing_to_public: boolean | null
          status: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          total_reviews: number | null
          travel_radius_km: number | null
          updated_at: string | null
          user_id: string
          verification_expires_at: string | null
          verification_paid_at: string | null
          verification_payment_id: string | null
          verification_payment_status: string | null
        }
        Insert: {
          allow_mass_messages?: boolean | null
          availability_calendar?: Json | null
          average_rating?: number | null
          avg_response_minutes?: number | null
          bio?: string | null
          birth_date?: string | null
          categories?: string[] | null
          cover_image_url?: string | null
          cover_image_url_2?: string | null
          cover_image_url_3?: string | null
          created_at?: string | null
          display_name: string
          ethnicity?: string | null
          event_experience_description?: string | null
          event_portfolio_urls?: string[] | null
          featuring_priority?: number | null
          gender?: string | null
          id?: string
          is_featured?: boolean | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          max_event_price_cents?: number | null
          min_event_price_cents?: number | null
          open_to_invitations?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          primary_language?: string | null
          profile_image_url?: string | null
          rejection_reason?: string | null
          secondary_languages?: string[] | null
          show_pricing_to_public?: boolean | null
          status?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          total_reviews?: number | null
          travel_radius_km?: number | null
          updated_at?: string | null
          user_id: string
          verification_expires_at?: string | null
          verification_paid_at?: string | null
          verification_payment_id?: string | null
          verification_payment_status?: string | null
        }
        Update: {
          allow_mass_messages?: boolean | null
          availability_calendar?: Json | null
          average_rating?: number | null
          avg_response_minutes?: number | null
          bio?: string | null
          birth_date?: string | null
          categories?: string[] | null
          cover_image_url?: string | null
          cover_image_url_2?: string | null
          cover_image_url_3?: string | null
          created_at?: string | null
          display_name?: string
          ethnicity?: string | null
          event_experience_description?: string | null
          event_portfolio_urls?: string[] | null
          featuring_priority?: number | null
          gender?: string | null
          id?: string
          is_featured?: boolean | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          max_event_price_cents?: number | null
          min_event_price_cents?: number | null
          open_to_invitations?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          primary_language?: string | null
          profile_image_url?: string | null
          rejection_reason?: string | null
          secondary_languages?: string[] | null
          show_pricing_to_public?: boolean | null
          status?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          total_reviews?: number | null
          travel_radius_km?: number | null
          updated_at?: string | null
          user_id?: string
          verification_expires_at?: string | null
          verification_paid_at?: string | null
          verification_payment_id?: string | null
          verification_payment_status?: string | null
        }
        Relationships: []
      }
      creator_services: {
        Row: {
          created_at: string | null
          creator_profile_id: string
          delivery_days: number | null
          description: string | null
          duration_hours: number | null
          id: string
          includes_description: string | null
          is_active: boolean | null
          max_attendees: number | null
          max_price_cents: number | null
          min_attendees: number | null
          min_price_cents: number | null
          price_cents: number
          price_tier_id: string | null
          service_type: string
          story_upsell_price_cents: number | null
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          delivery_days?: number | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          includes_description?: string | null
          is_active?: boolean | null
          max_attendees?: number | null
          max_price_cents?: number | null
          min_attendees?: number | null
          min_price_cents?: number | null
          price_cents: number
          price_tier_id?: string | null
          service_type: string
          story_upsell_price_cents?: number | null
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          delivery_days?: number | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          includes_description?: string | null
          is_active?: boolean | null
          max_attendees?: number | null
          max_price_cents?: number | null
          min_attendees?: number | null
          min_price_cents?: number | null
          price_cents?: number
          price_tier_id?: string | null
          service_type?: string
          story_upsell_price_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_services_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_services_price_tier_id_fkey"
            columns: ["price_tier_id"]
            isOneToOne: false
            referencedRelation: "service_price_tiers"
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
      device_tokens: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          event_booking_id: string
          id: string
          processed_at: string | null
          status: string | null
          transaction_type: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          event_booking_id: string
          id?: string
          processed_at?: string | null
          status?: string | null
          transaction_type: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          event_booking_id?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_event_booking_id_fkey"
            columns: ["event_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gallery: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          media_type: string
          media_url: string
          uploaded_by_creator: boolean | null
          uploaded_by_venue: boolean | null
          uploader_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          media_type: string
          media_url: string
          uploaded_by_creator?: boolean | null
          uploaded_by_venue?: boolean | null
          uploader_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          media_type?: string
          media_url?: string
          uploaded_by_creator?: boolean | null
          uploaded_by_venue?: boolean | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_gallery_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          checked_in_at: string | null
          event_id: string
          fan_email: string
          fan_name: string
          fan_phone: string | null
          id: string
          registered_at: string | null
          status: string | null
        }
        Insert: {
          checked_in_at?: string | null
          event_id: string
          fan_email: string
          fan_name: string
          fan_phone?: string | null
          id?: string
          registered_at?: string | null
          status?: string | null
        }
        Update: {
          checked_in_at?: string | null
          event_id?: string
          fan_email?: string
          fan_name?: string
          fan_phone?: string | null
          id?: string
          registered_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reviews: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          rating: number
          review_text: string | null
          reviewer_email: string | null
          reviewer_id: string | null
          reviewer_type: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_email?: string | null
          reviewer_id?: string | null
          reviewer_type: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_email?: string | null
          reviewer_id?: string | null
          reviewer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          creator_profile_id: string
          current_attendees: number | null
          description: string | null
          end_time: string
          event_booking_id: string | null
          event_date: string
          event_type: string
          id: string
          is_public: boolean | null
          max_attendees: number | null
          package_type: string | null
          start_time: string
          status: string | null
          ticket_price_cents: number | null
          title: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_profile_id: string
          current_attendees?: number | null
          description?: string | null
          end_time: string
          event_booking_id?: string | null
          event_date: string
          event_type: string
          id?: string
          is_public?: boolean | null
          max_attendees?: number | null
          package_type?: string | null
          start_time: string
          status?: string | null
          ticket_price_cents?: number | null
          title: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_profile_id?: string
          current_attendees?: number | null
          description?: string | null
          end_time?: string
          event_booking_id?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_public?: boolean | null
          max_attendees?: number | null
          package_type?: string | null
          start_time?: string
          status?: string | null
          ticket_price_cents?: number | null
          title?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_event_booking_id_fkey"
            columns: ["event_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_countries: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          country_code: string
          country_name: string
          franchise_owner_id: string
          id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          country_code: string
          country_name: string
          franchise_owner_id: string
          id?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          country_code?: string
          country_name?: string
          franchise_owner_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_countries_franchise_owner_id_fkey"
            columns: ["franchise_owner_id"]
            isOneToOne: false
            referencedRelation: "franchise_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_earnings: {
        Row: {
          country_code: string
          created_at: string
          franchise_amount_cents: number
          franchise_owner_id: string
          gross_amount_cents: number
          id: string
          platform_amount_cents: number
          source_id: string
          source_type: string
          user_id: string
          user_type: string
        }
        Insert: {
          country_code: string
          created_at?: string
          franchise_amount_cents: number
          franchise_owner_id: string
          gross_amount_cents: number
          id?: string
          platform_amount_cents: number
          source_id: string
          source_type: string
          user_id: string
          user_type: string
        }
        Update: {
          country_code?: string
          created_at?: string
          franchise_amount_cents?: number
          franchise_owner_id?: string
          gross_amount_cents?: number
          id?: string
          platform_amount_cents?: number
          source_id?: string
          source_type?: string
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_earnings_franchise_owner_id_fkey"
            columns: ["franchise_owner_id"]
            isOneToOne: false
            referencedRelation: "franchise_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_owners: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          available_balance_cents: number
          commission_rate: number
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          platform_rate: number
          status: string
          total_earnings_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          available_balance_cents?: number
          commission_rate?: number
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          platform_rate?: number
          status?: string
          total_earnings_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          available_balance_cents?: number
          commission_rate?: number
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          platform_rate?: number
          status?: string
          total_earnings_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      franchise_payout_requests: {
        Row: {
          admin_notes: string | null
          amount_cents: number
          created_at: string
          franchise_owner_id: string
          id: string
          payout_details: Json | null
          payout_method: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          amount_cents: number
          created_at?: string
          franchise_owner_id: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          amount_cents?: number
          created_at?: string
          franchise_owner_id?: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_payout_requests_franchise_owner_id_fkey"
            columns: ["franchise_owner_id"]
            isOneToOne: false
            referencedRelation: "franchise_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_message_templates: {
        Row: {
          brand_profile_id: string
          content: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          brand_profile_id: string
          content: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          brand_profile_id?: string
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mass_message_templates_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_message_templates_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      mass_messages_log: {
        Row: {
          brand_profile_id: string
          campaign_id: string | null
          creator_profile_ids: string[]
          id: string
          message_count: number
          sent_at: string | null
          template_id: string | null
        }
        Insert: {
          brand_profile_id: string
          campaign_id?: string | null
          creator_profile_ids: string[]
          id?: string
          message_count: number
          sent_at?: string | null
          template_id?: string | null
        }
        Update: {
          brand_profile_id?: string
          campaign_id?: string | null
          creator_profile_ids?: string[]
          id?: string
          message_count?: number
          sent_at?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mass_messages_log_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_messages_log_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_messages_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mass_messages_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mass_message_templates"
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
          message_type: string | null
          negotiation_status: string | null
          offer_id: string | null
          parent_message_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          negotiation_status?: string | null
          offer_id?: string | null
          parent_message_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          negotiation_status?: string | null
          offer_id?: string | null
          parent_message_id?: string | null
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
          {
            foreignKeyName: "messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "booking_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
      opportunity_applications: {
        Row: {
          booking_id: string | null
          confirmed_at: string | null
          created_at: string
          creator_profile_id: string
          delivered_at: string | null
          delivery_links: string[] | null
          id: string
          message: string | null
          opportunity_id: string
          proposed_price_cents: number | null
          status: string
        }
        Insert: {
          booking_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          creator_profile_id: string
          delivered_at?: string | null
          delivery_links?: string[] | null
          id?: string
          message?: string | null
          opportunity_id: string
          proposed_price_cents?: number | null
          status?: string
        }
        Update: {
          booking_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          creator_profile_id?: string
          delivered_at?: string | null
          delivery_links?: string[] | null
          id?: string
          message?: string | null
          opportunity_id?: string
          proposed_price_cents?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "brand_opportunities"
            referencedColumns: ["id"]
          },
        ]
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
      platform_changelog: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_public: boolean
          is_published: boolean
          notification_sent: boolean | null
          notification_sent_at: string | null
          published_at: string | null
          title: string
          version: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_public?: boolean
          is_published?: boolean
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          published_at?: string | null
          title: string
          version: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_public?: boolean
          is_published?: boolean
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          published_at?: string | null
          title?: string
          version?: string
        }
        Relationships: []
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
          email: string | null
          full_name: string | null
          id: string
          last_seen: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_seen?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      quotation_inquiries: {
        Row: {
          admin_notes: string | null
          brand_profile_id: string
          created_at: string
          id: string
          plan_type: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          brand_profile_id: string
          created_at?: string
          id?: string
          plan_type: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          brand_profile_id?: string
          created_at?: string
          id?: string
          plan_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_inquiries_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_inquiries_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          referral_code_used: string
          referred_user_id: string
          referred_user_type: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          referral_code_used: string
          referred_user_id: string
          referred_user_type: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          referral_code_used?: string
          referred_user_id?: string
          referred_user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "reviews_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
            foreignKeyName: "saved_creators_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
      scheduled_push_notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          parent_id: string | null
          repeat_end_date: string | null
          repeat_type: string | null
          result: Json | null
          scheduled_at: string
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          parent_id?: string | null
          repeat_end_date?: string | null
          repeat_type?: string | null
          result?: Json | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          parent_id?: string | null
          repeat_end_date?: string | null
          repeat_type?: string | null
          result?: Json | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_push_notifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "scheduled_push_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_ranges: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_enabled: boolean
          max_price_cents: number
          min_price_cents: number
          service_type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_enabled?: boolean
          max_price_cents?: number
          min_price_cents?: number
          service_type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_enabled?: boolean
          max_price_cents?: number
          min_price_cents?: number
          service_type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      service_price_tiers: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          max_price_cents: number
          min_price_cents: number
          service_type: string
          sort_order: number
          tier_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          max_price_cents: number
          min_price_cents: number
          service_type: string
          sort_order?: number
          tier_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          max_price_cents?: number
          min_price_cents?: number
          service_type?: string
          sort_order?: number
          tier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "storage_purchases_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles_public"
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
      brand_profiles_public: {
        Row: {
          company_name: string | null
          created_at: string | null
          id: string | null
          industry: string | null
          is_verified: boolean | null
          location_country: string | null
          logo_url: string | null
          venue_city: string | null
          venue_name: string | null
          venue_type: string | null
          verification_status: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          id?: string | null
          industry?: string | null
          is_verified?: boolean | null
          location_country?: string | null
          logo_url?: string | null
          venue_city?: string | null
          venue_name?: string | null
          venue_type?: string | null
          verification_status?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          id?: string | null
          industry?: string | null
          is_verified?: boolean | null
          location_country?: string | null
          logo_url?: string | null
          venue_city?: string | null
          venue_name?: string | null
          venue_type?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_campaign_auto_approval: {
        Args: { campaign_id: string }
        Returns: boolean
      }
      check_creator_auto_approval: {
        Args: { creator_id: string }
        Returns: boolean
      }
      distribute_affiliate_earnings_for_user: {
        Args: {
          p_platform_fee_cents: number
          p_source_id: string
          p_source_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      finalize_creator_signup: { Args: { creator_id: string }; Returns: string }
      get_affiliate_by_code: { Args: { _code: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_franchise_owner_for_country: {
        Args: { _country_code: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      record_profile_view: {
        Args: { p_creator_profile_id: string }
        Returns: boolean
      }
      send_notification_email: {
        Args: {
          email_data?: Json
          email_type: string
          to_email: string
          to_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "brand" | "creator" | "franchise" | "affiliate"
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
      app_role: ["admin", "brand", "creator", "franchise", "affiliate"],
    },
  },
} as const
