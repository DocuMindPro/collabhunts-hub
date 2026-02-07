# CollabHunts Disaster Recovery Guide

## Overview

This document provides step-by-step instructions for recovering the CollabHunts platform after a disaster. Follow this guide to restore the database, file storage, and application to full functionality.

**Recovery Time Objective (RTO):** 4-8 hours  
**Recovery Point Objective (RPO):** 24 hours (last daily backup)

---

## Quick Reference

| Component | Location | Recovery Method |
|-----------|----------|-----------------|
| Database Backup | AWS S3: `collabhunts-backups/backups/` | Restore via Supabase client |
| Profile Images | Supabase Storage: `profile-images` | Re-upload from users or backup |
| Portfolio Media | Supabase Storage: `portfolio-media` | Re-upload from users or backup |
| Content Library | Cloudflare R2 | Restore from R2 backup |
| Deliverables | Cloudflare R2 | Restore from R2 backup |
| Edge Functions | Git repository: `supabase/functions/` | Auto-deploy on push |

---

## Backup System

### Automated Backups

- **Schedule:** Daily at 00:00 UTC (midnight)
- **Storage:** AWS S3 bucket `collabhunts-backups`
- **Format:** JSON with complete table data and schema
- **Trigger:** pg_cron scheduled job

### Manual Backups

Administrators can trigger manual backups from the Backup History page (`/backup-history`) in the admin dashboard.

### What's Included in Each Backup

#### Database Tables (60 tables)

**User Management (5):**
- `profiles` - User profile information
- `user_roles` - Role assignments (admin, brand, creator)
- `brand_profiles` - Brand company information
- `brand_profiles_public` - Public brand profile view
- `creator_profiles` - Creator portfolio data

**Creator Data (8):**
- `creator_services` - Service offerings with pricing
- `creator_social_accounts` - Social media connections
- `creator_portfolio_media` - Portfolio images/videos metadata
- `creator_payout_settings` - Payout configurations
- `creator_notes` - Brand's private notes about creators
- `creator_agreements` - Agreements between brands and creators
- `creator_featuring` - Featured creator placements
- `service_price_ranges` - Service price range definitions
- `service_price_tiers` - Service price tier definitions

**Brand Data (5):**
- `brand_subscriptions` - Brand subscription tiers
- `brand_storage_usage` - Content Library storage tracking
- `saved_creators` - Saved/favorited creators (CRM)
- `storage_purchases` - Extra storage purchases
- `brand_opportunities` - Brand opportunity listings

**Transactions (5):**
- `bookings` - Service bookings
- `booking_deliverables` - Deliverable file metadata
- `booking_disputes` - Dispute cases
- `booking_offers` - Negotiation offers within conversations
- `payouts` - Payout records

**Payments (2):**
- `escrow_transactions` - Escrow payment transactions
- `reviews` - Creator reviews

**Campaigns (3):**
- `campaigns` - Brand campaigns
- `campaign_applications` - Creator applications to campaigns
- `opportunity_applications` - Creator applications to opportunities

**Events (4):**
- `events` - Platform events
- `event_registrations` - Event registrations
- `event_reviews` - Event reviews
- `event_gallery` - Event gallery media

**Messaging (7):**
- `conversations` - Message threads
- `messages` - Individual messages
- `notifications` - System notifications
- `mass_message_templates` - Saved bulk message templates
- `mass_messages_log` - Mass message history
- `device_tokens` - Push notification device tokens
- `scheduled_push_notifications` - Scheduled push notifications

**Content Management (2):**
- `content_library` - Stored UGC content metadata
- `content_folders` - Folder organization

**Careers (2):**
- `career_positions` - Job listings
- `career_applications` - Job applications

**Affiliates (4):**
- `affiliates` - Affiliate accounts
- `affiliate_earnings` - Affiliate earning records
- `affiliate_payout_requests` - Affiliate payout requests
- `referrals` - Referral tracking

