

## Fix Backup System: Invalid AWS Keys + Missing Tables

### Problem 1: AWS Credentials Invalid (Critical)
All backups are failing with `InvalidAccessKeyId` for key `AKIA6K74ZTKRNVMZHBK4`. This key no longer exists in AWS. You need to generate a new AWS Access Key from the AWS IAM console and update the secret here.

**Action required from you:**
1. Go to AWS Console > IAM > Your User > Security Credentials
2. Create a new Access Key
3. You'll be prompted to enter the new `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` values

### Problem 2: 29 Missing Tables
The backup function hardcodes 31 tables but the database now has 60. These tables are NOT being backed up:

- `admin_feature_overrides`
- `affiliate_earnings`, `affiliate_payout_requests`, `affiliates`
- `booking_offers`
- `brand_opportunities`, `brand_profiles_public`
- `calendar_events`
- `career_applications`, `career_positions`
- `creator_agreements`, `creator_featuring`
- `device_tokens`
- `escrow_transactions`
- `event_gallery`, `event_registrations`, `event_reviews`, `events`
- `franchise_countries`, `franchise_earnings`, `franchise_owners`, `franchise_payout_requests`
- `opportunity_applications`
- `referrals`
- `scheduled_push_notifications`
- `service_price_ranges`, `service_price_tiers`
- `site_settings`

### Problem 3: Outdated Edge Function Documentation
The `EDGE_FUNCTION_DESCRIPTIONS` map in the backup function lists 16 functions but the project now has 25+. Missing descriptions for newer functions like `send-career-application-email`, `send-push-notification`, `send-push-to-creators`, `process-scheduled-push`, `send-calendar-reminders`, `upload-site-asset`, `upload-portfolio-media`, `draft-agreement`, and `check-subscription-renewal`.

### Changes

**`supabase/functions/database-backup/index.ts`**
- Update `TABLES_TO_BACKUP` array from 31 to all 60 current tables, organized by category
- Update `EDGE_FUNCTION_DESCRIPTIONS` to include all 25 edge functions
- Update the disaster recovery doc template to reflect 60 tables and all edge functions
- Update metadata comments (e.g., "31 tables" references become "60 tables")

**Secret update (your action)**
- Update `AWS_ACCESS_KEY_ID` with a new valid key from AWS IAM
- Update `AWS_SECRET_ACCESS_KEY` with the corresponding secret

### Storage Architecture Summary (for your reference)

| Storage | What's Stored | Location |
|---------|--------------|----------|
| Supabase Storage | Profile images (36 files), portfolio media (7 files), brand logos, career CVs | Supabase buckets |
| Cloudflare R2 | Content Library, deliverables, portfolio media (CDN) | R2 buckets via edge functions |
| AWS S3 | Database backup JSON files, disaster recovery docs | `collabhunts-backups` bucket |
| Git/Lovable | Website source code, edge functions, migrations | Lovable project |

### Technical Details

The `TABLES_TO_BACKUP` array will be reorganized into these categories:

```text
User Management (5): profiles, user_roles, brand_profiles, brand_profiles_public, creator_profiles
Creator Data (8): creator_services, creator_social_accounts, creator_portfolio_media, creator_payout_settings, creator_notes, creator_agreements, creator_featuring, service_price_ranges/tiers
Brand Data (5): brand_subscriptions, brand_storage_usage, saved_creators, storage_purchases, brand_opportunities
Transactions (5): bookings, booking_deliverables, booking_disputes, booking_offers, payouts
Payments (2): escrow_transactions, reviews
Campaigns (3): campaigns, campaign_applications, opportunity_applications
Events (4): events, event_registrations, event_reviews, event_gallery
Messaging (7): conversations, messages, notifications, mass_message_templates, mass_messages_log, device_tokens, scheduled_push_notifications
Content (2): content_library, content_folders
Careers (2): career_positions, career_applications
Affiliates (4): affiliates, affiliate_earnings, affiliate_payout_requests, referrals
Franchises (4): franchise_owners, franchise_countries, franchise_earnings, franchise_payout_requests
System (5): profile_views, backup_history, platform_changelog, ad_placements, site_settings
Admin (2): admin_feature_overrides, calendar_events
```

