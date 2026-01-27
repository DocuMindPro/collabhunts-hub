

# QR Code Mobile Testing Solution

Since Android Studio builds are problematic, I'll create a much simpler solution: a dedicated page with a QR code that links directly to your published app. When you scan it on your phone, you can use the app in your mobile browser and even install it to your home screen like a native app.

## What You'll Get

1. **A `/download` page** with a QR code linking to your published app
2. **PWA (Progressive Web App) setup** so the app can be installed to your phone's home screen
3. **Works on both iPhone and Android** - no app store needed
4. **Instant updates** - changes go live immediately without rebuilding

---

## How It Will Work

1. Open the QR code page on your computer
2. Scan with your phone's camera
3. Open the link in your mobile browser
4. Tap "Add to Home Screen" (iOS) or the install prompt (Android)
5. The app icon appears on your home screen and works like a native app

---

## Technical Implementation

### Step 1: Install PWA Plugin
Add `vite-plugin-pwa` to enable installable web app features with offline support.

### Step 2: Create PWA Manifest
Configure app name, icons, theme colors, and display mode for the home screen experience.

### Step 3: Create QR Code Download Page
A new `/download` page featuring:
- Large QR code pointing to `https://collabhunts-hub.lovable.app`
- Instructions for iOS and Android installation
- Direct link button as fallback
- CollabHunts branding

### Step 4: Add PWA Icons
Create properly sized icons for home screen display:
- 192x192 and 512x512 PNG icons
- Apple touch icon for iOS

### Step 5: Update index.html
Add manifest link and additional PWA meta tags.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `vite.config.ts` | Modify | Add vite-plugin-pwa |
| `public/manifest.json` | Create | PWA configuration |
| `src/pages/Download.tsx` | Create | QR code page with install instructions |
| `src/App.tsx` | Modify | Add /download route |
| `index.html` | Modify | Add manifest link |

---

## Benefits Over Native APK

| Feature | Native APK | PWA |
|---------|------------|-----|
| Build complexity | High (Android Studio, Gradle, etc.) | None |
| Update speed | Rebuild + reinstall | Instant |
| iOS support | Separate build needed | Works automatically |
| App store needed | Yes (for distribution) | No |
| Offline support | Yes | Yes (with service worker) |
| Push notifications | Yes | Limited but possible |

---

## After Implementation

1. Go to `https://collabhunts-hub.lovable.app/download` on your computer
2. Scan the QR code with your phone
3. Follow the install prompts on your mobile browser
4. Test the app directly on your phone

This completely bypasses Android Studio and gives you a working mobile app experience within minutes!

