

## Fix: Make Bottom Navigation Sticky and Global for Native App

### Problem
The bottom navigation bar (`MobileBottomNav`) is currently rendered **only inside** `CreatorDashboard.tsx`. This causes two issues:
1. When navigating to other pages like `/opportunities`, the bottom nav disappears entirely.
2. On long pages, you have to scroll down to find the menu.

### Solution
Move the `MobileBottomNav` out of `CreatorDashboard` and into the **global native app layout** in `App.tsx`, so it appears on every native screen and stays fixed at the bottom of the viewport at all times.

### Technical Details

**File: `src/App.tsx`**
- Import `MobileBottomNav` and add it inside `NativeAppRoutes`, rendered **outside** the `<Routes>` block so it persists across all pages.
- Use a wrapper component with navigation logic so tapping tabs navigates to the correct route/tab.

**File: `src/pages/CreatorDashboard.tsx`**
- Remove the `MobileBottomNav` rendering from this page (it will now come from the global layout).
- Keep the `pb-20` padding so content doesn't hide behind the nav.

**File: `src/pages/Opportunities.tsx`**
- Add `pb-20` bottom padding when on native so content isn't hidden behind the fixed nav.

**File: `src/components/mobile/MobileBottomNav.tsx`**
- The component already has `fixed bottom-0` positioning, so no changes needed to its core styling. It will work correctly once placed at the app level.

**New wrapper in `NativeAppRoutes`:**
```text
NativeAppRoutes
  NativeAppGate
    <div>
      <Routes>...</Routes>
      <MobileBottomNav />   <-- always visible, fixed at bottom
    </div>
  NativeAppGate
```

The nav tabs will map to routes:
- Overview, Campaigns, Bookings, Messages, Profile --> `/creator-dashboard?tab=X`
- This keeps the current tab-based navigation working seamlessly.

