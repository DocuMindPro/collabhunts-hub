
# Fix Android APK Crash - Comprehensive Solution

## Root Cause Analysis

I found **several issues** that are causing the crash on Android:

### Issue 1: `usePushNotifications` Uses `useNavigate` Outside Router Context

The `usePushNotifications` hook calls `useNavigate()` at the top of the hook (line 11), but this hook is used inside `PushNotificationProvider` which runs **immediately when the app loads**. 

On native platforms, the React Router context might not be fully initialized when push notification listeners start, causing:
```text
Error: useNavigate() may only be used within a <Router> component
```

This causes an **instant crash** before anything renders.

### Issue 2: Supabase Client May Initialize with Empty Values

Even though we added the `.env` file creation step, there could be timing issues where `import.meta.env` values aren't available. When `createClient(undefined, undefined)` is called, it throws an error.

### Issue 3: Push Notifications Try to Register Without Firebase

The app immediately tries to register for push notifications on native platforms, but Firebase isn't configured. While the code has try-catch blocks, certain Capacitor plugin calls might still throw uncaught errors.

---

## Technical Summary

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| `useNavigate` called too early | `usePushNotifications.ts` | App crashes immediately | Delay navigation or make it conditional |
| Supabase client with undefined values | `supabase/client.ts` | White screen/crash | Add validation with fallbacks |
| Push notification errors | `usePushNotifications.ts` | Potential crash | Wrap in more defensive error handling |
| PushNotificationProvider runs before Router ready | `App.tsx` | Navigation context unavailable | Move provider or defer initialization |

---

## Implementation Plan

### Step 1: Fix Supabase Client Initialization

Add validation to prevent the app from crashing if environment variables are missing:

| File | Change |
|------|--------|
| `src/integrations/supabase/client.ts` | Add fallback values and validation |

**Changes:**
- Check if `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are defined
- Provide fallback empty strings or throw a clear error
- Add console logging for debugging

### Step 2: Fix Push Notifications Hook

Make the `useNavigate` call conditional and add more defensive error handling:

| File | Change |
|------|--------|
| `src/hooks/usePushNotifications.ts` | Remove top-level `useNavigate`, use callback pattern instead |

**Changes:**
- Remove `useNavigate()` from the top of the hook
- Accept a navigation callback as parameter, or use `window.location` for native
- Wrap all Capacitor calls in more robust try-catch blocks

### Step 3: Fix PushNotificationProvider

Ensure it doesn't run navigation-dependent code until the router is ready:

| File | Change |
|------|--------|
| `src/components/PushNotificationProvider.tsx` | Add router readiness check |

**Changes:**
- Delay push notification initialization until after first render
- Add error boundary for native-specific code

### Step 4: Add Error Boundary for Native Apps

Create a top-level error boundary that catches crashes and shows useful information instead of white screen:

| File | Action |
|------|--------|
| `src/components/NativeErrorBoundary.tsx` | Create new error boundary component |
| `src/App.tsx` | Wrap app in error boundary for native platforms |

### Step 5: Add Debug Logging for Build Verification

Add console logs that will help verify the environment variables are correctly embedded:

| File | Change |
|------|--------|
| `src/main.tsx` | Add startup logging for debugging |

---

## Files to be Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/integrations/supabase/client.ts` | Modify | Add environment variable validation |
| `src/hooks/usePushNotifications.ts` | Modify | Fix useNavigate usage, add error handling |
| `src/components/PushNotificationProvider.tsx` | Modify | Defer initialization |
| `src/components/NativeErrorBoundary.tsx` | Create | Catch and display native errors |
| `src/App.tsx` | Modify | Add error boundary wrapper |
| `src/main.tsx` | Modify | Add debug logging |

---

## Why These Fixes Work

1. **Supabase Client Validation**: If environment variables are missing, the app shows a clear error instead of crashing
2. **Navigation Fix**: Using `window.location.hash` for native navigation avoids React Router context issues
3. **Deferred Initialization**: Push notifications only initialize after the app is fully mounted
4. **Error Boundary**: Even if something crashes, users see an error message instead of white screen, and we get debugging info

---

## After Implementation

1. Push changes to GitHub
2. Wait for new APK build (~5-10 minutes)
3. Download and install new APK
4. The app should now either:
   - Work correctly, OR
   - Show a visible error message that helps us debug further

This defensive approach ensures we can **see what's going wrong** instead of just getting a white screen.
