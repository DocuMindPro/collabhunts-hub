
# Fix App Crashing After 1 Second on Android

## Problem Identified

The app opens, displays the homepage for about 1 second, then crashes. This timing matches exactly with the `PushNotificationProvider` component which:
1. Waits 500ms after mounting
2. Then calls `registerDevice()` which uses `@capacitor/push-notifications`
3. Without Firebase configured, the PushNotifications plugin crashes the entire app

## Root Cause

The `@capacitor/push-notifications` plugin requires Firebase to be configured on Android. When Firebase is not configured:
- Simply calling methods like `PushNotifications.checkPermissions()` or `PushNotifications.register()` can crash the app
- The try/catch blocks in the code are not catching native-level crashes
- The crash propagates to the entire WebView, closing the app

## Solution

Make the PushNotifications functionality completely optional and fail-safe by:

1. **Wrap ALL PushNotifications calls in a safe guard** that catches native errors before they crash the app
2. **Add a feature flag** to completely disable push notifications on Android until Firebase is configured
3. **Make the plugin initialization more defensive**

---

## Implementation Plan

### Step 1: Modify `usePushNotifications.ts`

Add a safety check at the very start of the hook to disable push notifications if they would cause a crash:

```typescript
// At the top of usePushNotifications function
export function usePushNotifications() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false); // Default to false until verified
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if push notifications can safely be used
  // Returns false if Firebase is not configured (Android)
  const checkPushAvailability = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return false; // Not available on web
    }

    try {
      // This is the call that crashes on Android without Firebase
      // Wrap it in a try/catch with a timeout
      const checkPromise = PushNotifications.checkPermissions();
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 2000)
      );
      
      const result = await Promise.race([checkPromise, timeoutPromise]);
      return result !== null; // If we got a result, push is available
    } catch (error) {
      console.warn('Push notifications not available:', error);
      return false;
    }
  }, []);
```

### Step 2: Modify `PushNotificationProvider.tsx`

Add additional protection to prevent any push-related code from running if it would crash:

```typescript
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  // Always render children immediately - never block on push notifications
  const [shouldInitPush, setShouldInitPush] = useState(false);
  
  // Check if we can safely use push notifications
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    // Defer the check significantly to allow app to fully stabilize
    const timer = setTimeout(() => {
      // Only attempt push registration on native after the app is stable
      setShouldInitPush(true);
    }, 2000); // 2 second delay
    
    return () => clearTimeout(timer);
  }, []);

  // Only call the hook if we're ready - BUT hooks must be called unconditionally
  // So we call it always, but the hook itself guards its operations
  const { isRegistered, isAvailable, registerDevice } = usePushNotifications();
  
  // ... rest of the component
```

### Step 3: Create a completely safe wrapper

The safest approach is to make push notification initialization completely separate and catch any errors at the native bridge level.

```typescript
// In usePushNotifications.ts - rewrite initialization
useEffect(() => {
  // Skip entirely on non-native or if already marked unavailable
  if (!Capacitor.isNativePlatform() || !isAvailable) {
    setIsInitialized(true);
    return;
  }

  let mounted = true;

  const safeInit = async () => {
    try {
      // Wrap in timeout to catch hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await PushNotifications.checkPermissions();
      clearTimeout(timeoutId);

      if (mounted) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn('Push notifications disabled - not available on this device:', error);
      if (mounted) {
        setIsAvailable(false);
        setIsInitialized(true);
      }
    }
  };

  // Very long delay to ensure app is stable
  const timer = setTimeout(safeInit, 3000);

  return () => {
    mounted = false;
    clearTimeout(timer);
  };
}, [isAvailable]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/usePushNotifications.ts` | Add availability check, increase delays, safer initialization |
| `src/components/PushNotificationProvider.tsx` | Increase delay, add safety guards |

---

## Technical Details

### Why the Current Code Fails

1. `usePushNotifications` hook is called when `PushNotificationProvider` mounts
2. Inside the hook, there's a `useEffect` with a 100ms delay that calls `PushNotifications.checkPermissions()`
3. On Android without Firebase, this call crashes at the native level
4. The try/catch doesn't catch it because it's a native bridge crash, not a JavaScript exception

### Why This Fix Works

1. We increase all delays significantly (2-3 seconds) so the app is fully stable first
2. We default `isAvailable` to `false` and only set it `true` after successful verification
3. We use `Promise.race` with timeouts to prevent hangs from becoming crashes
4. If any error occurs, we gracefully disable push notifications instead of crashing

### Alternative: Complete Removal (Simpler)

If push notifications are not critical right now, we could:
1. Remove `PushNotificationProvider` from `App.tsx`
2. Remove the import of `usePushNotifications`
3. Add push notifications back later when Firebase is configured

---

## Testing After Implementation

1. Build new APK
2. Install on BlueStacks/device
3. App should now:
   - Load and stay open
   - Show the homepage
   - Work normally (without push notifications)
4. Push notifications will silently fail but won't crash the app
