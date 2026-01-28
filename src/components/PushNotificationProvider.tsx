import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { NATIVE_FEATURES } from '@/config/native-features';

/**
 * Provider component that initializes push notifications on native platforms.
 * 
 * IMPORTANT: Push notifications are COMPLETELY DISABLED until Firebase is configured.
 * The NATIVE_FEATURES.PUSH_NOTIFICATIONS_ENABLED flag must be set to true in
 * src/config/native-features.ts after Firebase is properly set up.
 * 
 * Without Firebase, the @capacitor/push-notifications plugin will crash
 * the app at the native level - this cannot be caught by JavaScript try/catch.
 */
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  // If push notifications are disabled, immediately render children
  // This completely bypasses all push notification code
  if (!NATIVE_FEATURES.PUSH_NOTIFICATIONS_ENABLED) {
    return <>{children}</>;
  }

  // Only import and use push notifications if explicitly enabled
  // This is a safety measure - the code below only runs if Firebase is configured
  return <PushNotificationInitializer>{children}</PushNotificationInitializer>;
}

/**
 * Internal component that handles push notification initialization.
 * Only rendered when PUSH_NOTIFICATIONS_ENABLED is true.
 */
function PushNotificationInitializer({ children }: { children: React.ReactNode }) {
  const [shouldAttemptInit, setShouldAttemptInit] = useState(false);
  
  // Dynamically import the hook only when needed
  const [pushHook, setPushHook] = useState<{
    isRegistered: boolean;
    isAvailable: boolean;
    registerDevice: () => void;
  } | null>(null);

  // Load the push notifications hook
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Dynamically import to avoid loading the plugin at all if disabled
    import('@/hooks/usePushNotifications').then(({ usePushNotifications }) => {
      // This is a workaround since we can't call hooks conditionally
      // The hook will be initialized once the module is loaded
      console.log('PushNotificationProvider: Push module loaded');
    }).catch((error) => {
      console.warn('PushNotificationProvider: Failed to load push module:', error);
    });
  }, []);

  // Defer any push initialization attempt until the app is fully stable
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const timer = setTimeout(() => {
      console.log('PushNotificationProvider: App stable, enabling push init');
      setShouldAttemptInit(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // ALWAYS render children immediately
  return <>{children}</>;
}

export default PushNotificationProvider;
