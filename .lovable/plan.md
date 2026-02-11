

## Rebrand: Change App Name to "Collab Hunts" and Update Native App Icons

### What Will Change

**1. App Name** -- Update "CollabHunts" to "Collab Hunts" (with a space) everywhere it appears as a display name across the app.

**2. Native App Icon/Splash** -- Copy your uploaded logo to the project so it can be used as the PWA icon and in loading screens. The actual native Android icons (inside the `android/` folder) need to be regenerated on your machine using `npx capacitor-assets generate` after you place the logo source files.

### Technical Details

**Files to update for the name change (CollabHunts -> Collab Hunts):**

| File | What Changes |
|------|-------------|
| `capacitor.config.ts` | `appName: 'Collab Hunts'` |
| `public/manifest.json` | `name` and `short_name` fields |
| `index.html` | Title, meta tags, and pre-React loader text |
| `src/components/Logo.tsx` | Fallback text (3 occurrences) |
| `src/components/PageLoader.tsx` | Brand name text |
| `src/components/NativeLoadingScreen.tsx` | Brand name text |
| `src/pages/Download.tsx` | Page heading text |

Note: Legal pages (Terms, Privacy, etc.) and detailed descriptions will keep the current wording since those are formal documents -- we'll only update user-facing UI branding.

**For the logo/icon:**

| File | What Changes |
|------|-------------|
| `public/app-icon.png` | Copy the uploaded logo image here |
| `public/pwa-192x192.png` | Will still be used for PWA (can be updated later with properly sized versions) |
| `src/components/NativeLoadingScreen.tsx` | Show the logo image instead of the camera emoji |
| `src/components/PageLoader.tsx` | Show the logo image instead of the camera emoji |
| `index.html` | Update pre-React loader to show the logo image instead of the camera emoji |

**After these changes, on your local machine you should:**
1. Place a 1024x1024 version of the logo in `assets/icon-only.png`
2. Run `npx capacitor-assets generate` to create all Android/iOS icon sizes
3. Run `npx cap sync android` to apply changes to the native project
