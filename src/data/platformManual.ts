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
        lastUpdated: "2025-02-01",
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
        lastUpdated: "2025-02-01",
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
        lastUpdated: "2025-02-01",
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
- All database tables (JSON format)
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
\`/backup-history\` page

### Disaster Recovery
Full recovery guide: \`public/DISASTER_RECOVERY.md\``,
        lastUpdated: "2025-02-01",
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
| \`send-mass-message\` | Send bulk messages/campaign invites |
| \`database-backup\` | Create automated/manual database backups |
| \`verify-backup\` | Validate backup file integrity |
| \`get-cron-status\` | Return scheduled job status |
| \`get-storage-stats\` | Return storage bucket statistics |
| \`check-subscription-renewal\` | Monitor subscription expiration |
| \`check-content-expiration\` | Send content rights expiration reminders |
| \`check-ad-expiration\` | Auto-expire ad placements |
| \`admin-reset-password\` | Allow admins to reset user passwords |
| \`improve-bio\` | AI-powered text improvement suggestions |
| \`draft-agreement\` | AI-assisted agreement drafting |
| \`optimize-image\` | Image optimization for uploads |
| \`upload-profile-image\` | Profile & cover image uploads to R2 |
| \`upload-portfolio-media\` | Portfolio images & videos to R2 |
| \`upload-content\` | Handle Content Library uploads to R2 |
| \`upload-deliverable\` | Handle booking deliverable uploads to R2 |
| \`upload-ad-image\` | Ad placement image uploads |
| \`delete-content\` | Remove content from R2 and database |
| \`send-calendar-reminders\` | Send reminders for upcoming calendar events |
| \`send-push-notification\` | Send push notifications to mobile apps |
| \`check-subscription-renewal\` | Monitor subscription expiration |

### Deployment
Edge functions are automatically deployed when code changes are pushed.`,
        lastUpdated: "2025-02-01",
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
        content: `## Database Tables

### User Management
- \`profiles\` - Base user accounts (auto-created on signup)
- \`user_roles\` - Role assignments (admin, brand, creator)
- \`creator_profiles\` - Creator-specific data
- \`brand_profiles\` - Brand-specific data

### Creator Data
- \`creator_services\` - Service offerings with pricing
- \`creator_social_accounts\` - Social media accounts
- \`creator_portfolio_media\` - Portfolio images/videos
- \`creator_payout_settings\` - Payout configuration
- \`creator_notes\` - Brand's private notes about creators
- \`creator_featuring\` - Boost/featuring purchases
- \`creator_agreements\` - AI-drafted collaboration agreements

### Brand Data
- \`brand_subscriptions\` - Subscription tier tracking
- \`brand_storage_usage\` - Content Library storage limits
- \`saved_creators\` - Saved/favorited creators
- \`storage_purchases\` - Extra storage purchases
- \`brand_opportunities\` - Posted opportunities

### Transactions
- \`bookings\` - Collaboration bookings (for tracking only)
- \`booking_deliverables\` - Uploaded deliverable files
- \`reviews\` - Brand reviews of creators
- \`reviews\` - Brand reviews of creators

### Campaigns/Opportunities
- \`campaigns\` - Brand campaign postings
- \`campaign_applications\` - Creator applications

### Messaging
- \`conversations\` - Chat threads
- \`messages\` - Individual messages
- \`notifications\` - In-app notifications
- \`mass_message_templates\` - Saved bulk message templates
- \`mass_messages_log\` - Mass message history

### Content Management
- \`content_library\` - Stored UGC content
- \`content_folders\` - Folder organization

### Calendar
- \`calendar_events\` - User calendar entries (from confirmed agreements)

### Analytics & System
- \`profile_views\` - Creator profile view tracking
- \`backup_history\` - Backup operation logs

### Advertising
- \`ad_placements\` - Ad placement configurations

### Partners
- \`affiliates\` - Affiliate partner profiles
- \`referrals\` - Tracked referral signups
- \`affiliate_earnings\` - Commission records
- \`affiliate_payout_requests\` - Payout management
- \`franchise_owners\` - Franchise partner profiles
- \`franchise_countries\` - Country assignments
- \`franchise_earnings\` - Franchise commission records
- \`franchise_payout_requests\` - Franchise payout management`,
        lastUpdated: "2025-02-01",
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
        lastUpdated: "2025-02-01",
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

