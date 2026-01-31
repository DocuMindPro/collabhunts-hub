
# Fix: Creator Signup Trigger Chain and User Registration Handling

## Problem Analysis

Two interconnected issues are preventing successful creator registration:

### Issue 1: Push Notification Trigger Failure
When a creator profile is inserted, a chain of triggers fires:
1. `on_creator_profile_created_notify_admin` → inserts a notification for admins
2. `on_notification_insert_send_push` → tries to call `net.http_post()` (pg_net extension)
3. The `net.http_post` function doesn't exist in the expected schema, causing the entire transaction to fail

Even though we added `EXCEPTION WHEN OTHERS`, the error occurs because PostgreSQL can't even resolve the function name during query planning (before execution), so the exception block doesn't catch it.

### Issue 2: Partial User Registration
The signup flow creates the auth user FIRST, then tries to create the profile. Since Supabase Auth runs in a separate transaction, if the profile creation fails, the auth user still exists - causing "user already registered" errors on retry.

---

## Solution

### Database Fix: Disable or Replace the Push Notification Trigger

Since pg_net extension isn't available, we have two options:

**Option A (Recommended): Disable the trigger entirely**
The push notification trigger relies on pg_net which isn't set up. Disable the trigger until push notifications are properly configured.

**Option B: Replace with a no-op function**
Make the trigger function do nothing until the infrastructure is ready.

### Code Fix: Add Pre-Check for Existing User

Add a guard in the signup flow to check if the user already exists and handle the partial registration scenario gracefully.

---

## Technical Implementation

### Step 1: Database - Disable the Push Trigger

```sql
-- Disable the push notification trigger until pg_net is configured
DROP TRIGGER IF EXISTS on_notification_insert_send_push ON public.notifications;
```

Or replace with a safe no-op:

```sql
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Push notifications disabled until pg_net extension is configured
  -- This prevents blocking other operations
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### Step 2: Code - Handle Existing User Recovery

Modify `CreatorSignup.tsx` to:
1. Check if email already exists before signup
2. If user exists but no creator profile, offer to sign in and complete profile
3. Add a client-side guard to prevent double-submission

**Files to modify:**
| File | Changes |
|------|---------|
| Database migration | Disable/fix `on_notification_insert_send_push` trigger |
| `src/pages/CreatorSignup.tsx` | Add pre-submission check and double-click guard |

---

## What This Fixes

| Before | After |
|--------|-------|
| Profile insert triggers notification, which triggers broken push function | Push trigger is disabled - notification still works, just no push |
| Retry shows "user already registered" | Check for existing user and provide recovery path |
| Error blocks entire signup | Graceful fallback allows core signup to complete |

---

## Future Consideration

When you want to re-enable push notifications:
1. Set up Firebase with the required credentials
2. Enable pg_net extension in the database
3. Re-create the trigger with proper function calls

---

## Summary

This is a two-part fix:
1. **Database**: Disable the push notification trigger to stop it from blocking signups
2. **Code**: Add protection against partial registration states
