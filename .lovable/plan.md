
# Fix Android White Screen - Router Compatibility Issue

## Root Cause

Your APK shows a white screen because **`BrowserRouter` doesn't work in Capacitor apps**. Here's why:

| Environment | URL Format | Router Needed |
|-------------|------------|---------------|
| Web browser | `https://yoursite.com/page` | BrowserRouter ✓ |
| Native app (Capacitor) | `file:///android_asset/index.html` | HashRouter ✓ |

When Capacitor loads your app, it uses `file://` protocol. `BrowserRouter` expects a web server to handle routes, but there isn't one in the native app - so routing fails silently and shows a white screen.

---

## Solution

Switch from `BrowserRouter` to `HashRouter` for Capacitor apps, OR use a hybrid approach that detects the platform.

---

## Implementation Plan

### Option 1: Use HashRouter (Simple Fix)

Replace `BrowserRouter` with `HashRouter`. URLs will look like `/#/page` instead of `/page`.

| File | Change |
|------|--------|
| `src/App.tsx` | Import `HashRouter` instead of `BrowserRouter` |

**Pros**: Simple, works everywhere
**Cons**: URLs have `#` in them (less clean for web)

### Option 2: Platform-Aware Router (Recommended)

Detect if running in Capacitor and use the appropriate router:
- **Web**: Use `BrowserRouter` (clean URLs)
- **Native App**: Use `HashRouter` (compatible with file://)

| File | Change |
|------|--------|
| `src/App.tsx` | Add platform detection and conditional router |

---

## Recommended Implementation (Option 2)

### Changes to `src/App.tsx`

1. Import both routers and Capacitor's `Capacitor` module
2. Detect if running in native app using `Capacitor.isNativePlatform()`
3. Conditionally render the appropriate router

```text
Before:
  import { BrowserRouter } from "react-router-dom"
  ...
  <BrowserRouter>
    ...
  </BrowserRouter>

After:
  import { BrowserRouter, HashRouter } from "react-router-dom"
  import { Capacitor } from "@capacitor/core"
  
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter
  ...
  <Router>
    ...
  </Router>
```

---

## Technical Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/App.tsx` | Modify | Add platform detection and use HashRouter for native apps |

### After This Fix

1. Push changes to GitHub
2. Wait for new APK build (~5-10 minutes)
3. Download and install new APK
4. App will properly route and show the home page instead of white screen

---

## Why This Works

- `HashRouter` uses the URL hash (`#`) for routing
- Hash changes don't require server-side handling
- Works with `file://` protocol used by Capacitor
- Web users still get clean URLs with `BrowserRouter`
