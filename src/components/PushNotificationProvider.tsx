import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Provider component that initializes push notifications on native platforms.
 * This should be placed near the root of the app to ensure push notifications
 * are registered when the app starts.
 */
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isRegistered, registerDevice } = usePushNotifications();

  useEffect(() => {
    // Only initialize on native platforms
    if (Capacitor.isNativePlatform() && !isRegistered) {
      console.log('Initializing push notifications...');
      registerDevice();
    }
  }, [isRegistered, registerDevice]);

  return <>{children}</>;
}

export default PushNotificationProvider;
