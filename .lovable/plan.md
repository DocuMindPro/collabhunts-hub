

# Fix: Creator Dashboard Components Hanging on Android

## Problem Summary

The app gets past the `NativeAppGate` authentication successfully (login works), but then the screen goes completely white because:

1. **`CreatorDashboard`** renders successfully
2. **`OverviewTab`** starts making 4+ Supabase calls **without timeout protection** - hangs
3. **`MobileBottomNav`** starts making 5+ Supabase calls **without timeout protection** - hangs
4. **Realtime subscriptions** in `MobileBottomNav` may also hang

When these calls hang, the entire JavaScript thread blocks, which:
- Prevents the UI from rendering
- Makes the debug button unclickable (even though it's visible, JavaScript can't process the click)
- Creates the "frozen white screen" effect

## Root Cause

The timeout protection pattern was only applied to `NativeAppGate`, but the dashboard components still use raw Supabase calls:

```typescript
// OverviewTab.tsx - No timeout protection!
const { data: { user } } = await supabase.auth.getUser(); // HANGS
const { data: profile } = await supabase.from("creator_profiles")... // HANGS
```

```typescript
// MobileBottomNav.tsx - No timeout protection!
const { data: { user } } = await supabase.auth.getUser(); // HANGS
const { data: profile } = await supabase.from("creator_profiles")... // HANGS
// Plus realtime channel subscriptions that may fail silently
```

## Solution Strategy

Apply the same timeout protection pattern to ALL components that make Supabase calls on native platforms:

1. **Wrap all Supabase calls** in `safeNativeAsync()` with 5-second timeouts
2. **Skip realtime subscriptions** on native platforms (they cause crashes/hangs)
3. **Render UI immediately** with default/empty data, then populate when data arrives
4. **Add timeout-protected data fetching** in OverviewTab

---

## Implementation Details

### File 1: `src/components/mobile/MobileBottomNav.tsx`

**Changes:**
1. Import `safeNativeAsync` and `isNativePlatform`
2. Skip realtime subscriptions on native (they hang/crash)
3. Wrap `fetchBadgeCounts` in timeout protection
4. Show badges without waiting for data (just render 0 initially)

```typescript
import { safeNativeAsync, isNativePlatform } from '@/lib/supabase-native';

useEffect(() => {
  fetchBadgeCounts();
  
  // Skip realtime on native - it causes hangs
  if (isNativePlatform()) {
    return;
  }
  
  // Web only: set up realtime subscriptions
  const messagesChannel = supabase.channel(...)...
}, []);

const fetchBadgeCounts = async () => {
  const result = await safeNativeAsync(
    async () => {
      // ... existing fetch logic
      return { unread, pending };
    },
    { unread: 0, pending: 0 }, // fallback
    5000 // timeout
  );
  setUnreadMessages(result.unread);
  setPendingBookings(result.pending);
};
```

### File 2: `src/components/creator-dashboard/OverviewTab.tsx`

**Changes:**
1. Import `safeNativeAsync`
2. Wrap `fetchDashboardStats` in timeout protection
3. Set loading to false with default data on timeout (prevents infinite loading state)

```typescript
import { safeNativeAsync } from '@/lib/supabase-native';

const fetchDashboardStats = async () => {
  const result = await safeNativeAsync(
    async () => {
      // ... existing fetch logic
      return { profileViews, totalEarnings, ... };
    },
    // fallback with default stats
    { 
      profileViews: 0, 
      totalEarnings: 0, 
      pendingBookings: 0, 
      unreadMessages: 0, 
      profileStatus: "pending" 
    },
    8000 // slightly longer timeout for dashboard
  );
  
  setStats(result);
  setLoading(false);
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/mobile/MobileBottomNav.tsx` | Add timeout protection, skip realtime on native |
| `src/components/creator-dashboard/OverviewTab.tsx` | Add timeout protection to stats fetching |

---

## Technical Details

### Why Realtime Hangs on Native
Supabase Realtime uses WebSocket connections that may fail to establish properly in Android WebView, causing:
- Silent connection failures
- Retry loops that block the main thread
- Memory leaks from uncleared subscriptions

### The Safe Approach
1. **Skip Realtime on Native** - Badge counts will still work, just won't auto-update
2. **Manual refresh** - Users can pull-to-refresh or navigate away and back
3. **Timeout all fetches** - Worst case, data shows 0 but UI is responsive

### Why Debug Button Doesn't Work
When JavaScript hangs on a synchronous-looking async operation (like a fetch that never resolves), the event loop is blocked. Click events queue up but never process. The button is visible (CSS renders) but unresponsive (JS frozen).

---

## Expected Result

After implementation:
1. Login successfully
2. Dashboard appears within 5-8 seconds (even if network is slow)
3. Stats show 0 initially, populate if data loads
4. Bottom navigation is visible and clickable
5. Debug button works (can navigate to /debug)
6. No more frozen white screens

---

## Testing Steps

1. Rebuild APK with changes
2. Clear app data on BlueStacks
3. Open app, log in with creator account
4. Dashboard should appear within 8 seconds
5. All tabs should be navigable
6. Debug button should be clickable

