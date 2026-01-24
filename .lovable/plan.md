
# Plan: Creator-Only Mobile App with Capacitor

## Overview
Build a native mobile app for iOS and Android targeting creators only, enabling instant push notifications, quick message replies, and earnings tracking. The app wraps the existing responsive web interface using Capacitor while adding native push notification capabilities.

---

## Phase 1: Project Setup and Configuration

### 1.1 Install Capacitor Dependencies
Add required packages to the project:
- `@capacitor/core` - Core Capacitor framework
- `@capacitor/cli` - CLI tools (dev dependency)
- `@capacitor/ios` - iOS platform support
- `@capacitor/android` - Android platform support
- `@capacitor/push-notifications` - Native push notification support
- `@capacitor/splash-screen` - App splash screen
- `@capacitor/status-bar` - Status bar customization
- `@capacitor/app` - App lifecycle events
- `@capacitor/keyboard` - Keyboard handling for mobile

### 1.2 Create Capacitor Configuration
Create `capacitor.config.ts` with:
- **appId**: `app.lovable.f0d3858ae7f2489288d232504acaef78`
- **appName**: `CollabHunts Creators`
- **webDir**: `dist` (Vite build output)
- **server.url**: Points to preview URL for hot-reload during development
- **plugins**: Configure PushNotifications, SplashScreen, StatusBar

### 1.3 Update index.html for Mobile
Add mobile-specific meta tags:
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `theme-color` matching brand colors
- Disable user scaling for native feel

---

## Phase 2: Database Schema Updates

### 2.1 Create Device Tokens Table
New table `device_tokens` to store FCM/APNS tokens:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| token | text | FCM or APNS token |
| platform | text | 'ios' or 'android' |
| created_at | timestamp | Token registration time |
| updated_at | timestamp | Last token update |
| is_active | boolean | Token validity status |

RLS Policies:
- Users can insert/update their own tokens
- Users can delete their own tokens
- No public read access (tokens are sensitive)

### 2.2 Enable Realtime for device_tokens
Add table to Supabase realtime publication for token management.

---

## Phase 3: Push Notification Infrastructure

### 3.1 Create Edge Function: `send-push-notification`
New backend function that:
- Accepts notification type, user_id, title, body, data payload
- Looks up active device tokens for the user
- Sends push via Firebase Cloud Messaging (FCM) HTTP v1 API
- Handles both iOS and Android platforms
- Logs delivery status

Required secrets:
- `FIREBASE_PROJECT_ID` - Firebase project identifier
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `FIREBASE_CLIENT_EMAIL` - Service account email

### 3.2 Create Database Trigger for Push Notifications
Trigger on `notifications` table INSERT that:
- Calls `send-push-notification` edge function
- Passes notification data (title, message, link)
- Only triggers for users with active device tokens

### 3.3 Notification Types to Support
Creator-specific push notifications:
- `creator_new_booking` - New booking request received
- `creator_booking_accepted` - Booking confirmed
- `creator_revision_requested` - Brand requested changes
- `creator_delivery_confirmed` - Deliverable approved
- `creator_dispute_opened` - Dispute notification
- `creator_application_accepted` - Campaign application approved
- `creator_profile_approved` - Profile went live
- `new_message` - New chat message received

---

## Phase 4: Frontend Push Integration

### 4.1 Create Push Notification Hook
New hook `src/hooks/usePushNotifications.ts`:
- Initialize Capacitor PushNotifications plugin
- Request notification permissions on app start
- Register device token with backend
- Handle foreground/background notifications
- Navigate to relevant screen on notification tap
- Handle token refresh events

### 4.2 Create Push Service Utility
New file `src/lib/push-service.ts`:
- `registerPushToken(userId, token, platform)` - Save token to database
- `unregisterPushToken(token)` - Mark token as inactive on logout
- `updatePushToken(oldToken, newToken)` - Handle token refresh

### 4.3 Update App.tsx for Mobile
- Import and initialize push notifications on app mount
- Add listener for notification received events
- Handle deep linking from notification taps
- Detect if running in native context vs web

---

## Phase 5: Mobile-Optimized UI Enhancements

### 5.1 Create Mobile App Shell
New component `src/components/mobile/MobileAppShell.tsx`:
- Bottom navigation bar (native mobile pattern)
- Tab icons: Home, Messages, Campaigns, Earnings, Profile
- Badge indicators for unread counts
- Haptic feedback on tab changes

### 5.2 Update Creator Dashboard for Mobile
Modify `src/pages/CreatorDashboard.tsx`:
- Detect native app context using Capacitor
- Show bottom navigation instead of top tabs when in app
- Use native-style transitions between tabs
- Add pull-to-refresh functionality

### 5.3 Optimize Messages Tab for Mobile
Enhance `src/components/creator-dashboard/MessagesTab.tsx`:
- Full-screen chat view on mobile
- Native keyboard avoiding behavior
- Quick action buttons (quote, accept)
- Message input stays visible above keyboard

### 5.4 Create App-Specific Login Flow
- Skip "Join as Brand" option in mobile app
- Auto-redirect to Creator Dashboard after login
- Show "Continue as Creator" for existing accounts
- Native biometric authentication (future enhancement)

