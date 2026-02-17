
## Native App Polish: Logo Fix + Safe Area + Simplified Navigation + Creator UX

### Problem 1: Logo Flickering (CH → Real Logo)

The `NativeAppLogo` component has no loading state. On render it immediately shows the "CH" orange box fallback while the DB fetch runs. When the fetch completes (~300ms later), it swaps to the real logo image. This creates the visible "CH → Collab Hunts" flicker the user sees.

**Fix**: Add a `fetched` boolean state to `NativeAppLogo`. While fetching, render an invisible placeholder (same size, transparent). Only render the logo once the fetch resolves — either real URL or "CH" fallback. This eliminates the swap entirely.

File: `src/components/NativeAppLogo.tsx`

---

### Problem 2: "Dashboard" Text Overlapping iPhone Status Bar

The `CreatorDashboard` page has `py-4` top padding on native but no `safe-area-top` inset. On iPhone with a notch/Dynamic Island, the status bar sits ~44-59px tall. The "Dashboard" heading renders right below `py-4` (16px), which puts it under the iPhone clock/icons.

**Fix**: Wrap the native header `<main>` with `safe-area-top` class so it respects `env(safe-area-inset-top)`. This pushes the content below the status bar automatically.

File: `src/pages/CreatorDashboard.tsx`

---

### Problem 3: Bottom Nav Has 8 Cramped Tabs

8 tabs with `min-w-[56px]` = 448px minimum content on a 390px screen — they're squeezed and labels are barely readable. This is too many items for a thumb-friendly bottom nav.

**Solution**: Reduce from 8 to 5 tabs:
- **Keep**: Overview, Messages, Bookings, Opportunities, Account
- **Remove from nav**: Calendar (accessible from Bookings), Packages (accessible from Account/Overview quick actions), Boost (accessible from Account or Overview)

These 3 removed tabs are still accessible via the dashboard — they just won't clutter the bottom nav. The 5 remaining tabs get proper `flex-1` spacing and more breathing room.

File: `src/components/mobile/MobileBottomNav.tsx`

---

### Problem 4: Tab Content Scrolling Issue

The `window.scrollTo({ top: 0, behavior: 'instant' })` fires when `activeTab` changes but React may not have rendered the new tab content yet, so the DOM hasn't changed height when the scroll fires. The scroll to 0 works, but then if the previous tab's content briefly renders (Radix Tabs animation), it can appear mid-page.

**Fix**: Use a `setTimeout(fn, 0)` to defer the scroll to after React paints the new tab content.

File: `src/pages/CreatorDashboard.tsx`

---

### Problem 5: Creator Overview Tab — No Personalized Welcome

The native header just says "Dashboard" with no user name. Creators feel like they're using a generic tool, not a personalized platform.

**Fix**: Replace "Dashboard" heading with a personalized greeting like "Hi, [Name] 👋" fetched from the creator profile. This is already fetched in `OverviewTab` but not surfaced at the page level. We'll add a `userName` state to `CreatorDashboard` and populate it alongside the profile fetch.

File: `src/pages/CreatorDashboard.tsx`

---

### Problem 6: Creator Overview Tab — Quick Actions Don't Match New Navigation

With the simplified bottom nav (Packages moved out), creators need a clear path to manage their packages from Overview. The Quick Actions row should prominently include "My Packages" and "Boost Profile".

File: `src/components/creator-dashboard/OverviewTab.tsx`

---

### Summary of File Changes

| File | Change |
|---|---|
| `src/components/NativeAppLogo.tsx` | Add `fetched` state — show blank placeholder while loading, then show real logo or "CH" fallback. No more flicker. |
| `src/pages/CreatorDashboard.tsx` | Add `safe-area-top` to native header wrapper; personalized greeting ("Hi, [Name]"); deferred scroll-to-top with `setTimeout`. |
| `src/components/mobile/MobileBottomNav.tsx` | Reduce from 8 to 5 tabs: Overview, Messages, Bookings, Opps, Account. Remove Calendar, Packages, Boost from nav (still accessible via dashboard routing). |
| `src/components/creator-dashboard/OverviewTab.tsx` | Update Quick Actions to include Packages and Boost now that they're removed from bottom nav. |

**No database changes required.**
