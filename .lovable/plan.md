
## Root Cause Analysis + In-App Debug Console Plan

### What I Found

After examining the RLS policies, storage buckets, auth settings, and all relevant code, I identified **two root causes** for "cannot create profile" and the crash:

---

### Root Cause #1 — The Real Crash: Email Confirmation Race Condition

**The core problem:** When a user signs up in the app, `supabase.auth.signUp()` is called. Even though email verification is disabled in `site_settings`, the Supabase Auth project itself may still require email confirmation. When email confirmation is enabled at the Auth level:

- `signUp()` returns a user object but **no active session**
- `auth.uid()` is `null` because the JWT is not yet active
- The `NativeAppGate` `SIGNED_IN` event fires before the session is fully active
- When `NativeCreatorOnboarding` tries to `INSERT` into `creator_profiles`, the RLS policy `Creators can insert own profile` checks `auth.uid() = user_id` — but `auth.uid()` is still null
- **Result: INSERT fails with a permissions error** → the error message "Failed to create profile" appears, or the app crashes

**Even if email confirm is off:** there is a secondary race condition — the `SIGNED_IN` event fires immediately after `signUp()`, but Supabase sometimes takes 200–500ms to fully commit the session. The `NativeAppGate` already has a 2-second retry for profile fetching, but the **actual INSERT in onboarding happens before the session is fully available** because `NativeAppGate` routes to `NativeCreatorOnboarding` as soon as it detects no profile, passing the `user` object — but that user object may have been retrieved before the session JWT was ready for RLS evaluation.

**Fix:** In `NativeCreatorOnboarding.handleSubmit`, before attempting any Supabase operations, call `supabase.auth.getSession()` and verify the session is active. If not, call `supabase.auth.refreshSession()` with a short wait. This ensures the JWT is valid before the INSERT runs.

---

### Root Cause #2 — Storage Upload RLS Policy

The `profile-images` storage INSERT policy is:
```sql
with_check: (bucket_id = 'profile-images' AND (auth.uid())::text = (storage.foldername(name))[1])
```

The code uploads to path `${user.id}/profile.${fileExt}`. The `storage.foldername(name)[1]` returns the **first folder segment** (index 1, not 0 in Postgres arrays). This means for path `abc-123/profile.jpg`, it checks `auth.uid()::text = 'abc-123'` which should work — **but only if the session is active**. This circles back to Root Cause #1: if the session JWT isn't active, `auth.uid()` is null, so the storage upload also fails.

---

### Root Cause #3 — No In-App Debug Visibility

When something goes wrong on the phone, you currently have no way to see errors. The existing debug system only works during the initial load (pre-React loader). Once React is running, errors are invisible unless you have developer tools connected via USB.

---

### The Fix Plan

#### Part 1: Fix Profile Creation (Critical)

**File: `src/pages/NativeCreatorOnboarding.tsx`**

In `handleSubmit`, before the `safeNativeAsync` block, add a session validation and refresh step:

```typescript
// Validate session before attempting INSERT
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Try to refresh
  const { data: refreshData } = await supabase.auth.refreshSession();
  if (!refreshData.session) {
    toast.error('Session expired. Please sign in again.');
    setIsLoading(false);
    return;
  }
}
```

Also: wrap the entire `safeNativeAsync` in better error handling to show the **specific error code** in the toast message for debugging (e.g., "RLS policy violation (42501)" or "Network timeout") — this helps you diagnose future issues from a screenshot alone.

#### Part 2: Add In-App Debug Console (New Feature)

Create a new component `src/components/NativeDebugConsole.tsx` — a floating debug overlay that:

- Is **completely invisible** in normal use (no UI clutter)
- **Activated by tapping the logo 5 times** in the NativeAppGate loading screen or login screen
- Shows a full-screen dark overlay with all captured logs and errors
- Captures: all `console.error`, `console.warn`, unhandled promise rejections, Supabase error responses
- Shows device info (OS version, app version, screen size)
- Has a **"Copy All"** button so you can paste logs into a message
- Has a **"Clear"** button
- Persists logs in `localStorage` so errors from previous sessions are visible

Add a **persistent tiny debug trigger** in `NativeCreatorOnboarding` — a small invisible tap area in the top-right corner that opens the debug console when tapped 5 times. This way you can access debug info even when the app is mid-crash.

Also add a global error interceptor in `src/main.tsx` that stores all errors in a `window.NATIVE_ERROR_LOG` array so the debug console can read them.

**File structure:**
- `src/components/NativeDebugConsole.tsx` — NEW: the debug overlay component
- `src/main.tsx` — Add global error/rejection capture
- `src/components/NativeAppGate.tsx` — Pass debug trigger to loading/login screens
- `src/pages/NativeCreatorOnboarding.tsx` — Add session check + show error codes in toast + add debug tap trigger

#### Part 3: Improve Error Messages in Onboarding

Currently the error is just `'Failed to create profile. Please try again.'` — completely useless for debugging. Change it to show the actual error:

```typescript
// Before:
toast.error('Failed to create profile. Please try again.');

// After:
toast.error(`Profile creation failed: ${lastError?.message || 'Unknown error'} (tap logo 5x for details)`);
```

---

### Files to Create/Modify

| File | Change |
|---|---|
| `src/components/NativeDebugConsole.tsx` | NEW: Full debug overlay with log capture, device info, copy button |
| `src/pages/NativeCreatorOnboarding.tsx` | Session validation before INSERT, better error messages, debug trigger |
| `src/main.tsx` | Global error/rejection interceptor writing to `window.NATIVE_ERROR_LOG` |
| `src/components/NativeAppGate.tsx` | Integrate debug console, pass logo-tap trigger |

---

### How the Debug Console Works (User Flow)

```text
App crashes or shows error
     ↓
Tap the Collab Hunts logo 5 times quickly (on any screen)
     ↓
Full-screen debug overlay opens
     ↓
Shows:
  - Device: Android 13, Screen: 390x844
  - Session: Active (or Expired)
  - Last 50 errors/warnings with timestamps
  - Unhandled promise rejections
  - Supabase error codes
     ↓
Tap "Copy All" → paste into chat message to me
```

This gives you full visibility into every crash without needing developer tools or a USB connection.

---

### No Database Changes Required

All fixes are in the React/TypeScript layer. The database schema and RLS policies are correct — the issue is the session not being ready before the INSERT runs.
