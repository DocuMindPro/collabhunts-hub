

## Smart App Download Banner + App-Exclusive Feature Highlights

This plan adds two features: a non-intrusive smart banner on the mobile web experience encouraging app downloads, and visible "app-exclusive" badges/messaging throughout the web to incentivize installs.

---

### 1. Smart App Download Banner Component

**New file: `src/components/SmartAppBanner.tsx`**

A sticky banner that appears at the top of the page on **mobile web browsers only** (not on desktop, not inside the native app). It will:

- Show the app icon, app name ("Collab Hunts"), a short tagline, and a "Get the App" button linking to `/download`
- Be dismissible with an X button (stores dismissal in localStorage for 7 days so it does not annoy users)
- Only render when: viewport is mobile (`useIsMobile`), NOT a native Capacitor platform, and not already dismissed
- Styled as a compact top bar (similar to iOS/Android smart banners) with the app's orange brand color

**Layout:**
```
[App Icon] Collab Hunts          [Get the App] [X]
           Better on the app
```

### 2. Add Banner to App Layout

**File: `src/App.tsx`**

- Import and render `SmartAppBanner` inside the web routes section, above the page content (only for `!isNativePlatform`)

### 3. App-Exclusive Feature Highlights on Web

**File: `src/pages/Download.tsx`**

Update the "Why Use the App?" benefits section to emphasize exclusive features:

- Replace generic benefits with specific app-exclusive perks:
  - **Instant Push Notifications**: "Get notified instantly when you receive new bookings, messages, or opportunity matches -- only on the app"
  - **Real-Time Messaging**: "Faster, smoother chat experience with typing indicators and instant delivery"
  - **Offline Access**: "Browse creator profiles and manage your dashboard even without internet"
  - **One-Tap Actions**: "Accept bookings, respond to messages, and manage your profile with quick native controls"
- Add an "App Exclusive" badge/label next to push notifications and real-time messaging features

### 4. App-Exclusive Badges in Dashboard (Web)

**Files: `src/components/creator-dashboard/MessagesTab.tsx` and `src/components/brand-dashboard/BrandMessagesTab.tsx`**

- Add a small subtle banner at the top of the messages tab on mobile web: "Get instant message notifications on the app" with a link to `/download`. This only shows on mobile web (not desktop, not native).

---

### Technical Details

**SmartAppBanner component logic:**
```typescript
// Only show on mobile web
const isMobile = useIsMobile();
const isNative = Capacitor.isNativePlatform();
const [dismissed, setDismissed] = useState(false);

useEffect(() => {
  const dismissedAt = localStorage.getItem('app_banner_dismissed');
  if (dismissedAt) {
    const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (days < 7) setDismissed(true);
  }
}, []);

if (!isMobile || isNative || dismissed) return null;
```

**Files to create:**
1. `src/components/SmartAppBanner.tsx` -- New smart banner component

**Files to modify:**
1. `src/App.tsx` -- Add SmartAppBanner to web routes
2. `src/pages/Download.tsx` -- Update benefits with app-exclusive highlights
3. `src/components/creator-dashboard/MessagesTab.tsx` -- Add "get the app" nudge on mobile web
4. `src/components/brand-dashboard/BrandMessagesTab.tsx` -- Add "get the app" nudge on mobile web