---

## Phase 6: App Assets and Branding

### 6.1 App Icons
Create icon set for both platforms:
- iOS: 1024x1024 master icon (generates all sizes)
- Android: Adaptive icon with foreground/background layers
- Use CollabHunts brand colors (orange gradient)

### 6.2 Splash Screen
- Full-screen splash with CollabHunts logo
- Match brand gradient background
- Smooth transition to app content

### 6.3 App Store Assets
Prepare marketing materials:
- App screenshots (iPhone 14 Pro, Pixel 7)
- Feature graphics
- Short/long descriptions
- Keywords for ASO

---

## Phase 7: App Store Requirements

### 7.1 iOS App Store (Apple)
Requirements:
- Apple Developer Account ($99/year)
- App Store Connect setup
- Privacy Policy URL (already exists at `/privacy`)
- App Review Guidelines compliance
- TestFlight for beta testing

Info.plist additions:
- `NSCameraUsageDescription` - For profile photo upload
- `NSPhotoLibraryUsageDescription` - For portfolio media
- Push notification entitlements

### 7.2 Google Play Store (Android)
Requirements:
- Google Play Developer Account ($25 one-time)
- Google Play Console setup
- Privacy Policy URL
- Content rating questionnaire
- Internal testing track for QA

AndroidManifest.xml additions:
- Camera and storage permissions
- Internet permission (already default)
- Push notification permissions

### 7.3 Firebase Project Setup
Create Firebase project for FCM:
- Enable Cloud Messaging API
- Generate service account credentials
- Configure iOS APNs authentication key
- Add Android app with package name

---

## Phase 8: Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration |
| `src/hooks/usePushNotifications.ts` | Push notification management hook |
| `src/lib/push-service.ts` | Token registration utilities |
| `src/components/mobile/MobileAppShell.tsx` | Bottom navigation shell |
| `src/components/mobile/MobileNavBar.tsx` | Bottom tab bar component |
| `supabase/functions/send-push-notification/index.ts` | Push delivery edge function |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Add Capacitor dependencies |
| `index.html` | Add mobile meta tags |
| `src/App.tsx` | Initialize push notifications, detect native context |
| `src/pages/CreatorDashboard.tsx` | Add mobile app shell wrapper |
| `src/components/creator-dashboard/MessagesTab.tsx` | Mobile keyboard handling |
| `src/pages/Login.tsx` | Simplify for creator-only flow in app |

### Database Migration
- Create `device_tokens` table
- Add RLS policies
- Create notification trigger

---

## Phase 9: Development Workflow

### Local Development
1. Run `npm run dev` for web preview
2. Use Capacitor live reload pointing to dev server
3. Test on iOS Simulator / Android Emulator

### Building for Testing
1. Export to GitHub repository
2. Clone locally and run `npm install`
3. Run `npx cap add ios` and `npx cap add android`
4. Run `npm run build` then `npx cap sync`
5. Open in Xcode/Android Studio for testing

### Release Process
1. Increment version in `capacitor.config.ts`
2. Build production web assets
3. Sync to native platforms
4. Build and archive in Xcode for iOS
5. Build signed APK/AAB for Android
6. Submit to respective app stores

---

## Phase 10: Testing Checklist

### Functionality Tests
- [ ] Push notification registration works
- [ ] Notifications received when app backgrounded
- [ ] Notifications received when app foregrounded
- [ ] Tapping notification navigates correctly
- [ ] Login/logout flow works
- [ ] Messages send and receive in real-time
- [ ] Profile editing works with image upload
- [ ] Campaigns tab shows and allows applications
- [ ] Earnings/payouts display correctly

### Device Tests
- [ ] iPhone (iOS 15+)
- [ ] iPad compatibility mode
- [ ] Android phone (API 24+)
- [ ] Android tablet
- [ ] Different screen sizes
- [ ] Dark mode support

### Edge Cases
- [ ] No internet connection handling
- [ ] Push token refresh
- [ ] Multiple device registration
- [ ] App update handling
- [ ] Deep link handling

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Setup | 2-3 hours | None |
| Phase 2: Database | 1 hour | Phase 1 |
| Phase 3: Push Backend | 3-4 hours | Phase 2 + Firebase setup |
| Phase 4: Push Frontend | 2-3 hours | Phase 3 |
| Phase 5: Mobile UI | 4-5 hours | Phase 1 |
| Phase 6: Assets | 2-3 hours | Can run parallel |
| Phase 7: Store Setup | 2-3 hours | Needs dev accounts |
| Phase 8-10: Build/Test | 4-5 hours | All previous phases |

**Total Estimated Time: 4-6 weeks** (including app store review times)

---

## Next Steps After Approval

1. Install Capacitor dependencies and create configuration
2. Set up Firebase project for push notifications
3. Create database migration for device tokens
4. Build the push notification edge function
5. Create the mobile push hook and service
6. Build the mobile app shell with bottom navigation
7. Test on simulators/emulators
8. Prepare app store assets
9. Submit for app store review
