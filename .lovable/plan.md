
# Fix Android White Screen - CSS Animation Issue

## Problem Identified

The app shows the logo then freezes because the CSS `.page-enter` animation starts from `opacity: 0`. On Android WebView, this animation may not complete properly, leaving the entire page invisible.

**Current CSS (problematic):**
```css
.page-enter {
  animation: pageEnter 0.3s ease-out forwards;
}

@keyframes pageEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Even though `PageTransition.tsx` uses `isNativePlatform()` check, the CSS class still applies the opacity animation.

---

## Solution

Add a CSS class specifically for native platforms that bypasses the animation entirely.

### Changes Required

**File 1: `src/index.css`**

Add a new class `.page-enter-native` that does NOT animate and keeps content fully visible:

```css
/* Native platform - no animation, immediate visibility */
.page-enter-native {
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
}
```

Also add this to the reduced motion media query for consistency.

**File 2: `src/components/PageTransition.tsx`**

Change the class applied on native from `page-enter` to `page-enter-native`:

```tsx
// On native, render without transition classes for maximum performance
if (isNative) {
  return <div className="page-transition page-enter-native">{displayChildren}</div>;
}
```

---

## Why This Will Work

| Before | After |
|--------|-------|
| Native uses `.page-enter` which animates from `opacity: 0` | Native uses `.page-enter-native` with `opacity: 1 !important` |
| Animation may not complete on WebView | No animation to get stuck on |
| Content invisible until animation ends | Content visible immediately |

---

## Additional Safety: Force Immediate Render

Add CSS rules to ensure content is always visible even if JavaScript fails:

```css
/* Force visibility on Android WebView */
.page-transition {
  opacity: 1; /* Fallback - ensures base visibility */
}
```

---

## Technical Summary

| File | Change |
|------|--------|
| `src/index.css` | Add `.page-enter-native` class with `opacity: 1 !important` and `animation: none` |
| `src/components/PageTransition.tsx` | Use `page-enter-native` class on native platforms |

---

## Testing Steps

1. Push changes to GitHub
2. Wait for new APK build
3. Install on BlueStacks/device
4. App should now show the full home page immediately without freezing

This is a minimal, targeted fix that addresses the exact CSS animation issue causing the white screen.