**Franchises (4):**
- `franchise_owners` - Franchise owner accounts
- `franchise_countries` - Franchise country assignments
- `franchise_earnings` - Franchise earning records
- `franchise_payout_requests` - Franchise payout requests

**System (5):**
- `profile_views` - Analytics data
- `backup_history` - Backup records
- `platform_changelog` - Platform updates
- `ad_placements` - Ad placement configurations
- `site_settings` - Site branding and configuration

**Admin (2):**
- `admin_feature_overrides` - Feature flag overrides per user
- `calendar_events` - Calendar event entries

#### Schema Information
- Enum types (`app_role`)
- Database functions (20+)
- Trigger configurations
- RLS policies

#### Edge Function Documentation
- 28 edge functions with descriptions

---

## Recovery Procedures

### Prerequisites

Before starting recovery, ensure you have:

1. **Access Credentials:**
   - AWS S3 access (backup bucket)
   - Supabase project access with admin privileges
   - Cloudflare R2 access (if restoring content)

2. **Required Secrets (18 total):**
   ```
   # Supabase
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   SUPABASE_PUBLISHABLE_KEY
   SUPABASE_DB_URL
   
   # AWS S3 (Backups)
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_BUCKET_NAME
   AWS_REGION
   
   # Cloudflare R2 (Content Storage)
   R2_ACCOUNT_ID
   R2_ACCESS_KEY_ID
   R2_SECRET_ACCESS_KEY
   R2_BUCKET_NAME
   R2_PUBLIC_URL
   
   # Email Services
   SENDGRID_API_KEY
   RESEND_API_KEY
   ADMIN_EMAIL
   
   # Other
   BACKUP_CRON_SECRET
   LOVABLE_API_KEY
   ```

---

### Step 1: Download Latest Backup

**Option A: Via Admin Dashboard**
1. Navigate to `/backup-history` in the admin dashboard
2. Locate the most recent successful backup
3. Click the download icon to retrieve the JSON file

**Option B: Direct S3 Access**
```bash
aws s3 ls s3://collabhunts-backups/backups/ --recursive | sort | tail -1
aws s3 cp s3://collabhunts-backups/backups/collabhunts-backup-{timestamp}.json ./backup.json
```

---

### Step 2: Prepare Recovery Environment

**If recovering to NEW Supabase project:**

1. Create a new Supabase project at https://supabase.com

2. Run all migrations from `/supabase/migrations/` in order:
   ```bash
   # List migrations
   ls -la supabase/migrations/
   
   # Apply via Supabase CLI or SQL editor
   supabase db push
   ```

3. Configure all 18 secrets in the new project's Edge Function settings

4. Deploy edge functions:
   ```bash
   # Functions auto-deploy via Lovable, or manually:
   supabase functions deploy
   ```

---

### Step 3: Restore Database Data

Use this script to restore all tables in the correct order (respecting foreign keys):

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Parse backup file
const backup = JSON.parse(backupFileContent);

// Restore order respects foreign key dependencies
const restoreOrder = [
  // Independent tables first
  'profiles',
  'user_roles',
  'brand_profiles',
  'creator_profiles',
  'platform_changelog',
  'ad_placements',
  
  // Tables with foreign keys
  'brand_subscriptions',
  'brand_storage_usage',
  'storage_purchases',
  'creator_services',
  'creator_social_accounts',
  'creator_portfolio_media',
  'creator_payout_settings',
  'saved_creators',
  'creator_notes',
  'campaigns',
  'bookings',
  'booking_deliverables',
  'booking_disputes',
  'campaign_applications',
  'conversations',
  'messages',
  'notifications',
  'mass_message_templates',
  'mass_messages_log',
  'content_folders',
  'content_library',
  'reviews',
  'payouts',
  'profile_views',
  'backup_history',
];

for (const tableName of restoreOrder) {
  const tableData = backup.tables[tableName];
  if (tableData && tableData.rows && tableData.rows.length > 0) {
    console.log(`Restoring ${tableName}: ${tableData.rows.length} rows...`);
    
    const { error } = await supabase
      .from(tableName)
      .upsert(tableData.rows, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error(`Failed to restore ${tableName}:`, error);
    } else {
      console.log(`✓ Restored ${tableData.rows.length} rows to ${tableName}`);
    }
  }
}

