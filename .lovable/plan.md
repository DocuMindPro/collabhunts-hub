
# Fix Android App White Screen - Complete Root Cause Fix

## Problem Summary

The Android app shows the logo then freezes because:
1. **Index.tsx** page makes direct Supabase calls without timeout protection
2. **AdPlacement** component blocks rendering waiting for data
3. **Google Fonts** load synchronously, blocking first paint
4. Several auth state listeners make synchronous network requests

## Solution Overview

Apply timeout protection to ALL remaining Supabase calls and make fonts non-blocking.

---

## Step 1: Fix Index.tsx - Wrap All Supabase Calls

The home page (Index.tsx) is the first page users see. All its Supabase calls need protection.

| Current | Fixed |
|---------|-------|
| Direct `supabase.from()` calls | Wrap with `safeNativeAsync()` |
| Direct `supabase.auth.getSession()` | Wrap with timeout |
| `checkUserProfiles()` blocks render | Defer execution on native |

**Changes:**
```typescript
import { isNativePlatform, safeNativeAsync } from "@/lib/supabase-native";

// In checkUserProfiles - wrap with safeNativeAsync
const brandProfile = await safeNativeAsync(
  async () => {
    const { data } = await supabase.from('brand_profiles')...
    return data;
  },
  null
);

// Initial session check - wrap with timeout
if (isNativePlatform()) {
  setTimeout(() => {
    supabase.auth.getSession().then(...)
  }, 200);
} else {
  supabase.auth.getSession().then(...)
}
```

---

## Step 2: Fix AdPlacement.tsx - Add Timeout + Fallback

AdPlacement returns `null` while loading, making content invisible.

| Current | Fixed |
|---------|-------|
| `if (loading) return null` | Return fallback immediately |
| Direct Supabase call | Wrap with `safeNativeAsync()` |
| No timeout | 3-second timeout for ads |

**Changes:**
```typescript
import { safeNativeAsync, isNativePlatform } from "@/lib/supabase-native";

// Show fallback immediately on native instead of null
if (loading) {
  if (isNativePlatform()) {
    // Show placeholder on native to prevent blank areas
    return showAdvertiseHere ? <AdvertisePlaceholder /> : null;
  }
  return null;
}

// Wrap fetch with timeout
const fetchAd = async () => {
  const data = await safeNativeAsync(
    async () => {
      const result = await supabase.from("ad_placements")...
      return result.data;
    },
    null,
    3000 // 3 second timeout for ads
  );
  setAd(data);
  setLoading(false);
};
```

---

## Step 3: Make Google Fonts Non-Blocking

Currently fonts load synchronously and can block render on slow networks.

| Current | Fixed |
|---------|-------|
| `<link href="fonts...">` | Add `media="print" onload="..."` pattern |
| Blocking load | Non-blocking with fallback |

**Changes to index.html:**
```html
<!-- Non-blocking font loading with fallback -->
<link rel="preload" href="https://fonts.googleapis.com/css2..." as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2..."></noscript>
```

Also add CSS fallback in `index.css`:
```css
/* System font fallback for native */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

---

## Step 4: Defer PushNotificationProvider Initialization

The push notification hook does network calls early. Make it safer.

| Current | Fixed |
|---------|-------|
| Starts after 50ms | Delay to 500ms on native |
| Auth calls in listeners | Wrap with try-catch + timeout |

**Changes:**
```typescript
// Longer delay on native platforms
useEffect(() => {
  const delay = Capacitor.isNativePlatform() ? 500 : 50;
  const timer = setTimeout(() => setIsMounted(true), delay);
  return () => clearTimeout(timer);
}, []);
```

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/pages/Index.tsx` | Wrap Supabase calls with timeout | HIGH |
| `src/components/AdPlacement.tsx` | Add timeout + show fallback during load | HIGH |
| `index.html` | Make Google Fonts non-blocking | HIGH |
| `src/components/PushNotificationProvider.tsx` | Increase native delay | MEDIUM |
| `src/index.css` | Add system font fallback | LOW |

---

## Expected Result After Fix

| Before | After |
|--------|-------|
| App shows logo then freezes | App shows complete home page immediately |
| Waits for network requests | Renders with fallback data |
| Fonts block render | Fonts load asynchronously |
| Ad placements invisible | Placeholder shown while loading |

---

## Testing Steps

1. Push changes to GitHub
2. Wait for GitHub Actions Build #21 to complete
3. Download new APK from Releases
4. Uninstall old APK from BlueStacks/device
5. Install new APK
6. App should now:
   - Show navbar immediately
   - Show hero section with text
   - Show footer
   - Load dynamic data (ads, user profiles) in background

---

## Technical Summary

The core issue is that while Navbar, Logo, Footer, and AnimatedSection were fixed to use `safeNativeAsync()`, the **Index page itself** was never updated. The home page makes multiple Supabase calls that can hang on Android WebView, and the `AdPlacement` component returns `null` during loading which creates invisible areas.

The fix ensures:
1. All Supabase calls have 5-second timeouts on native
2. UI renders immediately with fallback/placeholder content
3. Fonts don't block rendering
4. Data loads asynchronously in the background
