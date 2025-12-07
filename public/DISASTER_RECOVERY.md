# CollabHunts Disaster Recovery Guide

## Overview

This document outlines the disaster recovery procedures for the CollabHunts platform. Our backup system creates comprehensive snapshots of all database data, schema configurations, and edge function documentation.

## Backup System

### Automated Backups

Backups can be scheduled using Supabase cron jobs or external schedulers calling the `/database-backup` edge function.

### Manual Backups

Administrators can trigger manual backups from the Backup History page (`/backup-history`) in the admin dashboard.

### What's Included in Each Backup

1. **Database Tables** (18 tables):
   - `profiles` - User profile information
   - `user_roles` - Role assignments (admin, brand, creator)
   - `brand_profiles` - Brand company information
   - `creator_profiles` - Creator portfolio data
   - `brand_subscriptions` - Brand subscription tiers
   - `creator_services` - Creator service offerings
   - `creator_social_accounts` - Social media connections
   - `creator_payout_settings` - Payout configurations
   - `bookings` - Service bookings
   - `campaigns` - Brand campaigns
   - `campaign_applications` - Creator applications
   - `conversations` - Message threads
   - `messages` - Individual messages
   - `notifications` - System notifications
   - `reviews` - Creator reviews
   - `payouts` - Payout records
   - `profile_views` - Analytics data
   - `backup_history` - Backup records

2. **Schema Information**:
   - Enum types (`app_role`)
   - Database functions
   - Trigger configurations
   - RLS policies

3. **Edge Function Documentation**:
   - Function names and descriptions
   - Configuration settings

## Recovery Procedures

### Prerequisites

- Access to AWS S3 backup bucket
- Supabase project access with admin privileges
- Service role key for database operations

### Step 1: Download Backup

1. Navigate to `/backup-history` in the admin dashboard
2. Locate the desired backup by date
3. Click the download icon to retrieve the JSON backup file
4. Alternatively, access directly from S3: `s3://collabhunts-backups/backups/`

### Step 2: Prepare Recovery Environment

If recovering to a new Supabase project:

1. Create a new Supabase project
2. Run the schema migrations from `/supabase/migrations/`
3. Deploy edge functions from `/supabase/functions/`

### Step 3: Restore Data

Use the Supabase client to restore data:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Parse backup file
const backup = JSON.parse(backupFileContent);

// Restore each table in order (respecting foreign keys)
const restoreOrder = [
  'profiles',
  'user_roles',
  'brand_profiles',
  'creator_profiles',
  'brand_subscriptions',
  'creator_services',
  'creator_social_accounts',
  'creator_payout_settings',
  'campaigns',
  'bookings',
  'campaign_applications',
  'conversations',
  'messages',
  'notifications',
  'reviews',
  'payouts',
  'profile_views',
];

for (const tableName of restoreOrder) {
  const tableData = backup.tables[tableName];
  if (tableData && tableData.rows.length > 0) {
    const { error } = await supabase
      .from(tableName)
      .upsert(tableData.rows, { onConflict: 'id' });
    
    if (error) {
      console.error(`Failed to restore ${tableName}:`, error);
    } else {
      console.log(`Restored ${tableData.rows.length} rows to ${tableName}`);
    }
  }
}
```

### Step 4: Verify Recovery

1. Check row counts match backup metadata
2. Test user authentication
3. Verify RLS policies are working
4. Test critical user flows

## Backup Verification

### Automatic Checks

Each backup undergoes automatic verification:
- S3 upload confirmation
- File size validation
- Table count verification
- Execution time logging

### Manual Verification

Use the "Verify" button in the Backup History page to run integrity checks on any backup.

## Storage Location

Backups are stored in AWS S3:
- **Bucket**: `collabhunts-backups`
- **Path**: `backups/collabhunts-backup-{timestamp}.json`
- **Region**: Configured via `AWS_REGION` secret

## Retention Policy

Recommended retention:
- Daily backups: Keep for 7 days
- Weekly backups: Keep for 4 weeks
- Monthly backups: Keep for 12 months

Configure S3 lifecycle policies to automatically manage retention.

## Monitoring

### Backup History Dashboard

Access `/backup-history` to view:
- Total backup count
- Success/failure rates
- Storage consumption
- Individual backup details

### Alerts

Set up CloudWatch or external monitoring to alert on:
- Backup failures
- Unusual file sizes
- Extended execution times

## Security Considerations

1. **S3 Access**: Use IAM roles with minimal permissions
2. **Encryption**: Enable S3 server-side encryption
3. **Access Logs**: Enable S3 access logging
4. **Secrets**: Store AWS credentials securely in Supabase secrets

## Contact

For disaster recovery assistance:
- Technical Lead: [Contact admin]
- On-call: [Emergency contact]

## Revision History

- v2.0 (2024): Full backup system with S3 integration
- v1.0 (2024): Initial backup implementation
