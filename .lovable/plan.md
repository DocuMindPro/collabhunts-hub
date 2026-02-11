

## Fix: Consolidate Two Menus Into One Sticky Bottom Navigation

### Problem
On the native app, there are two separate navigation menus:
- A **bottom bar** with 5 tabs (Overview, Bookings, Opps, Messages, Profile)
- A **top bar** with 3 tabs (Packages, Calendar, Boost)

This is confusing and wastes screen space.

### Solution
Merge all 8 navigation items into a **single sticky bottom navigation bar**. The top tab strip will be completely removed on native. The bottom nav will include all tabs with a horizontally scrollable layout so everything fits.

### What Will Change

| File | Change |
|------|--------|
| `src/components/mobile/MobileBottomNav.tsx` | Add the 3 missing tabs (Packages, Calendar, Boost) to the bottom nav tabs list, making it 8 total. Make the bar horizontally scrollable to fit all items. |
| `src/pages/CreatorDashboard.tsx` | Remove the top `TabsList` entirely when on native (`isNative`), since all navigation now lives in the bottom bar. |
| `src/App.tsx` | Update the `NativeBottomNavWrapper` to recognize the new tab IDs (`services`, `calendar`, `boost`) and route them to the creator dashboard. |

### Navigation After Fix
One single sticky bottom bar with all tabs:
**Overview | Bookings | Packages | Calendar | Opps | Messages | Boost | Profile**

The bar stays fixed at the bottom of the screen at all times, no matter how far you scroll.
