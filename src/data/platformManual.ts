// Platform Operations Manual - Comprehensive Documentation
// Auto-updated sections pull live data from the system

export interface ManualSection {
  id: string;
  title: string;
  icon: string;
  category: "technical" | "operational";
  articles: ManualArticle[];
}

export interface ManualArticle {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  tags: string[];
}

export const platformManual: ManualSection[] = [
  // ==================== TECHNICAL DOCUMENTATION ====================
  {
    id: "infrastructure",
    title: "Infrastructure & Services",
    icon: "Server",
    category: "technical",
    articles: [
      {
        id: "email-service",
        title: "Email Service (SendGrid)",
        content: `## Email Provider: Twilio SendGrid

**Status:** Active
**Sender Email:** care@collabhunts.com
**API Key Secret:** SENDGRID_API_KEY

### Configuration
- All transactional emails are sent via SendGrid API
- Emails are sent from the \`send-notification-email\` edge function
- Email templates are HTML-based with inline CSS

### Deliverability Tips
1. Authenticate your domain in SendGrid Dashboard
2. Set up SPF, DKIM, and DMARC records
3. Use consistent "from" address
4. Monitor bounce rates and spam complaints

### Edge Function Location
\`supabase/functions/send-notification-email/index.ts\``,
        lastUpdated: "2024-12-10",
        tags: ["email", "sendgrid", "notifications"]
      },
      {
        id: "storage-service",
        title: "File Storage (Cloudflare R2)",
        content: `## Storage Provider: Cloudflare R2

**Bucket:** collab-hunts-backup-storage
**Region:** Auto (global)

### Secrets Required
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME
- R2_PUBLIC_URL

### Storage Structure
\`\`\`
/profile-images/{user_id}/{timestamp}-{filename}     ← Profile & cover images
/portfolio-media/{user_id}/{timestamp}-{filename}    ← Portfolio images & videos
/content-library/{brand_id}/{timestamp}-{filename}   ← Brand UGC content
/deliverables/{booking_id}/{filename}                ← Booking deliverables
\`\`\`

### Upload Edge Functions
| Function | Purpose |
|----------|---------|
| \`upload-profile-image\` | Profile & cover image uploads |
| \`upload-portfolio-media\` | Portfolio images (5MB) & videos (100MB) |
| \`upload-content\` | Content Library uploads for brands |
| \`upload-deliverable\` | Booking deliverable uploads |

### File Size Limits
- **Profile images:** 5 MB max
- **Cover images:** 5 MB max
- **Portfolio images:** 5 MB max
- **Portfolio videos:** 100 MB max (limit: 3 videos)
- **Content Library:** Based on subscription tier

### Cost Benefits
- Zero egress fees (vs AWS S3 ~$0.09/GB)
- 50-60% cost savings over traditional S3

### Migration Status
- ✅ Content Library: R2 (new uploads)
- ✅ Deliverables: R2 (new uploads)
- ✅ Profile/Cover Images: R2 (new uploads)
- ✅ Portfolio Media: R2 (new uploads)
- ⚠️ Legacy Supabase Storage: ~52 MB pending migration`,
        lastUpdated: "2024-12-10",
        tags: ["storage", "r2", "cloudflare", "files"]
      },
      {
        id: "phone-verification",
        title: "Phone Verification (Twilio)",
        content: `## Phone Verification: Twilio Verify

**Status:** Configured in Lovable Cloud Auth settings

### How It Works
1. User enters phone number with country code
2. System sends SMS OTP via Twilio Verify
3. User enters 6-digit code
4. Phone marked as verified in database

### Database Fields
- \`creator_profiles.phone_number\` (TEXT)
- \`creator_profiles.phone_verified\` (BOOLEAN)
- \`brand_profiles.phone_number\` (TEXT)
- \`brand_profiles.phone_verified\` (BOOLEAN)

### Requirements
- Phone verification required for both creators AND brands
- Cannot complete signup without verified phone`,
        lastUpdated: "2024-12-10",
        tags: ["phone", "twilio", "verification", "sms"]
      },
      {
        id: "database-backups",
        title: "Database Backup System",
        content: `## Automated Backup System

**Schedule:** Daily at 00:00 UTC (midnight)
**Storage:** AWS S3 bucket \`collabhunts-backups\`
**Retention:** Indefinite

### Backup Contents
- All 31 database tables (JSON format)
- Complete schema (DDL, enums, functions, triggers)
- RLS policies
- 17 Edge function descriptions

### Tables Backed Up (31 total)
**User Management:** profiles, user_roles, brand_profiles, creator_profiles
**Creator Data:** creator_services, creator_social_accounts, creator_portfolio_media, creator_payout_settings, creator_notes
**Brand Data:** brand_subscriptions, brand_storage_usage, saved_creators, storage_purchases
**Transactions:** bookings, booking_deliverables, booking_disputes, payouts, reviews
**Campaigns:** campaigns, campaign_applications
**Messaging:** conversations, messages, notifications, mass_message_templates, mass_messages_log
**Content:** content_library, content_folders
**Analytics:** profile_views, backup_history, platform_changelog
**Advertising:** ad_placements

### Edge Functions
- \`database-backup\` - Performs the backup
- \`verify-backup\` - Validates backup integrity
- \`get-cron-status\` - Returns cron job status

### Failure Notifications
On backup failure, email alert sent to:
**care@collabhunts.com**

### Manual Backup
Admins can trigger manual backups from:
\`/backup-history\` page

### Disaster Recovery
Full recovery guide: \`public/DISASTER_RECOVERY.md\``,
        lastUpdated: "2024-12-10",
        tags: ["backup", "disaster-recovery", "cron", "s3"]
      }
    ]
  },
  {
    id: "edge-functions",
    title: "Edge Functions",
    icon: "Zap",
    category: "technical",
    articles: [
      {
        id: "edge-functions-list",
        title: "All Edge Functions",
        content: `## Edge Functions Overview (19 total)

| Function | Purpose |
|----------|---------|
| \`send-notification-email\` | Send all transactional emails via SendGrid |
| \`send-platform-update\` | Broadcast platform updates to all users |
| \`send-mass-message\` | Send bulk messages/campaign invites |
| \`database-backup\` | Create automated/manual database backups |
| \`verify-backup\` | Validate backup file integrity |
| \`get-cron-status\` | Return scheduled job status |
| \`get-storage-stats\` | Return storage bucket statistics |
| \`check-dispute-deadlines\` | Monitor and auto-escalate disputes |
| \`check-content-expiration\` | Send content rights expiration reminders |
| \`check-ad-expiration\` | Auto-expire ad placements |
| \`admin-reset-password\` | Allow admins to reset user passwords |
| \`improve-bio\` | AI-powered text improvement suggestions |
| \`optimize-image\` | Image optimization for uploads |
| \`upload-profile-image\` | Profile & cover image uploads to R2 |
| \`upload-portfolio-media\` | Portfolio images & videos to R2 |
| \`upload-content\` | Handle Content Library uploads to R2 |
| \`upload-deliverable\` | Handle booking deliverable uploads to R2 |
| \`upload-ad-image\` | Ad placement image uploads |
| \`delete-content\` | Remove content from R2 and database |

### Deployment
Edge functions are automatically deployed when code changes are pushed.`,
        lastUpdated: "2024-12-10",
        tags: ["edge-functions", "serverless", "api"]
      }
    ]
  },
  {
    id: "database-schema",
    title: "Database Schema",
    icon: "Database",
    category: "technical",
    articles: [
      {
        id: "core-tables",
        title: "Core Database Tables",
        content: `## Database Tables (31 total)

### User Management (4 tables)
- \`profiles\` - Base user accounts (auto-created on signup)
- \`user_roles\` - Role assignments (admin, brand, creator)
- \`creator_profiles\` - Creator-specific data
- \`brand_profiles\` - Brand-specific data

### Creator Data (5 tables)
- \`creator_services\` - Service offerings with pricing
- \`creator_social_accounts\` - Social media accounts
- \`creator_portfolio_media\` - Portfolio images/videos
- \`creator_payout_settings\` - Stripe payout configuration
- \`creator_notes\` - Brand's private notes about creators

### Brand Data (4 tables)
- \`brand_subscriptions\` - Subscription tier tracking
- \`brand_storage_usage\` - Content Library storage limits
- \`saved_creators\` - Saved/favorited creators
- \`storage_purchases\` - Extra storage purchases

### Transactions (5 tables)
- \`bookings\` - Service bookings
- \`booking_deliverables\` - Uploaded deliverable files
- \`booking_disputes\` - Dispute cases
- \`payouts\` - Creator payout records
- \`reviews\` - Brand reviews of creators

### Campaigns (2 tables)
- \`campaigns\` - Brand campaign postings
- \`campaign_applications\` - Creator applications

### Messaging (5 tables)
- \`conversations\` - Chat threads
- \`messages\` - Individual messages
- \`notifications\` - In-app notifications
- \`mass_message_templates\` - Saved bulk message templates
- \`mass_messages_log\` - Mass message history

### Content Management (2 tables)
- \`content_library\` - Stored UGC content
- \`content_folders\` - Folder organization

### Analytics & System (3 tables)
- \`profile_views\` - Creator profile view tracking
- \`backup_history\` - Backup operation logs
- \`platform_changelog\` - Platform update announcements

### Advertising (1 table)
- \`ad_placements\` - Ad placement configurations`,
        lastUpdated: "2024-12-10",
        tags: ["database", "tables", "schema"]
      }
    ]
  },
  {
    id: "secrets",
    title: "API Keys & Secrets",
    icon: "Key",
    category: "technical",
    articles: [
      {
        id: "configured-secrets",
        title: "Configured Secrets",
        content: `## Secrets in Lovable Cloud

All secrets are stored securely and accessible only in edge functions.

### Email & Notifications
- \`SENDGRID_API_KEY\` - SendGrid email service
- \`RESEND_API_KEY\` - Resend email (backup)
- \`ADMIN_EMAIL\` - Admin notification recipient

### Storage (Cloudflare R2)
- \`R2_ACCOUNT_ID\`
- \`R2_ACCESS_KEY_ID\`
- \`R2_SECRET_ACCESS_KEY\`
- \`R2_BUCKET_NAME\`
- \`R2_PUBLIC_URL\`

### Storage (AWS S3 - Backups)
- \`AWS_ACCESS_KEY_ID\`
- \`AWS_SECRET_ACCESS_KEY\`
- \`AWS_BUCKET_NAME\`
- \`AWS_REGION\`

### Supabase
- \`SUPABASE_URL\`
- \`SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`SUPABASE_PUBLISHABLE_KEY\`
- \`SUPABASE_DB_URL\`

### Other
- \`BACKUP_CRON_SECRET\` - Cron job authentication
- \`LOVABLE_API_KEY\` - Lovable AI integration`,
        lastUpdated: "2024-12-10",
        tags: ["secrets", "api-keys", "configuration"]
      }
    ]
  },
  {
    id: "scheduled-jobs",
    title: "Scheduled Jobs (Cron)",
    icon: "Clock",
    category: "technical",
    articles: [
      {
        id: "cron-jobs",
        title: "Active Cron Jobs",
        content: `## Scheduled Background Jobs

### 1. Database Backup
- **Schedule:** Daily at 00:00 UTC
- **Function:** \`database-backup\`
- **Cron Expression:** \`0 0 * * *\`

### 2. Dispute Deadline Checker
- **Schedule:** Every hour
- **Function:** \`check-dispute-deadlines\`
- **Actions:**
  - Send 48h/24h/1h reminders before auto-release
  - Auto-release payment after 72 hours
  - Escalate disputes after 3 days no response
  - Warn admins of resolution deadlines

### 3. Content Expiration Checker
- **Schedule:** Daily at 08:00 UTC
- **Function:** \`check-content-expiration\`
- **Actions:**
  - Check content with usage_rights_end approaching
  - Send email reminders for 7/3/1 days before expiry
  - Group notifications by brand`,
        lastUpdated: "2024-12-10",
        tags: ["cron", "scheduled", "automation"]
      }
    ]
  },

  // ==================== OPERATIONAL DOCUMENTATION ====================
  {
    id: "email-triggers",
    title: "Automatic Email Triggers",
    icon: "Mail",
    category: "operational",
    articles: [
      {
        id: "creator-emails",
        title: "Creator Email Notifications",
        content: `## Emails Sent to Creators

| Trigger | Email Type | When Sent |
|---------|------------|-----------|
| New booking request | \`creator_new_booking\` | Brand books their service |
| Booking accepted | \`brand_booking_accepted\` | Brand notified (creator sees dashboard) |
| Revision requested | \`creator_revision_requested\` | Brand requests changes |
| Delivery confirmed | \`creator_delivery_confirmed\` | Brand approves work |
| Payment auto-released | \`creator_payment_auto_released\` | 72h passed, auto-released |
| Profile approved | \`creator_profile_approved\` | Admin approves profile |
| Profile rejected | \`creator_profile_rejected\` | Admin rejects profile |
| Campaign app accepted | \`creator_application_accepted\` | Brand accepts application |
| Campaign app rejected | \`creator_application_rejected\` | Brand rejects application |
| Dispute opened against | \`creator_dispute_opened\` | Brand opens dispute |
| Dispute resolved | \`creator_dispute_resolved\` | Admin resolves dispute |`,
        lastUpdated: "2024-12-10",
        tags: ["email", "creators", "notifications"]
      },
      {
        id: "brand-emails",
        title: "Brand Email Notifications",
        content: `## Emails Sent to Brands

| Trigger | Email Type | When Sent |
|---------|------------|-----------|
| Booking accepted | \`brand_booking_accepted\` | Creator accepts booking |
| Booking declined | \`brand_booking_declined\` | Creator declines booking |
| Deliverables submitted | \`brand_deliverables_submitted\` | Creator uploads work |
| Payment auto-released | \`brand_payment_auto_released\` | 72h passed, auto-released |
| New campaign application | \`brand_new_application\` | Creator applies to campaign |
| Campaign approved | \`brand_campaign_approved\` | Admin approves campaign |
| Campaign rejected | \`brand_campaign_rejected\` | Admin rejects campaign |
| Dispute opened against | \`brand_dispute_opened\` | Creator opens dispute |
| Dispute resolved | \`brand_dispute_resolved\` | Admin resolves dispute |
| Content expiring | \`content_expiring\` | Usage rights ending soon |`,
        lastUpdated: "2024-12-10",
        tags: ["email", "brands", "notifications"]
      },
      {
        id: "admin-emails",
        title: "Admin Email Notifications",
        content: `## Emails Sent to Admins

**Recipient:** care@collabhunts.com

| Trigger | Email Type | When Sent |
|---------|------------|-----------|
| New creator pending | \`admin_new_creator_pending\` | Creator submits profile |
| New campaign pending | \`admin_new_campaign_pending\` | Brand creates campaign |
| New dispute filed | \`admin_new_dispute\` | Any party opens dispute |
| Dispute auto-escalated | \`admin_dispute_escalated\` | No response in 3 days |
| Backup failed | \`backup_failed\` | Backup job errors |`,
        lastUpdated: "2024-12-10",
        tags: ["email", "admin", "notifications"]
      }
    ]
  },
  {
    id: "timelines",
    title: "Critical Timelines & Deadlines",
    icon: "Timer",
    category: "operational",
    articles: [
      {
        id: "delivery-timeline",
        title: "Delivery & Payment Timeline",
        content: `## Booking Delivery Timeline

### After Creator Delivers Work:
| Time | Action |
|------|--------|
| 0h | Creator uploads deliverables, \`delivered_at\` timestamp set |
| 24h | Reminder email to brand (24h left to review) |
| 71h | Final reminder (1 hour before auto-release) |
| **72h** | **AUTO-RELEASE: Payment automatically released to creator** |

### Key Rules:
- Brand has 72 hours to review and either approve OR open dispute
- If brand does nothing, payment auto-releases to creator
- Opening a dispute pauses the auto-release timer
- Brand can approve early at any time`,
        lastUpdated: "2024-12-10",
        tags: ["timeline", "delivery", "payment", "72-hours"]
      },
      {
        id: "dispute-timeline",
        title: "Dispute Resolution Timeline",
        content: `## Dispute Timeline

### When Dispute is Opened:
| Time | Action |
|------|--------|
| 0h | Dispute created, \`response_deadline\` = 72h from now |
| 24h | Reminder to respondent (48h left) |
| 48h | Reminder to respondent (24h left) |
| **72h** | **AUTO-ESCALATE: Dispute goes to admin review** |

### After Escalation to Admin:
| Time | Action |
|------|--------|
| 0h | Admin notified, \`resolution_deadline\` = 48h from now |
| 24h | Warning if admin hasn't resolved yet |
| **48h** | Resolution expected by this time |

### Resolution Options:
1. **Full Refund** - 100% refund to brand
2. **Full Release** - 100% payment to creator  
3. **Partial Split** - Custom % split between parties`,
        lastUpdated: "2024-12-10",
        tags: ["timeline", "dispute", "escalation", "resolution"]
      },
      {
        id: "subscription-timeline",
        title: "Subscription Expiration",
        content: `## Subscription Validity

### Plan Durations:
- **Basic (Free):** 1 year validity
- **Pro ($99/mo):** 1 month validity
- **Premium ($299/mo):** 1 month validity

### On Expiration:
1. Subscription status changes to "expired"
2. System auto-creates new Basic subscription (1 year)
3. Brand loses Pro/Premium features immediately
4. Content Library access may be restricted

### Renewal Process:
- Manual renewal required for Pro/Premium
- Admin can manually extend subscriptions
- No automatic recurring billing (yet)`,
        lastUpdated: "2024-12-10",
        tags: ["subscription", "expiration", "billing"]
      }
    ]
  },
  {
    id: "subscriptions",
    title: "Subscription Tiers & Features",
    icon: "CreditCard",
    category: "operational",
    articles: [
      {
        id: "tier-comparison",
        title: "Tier Comparison",
        content: `## Brand Subscription Tiers

| Feature | Basic (Free) | Pro ($99/mo) | Premium ($299/mo) |
|---------|--------------|--------------|-------------------|
| Marketplace Fee | 20% | 15% | 15% |
| Message Creators | ❌ | ✅ | ✅ |
| Create Campaigns | ❌ | 1/month | Unlimited |
| Advanced Filters | ❌ | ✅ | ✅ |
| Creator CRM | ❌ | ✅ | ✅ |
| Content Library | ❌ | 10 GB | 50 GB |
| Extra Storage | ❌ | $10/100GB | $10/100GB |

### Feature Restrictions:
- Basic users see upgrade prompts for locked features
- Contact button hidden for Basic tier
- Campaign creation blocked for Basic tier`,
        lastUpdated: "2024-12-10",
        tags: ["subscription", "pricing", "features"]
      },
      {
        id: "marketplace-fees",
        title: "Marketplace Fee Structure",
        content: `## Fee Calculation

### How Fees Work:
- Fee is calculated as percentage of booking total
- Fee is stored in \`bookings.platform_fee_cents\`
- Creator receives: \`total_price_cents - platform_fee_cents\`

### Fee by Tier:
| Tier | Fee % | Example ($100 booking) |
|------|-------|------------------------|
| Basic | 20% | Platform: $20, Creator: $80 |
| Pro | 15% | Platform: $15, Creator: $85 |
| Premium | 15% | Platform: $15, Creator: $85 |

### When Fee is Applied:
- Calculated at booking creation time
- Based on brand's active subscription at that moment
- Does not change if subscription changes later`,
        lastUpdated: "2024-12-10",
        tags: ["fees", "commission", "pricing"]
      }
    ]
  },
  {
    id: "approval-workflows",
    title: "Approval Workflows",
    icon: "CheckCircle",
    category: "operational",
    articles: [
      {
        id: "creator-approval",
        title: "Creator Profile Approval",
        content: `## Creator Approval Process

### Status Flow:
\`\`\`
pending → approved
        → rejected (with reason)
\`\`\`

### Pending State:
- Creator can access dashboard
- Creator can edit profile and services
- Profile NOT visible in public search
- Profile NOT bookable by brands

### Approval Criteria (Suggested):
1. Complete profile information
2. Valid profile photo
3. At least one social account linked
4. At least one service with pricing
5. Professional bio (50+ characters)

### After Approval:
- Profile visible in /influencers search
- Profile bookable by brands
- Creator receives email notification`,
        lastUpdated: "2024-12-10",
        tags: ["approval", "creator", "workflow"]
      },
      {
        id: "campaign-approval",
        title: "Campaign Approval",
        content: `## Campaign Approval Process

### Status Flow:
\`\`\`
pending → active (approved)
        → rejected (with reason)
\`\`\`

### Pending State:
- Campaign visible only to brand owner
- Not visible in public /campaigns page
- Creators cannot apply

### Approval Criteria (Suggested):
1. Clear, descriptive title (10+ chars)
2. Detailed description (50+ chars)
3. Reasonable budget
4. Valid deadline (future date)
5. No prohibited content

### After Approval:
- Campaign visible in /campaigns
- Campaign visible in creator dashboard
- Creators can submit applications`,
        lastUpdated: "2024-12-10",
        tags: ["approval", "campaign", "workflow"]
      }
    ]
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution Policy",
    icon: "Gavel",
    category: "operational",
    articles: [
      {
        id: "dispute-process",
        title: "Dispute Process",
        content: `## Opening a Dispute

### Who Can Open:
- Brand (within 72h of delivery)
- Creator (for non-payment issues)

### Required Information:
- Reason for dispute (text)
- Evidence description (optional)

### Dispute Statuses:
| Status | Meaning |
|--------|---------|
| \`pending_response\` | Waiting for other party's response |
| \`pending_admin_review\` | Escalated, awaiting admin decision |
| \`resolved_refund\` | Resolved with full refund |
| \`resolved_release\` | Resolved with full payment release |
| \`resolved_partial\` | Resolved with split payment |`,
        lastUpdated: "2024-12-10",
        tags: ["dispute", "resolution", "policy"]
      },
      {
        id: "dispute-resolution-options",
        title: "Resolution Options",
        content: `## Admin Resolution Options

### 1. Full Refund to Brand
- 100% of payment returned to brand
- Creator receives $0
- Use when: Work not delivered, major quality issues

### 2. Full Release to Creator
- 100% of payment goes to creator
- Brand receives no refund
- Use when: Work delivered as agreed, frivolous dispute

### 3. Partial Split
- Custom percentage split
- Example: 60% creator, 40% refund
- Use when: Partial work done, minor issues

### Decision Factors:
- Quality of delivered work
- Compliance with brief/requirements
- Communication history
- Evidence provided by both parties`,
        lastUpdated: "2024-12-10",
        tags: ["dispute", "resolution", "admin"]
      }
    ]
  },
  {
    id: "user-roles",
    title: "User Roles & Permissions",
    icon: "Users",
    category: "operational",
    articles: [
      {
        id: "role-definitions",
        title: "Role Definitions",
        content: `## Platform Roles

### Admin Role
- Full access to Admin Dashboard
- Can approve/reject creators and campaigns
- Can resolve disputes
- Can reset user passwords
- Can manage subscriptions
- Can trigger manual backups
- Can send platform-wide updates

### Brand Role
- Auto-assigned when brand profile created
- Can browse and book creators
- Can create campaigns (based on subscription)
- Can manage Content Library (Pro+)
- Can use Creator CRM (Pro+)

### Creator Role
- Auto-assigned when creator profile created
- Can create services and set pricing
- Can apply to campaigns
- Can deliver work for bookings
- Must be approved to appear in search

### Super Admin
- Email: elie.goole@gmail.com
- Has all brand + admin capabilities
- Can access all features regardless of registration type`,
        lastUpdated: "2024-12-10",
        tags: ["roles", "permissions", "access"]
      }
    ]
  },
  {
    id: "content-library",
    title: "Content Library System",
    icon: "FolderOpen",
    category: "operational",
    articles: [
      {
        id: "content-library-overview",
        title: "Content Library Overview",
        content: `## Content Library

### Access:
- Basic: ❌ No access
- Pro: 10 GB storage
- Premium: 50 GB storage
- Extra: $10 per 100 GB

### Features:
- Upload UGC content from collaborations
- Organize with folders and subfolders
- Tag content for easy filtering
- Track usage rights (start/end dates)
- Download individual or bulk files

### Usage Rights Types:
| Type | Meaning |
|------|---------|
| \`perpetual\` | Forever usage rights |
| \`standard\` | Time-limited with end date |
| \`exclusive\` | Exclusive rights with end date |

### Expiration Reminders:
- 7 days before: Email reminder
- 3 days before: Email reminder
- 1 day before: Email reminder
- On expiry: Marked as expired in UI`,
        lastUpdated: "2024-12-10",
        tags: ["content", "storage", "rights"]
      }
    ]
  },
  {
    id: "support-contacts",
    title: "Support & Contacts",
    icon: "Phone",
    category: "operational",
    articles: [
      {
        id: "contact-info",
        title: "Important Contacts",
        content: `## Platform Contacts

### Support Email
**care@collabhunts.com**
- Receives admin notifications
- Receives backup failure alerts
- Customer support inquiries

### Super Admin
**elie.goole@gmail.com**
- Platform owner
- Full system access

### Technical Issues
- Check Admin Dashboard first
- Review edge function logs
- Check backup history for data issues`,
        lastUpdated: "2024-12-10",
        tags: ["support", "contact", "help"]
      }
    ]
  },
  {
    id: "franchise-system",
    title: "Franchise System",
    icon: "Globe",
    category: "operational",
    articles: [
      {
        id: "franchise-overview",
        title: "Franchise System Overview",
        content: `## Franchise System

### Purpose
Allow regional partners to own territorial rights and earn commission from platform activity in their assigned countries.

### Database Tables
- \`franchise_owners\` - Franchise partner profiles
- \`franchise_countries\` - Country assignments to franchises
- \`franchise_earnings\` - Commission tracking
- \`franchise_payout_requests\` - Payout request management

### Commission Structure
- **Default Rate:** 70% of platform fees go to franchise owner
- **Platform Retains:** 30% of platform fees
- Rates are configurable per franchise in \`commission_rate\` field

### Revenue Sources
1. **Bookings** - Commission on bookings where creator is in franchise territory
2. **Subscriptions** - Commission on brand subscriptions where brand is in franchise territory`,
        lastUpdated: "2024-12-13",
        tags: ["franchise", "territory", "commission", "partners"]
      },
      {
        id: "franchise-activation",
        title: "Franchise Activation Process",
        content: `## Activating a Franchise

### Steps:
1. Admin creates franchise owner in \`franchise_owners\` table
2. Admin assigns countries in \`franchise_countries\` table
3. Admin sets status to "active"
4. Franchise owner receives dashboard access

### Franchise Owner Fields
| Field | Purpose |
|-------|---------|
| \`user_id\` | Links to auth user |
| \`company_name\` | Franchise company name |
| \`contact_email\` | Primary contact email |
| \`commission_rate\` | % of platform fees (default 0.70) |
| \`platform_rate\` | Platform's share (default 0.30) |
| \`status\` | pending / active / suspended |

### Country Assignment
| Field | Purpose |
|-------|---------|
| \`franchise_owner_id\` | Links to franchise owner |
| \`country_code\` | ISO country code (e.g., "US", "LB") |
| \`country_name\` | Full country name |`,
        lastUpdated: "2024-12-13",
        tags: ["franchise", "activation", "setup"]
      },
      {
        id: "franchise-earnings",
        title: "Franchise Earnings Distribution",
        content: `## Automatic Earnings Distribution

### Trigger: Booking Payment
When \`payment_status\` changes to "paid":
1. Check creator's \`location_country\`
2. Find active franchise owner for that country
3. Calculate franchise share: \`platform_fee * commission_rate\`
4. Insert record in \`franchise_earnings\`
5. Update \`total_earnings_cents\` and \`available_balance_cents\`

### Trigger: Brand Subscription
When new subscription is created (not "none" tier):
1. Check brand's \`location_country\`
2. Find active franchise owner for that country
3. Calculate commission on subscription amount
4. Insert record in \`franchise_earnings\`

### Earnings Record Fields
| Field | Purpose |
|-------|---------|
| \`source_type\` | "booking" or "subscription" |
| \`source_id\` | ID of the booking/subscription |
| \`user_id\` | Creator or brand user ID |
| \`user_type\` | "creator" or "brand" |
| \`gross_amount_cents\` | Total transaction amount |
| \`franchise_amount_cents\` | Franchise owner's share |
| \`platform_amount_cents\` | Platform's share |`,
        lastUpdated: "2024-12-13",
        tags: ["franchise", "earnings", "distribution", "commission"]
      },
      {
        id: "franchise-payouts",
        title: "Franchise Payouts",
        content: `## Requesting Payouts

### Payout Request Process
1. Franchise owner requests payout from dashboard
2. Request created with status "pending"
3. Email notification sent to admin
4. Admin reviews and approves/rejects
5. On approval, balance is deducted

### Payout Request Fields
| Field | Purpose |
|-------|---------|
| \`amount_cents\` | Requested payout amount |
| \`payout_method\` | bank_transfer / paypal / wise / crypto |
| \`payout_details\` | JSON with account details |
| \`status\` | pending / approved / rejected |
| \`admin_notes\` | Notes from admin |

### Email Notifications
| Event | Recipients |
|-------|------------|
| Payout requested | Admin + Franchise owner |
| Payout approved | Franchise owner |
| Payout rejected | Franchise owner |

### Balance Management
- \`total_earnings_cents\` - Cumulative all-time earnings
- \`available_balance_cents\` - Current withdrawable balance
- Balance auto-deducted when payout approved`,
        lastUpdated: "2024-12-13",
        tags: ["franchise", "payout", "withdrawal"]
      },
      {
        id: "franchise-dashboard",
        title: "Franchise Dashboard",
        content: `## Franchise Owner Dashboard

### Access
- Route: \`/franchise-dashboard\`
- Requires: Active franchise owner profile
- Navbar shows "Franchise" button when active

### Dashboard Features
1. **Overview Tab**
   - Total earnings
   - Available balance
   - Users in territory (creators + brands)
   - Recent earnings chart

2. **Creators Tab**
   - View all creators from assigned countries
   - Monitor creator activity

3. **Brands Tab**
   - View all brands from assigned countries
   - Monitor brand subscriptions

4. **Earnings Tab**
   - Detailed earnings history
   - Filter by source type
   - Export to CSV

5. **Payouts Tab**
   - Request new payouts
   - View payout history
   - Track pending requests`,
        lastUpdated: "2024-12-13",
        tags: ["franchise", "dashboard", "features"]
      }
    ]
  },
  {
    id: "affiliate-system",
    title: "Affiliate System",
    icon: "Link",
    category: "operational",
    articles: [
      {
        id: "affiliate-overview",
        title: "Affiliate System Overview",
        content: `## Affiliate Program

### Purpose
Allow partners to earn commission by referring new users (creators and brands) to the platform.

### Database Tables
- \`affiliates\` - Affiliate partner profiles
- \`referrals\` - Tracked referral signups
- \`affiliate_earnings\` - Commission records
- \`affiliate_payout_requests\` - Payout management

### Commission Structure
- **Default Rate:** 50% of platform fees from referred users
- **Platform Retains:** 50% of platform fees
- Rates configurable per affiliate in \`commission_rate\` field

### Referral Tracking
- Unique referral code per affiliate (e.g., "JOHN50")
- Code passed via URL: \`?ref=JOHN50\`
- Stored in localStorage until signup
- Permanent link to affiliate once user signs up`,
        lastUpdated: "2024-12-13",
        tags: ["affiliate", "referral", "commission", "partners"]
      },
      {
        id: "affiliate-referral-flow",
        title: "Referral Code Tracking",
        content: `## How Referral Codes Work

### Landing Page Capture
All landing pages (\`/\`, \`/creator\`, \`/brand\`) check for \`?ref=\` parameter:
\`\`\`javascript
const refCode = urlParams.get('ref');
if (refCode) {
  localStorage.setItem('affiliate_referral_code', refCode);
}
\`\`\`

### Signup Capture
During creator/brand signup, code is retrieved from localStorage and linked:
1. User completes signup form
2. System checks \`localStorage.getItem('affiliate_referral_code')\`
3. If code exists, lookup affiliate by code
4. Create \`referrals\` record linking user to affiliate

### Referral Record Fields
| Field | Purpose |
|-------|---------|
| \`affiliate_id\` | The affiliate who referred |
| \`referred_user_id\` | The new user |
| \`referred_user_type\` | "creator" or "brand" |
| \`referral_code_used\` | The code used at signup |`,
        lastUpdated: "2024-12-13",
        tags: ["affiliate", "referral", "tracking", "signup"]
      },
      {
        id: "affiliate-earnings",
        title: "Affiliate Earnings Distribution",
        content: `## Automatic Earnings Distribution

### Trigger: Booking Payment
When \`payment_status\` changes to "paid":
1. Check if creator was referred (lookup in \`referrals\`)
2. Check if brand was referred (lookup in \`referrals\`)
3. For each referred party:
   - Calculate affiliate share: \`platform_fee * commission_rate\`
   - Insert record in \`affiliate_earnings\`
   - Update affiliate's \`total_earnings_cents\` and \`available_balance_cents\`

### Key Difference from Franchise
- Franchise earnings based on **geography** (user's country)
- Affiliate earnings based on **referral** (who referred the user)
- Both can apply to the same transaction!

### Earnings Record Fields
| Field | Purpose |
|-------|---------|
| \`affiliate_id\` | The affiliate earning commission |
| \`referral_id\` | Link to original referral record |
| \`source_type\` | "booking" or "subscription" |
| \`source_id\` | ID of the booking/subscription |
| \`gross_revenue_cents\` | Platform fee amount |
| \`affiliate_amount_cents\` | Affiliate's share |
| \`platform_amount_cents\` | Platform's share |`,
        lastUpdated: "2024-12-13",
        tags: ["affiliate", "earnings", "distribution", "commission"]
      },
      {
        id: "affiliate-payouts",
        title: "Affiliate Payouts",
        content: `## Requesting Payouts

### Payout Request Process
1. Affiliate requests payout from dashboard
2. Request created with status "pending"
3. Email notification sent to admin
4. Admin reviews and approves/rejects
5. On approval, balance is deducted

### Payout Request Fields
| Field | Purpose |
|-------|---------|
| \`amount_cents\` | Requested payout amount |
| \`payout_method\` | bank_transfer / paypal / wise / crypto |
| \`payout_details\` | JSON with account details |
| \`status\` | pending / approved / rejected |
| \`admin_notes\` | Notes from admin |

### Email Notifications
| Event | Recipients |
|-------|------------|
| Payout requested | Admin + Affiliate |
| Payout approved | Affiliate |
| Payout rejected | Affiliate |

### Balance Management
- \`total_earnings_cents\` - Cumulative all-time earnings
- \`available_balance_cents\` - Current withdrawable balance
- Balance auto-deducted when payout approved`,
        lastUpdated: "2024-12-13",
        tags: ["affiliate", "payout", "withdrawal"]
      },
      {
        id: "affiliate-dashboard",
        title: "Affiliate Dashboard",
        content: `## Affiliate Dashboard

### Access
- Route: \`/affiliate-dashboard\`
- Requires: Active affiliate profile
- Navbar shows "Affiliate" button when active

### Dashboard Features
1. **Overview Tab**
   - Unique referral link with copy button
   - Total referrals count
   - Total earnings
   - Available balance

2. **Referrals Tab**
   - List of all referred users
   - User type (creator/brand)
   - Signup date
   - Status

3. **Earnings Tab**
   - Detailed earnings history
   - Filter by source type
   - Export to CSV

4. **Payouts Tab**
   - Request new payouts
   - View payout history
   - Track pending requests

### Referral Link Format
\`https://collabhunts.com/?ref={REFERRAL_CODE}\`

Example: \`https://collabhunts.com/?ref=JOHN50\``,
        lastUpdated: "2024-12-13",
        tags: ["affiliate", "dashboard", "features"]
      },
      {
        id: "affiliate-activation",
        title: "Creating Affiliates",
        content: `## Affiliate Management

### Admin-Only Creation
Currently affiliates can only be created by admins:
1. Go to Admin Dashboard > Affiliates Tab
2. Click "Create Affiliate"
3. Fill in details (name, email, referral code)
4. Set commission rate (default 50%)
5. Activate when ready

### Affiliate Profile Fields
| Field | Purpose |
|-------|---------|
| \`user_id\` | Links to auth user |
| \`display_name\` | Affiliate's name |
| \`email\` | Contact email |
| \`referral_code\` | Unique code (e.g., "JOHN50") |
| \`commission_rate\` | % of platform fees (default 0.50) |
| \`status\` | pending / active / suspended |

### Activation
- Set status to "active" to enable dashboard access
- Referral code only works when affiliate is active
- Suspended affiliates still receive earnings but can't get new referrals`,
        lastUpdated: "2024-12-13",
        tags: ["affiliate", "activation", "setup", "admin"]
      }
    ]
  },
  {
    id: "admin-partner-management",
    title: "Admin Partner Management",
    icon: "Shield",
    category: "operational",
    articles: [
      {
        id: "admin-franchise-management",
        title: "Managing Franchises (Admin)",
        content: `## Admin Franchise Management

### Admin Dashboard > Franchises Tab

### Creating a Franchise
1. Create user account for franchise owner
2. Insert record in \`franchise_owners\` table
3. Insert country assignments in \`franchise_countries\`
4. Set status to "active"

### Viewing Franchises
- List all franchise owners with status
- See assigned countries per franchise
- View earnings and balances

### Processing Payout Requests
1. Review pending payout requests
2. Verify amount vs available balance
3. Approve or reject with notes
4. Payment processed manually outside platform
5. Update request status

### Notifications Sent
- New user in territory → Franchise owner notified
- Earning recorded → Franchise owner notified
- Payout requested → Admin notified
- Payout processed → Franchise owner notified`,
        lastUpdated: "2024-12-13",
        tags: ["admin", "franchise", "management", "payouts"]
      },
      {
        id: "admin-affiliate-management",
        title: "Managing Affiliates (Admin)",
        content: `## Admin Affiliate Management

### Admin Dashboard > Affiliates Tab

### Creating an Affiliate
1. User ID of the affiliate
2. Display name and email
3. Unique referral code (must be unique)
4. Commission rate (default 50%)
5. Set status to "active"

### Viewing Affiliates
- List all affiliates with status
- See referral counts and earnings
- View referral code for each

### Processing Payout Requests
1. Review pending payout requests
2. Verify amount vs available balance
3. Approve or reject with notes
4. Payment processed manually outside platform
5. Update request status

### Notifications Sent
- New referral signup → Affiliate notified
- Earning recorded → Affiliate notified
- Payout requested → Admin notified
- Payout processed → Affiliate notified`,
        lastUpdated: "2024-12-13",
        tags: ["admin", "affiliate", "management", "payouts"]
      }
    ]
  }
];

// Helper function to search across all documentation
export const searchManual = (query: string): ManualArticle[] => {
  const lowerQuery = query.toLowerCase();
  const results: ManualArticle[] = [];
  
  platformManual.forEach(section => {
    section.articles.forEach(article => {
      if (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(article);
      }
    });
  });
  
  return results;
};

// Get all unique tags
export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  platformManual.forEach(section => {
    section.articles.forEach(article => {
      article.tags.forEach(tag => tags.add(tag));
    });
  });
  return Array.from(tags).sort();
};

// Get articles by tag
export const getArticlesByTag = (tag: string): ManualArticle[] => {
  const results: ManualArticle[] = [];
  platformManual.forEach(section => {
    section.articles.forEach(article => {
      if (article.tags.includes(tag)) {
        results.push(article);
      }
    });
  });
  return results;
};
