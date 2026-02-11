

## Fix: Update All Logo Assets to Match New Branding

### Problem
The `public/app-icon.png` was replaced, but:
1. The loading screen may show the cached old icon (browser/PWA cache)
2. `public/pwa-192x192.png` and `public/pwa-512x512.png` were never updated -- they still use the old logo
3. These PWA icons are referenced in `manifest.json` and `index.html` (apple-touch-icon)

### What Will Change

| File | Action |
|------|--------|
| `public/pwa-192x192.png` | Replace with the new Collab Hunts logo (resized to 192x192) |
| `public/pwa-512x512.png` | Replace with the new Collab Hunts logo (resized to 512x512) |

Both files will be copied from the new `app-icon.png` that was already uploaded. The loading screen (`index.html` line 84) already points to `/app-icon.png` which is correct -- the old icon showing is a cache issue that will resolve once the PWA icons are also updated and the app is refreshed.

### After This Change
- All three icon files (`app-icon.png`, `pwa-192x192.png`, `pwa-512x512.png`) will use the new orange Collab Hunts logo
- Hard-refresh or clear cache to see the updated loading screen
