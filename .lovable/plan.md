

## Fix: Make Native App Feature-Complete for Creators

### Problem
The native app's bottom navigation doesn't match the actual dashboard features available on web. Specifically:
- The "Campaigns" tab in bottom nav links to a tab that **doesn't exist** in the dashboard (no `TabsContent value="campaigns"`)
- Several web tabs are missing from native: **Services/Packages, Calendar, Opportunities, and Boost**
- Creators can't access key features that work fine on the web version

### Solution
Redesign the `MobileBottomNav` to match the web dashboard's actual tabs, ensuring all creator features are accessible on native.

### Bottom Nav Redesign

The web dashboard has 8 tabs. We can't fit all 8 in a bottom nav, so we'll use the most important 5 and make the rest accessible from the dashboard via tab navigation:

**New bottom nav tabs (5 icons):**
1. **Overview** (BarChart3) -- `/creator-dashboard?tab=overview`
2. **Bookings** (Calendar) -- `/creator-dashboard?tab=bookings`  
3. **Opportunities** (Briefcase) -- `/opportunities` page
4. **Messages** (MessageSquare) -- `/creator-dashboard?tab=messages`
5. **Profile** (User) -- `/creator-dashboard?tab=profile`

This removes the non-functional "Campaigns" tab and adds the critical "Opportunities" tab. The remaining tabs (Services, Calendar, Boost) stay accessible via the dashboard's tab strip which is currently hidden on native -- we'll show a simplified horizontal scroll tab bar on native too.

### Technical Details

**File: `src/components/mobile/MobileBottomNav.tsx`**
- Replace "campaigns" tab with "opportunities" tab using the Briefcase icon
- Update the tab config array to match the 5 tabs above

**File: `src/App.tsx` (NativeBottomNavWrapper)**
- Update the `activeTab` logic to correctly detect which tab is active based on current route/params
- The "opportunities" tab maps to the `/opportunities` route (already registered)

**File: `src/pages/CreatorDashboard.tsx`**
- Show a compact horizontal tab strip on native (currently hidden with `{!isNative && ...}`) so creators can access Services, Calendar, Boost, and other sub-tabs
- Use a simplified scrollable row with just the tabs not in the bottom nav: Services, Calendar, Boost
- These render inline in the dashboard content area

### Changes Summary
| File | Change |
|------|--------|
| `src/components/mobile/MobileBottomNav.tsx` | Replace "campaigns" with "opportunities", reorder tabs |
| `src/App.tsx` | Update NativeBottomNavWrapper active tab detection for opportunities |
| `src/pages/CreatorDashboard.tsx` | Show compact tab strip on native for secondary tabs (Services, Calendar, Boost) |

