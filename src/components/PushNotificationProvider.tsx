import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Provider component that initializes push notifications on native platforms.
 * This should be placed near the root of the app to ensure push notifications
 * are registered when the app starts.
 * 
 * IMPORTANT: Push notifications require Firebase configuration on Android.
 * Without Firebase, this component will gracefully skip initialization
 * to prevent app crashes. The app will continue working normally.
 * 
 * This component ALWAYS renders children immediately - it never blocks
 * the app from loading while waiting for push notification setup.
 */
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const [shouldAttemptInit, setShouldAttemptInit] = useState(false);
  
  // The hook is called unconditionally (React rules), but it guards itself internally
  const { isRegistered, isAvailable, registerDevice } = usePushNotifications();

  // Defer any push initialization attempt until the app is fully stable
  // This prevents crashes during the critical initial render phase
  useEffect(() => {
    // Only attempt on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Wait 5 seconds before attempting any push-related operations
    // This ensures the app is fully loaded and stable
    const timer = setTimeout(() => {
      console.log('PushNotificationProvider: App stable, enabling push init');
      setShouldAttemptInit(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Attempt registration only after safety window AND if push is available
  useEffect(() => {
    if (!shouldAttemptInit) {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (!isRegistered && isAvailable) {
      console.log('PushNotificationProvider: Attempting registration...');
      try {
        registerDevice();
      } catch (error) {
        // This shouldn't happen since the hook guards itself,
        // but add extra safety just in case
        console.warn('PushNotificationProvider: Registration failed:', error);
      }
    }
  }, [shouldAttemptInit, isRegistered, isAvailable, registerDevice]);

  // ALWAYS render children immediately - never block on push notifications
  return <>{children}</>;
}

export default PushNotificationProvider;