console.log('Database restoration complete!');
```

---

### Step 4: Restore File Storage

#### Supabase Storage Buckets

Supabase Storage files are backed up to S3 under `media-backups/{timestamp}/{bucket-name}/`.

**Restore from S3 backup:**
```bash
# List available media backups
aws s3 ls s3://collabhunts-backups/media-backups/ --recursive | head -20

# Download all media files from latest backup
aws s3 sync s3://collabhunts-backups/media-backups/{latest-timestamp}/ ./media-restore/
```

**Recreate buckets and re-upload:**
```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('career-cvs', 'career-cvs', false);

-- Recreate RLS policies for profile-images
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload own profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Recreate RLS policies for portfolio-media
CREATE POLICY "Public read access for portfolio media"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Users can upload own portfolio media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Then upload restored files using the Supabase client:
```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// For each bucket, upload files from the backup
const buckets = ['profile-images', 'portfolio-media', 'brand-logos', 'career-cvs'];
for (const bucket of buckets) {
  const dir = `./media-restore/${bucket}`;
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir, { recursive: true });
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) continue;
    
    const fileBuffer = fs.readFileSync(filePath);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(file, fileBuffer, { upsert: true });
    
    if (error) console.error(`Failed to restore ${bucket}/${file}:`, error);
    else console.log(`✓ Restored ${bucket}/${file}`);
  }
}
```

#### Cloudflare R2 Content

R2 file metadata is backed up as an inventory manifest at `media-backups/{timestamp}/r2-inventory.json`.

**To restore R2 content:**
1. Download the R2 inventory: `aws s3 cp s3://collabhunts-backups/media-backups/{latest}/r2-inventory.json ./`
2. Review the inventory to identify all files that need recovery
3. If R2 is still accessible, files can be served directly (R2 has built-in redundancy)
4. If R2 data is lost, use the inventory to identify which users need to re-upload content
5. Content Library files: `content-library/{brand_id}/{timestamp}-{filename}`
6. Deliverables: `deliverables/{booking_id}/{filename}`

---

### Step 5: Restore Scheduled Jobs (pg_cron)

