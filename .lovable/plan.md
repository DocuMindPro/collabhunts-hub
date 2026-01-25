

## Disable Push Notifications Temporarily

This plan will add a graceful fallback to prevent the Android app from crashing when Firebase isn't configured. The app will safely skip push notification initialization and continue running normally.

---

### Changes Overview

**1. Update `src/hooks/usePushNotifications.ts`**

Add a try-catch wrapper around all push notification initialization to gracefully handle missing Firebase configuration:

- Wrap the `PushNotifications.register()` call in a try-catch block
- Add error handling for the registration listener that catches Firebase errors
- Log warnings instead of crashing when push notifications aren't available
- Set a flag to indicate push notifications are unavailable

**2. Update `src/components/PushNotificationProvider.tsx`**

Add additional safety checks:

- Wrap the initialization logic in a try-catch block
- Only attempt registration if the native platform is properly configured
- Add a console warning when push notifications are skipped

---

### Technical Details

**File: `src/hooks/usePushNotifications.ts`**

Changes to `registerDevice` function:
```typescript
const registerDevice = useCallback(async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Push notification permission denied');
      return;
    }

    await PushNotifications.register();
  } catch (error) {
    console.warn('Push notifications not available:', error);
    // Gracefully handle missing Firebase configuration
  }
}, [requestPermissions]);
```

Changes to the `useEffect` registration listener:
```typescript
const registrationListener = PushNotifications.addListener(
  'registration',
  async (token: Token) => {
    try {
      // ... existing registration logic
    } catch (error) {
      console.warn('Failed to register push token:', error);
    }
  }
);
```

Add overall try-catch in the useEffect:
```typescript
useEffect(() => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  let cleanup: (() => void) | undefined;

  const initializePushNotifications = async () => {
    try {
      // ... all listener setup code
    } catch (error) {
      console.warn('Push notification initialization failed:', error);
    }
  };

  initializePushNotifications();

  return () => cleanup?.();
}, [/* dependencies */]);
```

**File: `src/components/PushNotificationProvider.tsx`**

Add try-catch wrapper:
```typescript
useEffect(() => {
  if (Capacitor.isNativePlatform() && !isRegistered) {
    try {
      console.log('Initializing push notifications...');
      registerDevice();
    } catch (error) {
      console.warn('Push notifications unavailable:', error);
    }
  }
}, [isRegistered, registerDevice]);
```

---

### Expected Outcome

After these changes:
- The Android app will start without crashing
- A console warning will appear: "Push notifications not available" or "Push notification initialization failed"
- All other app functionality will work normally
- When you add Firebase later, push notifications will automatically start working

---

### Re-enabling Push Notifications Later

When you're ready to enable push notifications:
1. Create a Firebase project at console.firebase.google.com
2. Add an Android app with package name: `app.lovable.f0d3858ae7f2489288d232504acaef78`
3. Download `google-services.json` and place it in `android/app/`
4. Run `npx cap sync android` and rebuild

