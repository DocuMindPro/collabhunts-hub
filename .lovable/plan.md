
# Fix PWA Build Error for Large Bundle

## Problem
The `maximumFileSizeToCacheInBytes` setting at 5MB is present in the config, but the build is still failing. This can happen because:

1. The vite-plugin-pwa has strict validation that may not respect this setting in certain build modes
2. There may be a caching issue with the node_modules or build artifacts

## Solution Options

### Option A: Increase Limit Further + Suppress Warning (Quick Fix)
Update the Vite config to suppress the chunk size warning and ensure the PWA plugin respects the larger limit:

| File | Change |
|------|--------|
| `vite.config.ts` | Increase `maximumFileSizeToCacheInBytes` to 10MB and add `chunkSizeWarningLimit: 3000` |

### Option B: Disable PWA for Production Build (Recommended for Native)
Since you're primarily building for Android APK, the PWA service worker isn't needed. Disable the PWA plugin conditionally:

| File | Change |
|------|--------|
| `vite.config.ts` | Only enable VitePWA in development mode, skip it for production builds |

---

## Recommended Implementation (Option B)

For Android APK builds, PWA caching is unnecessary because:
- Native apps don't use service workers
- The APK bundles everything locally
- Removing PWA eliminates the size limit issue entirely

### Changes to vite.config.ts

```text
Before:
  VitePWA({
    registerType: 'autoUpdate',
    ...
  })

After:
  mode !== "production" && VitePWA({
    registerType: 'autoUpdate',
    ...
  })
```

This ensures:
- **Development**: PWA enabled for web testing
- **Production builds (APK)**: PWA disabled, no service worker generated, no size limits

---

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `vite.config.ts` | Modify | Conditionally disable VitePWA for production builds |

---

## Alternative: Keep PWA for Web

If you want to keep PWA functionality for the website but disable for APK builds, we can use an environment variable:

```typescript
const enablePWA = mode !== "production" || process.env.ENABLE_PWA === "true";
```

This way:
- GitHub Actions APK build: No PWA (faster, no errors)
- Manual web deploy with `ENABLE_PWA=true`: PWA enabled

---

## Expected Result

After this fix:
1. Build completes without errors
2. GitHub Actions generates APK successfully
3. Native Android app loads correctly (no service worker interference)
4. Web version can still work without PWA (or with it if you enable the flag)
