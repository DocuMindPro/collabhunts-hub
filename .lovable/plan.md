

## Native iOS App Experience Upgrade

### 1. New "Account" Tab (replaces "Profile" in bottom nav)

The current bottom nav has 8 tabs with "Profile" at the end. We'll replace "Profile" with "Account" and restructure:

- **Bottom nav tabs** (8 items, unchanged count): Overview, Bookings, Packages, Calendar, Opps, Messages, Boost, **Account**
- The **Account tab** will be a new dedicated screen containing:
  - **Profile header** (avatar, name, status badge)
  - **Quick links**: "View My Profile" (opens profile preview), "Edit Profile" (opens edit drawer)
  - **Quick Settings** cards (moved from current ProfileTab): Open to Invitations, Show Pricing, Allow Mass Messages
  - **Account section**: Email display, phone verification status
  - **Sign Out button** (prominent, at the bottom)
  - **Switch to Brand** option (if user has a brand profile)
  - App version info at the very bottom

### 2. Dashboard Overview Improvements

- Add **Quick Action buttons** row below stats: "Edit Profile", "Add Package", "Browse Opps"
- Add a **Recent Activity** section showing latest booking status changes and new messages
- Animate stat cards with fade-in on load

### 3. Messages Experience Polish

- Add **pull-to-refresh** style manual refresh button at the top of conversation list
- Improve empty state with better illustration
- Add subtle **animate-fade-in** to conversation items on load
- Fix the "0" badge display (should not show "0", only show when count > 0 -- already handled but double-check alignment)

### 4. Visual Polish

- Add `animate-fade-in` class to tab content transitions
- Smoother loading states with skeleton placeholders instead of spinners
- Ensure consistent card border radius and spacing across all tabs

### Technical Details

**Files to create:**
- `src/components/creator-dashboard/AccountTab.tsx` -- New account/settings tab with sign-out

**Files to modify:**
- `src/components/mobile/MobileBottomNav.tsx` -- Replace "Profile" tab with "Account" (icon: Settings or UserCog)
- `src/App.tsx` -- Update `CreatorBottomNavWrapper` to include "account" in dashboard tabs list
- `src/pages/CreatorDashboard.tsx` -- Add AccountTab import, add TabsContent for "account", keep "profile" tab for web only
- `src/components/creator-dashboard/OverviewTab.tsx` -- Add quick actions row and recent activity section with fade animations
- `src/components/creator-dashboard/MessagesTab.tsx` -- Add refresh button, fade-in animations on conversation items

**Sign-out implementation:**
- The AccountTab will call `supabase.auth.signOut()` which triggers the `SIGNED_OUT` event in `NativeAppGate`, resetting state and showing the login screen automatically.

**No database changes required** -- this is purely a UI/UX restructure.
