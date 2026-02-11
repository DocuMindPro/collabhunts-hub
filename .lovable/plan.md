

## Email Notification Audit -- Findings and Fix Plan

### Current State: Most Email Notifications Are NOT Working

The project has a well-designed email notification system with 35+ email types defined in the `send-notification-email` edge function. However, the vast majority of these emails are **never actually sent** due to a critical architectural gap.

### How the System Was Designed

```text
Database Trigger (e.g. booking status changes)
  --> calls public.send_notification_email() PG function
    --> was supposed to call net.http_post() to edge function
      --> edge function sends email via SendGrid
```

### What Actually Happens

The `public.send_notification_email()` database function was disabled and turned into a **no-op** (it just does `RETURN;` immediately) because the `pg_net` extension was unavailable and was causing entire database transactions to fail. This means:

**ALL database-trigger-based emails silently do nothing.**

---

### Detailed Breakdown: What Works vs What Doesn't

#### WORKING (called directly from app code or edge functions)
| Email Type | Trigger Point | Status |
|---|---|---|
| `test_email` | Admin Testing Tab | Working (calls edge function directly) |
| `feedback_submitted` | Feedback page | Working (calls edge function directly) |
| Career application email | Careers page | Working (separate Resend function) |
| Subscription expiry emails | `check-subscription-renewal` cron | Working (edge-to-edge call) |
| Dispute deadline emails | `check-dispute-deadlines` cron | Working (edge-to-edge call) |
| Platform update emails | Admin manual send | Working (edge-to-edge call) |
| Backup success/failure emails | `database-backup` cron | Working (uses Resend directly) |

#### NOT WORKING (rely on disabled database triggers)
| Email Type | When It Should Fire | Impact |
|---|---|---|
| `creator_new_booking` | Brand books a creator | Creators don't know they got booked |
| `creator_booking_accepted` | Brand accepts booking | Creators miss confirmations |
| `creator_booking_declined` | Brand declines booking | No notification |
| `creator_revision_requested` | Brand requests changes | Creator misses revision requests |
| `creator_delivery_confirmed` | Brand approves delivery | No payment release notice |
| `creator_payment_auto_released` | 72h auto-release | No notification |
| `creator_dispute_opened` | Brand opens dispute | Creator misses critical 72h deadline |
| `creator_dispute_resolved` | Admin resolves dispute | No resolution notice |
| `creator_application_accepted` | Brand accepts application | Creator doesn't know |
| `creator_application_rejected` | Brand rejects application | No notification |
| `creator_profile_approved` | Admin approves profile | Creator doesn't know they're live |
| `creator_profile_rejected` | Admin rejects profile | No rejection notice |
| `brand_new_application` | Creator applies to opportunity | Brand misses applications |
| `brand_deliverables_submitted` | Creator submits work | Brand doesn't review |
| `brand_review_reminder_48h/24h` | Auto-release approaching | Brand misses review window |
| `brand_payment_auto_released` | 72h auto-release | No notification |
| `brand_dispute_opened/resolved` | Dispute lifecycle | Brand misses critical updates |
| `brand_campaign_approved/rejected` | Admin reviews campaign | Brand doesn't know |
| `brand_verification_*` | Verification lifecycle | No status updates |
| `admin_new_creator_pending` | New creator signup | Admin misses reviews |
| `admin_new_campaign_pending` | New campaign submitted | Admin misses reviews |
| `admin_new_dispute` | Dispute opened | Admin misses disputes |
| Franchise/Affiliate payout emails | Payout lifecycle | No notifications |

#### ALSO NOT WORKING
| System | Status | Detail |
|---|---|---|
| Push notification trigger | Disabled no-op | Same pg_net issue |
| Calendar reminders | In-app only | Creates notifications in DB but no email |
| New message notifications | In-app only | Real-time channel + toast, no email |

---

### The Fix: Move Email Sending from Database Triggers to Application Code

Since database triggers cannot call edge functions in this environment, the solution is to add direct edge function calls at every point in the application code where these actions happen.

### Implementation Plan

#### Step 1: Create a reusable email helper

Add a utility function in `src/lib/email-utils.ts` that wraps the edge function call with error handling (fire-and-forget, never blocks the UI).

#### Step 2: Add email calls to booking flows

Modify these components to call `send-notification-email` after successful database operations:
- **`src/components/BookingDialog.tsx`** -- send `creator_new_booking` after booking creation
- **`src/components/creator-dashboard/BookingsTab.tsx`** -- send `brand_booking_accepted` / `brand_booking_declined` when creator responds
- **`src/components/brand-dashboard/DeliveryReviewDialog.tsx`** -- send `creator_delivery_confirmed` / `creator_revision_requested`
- **`src/components/chat/AcceptOfferDialog.tsx`** -- send `creator_booking_accepted`
- **`src/components/DisputeDialog.tsx`** -- send dispute emails
- **`src/components/DisputeResponseDialog.tsx`** -- send response emails

#### Step 3: Add email calls to admin actions

- **`src/components/admin/AdminCreatorsTab.tsx`** -- send `creator_profile_approved` / `creator_profile_rejected`
- **`src/components/admin/AdminCampaignsTab.tsx`** -- send `brand_campaign_approved` / `brand_campaign_rejected`
- **`src/components/admin/AdminVerificationsTab.tsx`** -- send verification emails
- **`src/components/admin/AdminDisputesTab.tsx`** -- send `dispute_resolved` emails

#### Step 4: Add email calls to opportunity flows

- **`src/components/opportunities/ApplyOpportunityDialog.tsx`** -- send `brand_new_application`
- **`src/components/brand-dashboard/OpportunityApplicationsDialog.tsx`** -- send `creator_application_accepted` / `creator_application_rejected`

#### Step 5: Add email calls to deliverable submission

- **`src/components/creator-dashboard/SubmitDeliveryDialog.tsx`** or **`DeliveryUploadDialog.tsx`** -- send `brand_deliverables_submitted`

#### Step 6: Add email for new message notifications (brands)

Create a lightweight check: when a message is sent in a conversation, if the recipient is a brand and they haven't been online recently, send them an email notification. This addresses your core concern about small business owners forgetting to check.

---

### Technical Details

**Email helper utility** (`src/lib/email-utils.ts`):
- Wraps `supabase.functions.invoke("send-notification-email", ...)` 
- Fire-and-forget (no `await` blocking the user action)
- Logs errors silently -- email failure should never break the user flow
- Needs to look up the recipient's email from their profile before sending

**Estimated scope**: ~15 files modified, 1 new utility file created. Each modification is small (adding 5-10 lines after existing successful database operations).

**No database changes needed** -- all email templates already exist in the edge function. We're just adding the calls that were supposed to come from the now-disabled triggers.

**SendGrid API key** is already configured in secrets, so emails will send immediately once the calls are wired up.
