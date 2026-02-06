

# Add Scheduled Push Notifications

## Overview
Allow the admin to either send a push notification immediately or schedule it for a future date/time. Scheduled notifications are stored in a new database table and processed by a cron-triggered edge function.

## How It Works

1. Admin composes a notification (title + message)
2. Chooses "Send Now" or "Schedule for Later"
3. If scheduled, picks a date and time -- the notification is saved to a `scheduled_push_notifications` table
4. A cron job runs every minute, checks for due notifications, sends them via the existing `send-push-to-creators` function logic, and marks them as sent
5. Admin can see a list of upcoming/past scheduled notifications and cancel pending ones

## Database Changes

### New table: `scheduled_push_notifications`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| title | text | Notification title |
| body | text | Notification message |
| scheduled_at | timestamptz | When to send |
| status | text | "pending", "sent", "cancelled" |
| sent_at | timestamptz | When it was actually sent (nullable) |
| result | jsonb | Send result (sent/failed counts) |
| created_by | uuid | Admin user ID |
| created_at | timestamptz | Row creation time |

RLS: Only admins can read/write (matching existing admin patterns).

## New Edge Function: `process-scheduled-push`
- Triggered by a cron job every minute
- Queries `scheduled_push_notifications` for rows where `status = 'pending'` and `scheduled_at <= now()`
- For each, sends the push notification using the same FCM logic from `send-push-to-creators`
- Updates status to "sent" with result details

## Cron Job
A `pg_cron` + `pg_net` schedule that calls the `process-scheduled-push` function every minute.

## UI Changes in `AdminAnnouncementsTab.tsx`
- Add a "Send Now" / "Schedule" toggle (radio or tabs) under the push notification card
- When "Schedule" is selected, show a date picker and time input
- "Schedule Notification" button saves to the database instead of sending immediately
- New section below: "Scheduled Notifications" list showing upcoming and recent notifications with status badges and a cancel button for pending ones

## Technical Details

### Files to Create
1. **`supabase/functions/process-scheduled-push/index.ts`** -- Edge function that processes due scheduled notifications
2. Database migration for the new table, RLS policies, and cron job

### Files to Modify
1. **`src/components/admin/AdminAnnouncementsTab.tsx`** -- Add schedule toggle, date/time picker, scheduled list with cancel functionality
2. **`supabase/config.toml`** -- Register `process-scheduled-push` function

### Cron Setup (via SQL, not migration)
```sql
SELECT cron.schedule(
  'process-scheduled-push',
  '* * * * *',
  $$ SELECT net.http_post(
    url:='https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/process-scheduled-push',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id; $$
);
```

### Edge Function: `process-scheduled-push`
- No auth header needed (called by cron with anon key)
- Uses service role key internally to query and update the table
- Reuses the Firebase FCM sending logic from `send-push-to-creators`
- Updates each notification's status and result after sending

### Admin UI Updates
- Toggle between "Send Now" and "Schedule" modes
- Date picker using the existing `Calendar` component + time input
- Table/list of scheduled notifications with columns: Title, Scheduled Time, Status, Actions (Cancel)
- Status badges: Pending (yellow), Sent (green), Cancelled (gray)
