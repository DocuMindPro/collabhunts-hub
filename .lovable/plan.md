

# Mobile App Finalization Plan

This plan covers all remaining tasks to bring the CollabHunts creator mobile app to production-ready status.

---

## Current Status (Completed)

| Component | Status |
|-----------|--------|
| Capacitor Configuration | Done |
| Device Tokens Table | Done |
| Push Notification Edge Function | Done |
| Database Trigger for Auto-Push | Done |
| Frontend Push Hook Integration | Done |
| Firebase Secrets | Configured |

---

## Remaining Tasks

### 1. Mobile Bottom Navigation Bar

Replace the horizontal scrolling tab bar on mobile devices with a native-style fixed bottom navigation bar. This provides a more familiar mobile app experience.

**What will be created:**
- New `MobileBottomNav` component with icons for Overview, Campaigns, Bookings, Messages, and Profile
- Badge indicators for unread messages and pending bookings
- Smooth transitions when switching tabs
- Auto-hide behavior when scrolling (optional)

**Files to create/modify:**
- Create `src/components/mobile/MobileBottomNav.tsx`
- Modify `src/pages/CreatorDashboard.tsx` to conditionally render bottom nav on native platforms

---

### 2. Mobile-Optimized Chat Experience

Enhance the MessagesTab for a better mobile experience with proper keyboard handling and full-screen chat views.

**Improvements:**
- Full-screen chat mode on mobile (hide header when keyboard is active)
- Keyboard-aware input positioning using Capacitor Keyboard plugin events
- Smooth scroll to bottom when new messages arrive
- Safe area padding for devices with notches

**Files to modify:**
- `src/components/creator-dashboard/MessagesTab.tsx`
- Create `src/hooks/useKeyboardHeight.ts` for keyboard-aware layouts

---

### 3. Mobile Login Flow Optimization

Create a streamlined login experience optimized for the mobile app context.

**Enhancements:**
- Hide Navbar on mobile native platforms for cleaner login UI
- Add "Remember me" option with secure token storage
- Biometric authentication option (Face ID / Fingerprint)
- Auto-redirect to creator dashboard after successful login

**Files to modify:**
- `src/pages/Login.tsx`

---

### 4. App Asset Generation

Prepare required assets for app store submissions.

**Assets needed:**
- App icon (1024x1024 for iOS, adaptive icon for Android)
- Splash screen images (multiple sizes)
- Store screenshots (iPhone 6.5", 5.5", iPad, Android phone/tablet)

**Files to create:**
- `public/assets/app-icon.png`
- `public/assets/splash.png`
- Documentation for asset requirements

---

### 5. Native Platform Configuration

Finalize platform-specific settings for production builds.

**iOS Configuration:**
- Info.plist settings (camera, push notification permissions)
- App Transport Security settings
- Push notification entitlements

**Android Configuration:**
- google-services.json placement
- AndroidManifest.xml permissions
- ProGuard rules for production builds

---

## Implementation Order

```text
Step 1: Mobile Bottom Navigation
   |
   v
Step 2: Chat Optimization
   |
   v
Step 3: Login Flow
   |
   v
Step 4: App Assets
   |
   v
Step 5: Native Config Documentation
```

---

## Technical Details

### Bottom Navigation Component Structure

```text
src/components/mobile/
├── MobileBottomNav.tsx      # Main navigation component
├── MobileTabButton.tsx      # Individual tab button with badge
└── useMobileNavigation.ts   # Hook for navigation state
```

### Keyboard Handling Approach

The Capacitor Keyboard plugin will be used to:
1. Listen for `keyboardWillShow` and `keyboardWillHide` events
2. Dynamically adjust input container padding
3. Ensure message input stays visible above keyboard

### Conditional Rendering Strategy

Native vs web detection will use:
```typescript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
```

This allows showing:
- Bottom nav bar only on native mobile apps
- Top tab bar on web browsers

---

## Testing Checklist

After implementation, verify:

- [ ] Bottom navigation appears on native builds
- [ ] Tab switching works correctly with URL sync
- [ ] Unread message badge updates in real-time
- [ ] Keyboard pushes chat input up (not covers it)
- [ ] Messages scroll to bottom on new arrival
- [ ] Push notification taps navigate to correct tab
- [ ] Login works on mobile with proper redirects
- [ ] App icons display correctly on home screen

---

## Estimated Effort

| Task | Complexity | Time |
|------|------------|------|
| Bottom Navigation | Medium | 30-45 min |
| Chat Optimization | Medium | 30-45 min |
| Login Flow | Low | 15-20 min |
| App Assets | Low | Documentation only |
| Native Config | Low | Documentation only |

**Total: ~2 hours of implementation**

---

## Next Steps After Approval

1. Create the mobile bottom navigation component
2. Integrate it into the Creator Dashboard
3. Optimize the chat/messages experience for mobile
4. Provide documentation for local testing and app store submission

