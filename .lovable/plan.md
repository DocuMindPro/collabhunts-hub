

# Fix: Notification Insert Trigger Error

## Problem Identified

When a creator tries to submit their profile, the system creates notifications (e.g., to notify admins of the new pending creator). However, the notification insert triggers a push notification function that references a non-existent column.

**Error:** `record "new" has no field "notification_type"`

**Root Cause:** The `trigger_push_notification` function references `NEW.notification_type`, but the `notifications` table has a column called `type`, not `notification_type`.

## Current State

**Notifications table columns:**
- `id`, `user_id`, `title`, `message`, **`type`**, `read`, `link`, `created_at`

**Broken trigger function (`trigger_push_notification`):**
```sql
payload := jsonb_build_object(
  'user_id', NEW.user_id,
  'title', NEW.title,
  'body', NEW.message,
  'notification_type', NEW.notification_type,  -- ❌ Column doesn't exist!
  'data', ...
);
```

## Solution

Update the trigger function to reference the correct column name: `NEW.type` instead of `NEW.notification_type`.

## Database Migration

| Change | Details |
|--------|---------|
| Update function | Replace `NEW.notification_type` with `NEW.type` in `trigger_push_notification` |
| No schema changes | The `notifications` table structure stays the same |

**Fixed Function:**
```sql
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'user_id', NEW.user_id,
    'title', NEW.title,
    'body', NEW.message,
    'notification_type', NEW.type,  -- ✅ Use correct column name
    'data', jsonb_build_object(
      'link', NEW.link,
      'notification_id', NEW.id
    )
  );

  PERFORM net.http_post(
    url := 'https://olcygpkghmaqkezmunyu.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Result

After this fix:
- Creator profile submissions will work without errors
- Notifications will be created successfully
- Push notifications will include the correct `type` value in their payload