### 2. Content Expiration Checker
- **Schedule:** Daily at 08:00 UTC
- **Function:** \`check-content-expiration\`
- **Actions:**
  - Check content with usage_rights_end approaching
  - Send email reminders for 7/3/1 days before expiry
  - Group notifications by brand

### 3. Calendar Reminders
- **Schedule:** Daily at 08:00 UTC
- **Function:** \`send-calendar-reminders\`
- **Actions:**
  - Send reminders for events 7 days out
  - Send reminders for events 1 day out
  - Send reminders for events on the day

### 4. Subscription Renewal Checker
- **Schedule:** Daily at 09:00 UTC
- **Function:** \`check-subscription-renewal\`
- **Actions:**
  - Check expiring subscriptions
  - Send renewal reminders`,
        lastUpdated: "2025-02-01",
        tags: ["cron", "scheduled", "automation"]
      }
    ]
  },

  // ==================== OPERATIONAL DOCUMENTATION ====================
  {
    id: "business-model",
    title: "Business Model",
    icon: "DollarSign",
    category: "operational",
    articles: [
      {
        id: "marketplace-model",
        title: "Marketplace Model Overview",
        content: `## Zero-Fee Marketplace Model

CollabHunts operates as a classifieds-style marketplace similar to OLX/Dubizzle, but for creator-brand collaborations.

### Key Principles
- **No Transaction Fees:** We don't process payments between parties
- **Direct Relationships:** Brands and creators communicate directly
- **Agreement Records:** AI-drafted agreements document terms
- **Payment Freedom:** Parties arrange payment however they prefer

### Revenue Streams

| Revenue Source | Price | Target |
|----------------|-------|--------|
| Brand Basic Subscription | $99/year (quotation-based) | Brands wanting badge & messaging |
| Brand Pro Subscription | $299/year (quotation-based) | Brands needing unlimited access |
| Creator Featured Badge | $29/week | Creators wanting visibility |
| Creator Spotlight | $49/week | Featured homepage placement |
| Creator Category Boost | $79/week | Top category positioning |
| Verified Business Badge | $99/year | Brand credibility |
| Standard Opportunity | $15/post | Posting opportunity listings |

### Quotation Inquiry System
- Basic and Pro pricing is hidden from guest/unauthenticated users
- Interested brands submit a "Get a Quotation" inquiry
- Admin receives notification and manages inquiries from the Venues tab
- This drives lead capture and personalized onboarding

### What We Don't Do
- Process payments between parties
- Take percentage of deals
- Guarantee delivery or payment
- Escrow funds`,
        lastUpdated: "2025-02-01",
        tags: ["business-model", "pricing", "revenue"]
      }
    ]
  },
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
| Profile approved | \`creator_profile_approved\` | Admin approves profile |
| Profile rejected | \`creator_profile_rejected\` | Admin rejects profile |
| New message | \`creator_new_message\` | Brand sends message |
| Agreement received | \`creator_agreement_received\` | Brand confirms agreement |
| Campaign app accepted | \`creator_application_accepted\` | Brand accepts application |
| Campaign app rejected | \`creator_application_rejected\` | Brand rejects application |
| Boost expiring | \`creator_boost_expiring\` | Featuring about to expire |
| Calendar reminder | \`calendar_reminder\` | Upcoming event reminder |`,
        lastUpdated: "2025-02-01",
        tags: ["email", "creators", "notifications"]
      },
      {
        id: "brand-emails",
        title: "Brand Email Notifications",
        content: `## Emails Sent to Brands

| Trigger | Email Type | When Sent |
|---------|------------|-----------|
| New message | \`brand_new_message\` | Creator responds |
| Agreement sent | \`brand_agreement_received\` | Creator sends agreement |
| New opportunity application | \`brand_new_application\` | Creator applies to opportunity |
| Opportunity approved | \`brand_opportunity_approved\` | Admin approves opportunity |
| Opportunity rejected | \`brand_opportunity_rejected\` | Admin rejects opportunity |
| Content expiring | \`content_expiring\` | Usage rights ending soon |
| Subscription expiring | \`subscription_expiring\` | Plan about to expire |
| Calendar reminder | \`calendar_reminder\` | Upcoming event reminder |`,
        lastUpdated: "2025-02-01",
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
| New opportunity pending | \`admin_new_opportunity_pending\` | Brand creates opportunity |
| Backup failed | \`backup_failed\` | Backup job errors |
| Verification request | \`admin_verification_request\` | Brand requests verified badge |`,
        lastUpdated: "2025-02-01",
        tags: ["email", "admin", "notifications"]
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

| Feature | Free | Basic ($99/year) | Pro ($299/year) |
|---------|------|-------------------|-----------------|
| Browse Creators | ✅ | ✅ | ✅ |
| Message Creators | 1/month | 10/month | Unlimited |
| View Creator Pricing | ❌ | ✅ | ✅ |
| Post Opportunities | $15/post (4 free/month) | 4 free/month | Unlimited |
| Advanced Filters | ❌ | ❌ | ✅ |
| Creator CRM | ❌ | ❌ | ✅ |
| Content Library | ❌ | 10 GB | 50 GB |
| Extra Storage | ❌ | $10/100GB | $10/100GB |
| Verified Badge Eligible | ❌ | ❌ | ✅ |
| Dedicated CSM | ❌ | ❌ | ✅ |

### Pricing Visibility
- **Free tier:** Publicly visible features
- **Basic & Pro:** Pricing hidden from guests; brands must submit a quotation inquiry
- Monthly limits (messages, posts) reset on the 1st of each month

### Important Notes
- CollabHunts is a discovery platform with **zero transaction fees**
- All payments between brands and creators happen directly
- Subscriptions unlock platform features, not payment processing`,
        lastUpdated: "2025-02-01",
        tags: ["subscription", "pricing", "features"]
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
- Profile NOT discoverable by brands

### Approval Criteria (Suggested):
1. Complete profile information
2. Valid profile photo
3. At least one social account linked
4. At least one service with pricing
5. Professional bio (50+ characters)

### After Approval:
- Profile visible in /influencers search
- Profile discoverable by brands
- Creator receives email notification`,
        lastUpdated: "2025-02-01",
        tags: ["approval", "creator", "workflow"]
      },
      {
        id: "opportunity-approval",
        title: "Opportunity Approval",
        content: `## Opportunity Approval Process

### Status Flow:
\`\`\`
pending → active (approved)
        → rejected (with reason)
\`\`\`

### Pending State:
- Opportunity visible only to brand owner
- Not visible in public /opportunities page
- Creators cannot apply

### Approval Criteria (Suggested):
1. Clear, descriptive title (10+ chars)
2. Detailed description (50+ chars)
3. Reasonable budget
4. Valid event date (future date)
5. No prohibited content

### After Approval:
- Opportunity visible in /opportunities
- Opportunity visible to matching creators
- Creators can submit applications`,
        lastUpdated: "2025-02-01",
        tags: ["approval", "opportunity", "workflow"]
      },
      {
        id: "verification-approval",
        title: "Verified Badge Approval",
        content: `## Verified Business Badge Process

### Status Flow:
\`\`\`
none → pending_payment → pending_review → verified
                                        → rejected (with reason)
\`\`\`

### Requirements:
1. Pro or Premium subscription
2. Verified phone number
3. $99/year payment
4. Admin review

### Review Criteria:
1. Legitimate business (website check)
2. Professional profile
3. Complete company information
4. No policy violations

### After Approval:
- Verified badge on profile
- Badge visible in search results
- Enhanced credibility with creators
- Valid for 1 year from approval`,
        lastUpdated: "2025-02-01",
        tags: ["approval", "verification", "badge"]
      },
      {
        id: "quotation-inquiry",
        title: "Quotation Inquiry Workflow",
        content: `## Quotation Inquiry Flow

### Purpose
Capture leads from brands interested in Basic or Pro subscription plans. Pricing for these tiers is hidden from unauthenticated users to drive personalized engagement.

### How It Works:
1. Guest visits /brand page and sees plan features (prices hidden for Basic/Pro)
2. Clicks "Get a Quotation" button
3. If not logged in → redirected to register/login
4. If logged in → inquiry submitted automatically with brand profile details
5. Admin receives notification badge on "Venues" tab
6. Admin reviews and contacts brand directly

### Database Table:
\\\`quotation_inquiries\\\`

### Key Fields:
| Field | Purpose |
|-------|---------|
| \\\`brand_profile_id\\\` | The brand submitting the inquiry |
| \\\`plan_interest\\\` | Which plan they're interested in (basic/pro) |
| \\\`status\\\` | pending / contacted / converted / dismissed |
| \\\`admin_notes\\\` | Internal notes from admin follow-up |

### Admin Management:
- View pending inquiries in Admin > Venues tab
- Badge shows count of pending inquiries
- Admin can update status and add notes
- Goal: convert inquiry into active subscription`,
        lastUpdated: "2025-02-01",
        tags: ["quotation", "inquiry", "lead", "workflow"]
      }
    ]
  },
  {
    id: "agreements-system",
    title: "Agreement System",
    icon: "FileText",
    category: "operational",
    articles: [
      {
        id: "agreement-overview",
        title: "AI-Drafted Agreements",
        content: `## Agreement System Overview

### Purpose
Agreements document collaboration terms between creators and brands for professional record-keeping.

### Agreement Flow:
\`\`\`
negotiation (chat) → creator sends agreement → brand confirms → calendar entry created
\`\`\`

### Agreement Types:
| Type | Use Case |
|------|----------|
| Unbox & Review | Product content collaborations |
| Social Boost | Promotional content packages |
| Meet & Greet | Event appearances |
| Custom Experience | Tailored collaborations |

### Agreement Contents:
- Both parties' details
- Agreed deliverables (specific items)
- Timeline and event date
- Pricing (negotiated amount)
- Content usage rights
- Revision expectations

### Database Table:
\`creator_agreements\`

### Key Fields:
| Field | Purpose |
|-------|---------|
| \`creator_profile_id\` | Creator sending agreement |
| \`brand_profile_id\` | Brand receiving agreement |
| \`template_type\` | Type of package |
| \`proposed_price_cents\` | Agreed amount |
| \`deliverables\` | JSON of specific items |
| \`event_date\` | Collaboration date |
| \`status\` | pending / confirmed / declined / completed |

### After Confirmation:
- Creates calendar event for both parties
- Records are kept for reference
- Status can be updated to "completed"`,
        lastUpdated: "2025-02-01",
        tags: ["agreement", "collaboration", "workflow"]
      }
    ]
  },
  {
    id: "featuring-system",
    title: "Creator Featuring/Boost",
    icon: "Sparkles",
    category: "operational",
    articles: [
      {
        id: "boost-packages",
        title: "Boost Package Details",
        content: `## Creator Boost Packages

### Available Packages:

| Package | Price | Duration | Effect |
|---------|-------|----------|--------|
| Featured Badge | $29 | 1 week | Eye-catching badge on profile card |
| Spotlight | $49 | 1 week | Homepage featured section |
| Category Boost | $79 | 1 week | Top of category search results |

### How It Works:
1. Creator selects package in Dashboard > Featuring tab
2. Completes payment (mock payment with 4242 card)
3. Featuring activates immediately
4. Duration starts from purchase

### Database Table:
\`creator_featuring\`

### Key Fields:
| Field | Purpose |
|-------|---------|
| \`feature_type\` | featured_badge / spotlight / category_boost |
| \`start_date\` | When featuring begins |
| \`end_date\` | When featuring expires |
| \`is_active\` | Currently active |
| \`price_cents\` | Amount paid |
| \`category\` | For category boost - which category |

### Visual Indicators:
- Featured creators have amber gradient badge
- Sparkles icon indicates boosted status
- Higher sort priority in relevant listings`,
        lastUpdated: "2025-02-01",
        tags: ["featuring", "boost", "visibility", "monetization"]
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
- Can approve/reject creators and opportunities
- Can manage verifications
- Can reset user passwords
- Can manage subscriptions
- Can trigger manual backups
- Can send platform-wide updates

### Brand Role
- Auto-assigned when brand profile created
- Can browse and contact creators (with subscription)
- Can post opportunities (Pro+ only)
- Can manage Content Library (with subscription)
- Can use Creator CRM (Pro+ only)

### Creator Role
- Auto-assigned when creator profile created
- Can create services and set pricing
- Can apply to opportunities
- Can send agreements to brands
- Must be approved to appear in search

### Access Restrictions:
- Creators CANNOT access /influencers page
- Creators CANNOT see "Find Creators" or "For Brands" nav links
- Brands CANNOT access creator dashboard
- Non-subscribers CANNOT message creators

### Super Admin
- Email: elie.goole@gmail.com
- Has all brand + admin capabilities
- Can access all features regardless of registration type`,
        lastUpdated: "2025-02-01",
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

### Access by Tier:
- No Package: ❌ No access
- Basic: 10 GB storage
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
        lastUpdated: "2025-02-01",
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
        lastUpdated: "2025-02-01",
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
- **Default Rate:** 70% of platform revenue go to franchise owner
- **Platform Retains:** 30% of platform revenue
- Rates are configurable per franchise in \`commission_rate\` field

### Revenue Sources
1. **Subscriptions** - Commission on brand subscriptions where brand is in franchise territory
2. **Boost Purchases** - Commission on creator boost purchases in territory
3. **Verification Fees** - Commission on brand verification fees in territory`,
        lastUpdated: "2025-02-01",
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
| \`commission_rate\` | % of platform revenue (default 0.70) |
| \`platform_rate\` | Platform's share (default 0.30) |
| \`status\` | pending / active / suspended |

### Country Assignment
| Field | Purpose |
|-------|---------|
| \`franchise_owner_id\` | Links to franchise owner |
| \`country_code\` | ISO country code (e.g., "US", "LB") |
| \`country_name\` | Full country name |`,
        lastUpdated: "2025-02-01",
        tags: ["franchise", "activation", "setup"]
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
        lastUpdated: "2025-02-01",
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
- **Default Rate:** 50% of platform revenue from referred users
- **Platform Retains:** 50% of platform revenue
- Rates configurable per affiliate in \`commission_rate\` field

### Referral Tracking
- Unique referral code per affiliate (e.g., "JOHN50")
- Code passed via URL: \`?ref=JOHN50\`
- Stored in localStorage until signup
- Permanent link to affiliate once user signs up`,
        lastUpdated: "2025-02-01",
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
        lastUpdated: "2025-02-01",
        tags: ["affiliate", "referral", "tracking", "signup"]
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
        lastUpdated: "2025-02-01",
        tags: ["affiliate", "dashboard", "features"]
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
