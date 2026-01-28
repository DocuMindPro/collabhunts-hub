

# Fix NativeAppGate Hanging on Android

## Problem Identified

The app is stuck on the loading screen because `NativeAppGate` makes Supabase calls without timeout protection. On Android WebView:
- `supabase.auth.getSession()` hangs indefinitely
- Database queries to `creator_profiles` also hang
- `isLoading` never becomes `false`
- The app stays frozen on `NativeLoadingScreen`

## Root Cause

The project already has timeout utilities in `src/lib/supabase-native.ts` specifically for Android WebView issues, but `NativeAppGate` doesn't use them:

```typescript
// NativeAppGate currently uses raw calls that hang:
const { data: { session } } = await supabase.auth.getSession(); // HANGS!
```

## Solution

Wrap ALL Supabase calls in `NativeAppGate` with the existing `safeNativeAsync` utility that enforces 5-second timeouts and returns fallback values.

---

## Implementation Details

### File: `src/components/NativeAppGate.tsx`

**Changes:**

1. Import the native timeout utility:
```typescript
import { safeNativeAsync } from '@/lib/supabase-native';
```

2. Wrap `getSession()` with timeout:
```typescript
const session = await safeNativeAsync(
  async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  null, // fallback: no session
  5000  // 5 second timeout
);
```

3. Wrap creator profile query with timeout:
```typescript
const profile = await safeNativeAsync(
  async () => {
    const { data } = await supabase
      .from('creator_profiles')
      .select('id, display_name, status')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  },
  null, // fallback: no profile
  5000
);
```

4. Add a hard 10-second failsafe timeout that shows the login screen if everything hangs:
```typescript
// Failsafe: If still loading after 10 seconds, show login screen
useEffect(() => {
  const failsafe = setTimeout(() => {
    if (isLoading) {
      console.warn('NativeAppGate: Failsafe timeout, showing login');
      setIsLoading(false);
    }
  }, 10000);
  return () => clearTimeout(failsafe);
}, [isLoading]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/NativeAppGate.tsx` | Add timeout wrappers around all Supabase calls, add failsafe timeout |

---

## Technical Details

### Why This Happens on Android

From project architecture notes:
> Supabase requests on native WebView platforms hang or fail silently, causing the app to freeze after the logo screen.

The existing solution (`withNativeTimeout`, `safeNativeAsync`) was created for this exact issue but wasn't applied to the new `NativeAppGate` component.

### Why Auth Calls Hang

On Android WebView:
- Network requests can hang without error
- `localStorage` access for session retrieval can fail silently  
- The WebView doesn't properly timeout fetch requests

### The Fix Strategy

1. **Timeout all async calls** - Use 5-second timeouts with fallbacks
2. **Failsafe timeout** - After 10 seconds, force show login screen
3. **Graceful degradation** - If auth check fails, user just needs to log in again

---

## Expected Result

After implementation:
1. App opens with splash screen (2 seconds)
2. Loading screen shows briefly (max 5-10 seconds even if network fails)
3. Either:
   - User is authenticated → Goes to Creator Dashboard
   - Auth check times out → Shows login screen (user logs in again)
4. No more infinite loading

## Testing Steps

1. Rebuild APK with changes
2. Clear app data on BlueStacks (to test fresh state)
3. Open app - should show login screen within 10 seconds
4. Log in with creator account
5. Close and reopen - should go directly to dashboard (or login if session expired)

