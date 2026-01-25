# Mobile App Assets & Configuration Guide

This document provides instructions for generating and configuring the required assets for the CollabHunts mobile app.

## Required App Assets

### App Icon

**iOS Requirements:**
- 1024x1024px (App Store)
- 180x180px (iPhone @3x)
- 120x120px (iPhone @2x)
- 167x167px (iPad Pro)
- 152x152px (iPad)
- 76x76px (iPad @1x)

**Android Requirements:**
- 512x512px (Play Store)
- 192x192px (xxxhdpi)
- 144x144px (xxhdpi)
- 96x96px (xhdpi)
- 72x72px (hdpi)
- 48x48px (mdpi)
- Adaptive icon with separate foreground and background layers

**Icon Guidelines:**
- No transparency on iOS
- Simple, recognizable design
- Avoid text (won't be readable at small sizes)
- Test at 29x29px to ensure clarity

### Splash Screen

**iOS Requirements:**
- 2732x2732px (universal, will be scaled)
- Or use Storyboard-based splash screen

**Android Requirements:**
- 1080x1920px (xxhdpi portrait)
- 1920x1080px (xxhdpi landscape)
- Centered logo with solid background

**Splash Screen Guidelines:**
- Keep logo centered and appropriately sized
- Use brand colors for background
- Avoid complex gradients or shadows
- Test on various device sizes

---

## Generating Assets with Capacitor

After creating your source images, use the Capacitor assets tool:

```bash
# Install the assets tool
npm install @capacitor/assets --save-dev

# Generate all assets from source
npx capacitor-assets generate
```

**Source Image Locations:**
- `assets/icon-only.png` - 1024x1024 app icon
- `assets/icon-foreground.png` - 1024x1024 foreground (Android adaptive)
- `assets/icon-background.png` - 1024x1024 background (Android adaptive)
- `assets/splash.png` - 2732x2732 splash screen
- `assets/splash-dark.png` - 2732x2732 dark mode splash (optional)

---

## iOS Configuration (Info.plist)

After running `npx cap add ios`, update `ios/App/App/Info.plist`:

```xml
<!-- Push Notifications -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>

<!-- Camera Access (if needed) -->
<key>NSCameraUsageDescription</key>
<string>CollabHunts needs camera access to take profile photos</string>

<!-- Photo Library Access -->
<key>NSPhotoLibraryUsageDescription</key>
<string>CollabHunts needs photo library access to upload images</string>

<!-- Face ID (for biometric auth) -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to quickly sign in to your account</string>
```

### Push Notification Entitlements

Update `ios/App/App/App.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>development</string>
</dict>
</plist>
```

For production, change `development` to `production`.

---

## Android Configuration

### AndroidManifest.xml Permissions

After running `npx cap add android`, verify `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Already included by Capacitor, but verify: -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- For push notifications -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />

<!-- For camera (if needed) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add an Android app with package name: `app.lovable.f0d3858ae7f2489288d232504acaef78`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

---

## App Store Submission Checklist

### iOS App Store

- [ ] App icon (all sizes)
- [ ] Screenshots (6.5", 5.5", iPad Pro)
- [ ] App name and subtitle
- [ ] Description and keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] App Preview video (optional)
- [ ] Age rating questionnaire
- [ ] App Privacy details

### Google Play Store

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone and tablet)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL
- [ ] Target audience
- [ ] Content rating questionnaire
- [ ] Data safety form

---

## Testing Push Notifications

### iOS Simulator
Push notifications don't work on iOS Simulator. Use a physical device.

### Android Emulator
1. Use a system image with Google Play Services
2. Sign in with a Google account
3. Notifications should work

### Physical Device Testing
1. Build and run on device: `npx cap run ios` or `npx cap run android`
2. Grant notification permissions when prompted
3. Create a test notification in the database to trigger the edge function

---

## Building for Production

### iOS

```bash
# Sync and open in Xcode
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device" as build target
# 2. Product > Archive
# 3. Distribute App > App Store Connect
```

### Android

```bash
# Sync project
npx cap sync android

# Build release APK
cd android
./gradlew assembleRelease

# Or build release AAB for Play Store
./gradlew bundleRelease
```

---

## Troubleshooting

### Common Issues

**Push notifications not working:**
- Verify Firebase secrets are configured in Lovable Cloud
- Check device token is saved in `device_tokens` table
- Review edge function logs for errors

**App crashes on launch:**
- Check `npx cap sync` was run after latest changes
- Verify capacitor.config.ts has correct server URL
- Check for console errors in Xcode/Android Studio

**Hot reload not working:**
- Ensure device is on same network as development machine
- Verify server URL in capacitor.config.ts points to preview URL
- Check firewall settings

For more help, visit [capacitorjs.com/docs](https://capacitorjs.com/docs)
