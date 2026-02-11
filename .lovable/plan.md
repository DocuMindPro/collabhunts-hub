

## Add Lightweight Brand Mode to the Native App

### Overview

Transform the native mobile app from creator-only to a dual-role app. After login, users choose whether they're a **Creator** or a **Brand**. Brands get a focused mobile experience with **Messages, Bookings, Notifications, and Creator Search** -- the essentials for small business owners managing collaborations from their phone.

### How It Will Work

1. **Login Screen** -- stays the same (email + password)
2. **After login, the app checks** what profiles the user has (creator, brand, or both)
3. **Role Selection** -- if the user has both profiles, they see a simple "Continue as Creator" / "Continue as Brand" screen. If they only have one, they go straight in
4. **If no profile exists** -- they see options to either start Creator onboarding (existing flow) or get directed to register as a brand on the website
5. **Brand Mode** shows 4 tabs in the bottom nav: Messages, Bookings, Notifications, and Search Creators

### User Flow

```text
Login
  |
  v
Check Profiles
  |
  +-- Only Creator --> Creator Dashboard (existing)
  |
  +-- Only Brand --> Brand Dashboard (new native)
  |
  +-- Both --> Role Picker Screen
  |               |
  |               +-- "Creator" --> Creator Dashboard
  |               +-- "Brand" --> Brand Dashboard
  |
  +-- Neither --> Role Picker with onboarding options
```

### Files to Create

1. **`src/components/NativeRolePicker.tsx`**
   - Simple screen with the app logo, two large cards: "I'm a Creator" and "I'm a Brand / Venue"
   - If user has both profiles, both are tappable
   - If user has neither, show "Create Creator Profile" (opens onboarding) and "Register as Brand" (shows message to visit website)
   - Stores selected role in local state (passed up to NativeAppGate)

2. **`src/components/mobile/BrandBottomNav.tsx`**
   - 4 tabs: Messages, Bookings, Notifications, Search
   - Same styling pattern as `MobileBottomNav.tsx`
   - Badge counts for unread messages and pending bookings (using `safeNativeAsync`)

3. **`src/pages/NativeBrandDashboard.tsx`**
   - Lightweight wrapper that renders the active tab content
   - Header with brand name and a "Switch to Creator" / "Sign Out" menu
   - Tabs: Messages (reuses `BrandMessagesTab`), Bookings (reuses `BrandBookingsTab`), Notifications (notification list), Search (simplified creator search)

4. **`src/components/mobile/NativeBrandNotifications.tsx`**
   - Mobile-optimized notification list using the existing `useNotifications` hook
   - Full-screen list instead of dropdown menu
   - Tap to navigate to relevant section

5. **`src/components/mobile/NativeBrandSearch.tsx`**
   - Simplified version of the Influencers page for native
   - Search bar + creator cards with key info (name, photo, categories, rating)
   - Tap to view creator profile (existing `/creator/:id` route)
   - No Navbar/Footer (native app style)

### Files to Modify

1. **`src/components/NativeAppGate.tsx`**
   - Add `brandProfile` state alongside `creatorProfile`
   - Check for both `creator_profiles` and `brand_profiles` after login
   - New state: `selectedRole` ("creator" | "brand" | null)
   - If both profiles exist and no role selected: show `NativeRolePicker`
   - If only creator: proceed as today
   - If only brand: render brand routes
   - If neither: show `NativeRolePicker` with onboarding options

2. **`src/App.tsx`**
   - Add brand routes inside `NativeAppRoutes`: `/brand-dashboard`, `/influencers` (for search)
   - Conditionally render `BrandBottomNav` or `MobileBottomNav` based on selected role (passed via context or props)
   - Add `NativeBrandDashboard` import

3. **`src/pages/NativeLogin.tsx`**
   - Change subtitle from "Creators" to "Creators & Brands" to reflect dual-role support

4. **`src/components/mobile/MobileBottomNav.tsx`**
   - No structural changes, but will only render when role is "creator"

### Technical Considerations

- All new Supabase calls in brand mode will use `safeNativeAsync` with 5-second timeouts (matching the existing native resilience pattern)
- Realtime subscriptions are skipped on native (existing pattern) -- badge counts use polling or manual refresh
- The `BrandRegistrationContext` will be provided by `NativeBrandDashboard` since brands in the app are already registered
- Creator search on native will skip Navbar/Footer and use a clean mobile layout
- Role selection is stored in component state (resets on app restart, so user picks again -- simple and stateless)

### What Brands Will See

- **Messages Tab**: Full chat interface with creators (reusing existing `BrandMessagesTab`)
- **Bookings Tab**: List of bookings with status, dates, creator info (reusing existing `BrandBookingsTab`)
- **Notifications Tab**: Full-screen notification list with unread badges
- **Search Tab**: Browse and discover creators with search/filter, tap to view profiles

