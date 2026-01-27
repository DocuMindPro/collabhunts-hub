
# Fix Android App White Screen - Complete Solution

## Root Cause

The Android app freezes after showing the logo because multiple Supabase network requests are made during initialization, and on Android WebView:
1. Network requests may be throttled or fail silently
2. There's no timeout/error handling to proceed when requests hang
3. UI components remain invisible (opacity: 0) waiting for data that never arrives

The logo shows because it's one of the first successful fetches, but subsequent requests pile up and block the UI from rendering.

## Solution Overview

We need to make the app more resilient to network issues on Android by:
1. Adding network timeout handling for Supabase calls
2. Making the initial render independent of network requests
3. Ensuring content is visible even when data is still loading
4. Removing external font dependencies for native builds

---

## Implementation Plan

### Step 1: Create a Native-Safe Supabase Client Wrapper

Create a wrapper that adds timeout handling for all Supabase calls on native platforms.

**New File**: `src/lib/supabase-native.ts`

This wrapper will:
- Detect native platform
- Add configurable timeouts to Supabase calls
- Return fallback/empty data on timeout instead of hanging
- Log issues for debugging

### Step 2: Update PageTransition for Immediate Visibility

The current PageTransition starts with `opacity: 0` for 50ms, which can compound with other delays.

**File to modify**: `src/components/PageTransition.tsx`

Changes:
- On native platforms, skip the transition animation entirely
- Render content immediately with full opacity
- Keep transitions for web only

### Step 3: Update AnimatedSection for Native

AnimatedSection uses IntersectionObserver which works but starts with invisible content.

**File to modify**: `src/components/AnimatedSection.tsx`

Changes:
- On native platforms, immediately set `isVisible = true`
- Skip IntersectionObserver on native for faster first paint
- Content renders visible immediately

### Step 4: Add Loading States to Critical Components

Components should show content immediately, not wait for data.

**Files to modify**:
- `src/components/Navbar.tsx`: Show navbar immediately, defer profile checks
- `src/components/Logo.tsx`: Show text fallback immediately while loading
- `src/components/Footer.tsx`: Show footer immediately, defer async checks

### Step 5: Handle Google Fonts for Native

External font loading can block or slow rendering on native.

**File to modify**: `index.html`

Changes:
- Add `font-display: swap` to prevent blocking
- Consider bundling fonts or using system fonts as fallback

### Step 6: Add Global Error Boundary Improvements

Enhance the error boundary to catch network-related hangs.

**File to modify**: `src/components/NativeErrorBoundary.tsx`

Changes:
- Add a loading timeout that shows content after X seconds regardless
- Detect if app is "stuck" and offer recovery options

---

## Detailed Changes

### Step 1: supabase-native.ts (New File)

```typescript
// Utility to wrap Supabase calls with timeout for native platforms
import { Capacitor } from '@capacitor/core';

const NATIVE_TIMEOUT_MS = 5000; // 5 second timeout on native

export async function withNativeTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  timeoutMs: number = NATIVE_TIMEOUT_MS
): Promise<T> {
  if (!Capacitor.isNativePlatform()) {
    return promise; // No timeout on web
  }

  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => {
        console.warn('[Native] Supabase request timed out, using fallback');
        resolve(fallback);
      }, timeoutMs);
    }),
  ]);
}
```

### Step 2: PageTransition.tsx Updates

| Current | Fixed |
|---------|-------|
| Always uses 50ms delay + opacity animation | Skip animation on native platforms |
| Starts with `page-exit` class (opacity: 0) | Start with `page-enter` on native |

### Step 3: AnimatedSection.tsx Updates

| Current | Fixed |
|---------|-------|
| Uses IntersectionObserver, starts invisible | On native: immediately visible |
| Waits for intersection to show content | No waiting on native |

### Step 4: Navbar.tsx Updates

| Current | Fixed |
|---------|-------|
| Calls `getSession()` synchronously in useEffect | Wrap with timeout |
| Blocks on profile checks | Profile checks are deferred, UI shows first |

### Step 5: Logo.tsx Updates

| Current | Fixed |
|---------|-------|
| Shows empty placeholder while loading | Show text fallback immediately |
| Waits for Supabase before showing anything | Always show something |

---

## Technical Summary

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/supabase-native.ts` | NEW | Timeout wrapper for Supabase calls |
| `src/components/PageTransition.tsx` | MODIFY | Skip animation on native |
| `src/components/AnimatedSection.tsx` | MODIFY | Immediately visible on native |
| `src/components/Navbar.tsx` | MODIFY | Defer Supabase calls, show UI first |
| `src/components/Logo.tsx` | MODIFY | Show fallback immediately |
| `src/components/Footer.tsx` | MODIFY | Defer async calls |
| `src/hooks/useSiteSettings.tsx` | MODIFY | Add timeout handling |

---

## Alternative Quick Fix

If the full solution is too extensive, a quick fix is to:

1. **Disable ALL Supabase calls on native platform during initial render**
2. **Only enable them after a 2-second delay**
3. **Show the app immediately with default/cached data**

This ensures the UI renders and is interactive, with data loading in the background.

---

## After Implementation

1. Push changes to GitHub
2. Wait for Build #20 to complete
3. Install new APK
4. The app should now:
   - Show the full home page immediately
   - Load data in the background
   - Not freeze even if network is slow/unavailable

---

## Why Previous Fixes Didn't Work

| Previous Fix | Why It Wasn't Enough |
|--------------|---------------------|
| Remove lazy loading | ✅ Fixed code splitting issues, but not network issues |
| Remove Suspense | ✅ Removed loading boundaries, but data fetching still blocks |
| Disable PWA | ✅ Fixed build errors, but not runtime issues |
| HashRouter | ✅ Correct for file:// protocol, already in place |

The missing piece was **network resilience** - the app was loading all its code correctly, but then hanging on Supabase network requests that work differently in Android WebView vs browser.
