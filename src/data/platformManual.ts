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
/content-library/{brand_id}/{timestamp}-{filename}
/backups/{date}/backup-{timestamp}.json
/deliverables/{booking_id}/{filename}
\`\`\`

### Cost Benefits
- Zero egress fees (vs AWS S3 ~$0.09/GB)
- 50-60% cost savings over traditional S3`,
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
- All 27 database tables (JSON format)
- Complete schema (DDL, enums, functions, triggers)
- RLS policies
- Edge function descriptions

### Edge Functions
- \`database-backup\` - Performs the backup
- \`verify-backup\` - Validates backup integrity
- \`get-cron-status\` - Returns cron job status

### Failure Notifications
On backup failure, email alert sent to:
**care@collabhunts.com**

### Manual Backup
Admins can trigger manual backups from:
\`/backup-history\` page`,
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
        content: `## Edge Functions Overview

| Function | Purpose |
|----------|---------|
| \`send-notification-email\` | Send all transactional emails via SendGrid |
| \`send-platform-update\` | Broadcast platform updates to all users |
| \`database-backup\` | Create automated/manual database backups |
| \`verify-backup\` | Validate backup file integrity |
| \`get-cron-status\` | Return scheduled job status |
| \`get-storage-stats\` | Return storage bucket statistics |
| \`check-dispute-deadlines\` | Monitor and auto-escalate disputes |
| \`check-content-expiration\` | Send content rights expiration reminders |
| \`admin-reset-password\` | Allow admins to reset user passwords |
| \`improve-bio\` | AI-powered text improvement suggestions |
| \`optimize-image\` | Image optimization for uploads |
| \`upload-content\` | Handle Content Library uploads to R2 |
| \`upload-deliverable\` | Handle booking deliverable uploads |
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
        content: `## Database Tables (27 total)

### User Management
- \`profiles\` - Base user accounts (auto-created on signup)
- \`user_roles\` - Role assignments (admin, brand, creator)
- \`creator_profiles\` - Creator-specific data
- \`brand_profiles\` - Brand-specific data

### Creator Data
- \`creator_services\` - Service offerings with pricing
- \`creator_social_accounts\` - Social media accounts
- \`creator_portfolio_media\` - Portfolio images/videos
- \`creator_payout_settings\` - Stripe payout configuration
- \`creator_notes\` - Brand's private notes about creators

### Brand Data
- \`brand_subscriptions\` - Subscription tier tracking
- \`brand_storage_usage\` - Content Library storage limits
- \`saved_creators\` - Saved/favorited creators

### Transactions
- \`bookings\` - Service bookings
- \`booking_deliverables\` - Uploaded deliverable files
- \`booking_disputes\` - Dispute cases
- \`payouts\` - Creator payout records
- \`reviews\` - Brand reviews of creators

### Campaigns
- \`campaigns\` - Brand campaign postings
- \`campaign_applications\` - Creator applications

### Messaging
- \`conversations\` - Chat threads
- \`messages\` - Individual messages
- \`notifications\` - In-app notifications

### Content Management
- \`content_library\` - Stored UGC content
- \`content_folders\` - Folder organization
- \`storage_purchases\` - Extra storage purchases

### Analytics
- \`profile_views\` - Creator profile view tracking
- \`backup_history\` - Backup operation logs`,
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
