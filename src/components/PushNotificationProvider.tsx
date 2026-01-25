import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Provider component that initializes push notifications on native platforms.
 * This should be placed near the root of the app to ensure push notifications
 * are registered when the app starts.
 * 
 * Note: Push notifications require Firebase configuration. If Firebase is not
 * configured, the app will continue running normally without push notifications.
 */
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isRegistered, isAvailable, registerDevice } = usePushNotifications();

  useEffect(() => {
    // Only initialize on native platforms
    if (!Capacitor.isNativePlatform()) {
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
  }, [isRegistered, isAvailable, registerDevice]);

  return <>{children}</>;
}

export default PushNotificationProvider;