Re-create the cron jobs:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Daily backup at midnight UTC
SELECT cron.schedule(
  'daily-database-backup',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/database-backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"type": "scheduled", "scheduled_call": true, "cron_secret": "YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);

-- Hourly dispute deadline check
SELECT cron.schedule(
  'hourly-dispute-check',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/check-dispute-deadlines',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Daily content expiration check at 8 AM UTC
SELECT cron.schedule(
  'daily-content-expiration',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/check-content-expiration',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Hourly ad expiration check
SELECT cron.schedule(
  'hourly-ad-expiration',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/check-ad-expiration',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

### Step 6: Post-Recovery Verification Checklist

Run through this checklist to verify successful recovery:

#### Database Verification
- [ ] Row counts match backup metadata for all 31 tables
- [ ] User can log in with existing credentials
- [ ] Admin user can access `/admin` dashboard
- [ ] RLS policies are working (test as different user roles)

#### Authentication Verification
- [ ] Email/password login works
- [ ] Google OAuth login works (if configured)
- [ ] Phone OTP login works (if Twilio configured)
- [ ] New user registration creates profile correctly

#### Core Functionality Verification
- [ ] Creator profiles load with correct data
- [ ] Brand dashboard shows correct bookings
- [ ] Messages load in conversations
- [ ] Campaigns display correctly
- [ ] Notifications appear

#### File Storage Verification
- [ ] Profile images display correctly
- [ ] Portfolio media loads
- [ ] Content Library files accessible (for Pro/Premium brands)
- [ ] Deliverable downloads work

#### Scheduled Jobs Verification
- [ ] Check cron job status: `SELECT * FROM cron.job;`
- [ ] Trigger manual backup and verify success
- [ ] Check dispute deadlines function responds

#### Edge Functions Verification
- [ ] `database-backup` responds to requests
- [ ] `send-notification-email` sends test email
- [ ] `improve-bio` returns AI suggestions
- [ ] All 17 edge functions are deployed

---

## Monitoring

### Backup History Dashboard

Access `/backup-history` to view:
- Total backup count
- Success/failure rates
- Storage consumption
- Individual backup details with download/verify options

### Alerts to Configure

Set up monitoring for:
- Backup failures (email alert sent automatically)
- Unusual file sizes (may indicate data issues)
- Extended execution times (may indicate performance issues)
- Storage approaching limits

---

## Security Considerations

1. **S3 Access**: Use IAM roles with minimal permissions (GetObject, PutObject only)
2. **Encryption**: Enable S3 server-side encryption (SSE-S3 or SSE-KMS)
3. **Access Logs**: Enable S3 access logging for audit trail
4. **Secrets**: Store all credentials securely in Supabase secrets, never in code
5. **Service Role Key**: Only use for recovery operations, never expose in client code

---

## Emergency Contacts

For disaster recovery assistance:

- **Primary Admin**: care@collabhunts.com
- **Technical Lead**: Check admin dashboard for current contacts
- **Supabase Support**: https://supabase.com/support (if using Supabase Cloud)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v5.0 | 2026-02 | Added full media backup to S3, R2 inventory manifest, automated media backup chaining |
| v4.0 | 2026-02 | Expanded to 60 tables, 28 edge functions, added affiliates/franchises/events/careers |
| v3.0 | 2024-12 | Added all 31 tables, complete secrets list, storage recovery, verification checklist |
| v2.0 | 2024 | Full backup system with S3 integration |
| v1.0 | 2024 | Initial backup implementation |

---

## Appendix: Table Row Count Verification

After restoration, verify row counts match the backup metadata:

```sql
SELECT 
  'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'brand_profiles', COUNT(*) FROM brand_profiles
UNION ALL SELECT 'creator_profiles', COUNT(*) FROM creator_profiles
UNION ALL SELECT 'brand_subscriptions', COUNT(*) FROM brand_subscriptions
UNION ALL SELECT 'creator_services', COUNT(*) FROM creator_services
UNION ALL SELECT 'creator_social_accounts', COUNT(*) FROM creator_social_accounts
UNION ALL SELECT 'creator_portfolio_media', COUNT(*) FROM creator_portfolio_media
UNION ALL SELECT 'creator_payout_settings', COUNT(*) FROM creator_payout_settings
UNION ALL SELECT 'creator_notes', COUNT(*) FROM creator_notes
UNION ALL SELECT 'brand_storage_usage', COUNT(*) FROM brand_storage_usage
UNION ALL SELECT 'saved_creators', COUNT(*) FROM saved_creators
UNION ALL SELECT 'storage_purchases', COUNT(*) FROM storage_purchases
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'booking_deliverables', COUNT(*) FROM booking_deliverables
UNION ALL SELECT 'booking_disputes', COUNT(*) FROM booking_disputes
UNION ALL SELECT 'payouts', COUNT(*) FROM payouts
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL SELECT 'campaign_applications', COUNT(*) FROM campaign_applications
UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'mass_message_templates', COUNT(*) FROM mass_message_templates
UNION ALL SELECT 'mass_messages_log', COUNT(*) FROM mass_messages_log
UNION ALL SELECT 'content_library', COUNT(*) FROM content_library
UNION ALL SELECT 'content_folders', COUNT(*) FROM content_folders
UNION ALL SELECT 'profile_views', COUNT(*) FROM profile_views
UNION ALL SELECT 'backup_history', COUNT(*) FROM backup_history
UNION ALL SELECT 'platform_changelog', COUNT(*) FROM platform_changelog
UNION ALL SELECT 'ad_placements', COUNT(*) FROM ad_placements
ORDER BY table_name;
```
