import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Provider component that initializes push notifications on native platforms.
 * This should be placed near the root of the app to ensure push notifications
 * are registered when the app starts.
 * 
 * Note: Push notifications require Firebase configuration. If Firebase is not
 * configured, the app will continue running normally without push notifications.
 * 
 * IMPORTANT: This component defers initialization to avoid crashes on native
 * platforms when the Router context isn't fully ready yet.
 */
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { isRegistered, isAvailable, registerDevice } = usePushNotifications();

  // Defer initialization until component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only initialize on native platforms after mounting
    if (!isMounted || !Capacitor.isNativePlatform()) {
      return;
    }

    if (!isRegistered && isAvailable) {
      try {
        console.log('Initializing push notifications...');
        registerDevice();
      } catch (error) {
        console.warn('Push notifications unavailable:', error);
        // App continues normally without push notifications
      }
    }
  }, [isMounted, isRegistered, isAvailable, registerDevice]);

  return <>{children}</>;
}

export default PushNotificationProvider;
